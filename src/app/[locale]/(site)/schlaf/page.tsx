import ThemePage from "@/components/theme-page";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const tenant = await getCurrentTenant();
  return {
    title: `TM ${tenant.city} – Besser schlafen mit Transzendentaler Meditation`,
    description: `Schläfst du eigentlich? TM bringt deinem Nervensystem die Tiefenruhe, die Schlaf allein oft nicht mehr schafft. Kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default function SchlafPage() {
  return <ThemePage theme="schlaf" />;
}
