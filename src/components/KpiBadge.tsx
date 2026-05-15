import type { KpiKey } from '@/game/types';
import { Icon, type IconName } from './Icon';

interface Meta {
  label: string;
  short: string;
  icon: IconName;
  /** Tailwind text color */
  color: string;
  /** Hex for charts / mini bars */
  hex: string;
}

export const KPI_META: Record<KpiKey, Meta> = {
  productivity:        { label: 'Productivity',     short: 'Prod.',  icon: 'trending-up', color: 'text-emerald-600', hex: '#10B981' },
  morale:              { label: 'Morale',           short: 'Morale', icon: 'smile',       color: 'text-amber-600',   hex: '#F59E0B' },
  burnout:             { label: 'Burnout',          short: 'Burn.',  icon: 'fire',        color: 'text-rose-600',    hex: '#EF4444' },
  alignment:           { label: 'Alignment',        short: 'Align.', icon: 'compass',     color: 'text-sky-600',     hex: '#0EA5E9' },
  executiveConfidence: { label: 'Exec Confidence',  short: 'Exec.',  icon: 'briefcase',   color: 'text-brand-700',   hex: '#6C5CE7' },
  visibility:          { label: 'Visibility',       short: 'Vis.',   icon: 'eye',         color: 'text-violet-600',  hex: '#8B5CF6' },
};

/**
 * Compact one-line KPI row — used in summary lists and impact previews.
 * Pass either `value` (current state) or `delta` (impact preview), or both.
 */
export function KpiBadge({ k, value, delta }: { k: KpiKey; value?: number; delta?: number }) {
  const meta = KPI_META[k];
  return (
    <div className="flex items-center justify-between rounded-md bg-ink-50 px-3 py-2">
      <span className="flex items-center gap-2 text-sm">
        <span className={meta.color}>
          <Icon name={meta.icon} size={15} />
        </span>
        <span className="text-ink-700">{meta.label}</span>
      </span>
      <span className="text-sm font-semibold tabular-nums">
        {value !== undefined && <span className="text-ink-800">{value}</span>}
        {delta !== undefined && (
          <span className={`ml-2 inline-flex items-center gap-0.5 ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            <Icon name={delta >= 0 ? 'arrow-up' : 'arrow-down'} size={13} />
            {Math.abs(delta)}
          </span>
        )}
      </span>
    </div>
  );
}
