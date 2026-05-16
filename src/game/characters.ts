/**
 * Character roster — the realistic names + AI-generated photos behind the
 * generic titles that the rest of the game uses for routing ("CEO", "CFO", etc).
 *
 * Why two layers? The underlying data still uses titles like "Your Boss" or "CEO"
 * because that's how it maps to gameplay (senderToStakeholder etc). But for UI,
 * we always display a real name + photo so the company feels like a real company.
 *
 * Photos: i.pravatar.cc — free CDN, deterministic per id, real-looking faces.
 * If the network drops, the Avatar component falls back to initials.
 */

export interface CharacterProfile {
  /** The realistic display name we always show in UI. */
  displayName: string;
  /** The role / title shown under the name. */
  role: string;
  /** AI-photo URL (Pravatar — deterministic by ?img=N). */
  photoUrl?: string;
}

/**
 * Map title/short-name → realistic profile.
 * Lookups are tried via this table; if the input string isn't a known key, the
 * helpers return the input unchanged (so existing names like "Alex P." keep
 * working without a profile entry).
 */
const ROSTER: Record<string, CharacterProfile> = {
  // ── Leadership stakeholders ───────────────────────────────────────────────
  'Your Boss':   { displayName: 'David Chen',     role: 'Director · Your Manager',  photoUrl: 'https://i.pravatar.cc/240?img=12' },
  'David Chen':  { displayName: 'David Chen',     role: 'Director · Your Manager',  photoUrl: 'https://i.pravatar.cc/240?img=12' },

  CEO:           { displayName: 'Marcus Hale',    role: 'Chief Executive Officer',  photoUrl: 'https://i.pravatar.cc/240?img=33' },
  'Marcus Hale': { displayName: 'Marcus Hale',    role: 'Chief Executive Officer',  photoUrl: 'https://i.pravatar.cc/240?img=33' },

  CFO:             { displayName: 'Diana Vargas',  role: 'Chief Financial Officer',  photoUrl: 'https://i.pravatar.cc/240?img=47' },
  'Diana Vargas':  { displayName: 'Diana Vargas',  role: 'Chief Financial Officer',  photoUrl: 'https://i.pravatar.cc/240?img=47' },

  CTO:           { displayName: 'Raj Patel',      role: 'Chief Technology Officer', photoUrl: 'https://i.pravatar.cc/240?img=68' },
  'Raj Patel':   { displayName: 'Raj Patel',      role: 'Chief Technology Officer', photoUrl: 'https://i.pravatar.cc/240?img=68' },

  CHRO:           { displayName: 'Maya Johnson',  role: 'Chief People Officer',     photoUrl: 'https://i.pravatar.cc/240?img=44' },
  'Maya Johnson': { displayName: 'Maya Johnson',  role: 'Chief People Officer',     photoUrl: 'https://i.pravatar.cc/240?img=44' },

  'VP Strategy':    { displayName: 'Tom Whitfield', role: 'VP, Strategy & Synergy', photoUrl: 'https://i.pravatar.cc/240?img=51' },
  'Tom Whitfield':  { displayName: 'Tom Whitfield', role: 'VP, Strategy & Synergy', photoUrl: 'https://i.pravatar.cc/240?img=51' },

  // ── Supporting cast (existing realistic names) ────────────────────────────
  'Sam T.':       { displayName: 'Sam Torres',     role: 'Senior Product Manager',    photoUrl: 'https://i.pravatar.cc/240?img=24' },
  'Sam Torres':   { displayName: 'Sam Torres',     role: 'Senior Product Manager',    photoUrl: 'https://i.pravatar.cc/240?img=24' },

  'Pat L.':       { displayName: 'Pat Lawson',     role: 'Account Executive',         photoUrl: 'https://i.pravatar.cc/240?img=20' },
  'Pat Lawson':   { displayName: 'Pat Lawson',     role: 'Account Executive',         photoUrl: 'https://i.pravatar.cc/240?img=20' },

  'Alex P.':      { displayName: 'Alex Park',      role: 'Engineering Lead',          photoUrl: 'https://i.pravatar.cc/240?img=59' },
  'Alex Park':    { displayName: 'Alex Park',      role: 'Engineering Lead',          photoUrl: 'https://i.pravatar.cc/240?img=59' },

  'Riya K.':      { displayName: 'Riya Krishnan',  role: 'Senior Software Engineer',  photoUrl: 'https://i.pravatar.cc/240?img=49' },
  'Riya Krishnan':{ displayName: 'Riya Krishnan',  role: 'Senior Software Engineer',  photoUrl: 'https://i.pravatar.cc/240?img=49' },

  'Marcus W.':    { displayName: 'Marcus Walsh',   role: 'Staff Engineer',            photoUrl: 'https://i.pravatar.cc/240?img=15' },
  'Marcus Walsh': { displayName: 'Marcus Walsh',   role: 'Staff Engineer',            photoUrl: 'https://i.pravatar.cc/240?img=15' },

  'Dev S.':       { displayName: 'Dev Singh',      role: 'Software Engineer',         photoUrl: 'https://i.pravatar.cc/240?img=11' },
  'Dev Singh':    { displayName: 'Dev Singh',      role: 'Software Engineer',         photoUrl: 'https://i.pravatar.cc/240?img=11' },

  'Jin H.':       { displayName: 'Jin Hwang',      role: 'Software Engineer',         photoUrl: 'https://i.pravatar.cc/240?img=36' },
  'Jin Hwang':    { displayName: 'Jin Hwang',      role: 'Software Engineer',         photoUrl: 'https://i.pravatar.cc/240?img=36' },

  // The bots stay iconic (no photos — Avatar renders the system glyph instead)
  HR:            { displayName: 'Maya Johnson',   role: 'People Ops',                photoUrl: 'https://i.pravatar.cc/240?img=44' },
};

/**
 * Look up the realistic display name for any sender id.
 * Returns the input unchanged when no profile is registered (so e.g. "KPI Bot" stays "KPI Bot").
 */
export function characterDisplayName(name: string): string {
  return ROSTER[name]?.displayName ?? name;
}

/** Look up the role / title under the avatar. Returns undefined when unknown. */
export function characterRole(name: string): string | undefined {
  return ROSTER[name]?.role;
}

/** Look up the photo URL for a name. Returns undefined for bots / unknown senders. */
export function characterPhoto(name: string): string | undefined {
  return ROSTER[name]?.photoUrl;
}

/** True when the given name is one of our seeded characters (vs. an open string). */
export function isKnownCharacter(name: string): boolean {
  return name in ROSTER;
}
