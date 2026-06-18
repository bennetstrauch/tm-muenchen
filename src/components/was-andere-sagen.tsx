"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Carousel from "./carousel";
import { ownTestimonials, type OwnTestimonial } from "../content";

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: OwnTestimonial;
  index: number;
}) {
  const t = useTranslations("WasAndereSagen");
  const [expanded, setExpanded] = useState(false);

  const quote = t(`quote${index}` as Parameters<typeof t>[0]);
  const extended = testimonial.hasExtendedQuote
    ? t(`extendedQuote${index}` as Parameters<typeof t>[0])
    : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col">
      <div className="relative w-full h-52 flex-shrink-0">
        <Image
          src={testimonial.photoUrl}
          alt={testimonial.name}
          fill
          className="object-cover object-top"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>

      <div className="px-6 py-5 flex flex-col flex-1">
        <p className="text-base text-[#3D5573] leading-relaxed flex-1">
          „{quote}
          {expanded && extended && (
            <> {extended}</>
          )}„
        </p>

        {extended && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-2 inline-flex items-center gap-1 text-[0.7rem] tracking-[0.12em] uppercase text-[#1A3352]/50 hover:text-[#1A3352] transition-colors duration-200 self-start focus-visible:outline-none"
          >
            {expanded ? <>{t("collapse")} <span>↑</span></> : <>{t("readMore")} <span>↓</span></>}
          </button>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#1A3352]">
            {testimonial.name}
            <span className="font-normal text-[#6B7A8D]"> · {testimonial.role}</span>
          </span>
          {testimonial.sourceUrl && (
            <a
              href={testimonial.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[0.7rem] text-[#1A3352]/40 hover:text-[#1A3352]/70 transition-colors whitespace-nowrap"
            >
              {t("sourceLabel")} <ExternalLinkIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WasAndereSagen() {
  const t = useTranslations("WasAndereSagen");

  const mobileSlides = ownTestimonials.map((testimonial, i) => (
    <TestimonialCard key={i} testimonial={testimonial} index={i} />
  ));

  const desktopSlides = Array.from(
    { length: Math.ceil(ownTestimonials.length / 2) },
    (_, i) => (
      <div key={i} className="grid grid-cols-2 gap-4">
        {ownTestimonials.slice(i * 2, i * 2 + 2).map((testimonial, j) => (
          <TestimonialCard key={j} testimonial={testimonial} index={i * 2 + j} />
        ))}
      </div>
    ),
  );

  return (
    <section className="section bg-[#EFF6FF]">
      <div className="section-inner">
        <div className="text-center mb-10">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight">
            {t("heading")}
          </h2>
        </div>

        <div className="md:hidden">
          <Carousel arrowOffsetPx={104}>{mobileSlides}</Carousel>
        </div>
        <div className="hidden md:block">
          <Carousel arrowOffsetPx={104}>{desktopSlides}</Carousel>
        </div>
      </div>
    </section>
  );
}
