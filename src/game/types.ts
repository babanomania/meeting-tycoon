export type KpiKey =
  | 'productivity'
  | 'morale'
  | 'burnout'
  | 'alignment'
  | 'executiveConfidence'
  | 'visibility';

export type Kpis = Record<KpiKey, number>;

export type KpiDelta = Partial<Kpis>;

export type MeetingPriority = 'high' | 'medium' | 'low' | 'optional' | 'recurring' | 'crisis';

export type MeetingTypeId =
  | 'standup'
  | 'project-kickoff'
  | '1on1'
  | 'stakeholder-sync'
  | 'town-hall'
  | 'strategy-offsite'
  | 'budget-review'
  | 'all-hands'
  | 'pre-read-sync'
  | 'retro'
  | 'okr-checkin'
  | 'design-review'
  | 'eng-escalation'
  | 'culture-sync'
  | 'pr-cleanup'
  // ── Stage 2 mechanics ──
  | 'shield-meeting'   // defensive self-block, +Prod +Morale, no relationship impact
  | 'board-pre-read'   // CFO/Board high-pressure prep
  | 'quarterly-review' // QBR slide deck rush
  | 'reorg-meeting';   // forced reorg announcement attendance

export interface MeetingType {
  id: MeetingTypeId;
  title: string;
  durationMin: number;
  attendees: number;
  priority: MeetingPriority;
  emoji: string;
  impact: KpiDelta;
  /** Short bit of corporate humor displayed in details */
  flavor: string;
}

export interface ScheduledMeeting {
  uid: string;
  typeId: MeetingTypeId;
  startMinutes: number; // minutes from 9:00 AM (0 = 9:00, 60 = 10:00)
  /** True if this meeting auto-recurs each day until the player removes it. */
  recurring?: boolean;
  /** Original source description (e.g. "Engineering", "CEO") — kept for display in the detail sheet. */
  from?: string;
}

export interface MeetingRequest {
  uid: string;
  typeId: MeetingTypeId;
  from: string; // who requested it
  note: string;
  // ── Stage 3: Approval Chains ──
  /** If set, the player can only accept after `requiresApprovals` of these
   *  stakeholders have signed off. Drives the "Needs 3/5 approvals" chip. */
  approvers?: StakeholderId[];
  /** Number of approvals required to unlock the request. Default: 3. */
  requiresApprovals?: number;
}

export type StageId = 1 | 2 | 3 | 4 | 5;

export type FlowScreen =
  | 'landing'
  | 'onboarding'
  | 'calendar'
  | 'inbox'
  | 'chat'
  | 'day-summary'
  | 'home'
  | 'people'
  | 'game-over'
  | 'stage-unlock';

export interface ChaosEvent {
  id: string;
  emoji: string;
  title: string;
  fromWho: string;
  durationMin: number;
  attendees: string;
  flavor: string;
  /** Applied if Attend */
  attendImpact: KpiDelta;
  /** Applied if Delegate */
  delegateImpact: KpiDelta;
  /** Applied if Reschedule */
  rescheduleImpact: KpiDelta;
}

export type ChaosResponse = 'attend' | 'delegate' | 'reschedule' | 'pass-to-boss';

/**
 * Conversation = a thread (Teams-style). Three kinds:
 *  - 'group'   — channels like #engineering, read-only by player
 *  - 'dm'      — 1:1 with another character, supports player replies
 *  - 'meeting' — auto-created per meeting type, accumulates pre/post-meeting chatter
 */
export type ConversationKind = 'group' | 'dm' | 'meeting';

export interface Conversation {
  id: string;
  kind: ConversationKind;
  /** "#engineering" / "CEO" / "Daily Standup" */
  name: string;
  /** Subtitle under the title: role, member count, cadence */
  subtitle?: string;
  /** Names used to color avatars + show participant strip */
  participants: string[];
  /** Pinned channels surface at the top of the list. */
  pinned?: boolean;
  /** Renders this convo with a system/bot avatar (alert glyph instead of initials). */
  isSystem?: boolean;
  /** When set, the DM is awaiting a player reply with these options. */
  pendingReplyOptions?: ChatReply[];
  /** Latest arrival; drives sort order. */
  lastMessageAt: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  /** Who sent it. 'you' = player; matches Conversation.participants otherwise. */
  sender: string;
  ts: number;
  body: string;
  /** Player's outgoing message. */
  outgoing?: boolean;
  /** Optional emoji reactions stacked under the bubble. */
  reactions?: string[];
}

export interface ChatReply {
  text: string;
  delta: KpiDelta;
  /** Optional one-liner that lands in the activity log if the player picks this. */
  log?: string;
}

/**
 * Brief toast that floats over the screen for ~2.5s after the player takes an
 * action that changes their state. Gives the missing reward signal — "yes,
 * something happened, here's what."
 *
 * Fluent MessageBar style: white background, colored left accent, icon, title,
 * KPI chips, optional stakeholder change.
 */
export type ToastIntent = 'info' | 'success' | 'caution' | 'warning';

export interface FeedbackToast {
  id: string;
  /** Headline ("Scheduled · Town Hall"). */
  title?: string;
  /** Visual intent — drives accent color + icon tile color. */
  intent?: ToastIntent;
  /** Icon name shown in the leading tile. */
  icon?: 'calendar' | 'arrow-down' | 'alert' | 'send' | 'check' | 'reply' | 'sparkle';
  /** KPI deltas that just applied (productivity +5, morale -3 etc). */
  kpiDelta?: KpiDelta;
  /** Optional stakeholder relationship change ({name: 'David Chen', delta: +5}). */
  stakeholder?: { name: string; delta: number };
}

/**
 * Events that ripple through chat. Group channels react to these
 * with auto-generated messages; meeting chats accumulate post-meeting follow-ups.
 */
export type ChatEvent =
  | { type: 'meeting-accepted'; meetingTypeId: MeetingTypeId }
  | { type: 'meeting-declined'; meetingTypeId: MeetingTypeId }
  | { type: 'meeting-held'; meetingTypeId: MeetingTypeId }
  | { type: 'chaos-resolved'; chaosId: string; response: 'attend' | 'delegate' | 'reschedule' }
  | { type: 'day-end'; kpis: Kpis; meetingsHeld: number; unusedSlots: number }
  | { type: 'day-start'; day: number }
  // ── Stage 2 events ──
  | { type: 'shield-created' }       // player blocked their own calendar
  | { type: 'dashboard-sent' }       // player sent a dashboard report instead of attending
  // ── Stage 3 events ──
  | { type: 'approval-cleared'; meetingTypeId: MeetingTypeId }   // approval chain unlocked a request
  | { type: 'passed-to-boss'; chaosId: string }                  // player punted a chaos upward
  // ── Stage 4 events ──
  | { type: 'alliance-formed'; pair: [StakeholderId, StakeholderId] }
  | { type: 'feud-detected'; pair: [StakeholderId, StakeholderId] }
  | { type: 'pr-disaster-fired' }
  | { type: 'board-sync-passed'; goalsMet: number; goalsTotal: number }
  | { type: 'board-sync-failed'; goalsMet: number; goalsTotal: number };

export type ActivityKind =
  | 'meeting-scheduled'
  | 'meeting-removed'
  | 'meeting-declined'
  | 'chaos-attended'
  | 'chaos-delegated'
  | 'chaos-rescheduled'
  | 'ping-replied';

export interface ActivityEntry {
  id: string;
  ts: number; // unix ms
  kind: ActivityKind;
  title: string;
  detail?: string;
  /** Optional avatar source — when present, render avatar instead of an icon. */
  from?: string;
}

export interface QuarterlyGoal {
  id: string;
  label: string;
  emoji: string;
  /** Either a KPI key OR a stakeholder id — exactly one is set. */
  kpi?: KpiKey;
  stakeholderId?: StakeholderId;
  /** Target value to hit. */
  target: number;
  /** If true, a lower value is better (i.e. burnout). */
  lowerIsBetter?: boolean;
}

/**
 * Politics layer — each key stakeholder has a relationship score 0-100
 * that shifts based on the player's actions toward them. The whole game
 * could be summed up as "keep these people happy, especially the boss."
 */
export type StakeholderId =
  | 'boss'
  | 'ceo'
  | 'cfo'
  | 'cto'
  | 'chro'
  | 'vp_strategy';

export interface Stakeholder {
  id: StakeholderId;
  /** Display name in the map ("CEO", "Your Boss") */
  name: string;
  /** Role / title shown under the name */
  role: string;
  /** Relationship score 0-100. 50 = neutral. */
  relationship: number;
  /** Last reason this score moved — drives the "why" line on the people screen. */
  lastNote?: string;
  /** Direction of last change, drives the small trend indicator. */
  trend?: 'up' | 'down' | 'stable';
}

export type Sentiment = 'hostile' | 'cool' | 'neutral' | 'friendly' | 'champion';

export type GameOverReason =
  | 'team-walkout'
  | 'fired-low-confidence'
  | 'burnout-sabbatical'
  | 'restructured'
  | 'process-paralysis'
  | 'board-confidence-lost'
  | 'pr-disaster-reassigned';

export interface GameOver {
  reason: GameOverReason;
  emoji: string;
  title: string;
  body: string;
}

export interface BossFeedback {
  emoji: string;
  text: string;
}

export interface DayResult {
  meetingsHeld: number;
  peopleMet: number;
  decisionsMade: number;
  timeInMeetingsHrs: number;
  actualWorkHrs: number;
  /** Net KPI change for the day (meetings + chaos + rest recovery). */
  kpiDelta: KpiDelta;
  /**
   * The passive recovery slice of kpiDelta — earned by NOT booking meetings.
   * Surfaced separately on Day Summary so the player sees the reward
   * for restraint. Positive productivity/morale, negative burnout.
   */
  restDelta: KpiDelta;
  /** How many accept slots the player left unused (drives restDelta). */
  unusedSlots: number;
  boss: BossFeedback;
}
