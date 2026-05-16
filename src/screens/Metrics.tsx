import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame, STARTING_KPIS } from '@/game/store';
import { STAGE1_GOALS } from '@/game/data';
import { KPI_META } from '@/components/KpiBadge';
import { Sparkline } from '@/components/Sparkline';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { isGoalAchieved, goalCurrentValue } from '@/components/GoalsCard';
import { SENTIMENT_META, sentimentFor } from '@/game/politics';
import { characterDisplayName } from '@/game/characters';
import type { KpiKey, Kpis, ChatMessage } from '@/game/types';

const ORDER: KpiKey[] = [
  'productivity',
  'morale',
  'burnout',
  'alignment',
  'executiveConfidence',
  'visibility',
];

/**
 * Composite "Manager Score" — a single number for the player to chase.
 * Weights brownie-point KPIs positively, productivity neutrally (you're a manager,
 * not an IC), and burnout negatively. Returns 0-100.
 */
function managerScore(k: Kpis): number {
  const v =
    k.visibility * 0.28 +
    k.executiveConfidence * 0.28 +
    k.alignment * 0.22 +
    k.morale * 0.12 +
    k.productivity * 0.05 +
    (100 - k.burnout) * 0.05;
  return Math.round(v);
}

function scoreLabel(s: number): string {
  if (s >= 85) return 'Legendary';
  if (s >= 70) return 'Strong Performer';
  if (s >= 55) return 'On Track';
  if (s >= 40) return 'Needs Attention';
  return 'At Risk';
}

export function Metrics() {
  const kpis = useGame((s) => s.kpis);
  const history = useGame((s) => s.history);
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);
  const conversations = useGame((s) => s.conversations);
  const messages = useGame((s) => s.messages);
  const openConversation = useGame((s) => s.openConversation);
  const setScreen = useGame((s) => s.setScreen);
  const stakeholders = useGame((s) => s.stakeholders);

  // Latest 3 non-outgoing messages across group channels — the "from the chats" widget.
  // This is how Insights numbers become observable behavior.
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

  const score = managerScore(kpis);
  const prevKpis = history.length > 0 ? history[history.length - 1] : STARTING_KPIS;
  const scoreDelta = score - managerScore(prevKpis);

  const scoreSeries = [STARTING_KPIS, ...history].map(managerScore);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
            Stage {stage} · Day {day}
          </div>
          <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">Insights</h1>
        </div>
        <button className="w-8 h-8 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-500">
          <Icon name="settings" size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll px-5 py-4 space-y-4">
        {/* Hero: Manager Score */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-md text-white p-4 shadow-el-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10.5px] font-bold tracking-widest uppercase text-white/70">
                Manager Score
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[44px] font-extrabold leading-none tabular-nums">{score}</span>
                <span className="text-[12px] text-white/70">/100</span>
                {history.length > 0 && scoreDelta !== 0 && (
                  <span
                    className={`text-[12px] font-bold tabular-nums inline-flex items-center gap-0.5 ${
                      scoreDelta > 0 ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    <Icon name={scoreDelta > 0 ? 'arrow-up' : 'arrow-down'} size={13} />
                    {Math.abs(scoreDelta)}
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-[12.5px] font-semibold text-white/85">{scoreLabel(score)}</div>
            </div>
            <Sparkline values={scoreSeries} color="#FFFFFF" height={42} width={92} />
          </div>
        </motion.div>

        {/* Compact goal status row */}
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

        {/* KPI grid — 2 columns, denser */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="text-[10.5px] font-bold tracking-widest text-ink-400 mb-2 uppercase">
            KPIs
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ORDER.map((k, idx) => {
              const meta = KPI_META[k];
              const series = [STARTING_KPIS[k], ...history.map((h) => h[k])];
              const prev = series.length >= 2 ? series[series.length - 2] : STARTING_KPIS[k];
              const delta = kpis[k] - prev;
              return (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + idx * 0.02 }}
                  className="bg-white rounded-md border border-ink-100 shadow-el-1 p-3"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <Icon name={meta.icon} size={12} className={meta.color} />
                    <span className="truncate">{meta.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-[20px] font-bold text-ink-800 tabular-nums leading-none">
                      {kpis[k]}
                    </span>
                    <span className="text-[10px] text-ink-300">/100</span>
                    {history.length > 0 && delta !== 0 && (
                      <span
                        className={`text-[10.5px] font-bold tabular-nums inline-flex items-center gap-0.5 ml-auto ${
                          delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        <Icon name={delta > 0 ? 'arrow-up' : 'arrow-down'} size={11} />
                        {Math.abs(delta)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <Sparkline values={series} color={meta.hex} height={20} width={140} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* People pulse — top mover relationships + boss callout */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1"
        >
          <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-ink-100">
            <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase">
              People pulse
            </div>
            <button
              onClick={() => setScreen('people')}
              className="text-[10.5px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5"
            >
              Open People
              <Icon name="chevron-right" size={12} />
            </button>
          </div>
          <ul className="divide-y divide-ink-100">
            {(() => {
              // Show the boss first, then the next 2 most-impactful relationships
              // (furthest from neutral 50).
              const boss = stakeholders.find((s) => s.id === 'boss');
              const others = stakeholders
                .filter((s) => s.id !== 'boss')
                .sort((a, b) => Math.abs(b.relationship - 50) - Math.abs(a.relationship - 50))
                .slice(0, 2);
              const show = boss ? [boss, ...others] : others;
              return show.map((s) => {
                const senti = sentimentFor(s.relationship);
                const meta = SENTIMENT_META[senti];
                const display = characterDisplayName(s.name);
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setScreen('people')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-ink-50 transition"
                    >
                      <Avatar name={display} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-ink-800 text-[12.5px] truncate">
                            {display}
                          </span>
                          {s.id === 'boss' && (
                            <span className="inline-flex items-center px-1 h-[14px] rounded-full text-[8.5px] font-extrabold tracking-widest text-white bg-brand-600">
                              BOSS
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-1.5 h-[16px] rounded-full text-[9.5px] font-bold ${meta.bg} ${meta.fg}`}
                          >
                            {meta.label.toUpperCase()}
                          </span>
                        </div>
                        {s.lastNote && (
                          <div className="text-[11px] text-ink-500 italic mt-0.5 truncate">
                            "{s.lastNote}"
                          </div>
                        )}
                      </div>
                      <div
                        className="text-[15px] font-extrabold tabular-nums shrink-0"
                        style={{ color: meta.edge }}
                      >
                        {s.relationship}
                      </div>
                    </button>
                  </li>
                );
              });
            })()}
          </ul>
        </motion.div>

        {/* From the chats — what people are actually saying, behind the numbers */}
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
                          <span className="font-semibold text-ink-700 truncate">{characterDisplayName(msg.sender)}</span>
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

        <div className="pt-2 text-center text-[11px] text-ink-300">
          {history.length === 0
            ? 'Play a day to start the chart.'
            : `Tracking ${history.length} day${history.length === 1 ? '' : 's'} of corporate evidence.`}
        </div>
      </div>
    </div>
  );
}
