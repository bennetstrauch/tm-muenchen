import PageClient from "@/components/page-client";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import Testimonials from "@/components/testimonials";
import Events from "@/components/events";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTestimonials } from "@/content";

export const metadata = {
  title: "TM München – Innere Freude durch Transzendentale Meditation",
  description:
    "Entdecke den Ozean unbegrenzter Freude in dir. TM gibt dir direkten, mühelosen Zugang zu deiner innersten Natur — kostenloser Infovortrag in München.",
};

export default async function InnereFraudePage() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient initialTheme="innere-freude" nextDates={nextDates} />
      <Testimonials testimonials={getTestimonials("innere-freude")} />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <Events events={events} />
    </main>
  );
}
