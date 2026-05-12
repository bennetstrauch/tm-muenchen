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

const STRESS_IMAGES: HeroImage[] = [
  { src: "/hero/stress/1.jpg", focus: "45% 30%" },
  { src: "/hero/stress/2.jpg", focus: "62% 25%" },
  { src: "/hero/stress/3.jpg", focus: "65% 50%" },
  { src: "/hero/stress/4.jpg", focus: "50% 50%" },
  { src: "/hero/stress/5.jpg", focus: "45% 50%" },
  { src: "/hero/stress/6.jpg", focus: "50% 45%" },
  { src: "/hero/stress/7.jpg", focus: "45% 35%" },
  { src: "/hero/stress/8.jpg", focus: "62% 35%" },
  { src: "/hero/stress/9.jpg", focus: "45% 40%" },
  { src: "/hero/stress/10.jpg", focus: "45% 30%" },
  { src: "/hero/stress/11.jpg", focus: "70% 130%" },
  { src: "/hero/stress/12.jpg", focus: "35% 35%" },
  { src: "/hero/stress/13.jpg", focus: "50% 40%" },
  { src: "/hero/stress/14.jpg", focus: "70% 30%" },
  { src: "/hero/stress/15.jpg", focus: "55% 30%" },
  { src: "/hero/stress/17.jpg", focus: "55% 30%" },
  { src: "/hero/stress/18.jpg", focus: "50% 50%" },
];

export const themes: Record<string, Theme> = {
  stress: {
    slug: "", // Haupt-URL: /
    label: "Stress",
    headline: ["Endlich wirklich abschalten.", "Ohne Anstrengung."],
    subtitle: "regeneriert tiefer als Schlaf",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
  "innere-freude": {
    slug: "innere-freude",
    label: "Innere Freude",
    headline: [
      "Jeder hat einen Ozean unbegrenzter Freude in sich.",
      "TM gibt dir den Zugang.",
    ],
    subtitle: "Einfach und verlässlich in dein Glück eintauchen",
    images: [{ src: "/hero/stress/3.jpg", focus: "65% 50%" }],
    forWhomIndex: 4,
  },
  schlaf: {
    slug: "schlaf", // URL: /schlaf
    label: "Schlaf",
    headline: ["Schläfst du eigentlich?"],
    subtitle: "TM bringt deinem Nervensystem die Tiefenruhe, die Schlaf allein oft nicht mehr schafft.",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
  fokus: {
    slug: "fokus", // URL: /fokus
    label: "Fokus",
    headline: ["Dein Kopf ist voll — aber nicht klar."],
    subtitle: "TM räumt nicht auf, er lässt Ordnung von selbst entstehen: klarer Fokus, ruhigerer Geist.",
    images: STRESS_IMAGES,
    forWhomIndex: 2,
  },
  erschoepfung: {
    slug: "erschoepfung", // URL: /erschoepfung
    label: "Erschöpfung",
    headline: ["Leer, obwohl du gar nichts getan hast?"],
    subtitle: "TM gibt dir Zugang zu echter innerer Stille — nicht als Technik, sondern als natürlicher Zustand.",
    images: STRESS_IMAGES,
    forWhomIndex: 3,
  },
  angst: {
    slug: "angst", // URL: /angst
    label: "Angst",
    headline: ["Innere Unruhe, die einfach nicht aufhört?"],
    subtitle: "TM beruhigt das Nervensystem von innen — ohne Willenskraft, ohne Konzentration.",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
  // Retired themes — kept for data continuity but not in navigation
  "innere-stille": {
    slug: "innere-stille",
    label: "Innere Stille",
    headline: ["Dein Kopf wird einfach nicht still?", "Lerne, wie er wirklich zur Ruhe kommt."],
    subtitle: "Ohne Konzentration. Ohne Gedanken stoppen.",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
  depression: {
    slug: "depression",
    label: "Depression",
    headline: ["Wieder leicht werden.", "Ganz ohne Willenskraft."],
    subtitle: "Tiefe Ruhe für emotionale Entlastung",
    images: [
      { src: "/hero/depression/1.jpg", focus: "50% 25%" },
      { src: "/hero/stress/3.jpg", focus: "65% 50%" },
      { src: "/hero/stress/11.jpg", focus: "70% 130%" },
    ],
    forWhomIndex: 3,
  },
};

export type ThemeKey = "stress" | "innere-freude" | "schlaf" | "fokus" | "erschoepfung" | "angst" | "innere-stille" | "depression";

// ─────────────────────────────────────────────────
//  ERFAHRUNGSBERICHTE — Zitate von Meditierenden.
//  Jedes Thema kann eigene Testimonials haben.
//  Fehlt ein Eintrag, werden die Standard-Testimonials gezeigt.
// ─────────────────────────────────────────────────
export type Testimonial = {
  quote: string;
  name: string;
  detail?: string; // z.B. "Lehrerin, 42" oder "München"
  image?: string; // Pfad im /public Ordner
};

export const defaultTestimonials: Testimonial[] = [
  {
    quote:
      "Transzendentale Meditation ermöglicht es mir, nach innen zu gehen und eine Tiefe von Ruhe und Frieden zu finden, die ich sonst nirgendwo erlebe.",
    name: "Jerry Seinfeld",
    detail: "Comedian",
    image: "/testamonials/ocean_sun_testimonial_jerry_seinfeld.jpg",
  },
];

const themeTestimonials: Partial<Record<string, Testimonial[]>> = {
  // "depression2" — not mapped to the depression theme yet, preserved for later
  depression2: [
    {
      quote:
        "Man findet das Gold von innen herein und verabschiedet sich vom Müll.",
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
//  TRUSTPILOT BEWERTUNGEN
//  quote    = Original (Englisch — für spätere EN-Version)
//  quoteDE  = Deutsche Übersetzung (wird aktuell angezeigt)
// ─────────────────────────────────────────────────
export type TrustpilotReview = {
  name: string;
  title: string;
  titleDE: string;
  quote: string;
  quoteDE: string;
  url: string;
};

export const trustpilotReviews: TrustpilotReview[] = [
  {
    name: "Kris",
    title: "I absolutely love TM",
    titleDE: "Ich liebe TM",
    quote:
      "I absolutely love TM! I feel so relaxed and grounded in a way I never thought possible. It's surprising that I can experience such a depth of relaxation beyond sleep. TM is so simple yet so profound that everyone can do it. It is my go to anchor daily.",
    quoteDE:
      "Ich liebe TM! Ich fühle mich so entspannt und geerdet, wie ich es nie für möglich gehalten hätte. Erstaunlich, welch eine Tiefe der Entspannung möglich ist — tiefer als Schlaf. TM ist so einfach und doch so tiefgründig, dass jeder es tun kann. Es ist mein täglicher Anker.",
    url: "https://de.trustpilot.com/reviews/69cbc00aa823019958117ffc",
  },
  {
    name: "Mark",
    title: "Wonderful 😊",
    titleDE: "Wunderbar 😊",
    quote:
      "My only regret is that I didn't do it sooner. Totally life changing. I feel so peaceful and happy.",
    quoteDE:
      "Mein einziges Bedauern ist, dass ich nicht früher damit angefangen habe. Absolut lebensverändernd. Ich fühle mich so friedvoll und glücklich.",
    url: "https://de.trustpilot.com/reviews/69bb316f05dc66d0dbc0bc09",
  },
  {
    name: "Olga Villa",
    title: "My daughter and I are very happy meditating daily",
    titleDE: "Meine Tochter und ich sind sehr glücklich",
    quote:
      "My daughter and I are very happy meditating daily. It has giving us lots of insight and peace. We always look forward for our 2 daily meditations. The instructors are very dedicated and easy to understand.",
    quoteDE:
      "Meine Tochter und ich meditieren täglich und sind sehr glücklich damit. Es hat uns viel Klarheit und inneren Frieden gebracht. Wir freuen uns immer auf unsere 2 täglichen Meditationen. Die Lehrer sind sehr engagiert und leicht zu verstehen.",
    url: "https://de.trustpilot.com/reviews/69e8c913475b979018f0b860",
  },
  {
    name: "Jay",
    title: "Very professional, from emails to notifications",
    titleDE: "Sehr professionell, von Anfang bis Ende",
    quote:
      "Very professional, from emails to notifications to application. Very friendly, patient and experienced teachers. A lot of good information backed by science and research.",
    quoteDE:
      "Sehr professionell — von E-Mails über Benachrichtigungen bis zur Einführung. Sehr freundliche, geduldige und erfahrene Lehrer. Viele gute, wissenschaftlich fundierte Informationen.",
    url: "https://de.trustpilot.com/reviews/69d4f73f29953d97224d45cb",
  },
  {
    name: "Iceiz'sene Rivera",
    title: "One of the best decisions in many years",
    titleDE: "Eine der besten Entscheidungen seit Jahren",
    quote:
      "This has been one of the Best decisions I've made in many years. If you are in need of a foundational start to your day, this is for you.",
    quoteDE:
      "Dies ist eine der besten Entscheidungen, die ich seit vielen Jahren getroffen habe. Wer einen starken Einstieg in den Tag braucht — für den ist das genau das Richtige.",
    url: "https://de.trustpilot.com/reviews/69d24ca775490351d1f47849",
  },
  {
    name: "Ted",
    title: "It's real",
    titleDE: "Es ist real",
    quote:
      "It's real. It's a way to live peacefully in time that belongs to you.",
    quoteDE:
      "Es ist real. Es ist ein Weg, in einer Zeit, die ganz dir gehört, in Frieden zu leben.",
    url: "https://de.trustpilot.com/reviews/69d3b9cc65f2076825f472c0",
  },
  {
    name: "Patrick",
    title: "A definite change after just 3 weeks",
    titleDE: "Eine deutliche Veränderung schon nach 3 Wochen",
    quote:
      "I have noticed a definite change in my anxiety levels only 3 weeks into starting TM.",
    quoteDE:
      "Schon nach nur 3 Wochen TM habe ich eine deutliche Veränderung bei meinem Angstniveau festgestellt.",
    url: "https://de.trustpilot.com/reviews/69cd2109c0475f6e8506a669",
  },
  {
    name: "Samantha",
    title: "I can finally meditate.",
    titleDE: "Ich kann endlich meditieren.",
    quote: "I can finally meditate.",
    quoteDE: "Ich kann endlich meditieren.",
    url: "https://de.trustpilot.com/reviews/6982574f63e639b34ce65664",
  },
];

// ─────────────────────────────────────────────────
//  FOR-WHOM TABS — Reihenfolge bestimmt den Tab-Index.
//  Tabs wechseln nur das Carousel, nicht den Hero.
// ─────────────────────────────────────────────────
export const forWhomTabs: { label: string }[] = [
  { label: "Stress" },
  { label: "Gesundheit" },
  { label: "Wissenschaft" },
  { label: "Depression" },
  { label: "Innere Freude" },
];

const email = "info@tm-muenchen.de";
export const content = {
  contact: {
    phone: "+49 163 7354 836",
    phoneHref: "tel:+491637354836",
    email: email,
    emailHref: `mailto:${email}`,
  },

  hero: {
    cta: "Kostenlosen Info-Abend entdecken",
    ctaHref: "#anmeldung",
    learnMore: "Mehr über TM erfahren",
    learnMoreHref: "#fuer-wen",
  },

  forWhom: {
    heading: "Für wen ist TM?",
    items: [
      {
        title: "Du funktionierst — aber innerlich bist du ständig angespannt?",
        description:
          "• Du schläfst schlecht, obwohl du eigentlich müde bist.\n• Du hast nie wirklich Feierabend — der Kopf läuft einfach weiter.\n• Kleinigkeiten bringen dich schneller aus der Ruhe, als dir lieb ist.\n• Du sehnst dich nach echter Erholung, nicht nur nach Ablenkung.\n\nTM gibt dir täglich 20 Minuten tiefer Stille — und dein Nervensystem beginnt, sich nachhaltig zu erholen.",
      },
      {
        title: "Du spürst, dass der Stress deinen Körper belastet?",
        description:
          "• Dein Blutdruck ist zu hoch — oder du weißt, dass er es bald sein wird.\n• Du wachst morgens auf und bist schon erschöpft.\n• Kopfschmerzen, Verspannungen, schlechter Schlaf — alles hängt zusammen.\n• Du willst etwas ändern, aber ein weiteres Gesundheitsprojekt klingt nach mehr Aufwand.\n\nTM ist das Gegenteil von Aufwand: 20 Minuten sitzen, Augen zu — und der Körper regeneriert sich von selbst.",
      },
      {
        title: "Du willst keine Versprechungen — du willst Belege?",
        description:
          "• Du bist skeptisch gegenüber Meditation — und das zu Recht.\n• Du hast schon vieles probiert, das nicht hielt, was es versprach.\n• Du willst wissen: Wurde das wirklich untersucht? An echten Menschen, mit Kontrollgruppen?\n• Über 400 Studien an Universitäten wie Harvard und Stanford: Blutdruck, Cortisol, Schlaf, Herzgesundheit.\n\nTM ist die meistuntersuchte Meditationstechnik weltweit — die Wirkung ist dokumentiert, nicht versprochen.",
      },
      // {
      //   title: "Du willst deine Lebensquialität von Grund auf verbessern",
      //   description: ""
      // },
      {
        title: "Manche Tage fühlst du dich leer — auch ohne konkreten Grund?",
        description:
          "• Morgens aufstehen fällt schwer, obwohl nichts Schlimmes passiert ist.\n• Du funktionierst nach außen, aber innen fehlt dir die Energie für die Dinge, die dir wichtig sind.\n• Du hast das Gefühl, dich ständig zusammenzureißen — und weißt nicht, wie lange noch.\n• Freude kommt seltener, als sie sollte.\n\nTM ist kein Ersatz für professionelle Unterstützung — aber viele berichten: tiefere Ruhe, mehr Leichtigkeit, wieder mehr Zugang zu sich selbst.",
      },
      {
        title: "Du willst einen praktischen Weg zur Erleuchtung",
        description:
          "Die erste Stufe der Erleuchtung: Volkommene innere Zufriedenheit und Klarheit und das schlummert bereits in jedem von uns. Wir müssen nur wissen wie wir dorthin gelangen. TM gibt dir den Zugang auf direkte, einfache Weise. Wir erfahren unsere innerste Natur - reine Glückseligkeit. Diese Erfahrung während TM erfolgt in tiefer Stille, körperlich und geistig. Dadurch kann sich der Körper tief regenerieren und von Stressen befreien: Die Folge: Wir werden mehr un dm ehr dazu fähig die immense Freude in uns auch während des Alltags zu leben und kontinuirlich zu entfalten.  ",
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
          "Jeder Mensch trägt ein Reservoir an vollkommener Zufriedenheit in sich - Ein Meer der Freude, das durch TM zugänglich wird — mehr und mehr innere Zufriedenheit und weniger Reizbarkeit im Alltag.",
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
        number: "1",
        title: "Kostenloser Infoabend",
        description:
          "Du erfährst, was TM ist, wie sie sich von anderen Techniken unterscheidet, und kannst alle Fragen stellen. Keinerlei Verpflichtung.",
      },
      {
        number: "2",
        title: "Persönliche Unterweisung",
        description:
          "Die Technik wird von einem zertifizierten Lehrer persönlich vermittelt — individuell, in deinem eigenen Tempo. Keine Vorkenntnisse nötig.",
      },
      {
        number: "3",
        title: "Täglich zuhause meditieren",
        description:
          "20 Minuten, bequem sitzend, zweimal täglich. Keine App, keine Führung, kein Fokussieren — nur mühelose, eigenständige Praxis.",
      },
      {
        number: "4",
        title: "Die Wirkung entfaltet sich",
        description:
          "Mit regelmäßiger Praxis überträgt sich die Ruhe in den Alltag: mehr Energie, mehr Klarheit — auch in stressigen Momenten.",
      },
    ],
  },

  events: {
    heading: "Nächste Infoabende",
    subheading: "Kostenlos · unverbindlich · München & Online",
    cta: "Platz sichern",
    empty: "Aktuell keine Termine geplant. Schreib uns gerne direkt an.",
  },
};
