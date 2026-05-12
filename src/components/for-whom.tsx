import React from "react";
import Carousel from "./carousel";
import { content } from "../content";

function ForWhomDescription({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => l.startsWith("•"));
  const closing = lines.find((l) => !l.startsWith("•"));
  if (bullets.length === 0) {
    return <p className="text-base text-[#3D5573] leading-relaxed">{text}</p>;
  }
  return (
    <div>
      <ul className="space-y-1.5 mb-3">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm text-[#3D5573] leading-relaxed">
            <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[#BCA075]" />
            <span>{b.replace(/^•\s*/, "")}</span>
          </li>
        ))}
      </ul>
      {closing && (
        <p className="text-sm text-[#1A3352] font-medium leading-relaxed border-t border-[#E5EAF0] pt-3">
          {closing}
        </p>
      )}
    </div>
  );
}

export default function ForWhom({
  activeIndex,
  onActiveIndexChange,
  tabSlot,
}: {
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  tabSlot?: React.ReactNode;
}) {
  const { forWhom } = content;

  return (
    <section id="fuer-wen" className="section bg-[#EFF6FF]">
      <div className="section-inner">

        <div className="text-center mb-8">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#3D5573] mb-4">
            Für dich
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight">
            {forWhom.heading}
          </h2>
        </div>

        {tabSlot}

        <Carousel arrowOffsetPx={110} activeIndex={activeIndex} onIndexChange={onActiveIndexChange}>
          {forWhom.items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl px-7 py-6">
              <div className="mb-3 text-center">
                <h3 className="font-[family-name:var(--font-jakarta)] font-semibold text-[1.2rem] text-[#1A3352] leading-snug">
                  {item.title}
                </h3>
              </div>
              <ForWhomDescription text={item.description} />
            </div>
          ))}
        </Carousel>

      </div>
    </section>
  );
}
