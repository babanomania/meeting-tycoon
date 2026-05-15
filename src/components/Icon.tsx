import type { SVGProps } from 'react';

/**
 * Outline icon set matching the Meeting Tycoon design system.
 * All icons share a 24×24 viewBox and use `currentColor` so they tint
 * with text color via Tailwind's `text-*` classes.
 *
 * Stroke weight: 1.75 — matches the wireframe icon set.
 */
export type IconName =
  | 'calendar'
  | 'meeting'
  | 'people'
  | 'person'
  | 'tasks'
  | 'dashboard'
  | 'reports'
  | 'inbox'
  | 'bell'
  | 'plus'
  | 'search'
  | 'settings'
  | 'more-h'
  | 'more-v'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'x'
  | 'check'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-right'
  | 'fire'
  | 'eye'
  | 'compass'
  | 'trending-up'
  | 'smile'
  | 'briefcase'
  | 'building'
  | 'menu'
  | 'alert'
  | 'clock'
  | 'lock'
  | 'mail'
  | 'send'
  | 'sparkle'
  | 'flag'
  | 'target'
  | 'shield'
  | 'star';

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, className, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

const PATHS: Record<IconName, JSX.Element> = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  meeting: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-2v8l-5-2z" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M21 18c0-2.5-1.8-4.5-4-4.9" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  tasks: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10l2.5 2.5L15 8" />
      <path d="M8 16h7" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
    </>
  ),
  reports: (
    <>
      <path d="M5 19V7" />
      <path d="M5 19h14" />
      <path d="M9 19V12" />
      <path d="M13 19V9" />
      <path d="M17 19V14" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 13l3-8h12l3 8" />
      <path d="M3 13v6a1 1 0 001 1h16a1 1 0 001-1v-6" />
      <path d="M3 13h5l1.5 2.5h5L16 13h5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16V10a6 6 0 1112 0v6l1.5 2H4.5z" />
      <path d="M10 20a2 2 0 004 0" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.2 16.2L21 21" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5l1.6.9-1.5 2.6-1.7-.6a7.5 7.5 0 01-2.1 1.2l-.3 1.8h-3l-.3-1.8a7.5 7.5 0 01-2.1-1.2l-1.7.6L4.8 16l1.6-.9a7.5 7.5 0 010-2.4L4.8 11.8l1.5-2.6 1.7.6a7.5 7.5 0 012.1-1.2l.3-1.8h3l.3 1.8a7.5 7.5 0 012.1 1.2l1.7-.6 1.5 2.6-1.6.9a7.5 7.5 0 010 2.4z" />
    </>
  ),
  'more-h': (
    <>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  'more-v': (
    <>
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  'chevron-left': <path d="M15 6l-6 6 6 6" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  'arrow-up': (
    <>
      <path d="M12 19V6" />
      <path d="M6 11l6-6 6 6" />
    </>
  ),
  'arrow-down': (
    <>
      <path d="M12 5v13" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h13" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  fire: (
    <>
      <path d="M12 22c4 0 7-2.8 7-6.5 0-3-2-5-3.5-6.5C14 7.5 14 6 14 4c-2 1.5-4 4-4 6.5 0 .8-1 1-1.5.3-.5-.7-1-1.6-1.5-2.3-1 2-2 4-2 6.5C5 19.2 8 22 12 22z" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="2.75" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5L13 13l-4.5 2.5L11 11z" fill="currentColor" stroke="none" />
    </>
  ),
  'trending-up': (
    <>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M14 7h6v6" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14c.8 1.5 2.2 2.5 4 2.5s3.2-1 4-2.5" />
      <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M3 13h18" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2" />
      <path d="M10 21v-3h4v3" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  alert: (
    <>
      <path d="M12 3l10 17H2z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </>
  ),
  send: (
    <>
      <path d="M21 4L3 11l7 2 2 7 9-16z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 3 2 3H5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" />
    </>
  ),
  star: (
    <>
      <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9L6.6 19.7l1-6L3.2 9.4l6.1-.9z" />
    </>
  ),
};
