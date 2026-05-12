const badges = [
  "Persönlich unterrichtet",
  "Einfach erlernbar",
  "Keine Konzentration nötig",
  "Ohne Gedanken stoppen",
  "Von Millionen weltweit praktiziert",
  "400+ wissenschaftliche Studien",
];

export default function TrustBadges() {
  return (
    <div className="bg-[#FAFAF8] border-b border-[#E8E4DC] py-5">
      <div className="px-5 md:px-0">
        <ul
          className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2"
          aria-label="Merkmale von Transzendentaler Meditation"
        >
          {badges.map((label) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.15em] uppercase font-medium text-[#1A3352]/70"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <circle cx="5" cy="5" r="4.5" stroke="#BCA075" />
                <path
                  d="M2.5 5L4 6.5L7.5 3"
                  stroke="#BCA075"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
