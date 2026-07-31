import type { TenantConfig } from "./tenant";
import { routing } from "@/i18n/routing";

export type Category = "ueberpruefung" | "vertiefung" | "treffen" | "fortgeschritten";
export type Tab = "im-center" | Category;

export type MeditatorsUrls = Pick<
  TenantConfig,
  | "meditators_ueberpruefung_url"
  | "meditators_vertiefung_url"
  | "meditators_treffen_url"
  | "meditators_fortgeschrittenentechniken_url"
>;

// Everything the app needs to know about a tab, keyed by tab. slug is the URL
// segment (null = bare /events). labelKey doubles as the OG title base; ogImage
// is the 1200×630 link-preview crop. Adding a category = one entry here (plus its
// icon in the component). Message keys live only here — no duplicate lookup tables.
type TabMeta = {
  slug: string | null;
  labelKey: string;
  tabLabelKey: string;
  blurbKey: string;
  ogImage: string;
  showInTabs: boolean;
  betreff?: string;
};

export const TAB_META: Record<Tab, TabMeta> = {
  "im-center": { slug: null, labelKey: "ogEventsTitle", tabLabelKey: "tabImCenter", blurbKey: "ogEventsBlurb", ogImage: "/og/events.jpg", showInTabs: true },
  treffen: { slug: "treffen", labelKey: "catTreffen", tabLabelKey: "catTreffenTab", blurbKey: "ogTreffenBlurb", ogImage: "/og/treffen.jpg", showInTabs: false, betreff: "MeditierendenTreffen" },
  ueberpruefung: { slug: "checking", labelKey: "catUeberpruefung", tabLabelKey: "catUeberpruefungTab", blurbKey: "ogUeberpruefungBlurb", ogImage: "/og/checking.jpg", showInTabs: true, betreff: "TM-Überprüfung" },
  vertiefung: { slug: "wochenende", labelKey: "catVertiefung", tabLabelKey: "catVertiefungTab", blurbKey: "ogVertiefungBlurb", ogImage: "/og/wochenende.jpg", showInTabs: true, betreff: "Vertiefungs-Wochenende" },
  fortgeschritten: { slug: "fortgeschritten", labelKey: "catFortgeschritten", tabLabelKey: "catFortgeschrittenTab", blurbKey: "ogFortgeschrittenBlurb", ogImage: "/og/fortgeschritten.jpg", showInTabs: true, betreff: "Fortgeschrittenentechniken" },
};

// Tab-bar and card-grid order.
export const CATEGORY_ORDER: Category[] = ["treffen", "ueberpruefung", "vertiefung", "fortgeschritten"];

// Vertiefung and Fortgeschritten always have a national default URL → always link out.
// Überprüfung and Treffen have no national default → internal unless a tenant overrides.
const DEFAULT_VERTIEFUNG_URL = "https://tm-wochenende.de/tm-kraft-der-stille/";
const DEFAULT_FORTGESCHRITTEN_URL = "https://tm-wochenende.de/fortgeschritten/";

export function getExternalUrl(urls: MeditatorsUrls, id: Category): string | null {
  switch (id) {
    case "ueberpruefung": return urls.meditators_ueberpruefung_url;
    case "vertiefung": return urls.meditators_vertiefung_url ?? DEFAULT_VERTIEFUNG_URL;
    case "treffen": return urls.meditators_treffen_url;
    case "fortgeschritten": return urls.meditators_fortgeschrittenentechniken_url ?? DEFAULT_FORTGESCHRITTEN_URL;
  }
}

const CATEGORY_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORY_ORDER.map((c) => [TAB_META[c].slug as string, c]),
);

export function resolveInitialTab(slug: string | undefined, urls: MeditatorsUrls): Tab {
  if (!slug) return "im-center";
  const category = CATEGORY_BY_SLUG[slug];
  if (category && !getExternalUrl(urls, category)) return category;
  return "im-center";
}

export function pathForTab(locale: string, tab: Tab): string {
  const base = locale === routing.defaultLocale ? "/events" : `/${locale}/events`;
  const slug = TAB_META[tab].slug;
  return slug ? `${base}/${slug}` : base;
}
