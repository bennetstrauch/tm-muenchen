import type { Metadata } from 'next';
import { getVeranstaltungen } from '@/lib/veranstaltungen';
import MeditierendenEvents from '@/components/meditierenden-events';
import { content } from '@/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Events für Meditierende – TM München',
  description: 'Gruppenmeditationen, Center-Abende, Retreats und mehr für bereits Meditierende in München.',
};

export default async function EventsPage() {
  let events = await getVeranstaltungen().catch(() => []);

  return (
    <main className="min-h-screen bg-white pt-16 pb-20">
      <div className="max-w-2xl md:max-w-4xl mx-auto px-5">

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

        <div className="mt-16 border-t border-[#DBEAFE] pt-10 text-center">
          <p className="text-sm text-[#3D5573] mb-1">Keine Events verpassen</p>
          <p className="text-[0.8rem] text-[#7A9BB5] mb-5">
            Tritt unserer WhatsApp-Community bei und erhalte Ankündigungen direkt auf dein Handy.
          </p>
          <a
            href={content.contact.whatsappCommunity}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2.5 px-6 py-3
              bg-[#F0FDF4] border border-[#22C55E]/30 text-[#166534]
              text-[0.72rem] tracking-[0.14em] uppercase font-medium rounded-full
              transition-all duration-200
              hover:bg-[#DCFCE7] hover:border-[#22C55E]/60
              hover:shadow-[0_4px_14px_rgba(34,197,94,0.15)]
            "
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1C4.134 1 1 4.134 1 8c0 1.26.338 2.442.928 3.458L1 15l3.644-.908A6.965 6.965 0 0 0 8 15c3.866 0 7-3.134 7-7s-3.134-7-7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M5.5 6.5c.167-.5.667-1.5 1.5-1.5.4 0 .667.333.833.667l.5 1c.083.167.083.333 0 .5L7.5 8c.333.667 1 1.333 1.667 1.667l.833-.833c.167-.167.333-.167.5 0l1 .5c.333.167.667.433.667.833 0 .833-1 1.333-1.5 1.5-1.667.5-4.167-1-5-3.167z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            WhatsApp Community beitreten
          </a>
        </div>

      </div>
    </main>
  );
}
