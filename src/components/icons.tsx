type IconProps = { width?: number; height?: number; className?: string };

export function PhoneIcon({ width = 15, height = 15, className }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 15 15" fill="none" aria-hidden="true" className={className}>
      <path d="M2 1.5C2 1.5 1 1.5 1 2.5C1 3.5 1.5 6.5 4.5 9.5C7.5 12.5 10.5 13 11.5 13C12.5 13 12.5 12 12.5 12L13.5 10C13.5 10 13.5 9.5 13 9L11 8C11 8 10.5 7.75 10 8.25L9 9.25C9 9.25 8.5 9.5 8 9C8 9 7 8.25 6 7C4.75 5.75 4 4.75 4 4.75C3.5 4.25 3.75 3.75 3.75 3.75L4.75 2.75C5.25 2.25 5 1.75 5 1.75L4 .75C3.5 .25 3 .25 2.5 .5L2 1.5Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MailIcon({ width = 16, height = 12, className }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 12" fill="none" aria-hidden="true" className={className}>
      <rect x="0.75" y="0.75" width="14.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M1 1.5L8 7L15 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
