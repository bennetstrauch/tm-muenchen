import Expandable from "./expandable";
import { content } from "../content";

export default function WhyTm() {
  const { whyTm } = content;

  return (
    <section className="bg-[#faf7f2] px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#8b7355] mb-4">
            Warum TM?
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1a1208] leading-tight mb-4">
            {whyTm.heading}
          </h2>
          <p className="text-sm text-[#5c4d38] leading-relaxed max-w-md mx-auto">
            {whyTm.subheading}
          </p>
        </div>

        {/* Benefits */}
        <ul className="flex flex-col gap-0">
          {whyTm.benefits.map((benefit, i) => (
            <li
              key={i}
              className="border-t border-[#e8e0d4] pt-8 pb-8 last:border-b"
            >
              <div className="flex gap-6">
                {/* Amber number accent */}
                <span className="font-display font-light text-[2.5rem] leading-none text-[#c4962a]/25 select-none w-8 shrink-0 mt-1">
                  {i + 1}
                </span>

                <div className="flex-1">
                  <h3 className="font-display font-light text-[1.25rem] sm:text-[1.4rem] text-[#1a1208] leading-snug mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[#5c4d38] leading-relaxed">
                    {benefit.short}
                  </p>
                  <Expandable>{benefit.expanded}</Expandable>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
