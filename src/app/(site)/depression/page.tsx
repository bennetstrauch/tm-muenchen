import PageClient from "@/components/page-client";
import TrustBadges from "@/components/trust-badges";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import Testimonials from "@/components/testimonials";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTestimonials } from "@/content";

export const metadata = {
  title: "TM München – Transzendentale Meditation bei Depression",
  description:
    "TM reduziert nachweislich Symptome von Depression und Erschöpfung — sanft, ohne Konzentration, ohne Nebenwirkungen. Kostenloser Infoabend in München.",
};

export default async function DepressionPage() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient initialTheme="depression" nextDates={nextDates} />
      <TrustBadges />
      <Testimonials testimonials={getTestimonials("depression")} />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <InfoabendPreview />
      <Events events={events} />
    </main>
  );
}
