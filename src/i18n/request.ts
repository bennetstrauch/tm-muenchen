import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type Messages = { [key: string]: string | Messages };

// Per-key fallback to German: a partially-translated namespace keeps the
// German values for keys the locale hasn't translated yet, instead of losing
// the whole namespace to a shallow overwrite.
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key];
    out[key] =
      existing && typeof existing === "object" && typeof value === "object"
        ? deepMerge(existing, value)
        : value;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const fallback = locale !== "de"
    ? (await import("../../messages/de.json")).default
    : null;

  return {
    locale,
    messages: fallback ? deepMerge(fallback, messages) : messages,
  };
});
