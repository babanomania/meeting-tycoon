import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame, DAILY_ACCEPT_CAP, projectKpis, pendingRequestsFor } from '@/game/store';
import { MEETING_TYPES, STAGE1_GOALS } from '@/game/data';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { Chip, type ChipTone } from '@/components/Chip';
import { KPI_META } from '@/components/KpiBadge';
import type { KpiKey, MeetingPriority, QuarterlyGoal, Kpis, KpiDelta } from '@/game/types';

function priorityTone(p: MeetingPriority): ChipTone {
  switch (p) {
    case 'high':      return 'high';
    case 'medium':    return 'medium';
    case 'low':       return 'low';
    case 'recurring': return 'recurring';
    case 'optional':  return 'optional';
    case 'crisis':    return 'crisis';
  }
}

const PRIORITY_RAIL: Record<MeetingPriority, string> = {
  high:      'border-l-rose-500',
  medium:    'border-l-amber-500',
  low:       'border-l-emerald-500',
  recurring: 'border-l-brand-500',
  optional:  'border-l-ink-300',
  crisis:    'border-l-rose-600',
};

export function InboxScreen() {
  const day = useGame((s) => s.day);
  const accepted = useGame((s) => s.acceptedRequestIds);
  const kpis = useGame((s) => s.kpis);
  const acceptRequest = useGame((s) => s.acceptRequest);
  const declineRequest = useGame((s) => s.declineRequest);
  const setScreen = useGame((s) => s.setScreen);

  const schedule = useGame((s) => s.schedule);
  const openRequests = useMemo(
    () => pendingRequestsFor(day, accepted, schedule),
    [day, accepted, schedule],
  );
  const acceptsToday = accepted.filter(
    (id) => !id.startsWith('decline:') && !id.startsWith('recurring:'),
  ).length;
  const acceptsLeft = Math.max(0, DAILY_ACCEPT_CAP - acceptsToday);
  const capReached = acceptsLeft === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
            Inbox · Day {day}
          </div>
          <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">
            {openRequests.length} pending {openRequests.length === 1 ? 'request' : 'requests'}
          </h1>
        </div>
        <button
          onClick={() => setScreen('calendar')}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-sm bg-ink-100 text-ink-700 font-semibold text-[12px] hover:bg-ink-200"
        >
          <Icon name="calendar" size={14} />
          Calendar
        </button>
      </div>

      {/* Capacity hint */}
      <div
        className={`px-5 py-2.5 border-b border-ink-100 text-[11.5px] flex items-center gap-2 ${
          capReached ? 'bg-rose-50 text-rose-700' : 'bg-amber-50/60 text-amber-800'
        }`}
      >
        <Icon name={capReached ? 'alert' : 'shield'} size={14} />
        <span>
          {capReached ? (
            <>You've hit today's <b>{DAILY_ACCEPT_CAP}-meeting cap</b>. Decline the rest or end the day.</>
          ) : (
            <>You can accept <b>{acceptsLeft}</b> more {acceptsLeft === 1 ? 'meeting' : 'meetings'} today. Choose wisely.</>
          )}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll px-5 pt-3 pb-5">
        {openRequests.length === 0 ? (
          <EmptyInbox onGoCalendar={() => setScreen('calendar')} />
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {openRequests.map((r) => {
                const t = MEETING_TYPES[r.typeId];
                return (
                  <motion.div
                    key={r.uid}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className={`bg-white rounded-md border border-ink-100 border-l-[3px] ${PRIORITY_RAIL[t.priority]} shadow-el-1`}
                  >
                    <div className="px-3 pt-3 pb-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="font-semibold text-ink-800 text-[14px] truncate flex-1">
                          {t.title}
                        </div>
                        <Chip tone={priorityTone(t.priority)}>{t.priority.toUpperCase()}</Chip>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-ink-500">
                        <Avatar name={r.from} size={20} />
                        <span className="font-medium text-ink-700">{r.from}</span>
                        <span className="text-ink-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" size={13} />
                          {t.durationMin}m
                        </span>
                        <span className="text-ink-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="people" size={13} />
                          {t.attendees}
                        </span>
                      </div>
                      <div className="text-[12px] text-ink-600 mt-2 italic leading-snug">"{r.note}"</div>
                      <div className="text-[11px] text-ink-400 mt-1 leading-snug">{t.flavor}</div>

                      <ImpactRow delta={t.impact} />
                      <GoalProjection delta={t.impact} kpis={kpis} />

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => acceptRequest(r.uid)}
                          disabled={capReached}
                          className="pf-btn-primary h-9 px-3 text-[12.5px] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineRequest(r.uid)}
                          className="pf-btn-ghost h-9 px-3 text-[12.5px]"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyInbox({ onGoCalendar }: { onGoCalendar: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center">
        <Icon name="check" size={22} />
      </div>
      <div className="mt-2 text-[14px] font-semibold text-ink-700">Inbox zero.</div>
      <div className="text-[11.5px] text-ink-400 mt-0.5">Briefly. (It won't last.)</div>
      <button onClick={onGoCalendar} className="mt-3 pf-btn-secondary">
        Back to calendar
        <Icon name="chevron-right" size={14} />
      </button>
    </div>
  );
}

function ImpactRow({ delta }: { delta: KpiDelta }) {
  const entries = (Object.keys(delta) as KpiKey[]).filter((k) => (delta[k] ?? 0) !== 0);
  if (entries.length === 0) return null;
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
      {entries.slice(0, 6).map((k) => {
        const v = delta[k] ?? 0;
        const meta = KPI_META[k];
        return (
          <div key={k} className="flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Icon name={meta.icon} size={13} className={meta.color} />
              <span>{meta.label}:</span>
            </span>
            <span className={`font-bold tabular-nums ${v >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {v >= 0 ? '+' : ''}{v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Show how this meeting moves the player toward / away from any active quarterly goal. */
function GoalProjection({ delta, kpis }: { delta: KpiDelta; kpis: Kpis }) {
  const projected = projectKpis(kpis, delta);
  const movements = STAGE1_GOALS.flatMap((g) => projectGoalMovement(g, kpis, projected));
  if (movements.length === 0) return null;
  return (
    <div className="mt-2 rounded-sm bg-ink-50 px-2.5 py-1.5 space-y-0.5">
      {movements.map((m) => (
        <div key={m.id} className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-ink-500">
            <Icon name="target" size={11} className="text-brand-600" />
            <span className="truncate">{m.label}</span>
          </span>
          <span className={`font-bold tabular-nums ${m.good ? 'text-emerald-600' : 'text-rose-600'}`}>
            {m.from} → {m.to} / {m.target}
          </span>
        </div>
      ))}
    </div>
  );
}

function projectGoalMovement(g: QuarterlyGoal, before: Kpis, after: Kpis) {
  const bv = before[g.kpi];
  const av = after[g.kpi];
  if (bv === av) return [];
  const target = g.target;
  // For lowerIsBetter goals, "good" = went down toward the cap, "bad" = went up.
  const good = g.lowerIsBetter ? av < bv : av > bv;
  return [
    {
      id: g.id,
      label: g.label,
      from: bv,
      to: av,
      target,
      good,
    },
  ];
}
