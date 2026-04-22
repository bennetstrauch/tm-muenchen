import PageClient from "@/components/page-client";
import Testimonials from "@/components/testimonials";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import Events from "@/components/events";
import { getEvents } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTestimonials } from "@/content";

export default async function Home() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);

  return (
    <main>
      <PageClient initialTheme="stress" />
      <Testimonials testimonials={getTestimonials("stress")} />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <Events events={events} />
    </main>
  );
}
