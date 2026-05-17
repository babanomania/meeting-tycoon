import type { Kpis, QuarterlyGoal, Stakeholder } from '@/game/types';
import { Icon, type IconName } from './Icon';

interface Props {
  goals: QuarterlyGoal[];
  kpis: Kpis;
  stakeholders: Stakeholder[];
}

/** Map quarterly goal id → icon name. Avoids leaking emoji strings to the UI. */
const GOAL_ICON: Record<string, IconName> = {
  // Stage 1
  'g-boss':       'briefcase',
  'g-alignment':  'compass',
  'g-visibility': 'eye',
  'g-burnout':    'fire',
  'g-confidence': 'star',
  // Stage 2
  'g2-visibility': 'eye',
  'g2-boss':       'briefcase',
  'g2-chro':       'people',
  'g2-prod':       'sparkle',
  'g2-burnout':    'fire',
  // Stage 3
  'g3-boss':       'briefcase',
  'g3-cfo':        'briefcase',
  'g3-coalition':  'people',
  'g3-velocity':   'sparkle',
  'g3-burnout':    'fire',
  // Stage 4
  'g4-boss':       'briefcase',
  'g4-ceo':        'briefcase',
  'g4-alignment':  'people',
  'g4-visibility': 'eye',
  'g4-burnout':    'fire',
};

/** Read the current value behind a goal — KPI or stakeholder relationship. */
function goalCurrentValue(g: QuarterlyGoal, kpis: Kpis, stakeholders: Stakeholder[]): number {
  if (g.kpi) return kpis[g.kpi];
  if (g.stakeholderId) {
    const s = stakeholders.find((x) => x.id === g.stakeholderId);
    return s?.relationship ?? 0;
  }
  return 0;
}

function isAchieved(g: QuarterlyGoal, current: number): boolean {
  return g.lowerIsBetter ? current <= g.target : current >= g.target;
}

function goalProgress(g: QuarterlyGoal, current: number): number {
  if (g.lowerIsBetter) {
    return Math.max(0, Math.min(100, ((100 - current) / (100 - g.target)) * 100));
  }
  return Math.max(0, Math.min(100, (current / g.target) * 100));
}

export function GoalsCard({ goals, kpis, stakeholders }: Props) {
  const hits = goals.filter((g) => isAchieved(g, goalCurrentValue(g, kpis, stakeholders))).length;
  return (
    <div className="bg-white rounded-md border border-ink-100 shadow-el-1 px-4 py-3.5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase">
          Quarterly Goals
        </div>
        <span className="text-[11px] font-semibold text-ink-500 tabular-nums">
          {hits} / {goals.length} hit
        </span>
      </div>
      <ul className="space-y-3">
        {goals.map((g) => {
          const v = goalCurrentValue(g, kpis, stakeholders);
          const pct = goalProgress(g, v);
          const ok = isAchieved(g, v);
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

/** Helpers re-exported so other surfaces (Calendar pill, etc.) can compute the same thing. */
export { isAchieved as isGoalAchieved, goalCurrentValue, goalProgress };
