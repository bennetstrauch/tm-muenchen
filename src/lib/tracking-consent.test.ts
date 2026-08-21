import { describe, it, expect } from "vitest";
import { shouldTrack } from "./tracking-consent";

describe("shouldTrack", () => {
  describe("consent-first tenant (track_without_consent = false)", () => {
    it("tracks only after explicit opt-in", () => {
      expect(shouldTrack(false, "accepted")).toBe(true);
    });
    it("does not track when the visitor declined", () => {
      expect(shouldTrack(false, "declined")).toBe(false);
    });
    it("does not track before any choice was made", () => {
      expect(shouldTrack(false, null)).toBe(false);
    });
  });

  describe("track-without-consent tenant (track_without_consent = true)", () => {
    it("tracks by default, even without a stored choice", () => {
      expect(shouldTrack(true, null)).toBe(true);
    });
    it("tracks when a prior accept exists", () => {
      expect(shouldTrack(true, "accepted")).toBe(true);
    });
    it("honours the opt-out (Widerspruch) when the visitor declined", () => {
      expect(shouldTrack(true, "declined")).toBe(false);
    });
  });
});
