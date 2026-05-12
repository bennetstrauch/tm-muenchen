import PageClient from "@/components/page-client";
import TrustBadges from "@/components/trust-badges";
import Testimonials from "@/components/testimonials";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import CenterBanner from "@/components/center-banner";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import Teachers from "@/components/teachers";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTeachers } from "@/lib/teachers";
import { getTestimonials } from "@/content";

export default async function Home() {
  const [events, trustpilot, teachers] = await Promise.all([
    getEvents(),
    getTrustpilotStats(),
    getTeachers(),
  ]);

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient initialTheme="stress" nextDates={nextDates} />
      <TrustBadges />
      <Testimonials testimonials={getTestimonials("stress")} />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <CenterBanner />
      <InfoabendPreview />
      <Events events={events} />
      <Teachers teachers={teachers} />
    </main>
  );
}
