import PageClient from "@/components/page-client";
import TrustBadges from "@/components/trust-badges";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import Testimonials from "@/components/testimonials";
import Events from "@/components/events";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTestimonials } from "@/content";

export const metadata = {
  title: "TM München – Innere Stille durch Transzendentale Meditation",
  description:
    "Dein Kopf wird einfach nicht still? TM gibt dir mühelose, tiefe Ruhe — ohne Konzentration, ohne Gedanken stoppen. Kostenloser Infoabend in München.",
};

export default async function InnereSillePage() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);
  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient initialTheme="innere-stille" nextDates={nextDates} />
      <TrustBadges />
      <Testimonials testimonials={getTestimonials("innere-stille")} />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <Events events={events} />
    </main>
  );
}
