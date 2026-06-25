'use client';

import { useTranslations } from 'next-intl';

export default function EntdeckenHero() {
  const t = useTranslations('Entdecken');

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-8">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/videos/tm-waves.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl gap-14 sm:gap-8">
        <h1 className="font-display font-medium text-[2rem] leading-[1.3] sm:text-[clamp(2.25rem,5vh,3.5rem)] text-white">
          {t('headline')}
        </h1>

        <a
          href="#anmeldung"
          className="
            inline-flex items-center gap-2.5
            px-8 py-4 rounded-full
            bg-[#E8920A] text-[#1A3352]
            text-[0.72rem] tracking-[0.18em] uppercase font-medium
            whitespace-nowrap shadow-[0_4px_22px_rgba(232,146,10,0.4)]
            transition-all duration-300
            hover:bg-[#D47F08] hover:shadow-[0_6px_26px_rgba(232,146,10,0.5)]
          "
        >
          {t('cta')}
        </a>
      </div>
    </section>
  );
}
