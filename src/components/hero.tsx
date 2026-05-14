"use client";

import { useRef, useEffect } from "react";
import { content, type HeroImage } from "../content";
import HeroBackground from "./hero-background";

let heroHasAnimated = false;

const STRESS_FALLBACK: HeroImage[] = Array.from({ length: 18 }, (_, i) => ({ src: `/hero/stress/${i + 1}.jpg` }));

export default function Hero({
  headline,
  images,
  nextDates,
  ctaHref,
}: {
  headline?: string[];
  images?: HeroImage[];
  nextDates?: string[];
  ctaHref?: string;
} = {}) {
  const { hero } = content;
  const headlineLines = headline ?? ["Endlich wirklich abschalten.", "Ohne Anstrengung."];
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

      {/* ── Primary CTA ───────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center mt-[5vh] gap-3 opacity-0"
        style={{ animation: "fadeInUp 0.75s ease forwards 0.28s" }}
      >
        <a
          href={ctaHref ?? hero.ctaHref}
          className="
            inline-flex items-center gap-2.5
            px-8 py-4 rounded-full
            bg-[#F59E0B] text-[#1A3352]
            text-[0.72rem] tracking-[0.18em] uppercase font-medium
            whitespace-nowrap shadow-[0_4px_24px_rgba(245,158,11,0.45)]
            transition-all duration-300
            hover:bg-[#E08C00] hover:shadow-[0_6px_28px_rgba(245,158,11,0.55)]
          "
        >
          {hero.cta}
        </a>

        {nextDates && nextDates.length > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-[#1A3352]/55 tracking-wide">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="shrink-0">
              <rect x="0.6" y="1.6" width="11.8" height="10.8" rx="1.4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M0.6 5.2h11.8" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 0.6v2M9 0.6v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>
              Nächste Termine:{" "}
              {nextDates.map((d, i) => (
                <span key={d} className={i >= 2 ? "hidden sm:inline" : undefined}>
                  <span className="text-[#1A3352]/75 font-medium">{d}</span>
                  {i < nextDates.length - 1 && <span className={i === 1 ? "hidden sm:inline" : undefined}> · </span>}
                </span>
              ))}
            </span>
          </p>
        )}
      </div>

      <div className="flex-1 min-h-10" />

      {/* ── Scroll affordance ─────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center pb-6">
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
