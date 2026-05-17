import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { Icon, type IconName } from '@/components/Icon';

const CONFETTI = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.8,
  hue: Math.floor(Math.random() * 360),
  rotate: Math.random() * 360,
}));

interface StageMeta {
  name: string;
  tagline: string;
  unlocks: { icon: IconName; title: string; sub: string }[];
}

const STAGE_META: Record<number, StageMeta> = {
  2: {
    name: 'Welcome to Reality',
    tagline:
      'The honeymoon is over. 8 requests a day, 4 slots to spend, one reorg waiting in the wings. You finally get defensive tools.',
    unlocks: [
      { icon: 'inbox',   title: 'Inbox Overload',      sub: '8 requests/day · accept cap drops to 4. Forced rejection.' },
      { icon: 'shield',  title: 'Shield Meeting',      sub: 'Block 60 min of focus time. No relationship cost.' },
      { icon: 'send',    title: 'Dashboard Report',    sub: 'Send a deck instead of attending. +Visibility, no Productivity hit. Once per day.' },
      { icon: 'fire',    title: 'Reorg Whispers',      sub: 'One day this stage, a Reorg Announcement will fire whether you like it or not.' },
    ],
  },
  3: {
    name: 'Bureaucracy Awaits',
    tagline:
      'Approval chains, executive escalations, scheduling conflicts. Stage 3 is being built.',
    unlocks: [
      { icon: 'people',   title: 'Approval Chains',    sub: 'Some requests need 3 of 5 stakeholders to sign off first.' },
      { icon: 'arrow-up', title: 'Pass to Boss',       sub: 'Punt a crisis upward. Costs relationship. Coming soon.' },
      { icon: 'alert',    title: 'Scheduling Conflicts', sub: 'Two requests, one slot. Pick one. Coming soon.' },
    ],
  },
};

export function StageUnlock() {
  const stageUnlocked = useGame((s) => s.stageUnlocked);
  const clear = useGame((s) => s.clearStageUnlock);
  const setScreen = useGame((s) => s.setScreen);

  const meta = stageUnlocked ? STAGE_META[stageUnlocked] : undefined;
  if (!stageUnlocked || !meta) return null;

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
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

      <div className="px-6 pt-10 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="inline-flex w-14 h-14 rounded-full bg-brand-50 text-brand-600 items-center justify-center"
        >
          <Icon name="star" size={28} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[10.5px] font-bold tracking-widest text-brand-600 uppercase mt-3"
        >
          Stage {stageUnlocked} Unlocked
        </motion.div>
        <motion.h1
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-[26px] font-extrabold text-ink-800 mt-1 leading-tight"
        >
          {meta.name}
        </motion.h1>
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[13px] text-ink-500 mt-2 max-w-[300px] mx-auto leading-relaxed"
        >
          {meta.tagline}
        </motion.p>
      </div>

      <div className="px-5 mt-7 space-y-2">
        <div className="text-[10.5px] font-bold tracking-widest uppercase text-ink-400 px-1">
          New mechanics unlocked
        </div>
        {meta.unlocks.map((u, i) => (
          <motion.div
            key={u.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.07 }}
            className="bg-white rounded-md border border-ink-100 shadow-el-1 p-3 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center">
              <Icon name={u.icon} size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-ink-800">{u.title}</div>
              <div className="text-[11.5px] text-ink-500">{u.sub}</div>
            </div>
            <span className="text-[9.5px] font-bold tracking-widest text-brand-600 uppercase">
              Preview
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="px-5 pb-6 pt-3 space-y-2">
        {stageUnlocked >= 3 && (
          <p className="text-center text-[11px] text-ink-400">
            (Stage {stageUnlocked} mechanics are still in development. For now, expect Stage 2's pressure with
            mounting absurdity.)
          </p>
        )}
        <button
          onClick={() => {
            clear();
            setScreen('calendar');
          }}
          className="pf-btn-primary w-full"
        >
          Continue to Stage {stageUnlocked}
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}
