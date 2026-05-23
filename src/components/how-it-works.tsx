import { getTranslations } from "next-intl/server";

const STEP_COUNT = 4;

export default async function HowItWorks() {
  const t = await getTranslations("HowItWorks");

  const steps = Array.from({ length: STEP_COUNT }, (_, i) => ({
    number:      String(i + 1),
    title:       t(`step${i}Title`       as Parameters<typeof t>[0]),
    description: t(`step${i}Description` as Parameters<typeof t>[0]),
  }));

  return (
    <section id="wie-es-funktioniert" className="section bg-[#1A3352]">
      <div className="section-inner">

        <div className="text-center mb-16">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#A5C3D7] mb-4">
            {t("eyebrow")}
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-white leading-tight mb-4">
            {t("heading")}
          </h2>
          <p className="text-base text-white/60 leading-relaxed max-w-md mx-auto">
            {t("subheading")}
          </p>
        </div>

        <ol className="flex flex-col gap-0">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-6 pb-10 last:pb-0 relative">

              {i < steps.length - 1 && (
                <div className="absolute left-[1.35rem] top-10 bottom-0 w-px bg-white/15" />
              )}

              <div className="shrink-0 w-11 h-11 rounded-full border border-[#F59E0B]/60 flex items-center justify-center z-10 bg-[#1A3352]">
                <span className="font-display font-light text-[1.25rem] text-white -mt-1">
                  {step.number}
                </span>
              </div>

              <div className="pt-2 pb-2">
                <h3 className="font-display font-light text-[1.25rem] sm:text-[1.35rem] text-white leading-snug mb-2">
                  {step.title}
                </h3>
                <p className="text-base text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </div>

            </li>
          ))}
        </ol>

        <div className="mt-16 text-center">
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
            {t("bottomCta")}
            <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
