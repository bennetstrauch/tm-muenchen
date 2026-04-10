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
    <section className="relative min-h-[100dvh] flex flex-col items-center px-8 pt-[8vh] pb-[8vh]">

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
      <div className="absolute inset-0 bg-[#faf7f2]/55" />

      {/* ── Decorative rings ──────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center">
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
      </div>

      {/* ── Eyebrow — top ────────────────────────────── */}
      <p
        className="relative z-10 text-center text-[0.65rem] tracking-[0.3em] uppercase text-[#e8d5b0] opacity-0"
        style={{ animation: "fadeInUp 0.7s ease forwards 0s" }}
      >
        Transzendentale Meditation · München
      </p>

      {/* ── Headline — upper portion ─────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xl mt-[7vh] opacity-0"
        style={{ animation: "fadeInUp 0.75s ease forwards 0.12s" }}
      >
        <h1 className="w-full">
          <span className="block font-display font-light text-[2rem] leading-[1.2] sm:text-[4.25rem] text-[#0d0905]">
            {hero.headline[0]}
          </span>
          <span className="block font-display font-light italic text-[2rem] leading-[1.2] sm:text-[4.25rem] text-[#0d0905]">
            {hero.headline[1]}
          </span>
        </h1>

        <div className="mt-6">
          <div className="w-10 h-px bg-[#c4962a]" />
        </div>
      </div>

      {/* ── Subline — above sticky button ────────────── */}
      <div className="relative z-10 mt-auto flex flex-col items-center text-center pb-32">
        <p
          className="text-[0.95rem] sm:text-base text-[#2c1f0e] leading-[1.85] opacity-0"
          style={{ animation: "fadeInUp 0.75s ease forwards 0.32s" }}
        >
          {hero.subline.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>
      </div>

    </section>
  );
}
