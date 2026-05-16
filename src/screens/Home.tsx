import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame, STARTING_KPIS } from '@/game/store';
import { COMPANY, STAGE1_GOALS } from '@/game/data';
import { KPI_META } from '@/components/KpiBadge';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { MenuButton } from '@/components/SettingsDrawer';
import { isGoalAchieved, goalCurrentValue } from '@/components/GoalsCard';
import { SENTIMENT_META, sentimentFor } from '@/game/politics';
import { characterDisplayName } from '@/game/characters';
import type { KpiKey, Kpis, Stakeholder, ChatMessage } from '@/game/types';

const ORDER: KpiKey[] = [
  'productivity',
  'morale',
  'burnout',
  'alignment',
  'executiveConfidence',
  'visibility',
];

/**
 * Home — the orchestration hub.
 *
 * Sections (top to bottom):
 *  1. Company Hero — Acme Corp branding, day, dynamic vibe headline
 *  2. Quarterly Goals — strategic targets the player is chasing this quarter
 *  3. KPIs sponsored by your Leadership — each KPI alongside its sponsor's
 *     relationship score, so the cause-effect link between People and KPIs is visible
 *  4. From the Chats — the company's voice
 */
export function Home() {
  const kpis = useGame((s) => s.kpis);
  const history = useGame((s) => s.history);
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);
  const conversations = useGame((s) => s.conversations);
  const messages = useGame((s) => s.messages);
  const openConversation = useGame((s) => s.openConversation);
  const setScreen = useGame((s) => s.setScreen);
  const stakeholders = useGame((s) => s.stakeholders);

  const stakeholderById = useMemo(() => {
    const map: Record<string, Stakeholder> = {};
    for (const s of stakeholders) map[s.id] = s;
    return map;
  }, [stakeholders]);

  const chatPulse = useMemo(() => {
    const out: Array<{ msg: ChatMessage; channel: string }> = [];
    for (const c of conversations) {
      if (c.kind !== 'group') continue;
      const list = messages[c.id] ?? [];
      for (const m of list) {
        if (m.outgoing) continue;
        out.push({ msg: m, channel: c.name });
      }
    }
    return out.sort((a, b) => b.msg.ts - a.msg.ts).slice(0, 3);
  }, [conversations, messages]);

  return (
    <div className="flex flex-col h-full">
      {/* App bar */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 border-b border-ink-100">
        <MenuButton />
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
            Stage {stage} · Day {day}
          </div>
          <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">Home</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll px-5 py-4 space-y-4">
        {/* 1. Company Hero */}
        <CompanyHero kpis={kpis} stakeholders={stakeholders} day={day} />

        {/* 2. Quarterly Goals */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1 px-4 py-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase">
              Quarterly Goals
            </div>
            <span className="text-[11px] font-semibold text-ink-500 tabular-nums">
              {STAGE1_GOALS.filter((g) =>
                isGoalAchieved(g, goalCurrentValue(g, kpis, stakeholders)),
              ).length}{' '}
              / {STAGE1_GOALS.length} hit
            </span>
          </div>
          <ul className="space-y-1.5">
            {STAGE1_GOALS.map((g) => {
              const v = goalCurrentValue(g, kpis, stakeholders);
              const ok = isGoalAchieved(g, v);
              return (
                <li key={g.id} className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-ink-700 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-ink-200'}`}
                    />
                    <span className="truncate">{g.label}</span>
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      ok ? 'text-emerald-600' : 'text-ink-500'
                    }`}
                  >
                    {v} / {g.target}
                    {g.lowerIsBetter ? ' ↓' : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* 3. KPIs sponsored by Leadership — the cause-effect link */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase">
              KPIs · Sponsored by Leadership
            </div>
            <button
              onClick={() => setScreen('people')}
              className="text-[10.5px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
            >
              People
              <Icon name="chevron-right" size={12} />
            </button>
          </div>
          <ul className="bg-white rounded-md border border-ink-100 shadow-el-1 divide-y divide-ink-100 overflow-hidden">
            {ORDER.map((k, idx) => {
              const meta = KPI_META[k];
              const series = [STARTING_KPIS[k], ...history.map((h) => h[k])];
              const prev = series.length >= 2 ? series[series.length - 2] : STARTING_KPIS[k];
              const delta = kpis[k] - prev;
              const sponsor = stakeholderById[meta.sponsor];
              return (
                <SponsoredKpiRow
                  key={k}
                  meta={meta}
                  value={kpis[k]}
                  delta={delta}
                  showDelta={history.length > 0}
                  sponsor={sponsor}
                  index={idx}
                  onTapSponsor={() => setScreen('people')}
                />
              );
            })}
          </ul>
          <div className="text-[10.5px] text-ink-400 mt-2 px-1 leading-snug">
            Each KPI is sponsored by a leader. Keep them happy and your numbers
            grow with you. Anger them and watch what happens.
          </div>
        </motion.div>

        {/* 4. From the chats — what people are actually saying */}
        {chatPulse.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-white rounded-md border border-ink-100 shadow-el-1"
          >
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-ink-100">
              <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase">
                From the chats
              </div>
              <button
                onClick={() => setScreen('chat')}
                className="text-[10.5px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
              >
                Open Chat
                <Icon name="chevron-right" size={12} />
              </button>
            </div>
            <ul className="divide-y divide-ink-100">
              {chatPulse.map(({ msg, channel }) => {
                const convo = conversations.find((c) => c.name === channel);
                return (
                  <li key={msg.id}>
                    <button
                      onClick={() => {
                        if (convo) {
                          openConversation(convo.id);
                          setScreen('chat');
                        }
                      }}
                      className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-ink-50 transition"
                    >
                      <Avatar name={characterDisplayName(msg.sender)} size={26} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-semibold text-ink-700 truncate">
                            {characterDisplayName(msg.sender)}
                          </span>
                          <span className="text-ink-300">·</span>
                          <span className="text-brand-700 font-semibold">{channel}</span>
                        </div>
                        <div className="text-[12.5px] text-ink-600 mt-0.5 italic leading-snug line-clamp-2">
                          "{msg.body}"
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        <div className="pt-1 text-center text-[11px] text-ink-300">
          {history.length === 0
            ? 'Play a day to start the chart.'
            : `Tracking ${history.length} day${history.length === 1 ? '' : 's'} of corporate evidence.`}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Company Hero — the morning-briefing card
// ──────────────────────────────────────────────────────────────────────────

function CompanyHero({
  kpis,
  stakeholders,
  day,
}: {
  kpis: Kpis;
  stakeholders: Stakeholder[];
  day: number;
}) {
  const dayLabel = useMemo(() => {
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return names[(day - 1) % 5];
  }, [day]);

  const vibe = useMemo(() => generateVibe(kpis, stakeholders), [kpis, stakeholders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-md text-white p-4 shadow-el-2 overflow-hidden relative"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-md bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon name="building" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Welcome back to
          </div>
          <div className="font-extrabold text-[22px] leading-tight tracking-tight">
            {COMPANY.name.toUpperCase()}
          </div>
          <div className="text-[12px] text-white/80 italic leading-snug mt-0.5">
            "{COMPANY.tagline}"
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-widest text-white/70">
            {dayLabel} · Day {day} of 5
          </div>
          <div className="text-[13px] font-medium text-white/95 mt-0.5 leading-snug">
            {vibe}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Generate a sarcastic one-line vibe headline based on current state.
 * Picks the highest-priority signal from the player's situation so the
 * Home page reads as a responsive, almost-sentient morning briefing.
 */
function generateVibe(kpis: Kpis, stakeholders: Stakeholder[]): string {
  const boss = stakeholders.find((s) => s.id === 'boss');
  const ceo = stakeholders.find((s) => s.id === 'ceo');
  const cfo = stakeholders.find((s) => s.id === 'cfo');

  // Most urgent first.
  if (boss && boss.relationship <= 25) return `${characterDisplayName(boss.name)} has been "wanting to chat".`;
  if (kpis.burnout >= 75) return 'Coffee count: dangerous. Consider sleep.';
  if (kpis.morale <= 25) return 'The team is quiet today. Suspiciously so.';
  if (ceo && ceo.relationship <= 25) return `${characterDisplayName(ceo.name)} skipped you in the morning round-robin.`;
  if (cfo && cfo.relationship <= 25) return `${characterDisplayName(cfo.name)} added you to the "burn rate" thread.`;
  if (kpis.executiveConfidence >= 80) return 'Leadership has been talking about you. Probably.';
  if (kpis.visibility >= 80) return "You're everywhere this week. Respect.";
  if (boss && boss.relationship >= 75) return `${characterDisplayName(boss.name)} is in a good mood today. Don't break it.`;
  if (kpis.alignment >= 75 && kpis.morale >= 60) return 'Calm waters. Briefly.';
  if (kpis.productivity <= 20) return 'Nothing got built today. You attended every meeting about it.';
  return 'Another day at the office.';
}

// ──────────────────────────────────────────────────────────────────────────
// Sponsored KPI row — KPI value alongside its sponsor's relationship
// ──────────────────────────────────────────────────────────────────────────

function SponsoredKpiRow({
  meta,
  value,
  delta,
  showDelta,
  sponsor,
  index,
  onTapSponsor,
}: {
  meta: typeof KPI_META[KpiKey];
  value: number;
  delta: number;
  showDelta: boolean;
  sponsor?: Stakeholder;
  index: number;
  onTapSponsor: () => void;
}) {
  // Burnout is inverted — going up is bad, down is good.
  const deltaIsGood = meta.inverted ? delta < 0 : delta > 0;
  const sponsorSenti = sponsor ? sentimentFor(sponsor.relationship) : null;
  const sponsorMeta = sponsorSenti ? SENTIMENT_META[sponsorSenti] : null;

  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.025 }}
      className="flex items-center gap-3 px-3 py-2.5"
    >
      {/* KPI side */}
      <div className="w-9 h-9 rounded-sm bg-ink-50 flex items-center justify-center shrink-0">
        <Icon name={meta.icon} size={16} className={meta.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 leading-none">
          {meta.label}
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-[18px] font-bold text-ink-800 tabular-nums leading-none">
            {value}
          </span>
          <span className="text-[10px] text-ink-300">/100</span>
          {showDelta && delta !== 0 && (
            <span
              className={`text-[10.5px] font-bold tabular-nums inline-flex items-center gap-0.5 ${
                deltaIsGood ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <Icon name={delta > 0 ? 'arrow-up' : 'arrow-down'} size={11} />
              {Math.abs(delta)}
            </span>
          )}
        </div>
      </div>

      {/* Connector dot */}
      <div className="text-ink-300 text-xs">·</div>

      {/* Sponsor side */}
      {sponsor && sponsorMeta ? (
        <button
          onClick={onTapSponsor}
          className="flex items-center gap-2 shrink-0 hover:bg-ink-50 rounded-sm px-1.5 py-1 -mx-1.5 transition"
        >
          <Avatar name={characterDisplayName(sponsor.name)} size={26} />
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider leading-none" style={{ color: sponsorMeta.edge }}>
              {firstName(characterDisplayName(sponsor.name))}
            </div>
            <div className="text-[13px] font-bold tabular-nums leading-none mt-0.5" style={{ color: sponsorMeta.edge }}>
              {sponsor.relationship}
            </div>
          </div>
        </button>
      ) : (
        <div className="text-[10.5px] text-ink-300 italic">no sponsor</div>
      )}
    </motion.li>
  );
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}
