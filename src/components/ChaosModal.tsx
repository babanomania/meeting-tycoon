import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { CHAOS_EVENTS } from '@/game/data';
import { Avatar } from './Avatar';
import { Icon, type IconName } from './Icon';
import { KPI_META } from './KpiBadge';
import { characterDisplayName } from '@/game/characters';
import type { KpiDelta, KpiKey } from '@/game/types';

/** Map chaos id → header icon, so we don't reach for the emoji bag. */
const CHAOS_ICON: Record<string, IconName> = {
  'ceo-quick-sync':  'alert',
  'reply-all-storm': 'mail',
  'mandatory-fun':   'sparkle',
  'linkedin-post':   'sparkle',
};

export function ChaosModal() {
  const active = useGame((s) => s.activeChaos);
  const resolve = useGame((s) => s.resolveChaos);

  const ev = active ? CHAOS_EVENTS.find((e) => e.id === active.id) : null;

  return (
    <AnimatePresence>
      {ev && (
        <motion.div
          key="chaos-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-ink-800/40 backdrop-blur-sm flex items-end md:items-center justify-center"
        >
          <motion.div
            key="chaos-card"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-white rounded-t-2xl md:rounded-2xl md:m-5 shadow-el-4 overflow-hidden"
          >
            {/* Header — Teams-style alert banner */}
            <div className="bg-rose-50 border-b border-rose-100 px-4 py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-rose-600 text-white flex items-center justify-center shrink-0">
                <Icon name={CHAOS_ICON[ev.id] ?? 'alert'} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
                  Calendar Conflict · High Priority
                </div>
                <div className="font-semibold text-ink-800 text-[15px] leading-tight mt-0.5">
                  {ev.title}
                </div>
                <div className="text-[11.5px] text-ink-500 italic mt-0.5">{ev.flavor}</div>
              </div>
            </div>

            <div className="px-4 py-3.5">
              {/* Meeting metadata block (Outlook-style) */}
              <div className="rounded-md border border-ink-100 bg-ink-50/50 px-3 py-2.5 space-y-1.5">
                <Row icon="person" label="From" value={characterDisplayName(ev.fromWho)} valueAvatar />
                <Row icon="clock" label="Duration" value={`${ev.durationMin} minutes`} />
                <Row icon="people" label="Attendees" value={ev.attendees} />
                <Row icon="flag" label="Priority" value="Suddenly critical" />
              </div>

              {/* Impact preview */}
              <div className="mt-3.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1.5">
                  If you attend
                </div>
                <ImpactPreview delta={ev.attendImpact} />
              </div>

              {/* Choices */}
              <div className="mt-4 space-y-1.5">
                <ChoiceBtn
                  primary
                  onClick={() => resolve('attend')}
                  icon="check"
                  title="Attend and survive"
                  sub="Take the hit. Keep the boss happy."
                />
                <ChoiceBtn
                  onClick={() => resolve('delegate')}
                  icon="send"
                  title="Delegate to team lead"
                  sub="Send a warrior in your place."
                  delta={ev.delegateImpact}
                />
                <ChoiceBtn
                  onClick={() => resolve('reschedule')}
                  icon="calendar"
                  title="Reschedule (risky)"
                  sub="Might upset the CEO."
                  delta={ev.rescheduleImpact}
                />
              </div>
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
  value,
  valueAvatar,
}: {
  icon: IconName;
  label: string;
  value: string;
  valueAvatar?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Icon name={icon} size={14} className="text-ink-400" />
      <span className="text-ink-400 w-16 shrink-0">{label}</span>
      <span className="text-ink-800 font-medium flex items-center gap-1.5 min-w-0">
        {valueAvatar && <Avatar name={value} size={18} />}
        <span className="truncate">{value}</span>
      </span>
    </div>
  );
}

function ImpactPreview({ delta }: { delta: KpiDelta }) {
  const entries = (Object.keys(delta) as KpiKey[]).filter((k) => (delta[k] ?? 0) !== 0);
  if (entries.length === 0) {
    return <div className="text-[12px] text-ink-400">No measurable impact. Suspicious.</div>;
  }
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
            <span
              className={`font-bold tabular-nums ${v >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {v >= 0 ? '+' : ''}{v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChoiceBtn({
  primary,
  icon,
  title,
  sub,
  delta,
  onClick,
}: {
  primary?: boolean;
  icon: IconName;
  title: string;
  sub: string;
  delta?: KpiDelta;
  onClick: () => void;
}) {
  const tinyImpact = delta
    ? (Object.keys(delta) as KpiKey[])
        .filter((k) => (delta[k] ?? 0) !== 0)
        .slice(0, 2)
        .map((k) => {
          const v = delta[k] ?? 0;
          const m = KPI_META[k];
          return { short: m.short, v };
        })
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition active:scale-[0.99] ${
        primary
          ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-btn-primary'
          : 'bg-white border border-ink-100 hover:bg-ink-50'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
          primary ? 'bg-white/15 text-white' : 'bg-ink-100 text-ink-600'
        }`}
      >
        <Icon name={icon} size={14} />
      </div>
      <span className="flex-1 min-w-0">
        <div className={`text-[13.5px] font-semibold ${primary ? 'text-white' : 'text-ink-800'}`}>
          {title}
        </div>
        <div className={`text-[11px] ${primary ? 'text-white/85' : 'text-ink-500'}`}>{sub}</div>
      </span>
      {tinyImpact && tinyImpact.length > 0 && (
        <span
          className={`text-[10.5px] tabular-nums flex items-center gap-1.5 ${
            primary ? 'text-white/90' : 'text-ink-500'
          }`}
        >
          {tinyImpact.map((t, i) => (
            <span key={i} className={t.v < 0 ? 'text-rose-600' : 'text-emerald-600'}>
              {t.short} {t.v >= 0 ? '+' : ''}{t.v}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}
