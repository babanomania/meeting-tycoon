import type { Kpis, KpiKey } from '@/game/types';
import { KPI_META } from './KpiBadge';
import { Icon } from './Icon';

const ORDER: KpiKey[] = [
  'productivity',
  'morale',
  'burnout',
  'alignment',
  'executiveConfidence',
  'visibility',
];

const BAR_COLORS: Record<KpiKey, string> = {
  productivity: 'bg-emerald-500',
  morale: 'bg-amber-500',
  burnout: 'bg-rose-500',
  alignment: 'bg-sky-500',
  executiveConfidence: 'bg-brand-600',
  visibility: 'bg-violet-500',
};

/**
 * Compact KPI strip — three-column grid of mini stat cards.
 * Used at the top of Overview, the chaos modal preview, and the game-over screen.
 */
export function KpiStrip({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ORDER.map((k) => {
        const meta = KPI_META[k];
        const v = kpis[k];
        return (
          <div key={k} className="rounded-md bg-white border border-ink-100 px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-ink-400">
              <Icon name={meta.icon} size={13} className={meta.color} />
              <span className="truncate">{meta.short}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[17px] font-bold text-ink-800 tabular-nums leading-none">{v}</span>
              <span className="text-[9px] text-ink-300 font-medium">/100</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-ink-100 overflow-hidden">
              <div
                className={`h-full ${BAR_COLORS[k]} rounded-full transition-all`}
                style={{ width: `${v}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
