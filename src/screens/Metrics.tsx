import { motion } from 'framer-motion';
import { useGame, STARTING_KPIS } from '@/game/store';
import { COMPANY, RISK_ALERTS, STAGE1_GOALS } from '@/game/data';
import { KPI_META } from '@/components/KpiBadge';
import { Sparkline } from '@/components/Sparkline';
import { Icon } from '@/components/Icon';
import { GoalsCard } from '@/components/GoalsCard';
import type { KpiKey } from '@/game/types';

const ORDER: KpiKey[] = [
  'productivity',
  'morale',
  'burnout',
  'alignment',
  'executiveConfidence',
  'visibility',
];

export function Metrics() {
  const kpis = useGame((s) => s.kpis);
  const history = useGame((s) => s.history);
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
            Stage {stage} · Day {day}
          </div>
          <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">Metrics</h1>
        </div>
        <button className="w-8 h-8 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-500">
          <Icon name="settings" size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll px-5 py-4 space-y-4">
        {/* Quarterly Goals — the actionable summary up top */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <GoalsCard goals={STAGE1_GOALS} kpis={kpis} />
        </motion.div>

        {/* KPI deep-dive */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="text-[10.5px] font-bold tracking-widest text-ink-400 mb-2 uppercase">
            KPI Performance
          </div>
          <div className="space-y-2">
            {ORDER.map((k, idx) => {
              const meta = KPI_META[k];
              const series = [STARTING_KPIS[k], ...history.map((h) => h[k])];
              const prev = series.length >= 2 ? series[series.length - 2] : STARTING_KPIS[k];
              const delta = kpis[k] - prev;
              return (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.03 }}
                  className="bg-white rounded-md border border-ink-100 shadow-el-1 p-3.5 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-sm bg-ink-50 flex items-center justify-center shrink-0">
                    <Icon name={meta.icon} size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                      {meta.label}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[22px] font-bold text-ink-800 tabular-nums leading-none">
                        {kpis[k]}
                      </span>
                      <span className="text-[10px] text-ink-300">/100</span>
                      {history.length > 0 && delta !== 0 && (
                        <span
                          className={`text-[11px] font-bold tabular-nums inline-flex items-center gap-0.5 ${
                            delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          <Icon name={delta > 0 ? 'arrow-up' : 'arrow-down'} size={13} />
                          {Math.abs(delta)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Sparkline values={series} color={meta.hex} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Company Snapshot — moved here from Overview */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-sm bg-brand-50 text-brand-700 flex items-center justify-center">
              <Icon name="building" size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase">
                {COMPANY.name}
              </div>
              <div className="text-[11.5px] text-ink-500 truncate">{COMPANY.tagline}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <SnapStat label="Employees" value={String(COMPANY.employees)} />
            <SnapStat label="Departments" value={String(COMPANY.departments)} />
            <SnapStat label="Mtgs/wk" value={String(COMPANY.meetingsPerWeek)} />
            <SnapStat label="Actual Work" value={`${COMPANY.actualWorkPct}%`} tone="bad" />
            <SnapStat label="In Meetings" value={`${COMPANY.timeInMeetingsPct}%`} tone="bad" />
            <SnapStat label="Email Threads" value="∞" tone="bad" />
          </div>
        </motion.div>

        {/* Risk alerts */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1 p-4"
        >
          <div className="text-[10.5px] font-bold tracking-widest text-ink-400 mb-2 uppercase">
            Risk Alerts
          </div>
          <ul className="space-y-1.5">
            {RISK_ALERTS.map((a) => (
              <li key={a.text} className="flex items-start gap-2.5 text-[13px] text-ink-700">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    a.tone === 'danger' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="pt-1 text-center text-[11px] text-ink-300">
          {history.length === 0
            ? 'Play a day to start the chart.'
            : `Tracking ${history.length} day${history.length === 1 ? '' : 's'} of corporate evidence.`}
        </div>
      </div>
    </div>
  );
}

function SnapStat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'bad';
}) {
  return (
    <div className="rounded-sm bg-ink-50 px-2.5 py-2">
      <div className={`text-[18px] font-bold tabular-nums leading-tight ${tone === 'bad' ? 'text-rose-600' : 'text-ink-800'}`}>
        {value}
      </div>
      <div className="text-[9.5px] uppercase tracking-wider text-ink-400 mt-0.5 font-semibold">
        {label}
      </div>
    </div>
  );
}
