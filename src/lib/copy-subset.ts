export type CopyFieldType = 'text' | 'textarea';

export type CopyField = {
  key: string;   // dot-notation path into de.json, e.g. "ForWhom.item0Title"
  label: string; // human-readable German label
  type: CopyFieldType;
};

export type CopySection = {
  label: string;
  fields: CopyField[];
};

export const copySubset: CopySection[] = [
  {
    label: 'Themen (Hero-Headlines)',
    fields: [
      { key: 'Themes.stress.headline0',       label: 'Stress – Zeile 1',           type: 'text' },
      { key: 'Themes.stress.headline1',       label: 'Stress – Zeile 2',           type: 'text' },
      { key: 'Themes.stress.subtitle',        label: 'Stress – Untertitel',        type: 'text' },
      { key: 'Themes.innereFreude.headline0', label: 'Innere Freude – Zeile 1',    type: 'text' },
      { key: 'Themes.innereFreude.headline1', label: 'Innere Freude – Zeile 2',    type: 'text' },
      { key: 'Themes.innereFreude.subtitle',  label: 'Innere Freude – Untertitel', type: 'text' },
      { key: 'Themes.schlaf.headline0',       label: 'Schlaf – Zeile 1',           type: 'text' },
      { key: 'Themes.schlaf.headline1',       label: 'Schlaf – Zeile 2',           type: 'text' },
      { key: 'Themes.schlaf.subtitle',        label: 'Schlaf – Untertitel',        type: 'text' },
      { key: 'Themes.fokus.headline0',        label: 'Fokus – Zeile 1',            type: 'text' },
      { key: 'Themes.fokus.headline1',        label: 'Fokus – Zeile 2',            type: 'text' },
      { key: 'Themes.fokus.subtitle',         label: 'Fokus – Untertitel',         type: 'text' },
      { key: 'Themes.erschoepfung.headline0', label: 'Erschöpfung – Zeile 1',      type: 'text' },
      { key: 'Themes.erschoepfung.headline1', label: 'Erschöpfung – Zeile 2',      type: 'text' },
      { key: 'Themes.erschoepfung.subtitle',  label: 'Erschöpfung – Untertitel',   type: 'text' },
      { key: 'Themes.angst.headline0',        label: 'Angst – Zeile 1',            type: 'text' },
      { key: 'Themes.angst.headline1',        label: 'Angst – Zeile 2',            type: 'text' },
      { key: 'Themes.angst.subtitle',         label: 'Angst – Untertitel',         type: 'text' },
    ],
  },
  {
    label: 'Für wen ist TM?',
    fields: [
      { key: 'ForWhom.item0Title',       label: 'Stress – Titel',              type: 'text' },
      { key: 'ForWhom.item0Description', label: 'Stress – Beschreibung',       type: 'textarea' },
      { key: 'ForWhom.item1Title',       label: 'Gesundheit – Titel',          type: 'text' },
      { key: 'ForWhom.item1Description', label: 'Gesundheit – Beschreibung',   type: 'textarea' },
      { key: 'ForWhom.item2Title',       label: 'Wissenschaft – Titel',        type: 'text' },
      { key: 'ForWhom.item2Description', label: 'Wissenschaft – Beschreibung', type: 'textarea' },
      { key: 'ForWhom.item3Title',       label: 'Depression – Titel',          type: 'text' },
      { key: 'ForWhom.item3Description', label: 'Depression – Beschreibung',   type: 'textarea' },
      { key: 'ForWhom.item4Title',       label: 'Innere Freude – Titel',       type: 'text' },
      { key: 'ForWhom.item4Description', label: 'Innere Freude – Beschreibung', type: 'textarea' },
    ],
  },
  {
    label: 'Was TM einzigartig macht',
    fields: [
      { key: 'WhyTm.benefit0Title',    label: 'Vorteil 1 – Titel',           type: 'text' },
      { key: 'WhyTm.benefit0Short',    label: 'Vorteil 1 – Kurztext',        type: 'textarea' },
      { key: 'WhyTm.benefit0Expanded', label: 'Vorteil 1 – Langtext',        type: 'textarea' },
      { key: 'WhyTm.benefit1Title',    label: 'Vorteil 2 – Titel',           type: 'text' },
      { key: 'WhyTm.benefit1Short',    label: 'Vorteil 2 – Kurztext',        type: 'textarea' },
      { key: 'WhyTm.benefit1Expanded', label: 'Vorteil 2 – Langtext',        type: 'textarea' },
      { key: 'WhyTm.benefit2Title',    label: 'Vorteil 3 – Titel',           type: 'text' },
      { key: 'WhyTm.benefit2Short',    label: 'Vorteil 3 – Kurztext',        type: 'textarea' },
      { key: 'WhyTm.benefit2Expanded', label: 'Vorteil 3 – Langtext',        type: 'textarea' },
      { key: 'WhyTm.benefit3Title',    label: 'Vorteil 4 – Titel',           type: 'text' },
      { key: 'WhyTm.benefit3Short',    label: 'Vorteil 4 – Kurztext',        type: 'textarea' },
      { key: 'WhyTm.benefit3Expanded', label: 'Vorteil 4 – Langtext',        type: 'textarea' },
      { key: 'WhyTm.benefit4Title',    label: 'Vorteil 5 – Titel',           type: 'text' },
      { key: 'WhyTm.benefit4Short',    label: 'Vorteil 5 – Kurztext',        type: 'textarea' },
      { key: 'WhyTm.benefit4Expanded', label: 'Vorteil 5 – Langtext',        type: 'textarea' },
      { key: 'WhyTm.benefit5Title',    label: 'Vorteil 6 – Titel',           type: 'text' },
      { key: 'WhyTm.benefit5Short',    label: 'Vorteil 6 – Kurztext',        type: 'textarea' },
      { key: 'WhyTm.benefit5Expanded', label: 'Vorteil 6 – Langtext',        type: 'textarea' },
    ],
  },
  {
    label: 'So funktioniert es',
    fields: [
      { key: 'HowItWorks.step0Title',       label: 'Schritt 1 – Titel',       type: 'text' },
      { key: 'HowItWorks.step0Description', label: 'Schritt 1 – Beschreibung', type: 'textarea' },
      { key: 'HowItWorks.step1Title',       label: 'Schritt 2 – Titel',       type: 'text' },
      { key: 'HowItWorks.step1Description', label: 'Schritt 2 – Beschreibung', type: 'textarea' },
      { key: 'HowItWorks.step2Title',       label: 'Schritt 3 – Titel',       type: 'text' },
      { key: 'HowItWorks.step2Description', label: 'Schritt 3 – Beschreibung', type: 'textarea' },
      { key: 'HowItWorks.step3Title',       label: 'Schritt 4 – Titel',       type: 'text' },
      { key: 'HowItWorks.step3Description', label: 'Schritt 4 – Beschreibung', type: 'textarea' },
    ],
  },
  {
    label: 'Was andere sagen',
    fields: [
      { key: 'WasAndereSagen.quote0',         label: 'Zitat 1',            type: 'textarea' },
      { key: 'WasAndereSagen.extendedQuote0', label: 'Zitat 1 – Fortsetzung', type: 'textarea' },
      { key: 'WasAndereSagen.quote1',         label: 'Zitat 2',            type: 'textarea' },
      { key: 'WasAndereSagen.quote2',         label: 'Zitat 3',            type: 'textarea' },
      { key: 'WasAndereSagen.quote3',         label: 'Zitat 4',            type: 'textarea' },
      { key: 'WasAndereSagen.quote4',         label: 'Zitat 5',            type: 'textarea' },
      { key: 'WasAndereSagen.extendedQuote4', label: 'Zitat 5 – Fortsetzung', type: 'textarea' },
      { key: 'WasAndereSagen.quote5',         label: 'Zitat 6',            type: 'textarea' },
      { key: 'WasAndereSagen.extendedQuote5', label: 'Zitat 6 – Fortsetzung', type: 'textarea' },
    ],
  },
  {
    label: 'Abschluss',
    fields: [
      { key: 'AbschlussCta.heading', label: 'Überschrift', type: 'text' },
      { key: 'AbschlussCta.body',    label: 'Text',        type: 'text' },
    ],
  },
  {
    label: 'Entdecken-Seite',
    fields: [
      { key: 'Entdecken.headline', label: 'Headline', type: 'textarea' },
      { key: 'Entdecken.cta',      label: 'CTA-Button', type: 'text' },
    ],
  },
];

export function allSubsetKeys(): string[] {
  return copySubset.flatMap(s => s.fields.map(f => f.key));
}
