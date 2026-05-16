import { AnimatePresence, motion } from 'framer-motion';
import { useGame, DAILY_ACCEPT_CAP, pendingRequestsFor } from '@/game/store';
import { MEETING_TYPES, STAGE1_GOALS } from '@/game/data';
import { Icon } from '@/components/Icon';
import { MenuButton } from '@/components/SettingsDrawer';
import { isGoalAchieved, goalCurrentValue } from '@/components/GoalsCard';
import type { MeetingPriority, Kpis, Stakeholder } from '@/game/types';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function fmtTime(min: number) {
  const total = 9 * 60 + min;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const am = h < 12 ? 'AM' : 'PM';
  return `${hh}:${m.toString().padStart(2, '0')} ${am}`;
}

const PRIORITY_RAIL: Record<MeetingPriority, string> = {
  high:      'border-l-rose-500',
  medium:    'border-l-amber-500',
  low:       'border-l-emerald-500',
  recurring: 'border-l-brand-500',
  optional:  'border-l-ink-300',
  crisis:    'border-l-rose-600',
};
const PRIORITY_TINT: Record<MeetingPriority, string> = {
  high:      'bg-rose-50/70',
  medium:    'bg-amber-50/70',
  low:       'bg-emerald-50/70',
  recurring: 'bg-brand-50/70',
  optional:  'bg-ink-50',
  crisis:    'bg-rose-100/80',
};

function dayLabel(day: number) {
  switch (day) {
    case 1: return 'Monday';
    case 2: return 'Tuesday';
    case 3: return 'Wednesday';
    case 4: return 'Thursday';
    case 5: return 'Friday';
    default: {
      const week = Math.floor((day - 1) / 5) + 1;
      const wd = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][(day - 1) % 5];
      return `${wd} · Week ${week}`;
    }
  }
}

export function CalendarScreen() {
  const schedule = useGame((s) => s.schedule);
  const accepted = useGame((s) => s.acceptedRequestIds);
  const day = useGame((s) => s.day);
  const setScreen = useGame((s) => s.setScreen);
  const endDay = useGame((s) => s.endDay);
  const openDetail = useGame((s) => s.openDetail);
  const kpis = useGame((s) => s.kpis);
  const stakeholders = useGame((s) => s.stakeholders);

  const totalMin = schedule.reduce((a, m) => a + MEETING_TYPES[m.typeId].durationMin, 0);
  const focusHrs = Math.max(0, Math.round(((540 - totalMin) / 60) * 10) / 10);
  const loadHrs = Math.round((totalMin / 60) * 10) / 10;

  const pendingCount = pendingRequestsFor(day, accepted, schedule).length;
  const acceptsToday = accepted.filter(
    (id) => !id.startsWith('decline:') && !id.startsWith('recurring:'),
  ).length;
  const acceptsLeft = Math.max(0, DAILY_ACCEPT_CAP - acceptsToday);

  return (
    <div className="flex flex-col h-full">
      {/* App bar */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 border-b border-ink-100">
        <MenuButton />
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
            Stage 1 · Day {day}
          </div>
          <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">
            {dayLabel(day)}
          </h1>
        </div>
        <button
          onClick={() => setScreen('inbox')}
          className="relative inline-flex items-center gap-1.5 h-9 px-3 rounded-sm bg-brand-50 text-brand-700 border border-brand-100 font-semibold text-[12px] hover:bg-brand-100"
        >
          <Icon name="inbox" size={14} />
          Inbox
          {pendingCount > 0 && (
            <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-brand-600 text-white text-[10px] font-bold px-1 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Goals pill row — always visible reminder of what you're chasing this week */}
      <GoalsPillRow kpis={kpis} stakeholders={stakeholders} onTap={() => setScreen('metrics')} />

      {/* Capacity row */}
      <div className="px-5 py-2.5 bg-ink-50/60 border-b border-ink-100 flex items-center justify-between text-[11.5px]">
        <span className="text-ink-500">
          <span className="font-semibold text-ink-700">{schedule.length}</span> on calendar
          {' · '}
          <span className="font-semibold text-ink-700">{loadHrs}h</span> booked
          {' · '}
          <span className="font-semibold text-emerald-700">{focusHrs}h</span> focus
        </span>
        <span className={`font-semibold ${acceptsLeft === 0 ? 'text-rose-600' : 'text-ink-500'}`}>
          {acceptsLeft}/{DAILY_ACCEPT_CAP} accepts left
        </span>
      </div>

      {/* Agenda grid */}
      <div className="flex-1 overflow-y-auto phone-scroll px-5 pt-3 pb-3">
        <AgendaGrid schedule={schedule} onTapMeeting={openDetail} onGoToInbox={() => setScreen('inbox')} />
      </div>

      {/* End Day footer */}
      <div className="px-5 pt-3 pb-4 border-t border-ink-100 bg-white">
        <button
          onClick={() => {
            endDay();
            if (!useGame.getState().gameOver) setScreen('day-summary');
          }}
          disabled={schedule.length === 0}
          className="pf-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          End Day {day}
          <Icon name="chevron-right" size={16} />
        </button>
        {schedule.length === 0 && (
          <p className="mt-2 text-[10.5px] text-ink-400 text-center">
            Accept at least one meeting to end the day.
          </p>
        )}
      </div>
    </div>
  );
}

function GoalsPillRow({
  kpis,
  stakeholders,
  onTap,
}: {
  kpis: Kpis;
  stakeholders: Stakeholder[];
  onTap: () => void;
}) {
  const hits = STAGE1_GOALS.filter((g) =>
    isGoalAchieved(g, goalCurrentValue(g, kpis, stakeholders)),
  ).length;
  return (
    <button
      onClick={onTap}
      className="w-full px-5 py-2 border-b border-ink-100 flex items-center gap-2 text-left hover:bg-ink-50 transition"
    >
      <Icon name="target" size={13} className="text-brand-600 shrink-0" />
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500 shrink-0">
        Goals
      </span>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {STAGE1_GOALS.map((g) => {
          const v = goalCurrentValue(g, kpis, stakeholders);
          const ok = isGoalAchieved(g, v);
          return (
            <span
              key={g.id}
              title={`${g.label}: ${v} / ${g.target}`}
              className={`flex-1 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-ink-200'}`}
            />
          );
        })}
      </div>
      <span className="text-[11px] font-bold text-ink-600 tabular-nums shrink-0">
        {hits}/{STAGE1_GOALS.length}
      </span>
      <Icon name="chevron-right" size={13} className="text-ink-400 shrink-0" />
    </button>
  );
}

function AgendaGrid({
  schedule,
  onTapMeeting,
  onGoToInbox,
}: {
  schedule: ReturnType<typeof useGame.getState>['schedule'];
  onTapMeeting: (uid: string) => void;
  onGoToInbox: () => void;
}) {
  return (
    <div className="relative">
      {HOURS.map((h, idx) => (
        <div key={h} className="flex gap-3 h-14 items-start">
          <div className="w-10 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 text-right">
            {h > 12 ? h - 12 : h} {h < 12 ? 'AM' : 'PM'}
          </div>
          <div className="flex-1 border-t border-dashed border-ink-100 relative">
            {idx === HOURS.length - 1 && (
              <div className="absolute inset-x-0 bottom-0 border-b border-dashed border-ink-100" />
            )}
          </div>
        </div>
      ))}
      <div className="absolute inset-y-0 left-[52px] right-1">
        <AnimatePresence>
          {schedule.map((m) => {
            const t = MEETING_TYPES[m.typeId];
            const top = (m.startMinutes / 60) * 56;
            const height = (t.durationMin / 60) * 56 - 4;
            const short = height < 36;
            return (
              <motion.button
                layout
                key={m.uid}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => onTapMeeting(m.uid)}
                className={`absolute left-0 right-0 rounded-sm border border-l-[3px] ${PRIORITY_RAIL[t.priority]} ${PRIORITY_TINT[t.priority]} border-ink-100/70 px-2.5 py-1.5 text-left transition active:scale-[0.99] overflow-hidden`}
                style={{ top, height }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[12.5px] font-semibold text-ink-800 truncate leading-tight flex items-center gap-1">
                    {m.recurring && <Icon name="clock" size={11} className="text-brand-600 shrink-0" />}
                    <span className="truncate">{t.title}</span>
                  </div>
                  <span className="flex items-center text-[10.5px] text-ink-500 gap-1 shrink-0">
                    <Icon name="people" size={13} />
                    {t.attendees}
                  </span>
                </div>
                {!short && (
                  <div className="text-[10px] text-ink-500 mt-0.5 leading-tight">
                    {fmtTime(m.startMinutes)} – {fmtTime(m.startMinutes + t.durationMin)}
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {schedule.length === 0 && (
          <div className="absolute inset-x-0 top-24 text-center px-6">
            <div className="inline-flex w-12 h-12 rounded-full bg-ink-100 text-ink-400 items-center justify-center">
              <Icon name="calendar" size={22} />
            </div>
            <div className="mt-2 text-[13.5px] font-semibold text-ink-700">Calendar is empty.</div>
            <div className="text-[11.5px] text-ink-400 mt-0.5">
              That feels like a career-limiting move.
            </div>
            <button onClick={onGoToInbox} className="mt-3 pf-btn-secondary">
              Open inbox
              <Icon name="chevron-right" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
