import { describe, it, expect } from "vitest";
import { applyLocaleFilter } from "./teachers";
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
