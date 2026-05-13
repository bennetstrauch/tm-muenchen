"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Hero from "./hero";
import TrustBadges from "./trust-badges";
import ForWhom from "./for-whom";
import ThemeSwitcher from "./theme-switcher";
import { themes, type ThemeKey } from "../content";

const RETIRED_THEMES = new Set<ThemeKey>(["innere-stille", "depression"]);
const HERO_THEMES = (Object.keys(themes) as ThemeKey[]).filter((k) => !RETIRED_THEMES.has(k));

function HeroArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "left" ? "Vorheriges Thema" : "Nächstes Thema"}
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

export default function PageClient({ initialTheme, nextDates }: { initialTheme: ThemeKey; nextDates?: string[] }) {
  const router = useRouter();
  const initialTab: number = themes[initialTheme].forWhomIndex;
  const [activeTab, setActiveTab] = useState<number>(initialTab);

  const heroTheme = themes[initialTheme];
  const heroThemeIndex = HERO_THEMES.indexOf(initialTheme);

  function navigateToTheme(key: ThemeKey) {
    const slug = themes[key].slug;
    router.push(slug ? `/${slug}` : "/", { scroll: false });
  }

  function handleTabChange(index: number) {
    setActiveTab(index);
  }

  return (
    <>
      {/* Hero with prev/next theme arrows overlaid */}
      <div className="relative">
        <Hero
          headline={heroTheme.headline}
          subtitle={heroTheme.subtitle}
          images={heroTheme.images}
          nextDates={nextDates}
          ctaHref="#infoabend"
        />
        {heroThemeIndex > 0 && (
          <HeroArrow direction="left" onClick={() => navigateToTheme(HERO_THEMES[heroThemeIndex - 1])} />
        )}
        {heroThemeIndex < HERO_THEMES.length - 1 && (
          <HeroArrow direction="right" onClick={() => navigateToTheme(HERO_THEMES[heroThemeIndex + 1])} />
        )}
      </div>

      <TrustBadges />

      {/* ForWhom section — tab switcher sits between heading and carousel */}
      <ForWhom
        activeIndex={activeTab}
        onActiveIndexChange={handleTabChange}
        tabSlot={<ThemeSwitcher activeTab={activeTab} onTabChange={handleTabChange} />}
      />
    </>
  );
}
