"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, Link as IntlLink } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useNavContext } from "@/contexts/nav-context";

type NavLink = { labelKey: string; href: string; type: "anchor" | "page" };

const NAV_LINKS: NavLink[] = [
  { labelKey: "link0", href: "#fuer-wen",              type: "anchor" },
  { labelKey: "link1", href: "#warum-tm",              type: "anchor" },
  { labelKey: "link2", href: "#wie-es-funktioniert",   type: "anchor" },
  { labelKey: "link3", href: "#anmeldung",             type: "anchor" },
  { labelKey: "link4", href: "/events",                type: "page"   },
  { labelKey: "link5", href: "#kurse",                 type: "anchor" },
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

const LOCALE_LABELS: Record<Locale, string> = { de: "DE", en: "EN", fr: "FR", es: "ES" };

export default function NavPanel({ activeLocales, showMeditatorsSection = true, showCourses = false }: { activeLocales: string[]; showMeditatorsSection?: boolean; showCourses?: boolean }) {
  const t = useTranslations("Nav");
  const { isOpen, setIsOpen, setPanelHeight } = useNavContext();
  const locales = routing.locales.filter((l) => activeLocales.includes(l));
  const router = useRouter();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
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
    const el = document.querySelector(href);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    } else {
      router.push("/" + href);
    }
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
            {NAV_LINKS.filter(l => {
              if (l.href === '/events') return showMeditatorsSection;
              if (l.href === '#kurse') return showCourses;
              return true;
            }).map((link, i) => {
              const label = t(link.labelKey as Parameters<typeof t>[0]);
              const cls = `${ITEM_BASE_CLS}${i > 0 ? " border-t border-[#1A3352]/8" : ""}`;
              if (link.type === "page") {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cls}
                  >
                    {label}
                    {chevron}
                  </Link>
                );
              }
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cls}
                >
                  {label}
                  {chevron}
                </button>
              );
            })}

            {/* Language switcher */}
            {locales.length > 1 && (
            <div className="border-t border-[#1A3352]/8 px-5 py-3 flex items-center gap-1">
              {locales.map((l, i) => (
                <IntlLink
                  key={l}
                  href={pathname}
                  locale={l}
                  onClick={() => setIsOpen(false)}
                  className={`px-2.5 py-1 rounded-md text-[0.8rem] tracking-wider transition-colors ${
                    l === locale
                      ? "font-semibold text-[#1A3352] bg-[#1A3352]/8"
                      : "font-normal text-[#3D5573] hover:bg-[#1A3352]/5"
                  }${i > 0 ? " ml-0.5" : ""}`}
                >
                  {LOCALE_LABELS[l]}
                </IntlLink>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
