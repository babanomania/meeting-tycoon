import type { Sentiment, Stakeholder, StakeholderId } from './types';

/**
 * The roster of stakeholders the player is politically beholden to.
 * Everything in the game ultimately rolls up to "are these people happy with you?"
 */
export const STAKEHOLDERS_SEED: Stakeholder[] = [
  { id: 'boss',        name: 'Your Boss',  role: 'Director · Manager',       relationship: 55 },
  { id: 'ceo',         name: 'CEO',        role: 'Chief Executive',          relationship: 50 },
  { id: 'cfo',         name: 'CFO',        role: 'Chief Financial Officer',  relationship: 50 },
  { id: 'cto',         name: 'CTO',        role: 'Chief Technology Officer', relationship: 50 },
  { id: 'chro',        name: 'CHRO',       role: 'Chief People Officer',     relationship: 50 },
  { id: 'vp_strategy', name: 'VP Strategy', role: 'Strategy & Synergy',      relationship: 50 },
];

/**
 * Map any incoming "from" string used by meeting requests, chaos events, or
 * DMs to the canonical stakeholder id, when applicable.
 */
export function senderToStakeholder(from: string): StakeholderId | null {
  const f = from.toLowerCase();
  if (f.includes('your boss') || f === 'boss')        return 'boss';
  if (f.includes('ceo'))                              return 'ceo';
  if (f.includes('cfo'))                              return 'cfo';
  if (f.includes('cto'))                              return 'cto';
  if (f.includes('chro'))                             return 'chro';
  if (f.includes('vp strategy') || f.includes('strategy')) return 'vp_strategy';
  return null;
}

export function sentimentFor(score: number): Sentiment {
  if (score <= 25) return 'hostile';
  if (score <= 45) return 'cool';
  if (score <= 55) return 'neutral';
  if (score <= 75) return 'friendly';
  return 'champion';
}

/** Visual treatment per sentiment — used by Map + cards. */
export const SENTIMENT_META: Record<
  Sentiment,
  { label: string; fg: string; bg: string; edge: string }
> = {
  hostile:  { label: 'Hostile',  fg: 'text-rose-700',    bg: 'bg-rose-50',    edge: '#E11D48' },
  cool:     { label: 'Cool',     fg: 'text-amber-700',   bg: 'bg-amber-50',   edge: '#F59E0B' },
  neutral:  { label: 'Neutral',  fg: 'text-ink-600',     bg: 'bg-ink-100',    edge: '#94A3B8' },
  friendly: { label: 'Friendly', fg: 'text-sky-700',     bg: 'bg-sky-50',     edge: '#0EA5E9' },
  champion: { label: 'Champion', fg: 'text-emerald-700', bg: 'bg-emerald-50', edge: '#10B981' },
};

/**
 * Political Heat: how many stakeholders are below neutral. Returned as a 0-6 scale
 * matching the Stage 4 wireframe's "flame gauge".
 */
export function politicalHeat(list: Stakeholder[]): number {
  return list.filter((s) => s.relationship <= 45).length;
}

/** Apply a delta to one stakeholder; returns the updated list. */
export function adjustRelationship(
  list: Stakeholder[],
  id: StakeholderId,
  delta: number,
  note: string,
): Stakeholder[] {
  return list.map((s) => {
    if (s.id !== id) return s;
    const next = Math.max(0, Math.min(100, s.relationship + delta));
    return {
      ...s,
      relationship: next,
      lastNote: note,
      trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
    };
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Stage 4: Stakeholder Alliances and Feuds
//
// Alliances form when two stakeholders both sit at ≥70. They quietly back
// each other in meetings, which materializes as a small bonus to a paired
// KPI at day-end (see store.endDay).
//
// Feuds form when two stakeholders both sit at ≤30. They actively undermine
// each other, costing alignment.
//
// The pairings are *fixed* (not all pairs are politically plausible —
// CFO-CTO almost never align, CEO-Boss naturally do). Hand-picked below.
// ──────────────────────────────────────────────────────────────────────────

/** Hand-picked "natural" stakeholder pairings. Order doesn't matter. */
export const ALLIANCE_PAIRS: ReadonlyArray<readonly [StakeholderId, StakeholderId]> = [
  ['boss', 'ceo'],       // your boss & the CEO are above you, naturally aligned
  ['ceo', 'vp_strategy'], // CEO loves a strategist
  ['cfo', 'ceo'],        // CFO and CEO co-own the board narrative
  ['cto', 'chro'],       // ops + people, the "keep the team alive" coalition
  ['vp_strategy', 'chro'], // strategy + culture, the soft-power axis
];

export interface Alliance {
  pair: [StakeholderId, StakeholderId];
  kind: 'alliance' | 'feud';
  /** Average relationship of the pair — used to sort/show strength. */
  strength: number;
}

/**
 * Detect alliances + feuds among the current stakeholder roster.
 * Returns a list of pair states the UI can render and the store can reward.
 */
export function detectAlliances(list: Stakeholder[]): Alliance[] {
  const out: Alliance[] = [];
  for (const pair of ALLIANCE_PAIRS) {
    const a = list.find((s) => s.id === pair[0]);
    const b = list.find((s) => s.id === pair[1]);
    if (!a || !b) continue;
    const avg = (a.relationship + b.relationship) / 2;
    if (a.relationship >= 70 && b.relationship >= 70) {
      out.push({ pair: [pair[0], pair[1]], kind: 'alliance', strength: avg });
    } else if (a.relationship <= 30 && b.relationship <= 30) {
      out.push({ pair: [pair[0], pair[1]], kind: 'feud', strength: avg });
    }
  }
  return out;
}
