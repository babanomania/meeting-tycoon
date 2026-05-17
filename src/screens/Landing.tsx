import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { Icon, type IconName } from '@/components/Icon';

/**
 * Landing page — full-width marketing surface that sits OUTSIDE the
 * PhoneFrame chrome. First-time visitors land here; the CTA drops them
 * into the onboarding flow (which then enters the phone-framed game).
 *
 * The page reuses the brand purple gradient, the public/hero.svg banner,
 * and the same icon set the game uses so everything reads as one product.
 */
export function Landing() {
  const setScreen = useGame((s) => s.setScreen);
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);
  const schedule = useGame((s) => s.schedule);
  const conversations = useGame((s) => s.conversations);
  // Heuristic for a returning player: any chat seeded or any day past 1.
  const hasSave = day > 1 || schedule.length > 0 || conversations.length > 0;

  const start = () => setScreen('onboarding');
  const resume = () => setScreen('calendar');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-700 via-brand-600 to-[#3B0764] relative overflow-hidden text-white">
      <BackgroundGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-12 md:pb-16">
        {/* Brand strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-10 md:mb-14"
        >
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-extrabold text-white text-[15px] tracking-tight">
            MT
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">Meeting Tycoon</div>
            <div className="text-[10.5px] uppercase tracking-widest text-white/60 flex items-center gap-1.5">
              <span>v1.0</span>
              <span className="px-1.5 py-px rounded bg-amber-300/20 text-amber-300 text-[9px] tracking-wider">
                BETA
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-center mb-14 md:mb-20">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-amber-300/15 text-amber-200 border border-amber-300/25 text-[11px] font-bold tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              A SATIRICAL CORPORATE SIM · BROWSER-ONLY
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-tight"
            >
              Schedule meetings.{' '}
              <span className="text-amber-300">Survive politics.</span>{' '}
              <span className="text-white/80">Maintain the illusion.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-5 text-[15px] md:text-base text-white/80 max-w-xl leading-relaxed"
            >
              You're a new manager at Acme Corp, a 23-person company that holds 127 meetings a
              week and spends 2% of its time on actual work. Six stakeholders. Eight requests a
              day. One inevitable promotion.
              <br />
              <br />
              Triage the inbox. Defend your calendar. Don't get reorged.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {hasSave && (
                <button
                  onClick={resume}
                  className="px-6 py-3 rounded-lg bg-white text-brand-700 font-semibold text-[15px] shadow-lg hover:bg-amber-50 transition flex items-center gap-2"
                >
                  <Icon name="calendar" size={16} />
                  <span>Resume · Day {day}</span>
                </button>
              )}
              <button
                onClick={start}
                className={
                  hasSave
                    ? 'px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/25 font-semibold text-[14px] flex items-center gap-2'
                    : 'px-6 py-3 rounded-lg bg-white text-brand-700 font-semibold text-[15px] shadow-lg hover:bg-amber-50 transition flex items-center gap-2'
                }
              >
                <Icon name="sparkle" size={16} />
                <span>{hasSave ? 'Start over' : 'Launch game'}</span>
              </button>
            </motion.div>

            {hasSave && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="mt-3 text-[11px] text-white/60"
              >
                Saved run: Stage {stage} · Day {day}. Local browser save only.
              </motion.div>
            )}
          </div>

          {/* Hero illustration — reuses the same SVG the README uses. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-6 flex justify-center lg:justify-end"
          >
            <img
              src={`${import.meta.env.BASE_URL}hero.svg`}
              alt="Meeting Tycoon — a calendar card overflowing with meetings, with a chaos chip and KPI chip floating around it"
              className="w-full max-w-[640px] rounded-xl shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>
        </div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-12"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.04 }}
              className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-5"
            >
              <div className="w-9 h-9 rounded-md bg-amber-300/15 text-amber-300 flex items-center justify-center mb-3">
                <Icon name={f.icon} size={18} />
              </div>
              <div className="text-[14px] font-bold mb-1.5">{f.title}</div>
              <div className="text-[12.5px] text-white/70 leading-relaxed">{f.body}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stage map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
          className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-5 md:p-6 mb-12"
        >
          <div className="text-[10.5px] font-bold tracking-widest uppercase text-white/60 mb-4">
            5 stages · 25 days · 1 inevitable promotion
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {STAGES.map((s) => (
              <div
                key={s.n}
                className={`rounded-lg p-3 border ${
                  s.status === 'shipped'
                    ? 'bg-emerald-400/10 border-emerald-300/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-white/60">
                    STAGE {s.n}
                  </span>
                  <span
                    className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      s.status === 'shipped'
                        ? 'bg-emerald-400/20 text-emerald-200'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {s.status === 'shipped' ? 'PLAYABLE' : 'IN DESIGN'}
                  </span>
                </div>
                <div className="text-[13px] font-bold mb-1">{s.name}</div>
                <div className="text-[11px] text-white/70 leading-snug">{s.hook}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center"
        >
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/50 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-14 text-center text-[11px] text-white/45"
        >
          Local browser save only. No backend. No telemetry. No standup at 9:30.
        </motion.div>
      </div>
    </div>
  );
}

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'inbox',
    title: 'Triage the inbox',
    body:
      'Eight meeting requests a day. Five accept slots. Forced rejection — every "yes" is a "no" somewhere else.',
  },
  {
    icon: 'people',
    title: 'Six stakeholders',
    body:
      "CEO, CFO, CTO, CHRO, VP Strategy, and your boss David. Each has a relationship score. Each remembers everything.",
  },
  {
    icon: 'alert',
    title: 'Corporate chaos',
    body:
      'Reorgs, LinkedIn disasters, surprise QBR slide deadlines. Attend, delegate, reschedule — or pass to the boss.',
  },
  {
    icon: 'shield',
    title: 'Defend your calendar',
    body:
      'Stage 2+ unlocks Shield Meetings (focus blocks) and Dashboard Reports — send a deck instead of attending.',
  },
  {
    icon: 'target',
    title: 'Quarterly goals',
    body:
      'Goals rewrite themselves each stage. Hit them and the boss stops sweating. Miss them and HR drafts a letter.',
  },
  {
    icon: 'star',
    title: 'Thematic endings',
    body:
      "Team Walkout. Forced Sabbatical. Restructured. Process Paralysis. Board Confidence Lost. Get reassigned in style.",
  },
];

const STAGES: { n: number; name: string; hook: string; status: 'shipped' | 'design' }[] = [
  { n: 1, name: 'The First Week',       hook: 'Learn the ropes. Survive a normal week.', status: 'shipped' },
  { n: 2, name: 'Welcome to Reality',   hook: 'Cap drops to 4. Shield Meetings unlock. One reorg.', status: 'shipped' },
  { n: 3, name: 'Bureaucracy',          hook: 'Approval chains. Politics ×1.5. Pass to Boss.', status: 'shipped' },
  { n: 4, name: 'Corporate Madness',    hook: 'Alliances, feuds, PR Disaster, Day-20 Board Sync.', status: 'shipped' },
  { n: 5, name: 'Executive Absurdity',  hook: 'Committees spawn. Cook the books. Day 25 Promotion or PIP.', status: 'shipped' },
];

const STATS = [
  { value: '5', label: 'Stages playable' },
  { value: '26', label: 'Meeting types' },
  { value: '14', label: 'Chaos events' },
  { value: '7', label: 'Failure modes' },
];

function BackgroundGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full text-white opacity-[0.06]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="lp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lp-grid)" />
    </svg>
  );
}
