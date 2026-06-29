import { getTranslations } from "next-intl/server";
import { getCurrentTenant } from "@/lib/tenant";

const POINT_COUNT = 3;

export default async function InfoabendPreview() {
  const [t, tenant] = await Promise.all([
    getTranslations("InfoabendPreview"),
    getCurrentTenant(),
  ]);

  const infoBoxes = [
    {
      label: t("box0Label"),
      value: `${tenant.infoabend_duration_minutes} Min.\n${t("box0Value")}`,
    },
    {
      label: t("box1Label"),
      value: t("box1Value"),
    },
  ];

  const contentPoints = Array.from({ length: POINT_COUNT }, (_, i) =>
    t(`point${i}` as Parameters<typeof t>[0])
  );

  return (
    <section
      id="infoabend"
      className="section bg-[#1A3352] scroll-mt-10"
      aria-labelledby="infoabend-heading"
    >
      <div className="section-inner">

        <div className="text-center mb-8">
          <h2
            id="infoabend-heading"
            className="font-display font-light text-[2rem] sm:text-[2.75rem] text-white leading-tight"
          >
            {t("heading")}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {infoBoxes.map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-4"
            >
              <p className="text-[0.6rem] tracking-[0.22em] uppercase text-[#BCA075] mb-1 font-medium">
                {label}
              </p>
              <p className="text-white text-base font-medium leading-snug whitespace-pre-line sm:whitespace-normal">
                {value}
              </p>
            </div>
          ))}
        </div>

        <ul className="flex flex-col gap-4" aria-label="Inhalte des Infoabends">
          {contentPoints.map((point) => (
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

      </div>
    </section>
  );
}
