import type { Kpis, QuarterlyGoal } from '@/game/types';
import { Icon, type IconName } from './Icon';

interface Props {
  goals: QuarterlyGoal[];
  kpis: Kpis;
}

/** Map quarterly goal id → icon name. Avoids leaking emoji strings to the UI. */
const GOAL_ICON: Record<string, IconName> = {
  'g-alignment':  'compass',
  'g-visibility': 'eye',
  'g-burnout':    'fire',
  'g-confidence': 'briefcase',
};

export function GoalsCard({ goals, kpis }: Props) {
  return (
    <div className="bg-white rounded-md border border-ink-100 shadow-el-1 px-4 py-3.5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase">
          Quarterly Goals
        </div>
        <span className="text-[11px] font-semibold text-ink-500 tabular-nums">
          {goals.filter((g) => isAchieved(g, kpis)).length} / {goals.length} hit
        </span>
      </div>
      <ul className="space-y-3">
        {goals.map((g) => {
          const v = kpis[g.kpi];
          const pct = goalProgress(g, kpis);
          const ok = isAchieved(g, kpis);
          return (
            <li key={g.id}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-ink-700">
                  <Icon name={GOAL_ICON[g.id] ?? 'target'} size={15} className="text-ink-400" />
                  <span className="truncate">{g.label}</span>
                </span>
                <span
                  className={`text-[11.5px] font-bold tabular-nums inline-flex items-center gap-1 ${
                    ok ? 'text-emerald-600' : 'text-ink-500'
                  }`}
                >
                  {ok && <Icon name="check" size={13} />}
                  <span>{v} / {g.target}</span>
                  {g.lowerIsBetter && <Icon name="arrow-down" size={12} />}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    ok ? 'bg-emerald-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function isAchieved(g: QuarterlyGoal, kpis: Kpis): boolean {
  return g.lowerIsBetter ? kpis[g.kpi] <= g.target : kpis[g.kpi] >= g.target;
}

function goalProgress(g: QuarterlyGoal, kpis: Kpis): number {
  if (g.lowerIsBetter) {
    const v = kpis[g.kpi];
    return Math.max(0, Math.min(100, ((100 - v) / (100 - g.target)) * 100));
  }
  return Math.max(0, Math.min(100, (kpis[g.kpi] / g.target) * 100));
}
