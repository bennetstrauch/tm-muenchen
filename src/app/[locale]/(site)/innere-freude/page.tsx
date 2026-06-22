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
    title: `TM ${tenant.city} – Innere Freude durch Transzendentale Meditation`,
    description: `Entdecke den Ozean unbegrenzter Freude in dir. TM gibt dir direkten, mühelosen Zugang zu deiner innersten Natur – kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default async function InnereFraudePage() {
  const [tenant, locale] = await Promise.all([getCurrentTenant(), getLocale()]);
  const { emailHref } = resolveContactLinks(tenant);
  const events = await getEvents(tenant.tmw_center_ids);
  const nextDates = formatNextDates(events, 2, locale);

  return (
    <main>
      <PageClient
        initialTheme="innere-freude"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} emailHref={emailHref} /></>}
      />
      <Testimonials testimonials={getTestimonials("innere-freude")} />
      <WhyTm />
      <WasAndereSagen />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
