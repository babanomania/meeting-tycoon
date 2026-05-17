import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { Icon, type IconName } from '@/components/Icon';

/**
 * Landing page — full-width marketing surface, MS Fluent-styled to match
 * the game's white-on-white aesthetic. Renders OUTSIDE the PhoneFrame.
 *
 * Tone goals (per user feedback):
 *  - White background, light Fluent surfaces (the game uses the same)
 *  - Mystery on stages — name + hint quote, not mechanic spoilers
 *  - Hyped copy that earns the satire framing
 */
export function Landing() {
  const setScreen = useGame((s) => s.setScreen);
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);
  const schedule = useGame((s) => s.schedule);
  const conversations = useGame((s) => s.conversations);
  const hasSave = day > 1 || schedule.length > 0 || conversations.length > 0;

  const start = () => setScreen('onboarding');
  const resume = () => setScreen('calendar');

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-ink-800 relative overflow-hidden">
      <BackgroundGrid />

      {/* ── Top nav strip ── */}
      <header className="relative z-10 border-b border-ink-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-brand-600 text-white flex items-center justify-center font-extrabold text-[13px]">
              MT
            </div>
            <div className="font-bold text-[14px] tracking-tight">Meeting Tycoon</div>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-700 text-[9.5px] font-bold tracking-wider">
              v1.0 · BETA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/babanomania/meeting-tycoon"
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-semibold text-ink-500 hover:text-ink-800 transition px-3 py-1.5"
            >
              GitHub
            </a>
            <button
              onClick={hasSave ? resume : start}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-brand-600 text-white text-[12.5px] font-semibold hover:bg-brand-700 transition shadow-sm"
            >
              {hasSave ? `Resume · Day ${day}` : 'Launch'}
              <Icon name="chevron-right" size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/12 text-amber-700 border border-amber-400/30 text-[11px] font-bold tracking-wider mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          A SATIRICAL CORPORATE SIM · BROWSER · ZERO BACKEND
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl xl:text-[68px] font-extrabold leading-[1.02] tracking-tight max-w-4xl"
        >
          The first management sim that{' '}
          <span className="text-brand-600">holds a grudge</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-[15px] md:text-[17px] text-ink-600 max-w-2xl leading-relaxed"
        >
          You're the new manager. Acme Corp holds 127 meetings a week and spends 2% of its time on
          actual work. <span className="text-ink-800 font-semibold">Six executives outrank you. Each
          one remembers.</span> Say yes to the wrong thing and you'll spend Friday in damage control.
          Say no and HR drafts a letter.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          {hasSave && (
            <button
              onClick={resume}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-brand-600 text-white text-[15px] font-semibold hover:bg-brand-700 transition shadow-sm"
            >
              <Icon name="calendar" size={16} />
              Resume · Stage {stage} Day {day}
            </button>
          )}
          <button
            onClick={start}
            className={
              hasSave
                ? 'inline-flex items-center gap-2 h-12 px-5 rounded-md bg-white text-ink-800 border border-ink-200 text-[14px] font-semibold hover:bg-ink-50 transition'
                : 'inline-flex items-center gap-2 h-12 px-6 rounded-md bg-brand-600 text-white text-[15px] font-semibold hover:bg-brand-700 transition shadow-sm'
            }
          >
            <Icon name="sparkle" size={16} />
            {hasSave ? 'Start over' : 'Launch the game'}
          </button>
          {!hasSave && (
            <span className="text-[11.5px] text-ink-500">
              ~90 seconds per in-game day · saves to your browser
            </span>
          )}
        </motion.div>

        {/* Hero image — framed inset, the visible "what the game looks like" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-14 md:mt-20 rounded-xl bg-white border border-ink-100 shadow-[0_30px_80px_-20px_rgba(76,29,149,0.25)] overflow-hidden"
        >
          <img
            src={`${import.meta.env.BASE_URL}hero.svg`}
            alt="Meeting Tycoon — a full week calendar absurdly overbooked, with notification toasts bursting from the edges"
            className="w-full block"
          />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-3xl mb-12"
        >
          <div className="text-[11px] font-bold tracking-widest uppercase text-brand-600 mb-3">
            What you'll be doing
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            Six metrics. Six executives. One inbox that won't quit.
          </h2>
          <p className="mt-4 text-[15px] text-ink-600 leading-relaxed">
            Every accept, every decline, every reply to David's "got a sec?" — it all moves the
            numbers. Some you'll see. Some you'll find out about on Day 14 when the CFO freezes
            your budget.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white border border-ink-100 p-6 shadow-el-1 hover:shadow-el-2 transition-shadow"
            >
              <div className={`w-10 h-10 rounded-md ${f.iconBg} ${f.iconFg} flex items-center justify-center mb-4`}>
                <Icon name={f.icon} size={20} />
              </div>
              <div className="text-[15px] font-bold mb-2 leading-snug">{f.title}</div>
              <div className="text-[13px] text-ink-600 leading-relaxed">{f.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── The Company (numbers strip) ── */}
      <section className="relative z-10 bg-ink-800 text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
          <div className="text-[11px] font-bold tracking-widest uppercase text-amber-400 mb-3">
            Acme Corp — at a glance
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold leading-tight max-w-2xl">
            "We build stuff nobody has time to use."
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight">{s.value}</div>
                <div className="text-[10.5px] uppercase tracking-widest text-white/55 mt-1.5 font-semibold">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stages (mystery teasers) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-3xl mb-12"
        >
          <div className="text-[11px] font-bold tracking-widest uppercase text-brand-600 mb-3">
            5 stages · 25 in-game days
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            Every stage adds one thing you didn't know you'd need to survive.
          </h2>
          <p className="mt-4 text-[15px] text-ink-600 leading-relaxed">
            We won't tell you what. That's the point. Each Monday, the rules quietly change. By
            Stage 4 you'll wish you'd been kinder to the CFO. By Stage 5 you'll be reading
            dashboards written by a bot.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STAGES.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl bg-white border border-ink-100 p-5 shadow-el-1 relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold tracking-widest text-ink-300">
                {s.dayRange}
              </div>
              <div className="text-[10px] font-bold tracking-widest text-brand-600 uppercase mb-2">
                Stage {s.n}
              </div>
              <div className="text-[16px] font-extrabold leading-tight">{s.name}</div>
              <div className="mt-3 pt-3 border-t border-ink-100">
                <div className="text-[12px] text-ink-600 italic leading-snug">"{s.quote}"</div>
                <div className="text-[10px] text-ink-400 mt-1.5">— {s.attributedTo}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Failure modes (the punchline) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-3xl mb-10"
        >
          <div className="text-[11px] font-bold tracking-widest uppercase text-rose-600 mb-3">
            8 ways out
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            Seven kinds of corporate humiliation. One promotion.
          </h2>
          <p className="mt-4 text-[15px] text-ink-600 leading-relaxed">
            Some endings hit because they're true. We'll let you find out which.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ENDINGS.map((e, i) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border p-4 ${
                e.kind === 'win'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white border-ink-100 shadow-el-1'
              }`}
            >
              <div className={`text-[10px] font-bold tracking-widest uppercase mb-1.5 ${
                e.kind === 'win' ? 'text-emerald-700' : 'text-ink-400'
              }`}>
                {e.kind === 'win' ? '★ Win condition' : 'Failure mode'}
              </div>
              <div className="text-[14px] font-bold leading-tight">{e.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-brand-600 to-[#3B0764] text-white p-8 md:p-14 text-center shadow-2xl"
        >
          <div className="text-[11px] font-bold tracking-widest uppercase text-amber-300 mb-4">
            The first day takes 90 seconds
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl mx-auto">
            Eight requests. Five accept slots. Friday is in 4 days.
          </h2>
          <p className="mt-5 text-[15px] md:text-base text-white/85 max-w-xl mx-auto leading-relaxed">
            How bad could it be? Find out before David sends another "got a sec?"
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={start}
              className="inline-flex items-center gap-2 h-12 px-7 rounded-md bg-white text-brand-700 text-[15px] font-bold hover:bg-amber-50 transition shadow-lg"
            >
              <Icon name="sparkle" size={16} />
              Launch the game
            </button>
            {hasSave && (
              <button
                onClick={resume}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-white/10 border border-white/25 text-white text-[14px] font-semibold hover:bg-white/15 transition"
              >
                <Icon name="calendar" size={16} />
                Resume Day {day}
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-ink-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-ink-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-brand-600 text-white flex items-center justify-center font-extrabold text-[10px]">
              MT
            </div>
            <span>Meeting Tycoon · open source · MIT-ish</span>
          </div>
          <div className="text-[11px] text-ink-400">
            Local browser save only. No backend. No telemetry. No standup at 9:30.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Content
// ──────────────────────────────────────────────────────────────────────────

const FEATURES: {
  icon: IconName;
  iconBg: string;
  iconFg: string;
  title: string;
  body: string;
}[] = [
  {
    icon: 'inbox',
    iconBg: 'bg-brand-50',
    iconFg: 'text-brand-700',
    title: 'You will say no. People will remember.',
    body: 'Eight requests a day. Five accept slots. Decline the CFO and Diana puts a "hold" on your initiative for two days. Decline the CEO and you find out what "feedback loop" really means.',
  },
  {
    icon: 'people',
    iconBg: 'bg-rose-50',
    iconFg: 'text-rose-700',
    title: 'Six executives. None of them trust each other.',
    body: 'CEO, CFO, CTO, CHRO, VP Strategy, your boss David. Each has a relationship score from 0–100. Each remembers everything. Two of them are usually in a quiet feud.',
  },
  {
    icon: 'alert',
    iconBg: 'bg-amber-50',
    iconFg: 'text-amber-700',
    title: 'Daily corporate plot twists.',
    body: 'Reply-All storms. The CEO posts something concerning on LinkedIn. Diana wants 5 minutes (it will not be 5 minutes). Attend, delegate, reschedule — every choice spends political capital.',
  },
  {
    icon: 'shield',
    iconBg: 'bg-emerald-50',
    iconFg: 'text-emerald-700',
    title: 'Learn the dark arts.',
    body: 'New defensive tools arrive when you can\'t survive without them. By the end you\'ll be blocking focus time, sending decks instead of attending, and cooking the books for short-term ExecConf wins.',
  },
  {
    icon: 'target',
    iconBg: 'bg-sky-50',
    iconFg: 'text-sky-700',
    title: 'Goals you\'ll grow to resent.',
    body: 'Five quarterly goals per stage. They rewrite themselves every Monday. You\'ll start chasing them. You\'ll start gaming them. The CFO will eventually audit your numbers.',
  },
  {
    icon: 'star',
    iconBg: 'bg-purple-50',
    iconFg: 'text-purple-700',
    title: 'Eight endings. Seven of them sting.',
    body: '"You\'ve been restructured." "Reassigned to Special Projects." Performance Improvement Plan. The endings are the punchline — corporate humiliation, named and dated. One is a real promotion.',
  },
];

const STAGES: {
  n: number;
  name: string;
  dayRange: string;
  quote: string;
  attributedTo: string;
}[] = [
  {
    n: 1,
    name: 'The First Week',
    dayRange: 'D1–5',
    quote: 'How bad could it be? It\'s just a few meetings.',
    attributedTo: 'You, Monday morning',
  },
  {
    n: 2,
    name: 'Welcome to Reality',
    dayRange: 'D6–10',
    quote: 'Wait — why are there only four accept slots now?',
    attributedTo: 'You, Day 6',
  },
  {
    n: 3,
    name: 'Bureaucracy',
    dayRange: 'D11–15',
    quote: 'You need three sign-offs before you can say yes to anything.',
    attributedTo: 'Diana, dryly',
  },
  {
    n: 4,
    name: 'Corporate Madness',
    dayRange: 'D16–20',
    quote: 'The Board is watching. So is Marcus. So is everyone.',
    attributedTo: 'David, sweating',
  },
  {
    n: 5,
    name: 'Executive Absurdity',
    dayRange: 'D21–25',
    quote: 'The Notes Bot has filed its first quarterly review of you.',
    attributedTo: 'Acme AI · 9:47 AM',
  },
];

const STATS = [
  { value: '127', label: 'Meetings per week' },
  { value: '87%', label: 'Time in meetings' },
  { value: '2%', label: 'Actual work output' },
  { value: '23', label: 'Employees, no PTO taken' },
];

const ENDINGS: { name: string; kind: 'win' | 'loss' }[] = [
  { name: 'Team Walkout',                  kind: 'loss' },
  { name: 'Forced Sabbatical',             kind: 'loss' },
  { name: '"Restructured"',                kind: 'loss' },
  { name: 'Process Paralysis',             kind: 'loss' },
  { name: 'Board Confidence Lost',         kind: 'loss' },
  { name: 'Reassigned to Special Projects', kind: 'loss' },
  { name: 'Performance Improvement Plan',  kind: 'loss' },
  { name: 'VP of Synergy',                 kind: 'win' },
];

function BackgroundGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full text-ink-200 opacity-[0.4] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="lp-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lp-grid)" />
    </svg>
  );
}
