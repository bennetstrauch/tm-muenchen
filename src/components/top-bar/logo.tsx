export default function TopBarLogo() {
  return (
    <a
      href="/"
      aria-label="TM München – Startseite"
      className="flex-1 flex items-center justify-center gap-3"
    >
      <img src="/tm-logo.svg" alt="Transcendental Meditation" className="h-5 opacity-80" />

      <span className="w-px h-4 bg-[#1A3352]/20 flex-shrink-0" aria-hidden="true" />

      <span className="flex items-center gap-1.5">
        <svg width="12" height="15" viewBox="0 0 10 13" fill="none" aria-hidden="true" className="opacity-60 flex-shrink-0">
          <path d="M5 0.5C2.515 0.5 0.5 2.515 0.5 5c0 3.375 4.5 7.5 4.5 7.5s4.5-4.125 4.5-7.5C9.5 2.515 7.485 0.5 5 0.5z" stroke="#1A3352" strokeWidth="0.75" fill="none" />
          <circle cx="5" cy="5" r="1.5" stroke="#1A3352" strokeWidth="0.75" fill="none" />
        </svg>
        <span className="text-[#1A3352]/75 font-light tracking-[0.18em] text-[0.8rem] uppercase">
          München
        </span>
      </span>
    </a>
  );
}
