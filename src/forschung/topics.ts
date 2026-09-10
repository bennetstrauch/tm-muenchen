// The four General Topics from column A of the source spreadsheet. These raw
// English values are the taxonomy keys stored on every Study; display labels are
// resolved per locale via the Forschung `topics` message namespace.
export const TOPICS = [
  'Health',
  'Mental Potential',
  'Social Behavior',
  'World Peace',
] as const;

export type Topic = (typeof TOPICS)[number];

// A calm accent per Topic, drawn from the site's deep-blue / sage / gold palette.
// Used for the owned Topic icons and tags — never a publisher/journal logo.
export const TOPIC_ACCENT: Record<Topic, string> = {
  Health: '#4F7C5A',
  'Mental Potential': '#3D5573',
  'Social Behavior': '#BCA075',
  'World Peace': '#2E7B8C',
};

export function isTopic(value: string): value is Topic {
  return (TOPICS as readonly string[]).includes(value);
}
