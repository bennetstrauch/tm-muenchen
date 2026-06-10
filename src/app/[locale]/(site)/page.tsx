import PageClient from "@/components/page-client";
import Testimonials from "@/components/testimonials";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import CenterBanner from "@/components/center-banner";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import Teachers from "@/components/teachers";
import WissenschaftSection from "@/components/wissenschaft";
import AbschlussCta from "@/components/abschluss-cta";
import { getEvents, formatNextDates } from "@/lib/events";
import { getLocale } from "next-intl/server";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTeachers } from "@/lib/teachers";
import { getTestimonials } from "@/content";
import { getCurrentTenant } from "@/lib/tenant";

export default async function Home() {
  const locale = await getLocale();
  const tenant = await getCurrentTenant();
  const [events, trustpilot, teachersRaw] = await Promise.all([
    getEvents(tenant.tmw_center_ids),
    getTrustpilotStats(),
    getTeachers(locale, tenant),
  ]);
  const teachers = [...teachersRaw].sort(() => Math.random() - 0.5);

  const nextDates = formatNextDates(events, 2, locale);

  return (
    <main>
      <PageClient
        initialTheme="stress"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} /></>}
      />
      <Testimonials testimonials={getTestimonials("stress")} />
      <WhyTm />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <CenterBanner />
      <WissenschaftSection />
      <Teachers teachers={teachers} />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
