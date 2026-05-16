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
