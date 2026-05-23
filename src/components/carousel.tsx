"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { useTranslations } from "next-intl";

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M14 5L8 11L14 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M8 5L14 11L8 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type Direction = "left" | "right";
type TransitionState = {
  from: number;
  to: number;
  direction: Direction;
  phase: "setup" | "running";
};

export default function Carousel({
  children,
  arrowOffsetPx = 110,
  activeIndex,
  onIndexChange,
}: {
  children: React.ReactNode;
  arrowOffsetPx?: number;
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
}) {
  const t = useTranslations("Carousel");
  const slides = React.Children.toArray(children);
  const total = slides.length;

  const [current, setCurrent] = useState(activeIndex ?? 0);
  const [transition, setTransition] = useState<TransitionState | null>(null);

  const isFirstRender = useRef(true);
  useEffect(() => { isFirstRender.current = false; }, []);

  const lastReportedRef = useRef(activeIndex ?? 0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex === undefined) return;
    if (activeIndex === lastReportedRef.current) return;
    if (transition !== null) return;
    lastReportedRef.current = activeIndex;
    startTransition(current, activeIndex, activeIndex > current ? "left" : "right");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    if (transition?.phase !== "setup") return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setTransition(t => t ? { ...t, phase: "running" } : null)
      )
    );
    return () => cancelAnimationFrame(id);
  }, [transition?.phase]);

  function startTransition(from: number, to: number, direction: Direction) {
    if (from === to) return;
    setTransition({ from, to, direction, phase: "setup" });
  }

  function handleTransitionEnd() {
    if (!transition) return;
    setCurrent(transition.to);
    setTransition(null);
  }

  function goTo(i: number, direction: Direction) {
    if (transition) return;
    if (i === current) return;
    lastReportedRef.current = i;
    startTransition(current, i, direction);
    onIndexChange?.(i);
  }

  function prev() { goTo((current - 1 + total) % total, "right"); }
  function next() { goTo((current + 1) % total, "left"); }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (dx < -50) next();
    else if (dx > 50) prev();
  }

  const displayIndex = transition ? transition.to : current;

  function renderSlides() {
    if (!transition) {
      return (
        <div
          style={isFirstRender.current
            ? { animation: "cardSlideIn 0.35s ease forwards" }
            : undefined}
        >
          {slides[current]}
        </div>
      );
    }

    const { from, to, direction, phase } = transition;
    const isLeft   = direction === "left";
    const leftSlide  = isLeft ? from : to;
    const rightSlide = isLeft ? to   : from;
    const startX     = isLeft ? 0    : -100;
    const endX       = isLeft ? -100 : 0;
    const currentX   = phase === "running" ? endX : startX;

    return (
      <div
        className="flex will-change-transform"
        style={{
          transform: `translateX(${currentX}%)`,
          transition: phase === "running" ? "transform 300ms ease-out" : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="w-full flex-shrink-0 min-w-0">{slides[leftSlide]}</div>
        <div className="w-full flex-shrink-0 min-w-0">{slides[rightSlide]}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-[1.75rem_1fr_1.75rem] items-start">

        <button
          onClick={prev}
          aria-label={t("prev")}
          style={{ marginTop: arrowOffsetPx }}
          className="text-[#1A3352]/30 hover:text-[#1A3352]
                     transition-colors duration-200 focus-visible:outline-none"
        >
          <ChevronLeft />
        </button>

        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          {renderSlides()}
        </div>

        <button
          onClick={next}
          aria-label={t("next")}
          style={{ marginTop: arrowOffsetPx }}
          className="text-[#1A3352]/30 hover:text-[#1A3352]
                     transition-colors duration-200 focus-visible:outline-none"
        >
          <ChevronRight />
        </button>

      </div>

      <div className="flex justify-center items-center gap-2.5 mt-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > displayIndex ? "left" : "right")}
            aria-label={t("slideLabel", { current: i + 1, total })}
            className={`rounded-full transition-all duration-300 focus-visible:outline-none ${
              i === displayIndex
                ? "w-5 h-[5px] bg-[#1A3352]"
                : "w-[5px] h-[5px] bg-[#1A3352]/25 hover:bg-[#1A3352]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
