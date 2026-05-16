import type {
  ChatMessage,
  ChatReply,
  Conversation,
  MeetingTypeId,
} from './types';

// ──────────────────────────────────────────────────────────────────────────
// Conversation seeds — initial set the player sees on Day 1.
// Group channels are pinned, DMs surface dynamically as they "ping" the player,
// meeting chats are created when a meeting first appears on the calendar.
// ──────────────────────────────────────────────────────────────────────────

export const SEED_GROUPS: Omit<Conversation, 'lastMessageAt'>[] = [
  {
    id: 'group-general',
    kind: 'group',
    name: '#general',
    subtitle: 'All Hands · 23 members',
    participants: ['Brad Manager', 'Sam T.', 'Alex P.', 'Pat L.', 'CEO', 'HR'],
    pinned: true,
  },
  {
    id: 'group-engineering',
    kind: 'group',
    name: '#engineering',
    subtitle: '12 members',
    participants: ['Alex P.', 'Riya K.', 'Marcus W.', 'Dev S.', 'Jin H.'],
    pinned: true,
  },
  {
    id: 'group-leadership',
    kind: 'group',
    name: '#leadership',
    subtitle: 'Restricted · 6 members',
    participants: ['CEO', 'CFO', 'VP Strategy', 'CHRO', 'CTO'],
    pinned: true,
  },
  {
    id: 'group-culture',
    kind: 'group',
    name: '#culture',
    subtitle: 'People Ops · 23 members',
    participants: ['HR', 'People Bot', 'Sam T.', 'Pat L.'],
    pinned: true,
  },
];

/**
 * DM definitions — keyed by sender id. Used to materialize a DM conversation
 * the first time that sender pings the player.
 */
export const DM_PROFILES: Record<
  string,
  { id: string; name: string; role: string; isSystem?: boolean; urgent?: boolean }
> = {
  ceo:           { id: 'dm-ceo',         name: 'CEO',          role: 'Chief Executive',          urgent: true },
  boss:          { id: 'dm-boss',        name: 'Your Boss',    role: 'Director',                 urgent: true },
  vp_strategy:  { id: 'dm-vp-strategy', name: 'VP Strategy',  role: 'VP, Strategy' },
  cfo:           { id: 'dm-cfo',         name: 'CFO',          role: 'Chief Financial Officer',  urgent: true },
  hr:            { id: 'dm-hr',          name: 'HR',           role: 'People Ops' },
  sam_t:         { id: 'dm-sam-t',       name: 'Sam T.',       role: 'Senior PM' },
  alex_p:        { id: 'dm-alex-p',      name: 'Alex P.',      role: 'Engineering Lead' },
  pat_l:         { id: 'dm-pat-l',       name: 'Pat L.',       role: 'Account Executive' },
  acme_ops:     { id: 'dm-acme-ops',   name: 'Acme Ops',     role: 'Automated · Operations',   isSystem: true, urgent: true },
  people_bot:   { id: 'dm-people-bot', name: 'People Bot',   role: 'Automated · Wellness',     isSystem: true },
  kpi_bot:       { id: 'dm-kpi-bot',     name: 'KPI Bot',      role: 'Automated · Reporting',    isSystem: true },
  ceo_linkedin: { id: 'dm-ceo-linkedin', name: 'CEO LinkedIn', role: 'Posted publicly',         isSystem: true },
};

/**
 * Meta for each recurring meeting type that gets its own meeting chat.
 * Only meetings that the player actually accepts get a chat instantiated.
 */
export const MEETING_CHAT_META: Record<MeetingTypeId, { participants: string[] }> = {
  standup:           { participants: ['Alex P.', 'Riya K.', 'Marcus W.', 'Dev S.'] },
  'project-kickoff': { participants: ['Sam T.', 'Pat L.', 'Alex P.', 'You'] },
  '1on1':            { participants: ['Brad Manager', 'You'] },
  'stakeholder-sync': { participants: ['Pat L.', 'CFO', 'CEO'] },
  'town-hall':       { participants: ['CEO', 'CHRO', 'You'] },
  'strategy-offsite': { participants: ['CEO', 'VP Strategy', 'CFO', 'CTO'] },
  'budget-review':   { participants: ['CFO', 'CEO', 'You'] },
  'all-hands':       { participants: ['CEO', 'CHRO', 'HR'] },
  'pre-read-sync':   { participants: ['VP Strategy', 'Sam T.'] },
  retro:             { participants: ['Alex P.', 'Riya K.', 'Sam T.'] },
  'okr-checkin':     { participants: ['VP Strategy', 'CTO', 'CFO'] },
  'design-review':   { participants: ['Sam T.', 'Riya K.', 'Marcus W.'] },
  'eng-escalation':  { participants: ['CTO', 'Alex P.', 'Dev S.'] },
  'culture-sync':    { participants: ['HR', 'Sam T.', 'Pat L.'] },
  'pr-cleanup':      { participants: ['CHRO', 'CFO', 'VP Strategy'] },
};

// ──────────────────────────────────────────────────────────────────────────
// Static "Day 1 lore" — baseline messages so each channel feels alive
// from the moment the player opens the app.
// ──────────────────────────────────────────────────────────────────────────

interface SeedMessage {
  conversationId: string;
  sender: string;
  body: string;
  /** Offset (ms) before now — earlier numbers mean older messages */
  ageOffsetMin: number;
  reactions?: string[];
}

export const SEED_MESSAGES: SeedMessage[] = [
  // #general — morning chatter
  { conversationId: 'group-general', sender: 'CEO',          body: "Morning, team. Big week ahead. Let's make it count 💪", ageOffsetMin: 60 },
  { conversationId: 'group-general', sender: 'HR',           body: 'Reminder: cameras on for the all-hands. Thanks!', ageOffsetMin: 50, reactions: ['👀'] },
  { conversationId: 'group-general', sender: 'Pat L.',       body: "ngl I just learned what 'synergy' means and now I can't unsee it", ageOffsetMin: 40, reactions: ['😂', '😂', '🙏'] },

  // #engineering — already cynical
  { conversationId: 'group-engineering', sender: 'Alex P.',  body: 'standup in 10 ☕', ageOffsetMin: 55 },
  { conversationId: 'group-engineering', sender: 'Dev S.',   body: 'do we... need to be on camera', ageOffsetMin: 52, reactions: ['😐'] },
  { conversationId: 'group-engineering', sender: 'Riya K.',  body: 'putting the prod fire out, will join in 5', ageOffsetMin: 48 },
  { conversationId: 'group-engineering', sender: 'Marcus W.', body: 'fire? oh no the fire is fine. the meeting *about* the fire is the problem', ageOffsetMin: 47, reactions: ['🔥', '💀'] },

  // #leadership — strategically vague
  { conversationId: 'group-leadership', sender: 'CEO',       body: 'Aligning on the alignment before the alignment meeting.', ageOffsetMin: 70 },
  { conversationId: 'group-leadership', sender: 'CFO',       body: 'Q3 burn is "spicy". Will share deck after coffee.', ageOffsetMin: 58, reactions: ['🌶️'] },
  { conversationId: 'group-leadership', sender: 'VP Strategy', body: "We're transformatively transforming.", ageOffsetMin: 45, reactions: ['🚀', '🙏'] },

  // #culture — slightly worrying
  { conversationId: 'group-culture', sender: 'HR',          body: '🌱 wellness check-in: how is everyone *really* doing?', ageOffsetMin: 35 },
  { conversationId: 'group-culture', sender: 'Sam T.',      body: 'fine. fine. everything is fine.', ageOffsetMin: 33 },
  { conversationId: 'group-culture', sender: 'People Bot',  body: 'I detect 4 mentions of "fine" in the last 2 minutes 🌱', ageOffsetMin: 32, reactions: ['💀'] },
];

// ──────────────────────────────────────────────────────────────────────────
// Event-driven message templates
// ──────────────────────────────────────────────────────────────────────────

import type { ChatEvent } from './types';
export type { ChatEvent };

/** One reaction in a channel that fires when an event matches. */
interface EventReaction {
  /** Channel id this message lands in. */
  conversationId: string;
  sender: string;
  /** Function so the body can reference event params. */
  body: (e: ChatEvent) => string;
  reactions?: string[];
}

/**
 * Channels react to player actions. Each handler can return any number of
 * messages — keep it 0-2 per event so the chat doesn't flood.
 */
export const EVENT_REACTIONS: Array<{
  match: (e: ChatEvent) => boolean;
  reactions: EventReaction[];
}> = [
  // ── On accept ──────────────────────────────────────────────────────────
  {
    match: (e) => e.type === 'meeting-accepted' && e.meetingTypeId === 'town-hall',
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Marcus W.',
        body: () => 'another all-hands. great.',
        reactions: ['😐', '💀'],
      },
    ],
  },
  {
    match: (e) => e.type === 'meeting-accepted' && e.meetingTypeId === 'strategy-offsite',
    reactions: [
      {
        conversationId: 'group-leadership',
        sender: 'VP Strategy',
        body: () => 'Excellent. The four-quadrant matrix awaits us.',
        reactions: ['🙏'],
      },
    ],
  },
  {
    match: (e) => e.type === 'meeting-accepted' && e.meetingTypeId === 'eng-escalation',
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Alex P.',
        body: () => 'finally addressing the escalation. only took 4 days.',
        reactions: ['🙏', '🫠'],
      },
    ],
  },
  {
    match: (e) => e.type === 'meeting-accepted' && e.meetingTypeId === 'all-hands',
    reactions: [
      {
        conversationId: 'group-general',
        sender: 'Sam T.',
        body: () => 'mandatory fun incoming 🎉',
        reactions: ['😂', '💀', '🎉'],
      },
    ],
  },
  {
    match: (e) => e.type === 'meeting-accepted' && e.meetingTypeId === 'culture-sync',
    reactions: [
      {
        conversationId: 'group-culture',
        sender: 'HR',
        body: () => 'so excited to dig into culture today 🌱',
        reactions: ['🙏'],
      },
    ],
  },

  // ── On decline ─────────────────────────────────────────────────────────
  {
    match: (e) => e.type === 'meeting-declined' && e.meetingTypeId === 'standup',
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Riya K.',
        body: () => 'manager skipped standup. living the dream over there',
        reactions: ['👀', '🙏'],
      },
    ],
  },
  {
    match: (e) => e.type === 'meeting-declined' && e.meetingTypeId === 'town-hall',
    reactions: [
      {
        conversationId: 'group-leadership',
        sender: 'CHRO',
        body: () => 'noting who is *not* in the town hall.',
        reactions: ['👀'],
      },
    ],
  },
  {
    match: (e) => e.type === 'meeting-declined',
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Dev S.',
        body: () => 'fewer meetings = more code. tentatively hopeful.',
        reactions: ['🙏', '👏'],
      },
    ],
  },

  // ── On chaos resolve ───────────────────────────────────────────────────
  {
    match: (e) => e.type === 'chaos-resolved' && e.response === 'attend',
    reactions: [
      {
        conversationId: 'group-leadership',
        sender: 'CEO',
        body: () => 'Appreciate the responsiveness 🙏',
        reactions: ['🙏'],
      },
    ],
  },
  {
    match: (e) => e.type === 'chaos-resolved' && e.response === 'delegate',
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Alex P.',
        body: () => 'and now *I* have to attend the surprise meeting. cool cool cool.',
        reactions: ['💀', '🫠'],
      },
    ],
  },
  {
    match: (e) => e.type === 'chaos-resolved' && e.response === 'reschedule',
    reactions: [
      {
        conversationId: 'group-leadership',
        sender: 'CFO',
        body: () => "Rescheduled. Let's see how *that* lands.",
        reactions: ['👀'],
      },
    ],
  },

  // ── On day end — KPI-driven sentiment ──────────────────────────────────
  {
    match: (e) => e.type === 'day-end' && e.kpis.burnout >= 60,
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Riya K.',
        body: () => 'logging off. see you in too few hours.',
        reactions: ['🫠', '🫠'],
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.kpis.morale <= 35,
    reactions: [
      {
        conversationId: 'group-culture',
        sender: 'Sam T.',
        body: () => "I'm fine. We're fine. Everything is fine.",
        reactions: ['💀', '🫠'],
      },
      {
        conversationId: 'group-general',
        sender: 'Marcus W.',
        body: () => 'is anyone else feeling this? asking for me.',
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.kpis.executiveConfidence >= 75,
    reactions: [
      {
        conversationId: 'group-leadership',
        sender: 'CEO',
        body: () => 'Stellar day. Whatever you are doing, keep doing it.',
        reactions: ['🙌', '🚀'],
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.kpis.visibility >= 75,
    reactions: [
      {
        conversationId: 'group-general',
        sender: 'Pat L.',
        body: () => 'manager is *everywhere* this week. respect.',
        reactions: ['👀', '🙏'],
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.kpis.productivity <= 15,
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Dev S.',
        body: () => 'roadmap update: postponed everything to "future sprints"',
        reactions: ['💀'],
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.kpis.alignment >= 75,
    reactions: [
      {
        conversationId: 'group-general',
        sender: 'CHRO',
        body: () => 'beautiful alignment across the org today 🎯',
        reactions: ['🎯', '🙏'],
      },
    ],
  },

  // ── On day end — positive recovery reactions (Stage 0 recovery loop) ──
  // These fire when the player has shown restraint — light calendar,
  // high productivity, recovered burnout, or simply skipped meetings.
  // Provide the player with audible reward for *not* booking.
  {
    match: (e) =>
      e.type === 'day-end' && e.kpis.productivity >= 70 && e.meetingsHeld <= 3,
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Dev S.',
        body: () => 'actually shipped something today 🚀',
        reactions: ['🚀', '🙌'],
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.kpis.burnout <= 20,
    reactions: [
      {
        conversationId: 'group-culture',
        sender: 'People Bot',
        body: () => 'the team looks well-rested. Suspicious. Logging it as anomaly.',
        reactions: ['👀'],
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.kpis.morale >= 75,
    reactions: [
      {
        conversationId: 'group-general',
        sender: 'Pat L.',
        body: () => 'good vibes today. nobody cried in standup. small wins.',
        reactions: ['🙌', '✨'],
      },
    ],
  },
  {
    match: (e) => e.type === 'day-end' && e.meetingsHeld <= 2,
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Marcus W.',
        body: () => 'manager skipped most of the meetings and we got *work* done. wild concept.',
        reactions: ['🔥', '👏'],
      },
    ],
  },

  // ── On day start — morning chatter ─────────────────────────────────────
  {
    match: (e) => e.type === 'day-start',
    reactions: [
      {
        conversationId: 'group-engineering',
        sender: 'Alex P.',
        body: (e) =>
          e.type === 'day-start' && e.day === 5
            ? 'friday standup. just nod and survive.'
            : 'standup in 10 ☕',
      },
      {
        conversationId: 'group-general',
        sender: 'HR',
        body: () => '☀️ morning! reminder: hydrate.',
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Meeting-chat lore — messages that fire when a meeting "happens" at end of day
// ──────────────────────────────────────────────────────────────────────────

export const MEETING_HELD_TEMPLATES: Partial<
  Record<MeetingTypeId, Array<{ sender: string; body: string; reactions?: string[] }>>
> = {
  standup: [
    { sender: 'Alex P.', body: 'standup over. action items: more standups.', reactions: ['💀'] },
    { sender: 'Riya K.', body: 'I will say "no blockers" again tomorrow.' },
  ],
  'project-kickoff': [
    { sender: 'Sam T.', body: 'kickoff! action items in the doc 📝' },
    { sender: 'Alex P.', body: 'looking forward to the kickoff for the recap meeting.', reactions: ['😂'] },
  ],
  '1on1': [
    { sender: 'Brad Manager', body: 'good chat. keep doing the things. circle back next week.' },
  ],
  'stakeholder-sync': [
    { sender: 'Pat L.', body: 'great alignment 🙏' },
    { sender: 'CFO', body: 'we will sync on the sync next week.' },
  ],
  'town-hall': [
    { sender: 'CEO', body: "great session everyone. we're in this together." },
    { sender: 'CHRO', body: 'follow-up slide deck dropping later today.', reactions: ['👀'] },
  ],
  'strategy-offsite': [
    { sender: 'VP Strategy', body: 'four quadrants. game changer.', reactions: ['🚀'] },
    { sender: 'CEO', body: 'lunch was excellent.' },
  ],
  'budget-review': [
    { sender: 'CFO', body: 'numbers were... numbers.' },
  ],
  'all-hands': [
    { sender: 'HR', body: 'thanks for joining! recording attached.' },
  ],
  'pre-read-sync': [
    { sender: 'VP Strategy', body: 'now we are aligned on what to align on tomorrow.' },
  ],
  retro: [
    { sender: 'Sam T.', body: 'three stickies. all say "comms". again.', reactions: ['💀'] },
  ],
  'okr-checkin': [
    { sender: 'VP Strategy', body: 'OKRs are now KORs. it sounds better.' },
  ],
  'design-review': [
    { sender: 'Marcus W.', body: 'love the new shadow. could be slightly bluer.', reactions: ['😂'] },
  ],
  'eng-escalation': [
    { sender: 'CTO', body: 'great call. prod is still on fire but at least we discussed it.', reactions: ['🔥'] },
  ],
  'culture-sync': [
    { sender: 'HR', body: 'we are a family ❤️' },
    { sender: 'People Bot', body: '*legally distinct from a family', reactions: ['💀'] },
  ],
  'pr-cleanup': [
    { sender: 'CHRO', body: 'statement drafted. lawyers approved. crisis averted (probably).' },
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// DM templates — incoming messages from characters, with reply options
// (Replaces the old ping system 1:1 — same data, different shape.)
// ──────────────────────────────────────────────────────────────────────────

export interface DmTemplate {
  templateId: string;
  /** Which DM profile this lands in. */
  dmKey: keyof typeof DM_PROFILES;
  /** When this template fires. */
  trigger: 'morning' | 'on-accept' | 'on-decline' | 'on-chaos' | 'random';
  body: string;
  options: ChatReply[];
}

export const DM_TEMPLATES: DmTemplate[] = [
  {
    templateId: 'ceo-q3-align',
    dmKey: 'ceo',
    trigger: 'morning',
    body: 'Hey, do you have 10 min to chat about Q3 alignment? It is somewhat important.',
    options: [
      { text: 'Sure, jumping on now', delta: { visibility: +5, executiveConfidence: +4, productivity: -3 } },
      { text: 'Sending a calendar invite for later', delta: { alignment: +3, visibility: +2 } },
      { text: 'Can it wait until tomorrow?', delta: { executiveConfidence: -5, morale: +1 } },
    ],
  },
  {
    templateId: 'hr-cameras',
    dmKey: 'hr',
    trigger: 'morning',
    body: 'Quick reminder: cameras-on policy is in effect for all-hands. Thanks!',
    options: [
      { text: 'Will comply 👍', delta: { alignment: +2, morale: -2 } },
      { text: '👍', delta: {} },
      { text: 'Asking why this is a policy', delta: { morale: +3, alignment: -3 } },
    ],
  },
  {
    templateId: 'ops-eng-drowning',
    dmKey: 'acme_ops',
    trigger: 'morning',
    body: 'Engineering is drowning. Backlog up 40% this week. Recommend manager intervention.',
    options: [
      { text: 'Schedule a sync to discuss', delta: { alignment: +3, productivity: -3 } },
      { text: 'Add to next OKR cycle', delta: { visibility: +2, alignment: -1 } },
      { text: 'Acknowledge', delta: {} },
    ],
  },
  {
    templateId: 'wellness-day',
    dmKey: 'people_bot',
    trigger: 'morning',
    body: 'Friendly reminder: book your "wellness day" before the end of the quarter 🌱',
    options: [
      { text: 'Booking now', delta: { morale: +4, visibility: -2 } },
      { text: 'Will do soon', delta: {} },
      { text: 'Skip', delta: { morale: -2 } },
    ],
  },
  {
    templateId: 'vp-slides',
    dmKey: 'vp_strategy',
    trigger: 'on-accept',
    body: 'Loved your update! Quick question — got slides for tomorrow?',
    options: [
      { text: 'Working on them now', delta: { visibility: +3, executiveConfidence: +3, productivity: -2, morale: -1 } },
      { text: 'Forwarding to my team to draft', delta: { productivity: +2, executiveConfidence: -3 } },
      { text: 'What slides?', delta: { executiveConfidence: -4, visibility: -2 } },
    ],
  },
  {
    templateId: 'sam-applause',
    dmKey: 'sam_t',
    trigger: 'on-accept',
    body: '👏👏 great call in the kickoff. You really kept things on track.',
    options: [
      { text: 'Thanks!', delta: { morale: +2 } },
      { text: '🙏', delta: { morale: +1 } },
      { text: 'You did the real work', delta: { morale: +3, alignment: +1 } },
    ],
  },
  {
    templateId: 'boss-got-a-sec',
    dmKey: 'boss',
    trigger: 'on-decline',
    body: 'Got a sec? Just want to check in on a few things.',
    options: [
      { text: 'Always', delta: { executiveConfidence: +4, productivity: -3 } },
      { text: '5 min?', delta: { executiveConfidence: +2 } },
      { text: "I'll call back after my next meeting", delta: { executiveConfidence: -3, alignment: -2 } },
    ],
  },
  {
    templateId: 'declined-stakeholder',
    dmKey: 'pat_l',
    trigger: 'on-decline',
    body: 'Just noticed you declined the sync — everything okay? Happy to find another time.',
    options: [
      { text: 'Send me 3 times that work', delta: { alignment: +2, productivity: -1 } },
      { text: 'Async update?', delta: { productivity: +2, alignment: -1 } },
      { text: 'No notes', delta: { morale: +1 } },
    ],
  },
  {
    templateId: 'ceo-linkedin',
    dmKey: 'ceo_linkedin',
    trigger: 'on-chaos',
    body: '"AI-native synergy is the future of B2B SaaS-as-a-Service. Bullish 🚀" — your CEO',
    options: [
      { text: 'Like', delta: { visibility: +2, morale: -1 } },
      { text: 'Repost with insightful comment', delta: { visibility: +5, executiveConfidence: +3, morale: -2 } },
      { text: 'Ignore', delta: {} },
    ],
  },
  {
    templateId: 'cfo-burn',
    dmKey: 'cfo',
    trigger: 'on-chaos',
    body: "Q3 burn looks 'interesting'. Got 5 to walk me through it?",
    options: [
      { text: 'Right now', delta: { executiveConfidence: +5, productivity: -3 } },
      { text: 'After my next meeting', delta: { alignment: +2 } },
      { text: "I'll send the numbers first", delta: { productivity: +3, executiveConfidence: -2 } },
    ],
  },
  {
    templateId: 'kpi-bot-report',
    dmKey: 'kpi_bot',
    trigger: 'random',
    body: 'Your weekly KPI report is ready. (Nobody will read it.)',
    options: [
      { text: 'Open', delta: { visibility: +1 } },
      { text: 'Dismiss', delta: {} },
    ],
  },
  {
    templateId: 'alex-offsite',
    dmKey: 'alex_p',
    trigger: 'random',
    body: 'Are we still on for the Friday offsite? Asking for the team.',
    options: [
      { text: "Yes, can't wait", delta: { morale: +2, productivity: -1 } },
      { text: 'Let me check', delta: {} },
      { text: 'Postponing — too much going on', delta: { morale: -3, productivity: +2 } },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

let _msgCounter = 0;
function mkId(prefix = 'msg'): string {
  _msgCounter += 1;
  return `${prefix}-${Date.now()}-${_msgCounter}`;
}

export function makeMessage(
  conversationId: string,
  sender: string,
  body: string,
  ts: number,
  reactions?: string[],
  outgoing?: boolean,
): ChatMessage {
  return {
    id: mkId(),
    conversationId,
    sender,
    body,
    ts,
    reactions,
    outgoing,
  };
}

/**
 * Materialize the seed conversations + their initial messages at game start.
 * Messages are returned as a map keyed by conversationId — matches the store shape.
 */
export function buildInitialChat(now: number): {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
} {
  const conversations: Conversation[] = SEED_GROUPS.map((g) => ({
    ...g,
    lastMessageAt: now - 60 * 60 * 1000,
  }));
  const messages: Record<string, ChatMessage[]> = {};
  for (const m of SEED_MESSAGES) {
    const msg: ChatMessage = {
      id: mkId(),
      conversationId: m.conversationId,
      sender: m.sender,
      body: m.body,
      ts: now - m.ageOffsetMin * 60 * 1000,
      reactions: m.reactions,
    };
    messages[m.conversationId] = [...(messages[m.conversationId] ?? []), msg];
  }
  for (const c of conversations) {
    const list = messages[c.id];
    if (list && list.length > 0) {
      c.lastMessageAt = Math.max(...list.map((m) => m.ts));
    }
  }
  return { conversations, messages };
}
