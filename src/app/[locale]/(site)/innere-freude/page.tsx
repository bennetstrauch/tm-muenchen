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
  title: "TM München – Innere Freude durch Transzendentale Meditation",
  description:
    "Entdecke den Ozean unbegrenzter Freude in dir. TM gibt dir direkten, mühelosen Zugang zu deiner innersten Natur — kostenloser Infoabend in München.",
};

export default async function InnereFraudePage() {
  const events = await getEvents();

  const nextDates = formatNextDates(events);

  return (
    <main>
      <PageClient
        initialTheme="innere-freude"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} /></>}
      />
      <Testimonials testimonials={getTestimonials("innere-freude")} />
      <WhyTm />
      <WasAndereSagen />
      <WissenschaftSection />
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
