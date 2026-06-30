"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TenantConfig } from "@/lib/tenant";
import type { Veranstaltung } from "@/lib/veranstaltungen";
import MeditierendenEvents from "./meditierenden-events";
import { IndividualAppointment } from "./individual-appointment";

const DEFAULT_VERTIEFUNG_URL = "https://tm-wochenende.de/tm-kraft-der-stille/";
const DEFAULT_FORTGESCHRITTEN_URL = "https://tm-wochenende.de/fortgeschritten/";

type Category = "ueberpruefung" | "vertiefung" | "treffen" | "fortgeschritten";


const CATEGORIES: { id: Category; label: string; tabLabel: string; betreff: string; showInTabs: boolean; icon: React.ReactNode }[] = [
  {
    id: "treffen",
    label: "Regelmäßige Treffen",
    tabLabel: "Regelmäßige Treffen",
    betreff: "MeditierendenTreffen",
    showInTabs: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
        <path d="M1 13c0-2.5 2-4 4.5-4M15 13c0-2.5-2-4-4.5-4M8 13c0-2.2 1.3-3.5 3-3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M5 9.5C6.5 9 7 9 8 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "ueberpruefung",
    label: "TM-Überprüfung",
    tabLabel: "TM-Überprüfung",
    betreff: "TM-Überprüfung",
    showInTabs: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "vertiefung",
    label: "Vertiefungs-Wochenende",
    tabLabel: "Wochenende",
    betreff: "Vertiefungs-Wochenende",
    showInTabs: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2L10.5 7H13.5L11 10l1 4-4-2-4 2 1-4L2.5 7h3L8 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "fortgeschritten",
    label: "Fortgeschrittenentechniken",
    tabLabel: "Fortgeschritten",
    betreff: "Fortgeschrittenentechniken",
    showInTabs: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5l1.5 3.2 3.5.5-2.5 2.5.6 3.5L8 9.5l-3.1 1.7.6-3.5L3 5.2l3.5-.5L8 1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const CARD_IMAGES: Record<Category, string> = {
  treffen: "/meditierenden/treffen.jpg",
  ueberpruefung: "/meditierenden/ueberpruefung.jpg",
  vertiefung: "/meditierenden/vertiefung.jpg",
  fortgeschritten: "/meditierenden/fortgeschritten.jpg",
};

// Vertiefung and Fortgeschritten always have a national default URL → always link out.
// Überprüfung and Treffen have no national default → show inline form unless tenant overrides.
function getExternalUrl(tenant: TenantConfig, id: Category): string | null {
  switch (id) {
    case "ueberpruefung": return tenant.meditators_ueberpruefung_url;
    case "vertiefung": return tenant.meditators_vertiefung_url ?? DEFAULT_VERTIEFUNG_URL;
    case "treffen": return tenant.meditators_treffen_url;
    case "fortgeschritten": return tenant.meditators_fortgeschrittenentechniken_url ?? DEFAULT_FORTGESCHRITTEN_URL;
  }
}

// ── Tab layout (with events) ──────────────────────────────────

function TabLayout({
  events,
  tenant,
  whatsappLink,
  contactEmail,
}: {
  events: Veranstaltung[];
  tenant: TenantConfig;
  whatsappLink?: string | null;
  contactEmail?: string | null;
}) {
  const t = useTranslations("Events");
  const formHeadings: Partial<Record<Category, string>> = {
    ueberpruefung: t("ueberpruefungHeading"),
    treffen: t("treffenHeading"),
  };
  const [activeTab, setActiveTab] = useState<"im-center" | Category>("im-center");

  function handleCategoryClick(cat: typeof CATEGORIES[number]) {
    const url = getExternalUrl(tenant, cat.id);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setActiveTab(cat.id);
    }
  }

  const tabBase = `
    flex-shrink-0 whitespace-nowrap px-4 py-3
    text-[0.78rem] tracking-[0.06em] font-medium
    border-b-2 transition-all duration-150
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BCA075] focus-visible:ring-offset-2
  `;
  const tabActive = "border-[#BCA075] text-[#1A3352]";
  const tabInactive = "border-transparent text-[#7A9BB5] hover:text-[#1A3352] hover:border-[#DBEAFE]";

  return (
    <div>
      <div className="relative">
        <div className="flex overflow-x-auto mb-6 border-b border-[#DBEAFE] scrollbar-none md:justify-center">
          <button
            onClick={() => setActiveTab("im-center")}
            className={`${tabBase} ${activeTab === "im-center" ? tabActive : tabInactive}`}
          >
            Im Center
          </button>

          {CATEGORIES.filter(cat => cat.showInTabs).map((cat) => {
            const url = getExternalUrl(tenant, cat.id);
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`${tabBase} ${isActive ? tabActive : tabInactive}`}
              >
                {cat.tabLabel}
                {url && (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="inline ml-1 opacity-40">
                    <path d="M5.5 1H9m0 0v3.5M9 1L4 6M1 4v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-white via-white/60 to-transparent md:hidden" />
      </div>

      {activeTab === "im-center" && (
        <MeditierendenEvents events={events} whatsappLink={whatsappLink} contactEmail={contactEmail} />
      )}
      {CATEGORIES.map((cat) =>
        activeTab === cat.id && !getExternalUrl(tenant, cat.id) ? (
          <div key={cat.id}>
            <IndividualAppointment initialOpen betreff={cat.betreff} heading={formHeadings[cat.id]} />
          </div>
        ) : null
      )}
    </div>
  );
}

// ── Card grid (no events) ─────────────────────────────────────

function CardGrid({ tenant }: { tenant: TenantConfig }) {
  const t = useTranslations("Events");
  const formHeadings: Partial<Record<Category, string>> = {
    ueberpruefung: t("ueberpruefungHeading"),
    treffen: t("treffenHeading"),
  };
  const [openForm, setOpenForm] = useState<Category | null>(null);

  function handleCardClick(cat: typeof CATEGORIES[number]) {
    const url = getExternalUrl(tenant, cat.id);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setOpenForm(openForm === cat.id ? null : cat.id);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {CATEGORIES.map((cat) => {
        const url = getExternalUrl(tenant, cat.id);
        const isOpen = openForm === cat.id;
        return (
          <div key={cat.id} className="rounded-2xl overflow-hidden border border-[#E8E3DA] shadow-sm">
            <button
              onClick={() => handleCardClick(cat)}
              className="flex flex-row md:flex-col w-full text-left group h-28 md:h-auto"
            >
              {/* Image: right on mobile, top on desktop */}
              <div className="w-2/5 flex-shrink-0 md:w-full md:h-44 relative overflow-hidden md:order-first">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CARD_IMAGES[cat.id]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={cat.id === "fortgeschritten" ? { objectPosition: "right center" } : undefined}
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
              <div className="flex-1 flex flex-col justify-center gap-1.5 px-5 py-4 md:px-6 md:py-5 bg-[#F8F5EF] group-hover:bg-[#F2EDE5] transition-colors">
                <div className="text-[#BCA075]">{cat.icon}</div>
                <div>
                  <p className="font-display font-semibold text-[1.05rem] md:text-[1.2rem] text-[#1A3352] leading-tight hyphens-auto" lang="de">
                    {cat.label}
                  </p>
                  {!url && (
                    <p className="text-[0.65rem] text-[#7A9BB5] mt-1 tracking-wide">Termin anfragen →</p>
                  )}
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 bg-[#F8F5EF] border-t border-[#E8E3DA]">
                <IndividualAppointment initialOpen betreff={cat.betreff} heading={formHeadings[cat.id]} />
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
  whatsappLink,
  contactEmail,
}: {
  events: Veranstaltung[];
  tenant: TenantConfig;
  whatsappLink?: string | null;
  contactEmail?: string | null;
}) {
  if (events.length > 0) {
    return (
      <TabLayout
        events={events}
        tenant={tenant}
        whatsappLink={whatsappLink}
        contactEmail={contactEmail}
      />
    );
  }
  return <CardGrid tenant={tenant} />;
}
