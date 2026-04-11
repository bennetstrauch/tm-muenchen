import Expandable from "./expandable";
import { content } from "../content";

export default function WhyTm() {
  const { whyTm } = content;

  return (
    <section id="warum-tm" className="bg-[#F9F7E9] px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#5C7A97] mb-4">
            Warum TM?
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-4">
            {whyTm.heading}
          </h2>
          <p className="text-base text-[#5C7A97] leading-relaxed max-w-md mx-auto">
            {whyTm.subheading}
          </p>
        </div>

        {/* Benefits */}
        <ul className="flex flex-col gap-0">
          {whyTm.benefits.map((benefit, i) => (
            <li
              key={i}
              className="border-t border-[#D8E4EE] pt-8 pb-8 last:border-b"
            >
              <div className="flex gap-6">
                {/* Number accent */}
                <span
                  className="font-display font-light text-[2.5rem] leading-none select-none w-8 shrink-0 mt-1"
                  style={{ color: "rgb(240 200 20 / 0.6)" }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>

                <div className="flex-1">
                  <h3 className="font-display font-light text-[1.25rem] sm:text-[1.4rem] text-[#1A3352] leading-snug mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-base text-[#5C7A97] leading-relaxed">
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
