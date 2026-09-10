import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { deepMergeMessages } from "@/lib/deep-merge";

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
    messages: fallback ? deepMergeMessages(fallback, messages) : messages,
  };
});
