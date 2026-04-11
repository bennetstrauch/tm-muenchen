"use client";

import { useEffect, useState } from "react";
import { content } from "../content";

export default function StickyCta() {
  const { hero } = content;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const section = document.getElementById("anmeldung");
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${hidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      <a
        href={hero.ctaHref}
        className="
          inline-flex items-center gap-3
          px-9 py-4
          bg-[#A5C3D7] text-[#1A3352]
          text-[0.7rem] tracking-[0.22em] uppercase font-medium
          rounded-full whitespace-nowrap shadow-[0_4px_24px_rgba(165,195,215,0.6)]
          transition-all duration-300
          hover:bg-[#8BAAC3] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(165,195,215,0.65)]
          active:translate-y-0
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5C3D7] focus-visible:ring-offset-2
        "
      >
        {hero.cta}
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
