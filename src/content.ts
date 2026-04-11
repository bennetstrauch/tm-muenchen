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
export type Theme = {
  slug: string;
  label: string;
  headline: string[];
  subline: string[];
  image: string;
  forWhomIndex: number;
};

export const themes: Record<string, Theme> = {
  stress: {
    slug: "",           // Haupt-URL: /
    label: "Stress",
    headline: [
      "Endlich wirklich abschalten.",
      "Ohne Anstrengung.",
    ],
    subline: [
      "Transzendentale Meditation",
      "regeneriert tiefer als Schlaf",
    ],
    image: "/hero.jpg",
    forWhomIndex: 0,
  },
  depression: {
    slug: "depression", // URL: /depression
    label: "Depression",
    headline: [
      "Wieder leicht werden.",
      "Ganz ohne Willenskraft.",
    ],
    subline: [
      "TM reduziert nachweislich Symptome",
      "von Erschöpfung und Depression",
    ],
    image: "/hero-depression.jpg",
    forWhomIndex: 3,
  },
};

export type ThemeKey = "stress" | "depression";

// ─────────────────────────────────────────────────
//  FOR-WHOM TABS — Reihenfolge bestimmt den Tab-Index.
//  themeKey: welches Thema beim Klick aktiviert wird
//  (undefined = kein Hero-Wechsel, nur Carousel-Index)
// ─────────────────────────────────────────────────
export const forWhomTabs: { label: string; themeKey?: ThemeKey }[] = [
  { label: "Stress",        themeKey: "stress"      },
  { label: "Gesundheit",    themeKey: undefined     },
  { label: "Wissenschaft",  themeKey: undefined     },
  { label: "Depression",    themeKey: "depression"  },
];

export const content = {
  hero: {
    learnMore: "Mehr über TM erfahren",
    learnMoreHref: "#warum-tm",
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
    subheading: "Transzendentale Meditation unterscheidet sich grundlegend von anderen Techniken.",

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
        title: "Klarer denken, ruhiger reagieren",
        short:
          "Mit regelmäßiger Praxis berichten viele: Sie reagieren ruhiger in stressigen Situationen, entscheiden klarer, sind kreativer. Das ist keine Selbstsuggestion — sondern messbar in der Gehirnaktivität.",
        expanded:
          "Studien zeigen, dass TM die Koordination verschiedener Gehirnbereiche verbessert. Diese integriertere Funktionsweise ist bei Spitzensportlern, Führungskräften und Kreativen dokumentiert, die TM regelmäßig praktizieren.",
      },
      {
        title: "Stress abbauen — auch den Tiefsitzenden",
        short:
          "Nicht nur akuter Stress, sondern auch langfristig angesammelter Druck lässt sich durch TM abbauen. Viele berichten: weniger Angst, besserer Schlaf, mehr Resilienz.",
        expanded:
          "TM wurde in Studien bei stressbedingten Beschwerden und Traumaverarbeitung untersucht — darunter auch bei PTBS. Die physiologische Tiefenruhe unterstützt die natürliche Selbstregulation des Körpers auf eine Weise, die Entspannungstechniken allein oft nicht erreichen.",
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
    subheading: "Von Neugier bis zur täglichen Praxis — in vier einfachen Schritten.",
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
