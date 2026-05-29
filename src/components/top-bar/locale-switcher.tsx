"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  fr: "FR",
  es: "ES",
};

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Sprache wechseln"
        aria-expanded={open}
        className="flex items-center h-9 px-2 rounded-full text-[#1A3352] hover:bg-[#1A3352]/8 transition-colors duration-200 focus-visible:outline-none"
      >
        <span className="text-[0.8rem] font-medium tracking-wider leading-none">
          {LOCALE_LABELS[locale]}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] bg-white rounded-xl shadow-lg border border-[#E5EAF0] py-1 min-w-[80px] z-[9999]">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href={pathname}
              locale={l}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors ${
                l === locale
                  ? "text-[#1A3352] font-semibold"
                  : "text-[#3D5573] hover:bg-[#EFF6FF]"
              }`}
            >
              {LOCALE_LABELS[l]}
              {l === locale && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="#BCA075" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
