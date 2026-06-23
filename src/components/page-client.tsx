"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Hero from "./hero";
import TrustBadges from "./trust-badges";
import ForWhom from "./for-whom";
import ThemeSwitcher from "./theme-switcher";
import { themes, themeKeyToCamel, type ThemeKey } from "../content";

const HERO_THEMES = Object.keys(themes) as ThemeKey[];

function HeroArrow({ direction, onClick, label }: { direction: "left" | "right"; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="
        absolute top-1/2 -translate-y-1/2 z-20
        flex items-center justify-center
        w-10 h-10 rounded-full
        text-[#1A3352]/40 hover:text-[#1A3352]/80
        hover:bg-[#1A3352]/8
        transition-all duration-200 focus-visible:outline-none
      "
      style={{ [direction === "left" ? "left" : "right"]: "1rem" }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        {direction === "left"
          ? <path d="M14 5L8 11L14 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M8 5L14 11L8 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  );
}

export default function PageClient({
  initialTheme,
  nextDates,
  conversionSlot,
  heroSlot,
}: {
  initialTheme: ThemeKey;
  nextDates?: string[];
  conversionSlot?: React.ReactNode;
  heroSlot?: React.ReactNode;
}) {
  const tNav    = useTranslations("Nav");
  const tThemes = useTranslations("Themes");
  const router  = useRouter();

  const initialTab: number = themes[initialTheme].forWhomIndex;
  const [activeTab, setActiveTab] = useState<number>(initialTab);

  const heroTheme      = themes[initialTheme];
  const heroThemeIndex = HERO_THEMES.indexOf(initialTheme);
  const camelKey       = themeKeyToCamel(initialTheme);
  const headline       = [
    tThemes(`${camelKey}.headline0` as Parameters<typeof tThemes>[0]),
    tThemes(`${camelKey}.headline1` as Parameters<typeof tThemes>[0]),
  ];

  function navigateToTheme(key: ThemeKey) {
    const slug = themes[key].slug;
    router.push(slug ? `/${slug}` : "/", { scroll: false });
  }

  return (
    <>
      {heroSlot === undefined && (
        <div className="relative">
          <Hero
            headline={headline}
            images={heroTheme.images}
            nextDates={nextDates}
            ctaHref="#infoabend"
          />
          {heroThemeIndex > 0 && (
            <HeroArrow direction="left" label={tNav("prevTheme")} onClick={() => navigateToTheme(HERO_THEMES[heroThemeIndex - 1])} />
          )}
          {heroThemeIndex < HERO_THEMES.length - 1 && (
            <HeroArrow direction="right" label={tNav("nextTheme")} onClick={() => navigateToTheme(HERO_THEMES[heroThemeIndex + 1])} />
          )}
        </div>
      )}

      <TrustBadges />

      {conversionSlot}

      <ForWhom
        activeIndex={activeTab}
        onActiveIndexChange={(i) => setActiveTab(i)}
        tabSlot={<ThemeSwitcher activeTab={activeTab} onTabChange={(i) => setActiveTab(i)} />}
      />
    </>
  );
}
