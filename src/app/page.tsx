import Hero from "@/components/hero";
import ForWhom from "@/components/for-whom";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import Events from "@/components/events";
import { getEvents } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";

export default async function Home() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);

  return (
    <main>
      <Hero />
      <ForWhom />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <Events events={events} />
    </main>
  );
}
