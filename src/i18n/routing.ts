import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en", "fr", "es"],
  defaultLocale: "de",
  // DE gets no URL prefix (/), other locales get /en, /fr, /es
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
