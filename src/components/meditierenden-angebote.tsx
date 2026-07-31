import type { ReactNode } from "react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { TenantConfig } from "@/lib/tenant";
import type { Veranstaltung } from "@/lib/veranstaltungen";
import MeditierendenEvents from "./meditierenden-events";
import { IndividualAppointment } from "./individual-appointment";
import {
  getExternalUrl,
  pathForTab,
  TAB_META,
  CATEGORY_ORDER,
  type Category,
  type Tab,
} from "@/lib/meditators-tabs";

const ICONS: Record<Category, ReactNode> = {
  treffen: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1 13c0-2.5 2-4 4.5-4M15 13c0-2.5-2-4-4.5-4M8 13c0-2.2 1.3-3.5 3-3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M5 9.5C6.5 9 7 9 8 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  ueberpruefung: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  vertiefung: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L10.5 7H13.5L11 10l1 4-4-2-4 2 1-4L2.5 7h3L8 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  ),
  fortgeschritten: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5l1.5 3.2 3.5.5-2.5 2.5.6 3.5L8 9.5l-3.1 1.7.6-3.5L3 5.2l3.5-.5L8 1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  ),
};

const CARD_IMAGES: Record<Category, string> = {
  treffen: "/meditierenden/treffen.webp",
  ueberpruefung: "/meditierenden/ueberpruefung.webp",
  vertiefung: "/meditierenden/vertiefung.webp",
  fortgeschritten: "/meditierenden/fortgeschritten.webp",
};

const ExternalArrow = (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="inline ml-1 opacity-40">
    <path d="M5.5 1H9m0 0v3.5M9 1L4 6M1 4v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TAB_BASE = `
  flex-shrink-0 whitespace-nowrap px-4 py-3
  text-[0.78rem] tracking-[0.06em] font-medium
  border-b-2 transition-all duration-150
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BCA075] focus-visible:ring-offset-2
`;
const TAB_ACTIVE = "border-[#BCA075] text-[#1A3352]";
const TAB_INACTIVE = "border-transparent text-[#7A9BB5] hover:text-[#1A3352] hover:border-[#DBEAFE]";

function tabCls(active: boolean) {
  return `${TAB_BASE} ${active ? TAB_ACTIVE : TAB_INACTIVE}`;
}

// ── Tab layout (with events) ──────────────────────────────────

async function TabLayout({
  events,
  tenant,
  active,
  whatsappLink,
  contactEmail,
}: {
  events: Veranstaltung[];
  tenant: TenantConfig;
  active: Tab;
  whatsappLink?: string | null;
  contactEmail?: string | null;
}) {
  const t = await getTranslations("Events");
  const locale = await getLocale();
  const formHeadings: Partial<Record<Category, string>> = {
    ueberpruefung: t("ueberpruefungHeading"),
    treffen: t("treffenHeading"),
  };

  return (
    <div>
      <div className="relative">
        <div className="flex overflow-x-auto mb-6 border-b border-[#DBEAFE] scrollbar-none md:justify-center">
          <Link href={pathForTab(locale, "im-center")} className={tabCls(active === "im-center")}>
            {t("tabImCenter")}
          </Link>

          {CATEGORY_ORDER.filter((id) => TAB_META[id].showInTabs).map((id) => {
            const url = getExternalUrl(tenant, id);
            const label = t(TAB_META[id].tabLabelKey);
            return url ? (
              <a key={id} href={url} target="_blank" rel="noopener noreferrer" className={tabCls(false)}>
                {label}
                {ExternalArrow}
              </a>
            ) : (
              <Link key={id} href={pathForTab(locale, id)} className={tabCls(active === id)}>
                {label}
              </Link>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-white via-white/60 to-transparent md:hidden" />
      </div>

      {active === "im-center" ? (
        <MeditierendenEvents events={events} whatsappLink={whatsappLink} contactEmail={contactEmail} />
      ) : (
        <IndividualAppointment initialOpen betreff={TAB_META[active].betreff} heading={formHeadings[active]} />
      )}
    </div>
  );
}

// ── Card grid (no events) ─────────────────────────────────────

async function CardGrid({ tenant, active }: { tenant: TenantConfig; active: Tab }) {
  const t = await getTranslations("Events");
  const locale = await getLocale();
  const formHeadings: Partial<Record<Category, string>> = {
    ueberpruefung: t("ueberpruefungHeading"),
    treffen: t("treffenHeading"),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {CATEGORY_ORDER.map((id) => {
        const url = getExternalUrl(tenant, id);
        const isOpen = active === id;
        const cardInner = (
          <>
            {/* Image: right on mobile, top on desktop */}
            <div className="w-2/5 flex-shrink-0 md:w-full md:h-44 relative overflow-hidden md:order-first">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CARD_IMAGES[id]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                style={id === "fortgeschritten" ? { objectPosition: "right center" } : undefined}
              />
              {url && (
                <div className="absolute top-3 right-3">
                  <div className="bg-white/80 rounded-full p-1.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="text-[#1A3352]">
                      <path d="M5.5 1H9m0 0v3.5M9 1L4 6M1 4v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {/* Text: left on mobile, bottom on desktop */}
            <div className="flex-1 flex flex-col justify-center gap-1.5 px-5 py-4 md:px-6 md:py-4 bg-[#F8F5EF] group-hover:bg-[#F2EDE5] transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:gap-2.5">
                <div className="text-[#BCA075] flex-shrink-0">{ICONS[id]}</div>
                <p className="font-display font-semibold text-[1.05rem] md:text-[1.1rem] text-[#1A3352] leading-tight hyphens-auto" lang={locale}>
                  {t(TAB_META[id].labelKey)}
                </p>
              </div>
              {!url && (
                <p className="text-[0.65rem] text-[#7A9BB5] tracking-wide">{t("cardRequestAppointment")}</p>
              )}
            </div>
          </>
        );
        const cardCls = "flex flex-row md:flex-col w-full text-left group h-28 md:h-auto";

        return (
          <div key={id} className="rounded-2xl overflow-hidden border border-[#E8E3DA] shadow-sm">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className={cardCls}>
                {cardInner}
              </a>
            ) : (
              <Link href={pathForTab(locale, isOpen ? "im-center" : id)} className={cardCls}>
                {cardInner}
              </Link>
            )}
            {isOpen && (
              <div className="px-6 pb-6 bg-[#F8F5EF] border-t border-[#E8E3DA]">
                <IndividualAppointment initialOpen betreff={TAB_META[id].betreff} heading={formHeadings[id]} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────

export default function MeditierendenAngebote({
  events,
  tenant,
  active,
  whatsappLink,
  contactEmail,
}: {
  events: Veranstaltung[];
  tenant: TenantConfig;
  active: Tab;
  whatsappLink?: string | null;
  contactEmail?: string | null;
}) {
  if (events.length > 0) {
    return (
      <TabLayout
        events={events}
        tenant={tenant}
        active={active}
        whatsappLink={whatsappLink}
        contactEmail={contactEmail}
      />
    );
  }
  return <CardGrid tenant={tenant} active={active} />;
}
