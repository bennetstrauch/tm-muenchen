import React from "react";
import Carousel from "./carousel";
import { content } from "../content";

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
    <section className="bg-[#F6EDE5] px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#5C7A97] mb-4">
            Für dich
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight">
            {forWhom.heading}
          </h2>
        </div>

        {tabSlot}

        <Carousel arrowOffsetPx={110} activeIndex={activeIndex} onIndexChange={onActiveIndexChange}>
          {forWhom.items.map((item, i) => (
            <div key={i} className="bg-[#F9F7E9] rounded-2xl px-7 py-6">
              <div className="flex gap-3 items-start mb-2">
                <span
                  className="font-display font-light text-[2.5rem] leading-none select-none flex-shrink-0"
                  style={{ color: "rgb(240 200 20 / 0.9)" }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="font-display font-light text-[1.2rem] text-[#1A3352] leading-snug pt-1">
                  {item.title}
                </h3>
              </div>
              <p className="text-base text-[#5C7A97] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </Carousel>

      </div>
    </section>
  );
}
