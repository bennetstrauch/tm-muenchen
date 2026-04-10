"use client";

import { content } from "../content";

export default function StickyCta() {
  const { hero } = content;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
      <a
        href={hero.ctaHref}
        className="
          inline-flex items-center gap-3
          px-9 py-4
          bg-[#c4962a] text-white
          text-[0.7rem] dtracking-[0.22em] uppercase font-medium
          rounded-full whitespace-nowrap shadow-[0_4px_24px_rgba(196,150,42,0.5)]
          transition-all duration-300
          hover:bg-[#a37e22] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(196,150,42,0.55)]
          active:translate-y-0
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4962a] focus-visible:ring-offset-2
        "
      >
        {hero.cta}
        <span aria-hidden="true" className="text-[#f5e0a8]">→</span>
      </a>
    </div>
  );
}
