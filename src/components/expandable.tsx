"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Expandable({
  children,
  openLabel = "Mehr lesen",
}: {
  children: React.ReactNode;
  openLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {open && (
        <p className="mt-3 text-base text-[#3D5573] leading-relaxed">
          {children}
        </p>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] tracking-[0.15em] uppercase text-[#1A3352]/60 hover:text-[#1A3352] transition-colors duration-200 focus-visible:outline-none"
        >
          {openLabel}
          <span className="text-xs transition-transform duration-300">↓</span>
        </button>
      )}

      {/* "Weniger" floats fixed above the sticky CTA so it's always reachable */}
      {open && mounted && createPortal(
        <button
          onClick={() => setOpen(false)}
          className="
            fixed bottom-24 left-1/2 -translate-x-1/2 z-[9998]
            inline-flex items-center gap-2
            px-6 py-2.5 rounded-full
            bg-[#F9F7E9]/95 backdrop-blur-sm
            border border-[#D8E4EE] shadow-md
            text-[0.7rem] tracking-[0.15em] uppercase
            text-[#1A3352]/60 hover:text-[#1A3352]
            transition-colors duration-200 focus-visible:outline-none
            whitespace-nowrap
          "
        >
          Weniger
          <span className="text-xs">↑</span>
        </button>,
        document.body
      )}
    </>
  );
}
