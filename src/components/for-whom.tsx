import { content } from "../content";

export default function ForWhom() {
  const { forWhom } = content;

  return (
    <section className="bg-[#F6EDE5] px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-14">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#5C7A97] mb-4">
            Für dich?
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight">
            {forWhom.heading}
          </h2>
        </div>

        <ul className="flex flex-col gap-4">
          {forWhom.items.map((item, i) => (
            <li key={i} className="bg-[#F9F7E9] rounded-2xl px-7 py-6 flex gap-5">
              <span
                className="font-display font-light text-[2.25rem] leading-none select-none w-8 shrink-0 mt-0.5"
                style={{ color: "rgb(240 200 20 / 0.9)" }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-display font-light text-[1.2rem] text-[#1A3352] leading-snug mb-2">
                  {item.title}
                </h3>
                <p className="text-base text-[#5C7A97] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
