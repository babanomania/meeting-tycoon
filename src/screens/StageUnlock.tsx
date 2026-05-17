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
    name: 'Bureaucracy',
    tagline:
      'Process replaces work. Requests need three signatures before you can even say yes. Every relationship change hits 1.5× harder.',
    unlocks: [
      { icon: 'people',   title: 'Approval Chains',    sub: 'Gated requests need 3 of 5 leaders to sign off before they unlock.' },
      { icon: 'arrow-up', title: 'Pass to Boss',       sub: 'New chaos option. No KPI hit. Your boss takes −15.' },
      { icon: 'sparkle',  title: 'Politics Doubles',   sub: 'Every relationship change applies at 1.5×. Friends help more, enemies hurt more.' },
      { icon: 'clock',    title: 'Process Paralysis',  sub: 'New failure: every stakeholder cool to you and nothing moves. Ever.' },
    ],
  },
  4: {
    name: 'Corporate Madness',
    tagline:
      'The org chart eats itself. Alliances pay off, feuds bite, and the Board is watching. Day 20 climaxes with a single survival check.',
    unlocks: [
      { icon: 'people',   title: 'Stakeholder Alliances', sub: 'Two friends at 70+ form an alliance — +3 to a paired KPI at day-end. Two enemies at 30- trigger feuds that drain Alignment.' },
      { icon: 'sparkle',  title: 'PR Disaster',           sub: 'If Boss + CEO both drop below 50, a CEO LinkedIn post fires at day-end: -15 ExecConf, broadcast. Two in one stage = Reassigned.' },
      { icon: 'star',     title: 'The Board Sync',        sub: 'Day 20 force-fires a 2-hour Board chaos. End the day with 3 of 5 Stage 4 goals or lose Board confidence.' },
      { icon: 'fire',     title: 'Politics ×1.75',        sub: 'Every relationship change scales again. Alliances earn more, mistakes cost more.' },
    ],
  },
  5: {
    name: 'Executive Absurdity',
    tagline:
      'Committees run everything. The Notes Bot has opinions. You can cook the books. Day 25 either promotes you or PIPs you — there is no in-between except "lateral move".',
    unlocks: [
      { icon: 'people',   title: 'Mandatory Committees',   sub: 'Every meeting you accept spawns a 30-min Follow-up Committee on the calendar. Free of charge.' },
      { icon: 'sparkle',  title: 'AI Meeting Notes Bot',   sub: 'After every meeting the bot floods #general with a summary. Visibility goes up. Morale goes down. Compounds.' },
      { icon: 'briefcase', title: 'Legacy Meetings',       sub: 'One inherited meeting auto-appears every day. Cannot be declined. Cannot be removed. Nobody remembers what it is for.' },
      { icon: 'star',     title: 'Cook the Books',         sub: '-20 Visibility to fake +10 ExecConf today. -15 ExecConf hits tomorrow. The optics win is real. The crash is real.' },
      { icon: 'fire',     title: 'The Promotion',          sub: 'Day 25 evaluates all 5 Stage 5 goals. 5/5 = VP. 3-4 = lateral move. ≤2 = Performance Improvement Plan.' },
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
            className="bg-white rounded-md border border-ink-100 shadow-el-1 p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <Icon name={u.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-ink-800 leading-snug">{u.title}</div>
              <div className="text-[11.5px] text-ink-500 mt-0.5 leading-snug">{u.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="px-5 pb-6 pt-3 space-y-2">
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
