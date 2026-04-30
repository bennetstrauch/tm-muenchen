import type { Metadata } from 'next';
import { getVeranstaltungen } from '@/lib/veranstaltungen';
import MeditierendenEvents from '@/components/meditierenden-events';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Events für Meditierende – TM München',
  description: 'Gruppenmeditationen, Center-Abende, Retreats und mehr für bereits Meditierende in München.',
};

export default async function EventsPage() {
  let events = await getVeranstaltungen().catch(() => []);

  return (
    <main className="min-h-screen bg-white pt-16 pb-20">
      <div className="max-w-2xl mx-auto px-5">

        <div className="pt-1 pb-10 text-center">
          {/* <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#3D5573] mb-4">
            TM-Center München
          </p> */}
          <h1 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-3">
            Events für Meditierende
          </h1>
          <p className="text-sm text-[#3D5573] tracking-wide max-w-sm mx-auto">
            Gruppenmeditationen, Center-Abende, Retreats, ...
          </p>
        </div>

        <MeditierendenEvents events={events} />

      </div>
    </main>
  );
}
