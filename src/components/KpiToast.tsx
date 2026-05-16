import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/game/store';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { KPI_META } from './KpiBadge';
import type { KpiKey } from '@/game/types';

/**
 * Floating feedback toast — visible reward for player actions.
 * Shows the KPI deltas + (optional) stakeholder relationship change that
 * just happened. Auto-dismisses after ~2.6s. Tap to dismiss early.
 *
 * Mounted at App level so it floats above whatever screen is showing.
 */
export function KpiToast() {
  const toast = useGame((s) => s.toast);
  const dismiss = useGame((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const handle = setTimeout(() => dismiss(), 2600);
    return () => clearTimeout(handle);
  }, [toast, dismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.button
          key={toast.id}
          initial={{ y: -16, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={dismiss}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-50 max-w-[92%] min-w-[220px]
                     bg-ink-800 text-white rounded-md shadow-el-3 px-3 py-2.5 text-left"
        >
          {toast.title && (
            <div className="text-[11px] font-bold tracking-wide text-white/85 leading-tight">
              {toast.title}
            </div>
          )}

          {/* KPI deltas as icon + value chips */}
          {toast.kpiDelta && <KpiDeltaRow delta={toast.kpiDelta} />}

          {/* Stakeholder change row */}
          {toast.stakeholder && (
            <div className="mt-1.5 flex items-center gap-2 text-[11.5px]">
              <Avatar name={toast.stakeholder.name} size={20} />
              <span className="font-medium text-white/85 truncate flex-1">
                {toast.stakeholder.name}
              </span>
              <DeltaPill value={toast.stakeholder.delta} />
            </div>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function KpiDeltaRow({ delta }: { delta: Record<string, number | undefined> }) {
  const entries = (Object.keys(delta) as KpiKey[])
    .filter((k) => (delta[k] ?? 0) !== 0)
    .slice(0, 6);
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
      {entries.map((k) => {
        const v = delta[k] ?? 0;
        const meta = KPI_META[k];
        return (
          <span
            key={k}
            className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums"
          >
            <Icon name={meta.icon} size={11} className="text-white/85" />
            <span className="text-white/85">{meta.short}</span>
            <DeltaPill value={v} />
          </span>
        );
      })}
    </div>
  );
}

function DeltaPill({ value }: { value: number }) {
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 h-[16px] rounded-full text-[10.5px] font-bold tabular-nums ${
        positive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
      }`}
    >
      <Icon name={positive ? 'arrow-up' : 'arrow-down'} size={10} />
      {Math.abs(value)}
    </span>
  );
}
