import PageClient from "@/components/page-client";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import WasAndereSagen from "@/components/was-andere-sagen";
import Testimonials from "@/components/testimonials";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import WissenschaftSection from "@/components/wissenschaft";
import Teachers from "@/components/teachers";
import AbschlussCta from "@/components/abschluss-cta";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTestimonials } from "@/content";
import { getCurrentTenant } from "@/lib/tenant";
import { resolveContactLinks } from "@/lib/contact";
import { getTeachers } from "@/lib/teachers";
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
  const [events, teachersRaw] = await Promise.all([
    getEvents(tenant.tmw_center_ids),
    tenant.show_teachers ? getTeachers(locale, tenant) : Promise.resolve([]),
  ]);
  const teachers = [...teachersRaw].sort(() => Math.random() - 0.5);
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
      {tenant.show_teachers && <Teachers teachers={teachers} centerName={tenant.center_banner_label ?? `TM Center ${tenant.city}`} />}
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
