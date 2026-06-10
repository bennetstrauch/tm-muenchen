import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { applyLocaleFilter, getTeachersRaw } from "./teachers";
import type { TMTeacher } from "./teachers";

const make = (name: string, bio = "Bio"): TMTeacher => ({ name, imageUrl: "", bio });

describe("applyLocaleFilter", () => {
  it("returns only the matching teacher when one locale entry exists", () => {
    const teachers = [make("Anna"), make("Ben")];
    const entries = [{ teacher_name: "Anna", bio_override: null }];
    expect(applyLocaleFilter(teachers, entries)).toEqual([make("Anna")]);
  });

  it("returns all matching teachers when multiple locale entries exist", () => {
    const teachers = [make("Anna"), make("Ben"), make("Clara")];
    const entries = [
      { teacher_name: "Anna", bio_override: null },
      { teacher_name: "Clara", bio_override: null },
    ];
    expect(applyLocaleFilter(teachers, entries)).toEqual([make("Anna"), make("Clara")]);
  });

  it("returns all teachers when no locale entries exist", () => {
    const teachers = [make("Anna"), make("Ben")];
    expect(applyLocaleFilter(teachers, [])).toEqual([make("Anna"), make("Ben")]);
  });

  it("does not re-introduce duplicate names already filtered upstream", () => {
    const teachers = [make("Anna"), make("Ben")];
    const entries = [
      { teacher_name: "Anna", bio_override: null },
      { teacher_name: "Anna", bio_override: "duplicate entry" },
    ];
    const result = applyLocaleFilter(teachers, entries);
    expect(result.filter(t => t.name === "Anna")).toHaveLength(1);
  });

  it("replaces bio with bio_override when present, leaves bio untouched when null", () => {
    const teachers = [make("Anna", "German bio"), make("Ben", "German bio")];
    const entries = [
      { teacher_name: "Anna", bio_override: "English bio" },
      { teacher_name: "Ben", bio_override: null },
    ];
    const result = applyLocaleFilter(teachers, entries);
    expect(result[0].bio).toBe("English bio");
    expect(result[1].bio).toBe("German bio");
  });
});

describe("getTeachersRaw", () => {
  beforeEach(() => {
    vi.stubEnv("TMW_API_KEY", "test-token");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns empty array immediately when centerIds is empty", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await getTeachersRaw([]);

    expect(result).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches from exactly the passed center IDs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ teachers: [{ name: "Anna", image_url: "/a.jpg", short_bio: "Bio" }] }),
    }));

    await getTeachersRaw([42]);

    const calledUrls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map(
      (args: unknown[]) => args[0] as string
    );
    expect(calledUrls).toHaveLength(1);
    expect(calledUrls[0]).toContain("/42");
  });

  it("deduplicates teachers that appear in multiple centers", async () => {
    const anna = { name: "Anna", image_url: "/a.jpg", short_bio: "Bio" };
    const bob = { name: "Bob", image_url: "/b.jpg", short_bio: "Bio" };
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ teachers: [anna, bob] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ teachers: [anna] }) })
    );

    const result = await getTeachersRaw([1, 2]);

    expect(result.filter(t => t.name === "Anna")).toHaveLength(1);
    expect(result).toHaveLength(2);
  });
});
