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
import Courses from "@/components/courses";
import { getEvents, formatNextDates } from "@/lib/events";
import { getCourses } from "@/lib/courses";
import { getLocale } from "next-intl/server";
import { getTeachers } from "@/lib/teachers";
import { getTestimonials } from "@/content";
import { getCurrentTenant } from "@/lib/tenant";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  return {
    title: `Meditation lernen in ${tenant.city} – Transzendentale Meditation (TM)`,
    description: `Lerne Transzendentale Meditation in ${tenant.city} – einfach, mühelos, ohne Konzentration. Kostenloser Infoabend online & vor Ort. Wissenschaftlich belegt, persönlich unterrichtet.`,
  };
}

export default async function Home() {
  const locale = await getLocale();
  const tenant = await getCurrentTenant();
  const showCourses = tenant.show_courses && tenant.course_locales.includes(locale);
  const [events, teachersRaw, courses] = await Promise.all([
    getEvents(tenant.tmw_center_ids),
    tenant.show_teachers ? getTeachers(locale, tenant) : Promise.resolve([]),
    showCourses ? getCourses(tenant.tmw_center_ids) : Promise.resolve([]),
  ]);
  const teachers = [...teachersRaw].sort(() => Math.random() - 0.5);

  const nextDates = formatNextDates(events, 2, locale);

  return (
    <main>
      <PageClient
        initialTheme="stress"
        nextDates={nextDates}
        conversionSlot={<><InfoabendPreview /><Events events={events} plzAbfrage={tenant.plz_abfrage} /></>}
      />
      <Testimonials testimonials={getTestimonials("stress")} />
      <WhyTm />
      <WasAndereSagen />
      <CenterBanner />
      <WissenschaftSection />
      {tenant.show_teachers && <Teachers teachers={teachers} centerName={tenant.center_banner_label ?? `TM Center ${tenant.city}`} />}
      <HowItWorks />
      <AbschlussCta />
      {showCourses && <Courses courses={courses} locale={locale} />}
    </main>
  );
}
