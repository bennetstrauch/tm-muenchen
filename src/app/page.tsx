import Hero from "@/components/hero";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import Events from "@/components/events";
import { getEvents } from "@/lib/events";

export default async function Home() {
  const events = await getEvents();

  return (
    <main>
      <Hero />
      <WhyTm />
      <HowItWorks />
      <Events events={events} />
    </main>
  );
}
