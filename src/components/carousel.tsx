"use client";

import { useState, useRef } from "react";
import React from "react";

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

/**
 * arrowOffsetPx — distance from the top of the slide container to the arrow center.
 * Set this to half the non-expanded slide height so arrows sit in the visual middle
 * and never move when content expands.
 */
export default function Carousel({
  children,
  arrowOffsetPx = 110,
}: {
  children: React.ReactNode;
  arrowOffsetPx?: number;
}) {
  const slides = React.Children.toArray(children);
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) next();
    else if (dx > 50) prev();
    touchStartX.current = null;
  }

  return (
    <div>
      {/*
        Grid: [arrow 1.75rem] [content 1fr] [arrow 1.75rem]
        items-start so the grid row height is driven by the content column only.
        Arrows use a fixed marginTop = arrowOffsetPx, so their position
        is always the same regardless of how tall the content grows.
      */}
      <div className="grid grid-cols-[1.75rem_1fr_1.75rem] items-start">

        <button
          onClick={prev}
          aria-label="Vorherige"
          style={{ marginTop: arrowOffsetPx }}
          className="text-[#1A3352]/30 hover:text-[#1A3352]
                     transition-colors duration-200 focus-visible:outline-none"
        >
          <ChevronLeft />
        </button>

        {/* Overflow window — all slides side-by-side, translateX reveals one */}
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="flex transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className="w-full flex-shrink-0 min-w-0"
                aria-hidden={i !== index}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={next}
          aria-label="Nächste"
          style={{ marginTop: arrowOffsetPx }}
          className="text-[#1A3352]/30 hover:text-[#1A3352]
                     transition-colors duration-200 focus-visible:outline-none"
        >
          <ChevronRight />
        </button>

      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-2.5 mt-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1} von ${total}`}
            className={`rounded-full transition-all duration-300 focus-visible:outline-none ${
              i === index
                ? "w-5 h-[5px] bg-[#1A3352]"
                : "w-[5px] h-[5px] bg-[#1A3352]/25 hover:bg-[#1A3352]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
