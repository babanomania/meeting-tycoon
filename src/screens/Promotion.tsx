import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { characterDisplayName } from '@/game/characters';

const CONFETTI = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 1.2,
  hue: Math.floor(Math.random() * 360),
  rotate: Math.random() * 360,
}));

/**
 * The end-of-game Promotion screen. Reached only on Day 25 with a
 * non-PIP outcome — promoted (5/5) or lateral move (3-4). The PIP path
 * goes to the GameOver screen instead.
 *
 * Two outcomes:
 *  - promoted → confetti, "VP of Synergy" title, sarcastic David letter
 *  - lateral  → muted celebration, "your scope has been re-titled"
 */
export function Promotion() {
  const result = useGame((s) => s.promotionResult);
  const resetGame = useGame((s) => s.resetGame);

  if (!result) return null;

  const isWin = result.outcome === 'promoted';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-700 via-brand-600 to-[#3B0764] relative overflow-hidden text-white">
      {/* Confetti (only on real promotion) */}
      {isWin && (
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
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center"
        >
          <div
            className={`inline-flex w-20 h-20 rounded-full items-center justify-center mb-5 ${
              isWin ? 'bg-amber-300 text-brand-900' : 'bg-white/15 text-white'
            }`}
          >
            <Icon name={isWin ? 'star' : 'briefcase'} size={36} />
          </div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-amber-300 mb-2">
            Day 25 · {result.goalsMet}/{result.goalsTotal} goals hit
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            {isWin ? "You've been promoted." : 'A "lateral move".'}
          </h1>
          <p className="mt-3 text-base text-white/80 max-w-lg mx-auto leading-relaxed">
            {isWin
              ? 'Effective immediately, you are VP of Synergy. Marcus wrote the letter himself. Diana signed off. The Board approved it on the spot.'
              : 'Your title has been re-titled. Your scope has been re-scoped. The press release is being drafted with the word "exciting" three times.'}
          </p>
        </motion.div>

        {/* David's letter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-5 md:p-6"
        >
          <div className="flex items-start gap-3 mb-3">
            <Avatar name={characterDisplayName('Your Boss')} size={40} />
            <div>
              <div className="text-[13px] font-bold">{characterDisplayName('Your Boss')}</div>
              <div className="text-[11px] text-white/60">Director · just now</div>
            </div>
          </div>
          <p className="text-[14px] text-white/90 italic leading-relaxed">
            {isWin
              ? '"Hey — wanted to be the first to congratulate you. The Board was unanimous. The team is thrilled. (I mean, the team that\'s left.) Anyway. Let\'s grab 15 next week to talk about your goals for the new role. I have some ideas. Bring opinions. — David"'
              : '"Hey — wanted to let you know directly. We see real value in your contributions. The new charter is a great opportunity to broaden your impact. We should sync — I have some thoughts on positioning. — David"'}
          </p>
        </motion.div>

        {/* Final stats card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 rounded-xl bg-white/5 border border-white/10 p-5"
        >
          <div className="text-[10.5px] font-bold tracking-widest uppercase text-white/60 mb-3">
            The full run · 25 days · 5 stages
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Days survived" value="25" />
            <Stat label="Stage 5 goals" value={`${result.goalsMet} / ${result.goalsTotal}`} />
            <Stat label="Outcome" value={isWin ? 'PROMOTED' : 'LATERAL'} compact />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <button
            onClick={resetGame}
            className="px-6 py-3 rounded-lg bg-white text-brand-700 font-semibold text-[15px] shadow-lg hover:bg-amber-50 transition flex items-center gap-2"
          >
            <Icon name="sparkle" size={16} />
            <span>Play again</span>
          </button>
        </motion.div>

        <div className="mt-10 text-center text-[11px] text-white/40">
          Most VPs never had to do this twice. Most.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  // Numeric values get the chunky tabular-nums treatment; letter values
  // (PROMOTED / LATERAL) shrink to fit the narrow column without overflow.
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-3 min-w-0">
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div
        className={`font-extrabold text-white mt-1 ${
          compact ? 'text-[14px] tracking-wider' : 'text-[18px] tabular-nums'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
