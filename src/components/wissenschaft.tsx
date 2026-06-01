import { getTranslations } from "next-intl/server";

const BULLET_COUNT = 3;

export default async function WissenschaftSection() {
  const t = await getTranslations("Wissenschaft");

  const bullets = Array.from({ length: BULLET_COUNT }, (_, i) =>
    t(`bullet${i}` as Parameters<typeof t>[0])
  );

  return (
    <section
      id="wissenschaft"
      className="section bg-[#1A3352]"
      aria-labelledby="wissenschaft-heading"
    >
      <div className="section-inner">

        <div className="text-center mb-10">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#A5C3D7] mb-4">
            {t("eyebrow")}
          </p>
          <h2
            id="wissenschaft-heading"
            className="font-display font-light text-[2rem] sm:text-[2.75rem] text-white leading-tight mb-6"
          >
            {t("heading")}
          </h2>
          <p className="text-base text-white/70 leading-relaxed max-w-lg mx-auto">
            {t("body")}
          </p>
        </div>

        <ul className="flex flex-col gap-4 mb-12 max-w-lg mx-auto" aria-label="Inhalte des Infoabends zu Wissenschaft">
          {bullets.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="shrink-0 mt-[0.2em]"
              >
                <circle cx="8" cy="8" r="7" stroke="#BCA075" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="3" fill="#BCA075" />
              </svg>
              <span className="text-base text-white leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>

        <div className="text-center">
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
