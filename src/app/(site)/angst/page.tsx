import PageClient from "@/components/page-client";
import TrustBadges from "@/components/trust-badges";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import Testimonials from "@/components/testimonials";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import WissenschaftSection from "@/components/wissenschaft";
import AbschlussCta from "@/components/abschluss-cta";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTestimonials } from "@/content";

export const metadata = {
  title: "TM München – Innere Unruhe und Angst mit Transzendentaler Meditation",
  description:
    "Innere Unruhe, die einfach nicht aufhört? TM beruhigt das Nervensystem von innen — ohne Willenskraft, ohne Konzentration. Kostenloser Infoabend in München.",
};

export default async function AngstPage() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient initialTheme="angst" nextDates={nextDates} />
      <TrustBadges />
      <Testimonials testimonials={getTestimonials("angst")} />
      <WhyTm />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <InfoabendPreview />
      <Events events={events} />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
