"use client";

import { useState, useEffect, useRef } from "react";

const VISIBLE_BADGES = [
  "Persönlich unterrichtet",
  "Einfach und mühelos",
  "Von Millionen weltweit praktiziert",
];

const HIDDEN_BADGES = [
  "Keine Konzentration nötig",
  "Ohne Gedanken stoppen",
  "400+ wissenschaftliche Studien",
];

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="5" cy="5" r="4.5" stroke="#BCA075" />
      <path d="M2.5 5L4 6.5L7.5 3" stroke="#BCA075" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <li className="inline-flex items-center gap-1.5 text-[0.75rem] tracking-[0.12em] uppercase font-medium text-[#1A3352]/70">
      <CheckIcon />
      {label}
    </li>
  );
}

export default function TrustBadges() {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) setExpanded(false); },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-[#FAFAF8] border-b border-[#E8E4DC] py-5">
      <div className="px-5 md:px-0">
        <ul
          className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2"
          aria-label="Merkmale von Transzendentaler Meditation"
        >
          {VISIBLE_BADGES.map((label) => <Badge key={label} label={label} />)}
          {expanded && HIDDEN_BADGES.map((label) => <Badge key={label} label={label} />)}
        </ul>

        <div className="flex justify-center mt-3">
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
            className="text-[#1A3352]/35 hover:text-[#1A3352]/60 transition-colors p-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
