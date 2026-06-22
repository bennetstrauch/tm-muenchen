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
    title: `TM ${tenant.city} – Besser schlafen mit Transzendentaler Meditation`,
    description: `Schläfst du eigentlich? TM bringt deinem Nervensystem die Tiefenruhe, die Schlaf allein oft nicht mehr schafft. Kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default async function SchlafPage() {
  const [tenant, locale] = await Promise.all([getCurrentTenant(), getLocale()]);
  const { emailHref } = resolveContactLinks(tenant);
  const events = await getEvents(tenant.tmw_center_ids);
  const nextDates = formatNextDates(events, 2, locale);

  return (
    <main>
      <PageClient
        initialTheme="schlaf"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} emailHref={emailHref} /></>}
      />
      <Testimonials testimonials={getTestimonials("schlaf")} />
      <WhyTm />
      <WasAndereSagen />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
