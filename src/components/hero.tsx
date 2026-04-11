import Image from "next/image";
import { content } from "../content";

const RINGS = [
  { size: "72vmax", opacity: 0.04,  duration: 9,  delay: 0   },
  { size: "52vmax", opacity: 0.05,  duration: 11, delay: 1.2 },
  { size: "34vmax", opacity: 0.06,  duration: 8,  delay: 0.6 },
  { size: "18vmax", opacity: 0.065, duration: 13, delay: 1.8 },
];

export default function Hero() {
  const { hero } = content;

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center px-8 pt-4">

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

      {/* ── Off-white overlay ─────────────────────────── */}
      <div className="absolute inset-0 bg-[#F9F7E9]/65" />

      {/* ── Decorative rings ──────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          {RINGS.map((ring, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[#1A3352]"
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
      </div>

      {/* ── Eyebrow — top ────────────────────────────── */}
      <p
        className="relative z-10 text-center text-[0.65rem] tracking-[0.15em] uppercase text-[#5C7A97] whitespace-nowrap opacity-0"
        style={{ animation: "fadeInUp 0.7s ease forwards 0s" }}
      >
        Transzendentale Meditation · München
      </p>

      {/* ── Uniqueness badge — below eyebrow ─────────── */}
      <div
        className="relative z-10 mt-3 opacity-0"
        style={{ animation: "fadeInUp 0.7s ease forwards 0.06s" }}
      >
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c4962a]/20 border border-[#c4962a]/50">
          <span className="text-[0.6rem] tracking-[0.18em] uppercase text-[#1A3352] font-medium">
            Die einzige Technik ihrer Art
          </span>
        </span>
      </div>

      {/* ── Headline ─────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xl mt-[calc(7vh+3.5rem)] opacity-0"
        style={{ animation: "fadeInUp 0.75s ease forwards 0.12s" }}
      >
        <h1 className="w-full">
          <span className="block font-display font-light text-[2rem] leading-[1.2] sm:text-[4.25rem] text-[#1A3352]">
            {hero.headline[0]}
          </span>
          <span className="block font-display font-light italic text-[2rem] leading-[1.2] sm:text-[4.25rem] text-[#1A3352]">
            {hero.headline[1]}
          </span>
        </h1>

        <div className="mt-6">
          <div className="w-10 h-px bg-[#F0C814]" />
        </div>
      </div>

      {/* ── Subline & soft learn-more CTA ────────────── */}
      <div className="relative z-10 mt-auto flex flex-col items-center text-center gap-7 pb-24">
        <p
          className="text-base sm:text-lg text-[#1A3352] leading-[1.85] opacity-0"
          style={{ animation: "fadeInUp 0.75s ease forwards 0.32s" }}
        >
          {hero.subline.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>

        <a
          href={hero.learnMoreHref}
          className="
            opacity-0
            inline-flex items-center gap-3
            px-9 py-4 rounded-full
            border border-[#1A3352]/25
            text-[#1A3352] text-[0.7rem] tracking-[0.22em] uppercase font-medium
            whitespace-nowrap
            transition-all duration-300
            hover:border-[#1A3352]/50 hover:bg-[#1A3352]/5
          "
          style={{ animation: "fadeInUp 0.75s ease forwards 0.48s" }}
        >
          {hero.learnMore}
          <span aria-hidden="true">↓</span>
        </a>
      </div>

    </section>
  );
}
