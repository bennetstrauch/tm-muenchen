"use client";

import { useState } from "react";
import type { TenantConfig } from "@/lib/tenant";
import type { Veranstaltung } from "@/lib/veranstaltungen";
import MeditierendenEvents from "./meditierenden-events";
import { IndividualAppointment } from "./individual-appointment";

const DEFAULT_VERTIEFUNG_URL = "https://tm-wochenende.de/tm-kraft-der-stille/";
const DEFAULT_FORTGESCHRITTEN_URL = "https://tm-wochenende.de/fortgeschritten/";

type Category = "ueberpruefung" | "vertiefung" | "treffen" | "fortgeschritten";

const CATEGORIES: { id: Category; label: string; betreff: string; icon: React.ReactNode }[] = [
  {
    id: "ueberpruefung",
    label: "TM-Überprüfung",
    betreff: "TM-Überprüfung",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "vertiefung",
    label: "Vertiefungs-Wochenende",
    betreff: "Vertiefungs-Wochenende",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2L10.5 7H13.5L11 10l1 4-4-2-4 2 1-4L2.5 7h3L8 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "treffen",
    label: "Regelmäßige Treffen",
    betreff: "MeditierendenTreffen",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
        <path d="M1 13c0-2.5 2-4 4.5-4M15 13c0-2.5-2-4-4.5-4M8 13c0-2.2 1.3-3.5 3-3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M5 9.5C6.5 9 7 9 8 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "fortgeschritten",
    label: "Fortgeschrittenentechniken",
    betreff: "Fortgeschrittenentechniken",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5l1.5 3.2 3.5.5-2.5 2.5.6 3.5L8 9.5l-3.1 1.7.6-3.5L3 5.2l3.5-.5L8 1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const CARD_IMAGE = "/retreat-gruss.jpg";

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
    flex items-center gap-1.5 px-3 py-2 text-[0.7rem] tracking-[0.1em] uppercase font-medium
    rounded-lg transition-all duration-150 whitespace-nowrap
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5C3D7]
  `;
  const tabActive = "bg-[#1A3352] text-white";
  const tabInactive = "text-[#3D5573] hover:bg-[#F0F6FA] hover:text-[#1A3352]";

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-[#DBEAFE]">
        <button
          onClick={() => setActiveTab("im-center")}
          className={`${tabBase} ${activeTab === "im-center" ? tabActive : tabInactive}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 3V1.5M11 3V1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Im Center
        </button>

        {CATEGORIES.map((cat) => {
          const url = getExternalUrl(tenant, cat.id);
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`${tabBase} ${isActive ? tabActive : tabInactive}`}
            >
              {cat.icon}
              {cat.label}
              {url && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="opacity-50">
                  <path d="M5.5 1H9m0 0v3.5M9 1L4 6M1 4v5h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "im-center" && (
        <MeditierendenEvents events={events} whatsappLink={whatsappLink} contactEmail={contactEmail} />
      )}
      {CATEGORIES.map((cat) =>
        activeTab === cat.id && !getExternalUrl(tenant, cat.id) ? (
          <div key={cat.id} className="pt-2">
            <IndividualAppointment initialOpen betreff={cat.betreff} />
          </div>
        ) : null
      )}
    </div>
  );
}

// ── Card grid (no events) ─────────────────────────────────────

function CardGrid({ tenant }: { tenant: TenantConfig }) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {CATEGORIES.map((cat) => {
        const url = getExternalUrl(tenant, cat.id);
        const isOpen = openForm === cat.id;
        return (
          <div key={cat.id} className="rounded-2xl overflow-hidden border border-[#DBEAFE]">
            <button
              onClick={() => handleCardClick(cat)}
              className="relative w-full text-left group"
            >
              <div
                className="h-36 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${CARD_IMAGE})` }}
              >
                <div className="absolute inset-0 bg-[#1A3352]/50 group-hover:bg-[#1A3352]/60 transition-colors" />
                <div className="relative z-10 p-5 h-full flex flex-col justify-end">
                  <div className="flex items-center gap-2 text-white mb-0.5">
                    {cat.icon}
                    <span className="text-[0.65rem] tracking-[0.18em] uppercase font-medium">{cat.label}</span>
                    {url && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="opacity-70 ml-auto">
                        <path d="M5.5 1H9m0 0v3.5M9 1L4 6M1 4v5h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-5">
                <IndividualAppointment initialOpen betreff={cat.betreff} />
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
