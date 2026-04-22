import Carousel from "./carousel";
import Expandable from "./expandable";
import { content } from "../content";

export default function WhyTm() {
  const { whyTm } = content;

  return (
    <section id="warum-tm" className="section bg-white">
      <div className="section-inner">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#3D5573] mb-4">
            Warum TM?
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-4">
            {whyTm.heading}
          </h2>
          <p className="text-base text-[#3D5573] leading-relaxed max-w-md mx-auto">
            {whyTm.subheading}
          </p>
        </div>

        <Carousel arrowOffsetPx={145}>
          {whyTm.benefits.map((benefit, i) => (
            <div key={i} className="border-t border-b border-[#DBEAFE] pt-8 pb-8">
              <div className="flex gap-3 items-start mb-3">
                <span
                  className="font-display font-light text-[2.5rem] leading-none select-none flex-shrink-0 -mt-1.5"
                  style={{ color: "rgb(245 158 11 / 0.75)" }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="font-[family-name:var(--font-jakarta)] font-medium text-[1.2rem] text-[#1A3352] leading-snug pt-1">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-base text-[#3D5573] leading-relaxed">
                {benefit.short}
              </p>
              <Expandable>{benefit.expanded}</Expandable>
            </div>
          ))}
        </Carousel>

      </div>
    </section>
  );
}
