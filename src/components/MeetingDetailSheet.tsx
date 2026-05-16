import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { MEETING_TYPES } from '@/game/data';
import { Icon, type IconName } from './Icon';
import { Avatar } from './Avatar';
import { Chip, type ChipTone } from './Chip';
import { KPI_META } from './KpiBadge';
import { characterDisplayName } from '@/game/characters';
import type { KpiKey, MeetingPriority } from '@/game/types';

function fmtTime(min: number) {
  const total = 9 * 60 + min;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const am = h < 12 ? 'AM' : 'PM';
  return `${hh}:${m.toString().padStart(2, '0')} ${am}`;
}

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

export function MeetingDetailSheet() {
  const uid = useGame((s) => s.detailUid);
  const schedule = useGame((s) => s.schedule);
  const closeDetail = useGame((s) => s.closeDetail);
  const removeScheduled = useGame((s) => s.removeScheduled);

  const meeting = uid ? schedule.find((m) => m.uid === uid) : null;
  const t = meeting ? MEETING_TYPES[meeting.typeId] : null;

  return (
    <AnimatePresence>
      {meeting && t && (
        <motion.div
          key="md-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDetail}
          className="absolute inset-0 z-40 bg-ink-800/40 backdrop-blur-sm flex items-end justify-center"
        >
          <motion.div
            key="md-sheet"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-xl shadow-el-4 overflow-hidden"
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink-200" />
            </div>

            <div className="px-4 pt-2 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[17px] font-bold text-ink-800 leading-tight">{t.title}</h2>
                    <Chip tone={priorityTone(t.priority)}>{t.priority.toUpperCase()}</Chip>
                  </div>
                  <div className="text-[12px] text-ink-500 mt-1">
                    {fmtTime(meeting.startMinutes)} – {fmtTime(meeting.startMinutes + t.durationMin)}
                    {' · '}
                    {t.durationMin} min
                  </div>
                </div>
                <button
                  onClick={closeDetail}
                  className="w-8 h-8 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-500 shrink-0"
                  aria-label="Close"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              {/* Metadata block */}
              <div className="mt-3 rounded-md border border-ink-100 bg-ink-50/50 px-3 py-2.5 space-y-1.5">
                {meeting.from && (
                  <Row icon="person" label="From">
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={characterDisplayName(meeting.from)} size={20} />
                      <span>{characterDisplayName(meeting.from)}</span>
                    </span>
                  </Row>
                )}
                <Row icon="people" label="Attendees">
                  <span>{t.attendees} people</span>
                </Row>
                <Row icon="clock" label="Duration">
                  <span>{t.durationMin} minutes</span>
                </Row>
                {meeting.recurring && (
                  <Row icon="clock" label="Cadence">
                    <span className="text-brand-700 font-semibold">Repeats daily</span>
                  </Row>
                )}
              </div>

              {/* Flavor */}
              <div className="mt-3 text-[12.5px] text-ink-600 italic leading-snug">
                {t.flavor}
              </div>

              {/* KPI impact */}
              <div className="mt-3">
                <div className="text-[10.5px] font-bold tracking-widest uppercase text-ink-400 mb-1.5">
                  Impact on your KPIs
                </div>
                <ImpactGrid delta={t.impact} />
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button onClick={closeDetail} className="pf-btn-ghost flex-1">
                  Keep on calendar
                </button>
                <button
                  onClick={() => removeScheduled(meeting.uid)}
                  className="pf-btn-secondary flex-1 !text-rose-700 !bg-rose-50 hover:!bg-rose-100 !border-rose-100"
                >
                  <Icon name="x" size={14} />
                  Remove
                </button>
              </div>
              {meeting.recurring && (
                <p className="mt-2 text-[10.5px] text-ink-400 text-center">
                  Removing also stops this from recurring tomorrow.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: IconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Icon name={icon} size={14} className="text-ink-400" />
      <span className="text-ink-400 w-20 shrink-0">{label}</span>
      <span className="text-ink-800 font-medium">{children}</span>
    </div>
  );
}

function ImpactGrid({ delta }: { delta: Record<string, number> }) {
  const entries = (Object.keys(delta) as KpiKey[]).filter((k) => (delta[k] ?? 0) !== 0);
  if (entries.length === 0) return <div className="text-[12px] text-ink-400">No measurable impact.</div>;
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      {entries.map((k) => {
        const v = delta[k] ?? 0;
        const m = KPI_META[k];
        return (
          <div key={k} className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-1.5 text-ink-600">
              <Icon name={m.icon} size={13} className={m.color} />
              <span>{m.label}</span>
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
