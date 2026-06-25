import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { CountUp } from "@/components/ui/count-up";

const BULLET_COUNT = 3;

const STATS = [
  { value: 700, suffix: "+", labelKey: "stat0Label" },
  { value: 10, suffix: " Mio+", labelKey: "stat1Label" },
  { value: 50, suffix: "+", labelKey: "stat2Label" },
] as const;

const LOGOS = [
  {
    src: "/logos/stanford.jpg",
    alt: "Stanford Medicine",
    captionKey: "logo0Caption",
    href: "https://pubmed.ncbi.nlm.nih.gov/2693491/",
  },
  {
    src: "/logos/yale.jpg",
    alt: "Yale School of Medicine",
    captionKey: "logo1Caption",
    href: "https://pubmed.ncbi.nlm.nih.gov/15480086/",
  },
  {
    src: "/logos/harvard.jpg",
    alt: "Harvard Medical School",
    captionKey: "logo2Caption",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3641112/",
  },
  {
    src: "/logos/nih.jpg",
    alt: "National Institutes of Health",
    captionKey: "logo3Caption",
    href: "https://pubmed.ncbi.nlm.nih.gov/23149426/",
  },
] as const;

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          {STATS.map(({ value, suffix, labelKey }) => (
            <div
              key={labelKey}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 text-center"
            >
              <p className="font-display font-light text-[2.25rem] text-white leading-none mb-2">
                <CountUp value={value} suffix={suffix} />
              </p>
              <p className="text-[0.7rem] tracking-[0.15em] uppercase text-[#A5C3D7]">
                {t(labelKey as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
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

        <div className="mb-12">
          <p className="text-center text-[0.65rem] tracking-[0.3em] uppercase text-[#A5C3D7] mb-8">
            {t("logosIntro")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {LOGOS.map(({ src, alt, captionKey, href }) => (
              <a
                key={src}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 group"
              >
                <div className="flex items-center justify-center h-14 w-full rounded-lg bg-white px-3 py-2">
                  <Image
                    src={src}
                    alt={alt}
                    width={120}
                    height={40}
                    className="object-contain max-h-8 w-auto"
                  />
                </div>
                <p className="text-[0.65rem] text-center text-white/50 group-hover:text-white/80 transition-colors duration-200 leading-tight">
                  {t(captionKey as Parameters<typeof t>[0])}
                </p>
              </a>
            ))}
          </div>
        </div>

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
