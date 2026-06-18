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
  title: "TM München – Fokus und Klarheit durch Transzendentale Meditation",
  description:
    "Dein Kopf ist voll — aber nicht klar? TM lässt Ordnung von selbst entstehen: klarer Fokus, ruhigerer Geist. Kostenloser Infoabend in München.",
};

export default async function FokusPage() {
  const events = await getEvents();

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient
        initialTheme="fokus"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} /></>}
      />
      <Testimonials testimonials={getTestimonials("fokus")} />
      <WhyTm />
      <WasAndereSagen />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
