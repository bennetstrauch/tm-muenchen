import PageClient from "@/components/page-client";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import WasAndereSagen from "@/components/was-andere-sagen";
import Testimonials from "@/components/testimonials";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import WissenschaftSection from "@/components/wissenschaft";
import AbschlussCta from "@/components/abschluss-cta";
import { getEvents, formatNextDates } from "@/lib/events";
import { getTestimonials } from "@/content";

export const metadata = {
  title: "TM München – Besser schlafen mit Transzendentaler Meditation",
  description:
    "Schläfst du eigentlich? TM bringt deinem Nervensystem die Tiefenruhe, die Schlaf allein oft nicht mehr schafft. Kostenloser Infoabend in München.",
};

export default async function SchlafPage() {
  const events = await getEvents();

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient
        initialTheme="schlaf"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} /></>}
      />
      <Testimonials testimonials={getTestimonials("schlaf")} />
      <WhyTm />
      <WasAndereSagen />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
