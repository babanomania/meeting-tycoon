import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/game/store';
import { Icon, type IconName } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { StakeholderMap } from '@/components/StakeholderMap';
import { MenuButton } from '@/components/SettingsDrawer';
import { SENTIMENT_META, politicalHeat, sentimentFor } from '@/game/politics';
import { characterDisplayName, characterRole } from '@/game/characters';
import type { Stakeholder } from '@/game/types';

/**
 * People — the politics screen.
 * Top hero: Boss Happiness gauge (since "make the boss happy" is the headline goal).
 * Then: Stakeholder map (hub-and-spoke).
 * Then: Per-stakeholder cards.
 * Plus: Political Heat indicator. Settings drawer accessible via menu icon.
 */
export function People() {
  const stakeholders = useGame((s) => s.stakeholders);
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);

  const boss = useMemo(
    () => stakeholders.find((s) => s.id === 'boss'),
    [stakeholders],
  );
  const heat = useMemo(() => politicalHeat(stakeholders), [stakeholders]);
  const sortedByScore = useMemo(
    () => [...stakeholders].sort((a, b) => b.relationship - a.relationship),
    [stakeholders],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 border-b border-ink-100">
        <MenuButton />
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
            Stage {stage} · Day {day}
          </div>
          <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">People</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll px-5 py-4 space-y-4">
        {/* Boss Happiness hero */}
        {boss && <BossHero boss={boss} />}

        {/* Stakeholder Map */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-md border border-ink-100 shadow-el-1 p-4"
        >
          <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase mb-2">
            Stakeholder Map
          </div>
          <div className="flex justify-center">
            <StakeholderMap stakeholders={stakeholders} />
          </div>
          <PoliticalHeatRow heat={heat} />
        </motion.div>

        {/* Per-stakeholder cards */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-[10.5px] font-bold tracking-widest text-ink-400 uppercase mb-2">
            Individual relationships
          </div>
          <ul className="space-y-2">
            {sortedByScore.map((s) => (
              <StakeholderCard key={s.id} s={s} isBoss={s.id === 'boss'} />
            ))}
          </ul>
        </motion.div>

        <div className="pt-1 text-center text-[11px] text-ink-300">
          Tap a person on the map for more. Long-term goal: keep everyone above neutral —
          especially the boss.
        </div>
      </div>

    </div>
  );
}

function BossHero({ boss }: { boss: Stakeholder }) {
  const senti = sentimentFor(boss.relationship);
  const label = senti === 'champion' ? 'Loves you' :
                senti === 'friendly' ? 'On your side' :
                senti === 'neutral'  ? 'Watching' :
                senti === 'cool'     ? 'Concerned' :
                                       'Furious';
  const displayName = characterDisplayName(boss.name);
  const role = characterRole(boss.name) ?? boss.role;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-md text-white p-4 shadow-el-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <Avatar name={displayName} size={52} className="ring-2 ring-white/40" />
            <span
              className="absolute -bottom-1 -right-1 px-1.5 h-[18px] rounded-full ring-2 ring-brand-700 flex items-center justify-center text-[9px] font-extrabold tracking-widest text-white bg-ink-800"
              aria-hidden
            >
              BOSS
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/70">
              Boss Happiness
            </div>
            <div className="font-bold text-[17px] leading-tight truncate">{displayName}</div>
            <div className="text-[11.5px] text-white/80">{role}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[36px] font-extrabold leading-none tabular-nums">{boss.relationship}</div>
          <div className="text-[11px] text-white/80 mt-0.5">{label}</div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all"
          style={{ width: `${boss.relationship}%` }}
        />
      </div>
      {boss.lastNote && (
        <div className="mt-2 text-[11px] text-white/80 italic">"{boss.lastNote}"</div>
      )}
    </motion.div>
  );
}

function PoliticalHeatRow({ heat }: { heat: number }) {
  const total = 6;
  const tone = heat >= 4 ? 'rose' : heat >= 2 ? 'amber' : 'emerald';
  const toneText =
    tone === 'rose' ? 'text-rose-700' : tone === 'amber' ? 'text-amber-700' : 'text-emerald-700';
  const heatLabel = heat >= 4 ? 'Burning' : heat >= 2 ? 'Warm' : 'Calm';
  return (
    <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon name="fire" size={14} className="text-rose-600" />
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">
          Political heat
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-sm ${
                i < heat
                  ? tone === 'rose'
                    ? 'bg-rose-500'
                    : tone === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                  : 'bg-ink-100'
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-bold tabular-nums ${toneText}`}>
          {heatLabel}
        </span>
      </div>
    </div>
  );
}

function StakeholderCard({ s, isBoss }: { s: Stakeholder; isBoss: boolean }) {
  const senti = sentimentFor(s.relationship);
  const meta = SENTIMENT_META[senti];
  const displayName = characterDisplayName(s.name);
  const role = characterRole(s.name) ?? s.role;
  return (
    <li className="bg-white rounded-md border border-ink-100 shadow-el-1 p-3 flex items-center gap-3">
      <Avatar name={displayName} size={40} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-semibold text-ink-800 text-[13.5px] truncate">
            {displayName}
          </div>
          {isBoss && (
            <span className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[10px] font-extrabold tracking-widest text-white bg-brand-600">
              BOSS
            </span>
          )}
          <span
            className={`inline-flex items-center px-1.5 h-[18px] rounded-full text-[10px] font-bold ${meta.bg} ${meta.fg}`}
          >
            {meta.label.toUpperCase()}
          </span>
        </div>
        <div className="text-[11px] text-ink-400 truncate">{role}</div>
        {s.lastNote && (
          <div className="text-[11.5px] text-ink-500 italic mt-0.5 truncate">"{s.lastNote}"</div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div
          className="text-[20px] font-extrabold tabular-nums leading-none"
          style={{ color: meta.edge }}
        >
          {s.relationship}
        </div>
        <TrendBadge trend={s.trend} />
      </div>
    </li>
  );
}

function TrendBadge({ trend }: { trend?: 'up' | 'down' | 'stable' }) {
  if (!trend || trend === 'stable') return null;
  const icon: IconName = trend === 'up' ? 'arrow-up' : 'arrow-down';
  const color = trend === 'up' ? 'text-emerald-600' : 'text-rose-600';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${color}`}>
      <Icon name={icon} size={10} />
    </span>
  );
}

