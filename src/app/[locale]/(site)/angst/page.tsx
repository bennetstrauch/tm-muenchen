import ThemePage from "@/components/theme-page";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const tenant = await getCurrentTenant();
  return {
    title: `TM ${tenant.city} – Innere Unruhe und Angst mit Transzendentaler Meditation`,
    description: `Innere Unruhe, die einfach nicht aufhört? TM beruhigt das Nervensystem von innen – ohne Willenskraft, ohne Konzentration. Kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default function AngstPage() {
  return <ThemePage theme="angst" />;
}
