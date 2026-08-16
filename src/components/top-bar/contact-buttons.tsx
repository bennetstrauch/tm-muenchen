"use client";

import { useState, useRef, useEffect } from "react";
import type { ResolvedContact } from "@/lib/contact";
import { PhoneIcon, MailIcon } from "@/components/icons";

export default function ContactButtons({
  showWhatsApp,
  whatsappHref,
  instagramHref,
  phoneDisplay,
  phoneHref,
  emailDisplay,
  emailHref,
}: ResolvedContact) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Instagram — always visible */}
      <a
        href={instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex items-center justify-center w-9 h-9 rounded-full text-[#1A3352]/60 hover:text-[#1A3352] hover:bg-[#1A3352]/8 transition-all duration-200 focus-visible:outline-none"
      >
        <svg width="19" height="19" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1" />
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1" />
          <circle cx="11.75" cy="4.25" r="0.75" fill="currentColor" />
        </svg>
      </a>

      {/* Contact overflow */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Kontakt"
          aria-expanded={open}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 focus-visible:outline-none ${
            open
              ? "text-[#1A3352] bg-[#1A3352]/8"
              : "text-[#1A3352]/60 hover:text-[#1A3352] hover:bg-[#1A3352]/8"
          }`}
        >
          <PhoneIcon width={18} height={18} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-[#1A3352]/8 py-1.5 min-w-[9rem] z-[9999]">
            <a
              href={phoneHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[0.78rem] text-[#1A3352]/70 hover:text-[#1A3352] hover:bg-[#1A3352]/4 transition-colors"
            >
              <PhoneIcon width={13} height={13} />
              {phoneDisplay}
            </a>
            <a
              href={emailHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[0.78rem] text-[#1A3352]/70 hover:text-[#1A3352] hover:bg-[#1A3352]/4 transition-colors"
            >
              <MailIcon width={14} height={11} />
              {emailDisplay}
            </a>
            {showWhatsApp && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[0.78rem] text-[#1A3352]/70 hover:text-[#1A3352] hover:bg-[#1A3352]/4 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1C4.134 1 1 4.134 1 8c0 1.26.338 2.442.928 3.458L1 15l3.644-.908A6.965 6.965 0 0 0 8 15c3.866 0 7-3.134 7-7s-3.134-7-7-7z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                  <path d="M5.5 6.5c.167-.5.667-1.5 1.5-1.5.4 0 .667.333.833.667l.5 1c.083.167.083.333 0 .5L7.5 8c.333.667 1 1.333 1.667 1.667l.833-.833c.167-.167.333-.167.5 0l1 .5c.333.167.667.433.667.833 0 .833-1 1.333-1.5 1.5-1.667.5-4.167-1-5-3.167z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
