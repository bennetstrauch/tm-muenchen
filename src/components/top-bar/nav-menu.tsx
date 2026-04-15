"use client";

import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { label: "Für wen ist TM?", href: "#fuer-wen" },
  { label: "Was TM einzigartig macht", href: "#warum-tm" },
  { label: "So funktioniert es", href: "#wie-es-funktioniert" },
  { label: "Nächste Infovorträge", href: "#anmeldung" },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
        className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-full hover:bg-[#1A3352]/8 transition-all duration-200 focus-visible:outline-none"
      >
        <span className={`block w-4 h-[1.5px] bg-[#1A3352] transition-all duration-300 origin-center ${open ? "translate-y-[6.5px] rotate-45" : ""}`} />
        <span className={`block w-4 h-[1.5px] bg-[#1A3352] transition-all duration-200 ${open ? "opacity-0 scale-x-0" : ""}`} />
        <span className={`block w-4 h-[1.5px] bg-[#1A3352] transition-all duration-300 origin-center ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
      </button>

      <div
        className={`
          absolute top-11 left-0
          bg-white/20 backdrop-blur-md
          border border-white/25
          rounded-2xl shadow-[0_8px_40px_rgba(26,51,82,0.12)]
          py-3 min-w-[220px]
          flex flex-col
          transition-all duration-200 origin-top-left
          ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        {NAV_LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="px-5 py-3 text-[0.9rem] font-medium text-[#1A3352] hover:bg-[#1A3352]/5 transition-colors duration-150 focus-visible:outline-none"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
