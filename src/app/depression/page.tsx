import PageClient from "@/components/page-client";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import Events from "@/components/events";
import { getEvents } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";

export const metadata = {
  title: "TM München – Transzendentale Meditation bei Depression",
  description:
    "TM reduziert nachweislich Symptome von Depression und Erschöpfung — sanft, ohne Konzentration, ohne Nebenwirkungen. Kostenloser Infovortrag in München.",
};

export default async function DepressionPage() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);

  return (
    <main>
      <PageClient initialTheme="depression" />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <Events events={events} />
    </main>
  );
}
