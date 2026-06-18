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

      {/* Photo with name/role overlay */}
      <div className="relative w-full h-52 flex-shrink-0">
        <Image
          src={testimonial.photoUrl}
          alt={testimonial.name}
          fill
          className="object-cover"
          style={{ objectPosition: testimonial.photoPosition ?? "top" }}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        {/* Bottom gradient + name/role */}
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-3">
          <p className="text-white font-semibold text-sm leading-tight">{testimonial.name}</p>
          <p className="text-white/70 text-xs mt-0.5">{testimonial.role}</p>
        </div>
      </div>

      {/* Quote area */}
      <div className="px-6 pt-4 pb-5 flex flex-col flex-1 relative">
        {/* Decorative closing quote — top right */}
        <span
          className="absolute top-1 right-4 font-display text-[4.5rem] leading-none text-[#1A3352]/10 select-none pointer-events-none"
          aria-hidden="true"
        >
          "
        </span>

        <p className="text-base text-[#3D5573] leading-relaxed flex-1 relative z-10">
          „{quote}
          {expanded && extended && <> {extended}</>}
        </p>

        {extended && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-2 inline-flex items-center gap-1 text-[0.7rem] tracking-[0.12em] uppercase text-[#1A3352]/50 hover:text-[#1A3352] transition-colors duration-200 self-start focus-visible:outline-none"
          >
            {expanded ? <>{t("collapse")} <span>↑</span></> : <>{t("readMore")} <span>↓</span></>}
          </button>
        )}

        {testimonial.sourceUrl && (
          <a
            href={testimonial.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[0.7rem] text-[#1A3352]/40 hover:text-[#1A3352]/70 transition-colors self-start"
          >
            {t("sourceLabel")} <ExternalLinkIcon />
          </a>
        )}
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
