import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentTenant } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Impressum | TM München",
};

export default async function ImpressumPage() {
  const [locale, t, tenant] = await Promise.all([
    getLocale(),
    getTranslations("LegalPages"),
    getCurrentTenant(),
  ]);

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

        <div
          className="text-sm text-[#1A3352]/75 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: tenant.impressum_content }}
        />

      </div>
    </main>
  );
}
