import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { Icon, type IconName } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import type { ActivityKind } from '@/game/types';

const KIND_META: Record<
  ActivityKind,
  { icon: IconName; tone: string; label: string }
> = {
  'meeting-scheduled':  { icon: 'calendar',     tone: 'bg-brand-50 text-brand-700',        label: 'Scheduled' },
  'meeting-removed':    { icon: 'x',            tone: 'bg-ink-100 text-ink-600',           label: 'Removed' },
  'meeting-declined':   { icon: 'arrow-down',   tone: 'bg-rose-50 text-rose-700',          label: 'Declined' },
  'chaos-attended':     { icon: 'alert',        tone: 'bg-rose-50 text-rose-700',          label: 'Attended' },
  'chaos-delegated':    { icon: 'send',         tone: 'bg-amber-50 text-amber-700',        label: 'Delegated' },
  'chaos-rescheduled':  { icon: 'clock',        tone: 'bg-sky-50 text-sky-700',            label: 'Rescheduled' },
};

export function Activity() {
  const list = useGame((s) => s.activityToday);
  const day = useGame((s) => s.day);

  return (
    <div className="flex flex-col h-full">
      {/* Top app bar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-ink-100">
        <div>
          <div className="font-semibold text-ink-800 text-[15px]">Activity</div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
            Day {day} · Today
          </div>
        </div>
        <button className="w-8 h-8 rounded-md hover:bg-ink-50 flex items-center justify-center text-ink-500">
          <Icon name="more-h" size={18} />
        </button>
      </div>

      <div className="px-5 py-4">
        {list.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-flex w-12 h-12 rounded-full bg-ink-100 text-ink-400 items-center justify-center">
              <Icon name="bell" size={20} />
            </div>
            <div className="mt-2 text-[13px] font-semibold text-ink-600">
              Suspiciously quiet today.
            </div>
            <div className="text-[11px] text-ink-400 mt-0.5">
              Accept or decline a meeting to start the show.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {list.map((it, idx) => {
              const meta = KIND_META[it.kind];
              return (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="py-3 flex items-start gap-3"
                >
                  {it.from ? (
                    <div className="relative shrink-0">
                      <Avatar name={it.from} size={32} />
                      <span
                        className={`absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full ring-2 ring-white flex items-center justify-center ${meta.tone}`}
                      >
                        <Icon name={meta.icon} size={11} />
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${meta.tone}`}
                    >
                      <Icon name={meta.icon} size={14} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-semibold text-ink-800 truncate">
                        {it.title}
                      </div>
                      <div className="text-[10.5px] text-ink-400 tabular-nums whitespace-nowrap">
                        {fmt(it.ts)}
                      </div>
                    </div>
                    {it.detail && (
                      <div className="text-[11.5px] text-ink-500 mt-0.5 leading-snug">
                        {it.detail}
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function fmt(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m} ${ap}`;
}
