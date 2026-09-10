import type { Metadata } from 'next';
import Link from 'next/link';
import { NextIntlClientProvider } from 'next-intl';
import { getStudies } from '@/lib/forschung/studies';
import {
  forschungLocales,
  resolveForschungLocale,
  getForschungMessages,
} from '@/forschung/i18n';
import { Library } from '@/forschung/library';

export const metadata: Metadata = {
  title: 'Forschung – Transzendentale Meditation',
  description:
    'Über 460 wissenschaftliche Studien zur Transzendentalen Meditation – durchsuchbar nach Thema, Fachgebiet und Studientyp.',
};

const LOCALE_LABELS: Record<string, string> = { de: 'DE', en: 'EN', fr: 'FR', es: 'ES' };

export default async function ForschungPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveForschungLocale(lang);
  const [messages, studies] = await Promise.all([
    getForschungMessages(locale),
    getStudies(),
  ]);

  return (
    <main className="min-h-full bg-[#F7F5F0] text-[#1A3352]">
      <header className="border-b border-[#1A3352]/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <span className="font-display text-lg text-[#1A3352]">TM Forschung</span>
          <nav aria-label="Sprache" className="flex items-center gap-1">
            {forschungLocales.map((l) => (
              <Link
                key={l}
                href={l === 'de' ? '/forschung' : `/forschung?lang=${l}`}
                className={`px-2.5 py-1 rounded-md text-[0.8rem] tracking-wider transition-colors ${
                  l === locale
                    ? 'font-semibold text-[#1A3352] bg-[#1A3352]/8'
                    : 'font-normal text-[#3D5573] hover:bg-[#1A3352]/5'
                }`}
                aria-current={l === locale ? 'true' : undefined}
              >
                {LOCALE_LABELS[l]}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <NextIntlClientProvider locale={locale} messages={messages}>
        <Library studies={studies} />
      </NextIntlClientProvider>
    </main>
  );
}
