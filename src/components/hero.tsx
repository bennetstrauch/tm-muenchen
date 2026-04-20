"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { content } from "../content";

/**
 * Module-level flag — survives client-side navigations (JS module stays in memory).
 * Resets only on full browser refresh.
 */
let heroHasAnimated = false;

export default function Hero({
  headline,
  subtitle,
  imageSrc,
}: {
  headline?: string[];
  subtitle?: string;
  imageSrc?: string;
} = {}) {
  const { hero } = content;
  const headlineLines = headline ?? ["Endlich wirklich abschalten.", "Ohne Anstrengung."];
  const subtitleText  = subtitle  ?? "regeneriert tiefer als Schlaf";
  const imageSource   = imageSrc ?? "/hero.jpg";

  // Capture first-load state synchronously before useEffect fires
  const isFirstLoad = useRef(!heroHasAnimated);
  useEffect(() => { heroHasAnimated = true; }, []);

  // Static elements (eyebrow, badge, button): animate only on first page load
  const staticCls  = isFirstLoad.current ? "opacity-0" : "";
  const staticAnim = (anim: string) => isFirstLoad.current ? { animation: anim } : undefined;

  return (
    <section id="hero" className="relative min-h-[100dvh] flex flex-col items-center px-8 pt-14">

      {/* ── Background image ──────────────────────────── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #d4c5a9 0%, #9e8c72 60%, #7a6a54 100%)" }}
      >
        {/* key causes remount on theme change → blur-in animation replays */}
        <div
          key={imageSource}
          className="absolute inset-0 hero-img-shift"
          style={{ animation: "heroImageIn 0.45s ease forwards" }}
        >
          <Image
            src={imageSource}
            alt=""
            fill
            className="object-cover object-right sm:object-center"
            priority
            sizes="100vw"
          />
        </div>
      </div>

      {/* ── Off-white overlay ─────────────────────────── */}
      <div className="absolute inset-0 bg-[#F9F7E9]/65" />

      {/* ── Badge — static, animates only on first load ──── */}
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

      {/* ── Headline — always animates (content changes per theme) ── */}
      <div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-xl mt-[calc(4vh+2rem)] sm:mt-[calc(7vh+3.5rem)] opacity-0"
        style={{ animation: "fadeInUp 0.75s ease forwards 0.12s" }}
      >
        <h1 className="w-full">
          <span className="block font-display font-light text-[2.5rem] leading-[1.2] sm:text-[5.25rem] text-[#1A3352]">
            {headlineLines[0]}
          </span>
          <span className="block font-display font-light italic text-[2.5rem] leading-[1.2] sm:text-[5.25rem] text-[#1A3352]">
            {headlineLines[1]}
          </span>
        </h1>
        <div className="mt-6">
          <div className="w-10 h-px bg-[#F0C814]" />
        </div>
      </div>

      {/* ── Brand + subtitle — always animates (content changes per theme) ── */}
      <div className="relative z-10 mt-auto flex flex-col items-center text-center gap-7 pb-24">
        <div
          className="flex flex-col items-center gap-1.5 opacity-0 -translate-y-4"
          style={{ animation: "fadeInUp 0.75s ease forwards 0.32s" }}
        >
          <span className="font-display font-medium text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight tracking-wide">
            Transzendentale Meditation
          </span>
          <span className="text-base sm:text-lg text-[#1A3352]/65 font-light tracking-[0.06em]">
            {subtitleText}
          </span>
        </div>

        {/* Button — static, animates only on first load */}
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
