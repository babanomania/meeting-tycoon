import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type ChipTone =
  | 'high'
  | 'medium'
  | 'low'
  | 'recurring'
  | 'optional'
  | 'crisis'
  | 'neutral';

const TONES: Record<ChipTone, { wrap: string; icon?: IconName }> = {
  high:      { wrap: 'bg-rose-50 text-rose-700 border border-rose-100',       icon: 'flag' },
  medium:    { wrap: 'bg-amber-50 text-amber-700 border border-amber-100',     icon: 'shield' },
  low:       { wrap: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: 'smile' },
  recurring: { wrap: 'bg-brand-50 text-brand-700 border border-brand-100',      icon: 'clock' },
  optional:  { wrap: 'bg-ink-100 text-ink-600 border border-ink-200',           icon: 'smile' },
  crisis:    { wrap: 'bg-rose-600 text-white border border-rose-700',           icon: 'alert' },
  neutral:   { wrap: 'bg-ink-100 text-ink-700 border border-ink-200' },
};

interface Props {
  tone?: ChipTone;
  children: ReactNode;
  /** Override the default icon for the tone. Pass null to hide the icon entirely. */
  icon?: IconName | null;
}

export function Chip({ tone = 'neutral', children, icon }: Props) {
  const t = TONES[tone];
  const i = icon === undefined ? t.icon : icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 h-[22px] rounded-full text-[10.5px] font-semibold tracking-tight ${t.wrap}`}>
      {i && <Icon name={i} size={12} />}
      {children}
    </span>
  );
}
