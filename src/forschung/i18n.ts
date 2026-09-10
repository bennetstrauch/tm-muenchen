// Forschung owns its locale set, decoupled from the marketing site's DE/EN/FR/ES
// routing (ADR 0012): a research-only locale (e.g. Croatian) can be added here
// later without touching the site-wide switcher. Self-contained so the module
// stays extractable — it does not import from src/i18n.

import { deepMergeMessages } from '@/lib/deep-merge';

type Messages = { [key: string]: string | Messages };

export const forschungLocales = ['de', 'en', 'fr', 'es'] as const;
export type ForschungLocale = (typeof forschungLocales)[number];
export const defaultForschungLocale: ForschungLocale = 'de';

export function resolveForschungLocale(candidate?: string | null): ForschungLocale {
  return forschungLocales.includes(candidate as ForschungLocale)
    ? (candidate as ForschungLocale)
    : defaultForschungLocale;
}

export async function getForschungMessages(locale: ForschungLocale): Promise<Messages> {
  const messages = (await import(`./messages/${locale}.json`)).default as Messages;
  if (locale === defaultForschungLocale) return messages;
  const fallback = (await import('./messages/de.json')).default as Messages;
  return deepMergeMessages(fallback, messages);
}
