import PageClient from "@/components/page-client";
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
  title: "TM München – Besser schlafen mit Transzendentaler Meditation",
  description:
    "Schläfst du eigentlich? TM bringt deinem Nervensystem die Tiefenruhe, die Schlaf allein oft nicht mehr schafft. Kostenloser Infoabend in München.",
};

export default async function SchlafPage() {
  const [events, trustpilot] = await Promise.all([getEvents(), getTrustpilotStats()]);

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient initialTheme="schlaf" nextDates={nextDates} />
      <Testimonials testimonials={getTestimonials("schlaf")} />
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
