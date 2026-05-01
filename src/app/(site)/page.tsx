import PageClient from "@/components/page-client";
import Testimonials from "@/components/testimonials";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Trustpilot from "@/components/trustpilot";
import CenterBanner from "@/components/center-banner";
import Events from "@/components/events";
import Teachers from "@/components/teachers";
import { getEvents } from "@/lib/events";
import { getTrustpilotStats } from "@/lib/trustpilot";
import { getTeachers } from "@/lib/teachers";
import { getTestimonials } from "@/content";

export default async function Home() {
  const [events, trustpilot, teachers] = await Promise.all([
    getEvents(),
    getTrustpilotStats(),
    getTeachers(),
  ]);

  const nextDates = events.slice(0, 3).map(e => {
    const d = new Date(`${e.date}T12:00:00`);
    const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');
    return `${weekday}, ${e.time}`;
  });

  return (
    <main>
      <PageClient initialTheme="stress" nextDates={nextDates} />
      <Testimonials testimonials={getTestimonials("stress")} />
      <WhyTm />
      <HowItWorks />
      <Trustpilot rating={trustpilot.rating} reviewCount={trustpilot.reviewCount} />
      <CenterBanner />
      <Events events={events} />
      <Teachers teachers={teachers} />
    </main>
  );
}
