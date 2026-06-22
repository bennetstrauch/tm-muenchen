import PageClient from "@/components/page-client";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import WasAndereSagen from "@/components/was-andere-sagen";
import Testimonials from "@/components/testimonials";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import WissenschaftSection from "@/components/wissenschaft";
import AbschlussCta from "@/components/abschluss-cta";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTestimonials } from "@/content";
import { getCurrentTenant } from "@/lib/tenant";
import { resolveContactLinks } from "@/lib/contact";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  const tenant = await getCurrentTenant();
  return {
    title: `TM ${tenant.city} – Innere Unruhe und Angst mit Transzendentaler Meditation`,
    description: `Innere Unruhe, die einfach nicht aufhört? TM beruhigt das Nervensystem von innen – ohne Willenskraft, ohne Konzentration. Kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default async function AngstPage() {
  const [tenant, locale] = await Promise.all([getCurrentTenant(), getLocale()]);
  const { emailHref } = resolveContactLinks(tenant);
  const events = await getEvents(tenant.tmw_center_ids);
  const nextDates = formatNextDates(events, 2, locale);

  return (
    <main>
      <PageClient
        initialTheme="angst"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} emailHref={emailHref} /></>}
      />
      <Testimonials testimonials={getTestimonials("angst")} />
      <WhyTm />
      <WasAndereSagen />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
