import type { Topic } from './topics';

// Owned, minimal line-art icons for the four Topics — deliberately not publisher
// or journal logos (trademark + clutter, see ADR 0012 / spec). Each renders as a
// stroke path that inherits `currentColor`, so the caller sets the accent.
const PATHS: Record<Topic, React.ReactNode> = {
  // Heart — Health
  Health: (
    <path d="M12 20s-6.5-4.3-8.5-8.2C2.1 9 3.3 6 6.1 6c1.8 0 3 1.1 3.9 2.4C10.9 7.1 12.1 6 13.9 6c2.8 0 4 3 2.6 5.8C18.5 15.7 12 20 12 20Z" />
  ),
  // Head with a spark — Mental Potential
  'Mental Potential': (
    <>
      <path d="M9 20v-2.2A6.5 6.5 0 1 1 15.5 6" />
      <path d="M12 3v3M12 3l2 1.5M12 3l-2 1.5" />
    </>
  ),
  // Two figures — Social Behavior
  'Social Behavior': (
    <>
      <circle cx="8" cy="8" r="2.6" />
      <circle cx="16" cy="8" r="2.6" />
      <path d="M4 19a4 4 0 0 1 8 0M12 19a4 4 0 0 1 8 0" />
    </>
  ),
  // Globe — World Peace
  'World Peace': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 2.5 14.7 0 17M12 3.5c-2.5 2.3-2.5 14.7 0 17" />
    </>
  ),
};

export function TopicIcon({
  topic,
  size = 18,
  className,
  style,
}: {
  topic: Topic;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {PATHS[topic]}
    </svg>
  );
}
