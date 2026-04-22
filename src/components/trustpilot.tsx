"use client";

import { useEffect } from "react";
import Image from "next/image";
import Script from "next/script";

// Trustpilot listing: "Transcendental Meditation" — 4.8★ · 8 072 reviews
const BUSINESS_UNIT_ID = "5c364931aa52ea000124d70e";
const TEMPLATE_SLIDER  = "54ad5defc6454f065c28af8b"; // Reviews carousel

export default function Trustpilot({
  rating = "4,8",
  reviewCount = "8.072",
}: {
  rating?: string;
  reviewCount?: string;
}) {
  useEffect(() => {
    // Re-init if the bootstrap script was already loaded on a previous render
    const tp = (window as { Trustpilot?: { loadFromElement: (el: Element | null) => void } }).Trustpilot;
    if (tp) {
      tp.loadFromElement(document.querySelector(".trustpilot-widget"));
    }
  }, []);

  return (
    <section className="section bg-[#EFF6FF]">
      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
      />

      <div className="section-inner">
        <div className="text-center mb-10">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-8">
            Was andere sagen
          </h2>

          {/* Rating + Trustpilot branding */}
          <div className="inline-flex flex-col items-center gap-4">

            {/* Exzellent + Trustpilot badge */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#DBEAFE] bg-white">
              <span className="text-[1rem] text-[#1A3352] font-medium">
                Exzellent
              </span>
              <span className="text-[#C8D8E8] text-[1rem]">|</span>
              {/* <Image
                src="/trustpilot-star.png"
                alt=""
                width={26}
                height={26}
                aria-hidden="true"
              /> */}
              <span className="text-[1.2rem] font-semibold tracking-tight text-[#1A1A1A]">
                Trustpilot
              </span>
            </div>

            {/* Score row */}
            <div className="flex items-center gap-4">
              <span className="font-display font-semibold text-[3.5rem] leading-none text-[#009962]">
                {rating}
              </span>
              <div className="flex flex-col gap-1.5">
                {/* 5 green stars */}
                {(() => {
                  const val = parseFloat(rating.replace(",", "."));
                  const full = Math.floor(val);
                  const pct = Math.round((val - full) * 100);
                  return (
                    <div className="flex justify-between" aria-label={`${rating} von 5 Sternen`}>
                      {[0,1,2,3,4].map(i => {
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

        {/* Wrapper clips the Trustpilot footer text via a fade overlay */}
        <div className="relative">
          <div
            className="trustpilot-widget"
            data-locale="de-DE"
            data-template-id={TEMPLATE_SLIDER}
            data-businessunit-id={BUSINESS_UNIT_ID}
            data-style-height="240px"
            data-style-width="100%"
            data-theme="light"
            data-stars="4,5"
          >
            <a
              href="https://www.trustpilot.com/review/www.tm.org"
              target="_blank"
              rel="noopener noreferrer"
              className="sr-only"
            >
              Trustpilot
            </a>
          </div>
          {/* Fade out the widget footer text */}
          <div
            className="absolute bottom-0 left-0 right-0 h-22 pointer-events-none"
            style={{ background: "linear-gradient(to top, #EFF6FF 60%, transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
