import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentTenant } from "@/lib/tenant";

export default async function Footer() {
  const [t, tenant] = await Promise.all([
    getTranslations("Footer"),
    getCurrentTenant(),
  ]);

  return (
    <footer className="bg-[#1A3352] border-t border-white/10 py-12 px-6">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <p className="text-sm text-white/50 leading-relaxed">
            {t("tagline")}
          </p>
          <a
            href="https://www.meditation.de"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 text-[0.7rem] tracking-[0.18em] uppercase text-white/55 hover:text-white/80 hover:border-white/35 transition-all duration-200"
          >
            {t("cta")}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[0.68rem] tracking-wide text-white/30">
          <span>Transzendentale Meditation {tenant.city} e.V.</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <Link href="/impressum" className="hover:text-white/55 transition-colors">
            Impressum
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/datenschutz" className="hover:text-white/55 transition-colors">
            Datenschutz
          </Link>
        </div>

      </div>
    </footer>
  );
}
