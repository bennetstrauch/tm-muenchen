import ThemePage from "@/components/theme-page";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const tenant = await getCurrentTenant();
  return {
    title: `TM ${tenant.city} – Innere Freude durch Transzendentale Meditation`,
    description: `Entdecke den Ozean unbegrenzter Freude in dir. TM gibt dir direkten, mühelosen Zugang zu deiner innersten Natur – kostenloser Info-Termin in ${tenant.city}.`,
  };
}

export default function InnereFraudePage() {
  return <ThemePage theme="innere-freude" />;
}
