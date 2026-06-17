import { getLocale } from 'next-intl/server';
import { getCurrentTenant } from '@/lib/tenant';
import { getTranslation } from '@/lib/translate';

export default async function TopBarLogo() {
  const [tenant, locale] = await Promise.all([getCurrentTenant(), getLocale()]);

  const logoSrc = tenant.logo_url ?? '/tm-logo.svg';

  let cityLabel: React.ReactNode;
  if (tenant.logo_label) {
    const label =
      tenant.active_locales.length > 1
        ? await getTranslation(tenant.logo_label, locale, 'logo label')
        : tenant.logo_label;
    cityLabel = (
      <span className="text-[#1A3352]/75 font-light tracking-[0.18em] text-[0.875rem] uppercase">
        {label}
      </span>
    );
  } else {
    cityLabel = (
      <span className="flex items-center gap-1.5">
        <svg width="13" height="16" viewBox="0 0 10 13" fill="none" aria-hidden="true" className="opacity-60 flex-shrink-0">
          <path d="M5 0.5C2.515 0.5 0.5 2.515 0.5 5c0 3.375 4.5 7.5 4.5 7.5s4.5-4.125 4.5-7.5C9.5 2.515 7.485 0.5 5 0.5z" stroke="#1A3352" strokeWidth="0.75" fill="none" />
          <circle cx="5" cy="5" r="1.5" stroke="#1A3352" strokeWidth="0.75" fill="none" />
        </svg>
        <span className="text-[#1A3352]/75 font-light tracking-[0.18em] text-[0.875rem] uppercase">
          {tenant.city}
        </span>
      </span>
    );
  }

  return (
    <a
      href="/"
      aria-label="TM München – Startseite"
      className="flex-1 flex items-center justify-center gap-3"
    >
      <img src={logoSrc} alt="Transcendental Meditation" className="h-6 opacity-80" />

      <span className="w-px h-4 bg-[#1A3352]/20 flex-shrink-0" aria-hidden="true" />

      {cityLabel}
    </a>
  );
}
