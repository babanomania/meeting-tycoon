import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { KpiStrip } from '@/components/KpiStrip';
import { Icon, type IconName } from '@/components/Icon';
import type { GameOverReason } from '@/game/types';

/** Map fail reason → header icon. */
const REASON_ICON: Record<GameOverReason, IconName> = {
  'team-walkout':         'arrow-right',
  'fired-low-confidence': 'inbox',
  'burnout-sabbatical':   'fire',
};

export function GameOver() {
  const over = useGame((s) => s.gameOver);
  const day = useGame((s) => s.day);
  const kpis = useGame((s) => s.kpis);
  const resetGame = useGame((s) => s.resetGame);

  if (!over) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="inline-flex w-16 h-16 rounded-full bg-rose-50 text-rose-600 items-center justify-center"
        >
          <Icon name={REASON_ICON[over.reason]} size={32} />
        </motion.div>
        <div className="text-[10.5px] font-bold tracking-widest text-rose-600 uppercase mt-3">
          Game Over · Day {day}
        </div>
        <h1 className="text-[26px] font-extrabold text-ink-800 mt-1">{over.title}</h1>
        <p className="text-[13px] text-ink-500 mt-3 max-w-[300px] italic leading-relaxed">
          "{over.body}"
        </p>

        <div className="mt-6 w-full max-w-[360px]">
          <div className="text-[10.5px] font-bold tracking-widest uppercase text-ink-400 mb-2 text-left">
            Final state
          </div>
          <KpiStrip kpis={kpis} />
        </div>
      </div>
      <div className="px-6 pb-6">
        <button onClick={resetGame} className="pf-btn-primary w-full">
          Start over
          <Icon name="chevron-right" size={16} />
        </button>
        <p className="text-[11px] text-ink-400 text-center mt-2">
          Don't worry. Most of us only had to do this once.
        </p>
      </div>
    </div>
  );
}
