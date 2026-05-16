import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { BOSS } from '@/game/data';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { characterDisplayName } from '@/game/characters';

export function Onboarding() {
  const setScreen = useGame((s) => s.setScreen);
  const startGame = useGame((s) => s.startGame);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5">
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-brand-600">
          Stage 1 · The First Week
        </div>
        <h1 className="text-[24px] font-extrabold leading-tight text-ink-800 mt-1">
          You've been promoted.
        </h1>
        <p className="mt-1 text-[13px] text-ink-500 leading-relaxed">
          Learn the ropes. Survive the meetings. Don't disappoint anyone — especially your boss.
        </p>
      </div>

      {/* "Promotion notification" — modeled on a Teams notification card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-5 mt-5 bg-white rounded-md border border-ink-100 shadow-el-2 overflow-hidden"
      >
        <div className="h-1 bg-brand-600" />
        <div className="px-4 py-3.5">
          <div className="text-[10px] font-bold tracking-widest text-brand-600 uppercase">
            New Assignment
          </div>
          <div className="mt-1 flex items-center gap-3">
            <Avatar name="You There" size={36} />
            <div className="min-w-0">
              <div className="font-semibold text-ink-800 text-[15px]">You</div>
              <div className="text-[11.5px] text-ink-400">World's Okayest Manager</div>
            </div>
          </div>
          <div className="mt-3 text-[13px] text-ink-700 leading-relaxed">
            Effective immediately, you are promoted to{' '}
            <span className="font-semibold text-brand-700">Meeting Manager</span>. Your mission: keep
            everyone aligned, productive, and (mostly) sane.
          </div>
          <ul className="mt-3 space-y-1.5 text-[12.5px] text-ink-600">
            <li className="flex items-center gap-2">
              <Icon name="check" size={14} className="text-emerald-600" />
              23 employees await your leadership
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size={14} className="text-emerald-600" />
              127 meetings already on your calendar
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size={14} className="text-emerald-600" />
              0 hours of actual work expected
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Boss message — chat-style card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-5 mt-3 bg-white rounded-md border border-ink-100 shadow-el-1 p-3.5"
      >
        <div className="flex items-start gap-3">
          <Avatar name={characterDisplayName('Your Boss')} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-ink-800 text-[13.5px]">
                {characterDisplayName('Your Boss')}
              </span>
              <span className="text-[10.5px] text-ink-400">Director · Your Manager</span>
            </div>
            <div className="text-[10.5px] text-ink-400 italic">{BOSS.alias}</div>
            <p className="text-[13px] text-ink-700 mt-1 leading-snug">{BOSS.ask}</p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="px-5 pb-6 pt-2"
      >
        <button
          onClick={() => {
            startGame();
            setScreen('inbox');
          }}
          className="pf-btn-primary w-full h-11"
        >
          Open your inbox
          <Icon name="chevron-right" size={16} />
        </button>
        <p className="text-center text-[11px] text-ink-400 mt-2">
          You can't actually decline this.
        </p>
      </motion.div>
    </div>
  );
}
