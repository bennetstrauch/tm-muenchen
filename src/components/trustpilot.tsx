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
    <section className="bg-[#F6EDE5] px-6 py-16 sm:py-20">
      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="lazyOnload"
      />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-8">
            Was andere sagen
          </h2>

          {/* Rating + Trustpilot branding */}
          <div className="inline-flex flex-col items-center gap-4">

            {/* Exzellent + Trustpilot badge */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#D8E4EE] bg-[#F9F7E9]">
              <span className="text-[0.8rem] text-[#1A3352] font-medium">
                Exzellent
              </span>
              <span className="text-[#C8D8E8] text-xs">|</span>
              <Image
                src="/trustpilot-star.png"
                alt=""
                width={26}
                height={26}
                aria-hidden="true"
              />
              <span className="text-[0.8rem] font-semibold tracking-tight text-[#1A1A1A]">
                Trustpilot
              </span>
            </div>

            {/* Score row */}
            <div className="flex items-center gap-4">
              <span className="font-display font-light text-[3.5rem] leading-none text-[#1A3352]">
                {rating}
              </span>
              <div className="flex flex-col items-start gap-1.5">
                {/* 5 green stars */}
                <div className="flex gap-0.5" aria-label="4,8 von 5 Sternen">
                  {[0,1,2,3,4].map(i => (
                    <svg key={i} width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                      <rect width="24" height="24" rx="2" fill="#00B67A"/>
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        fill="white"
                      />
                    </svg>
                  ))}
                </div>
                <span className="text-[0.82rem] text-[#1A3352]/70">
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
            style={{ background: "linear-gradient(to top, #F6EDE5 60%, transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
