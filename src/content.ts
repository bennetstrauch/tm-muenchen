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
//  TRUSTPILOT BEWERTUNGEN — nur Name und URL.
//  Title und Quote → messages/{locale}.json → Trustpilot.review*
// ─────────────────────────────────────────────────
export type TrustpilotReview = {
  name: string;
  url: string;
};

export const trustpilotReviews: TrustpilotReview[] = [
  { name: "Kris",             url: "https://de.trustpilot.com/reviews/69cbc00aa823019958117ffc" },
  { name: "Mark",             url: "https://de.trustpilot.com/reviews/69bb316f05dc66d0dbc0bc09" },
  { name: "Olga Villa",       url: "https://de.trustpilot.com/reviews/69e8c913475b979018f0b860" },
  { name: "Jay",              url: "https://de.trustpilot.com/reviews/69d4f73f29953d97224d45cb" },
  { name: "Iceiz'sene Rivera",url: "https://de.trustpilot.com/reviews/69d24ca775490351d1f47849" },
  { name: "Ted",              url: "https://de.trustpilot.com/reviews/69d3b9cc65f2076825f472c0" },
  { name: "Patrick",          url: "https://de.trustpilot.com/reviews/69cd2109c0475f6e8506a669" },
  { name: "Samantha",         url: "https://de.trustpilot.com/reviews/6982574f63e639b34ce65664" },
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
