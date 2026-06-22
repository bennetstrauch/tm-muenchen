import ThemePage from "@/components/theme-page";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const tenant = await getCurrentTenant();
  return {
    title: `TM ${tenant.city} – Erschöpfung überwinden mit Transzendentaler Meditation`,
    description: `Leer, obwohl du gar nichts getan hast? TM gibt dir Zugang zu echter innerer Stille – nicht als Technik, sondern als natürlicher Zustand. Kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default function ErschoepfungPage() {
  return <ThemePage theme="erschoepfung" />;
}
