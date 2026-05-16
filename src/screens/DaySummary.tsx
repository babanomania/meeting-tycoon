import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { KPI_META } from '@/components/KpiBadge';
import { Icon, type IconName } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { characterDisplayName } from '@/game/characters';
import type { KpiKey } from '@/game/types';

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.6,
  hue: Math.floor(Math.random() * 360),
  rotate: Math.random() * 360,
}));

export function DaySummary() {
  const result = useGame((s) => s.lastResult);
  const day = useGame((s) => s.day);
  const continueToNextDay = useGame((s) => s.continueToNextDay);
  const resetGame = useGame((s) => s.resetGame);
  const setScreen = useGame((s) => s.setScreen);

  if (!result) {
    return (
      <div className="p-6 text-center text-sm text-ink-500">
        No day result yet.{' '}
        <button className="text-brand-600 underline" onClick={() => setScreen('calendar')}>
          Open calendar
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Confetti (the one moment we earn celebration emoji-adjacent) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c) => (
          <span
            key={c.id}
            className="absolute top-[-20px] w-2 h-3 rounded-sm animate-confetti"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              backgroundColor: `hsl(${c.hue} 85% 60%)`,
              transform: `rotate(${c.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className="px-5 pt-4 pb-2 flex items-center justify-between relative">
        <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
          Stage 1 · Day {day}
        </div>
        <button onClick={resetGame} className="text-[11px] text-ink-400 hover:text-ink-600">
          Restart
        </button>
      </div>

      <div className="px-5 text-center relative pt-3 pb-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center"
        >
          <Icon name="check" size={28} />
        </motion.div>
        <div className="text-[22px] font-extrabold text-ink-800 mt-2 leading-tight">
          Day {day} Complete
        </div>
        <div className="text-[12.5px] text-ink-500 mt-0.5">
          Survived. Let's see how you did.
        </div>
      </div>

      <div className="px-5 space-y-3 pb-5 relative">
        {/* Daily summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1 p-4"
        >
          <div className="text-[10.5px] font-bold tracking-widest uppercase text-ink-400 mb-2.5">
            Daily Summary
          </div>
          <div className="space-y-1.5 text-[13px]">
            <Row icon="calendar" label="Meetings Held" value={String(result.meetingsHeld)} />
            <Row icon="people" label="People Met" value={String(result.peopleMet)} />
            <Row icon="check" label="Decisions Made" value={String(result.decisionsMade)} />
            <Row icon="clock" label="Time in Meetings" value={`${result.timeInMeetingsHrs} hrs`} />
            <Row icon="briefcase" label="Actual Work Time" value={`${result.actualWorkHrs} hrs`} muted />
          </div>
        </motion.div>

        {/* KPI impact */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1 p-4"
        >
          <div className="text-[10.5px] font-bold tracking-widest uppercase text-ink-400 mb-2.5">
            KPI Impact
          </div>
          <div className="space-y-1.5">
            {(Object.keys(KPI_META) as KpiKey[]).map((k) => {
              const delta = result.kpiDelta[k] ?? 0;
              if (delta === 0) return null;
              const meta = KPI_META[k];
              return (
                <div key={k} className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 text-ink-700">
                    <Icon name={meta.icon} size={15} className={meta.color} />
                    {meta.label}
                  </span>
                  <span
                    className={`font-bold tabular-nums inline-flex items-center gap-0.5 ${
                      delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    <Icon name={delta >= 0 ? 'arrow-up' : 'arrow-down'} size={14} />
                    {Math.abs(delta)}
                  </span>
                </div>
              );
            })}
            {Object.values(result.kpiDelta).every((v) => !v) && (
              <div className="text-[12px] text-ink-400">No measurable change. A truly average day.</div>
            )}
          </div>
        </motion.div>

        {/* Boss feedback */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1 p-4"
        >
          <div className="text-[10.5px] font-bold tracking-widest uppercase text-ink-400 mb-2.5">
            Boss Feedback
          </div>
          <div className="flex items-start gap-3">
            <Avatar name={characterDisplayName('Your Boss')} size={36} />
            <div className="flex-1">
              <div className="text-[11.5px] text-ink-500">
                {characterDisplayName('Your Boss')} · just now
              </div>
              <p className="text-[13px] text-ink-700 mt-0.5 italic leading-snug">
                "{result.boss.text}"
              </p>
            </div>
          </div>
        </motion.div>

        <button onClick={continueToNextDay} className="pf-btn-primary w-full">
          Continue to Day {day + 1}
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  muted,
}: {
  icon: IconName;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`flex items-center gap-2 ${muted ? 'text-ink-400' : 'text-ink-700'}`}>
        <Icon name={icon} size={15} className="text-ink-400" />
        {label}
      </span>
      <span className="font-semibold text-ink-800 tabular-nums">{value}</span>
    </div>
  );
}
