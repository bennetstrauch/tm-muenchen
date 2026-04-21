/**
 * ─────────────────────────────────────────────────
 *  WEBSITE INHALTE — hier alle Texte bearbeiten
 * ─────────────────────────────────────────────────
 *  Einfach die Werte zwischen den Anführungszeichen
 *  ändern, speichern — fertig. Kein Code-Wissen nötig.
 */

// ─────────────────────────────────────────────────
//  THEMEN — Jedes Thema hat ein eigenes Hero-Bild,
//  eine eigene Überschrift und einen eigenen Subtext.
//  forWhomIndex: welche Karte im "Für wen"-Carousel
//  standardmäßig geöffnet wird (0-basiert).
// ─────────────────────────────────────────────────
export type HeroImage = {
  src: string;
  focus?: string; // CSS object-position, e.g. "45% 30%". Defaults to "center"
};

export type Theme = {
  slug: string;
  label: string;
  headline: string[];
  subtitle: string;
  images: HeroImage[];
  forWhomIndex: number;
};

export const themes: Record<string, Theme> = {
  stress: {
    slug: "", // Haupt-URL: /
    label: "Stress",
    headline: ["Endlich wirklich abschalten.", "Ohne Anstrengung."],
    subtitle: "Erfahre besonders tiefe Ruhe",
    images: [
      { src: "/hero/stress/1.jpg",  focus: "45% 30%" },
      { src: "/hero/stress/2.jpg",  focus: "62% 25%" },
      { src: "/hero/stress/3.jpg",  focus: "65% 50%" },
      { src: "/hero/stress/4.jpg",  focus: "50% 50%" },
      { src: "/hero/stress/5.jpg",  focus: "45% 50%" },
      { src: "/hero/stress/6.jpg",  focus: "50% 45%" },
      { src: "/hero/stress/7.jpg",  focus: "45% 35%" },
      { src: "/hero/stress/8.jpg",  focus: "62% 35%" },
      { src: "/hero/stress/9.jpg",  focus: "45% 40%" },
      { src: "/hero/stress/10.jpg", focus: "45% 30%" },
      { src: "/hero/stress/11.jpg", focus: "70% 130%" },
      { src: "/hero/stress/12.jpg", focus: "35% 35%" },
      { src: "/hero/stress/13.jpg", focus: "50% 40%" },
      { src: "/hero/stress/14.jpg", focus: "70% 30%" },
      { src: "/hero/stress/15.jpg", focus: "55% 30%" },
      { src: "/hero/stress/17.jpg", focus: "55% 30%" },
      { src: "/hero/stress/18.jpg", focus: "50% 50%" },
    ],
    forWhomIndex: 0,
  },
  depression: {
    slug: "depression", // URL: /depression
    label: "Depression",
    headline: ["Wieder leicht werden.", "Ganz ohne Willenskraft."],
    subtitle: "Tiefe Ruhe für emotionale Entlastung",
    images: [
      { src: "/hero/depression/1.jpg", focus: "50% 25%" },
      { src: "/hero/stress/3.jpg",     focus: "65% 50%" },
      { src: "/hero/stress/11.jpg",    focus: "70% 130%" },
    ],
    forWhomIndex: 3,
  },
};

export type ThemeKey = "stress" | "depression";

// ─────────────────────────────────────────────────
//  ERFAHRUNGSBERICHTE — Zitate von Meditierenden.
//  Jedes Thema kann eigene Testimonials haben.
//  Fehlt ein Eintrag, werden die Standard-Testimonials gezeigt.
// ─────────────────────────────────────────────────
export type Testimonial = {
  quote: string;
  name: string;
  detail?: string; // z.B. "Lehrerin, 42" oder "München"
  image?: string;  // Pfad im /public Ordner
};

export const defaultTestimonials: Testimonial[] = [
  {
    quote: "Transzendentale Meditation ermöglicht es mir, nach innen zu gehen und eine Tiefe von Ruhe und Frieden zu finden, die ich sonst nirgendwo erlebe.",
    name: "Jerry Seinfeld",
    detail: "Comedian",
    image: "/testamonials/ocean_sun_testimonial_jerry_seinfeld.jpg",
  },
];

const themeTestimonials: Partial<Record<string, Testimonial[]>> = {
  // "depression2" — not mapped to the depression theme yet, preserved for later
  depression2: [
    {
      quote: "Man findet das Gold von innen herein und verabschiedet sich vom Müll.",
      name: "David Lynch",
      detail: "Filmregisseur",
      image: "/testamonials/david_lynch_grayscale.jpg",
    },
  ],
};

export function getTestimonials(themeKey: ThemeKey): Testimonial[] {
  return themeTestimonials[themeKey] ?? defaultTestimonials;
}

// ─────────────────────────────────────────────────
//  FOR-WHOM TABS — Reihenfolge bestimmt den Tab-Index.
//  themeKey: welches Thema beim Klick aktiviert wird
//  (undefined = kein Hero-Wechsel, nur Carousel-Index)
// ─────────────────────────────────────────────────
export const forWhomTabs: { label: string; themeKey?: ThemeKey }[] = [
  { label: "Stress", themeKey: "stress" },
  { label: "Gesundheit", themeKey: undefined },
  { label: "Wissenschaft", themeKey: undefined },
  { label: "Depression", themeKey: "depression" },
];

export const content = {
  contact: {
    phone: "+49 163 7354 836",
    phoneHref: "tel:+491637354836",
    email: "bennet.strauch@meditation.de",
    emailHref: "mailto:bennet.strauch@meditation.de",
  },

  hero: {
    learnMore: "Mehr über TM erfahren",
    learnMoreHref: "#fuer-wen",
    cta: "Kostenlose Info-Session",
    ctaHref: "#anmeldung",
  },

  forWhom: {
    heading: "Für wen ist TM?",
    items: [
      {
        title: "Du hast immer zu viel im Kopf",
        description:
          "Für alle, die selten wirklich zur Ruhe kommen — ob beruflicher Druck, voller Terminkalender oder einfach zu viele Gedanken.",
      },
      {
        title: "Jünger fühlen. Gesünder leben.",
        description:
          "TM senkt nachweislich Blutdruck und Cortisolspiegel. Viele berichten: mehr Energie, besserer Schlaf, mehr Vitalität — in jedem Alter.",
      },
      {
        title: "Du willst messbare Ergebnisse",
        description:
          "TM ist die meistuntersuchte Meditationstechnik weltweit — über 400 Studien an führenden Universitäten. Die Wirkung ist dokumentiert, nicht versprochen.",
      },
      {
        title: "Du kämpfst mit Erschöpfung oder Niedergeschlagenheit",
        description:
          "TM ist die meistuntersuchte natürliche Methode bei Depressionen und Angststörungen — wirksam, ohne Nebenwirkungen, ganz ohne Konzentration oder Willenskraft.",
      },
    ],
  },

  whyTm: {
    heading: "Was TM einzigartig macht",
    subheading:
      "Transzendentale Meditation unterscheidet sich grundlegend von anderen Techniken.",

    benefits: [
      {
        title: "Mühelos — keine Konzentration nötig",
        short:
          "Die meisten Meditationstechniken erfordern Fokus oder Willenskraft. TM ist anders: Der Geist darf sich ganz natürlich beruhigen — ohne Anstrengung. Deshalb finden viele Menschen TM überraschend leicht zu erlernen.",
        expanded:
          "Weil die Technik mühelos ist, bewegt sich der Geist spontan in Richtung ruhigerer Gedankenebenen. Meditation geschieht von selbst — nicht durch Disziplin. Das macht TM auch für Menschen zugänglich, die mit anderen Techniken keine Erfahrung gemacht haben.",
      },
      {
        title: "Tiefer als Schlaf — der Körper erholt sich wirklich",
        short:
          "Während der TM erreicht der Körper eine Tiefenruhe, die Studien zufolge tiefer ist als im Schlaf — während der Geist wach und klar bleibt. In dieser Ruhe baut das Nervensystem angesammelten Stress ab.",
        expanded:
          "Dieser Zustand unterscheidet sich messbar von Entspannung, Schlaf oder Konzentration. Viele erleben: tiefe Stille, Klarheit, frische Energie — noch bevor sie die Wirkung im Alltag bewusst bemerken.",
      },
      {
        title: "Von innen heraus glücklich",
        // short: "TM fördert die Produktion von Serotonin, dem sogenannten Glückshormon. Viele berichten: mehr innere Zufriedenheit, weniger Reizbarkeit, mehr Freude — auch in stressigen Momenten.",
        short:
          "Jeder Mensch trägt ein Reservoir an vollkomener Zufriedenheut in sich - Ein Meer der Freude, das durch TM zugänglich wird — mehr und mehr innere Zufriedenheit und weniger Reizbarkeit im Alltag.",
        expanded:
          "Was von allerlei Philosophen, Mystikern und Weisen seit Jahrtausenden beschrieben wird, wird durch TM konkret und beständig integriert. Nicht nur das, es ist auch wissenschaftlich messbar.",
      },
      {
        title: "Klarer denken, ruhiger reagieren",
        // ## new section devoted to brain function itself
        short:
          "Diverse Studien zeigen: Regelmäßig Praktizierende reagieren ruhiger in stressigen Situationen, entscheiden klarer, sind kreativer. Das ist keine Selbstsuggestion — sondern messbar in der Gehirnaktivität.",
        expanded:
          "Studien zeigen, dass TM die Koordination verschiedener Gehirnbereiche verbessert. Diese integriertere Funktionsweise ist bei Spitzensportlern, Führungskräften und Kreativen dokumentiert, die TM regelmäßig praktizieren.",
      },
      {
        title: "Stress abbauen — auch den Tiefsitzenden",
        short:
          "Nicht nur akuter Stress, sondern auch langfristig angesammelter Druck lässt sich durch TM abbauen. Viele berichten: weniger Angst, besserer Schlaf, mehr Resilienz.",
        expanded:
          "TM wurde in Studien bei stressbedingten Beschwerden und Traumaverarbeitung untersucht — darunter auch bei PTBS. Die physiologische Tiefenruhe unterstützt die natürliche Selbstregulation des Körpers auf eine Weise, die andere Entspannungstechniken schlicht nicht erreichen.",
      },
      {
        title: "Über 400 Studien an führenden Universitäten",
        short:
          "Transzendentale Meditation ist die meistuntersuchte Meditationstechnik weltweit. Forschungsgebiete: Stress, Herzgesundheit, Gehirnfunktion, Leistung und Resilienz.",
        expanded:
          "Weil TM standardisiert gelehrt wird, lässt sie sich wissenschaftlich zuverlässiger untersuchen als viele andere Ansätze. Studien erschienen u.a. im American Journal of Cardiology und dem International Journal of Neuroscience.",
      },
    ],
  },

  howItWorks: {
    heading: "So funktioniert es",
    subheading:
      "Von Neugier bis zur täglichen Praxis — in vier einfachen Schritten.",
    steps: [
      {
        number: "01",
        title: "Kostenloser Infovortrag",
        description:
          "Du erfährst, was TM ist, wie sie sich von anderen Techniken unterscheidet, und kannst alle Fragen stellen. Keinerlei Verpflichtung.",
      },
      {
        number: "02",
        title: "Persönliche Einweisung",
        description:
          "Die Technik wird von einem zertifizierten Lehrer persönlich vermittelt — individuell, in deinem eigenen Tempo. Keine Vorkenntnisse nötig.",
      },
      {
        number: "03",
        title: "Täglich zuhause meditieren",
        description:
          "20 Minuten, bequem sitzend, zweimal täglich. Keine App, keine Führung, kein Fokussieren — nur mühelose, eigenständige Praxis.",
      },
      {
        number: "04",
        title: "Die Wirkung entfaltet sich",
        description:
          "Mit regelmäßiger Praxis überträgt sich die Ruhe in den Alltag: mehr Energie, mehr Klarheit — auch in stressigen Momenten.",
      },
    ],
  },

  events: {
    heading: "Nächste Infovorträge",
    subheading: "Kostenlos · unverbindlich · München & Online",
    cta: "Platz sichern",
    empty: "Aktuell keine Termine geplant. Schreib uns gerne direkt an.",
  },
};
