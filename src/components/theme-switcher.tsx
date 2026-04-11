"use client";

import { useState, useEffect, useRef } from "react";
import { forWhomTabs } from "../content";

function getVisibleSlots(activeTab: number, total: number): [number, number, number] {
  const prev = (activeTab - 1 + total) % total;
  const next = (activeTab + 1) % total;
  return [prev, activeTab, next];
}

export default function ThemeSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: number;
  onTabChange: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const total = forWhomTabs.length;
  const visibleSlots = getVisibleSlots(activeTab, total);
  const hiddenTabs = forWhomTabs
    .map((tab, i) => ({ ...tab, index: i }))
    .filter((_, i) => !visibleSlots.includes(i));

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="flex items-center justify-center gap-0 sm:gap-1 mb-10">

      {visibleSlots.map((slotIndex, i) => {
        const tab = forWhomTabs[slotIndex];
        const isActive = slotIndex === activeTab;
        return (
          <div key={slotIndex} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-[#1A3352]/20 text-[0.55rem] select-none sm:px-0.5">·</span>
            )}
            <button
              onClick={() => onTabChange(slotIndex)}
              className={`
                px-1.5 sm:px-2 py-1 rounded
                text-[0.65rem] tracking-[0.15em] uppercase
                transition-all duration-200 focus-visible:outline-none whitespace-nowrap
                ${isActive
                  ? "text-[#1A3352] font-medium"
                  : "text-[#1A3352]/35 hover:text-[#1A3352]/65"
                }
              `}
            >
              {tab.label}
            </button>
          </div>
        );
      })}

      {/* Dropdown for hidden tabs */}
      {hiddenTabs.length > 0 && (
        <div className="flex items-center gap-1" ref={dropdownRef}>
          <span className="text-[#1A3352]/20 text-[0.55rem] select-none px-0.5">·</span>
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              aria-label="Weitere Themen"
              className={`
                px-1.5 sm:px-2 py-1 rounded
                text-[0.65rem] tracking-[0.15em] uppercase
                transition-all duration-200 focus-visible:outline-none
                flex items-center gap-1
                ${open ? "text-[#1A3352]/65" : "text-[#1A3352]/35 hover:text-[#1A3352]/65"}
              `}
            >
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
                className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {open && (
              <div className="
                absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                bg-[#F9F7E9] border border-[#D8E4EE]
                rounded-xl shadow-md
                py-1.5 min-w-[9rem]
                flex flex-col
              ">
                {hiddenTabs.map(tab => (
                  <button
                    key={tab.index}
                    onClick={() => { onTabChange(tab.index); setOpen(false); }}
                    className="
                      px-4 py-2 text-left
                      text-[0.65rem] tracking-[0.15em] uppercase
                      text-[#1A3352]/50 hover:text-[#1A3352]
                      hover:bg-[#1A3352]/5
                      transition-colors duration-150 focus-visible:outline-none
                    "
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
