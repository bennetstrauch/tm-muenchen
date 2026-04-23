"use client";

import { useState, useEffect, useRef } from "react";
import Carousel from "./carousel";
import { trustpilotReviews, type TrustpilotReview } from "../content";

// ── Trustpilot green stars ────────────────────────────────
function TpStars() {
  return (
    <div className="flex gap-0.5" aria-label="5 von 5 Sternen">
      {[0, 1, 2, 3, 4].map(i => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" fill="#00B67A" />
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="#ffffff"
          />
        </svg>
      ))}
    </div>
  );
}

// ── "Verifiziert" badge — matches widget style ────────────
function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-[#555] underline underline-offset-2">
      <span className="inline-flex items-center justify-center w-[1.1rem] h-[1.1rem] rounded-full bg-[#555] flex-shrink-0">
        <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
          <path d="M1 3.5L3 5.5L7 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      Verifiziert
    </span>
  );
}

// ── Single review card ────────────────────────────────────
function ReviewCard({ review }: { review: TrustpilotReview }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => {
      // Only measure when collapsed — scrollHeight > clientHeight means text is cut off
      if (!expanded) setClamped(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  return (
    <div className="bg-white rounded-2xl px-7 py-6">

      {/* Stars + verified */}
      <div className="flex items-center justify-between mb-3">
        <TpStars />
        <a href={review.url} target="_blank" rel="noopener noreferrer">
          <VerifiedBadge />
        </a>
      </div>

      {/* Title */}
      <a
        href={review.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block font-semibold text-[#1A3352] text-base leading-snug mb-3 hover:underline"
      >
        {review.titleDE}
      </a>

      {/* Quote */}
      <p
        ref={textRef}
        className={`text-base text-[#3D5573] leading-relaxed ${!expanded ? "line-clamp-6" : ""}`}
      >
        {review.quoteDE}
      </p>

      {/* Expand / collapse — only shown when text is actually clamped */}
      {(clamped || expanded) && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 inline-flex items-center gap-1 text-[0.7rem] tracking-[0.12em] uppercase text-[#1A3352]/50 hover:text-[#1A3352] transition-colors duration-200 focus-visible:outline-none"
        >
          {expanded ? <>Weniger <span>↑</span></> : <>Mehr lesen <span>↓</span></>}
        </button>
      )}

      {/* Name → links to Trustpilot review */}
      <a
        href={review.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-2 text-[0.9rem] font-semibold text-[#6B7A8D] hover:text-[#1A3352] transition-colors duration-200 group"
      >
        {review.name}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
          className="opacity-40 group-hover:opacity-80 transition-opacity">
          <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

    </div>
  );
}

// ── Section ───────────────────────────────────────────────
export default function Trustpilot({
  rating = "4,8",
  reviewCount = "8.072",
}: {
  rating?: string;
  reviewCount?: string;
}) {
  return (
    <section className="section bg-[#EFF6FF]">
      <div className="section-inner">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-8">
            Was andere sagen
          </h2>

          {/* Rating summary */}
          <div className="inline-flex flex-col items-center gap-4">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#DBEAFE] bg-white">
              <span className="text-[1rem] text-[#1A3352] font-medium">Exzellent</span>
              <span className="text-[#C8D8E8] text-[1rem]">|</span>
              <span className="text-[1.2rem] font-semibold tracking-tight text-[#1A1A1A]">Trustpilot</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-display font-semibold text-[3.5rem] leading-none text-[#009962]">
                {rating}
              </span>
              <div className="flex flex-col gap-1.5">
                {(() => {
                  const val = parseFloat(rating.replace(",", "."));
                  const full = Math.floor(val);
                  const pct = Math.round((val - full) * 100);
                  return (
                    <div className="flex gap-0.5" aria-label={`${rating} von 5 Sternen`}>
                      {[0, 1, 2, 3, 4].map(i => {
                        const gradId = `tp-star-${i}`;
                        const isPartial = i === full;
                        return (
                          <svg key={i} width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                            {isPartial && (
                              <defs>
                                <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                                  <stop offset={`${pct}%`} stopColor="#00B67A" />
                                  <stop offset={`${pct}%`} stopColor="#D1D5DB" />
                                </linearGradient>
                              </defs>
                            )}
                            <path
                              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                              fill={isPartial ? `url(#${gradId})` : i < full ? "#00B67A" : "#D1D5DB"}
                            />
                          </svg>
                        );
                      })}
                    </div>
                  );
                })()}
                <span className="text-[1rem] font-medium text-[#007A4D]">
                  {reviewCount} verifizierte Bewertungen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: 1 card per slide */}
        <div className="md:hidden">
          <Carousel arrowOffsetPx={80}>
            {trustpilotReviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </Carousel>
        </div>

        {/* Desktop: 2 cards per slide */}
        <div className="hidden md:block">
          <Carousel arrowOffsetPx={80}>
            {Array.from({ length: Math.ceil(trustpilotReviews.length / 2) }, (_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                {trustpilotReviews.slice(i * 2, i * 2 + 2).map((review, j) => (
                  <ReviewCard key={j} review={review} />
                ))}
              </div>
            ))}
          </Carousel>
        </div>

      </div>
    </section>
  );
}
