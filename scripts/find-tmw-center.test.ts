import { describe, it, expect } from "vitest";
import { matchesCity, countUpcoming } from "./find-tmw-center";

describe("matchesCity", () => {
  it("matches exact city name", () => {
    expect(matchesCity("München", "München")).toBe(true);
  });

  it("matches case-insensitively", () => {
    expect(matchesCity("München", "münchen")).toBe(true);
    expect(matchesCity("Berlin", "BERLIN")).toBe(true);
  });

  it("matches on substring", () => {
    expect(matchesCity("Bad Homburg", "Homburg")).toBe(true);
    expect(matchesCity("München", "ünch")).toBe(true);
  });

  it("returns false when no match", () => {
    expect(matchesCity("München", "Berlin")).toBe(false);
  });
});

describe("countUpcoming", () => {
  const future = "Sa., 01. Januar 2099 um 19:00";
  const past   = "Mo., 01. Januar 2000 um 19:00";

  it("counts all future lectures", () => {
    expect(countUpcoming([{ date: future }, { date: future }])).toBe(2);
  });

  it("excludes past lectures", () => {
    expect(countUpcoming([{ date: past }, { date: future }])).toBe(1);
  });

  it("returns 0 for empty array", () => {
    expect(countUpcoming([])).toBe(0);
  });
});
