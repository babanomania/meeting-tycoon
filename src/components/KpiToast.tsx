import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/game/store';
import { Avatar } from './Avatar';
import { Icon, type IconName } from './Icon';
import { KPI_META } from './KpiBadge';
import type { KpiKey, ToastIntent } from '@/game/types';

/**
 * Fluent MessageBar–style feedback toast.
 *
 * Layout (left → right):
 *   [4px accent bar] [40px icon tile] [content: title + KPI chips + stakeholder] [close X]
 *
 * Sits at the top of the phone frame, full-width with a 12px gutter, white
 * background, hairline border, subtle elevation. Animated countdown bar at the
 * bottom shows how long until auto-dismiss. Tap close to dismiss early.
 */

const DISMISS_MS = 3200;

const INTENT_META: Record<
  ToastIntent,
  { accent: string; tileBg: string; tileFg: string; bar: string }
> = {
  info:    { accent: 'bg-brand-600',   tileBg: 'bg-brand-50',   tileFg: 'text-brand-700',   bar: 'bg-brand-500' },
  success: { accent: 'bg-emerald-500', tileBg: 'bg-emerald-50', tileFg: 'text-emerald-700', bar: 'bg-emerald-500' },
  caution: { accent: 'bg-amber-500',   tileBg: 'bg-amber-50',   tileFg: 'text-amber-700',   bar: 'bg-amber-500' },
  warning: { accent: 'bg-rose-500',    tileBg: 'bg-rose-50',    tileFg: 'text-rose-700',    bar: 'bg-rose-500' },
};

export function KpiToast() {
  const toast = useGame((s) => s.toast);
  const dismiss = useGame((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const handle = setTimeout(() => dismiss(), DISMISS_MS);
    return () => clearTimeout(handle);
  }, [toast, dismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-3 left-3 right-3 z-50 pointer-events-none"
        >
          <ToastBar toast={toast} onDismiss={dismiss} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToastBar({
  toast,
  onDismiss,
}: {
  toast: NonNullable<ReturnType<typeof useGame.getState>['toast']>;
  onDismiss: () => void;
}) {
  const intent: ToastIntent = toast.intent ?? 'info';
  const meta = INTENT_META[intent];
  const icon: IconName = toast.icon ?? 'sparkle';

  return (
    <div
      role="status"
      className="pointer-events-auto bg-white rounded-md border border-ink-100 shadow-el-3 overflow-hidden relative"
    >
      <div className="flex">
        {/* Left accent bar */}
        <div className={`w-1 ${meta.accent} shrink-0`} aria-hidden />

        {/* Icon tile */}
        <div className="pl-3 pr-2.5 py-3 shrink-0 flex items-start">
          <div className={`w-9 h-9 rounded-md flex items-center justify-center ${meta.tileBg} ${meta.tileFg}`}>
            <Icon name={icon} size={17} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-3 pr-1.5">
          {toast.title && (
            <div className="text-[13px] font-semibold text-ink-800 leading-tight truncate">
              {toast.title}
            </div>
          )}

          {toast.kpiDelta && <KpiDeltaRow delta={toast.kpiDelta} />}

          {toast.stakeholder && (
            <div className="mt-2 flex items-center gap-2">
              <Avatar name={toast.stakeholder.name} size={24} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 leading-none">
                  Relationship
                </div>
                <div className="text-[12.5px] font-semibold text-ink-800 truncate leading-tight mt-0.5">
                  {toast.stakeholder.name}
                </div>
              </div>
              <DeltaPill value={toast.stakeholder.delta} prominent />
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 w-10 self-stretch flex items-start justify-center pt-3 text-ink-400 hover:text-ink-700 transition group"
        >
          <span className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-ink-100 transition">
            <Icon name="x" size={14} />
          </span>
        </button>
      </div>

      {/* Countdown progress bar */}
      <motion.div
        key={`${toast.id}-bar`}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: DISMISS_MS / 1000, ease: 'linear' }}
        style={{ transformOrigin: 'left' }}
        className={`absolute left-0 right-0 bottom-0 h-[2px] ${meta.bar} opacity-70`}
      />
    </div>
  );
}

function KpiDeltaRow({ delta }: { delta: Record<string, number | undefined> }) {
  const entries = (Object.keys(delta) as KpiKey[])
    .filter((k) => (delta[k] ?? 0) !== 0)
    .slice(0, 6);
  if (entries.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {entries.map((k) => {
        const v = delta[k] ?? 0;
        const meta = KPI_META[k];
        // Invert color logic for burnout — going up is bad.
        const isPositive = meta.inverted ? v < 0 : v > 0;
        return (
          <span
            key={k}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium tabular-nums px-2 h-[22px] rounded-full bg-ink-50 border border-ink-100"
          >
            <Icon name={meta.icon} size={12} className={meta.color} />
            <span className="text-ink-600">{meta.short}</span>
            <span
              className={`font-bold inline-flex items-center gap-0.5 ${
                isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              <Icon name={v > 0 ? 'arrow-up' : 'arrow-down'} size={10} />
              {Math.abs(v)}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function DeltaPill({ value, prominent }: { value: number; prominent?: boolean }) {
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 rounded-full tabular-nums font-bold ${
        prominent ? 'h-[22px] text-[12.5px]' : 'h-[16px] text-[10.5px]'
      } ${
        positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
      }`}
    >
      <Icon name={positive ? 'arrow-up' : 'arrow-down'} size={prominent ? 12 : 10} />
      {Math.abs(value)}
    </span>
  );
}
