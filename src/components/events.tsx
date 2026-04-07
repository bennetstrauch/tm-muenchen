import { type TMEvent, formatEventDate } from "../lib/events";
import { content } from "../content";

export default function Events({ events }: { events: TMEvent[] }) {
  const { events: copy } = content;

  return (
    <section
      id="anmeldung"
      className="bg-white px-6 py-20 sm:py-28"
    >
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#8b7355] mb-4">
            Transzendentale Meditation · München
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1a1208] leading-tight mb-3">
            {copy.heading}
          </h2>
          <p className="text-sm text-[#8b7355] tracking-wide">
            {copy.subheading}
          </p>
        </div>

        {/* Event list */}
        {events.length === 0 ? (
          <p className="text-center text-[#5c4d38] text-sm py-8">
            {copy.empty}
          </p>
        ) : (
          <ul className="divide-y divide-[#e8e0d4]">
            {events.map((event, i) => {
              const { weekday, date } = formatEventDate(event.date);
              return (
                <li
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-7"
                >
                  {/* Date + meta */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[0.7rem] tracking-[0.15em] uppercase text-[#8b7355]">
                        {weekday}
                      </span>
                      <span className="font-display font-light text-[1.35rem] text-[#1a1208] leading-none">
                        {date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#5c4d38]">
                      <span>{event.time} Uhr</span>
                      <span className="text-[#d4c5a9]">·</span>
                      <span
                        className={`
                          text-[0.65rem] tracking-[0.12em] uppercase font-medium px-2 py-0.5 rounded-full
                          ${event.type === "Online"
                            ? "bg-[#f0f4f8] text-[#4a7090]"
                            : "bg-[#faf0e4] text-[#8b5e2a]"
                          }
                        `}
                      >
                        {event.type}
                      </span>
                      <span className="text-[#5c4d38]">{event.location}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={event.registrationUrl}
                    target={event.registrationUrl.startsWith("http") ? "_blank" : undefined}
                    rel={event.registrationUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="
                      inline-flex items-center gap-2 self-start sm:self-auto
                      px-6 py-3
                      border border-[#c4962a] text-[#c4962a]
                      text-[0.68rem] tracking-[0.18em] uppercase font-medium
                      rounded-full
                      transition-all duration-300
                      hover:bg-[#c4962a] hover:text-white hover:shadow-[0_4px_16px_rgba(196,150,42,0.25)]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4962a] focus-visible:ring-offset-2
                    "
                  >
                    {copy.cta}
                    <span aria-hidden="true" className="text-xs">→</span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
