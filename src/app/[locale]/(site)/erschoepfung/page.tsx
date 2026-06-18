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
  title: "TM München – Erschöpfung überwinden mit Transzendentaler Meditation",
  description:
    "Leer, obwohl du gar nichts getan hast? TM gibt dir Zugang zu echter innerer Stille — nicht als Technik, sondern als natürlicher Zustand. Kostenloser Infoabend in München.",
};

export default async function ErschoepfungPage() {
  const events = await getEvents();

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient
        initialTheme="erschoepfung"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} /></>}
      />
      <Testimonials testimonials={getTestimonials("erschoepfung")} />
      <WhyTm />
      <WasAndereSagen />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
