"use client";

import { useEffect, useRef } from "react";
import { useNavContext } from "@/contexts/nav-context";

type NavLink = { label: string; href: string; type: "anchor" | "page" };

const NAV_LINKS: NavLink[] = [
  { label: "Für wen ist TM?", href: "#fuer-wen", type: "anchor" },
  { label: "Was TM einzigartig macht", href: "#warum-tm", type: "anchor" },
  { label: "So funktioniert es", href: "#wie-es-funktioniert", type: "anchor" },
  { label: "Nächste Infovorträge", href: "#anmeldung", type: "anchor" },
  { label: "Für bereits Meditierende", href: "/events", type: "page" },
];

const ITEM_BASE_CLS = `
  w-full flex items-center justify-between
  px-5 py-4
  text-left text-[0.9rem] font-medium text-[#1A3352]
  hover:bg-[#1A3352]/5 active:bg-[#1A3352]/8
  transition-colors duration-150
  focus-visible:outline-none
`;

const chevron = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className="opacity-25 flex-shrink-0 ml-3"
  >
    <path
      d="M5 3L9 7L5 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function NavPanel() {
  const { isOpen, setIsOpen, setPanelHeight } = useNavContext();
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) setPanelHeight(innerRef.current.offsetHeight);
  }, [setPanelHeight]);

  useEffect(() => {
    if (!isOpen) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, setIsOpen]);

  function handleNavClick(href: string) {
    setIsOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9996]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-14 left-0 right-0 z-[9997] grid overflow-hidden ${isOpen ? "" : "pointer-events-none"}`}
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div ref={innerRef} className="min-h-0">
          <div className="bg-white/95 backdrop-blur-md border-b border-[#1A3352]/10 shadow-[0_8px_24px_rgba(26,51,82,0.07)]">
            {NAV_LINKS.map((link, i) => {
              const cls = `${ITEM_BASE_CLS}${i > 0 ? " border-t border-[#1A3352]/8" : ""}`;
              if (link.type === "page") {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cls}
                  >
                    {link.label}
                    {chevron}
                  </a>
                );
              }
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cls}
                >
                  {link.label}
                  {chevron}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
