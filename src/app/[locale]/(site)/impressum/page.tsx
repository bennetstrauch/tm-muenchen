import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentTenant } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Impressum | TM München",
};

export default async function ImpressumPage() {
  const [locale, t, tenant] = await Promise.all([
    getLocale(),
    getTranslations("LegalPages"),
    getCurrentTenant(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-20">

        {locale !== "de" && (
          <div className="mb-10 px-4 py-3 rounded-lg bg-[#1A3352]/6 text-sm text-[#1A3352]/70">
            {t("localeNotice")}
          </div>
        )}

        <h1 className="font-display font-light text-[2rem] text-[#1A3352] mb-12">
          Impressum
        </h1>

        {(() => {
          const content = tenant.impressum_content?.trim();
          if (!content) return <MuenchenImpressum contactEmail={tenant.contact_email} />;
          if (content.startsWith('<')) return (
            <div
              className="text-sm text-[#1A3352]/75 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          );
          return (
            <p className="text-sm text-[#1A3352]/75 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          );
        })()}

      </div>
    </main>
  );
}

function MuenchenImpressum({ contactEmail }: { contactEmail: string }) {
  return (
    <div className="space-y-10 text-sm text-[#1A3352]/75 leading-relaxed">

      <section>
        <Eyebrow>Angaben gemäß § 5 TMG</Eyebrow>
        <p>
          Transzendentale Meditation München e.V.<br />
          Guldeinstraße 47<br />
          80639 München<br />
          Deutschland
        </p>
      </section>

      <section>
        <Eyebrow>Kontakt</Eyebrow>
        <p>
          Telefon:{" "}
          <a href="tel:+491637354836" className="hover:text-[#1A3352] transition-colors">
            +49 163 7354 836
          </a>
          <br />
          E-Mail:{" "}
          <a href={`mailto:${contactEmail}`} className="hover:text-[#1A3352] transition-colors">
            {contactEmail}
          </a>
        </p>
      </section>

      <section>
        <Eyebrow>Vertretungsberechtigter Vorstand</Eyebrow>
        <p>
          Christoph Färber (1. Vorsitzender)<br />
          Wolfgang Arden (2. Vorsitzender)
        </p>
      </section>

      <section>
        <Eyebrow>Vereinsregister</Eyebrow>
        <p>
          Eingetragen im Vereinsregister des Amtsgerichts München<br />
          Registernummer: <span className="italic text-[#1A3352]/45">14188</span>
        </p>
      </section>

      <section>
        <Eyebrow>Zugehörigkeit</Eyebrow>
        <p>
          Transzendentale Meditation München e.V. ist Teil des nationalen TM-Netzwerks
          und arbeitet in Zusammenarbeit mit und unter Lizenz der nationalen Organisation
          für Transzendentale Meditation (
          <a
            href="https://www.meditation.de"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1A3352] transition-colors"
          >
            meditation.de
          </a>
          ).
        </p>
      </section>

      <section>
        <Eyebrow>Inhaltlich verantwortlich nach § 18 Abs. 2 MStV</Eyebrow>
        <p>
          Bennet Strauch<br />
          Guldeinstraße 47<br />
          80639 München
        </p>
      </section>

    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.65rem] tracking-[0.22em] uppercase text-[#1A3352]/40 font-medium mb-3">
      {children}
    </p>
  );
}
