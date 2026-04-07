"use client";

import { useState } from "react";

export default function Expandable({
  children,
  openLabel = "Mehr lesen",
  closeLabel = "Weniger",
}: {
  children: React.ReactNode;
  openLabel?: string;
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {open && (
        <p className="mt-3 text-sm text-[#5c4d38] leading-relaxed">
          {children}
        </p>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] tracking-[0.15em] uppercase text-[#c4962a] hover:text-[#a37e22] transition-colors duration-200 focus-visible:outline-none"
      >
        {open ? closeLabel : openLabel}
        <span
          className="text-xs transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ↓
        </span>
      </button>
    </div>
  );
}
