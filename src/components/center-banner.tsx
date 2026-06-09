import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getCurrentTenant } from "@/lib/tenant";

function LotusIcon() {
  return (
    <svg width="38" height="32" viewBox="0 0 38 32" fill="none" aria-hidden="true">
      <path
        d="M19 28C19 28 13 19 13 12C13 7.5 15.5 5 19 5C22.5 5 25 7.5 25 12C25 19 19 28 19 28Z"
        fill="white" fillOpacity="0.92"
      />
      <path
        d="M19 28C19 28 7 21 5 14C4 9.5 6.5 6.5 10 6.5C13.5 6.5 17 10 17 14C17 20 19 28 19 28Z"
        fill="white" fillOpacity="0.48"
      />
      <path
        d="M19 28C19 28 31 21 33 14C34 9.5 31.5 6.5 28 6.5C24.5 6.5 21 10 21 14C21 20 19 28 19 28Z"
        fill="white" fillOpacity="0.48"
      />
      <path
        d="M7 30.5Q19 26 31 30.5"
        stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

export default async function CenterBanner() {
  const [t, tenant] = await Promise.all([getTranslations("CenterBanner"), getCurrentTenant()]);
  const imageSrc = tenant.center_image_url ?? "/center-default.jpg";

  return (
    <section className="relative overflow-hidden" aria-label={t("ariaLabel")}>
      <div className="relative aspect-[3/2] sm:aspect-[16/7] w-full">
        <Image
          src={imageSrc}
          alt={`Das Team des TM Center ${tenant.city}`}
          fill
          className="object-cover object-top"
          sizes="100vw"
          priority={false}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#1A3352]/15 via-[#1A3352]/20 to-[#1A3352]/75" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 sm:pb-14 px-6 text-center">
          <div className="mb-4 drop-shadow-sm">
            <LotusIcon />
          </div>

          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-white/65 mb-3">
            {t("eyebrow")}
          </p>

          <h2 className="font-display font-light text-[1.9rem] sm:text-[2.75rem] text-white leading-tight">
            {t("line1")}
          </h2>
          <p className="font-display font-light italic text-[1.9rem] sm:text-[2.75rem] text-white/90 leading-tight">
            {t("line2")}
          </p>
        </div>
      </div>
    </section>
  );
}
