import EntdeckenHero from "@/components/entdecken-hero";
import PageClient from "@/components/page-client";
import Testimonials from "@/components/testimonials";
import WhyTm from "@/components/why-tm";
import HowItWorks from "@/components/how-it-works";
import WasAndereSagen from "@/components/was-andere-sagen";
import CenterBanner from "@/components/center-banner";
import Events from "@/components/events";
import InfoabendPreview from "@/components/infoabend-preview";
import Teachers from "@/components/teachers";
import WissenschaftSection from "@/components/wissenschaft";
import AbschlussCta from "@/components/abschluss-cta";
import { getEvents } from "@/lib/events";
import { getLocale } from "next-intl/server";
import { getTeachers } from "@/lib/teachers";
import { getTestimonials } from "@/content";
import { getCurrentTenant } from "@/lib/tenant";

export default async function EntdeckenPage() {
  const locale = await getLocale();
  const tenant = await getCurrentTenant();
  const [events, teachersRaw] = await Promise.all([
    getEvents(tenant.tmw_center_ids),
    tenant.show_teachers ? getTeachers(locale, tenant) : Promise.resolve([]),
  ]);
  const teachers = [...teachersRaw].sort(() => Math.random() - 0.5);

  return (
    <main>
      <EntdeckenHero />
      <PageClient
        initialTheme="stress"
        heroSlot={null}
        conversionSlot={<><InfoabendPreview /><Events events={events} /></>}
      />
      <Testimonials testimonials={getTestimonials("stress")} />
      <WhyTm />
      <WasAndereSagen />
      <CenterBanner />
      <WissenschaftSection />
      {tenant.show_teachers && <Teachers teachers={teachers} centerName={tenant.center_banner_label ?? `TM Center ${tenant.city}`} />}
      <HowItWorks />
      <AbschlussCta />
    </main>
  );
}
