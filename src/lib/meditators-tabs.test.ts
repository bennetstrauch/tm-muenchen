import { describe, it, expect } from "vitest";
import { resolveInitialTab, pathForTab, TAB_META, type MeditatorsUrls, type Tab } from "./meditators-tabs";
import de from "../../messages/de.json";

const noUrls: MeditatorsUrls = {
  meditators_ueberpruefung_url: null,
  meditators_vertiefung_url: null,
  meditators_treffen_url: null,
  meditators_fortgeschrittenentechniken_url: null,
};

const ALL_TABS: Tab[] = ["im-center", "ueberpruefung", "vertiefung", "treffen", "fortgeschritten"];

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

describe("TAB_META", () => {
  it("has a jpg link-preview image for every tab", () => {
    for (const tab of ALL_TABS) {
      expect(TAB_META[tab].ogImage).toMatch(/^\/og\/.+\.jpg$/);
    }
  });

  it("references only message keys that exist in de.json", () => {
    const events = de.Events as Record<string, string>;
    for (const tab of ALL_TABS) {
      const meta = TAB_META[tab];
      expect(events[meta.labelKey]).toBeTruthy();
      expect(events[meta.tabLabelKey]).toBeTruthy();
      expect(events[meta.blurbKey]).toBeTruthy();
    }
  });
});
