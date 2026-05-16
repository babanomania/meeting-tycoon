import { useState } from 'react';
import { characterPhoto } from '@/game/characters';

/**
 * Avatar — colored circle with initials, or a real AI-generated photo when the
 * name maps to a registered character profile.
 * Color is deterministic from the name (hash → palette index).
 */
const PALETTE = [
  { bg: '#E0E7FF', fg: '#3730A3' }, // indigo
  { bg: '#DCFCE7', fg: '#166534' }, // emerald
  { bg: '#FEF3C7', fg: '#92400E' }, // amber
  { bg: '#FCE7F3', fg: '#9D174D' }, // pink
  { bg: '#DBEAFE', fg: '#1E40AF' }, // blue
  { bg: '#EDE9FE', fg: '#5B21B6' }, // violet
  { bg: '#CCFBF1', fg: '#115E59' }, // teal
  { bg: '#FFE4E6', fg: '#9F1239' }, // rose
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface Props {
  name: string;
  /** Optional explicit photo URL override. If unset, looked up from the character roster. */
  src?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 28, className }: Props) {
  const photoUrl = src ?? characterPhoto(name);
  const [imgFailed, setImgFailed] = useState(false);
  const c = PALETTE[hash(name) % PALETTE.length];
  const fontSize = Math.max(10, Math.round(size * 0.42));

  // Render real photo when we have one and it loaded.
  if (photoUrl && !imgFailed) {
    return (
      <div
        className={`relative inline-block rounded-full overflow-hidden select-none ${className ?? ''}`}
        style={{ width: size, height: size, background: c.bg }}
        aria-label={name}
        title={name}
      >
        {/* Initials shown behind the photo so they peek through during load + fade in via the img above */}
        <span
          className="absolute inset-0 flex items-center justify-center font-semibold"
          style={{ color: c.fg, fontSize, lineHeight: 1 }}
        >
          {initials(name)}
        </span>
        <img
          src={photoUrl}
          alt={name}
          loading="lazy"
          width={size}
          height={size}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Fallback: initials in a colored circle.
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold select-none ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: c.bg,
        color: c.fg,
        fontSize,
        lineHeight: 1,
      }}
      aria-label={name}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

/**
 * AvatarStack — overlapping avatars + "+N" overflow. Used in meeting cards
 * and the Inbox to show attendees / mentions.
 */
interface StackProps {
  names: string[];
  max?: number;
  size?: number;
  /** When the real attendee count is greater than `names.length`, the overflow chip shows the difference. */
  totalCount?: number;
}

export function AvatarStack({ names, max = 3, size = 22, totalCount }: StackProps) {
  const shown = names.slice(0, max);
  const total = totalCount ?? names.length;
  const overflow = total - shown.length;
  return (
    <div className="inline-flex items-center">
      {shown.map((n, i) => (
        <div
          key={`${n}-${i}`}
          style={{ marginLeft: i === 0 ? 0 : -size * 0.28, zIndex: max - i }}
          className="ring-2 ring-white rounded-full"
        >
          <Avatar name={n} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ marginLeft: -size * 0.28, width: size, height: size, fontSize: Math.max(9, size * 0.38) }}
          className="ring-2 ring-white rounded-full bg-ink-100 text-ink-600 font-semibold flex items-center justify-center"
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
