const contentPoints = [
  "Was TM ist und woher sie kommt",
  "Wie die Technik funktioniert und was sie von anderen unterscheidet",
  "Wie TM für dich persönlich passen kann und welche Wirkung du erwarten kannst",
  "Raum für deine persönlichen Fragen",
];

const infoBoxes = [
  { label: "Format", value: "30 Min. · Online" },
  { label: "Kosten", value: "Kostenlos & unverbindlich" },
];

export default function InfoabendPreview() {
  return (
    <section
      id="infoabend"
      className="section bg-[#FAFAF8] border-t border-[#E8E4DC]"
      aria-labelledby="infoabend-heading"
    >
      <div className="section-inner">

        {/* Heading */}
        <div className="text-center mb-8">
          <h2
            id="infoabend-heading"
            className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight"
          >
            So läuft der Infoabend ab
          </h2>
        </div>

        {/* Info cards — scannable facts before the agenda */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {infoBoxes.map(({ label, value }) => (
            <div
              key={label}
              className="
                bg-white border-l-[3px] border-[#BCA075]
                rounded-r-xl
                px-5 py-4
                shadow-sm
              "
            >
              <p className="text-[0.6rem] tracking-[0.22em] uppercase text-[#BCA075] mb-1 font-medium">
                {label}
              </p>
              <p className="text-[#1A3352] text-base font-medium leading-snug">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Agenda bullet points */}
        <ul className="flex flex-col gap-4" aria-label="Inhalte des Infoabends">
          {contentPoints.map((point) => (
            <li key={point} className="flex items-start gap-3">
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
              <span className="text-base text-[#1A3352]/80 leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
