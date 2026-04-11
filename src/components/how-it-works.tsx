import { content } from "../content";

export default function HowItWorks() {
  const { howItWorks } = content;

  return (
    <section className="bg-[#F6EDE5] px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#5C7A97] mb-4">
            Der Weg
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-4">
            {howItWorks.heading}
          </h2>
          <p className="text-base text-[#5C7A97] leading-relaxed max-w-md mx-auto">
            {howItWorks.subheading}
          </p>
        </div>

        {/* Steps */}
        <ol className="flex flex-col gap-0">
          {howItWorks.steps.map((step, i) => (
            <li key={i} className="flex gap-6 pb-10 last:pb-0 relative">

              {/* Connector line */}
              {i < howItWorks.steps.length - 1 && (
                <div className="absolute left-[1.35rem] top-10 bottom-0 w-px bg-[#D8E4EE]" />
              )}

              {/* Number circle */}
              <div className="shrink-0 w-11 h-11 rounded-full border border-[#F0C814]/60 flex items-center justify-center z-10 bg-[#F6EDE5]">
                <span className="font-display font-light text-[0.8rem] text-[#1A3352]">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <div className="pt-2 pb-2">
                <h3 className="font-display font-light text-[1.25rem] sm:text-[1.35rem] text-[#1A3352] leading-snug mb-2">
                  {step.title}
                </h3>
                <p className="text-base text-[#5C7A97] leading-relaxed">
                  {step.description}
                </p>
              </div>

            </li>
          ))}
        </ol>

        {/* Bottom CTA nudge */}
        <div className="mt-16 text-center">
          <a
            href="#anmeldung"
            className="
              inline-flex items-center gap-3
              px-9 py-4
              bg-[#A5C3D7] text-[#1A3352]
              text-[0.7rem] tracking-[0.22em] uppercase font-medium
              rounded-full
              transition-all duration-300
              hover:bg-[#8BAAC3] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(165,195,215,0.5)]
            "
          >
            Jetzt Infovortrag besuchen
            <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
