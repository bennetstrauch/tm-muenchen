"use client";

import { useRef, useEffect } from "react";
import { content, type HeroImage } from "../content";
import HeroBackground from "./hero-background";

let heroHasAnimated = false;

const STRESS_FALLBACK: HeroImage[] = Array.from({ length: 18 }, (_, i) => ({ src: `/hero/stress/${i + 1}.jpg` }));

export default function Hero({
  headline,
  subtitle,
  images,
  nextDates,
}: {
  headline?: string[];
  subtitle?: string;
  images?: HeroImage[];
  nextDates?: string[];
} = {}) {
  const { hero } = content;
  const headlineLines = headline ?? ["Endlich wirklich abschalten.", "Ohne Anstrengung."];
  const subtitleText  = subtitle  ?? "regeneriert tiefer als Schlaf";
  const imagePool     = images?.length ? images : STRESS_FALLBACK;

  const isFirstLoad = useRef(!heroHasAnimated);
  useEffect(() => { heroHasAnimated = true; }, []);

  const staticCls  = isFirstLoad.current ? "opacity-0" : "";
  const staticAnim = (anim: string) => isFirstLoad.current ? { animation: anim } : undefined;

  return (
    <section id="hero" className="relative overflow-hidden min-h-[100dvh] flex flex-col items-center px-8 pt-14">

      {/* ── Background ────────────────────────────────── */}
      <HeroBackground images={imagePool} />

      {/* ── Off-white overlay ─────────────────────────── */}
      <div className="absolute inset-0 bg-white/60" />

      {/* ── Badge ─────────────────────────────────────── */}
      <div
        className={`relative z-[9999] -mt-2.5 ${staticCls}`}
        style={staticAnim("fadeInUp 0.7s ease forwards 0.06s")}
      >
        <a
          href="#warum-tm"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#cc6b1a]/20 border border-[#cc6b1a]/50 hover:bg-[#cc6b1a]/30 transition-colors duration-200"
        >
          <span className="text-[0.6rem] tracking-[0.18em] uppercase text-[#1A3352] font-medium">
            Die einzige Technik ihrer Art
          </span>
        </a>
      </div>

      {/* ── Headline ──────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xl mt-[calc(4vh+2rem)] sm:mt-[calc(5vh+1.5rem)] opacity-0"
        style={{ animation: "fadeInUp 0.75s ease forwards 0.12s" }}
      >
        <h1 className="w-full">
          <span className="block font-display font-medium text-[2.5rem] leading-[1.2] sm:text-[clamp(3rem,8vh,5.25rem)] text-[#1A3352]">
            {headlineLines[0]}
          </span>
          <span className="block font-display font-medium italic text-[2.5rem] leading-[1.2] sm:text-[clamp(3rem,8vh,5.25rem)] text-[#1A3352]">
            {headlineLines[1]}
          </span>
        </h1>
        <div className="mt-6">
          <div className="w-10 h-px bg-[#F0C814]" />
        </div>
      </div>

      {/* ── Primary CTA (middle) ──────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center mt-[5vh] gap-3 opacity-0"
        style={{ animation: "fadeInUp 0.75s ease forwards 0.28s" }}
      >
        <a
          href={hero.ctaHref}
          className="
            inline-flex items-center gap-2.5
            px-8 py-4 rounded-full
            bg-[#1A3352] text-white
            text-[0.72rem] tracking-[0.18em] uppercase font-medium
            whitespace-nowrap shadow-[0_4px_24px_rgba(26,51,82,0.28)]
            transition-all duration-300
            hover:bg-[#243f63] hover:shadow-[0_6px_28px_rgba(26,51,82,0.38)]
          "
        >
          {hero.cta}
        </a>

        {nextDates && nextDates.length > 0 && (
          <p className="text-sm text-[#1A3352]/55 tracking-wide">
            <span className="mr-1">🗓</span>
            Nächste Termine:{" "}
            <span className="text-[#1A3352]/75 font-medium">{nextDates.join(" · ")}</span>
          </p>
        )}
      </div>

      {/* ── Brand + subtitle ──────────────────────────── */}
      <div className="relative z-10 mt-auto flex flex-col items-center text-center gap-5 pb-6">
        <div
          className="flex flex-col items-center gap-1.5 opacity-0 -translate-y-4"
          style={{ animation: "fadeInUp 0.75s ease forwards 0.32s" }}
        >
          <span className="font-display font-semibold text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight tracking-wide">
            Transzendentale Meditation
          </span>
          <span className="text-base sm:text-lg text-[#1A3352]/65 font-normal tracking-[0.06em]">
            {subtitleText}
          </span>
        </div>

        <a
          href={hero.learnMoreHref}
          className={`
            inline-flex items-center gap-3
            px-9 py-4 rounded-full
            border border-[#1A3352]/25
            text-[#1A3352] text-[0.7rem] tracking-[0.22em] uppercase font-medium
            whitespace-nowrap
            transition-all duration-300
            hover:border-[#1A3352]/50 hover:bg-[#1A3352]/5
            ${staticCls}
          `}
          style={staticAnim("fadeInUp 0.75s ease forwards 0.48s")}
        >
          {hero.learnMore}
          <span aria-hidden="true">↓</span>
        </a>
      </div>

    </section>
  );
}
