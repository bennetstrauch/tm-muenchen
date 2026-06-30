/**
 * ─────────────────────────────────────────────────
 *  NON-TRANSLATABLE CONFIG — images, slugs, URLs
 *  All display text lives in messages/{locale}.json
 * ─────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────
//  THEMEN — Slug, Bilder und forWhomIndex pro Thema.
//  Label, Headline und Subtitle → messages/{locale}.json → Themes.*
// ─────────────────────────────────────────────────
export type HeroImage = {
  src: string;
  focus?: string;           // CSS object-position, e.g. "45% 30%". Defaults to "center"
  mobileTranslateY?: string; // shifts image down on mobile (< 640px), e.g. "22%"
  desktopOnly?: boolean;    // omit on viewports < 640px
  mobileOnly?: boolean;     // omit on viewports ≥ 640px
};

export type Theme = {
  slug: string;
  images: HeroImage[];
  forWhomIndex: number;
};

// TODO: re-enable and tune individual images once hero overlay design is finalised
const STRESS_IMAGES: HeroImage[] = [
  // { src: "/hero/stress/woman-pink-headband-tree-forest.jpg",              focus: "45% 30%" },
  // { src: "/hero/stress/woman-dancing-silhouette-sunset.jpg",              focus: "65% 50%" },
  { src: "/hero/stress/ocean-waves-pastel-sunset.jpg",                    focus: "50% 70%" },
  // { src: "/hero/stress/mother-child-beach-sunset.jpg",                    focus: "45% 50%" },
  // { src: "/hero/stress/woman-curly-orange-hair-outdoor.jpg",              focus: "45% 35%" },
  // { src: "/hero/stress/girl-picking-flowers-meadow.jpg",                  focus: "62% 35%" },
  // { src: "/hero/stress/woman-orchard-looking-away.jpg",                   focus: "70% 30%" },
  // { src: "/hero/stress/woman-eyes-closed-golden-bokeh.jpg",               focus: "55% 30%" },
  // { src: "/hero/stress/man-blonde-meditating-trees.jpg",                  focus: "55% 30%" },
  // { src: "/hero/stress/woman-meditating-chair-porch.jpg",                 focus: "50% 50%" },
  // { src: "/hero/stress/man-arms-spread-mountain-vista.jpg",               focus: "50% 50%" },
  { src: "/hero/ourmeditators/woman-blonde-meditating-white-studio-wide.jpg",  focus: "100% 10%", desktopOnly: true },
  { src: "/hero/ourmeditators/woman-red-coat-meditating-forest.jpg",        focus: "50% 55%" },
  { src: "/hero/ourmeditators/man-woman-meditating-on-grass.jpg",           focus: "50% 40%", mobileTranslateY: "10%", mobileOnly: true },
  { src: "/hero/ourmeditators/two-men-sitting-park-bench.jpg",              focus: "50% 45%", mobileTranslateY: "15%", mobileOnly: true },
  // { src: "/hero/ourmeditators/three-people-laughing-outside.jpg",         focus: "50% 45%", mobileTranslateY: "35%" },
  // { src: "/hero/ourmeditators/man-meditating-park-bench.jpg",             focus: "60% 45%" },
  // { src: "/hero/ourmeditators/man-red-beard-glasses-grass-smiling.jpg",   focus: "50% 50%", mobileTranslateY: "22%" },
  // { src: "/hero/ourmeditators/man-glasses-olive-sweater-grass-smiling.jpg", focus: "58% 48%", mobileTranslateY: "22%" },
  // { src: "/hero/ourmeditators/woman-blonde-meditating-on-grass.jpg",      focus: "50% 18%" },
  // { src: "/hero/ourmeditators/woman-blue-top-sofa-reading-indoor.jpg",    focus: "55% 50%" },
];

export const themes: Record<string, Theme> = {
  stress: {
    slug: "",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
  "innere-freude": {
    slug: "innere-freude",
    images: [{ src: "/hero/stress/woman-dancing-silhouette-sunset.jpg", focus: "65% 50%" }],
    forWhomIndex: 4,
  },
  schlaf: {
    slug: "schlaf",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
  fokus: {
    slug: "fokus",
    images: STRESS_IMAGES,
    forWhomIndex: 2,
  },
  erschoepfung: {
    slug: "erschoepfung",
    images: STRESS_IMAGES,
    forWhomIndex: 3,
  },
  angst: {
    slug: "angst",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
};

export type ThemeKey = "stress" | "innere-freude" | "schlaf" | "fokus" | "erschoepfung" | "angst";

/** Map hyphenated theme keys to camelCase for JSON key lookup. */
export function themeKeyToCamel(key: ThemeKey): string {
  const map: Record<ThemeKey, string> = {
    "stress": "stress",
    "innere-freude": "innereFreude",
    "schlaf": "schlaf",
    "fokus": "fokus",
    "erschoepfung": "erschoepfung",
    "angst": "angst",
  };
  return map[key];
}

// ─────────────────────────────────────────────────
//  ERFAHRUNGSBERICHTE — nur Bild-Pfad und Name.
//  Quote und Detail → messages/{locale}.json → Testimonials.*
// ─────────────────────────────────────────────────
export type Testimonial = {
  name: string;
  image?: string;
};

export const defaultTestimonials: Testimonial[] = [
  {
    name: "Jerry Seinfeld",
    image: "/testamonials/ocean_sun_testimonial_jerry_seinfeld.jpg",
  },
];

const themeTestimonials: Partial<Record<ThemeKey, Testimonial[]>> = {};

export function getTestimonials(themeKey: ThemeKey): Testimonial[] {
  return themeTestimonials[themeKey] ?? defaultTestimonials;
}

// ─────────────────────────────────────────────────
//  WAS ANDERE SAGEN — Bild, Name, Rolle, Quelle.
//  Quote + extendedQuote → messages/{locale}.json → WasAndereSagen.*
// ─────────────────────────────────────────────────
export type OwnTestimonial = {
  name: string;
  role: string;
  photoUrl: string;
  sourceUrl?: string;
  hasExtendedQuote?: true;
  photoPosition?: string;
};

export const ownTestimonials: OwnTestimonial[] = [
  {
    name: "Dr. Karin Pirc",
    role: "Ärztin",
    photoUrl: "/testimonials/karin-pirc.jpg",
    hasExtendedQuote: true,
  },
  {
    name: "Gottfried Vollmer",
    role: "Schauspieler",
    photoUrl: "/testimonials/gottfried-vollmer.jpg",
    sourceUrl: "https://www.youtube.com/watch?v=hEqxerg6AAo",
    photoPosition: "center 20%",
  },
  {
    name: "Hugh Jackman",
    role: "Schauspieler",
    photoUrl: "/testimonials/hugh-jackman.jpg",
    photoPosition: "center 5%",
  },
  {
    name: "Dr. Wolfgang Schachinger",
    role: "Arzt",
    photoUrl: "/testimonials/wolfgang-schachinger.jpg",
  },
  {
    name: "Michel Hubert",
    role: "Bankdirektor i.R.",
    photoUrl: "/testimonials/michel-hubert.jpg",
    hasExtendedQuote: true,
  },
  {
    name: "Paul McCartney",
    role: "Musiker",
    photoUrl: "/testimonials/paul-mccartney.jpg",
    sourceUrl: "https://meditationlifestyle.com/sir-paul-mccartney-on-meditation/",
    hasExtendedQuote: true,
    photoPosition: "center 20%",
  },
];

// ─────────────────────────────────────────────────
//  CONTACT — phone, email, social URLs (not translated)
// ─────────────────────────────────────────────────
const email = "info@tm-muenchen.de";
export const content = {
  contact: {
    phone: "+49 163 7354 836",
    phoneHref: "tel:+491637354836",
    email: email,
    emailHref: `mailto:${email}`,
    instagram: "https://www.instagram.com/muenchentranszendiert",
    whatsappCommunity: "https://chat.whatsapp.com/JyYjiLgQ7dn4ewQLedUVC4?mode=gi_t",
  },
  hero: {
    ctaHref: "#infoevent",
    learnMoreHref: "#fuer-wen",
  },
};
