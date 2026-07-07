import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  return { title: `Impressum | TM ${tenant.city}` };
}

// Styles the tenant's semantic impressum HTML (h2/p/a) so content in the DB
// stays free of layout — see "Content lives in CMS, layout lives in code".
const HTML_CONTENT_CLS =
  "text-sm text-[#1A3352]/75 leading-relaxed " +
  "[&_h2]:text-[0.65rem] [&_h2]:tracking-[0.22em] [&_h2]:uppercase [&_h2]:text-[#1A3352]/40 [&_h2]:font-medium [&_h2]:mb-3 [&_h2]:mt-10 [&_h2:first-child]:mt-0 " +
  "[&_a]:transition-colors [&_a:hover]:text-[#1A3352]";

export default async function ImpressumPage() {
  const [locale, t, tenant] = await Promise.all([
    getLocale(),
    getTranslations("LegalPages"),
    getCurrentTenant(),
  ]);

  const content = tenant.impressum_content?.trim();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-20">

        {locale !== "de" && (
          <div className="mb-10 px-4 py-3 rounded-lg bg-[#1A3352]/6 text-sm text-[#1A3352]/70">
            {t("localeNotice")}
          </div>
        )}

        <h1 className="font-display font-light text-[2rem] text-[#1A3352] mb-12">
          Impressum
        </h1>

        {!content ? (
          <p className="text-sm text-[#1A3352]/50 italic">Impressum folgt.</p>
        ) : content.startsWith("<") ? (
          <div
            className={HTML_CONTENT_CLS}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-sm text-[#1A3352]/75 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        )}

      </div>
    </main>
  );
}
