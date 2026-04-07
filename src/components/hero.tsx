import Image from "next/image";
import { content } from "../content";

const RINGS = [
  { size: "72vmax", opacity: 0.045, duration: 9,  delay: 0   },
  { size: "52vmax", opacity: 0.055, duration: 11, delay: 1.2 },
  { size: "34vmax", opacity: 0.065, duration: 8,  delay: 0.6 },
  { size: "18vmax", opacity: 0.07,  duration: 13, delay: 1.8 },
];

export default function Hero() {
  const { hero } = content;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between px-6 py-[8vh] overflow-hidden">

      {/* ── Background image ──────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #d4c5a9 0%, #9e8c72 60%, #7a6a54 100%)" }}
      >
        <Image
          src={hero.image.src}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* ── Warm cream overlay ────────────────────────── */}
      <div className="absolute inset-0 bg-[#faf7f2]/65" />

      {/* ── Decorative rings ──────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {RINGS.map((ring, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-[#c4962a]"
            style={{
              width: ring.size,
              height: ring.size,
              ["--ring-opacity" as string]: ring.opacity,
              opacity: ring.opacity,
              animation: `pulseRing ${ring.duration}s ease-in-out infinite`,
              animationDelay: `${ring.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Eyebrow — top anchor ──────────────────────── */}
      <p
        className="relative z-10 text-center text-[0.65rem] tracking-[0.3em] uppercase text-[#8b7355] opacity-0"
        style={{ animation: "fadeInUp 0.7s ease forwards 0s" }}
      >
        Transzendentale Meditation · München
      </p>

      {/* ── Headline + divider — middle ───────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">
        <h1>
          <span
            className="block font-display font-light text-[2.6rem] leading-[1.15] sm:text-[4.25rem] text-[#1a1208] opacity-0"
            style={{ animation: "fadeInUp 0.75s ease forwards 0.12s" }}
          >
            {hero.headline[0]}
          </span>
          <span
            className="block font-display font-light italic text-[2.6rem] leading-[1.15] sm:text-[4.25rem] text-[#1a1208] opacity-0"
            style={{ animation: "fadeInUp 0.75s ease forwards 0.28s" }}
          >
            {hero.headline[1]}
          </span>
        </h1>

        <div
          className="mt-6 opacity-0"
          style={{ animation: "fadeInUp 0.6s ease forwards 0.42s" }}
        >
          <div className="w-10 h-px bg-[#c4962a]" />
        </div>
      </div>

      {/* ── Subline + CTA — bottom anchor ─────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg gap-10">

        <p
          className="text-[0.95rem] sm:text-base text-[#5c4d38] leading-[1.85] opacity-0"
          style={{ animation: "fadeInUp 0.75s ease forwards 0.52s" }}
        >
          {hero.subline.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>

        <div
          className="flex flex-col items-center gap-6 opacity-0"
          style={{ animation: "fadeInUp 0.75s ease forwards 0.66s" }}
        >
          <a
            href={hero.ctaHref}
            className="
              inline-flex items-center gap-3
              px-9 py-4
              bg-[#c4962a] text-white
              text-[0.7rem] tracking-[0.22em] uppercase font-medium
              rounded-full
              transition-all duration-300
              hover:bg-[#a37e22] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(196,150,42,0.35)]
              active:translate-y-0 active:shadow-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4962a] focus-visible:ring-offset-4 focus-visible:ring-offset-[#faf7f2]
            "
          >
            {hero.cta}
            <span aria-hidden="true" className="text-[#f5e0a8]">→</span>
          </a>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[0.6rem] tracking-[0.25em] uppercase text-[#b8a48a]">
              Mehr erfahren
            </span>
            <div className="w-px h-6 bg-gradient-to-b from-[#c4962a]/40 to-transparent" />
          </div>
        </div>

      </div>
    </section>
  );
}
