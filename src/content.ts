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
  focus?: string; // CSS object-position, e.g. "45% 30%". Defaults to "center"
};

export type Theme = {
  slug: string;
  images: HeroImage[];
  forWhomIndex: number;
};

const STRESS_IMAGES: HeroImage[] = [
  // { src: "/hero/stress/1.jpg", focus: "45% 30%" },
  // { src: "/hero/stress/2.jpg", focus: "62% 25%" },
  { src: "/hero/stress/3.jpg", focus: "65% 50%" },
  { src: "/hero/stress/4.jpg", focus: "50% 50%" },
  { src: "/hero/stress/5.jpg", focus: "45% 50%" },
  { src: "/hero/stress/6.jpg", focus: "50% 45%" },
  // { src: "/hero/stress/7.jpg", focus: "45% 35%" },
  { src: "/hero/stress/8.jpg", focus: "62% 35%" },
  { src: "/hero/stress/9.jpg", focus: "45% 40%" },
  { src: "/hero/stress/10.jpg", focus: "45% 30%" },
  // { src: "/hero/stress/11.jpg", focus: "70% 130%" },
  { src: "/hero/stress/12.jpg", focus: "35% 35%" },
  // { src: "/hero/stress/13.jpg", focus: "50% 40%" },
  // { src: "/hero/stress/14.jpg", focus: "70% 30%" },
  { src: "/hero/stress/15.jpg", focus: "55% 30%" },
  // { src: "/hero/stress/17.jpg", focus: "55% 30%" },
  // { src: "/hero/stress/18.jpg", focus: "50% 50%" },
];

export const themes: Record<string, Theme> = {
  stress: {
    slug: "",
    images: STRESS_IMAGES,
    forWhomIndex: 0,
  },
  "innere-freude": {
    slug: "innere-freude",
    images: [{ src: "/hero/stress/3.jpg", focus: "65% 50%" }],
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
    ctaHref: "#infoabend",
    learnMoreHref: "#fuer-wen",
  },
};
