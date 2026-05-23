import { getTranslations } from "next-intl/server";

export default async function AbschlussCta() {
  const t = await getTranslations("AbschlussCta");

  return (
    <section className="section bg-[#1A3352]" aria-labelledby="abschluss-cta-heading">
      <div className="section-inner">

        <div className="text-center">
          <h2
            id="abschluss-cta-heading"
            className="font-display font-light text-[2rem] sm:text-[2.75rem] text-white leading-tight mb-6"
          >
            {t("heading")}
          </h2>
          <p className="text-base text-white/70 leading-relaxed max-w-md mx-auto mb-10">
            {t("body")}
          </p>
          <a
            href="#anmeldung"
            className="
              inline-flex items-center gap-3
              px-9 py-4
              bg-[#A5C3D7] text-[#1A3352]
              text-[0.7rem] tracking-[0.22em] uppercase font-medium
              rounded-full
              transition-all duration-300
              hover:bg-[#8BAAC3] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(165,195,215,0.3)]
            "
          >
            {t("cta")}
            <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
