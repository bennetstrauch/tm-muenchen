const bullets = [
  "Aktuelle Forschungsergebnisse zu Stress, Herzgesundheit und Gehirnfunktion",
  "Praktische Erfahrungen von Lehrern und Meditierenden",
  "Wie TM sich von anderen Techniken unterscheidet — und warum das wissenschaftlich messbar ist",
];

export default function WissenschaftSection() {
  return (
    <section
      className="section bg-[#1A3352]"
      aria-labelledby="wissenschaft-heading"
    >
      <div className="section-inner">

        {/* Heading block */}
        <div className="text-center mb-10">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#A5C3D7] mb-4">
            Wissenschaft & Forschung
          </p>
          <h2
            id="wissenschaft-heading"
            className="font-display font-light text-[2rem] sm:text-[2.75rem] text-white leading-tight mb-6"
          >
            TM gehört zu den am besten untersuchten Meditationstechniken weltweit
          </h2>
          <p className="text-base text-white/70 leading-relaxed max-w-lg mx-auto">
            In zahlreichen Studien an führenden Universitäten wurde untersucht, wie TM Stress,
            mentale Belastung und allgemeines Wohlbefinden beeinflusst.
          </p>
        </div>

        {/* Bullet points */}
        <ul className="flex flex-col gap-4 mb-12 max-w-lg mx-auto" aria-label="Inhalte des Infoabends zu Wissenschaft">
          {bullets.map((point) => (
            <li key={point} className="flex items-start gap-3">
              {/* Gold dot icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="shrink-0 mt-[0.2em]"
              >
                <circle cx="8" cy="8" r="7" stroke="#BCA075" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="3" fill="#BCA075" />
              </svg>
              <span className="text-base text-white leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="text-center">
          <a
            href="#anmeldung"
            className="
              inline-flex items-center gap-3
              px-9 py-4
              bg-[#A5C3D7] text-[#1A3352]
              text-[0.7rem] tracking-[0.22em] uppercase font-medium
              rounded-full
              transition-all duration-300
              hover:bg-[#8BAAC3] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(165,195,215,0.3)]
            "
          >
            Beim Infoabend mehr erfahren
            <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
