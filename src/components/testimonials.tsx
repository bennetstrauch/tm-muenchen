import Image from "next/image";
import { type Testimonial } from "../content";

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const t = testimonials[0];
  if (!t) return null;

  return (
    <section
      className="relative overflow-hidden bg-[#1A3352]"
      style={{ minHeight: "min(45vw, 340px)" }}
    >
      {t.image && (
        <Image
          src={t.image}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      )}

      {/* Top blend — fades from hero background into the image */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#F9F7E9] to-transparent z-10" />

      {/* Bottom gradient for quote legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A3352]/90 via-[#1A3352]/40 to-transparent" />

      {/* Quote */}
      <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-8 pt-24 sm:px-16 sm:pb-12 max-w-3xl mx-auto">
        <span
          className="font-display text-[3rem] leading-none text-[#F0C814]/80 select-none -mb-2"
          aria-hidden="true"
        >
          „
        </span>
        <p className="font-display font-light italic text-[1.35rem] sm:text-[1.75rem] text-white leading-snug">
          {t.quote}
        </p>
        <div className="flex items-center gap-3 mt-5">
          <span className="w-6 h-px bg-[#F0C814]" aria-hidden="true" />
          <span className="text-sm text-white/70 tracking-wide">
            {t.name}
            {t.detail && <span className="text-white/40"> · {t.detail}</span>}
          </span>
        </div>
      </div>
    </section>
  );
}
