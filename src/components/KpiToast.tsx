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
 * background, hairline border, subtle shadow. Auto-dismisses after ~2.8s.
 * Tap the close icon (or anywhere) to dismiss early.
 */

const INTENT_META: Record<
  ToastIntent,
  { accent: string; tileBg: string; tileFg: string }
> = {
  info:    { accent: 'bg-brand-600',   tileBg: 'bg-brand-50',   tileFg: 'text-brand-700' },
  success: { accent: 'bg-emerald-500', tileBg: 'bg-emerald-50', tileFg: 'text-emerald-700' },
  caution: { accent: 'bg-amber-500',   tileBg: 'bg-amber-50',   tileFg: 'text-amber-700' },
  warning: { accent: 'bg-rose-500',    tileBg: 'bg-rose-50',    tileFg: 'text-rose-700' },
};

export function KpiToast() {
  const toast = useGame((s) => s.toast);
  const dismiss = useGame((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const handle = setTimeout(() => dismiss(), 2800);
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
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
      className="pointer-events-auto bg-white rounded-md border border-ink-100 shadow-el-3 overflow-hidden flex"
    >
      {/* Left accent bar */}
      <div className={`w-1 ${meta.accent} shrink-0`} aria-hidden />

      {/* Icon tile */}
      <div className="pl-2.5 pr-2 py-2.5 shrink-0 flex items-start">
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${meta.tileBg} ${meta.tileFg}`}>
          <Icon name={icon} size={15} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-2.5 pr-1">
        {toast.title && (
          <div className="text-[12.5px] font-semibold text-ink-800 leading-tight truncate">
            {toast.title}
          </div>
        )}

        {toast.kpiDelta && <KpiDeltaRow delta={toast.kpiDelta} />}

        {toast.stakeholder && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Avatar name={toast.stakeholder.name} size={18} />
            <span className="text-[11.5px] text-ink-700 font-medium truncate flex-1">
              {toast.stakeholder.name}
            </span>
            <DeltaPill value={toast.stakeholder.delta} />
          </div>
        )}
      </div>

      {/* Close X */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 w-9 self-stretch flex items-start justify-center pt-2.5 text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

function KpiDeltaRow({ delta }: { delta: Record<string, number | undefined> }) {
  const entries = (Object.keys(delta) as KpiKey[])
    .filter((k) => (delta[k] ?? 0) !== 0)
    .slice(0, 6);
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {entries.map((k) => {
        const v = delta[k] ?? 0;
        const meta = KPI_META[k];
        return (
          <span
            key={k}
            className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums"
          >
            <Icon name={meta.icon} size={11} className={meta.color} />
            <span className="text-ink-600">{meta.short}</span>
            <DeltaPill value={v} subtle />
          </span>
        );
      })}
    </div>
  );
}

function DeltaPill({ value, subtle }: { value: number; subtle?: boolean }) {
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 h-[16px] rounded-full text-[10.5px] font-bold tabular-nums ${
        positive
          ? subtle
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-emerald-100 text-emerald-700'
          : subtle
          ? 'bg-rose-50 text-rose-700'
          : 'bg-rose-100 text-rose-700'
      }`}
    >
      <Icon name={positive ? 'arrow-up' : 'arrow-down'} size={10} />
      {Math.abs(value)}
    </span>
  );
}
