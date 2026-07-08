import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  return { title: `Datenschutz | TM ${tenant.city}` };
}

export default async function DatenschutzPage() {
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
          Datenschutzerklärung
        </h1>

        <div className="space-y-10 text-sm text-[#1A3352]/75 leading-relaxed">

          <section>
            <Eyebrow>Verantwortlicher</Eyebrow>
            {/* legal_entity/legal_address can still be '' for tenants awaiting
                backfill (migration 005) — render only what exists. */}
            <p className="whitespace-pre-line">
              {tenant.legal_entity && <>{tenant.legal_entity}{"\n"}</>}
              {tenant.legal_address && <>{tenant.legal_address}{"\n"}</>}
              E-Mail:{" "}
              <a href={`mailto:${tenant.contact_email}`} className="hover:text-[#1A3352] transition-colors">
                {tenant.contact_email}
              </a>
            </p>
          </section>

          <section>
            <Eyebrow>Erhobene Daten und Verarbeitungszweck</Eyebrow>
            <p>
              Wenn Sie sich über diese Website zu einem Infoabend anmelden, verarbeiten wir
              die von Ihnen angegebenen Daten (Name, E-Mail-Adresse, Telefonnummer)
              ausschließlich zur Bearbeitung Ihrer Anmeldung, zur Durchführung des Infoabends
              sowie zur Zusendung von Bestätigungs- und Erinnerungsmails.
            </p>
          </section>

          <section>
            <Eyebrow>Rechtsgrundlage</Eyebrow>
            <p>
              Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen).
            </p>
          </section>

          <section>
            <Eyebrow>Speicherdauer</Eyebrow>
            <p>
              Ihre Daten werden gelöscht, sobald sie für die Durchführung des Infoabends
              nicht mehr erforderlich sind, soweit keine gesetzlichen Aufbewahrungspflichten
              bestehen.
            </p>
          </section>

          <section>
            <Eyebrow>Eingesetzte Dienstleister</Eyebrow>
            <div className="space-y-6">

              <div>
                <p className="font-medium text-[#1A3352]/85 mb-1">Vercel Inc. (Hosting)</p>
                <p>
                  Diese Website wird auf der Plattform von Vercel Inc., 340 Pine Street,
                  Suite 701, San Francisco, CA 94104, USA gehostet. Bei jedem Seitenaufruf
                  werden Server-Logs erhoben (IP-Adresse, Browsertyp, Zeitstempel).
                  Weitere Informationen:{" "}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A3352] transition-colors">
                    vercel.com/legal/privacy-policy
                  </a>
                </p>
              </div>

              <div>
                <p className="font-medium text-[#1A3352]/85 mb-1">Resend Inc. (E-Mail-Versand)</p>
                <p>
                  Bestätigungs- und Erinnerungsmails für Veranstaltungen werden über Resend
                  (2261 Market Street STE 5685, San Francisco, CA 94114, USA) versandt.
                  Ihre E-Mail-Adresse wird hierfür an Resend übermittelt.
                  Weitere Informationen:{" "}
                  <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A3352] transition-colors">
                    resend.com/legal/privacy-policy
                  </a>
                </p>
              </div>

              <div>
                <p className="font-medium text-[#1A3352]/85 mb-1">Supabase Inc. (Datenspeicherung)</p>
                <p>
                  Lehrerprofil-, Einstellungs-, Übersetzungs- und Anmeldedaten werden bei
                  Supabase (970 Toa Payoh North, Singapore) gespeichert.
                  Weitere Informationen:{" "}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A3352] transition-colors">
                    supabase.com/privacy
                  </a>
                </p>
              </div>

              {tenant.meta_pixel_id && <div>
                <p className="font-medium text-[#1A3352]/85 mb-1">Meta Pixel (Werbe-Tracking)</p>
                <p>
                  Mit Ihrer Einwilligung verwenden wir das Meta Pixel der Meta Platforms
                  Ireland Ltd., 4 Grand Canal Square, Dublin 2, Irland. Das Pixel wird
                  ausschließlich nach Ihrer ausdrücklichen Zustimmung über den Cookie-Banner
                  geladen und übermittelt Conversion-Daten (Seitenaufruf, Formularöffnung,
                  Anmeldung) an Meta. Sie können Ihre Einwilligung jederzeit widerrufen,
                  indem Sie die Seite neu laden und im Cookie-Banner &bdquo;Ablehnen&ldquo; wählen.
                  Weitere Informationen:{" "}
                  <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A3352] transition-colors">
                    facebook.com/policy.php
                  </a>
                </p>
              </div>}

            </div>
          </section>

          <section>
            <Eyebrow>Ihre Rechte</Eyebrow>
            <p>
              Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16),
              Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
              Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Außerdem steht
              Ihnen das Recht zu, eine Beschwerde bei einer Datenschutzaufsichtsbehörde
              einzureichen.
            </p>
          </section>

          <section>
            <Eyebrow>Kontakt für Datenschutzanfragen</Eyebrow>
            <p>
              <a href={`mailto:${tenant.contact_email}`} className="hover:text-[#1A3352] transition-colors">
                {tenant.contact_email}
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.65rem] tracking-[0.22em] uppercase text-[#1A3352]/40 font-medium mb-3">
      {children}
    </p>
  );
}
