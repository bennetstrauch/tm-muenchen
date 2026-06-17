import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { type Testimonial } from "../content";

export default async function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const t = await getTranslations("Testimonials");
  const raw = testimonials[0];
  if (!raw) return null;

  const index = 0;
  const quote  = t(`quote${index}` as Parameters<typeof t>[0]);
  const detail = t(`detail${index}` as Parameters<typeof t>[0]);

  return (
    <section
      className="relative overflow-hidden bg-[#1A3352]"
      style={{ minHeight: "min(45vw, 340px)" }}
    >
      {raw.image && (
        <Image
          src={raw.image}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      )}

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#F9F7E9] to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A3352]/90 via-[#1A3352]/40 to-transparent" />

      <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-8 pt-24 sm:px-16 sm:pb-12 max-w-3xl mx-auto">
        <span
          className="font-display text-[3rem] leading-none text-[#F0C814]/80 select-none -translate-x-5 translate-y-1"
          aria-hidden="true"
        >
          „
        </span>
        <p className="font-display font-light italic text-[1.35rem] sm:text-[1.75rem] text-white leading-snug">
          {quote}
        </p>
        <div className="flex items-center gap-3 mt-5">
          <span className="w-6 h-px bg-[#F0C814]" aria-hidden="true" />
          <span className="text-sm text-white/70 tracking-wide">
            {raw.name}
            {detail && <span className="text-white/40"> · {detail}</span>}
          </span>
        </div>
      </div>
    </section>
  );
}
