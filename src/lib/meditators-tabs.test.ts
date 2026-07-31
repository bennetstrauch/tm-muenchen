import { describe, it, expect } from "vitest";
import { resolveInitialTab, slugForTab, pathForTab, OG_BY_TAB, type MeditatorsUrls, type Tab } from "./meditators-tabs";

const noUrls: MeditatorsUrls = {
  meditators_ueberpruefung_url: null,
  meditators_vertiefung_url: null,
  meditators_treffen_url: null,
  meditators_fortgeschrittenentechniken_url: null,
};

describe("resolveInitialTab", () => {
  it("falls back to im-center when no slug is given", () => {
    expect(resolveInitialTab(undefined, noUrls)).toBe("im-center");
  });

  it("resolves an internal category slug to its category", () => {
    expect(resolveInitialTab("checking", noUrls)).toBe("ueberpruefung");
  });

  it("falls back to im-center when the category is external for this tenant", () => {
    const urls = { ...noUrls, meditators_ueberpruefung_url: "https://example.com/checking" };
    expect(resolveInitialTab("checking", urls)).toBe("im-center");
  });

  it("falls back to im-center for an unknown slug", () => {
    expect(resolveInitialTab("garbage", noUrls)).toBe("im-center");
  });

  it("falls back to im-center for a category that is external via national default", () => {
    expect(resolveInitialTab("wochenende", noUrls)).toBe("im-center");
  });

  it("resolves treffen even though it is not a visible tab", () => {
    expect(resolveInitialTab("treffen", noUrls)).toBe("treffen");
  });
});

describe("OG_BY_TAB", () => {
  const tabs: Tab[] = ["im-center", "ueberpruefung", "vertiefung", "treffen", "fortgeschritten"];

  it("has a preview descriptor with a jpg image for every tab", () => {
    for (const tab of tabs) {
      const og = OG_BY_TAB[tab];
      expect(og.titleKey).toBeTruthy();
      expect(og.blurbKey).toBeTruthy();
      expect(og.image).toMatch(/^\/og\/.+\.jpg$/);
    }
  });
});

describe("pathForTab", () => {
  it("gives the default locale a bare /events path", () => {
    expect(pathForTab("de", "im-center")).toBe("/events");
    expect(pathForTab("de", "ueberpruefung")).toBe("/events/checking");
  });

  it("prefixes non-default locales", () => {
    expect(pathForTab("en", "im-center")).toBe("/en/events");
    expect(pathForTab("en", "ueberpruefung")).toBe("/en/events/checking");
  });
});

describe("slugForTab", () => {
  it("gives im-center no slug (bare /events)", () => {
    expect(slugForTab("im-center")).toBeNull();
  });

  it("maps a category to its url slug", () => {
    expect(slugForTab("ueberpruefung")).toBe("checking");
    expect(slugForTab("treffen")).toBe("treffen");
  });
});
