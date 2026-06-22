import ThemePage from "@/components/theme-page";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const tenant = await getCurrentTenant();
  return {
    title: `TM ${tenant.city} – Fokus und Klarheit durch Transzendentale Meditation`,
    description: `Dein Kopf ist voll – aber nicht klar? TM lässt Ordnung von selbst entstehen: klarer Fokus, ruhigerer Geist. Kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default function FokusPage() {
  return <ThemePage theme="fokus" />;
}
