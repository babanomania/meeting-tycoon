import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActivityEntry,
  ChaosResponse,
  ChatEvent,
  ChatMessage,
  Conversation,
  DayResult,
  FeedbackToast,
  FlowScreen,
  GameOver,
  Kpis,
  KpiDelta,
  MeetingRequest,
  MeetingTypeId,
  ScheduledMeeting,
  Stakeholder,
  StakeholderId,
} from './types';
import {
  STAKEHOLDERS_SEED,
  adjustRelationship,
  detectAlliances,
  senderToStakeholder,
  type Alliance,
} from './politics';
import { characterDisplayName } from './characters';
import {
  CHAOS_EVENTS,
  MEETING_TYPES,
  STAGE1_GOALS,
  STAGE4_GOALS,
  STAGE5_GOALS,
  capFor,
  politicsMultiplier,
  requestsForDay,
  stageGoalsFor,
} from './data';
import {
  DM_PROFILES,
  DM_TEMPLATES,
  EVENT_REACTIONS,
  MEETING_CHAT_META,
  MEETING_HELD_TEMPLATES,
  buildInitialChat,
  makeMessage,
  type DmTemplate,
} from './chat';
import type { BossFeedback } from './types';

const STARTING_KPIS: Kpis = {
  productivity: 50,
  morale: 68,
  burnout: 22,
  alignment: 45,
  executiveConfidence: 40,
  visibility: 30,
};

const STAGE1_LAST_DAY = 5;
const STAGE2_LAST_DAY = 10;
const STAGE3_LAST_DAY = 15;
const STAGE4_LAST_DAY = 20;
const STAGE5_LAST_DAY = 25;

/**
 * Stage 4: each active alliance pumps one themed KPI by this much at day-end.
 * Feuds drain alignment by the same amount.
 */
const ALLIANCE_KPI_BONUS = 3;

/**
 * Stage 4: which KPI each alliance pair boosts when active. Hand-picked so
 * the bonus feels narratively earned (boss + CEO = top-cover → visibility).
 */
const ALLIANCE_KPI_OWNER: Record<string, keyof Kpis> = {
  'boss|ceo':         'visibility',
  'ceo|vp_strategy':  'executiveConfidence',
  'cfo|ceo':          'alignment',
  'cto|chro':         'morale',
  'vp_strategy|chro': 'alignment',
};

function allianceKey(a: Alliance): string {
  // Match the keys in ALLIANCE_KPI_OWNER — order matches politics.ALLIANCE_PAIRS.
  return `${a.pair[0]}|${a.pair[1]}`;
}
/**
 * Legacy constant — still exported for older callers that hard-coded "5".
 * New code should call `capFor(stage)` instead. The Stage 2 transition
 * drops the cap to 4 and that change must be observed everywhere the UI
 * shows "accepts left", or the player will misread the calendar load.
 */
const DAILY_ACCEPT_CAP = 5;

/**
 * Default number of approvers required when a request has an `approvers`
 * list but no explicit `requiresApprovals`. Plan says 3 of 5.
 */
const DEFAULT_REQUIRED_APPROVALS = 3;

/** True if this request can be accepted right now (no chain, or chain met). */
export function isRequestApproved(
  req: MeetingRequest,
  approvals: StakeholderId[] | undefined,
): boolean {
  if (!req.approvers || req.approvers.length === 0) return true;
  const need = req.requiresApprovals ?? DEFAULT_REQUIRED_APPROVALS;
  return (approvals?.length ?? 0) >= need;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

const applyDelta = (k: Kpis, d: KpiDelta): Kpis => ({
  productivity: clamp(k.productivity + (d.productivity ?? 0)),
  morale: clamp(k.morale + (d.morale ?? 0)),
  burnout: clamp(k.burnout + (d.burnout ?? 0)),
  alignment: clamp(k.alignment + (d.alignment ?? 0)),
  executiveConfidence: clamp(k.executiveConfidence + (d.executiveConfidence ?? 0)),
  visibility: clamp(k.visibility + (d.visibility ?? 0)),
});

const sumDeltas = (a: KpiDelta, b: KpiDelta): KpiDelta => {
  const out: KpiDelta = { ...a };
  for (const k of Object.keys(b) as (keyof KpiDelta)[]) {
    out[k] = (out[k] ?? 0) + (b[k] ?? 0);
  }
  return out;
};

/**
 * Probability a given stakeholder signs off on an approval-gated request
 * this tick. Weighted by current relationship so good relationships speed
 * up your approval chains — the Stage 3 satire made literal.
 */
function approvalChance(rel: number): number {
  if (rel >= 70) return 0.55;
  if (rel >= 50) return 0.35;
  if (rel >= 30) return 0.20;
  return 0.10;
}

/**
 * For every approval-gated pending request, roll the dice for each remaining
 * approver. Returns a new requestApprovals map with whatever signed off.
 * Pure helper — no side effects.
 */
function tickApprovalsOnce(
  pending: MeetingRequest[],
  current: Record<string, StakeholderId[]>,
  stakeholders: Stakeholder[],
): Record<string, StakeholderId[]> {
  const next = { ...current };
  for (const req of pending) {
    if (!req.approvers || req.approvers.length === 0) continue;
    const need = req.requiresApprovals ?? DEFAULT_REQUIRED_APPROVALS;
    const so_far = next[req.uid] ?? [];
    if (so_far.length >= need) continue;
    const remaining = req.approvers.filter((a) => !so_far.includes(a));
    const newApprovers: StakeholderId[] = [];
    for (const a of remaining) {
      const rel = stakeholders.find((s) => s.id === a)?.relationship ?? 50;
      if (Math.random() < approvalChance(rel)) newApprovers.push(a);
      if (so_far.length + newApprovers.length >= need) break;
    }
    if (newApprovers.length > 0) next[req.uid] = [...so_far, ...newApprovers];
  }
  return next;
}

const checkGameOver = (
  k: Kpis,
  stakeholders: Stakeholder[],
  stage: 1 | 2 | 3 | 4 | 5,
  /** Extra Stage 4 signals — passed from endDay so the check knows about
   *  cumulative PR disasters and the Board Sync outcome. */
  prDisasterStrikes: number = 0,
  boardSyncFailed: boolean = false,
  pipFailed: boolean = false,
): GameOver | null => {
  // ── Stage 5 PIP — lose the Promotion, get the "growth opportunity" letter.
  if (pipFailed) {
    return {
      reason: 'performance-improvement-plan',
      emoji: '📄',
      title: 'Performance Improvement Plan',
      body: '"We see real potential in your trajectory." HR has prepared a 90-day plan. Daily check-ins. Weekly skip-levels. Three of the four bullet points are about "communication".',
    };
  }
  // ── Stage 4 thematic endings, checked first so they outrank generic ones.
  if (boardSyncFailed) {
    return {
      reason: 'board-confidence-lost',
      emoji: '🏛️',
      title: 'Board Confidence Lost',
      body: 'The Board reviewed the quarter and concluded that "a change in operating leadership would unlock new energy". You unlocked it. You are no longer in the unlock business.',
    };
  }
  if (stage >= 4 && prDisasterStrikes >= 2) {
    return {
      reason: 'pr-disaster-reassigned',
      emoji: '🤳',
      title: 'Reassigned to Special Projects',
      body: 'Two PR disasters in one stage was, in retrospect, two too many. Your title remains. Your scope does not. Your new charter: "exploratory white-space initiatives." There is no white space.',
    };
  }
  if (k.morale <= 10) {
    return {
      reason: 'team-walkout',
      emoji: '🚪',
      title: 'Team Walkout',
      body: 'Your team formed a Slack channel called #escape. Then they used it. HR will be in touch.',
    };
  }
  if (k.executiveConfidence <= 15) {
    return {
      reason: 'fired-low-confidence',
      emoji: '📦',
      title: 'Reassigned',
      body: 'Leadership has decided your "strengths are better suited" to your old role. A LinkedIn announcement is forthcoming.',
    };
  }
  if (k.burnout >= 92) {
    return {
      reason: 'burnout-sabbatical',
      emoji: '🫠',
      title: 'Forced Sabbatical',
      body: 'You scheduled a meeting with yourself, attended it, and did not come back. People Ops calls this "wellness".',
    };
  }
  // ── Stage 3+ bureaucratic failure: every stakeholder cool to you means
  //    nothing gets approved, ever. Process Paralysis.
  if (stage >= 3) {
    const allSoured = stakeholders.length > 0 && stakeholders.every((s) => s.relationship <= 50);
    if (allSoured) {
      return {
        reason: 'process-paralysis',
        emoji: '🧊',
        title: 'Process Paralysis',
        body: 'Every initiative has been parked in a "review committee". Every decision is "pending sign-off". You discover you have been technically PTO for three weeks. Nobody noticed.',
      };
    }
  }
  // ── Stage 2+ political failure: if too many stakeholders sour on you,
  //    you don't get fired — you get *restructured*. The plan calls this
  //    "the most corporate way to lose."
  if (stage >= 2) {
    const soured = stakeholders.filter((s) => s.relationship <= 50).length;
    if (soured >= 4) {
      return {
        reason: 'restructured',
        emoji: '🌀',
        title: "You've Been 'Restructured'",
        body: 'Leadership felt the org would benefit from "a fresh perspective in your role". You retain the title and lose every responsibility. HR called it "an exciting lateral move".',
      };
    }
  }
  return null;
};

interface GameState {
  screen: FlowScreen;
  stage: 1 | 2 | 3 | 4 | 5;
  day: number;
  kpis: Kpis;
  history: Kpis[];
  schedule: ScheduledMeeting[];
  acceptedRequestIds: string[];
  lastResult: DayResult | null;

  activeChaos: { id: string; uid: string } | null;
  triggeredChaosIds: string[];
  chaosDelta: KpiDelta;

  activityToday: ActivityEntry[];

  gameOver: GameOver | null;
  stageUnlocked: 2 | 3 | 4 | 5 | null;

  detailUid: string | null;

  // ── Stage 2 daily actions ──
  /** Player sent the dashboard report today (Stage 2+). Resets at day start. */
  dashboardSentToday: boolean;
  /** How many shield-meetings the player blocked today (Stage 2+). Resets at day start. */
  shieldMeetingsToday: number;
  /** Whether the Reorg Whispers chaos has been forced once during Stage 2 yet. */
  reorgForcedThisStage: boolean;

  // ── Stage 3 mechanics ──
  /** Per-request approval ledger. Keyed by request uid → list of stakeholders
   *  who have signed off so far. Cleared on stage transitions. */
  requestApprovals: Record<string, StakeholderId[]>;
  /** Approval-gated requests carried over from previous days. Sit in the
   *  inbox until accepted or declined. */
  carryoverRequests: MeetingRequest[];
  /** How many approval chains the player has cleared this stage. Counts toward
   *  the "Survive 3 Approval Chains" Stage 3 goal. */
  approvalChainsCleared: number;
  /** How many chaos events the player has punted to the boss this stage. */
  chaosPassedToBoss: number;

  // ── Stage 4 mechanics ──
  /** How many PR Disasters have auto-fired this stage. 2 = game-over. */
  prDisasterStrikes: number;
  /** Result of the Day 20 Board Sync, set at end of Day 20. */
  boardSyncResult: { passed: boolean; goalsMet: number; goalsTotal: number } | null;

  // ── Stage 5 mechanics ──
  /** Player spent Visibility today to fake ExecConf. Resets at day start. */
  illusionSpentToday: boolean;
  /** ExecConf debt queued for tomorrow's day-end after an illusion spend. */
  illusionDebt: number;
  /** Result of the Day 25 Promotion evaluation, set at end of Day 25. */
  promotionResult: { goalsMet: number; goalsTotal: number; outcome: 'promoted' | 'lateral' | 'pip' } | null;

  // ── Chat ───────────────────────────────────────────────────────────────
  conversations: Conversation[];
  /** Messages map: conversationId → array of messages (chronological). */
  messages: Record<string, ChatMessage[]>;
  /** When a conversation is open in the thread view; null = list view. */
  openConversationId: string | null;
  /** Which DM templates have fired this run — prevents repeats. */
  dmTemplateHistoryIds: string[];
  /** Which conversations the player has opened since last new message. */
  readConversationIds: string[];

  /** Politics — relationship scores per key stakeholder. */
  stakeholders: Stakeholder[];

  /** Floating feedback toast — shown briefly after player actions. */
  toast: FeedbackToast | null;
  /** App-wide hamburger drawer state (opened from any screen header). */
  settingsOpen: boolean;

  setScreen: (s: FlowScreen) => void;
  pushToast: (t: Omit<FeedbackToast, 'id'>) => void;
  dismissToast: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  removeScheduled: (uid: string) => void;
  openDetail: (uid: string) => void;
  closeDetail: () => void;
  maybeTriggerChaos: () => void;
  resolveChaos: (response: ChaosResponse) => void;
  /** Stage 2+: block a focus hour. Costs an accept slot, no relationship hit. */
  scheduleShieldMeeting: () => void;
  /** Stage 2+: send a dashboard report instead of attending. Once per day. */
  sendDashboardReport: () => void;
  /** Stage 5+: spend Visibility to fake ExecConf. Once per day. Crashes back tomorrow. */
  cookTheBooks: () => void;
  openConversation: (id: string) => void;
  closeConversation: () => void;
  replyInConversation: (id: string, replyIdx: number) => void;
  endDay: () => DayResult;
  continueToNextDay: () => void;
  clearStageUnlock: () => void;
  resetGame: () => void;
  /** Seeds the first day's chat at the end of onboarding. */
  startGame: () => void;
}

const findFreeSlot = (schedule: ScheduledMeeting[], durationMin: number): number => {
  const DAY_START = 0;
  const DAY_END = 540;
  const sorted = [...schedule].sort((a, b) => a.startMinutes - b.startMinutes);
  let cursor = DAY_START;
  for (const m of sorted) {
    const t = MEETING_TYPES[m.typeId];
    if (m.startMinutes - cursor >= durationMin) return cursor;
    cursor = Math.max(cursor, m.startMinutes + t.durationMin);
  }
  if (DAY_END - cursor >= durationMin) return cursor;
  return -1;
};

const logActivity = (
  list: ActivityEntry[],
  entry: Omit<ActivityEntry, 'id' | 'ts'>,
): ActivityEntry[] => [
  { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ts: Date.now() },
  ...list,
];

const countAcceptsToday = (acceptedIds: string[]): number =>
  acceptedIds.filter((id) => !id.startsWith('decline:') && !id.startsWith('chaos-')).length;

export function projectKpis(current: Kpis, delta: KpiDelta): Kpis {
  return applyDelta(current, delta);
}

export function pendingRequestsFor(
  day: number,
  acceptedIds: string[],
  schedule: ScheduledMeeting[],
  carryoverRequests: MeetingRequest[] = [],
) {
  const recurringTypeIds = new Set(schedule.filter((m) => m.recurring).map((m) => m.typeId));
  const todays = requestsForDay(day);
  // Merge: carryovers first (they've been waiting longer), then today's pool,
  // de-dup by uid in case a carryover and today's pool both somehow contain it.
  const seen = new Set<string>();
  const merged: MeetingRequest[] = [];
  for (const list of [carryoverRequests, todays]) {
    for (const r of list) {
      if (seen.has(r.uid)) continue;
      seen.add(r.uid);
      merged.push(r);
    }
  }
  return merged.filter((r) => {
    if (acceptedIds.includes(r.uid)) return false;
    if (acceptedIds.includes(`decline:${r.uid}`)) return false;
    const t = MEETING_TYPES[r.typeId];
    if (t.priority === 'recurring' && recurringTypeIds.has(r.typeId)) return false;
    return true;
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Chat helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Pure helper: given current state and an incoming chat event, return the
 * new (conversations, messages) maps with any reactions appended.
 */
function applyChatEvent(
  conversations: Conversation[],
  messages: Record<string, ChatMessage[]>,
  event: ChatEvent,
): { conversations: Conversation[]; messages: Record<string, ChatMessage[]> } {
  const now = Date.now();
  let nextConvos = conversations;
  let nextMessages = messages;

  // Run all matching reactions for this event.
  for (const rule of EVENT_REACTIONS) {
    if (!rule.match(event)) continue;
    for (const r of rule.reactions) {
      // Find / ensure the conversation exists. (Group channels are seeded;
      // meeting chats are created lazily elsewhere.)
      if (!nextConvos.some((c) => c.id === r.conversationId)) continue;
      const msg = makeMessage(r.conversationId, r.sender, r.body(event), now, r.reactions);
      nextMessages = {
        ...nextMessages,
        [r.conversationId]: [...(nextMessages[r.conversationId] ?? []), msg],
      };
      nextConvos = nextConvos.map((c) =>
        c.id === r.conversationId ? { ...c, lastMessageAt: now } : c,
      );
    }
  }

  return { conversations: nextConvos, messages: nextMessages };
}

/** Pick a DM template of the given trigger that hasn't fired this run. */
function pickDmTemplate(
  trigger: DmTemplate['trigger'],
  history: string[],
): DmTemplate | null {
  const pool = DM_TEMPLATES.filter((t) => t.trigger === trigger && !history.includes(t.templateId));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Materialize a DM conversation + its incoming message + reply options. */
function instantiateDm(
  template: DmTemplate,
  now: number,
  conversations: Conversation[],
  messages: Record<string, ChatMessage[]>,
): {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
} {
  const profile = DM_PROFILES[template.dmKey];
  if (!profile) return { conversations, messages };

  const existing = conversations.find((c) => c.id === profile.id);
  const baseConvo: Conversation = existing ?? {
    id: profile.id,
    kind: 'dm',
    name: profile.name,
    subtitle: profile.role,
    participants: [profile.name],
    isSystem: profile.isSystem,
    lastMessageAt: now,
  };
  const newConvo: Conversation = {
    ...baseConvo,
    pendingReplyOptions: template.options,
    lastMessageAt: now,
  };

  const msg = makeMessage(profile.id, profile.name, template.body, now);
  return {
    conversations: existing
      ? conversations.map((c) => (c.id === profile.id ? newConvo : c))
      : [...conversations, newConvo],
    messages: {
      ...messages,
      [profile.id]: [...(messages[profile.id] ?? []), msg],
    },
  };
}

/** Add or update a meeting chat conversation when a meeting is scheduled. */
function ensureMeetingChat(
  meetingTypeId: MeetingTypeId,
  conversations: Conversation[],
  messages: Record<string, ChatMessage[]>,
  now: number,
): {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
} {
  const id = `meeting-${meetingTypeId}`;
  if (conversations.some((c) => c.id === id)) return { conversations, messages };
  const meta = MEETING_CHAT_META[meetingTypeId];
  const type = MEETING_TYPES[meetingTypeId];
  const newConvo: Conversation = {
    id,
    kind: 'meeting',
    name: type.title,
    subtitle: `${meta.participants.length} participants · ${type.durationMin}m`,
    participants: meta.participants,
    lastMessageAt: now,
  };
  const seedMsg = makeMessage(id, 'KPI Bot', `Chat created for "${type.title}".`, now - 1000);
  return {
    conversations: [...conversations, newConvo],
    messages: { ...messages, [id]: [seedMsg] },
  };
}

/** Generate post-meeting follow-up messages for each meeting that "happened" today. */
function fireMeetingHeldMessages(
  schedule: ScheduledMeeting[],
  conversations: Conversation[],
  messages: Record<string, ChatMessage[]>,
  now: number,
): {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
} {
  let convos = conversations;
  let msgs = messages;
  const typesHeld = new Set<MeetingTypeId>();
  for (const m of schedule) {
    if (m.uid.startsWith('chaos-')) continue;
    typesHeld.add(m.typeId);
  }
  for (const typeId of typesHeld) {
    const templates = MEETING_HELD_TEMPLATES[typeId];
    if (!templates) continue;
    const id = `meeting-${typeId}`;
    // Make sure the meeting chat exists
    const ensured = ensureMeetingChat(typeId, convos, msgs, now);
    convos = ensured.conversations;
    msgs = ensured.messages;
    // Append 1-2 follow-up messages
    for (const t of templates.slice(0, 2)) {
      const msg = makeMessage(id, t.sender, t.body, now, t.reactions);
      msgs = { ...msgs, [id]: [...(msgs[id] ?? []), msg] };
    }
    convos = convos.map((c) => (c.id === id ? { ...c, lastMessageAt: now } : c));
  }
  return { conversations: convos, messages: msgs };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'landing',
      stage: 1,
      day: 1,
      kpis: STARTING_KPIS,
      history: [],
      schedule: [],
      acceptedRequestIds: [],
      lastResult: null,
      activeChaos: null,
      triggeredChaosIds: [],
      chaosDelta: {},
      activityToday: [],
      gameOver: null,
      stageUnlocked: null,
      detailUid: null,
      dashboardSentToday: false,
      shieldMeetingsToday: 0,
      reorgForcedThisStage: false,
      requestApprovals: {},
      carryoverRequests: [],
      approvalChainsCleared: 0,
      chaosPassedToBoss: 0,
      prDisasterStrikes: 0,
      boardSyncResult: null,
      illusionSpentToday: false,
      illusionDebt: 0,
      promotionResult: null,
      conversations: [],
      messages: {},
      openConversationId: null,
      dmTemplateHistoryIds: [],
      readConversationIds: [],
      stakeholders: STAKEHOLDERS_SEED,
      toast: null,
      settingsOpen: false,

      setScreen: (s) => set({ screen: s }),
      pushToast: (t) =>
        set({
          toast: {
            ...t,
            id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          },
        }),
      dismissToast: () => set({ toast: null }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),

      acceptRequest: (requestId) => {
        const s0 = get();
        // Look up the request in either the day's pool OR the Stage 3 carryover queue.
        const req =
          requestsForDay(s0.day).find((r) => r.uid === requestId) ??
          s0.carryoverRequests.find((r) => r.uid === requestId);
        if (!req) return;
        if (s0.acceptedRequestIds.includes(requestId)) return;

        // Stage 3 approval gate — block until the chain clears.
        const approvals = s0.requestApprovals[requestId];
        if (!isRequestApproved(req, approvals)) return;
        const wasApprovalGated = !!req.approvers && req.approvers.length > 0;

        const beforeCount = countAcceptsToday(s0.acceptedRequestIds);
        if (beforeCount >= capFor(s0.stage)) return;

        const type = MEETING_TYPES[req.typeId];
        const start = findFreeSlot(s0.schedule, type.durationMin);
        if (start < 0) return;
        const isRecurring = type.priority === 'recurring';

        // Materialize meeting chat for this type if not already there.
        const now = Date.now();
        const { conversations: convos1, messages: msgs1 } = ensureMeetingChat(
          req.typeId as MeetingTypeId,
          s0.conversations,
          s0.messages,
          now,
        );

        // Fire any group-channel reactions.
        const evt: ChatEvent = { type: 'meeting-accepted', meetingTypeId: req.typeId as MeetingTypeId };
        let convos2 = convos1;
        let msgs2 = msgs1;
        ({ conversations: convos2, messages: msgs2 } = applyChatEvent(convos1, msgs1, evt));
        // If this cleared an approval chain, fire that event too.
        if (wasApprovalGated) {
          ({ conversations: convos2, messages: msgs2 } = applyChatEvent(
            convos2, msgs2,
            { type: 'approval-cleared', meetingTypeId: req.typeId as MeetingTypeId },
          ));
        }

        // Politics: accepting from a stakeholder is a small relationship boost,
        // scaled by Stage 3+ politics multiplier.
        const mul = politicsMultiplier(s0.stage);
        const relDelta = Math.round(5 * mul);
        const stakeholderId = senderToStakeholder(req.from);
        const nextStakeholders = stakeholderId
          ? adjustRelationship(s0.stakeholders, stakeholderId, relDelta, `Accepted ${type.title}`)
          : s0.stakeholders;
        const stakeholderForToast = stakeholderId
          ? nextStakeholders.find((x) => x.id === stakeholderId)
          : undefined;

        // Drop the request from carryover if it lived there.
        const nextCarryover = s0.carryoverRequests.filter((r) => r.uid !== requestId);

        set((s) => ({
          schedule: [
            ...s.schedule,
            {
              uid: requestId,
              typeId: req.typeId as MeetingTypeId,
              startMinutes: start,
              recurring: isRecurring,
              from: req.from,
            },
          ],
          acceptedRequestIds: [...s.acceptedRequestIds, requestId],
          carryoverRequests: nextCarryover,
          approvalChainsCleared: wasApprovalGated ? s.approvalChainsCleared + 1 : s.approvalChainsCleared,
          activityToday: logActivity(s.activityToday, {
            kind: 'meeting-scheduled',
            title: wasApprovalGated ? `Approved & scheduled ${type.title}` : `Scheduled ${type.title}`,
            detail: isRecurring
              ? `${req.from} · ${type.durationMin}m · repeats daily`
              : `${req.from} · ${type.durationMin}m`,
            from: req.from,
          }),
          conversations: convos2,
          messages: msgs2,
          stakeholders: nextStakeholders,
          toast: {
            id: `toast-${Date.now()}-acc`,
            title: wasApprovalGated
              ? `Chain cleared · ${type.title}`
              : `Scheduled · ${type.title}`,
            intent: wasApprovalGated ? 'success' : 'info',
            icon: 'calendar',
            kpiDelta: type.impact,
            stakeholder: stakeholderForToast
              ? { name: characterDisplayName(stakeholderForToast.name), delta: relDelta }
              : undefined,
          },
        }));

        // Stage 3: tick approval chains forward on every action.
        const s1 = get();
        if (s1.stage >= 3) {
          const stillPending = pendingRequestsFor(s1.day, s1.acceptedRequestIds, s1.schedule, s1.carryoverRequests);
          const nextApprovals = tickApprovalsOnce(stillPending, s1.requestApprovals, s1.stakeholders);
          set({ requestApprovals: nextApprovals });
        }

        // Stage 5: every real accept spawns a 30-min Follow-up Committee on
        // the calendar (if there's room). Skip when the accept itself was a
        // committee, shield, or chaos artifact, so we don't recurse.
        if (s1.stage >= 5 && !req.typeId.startsWith('committee') && req.typeId !== 'shield-meeting' && req.typeId !== 'legacy-meeting') {
          const committeeType = MEETING_TYPES['committee'];
          const committeeStart = findFreeSlot(s1.schedule, committeeType.durationMin);
          if (committeeStart >= 0) {
            const cuid = `committee-${Date.now()}-${req.uid}`;
            set({
              schedule: [
                ...s1.schedule,
                {
                  uid: cuid,
                  typeId: 'committee' as MeetingTypeId,
                  startMinutes: committeeStart,
                  from: 'Auto-spawned',
                  committee: true,
                },
              ],
              activityToday: logActivity(s1.activityToday, {
                kind: 'meeting-scheduled',
                title: `Follow-up committee chartered`,
                detail: `Spawned by ${type.title}. ${committeeType.durationMin}m.`,
                from: 'Acme',
              }),
            });
            // Notify #general — the committee is the joke.
            const s2 = get();
            const { conversations: c3, messages: m3 } = applyChatEvent(
              s2.conversations, s2.messages,
              { type: 'committee-spawned', parentTypeId: req.typeId as MeetingTypeId },
            );
            set({ conversations: c3, messages: m3 });
          }
        }

        const afterCount = beforeCount + 1;
        if ((afterCount === 2 || afterCount === 4) && !get().activeChaos) {
          setTimeout(() => {
            if (get().activeChaos) return;
            const available = CHAOS_EVENTS.filter((e) => !get().triggeredChaosIds.includes(e.id));
            if (available.length === 0) return;
            if (Math.random() > 0.6) return;
            const picked = available[Math.floor(Math.random() * available.length)];
            set({ activeChaos: { id: picked.id, uid: `chaos-${Date.now()}` } });
          }, 350);
        }

        // ~50% chance an on-accept DM lands right after.
        if (Math.random() < 0.5) {
          const tpl = pickDmTemplate('on-accept', get().dmTemplateHistoryIds);
          if (tpl) {
            const { conversations: c3, messages: m3 } = instantiateDm(
              tpl,
              Date.now(),
              get().conversations,
              get().messages,
            );
            set({
              conversations: c3,
              messages: m3,
              dmTemplateHistoryIds: [...get().dmTemplateHistoryIds, tpl.templateId],
            });
          }
        }
      },

      declineRequest: (requestId) => {
        const s0 = get();
        const req =
          requestsForDay(s0.day).find((r) => r.uid === requestId) ??
          s0.carryoverRequests.find((r) => r.uid === requestId);
        if (!req) return;
        if (s0.acceptedRequestIds.includes(`decline:${requestId}`)) return;

        const t = MEETING_TYPES[req.typeId];
        let cost: KpiDelta = {};
        let detail = `${req.from} did not take it well.`;
        if (t.priority === 'crisis') {
          cost = { executiveConfidence: -8, visibility: -3, alignment: -2 };
          detail = `${req.from} is escalating. Lawyers may have been mentioned.`;
        } else if (t.priority === 'high') {
          cost = { executiveConfidence: -4, alignment: -2 };
          detail = `${req.from} added you to a "feedback loop" (you didn't ask).`;
        } else if (t.priority === 'recurring') {
          cost = { alignment: -3, morale: -1 };
          detail = `Skipping the recurring sends a message. Not a good one.`;
        } else if (t.priority === 'medium') {
          cost = { alignment: -1 };
        } else {
          cost = {};
          detail = `${req.from} understood. (Probably.)`;
        }

        // Group channel reactions.
        const { conversations: convos2, messages: msgs2 } = applyChatEvent(
          s0.conversations,
          s0.messages,
          { type: 'meeting-declined', meetingTypeId: req.typeId as MeetingTypeId },
        );

        // Politics: declining a stakeholder hits the relationship — scaled by priority.
        const stakeholderId = senderToStakeholder(req.from);
        let declineDelta =
          t.priority === 'crisis' ? -14 :
          t.priority === 'high'   ? -10 :
          t.priority === 'recurring' ? -6 :
          t.priority === 'medium' ? -4 :
          -1;
        // Stage 2+ "Recurring Cost Inflation": declining a recurring meeting is
        // stickier — your absence broadcasts further when the team's already
        // under pressure. ×1.5 turns the −6 into −9 (rounded).
        if (s0.stage >= 2 && t.priority === 'recurring') {
          declineDelta = Math.round(declineDelta * 1.5);
        }
        // Stage 3 politics doubles every relationship change ×1.5.
        const mul = politicsMultiplier(s0.stage);
        if (mul !== 1) declineDelta = Math.round(declineDelta * mul);

        const nextStakeholders = stakeholderId
          ? adjustRelationship(s0.stakeholders, stakeholderId, declineDelta, `Declined ${t.title}`)
          : s0.stakeholders;
        const stakeholderForToast = stakeholderId
          ? nextStakeholders.find((x) => x.id === stakeholderId)
          : undefined;

        // Declining clears it from the carryover queue (and from approval
        // ledger — gone is gone).
        const nextCarryover = s0.carryoverRequests.filter((r) => r.uid !== requestId);
        const nextApprovals = { ...s0.requestApprovals };
        delete nextApprovals[requestId];

        set((s) => ({
          acceptedRequestIds: [...s.acceptedRequestIds, `decline:${requestId}`],
          kpis: applyDelta(s.kpis, cost),
          carryoverRequests: nextCarryover,
          requestApprovals: nextApprovals,
          activityToday: logActivity(s.activityToday, {
            kind: 'meeting-declined',
            title: `Declined ${t.title}`,
            detail,
            from: req.from,
          }),
          conversations: convos2,
          messages: msgs2,
          stakeholders: nextStakeholders,
          toast: {
            id: `toast-${Date.now()}-dec`,
            title: `Declined · ${t.title}`,
            intent: 'caution',
            icon: 'arrow-down',
            kpiDelta: cost,
            stakeholder: stakeholderForToast
              ? { name: characterDisplayName(stakeholderForToast.name), delta: declineDelta }
              : undefined,
          },
        }));

        // Stage 3: tick approvals after every action.
        const s1 = get();
        if (s1.stage >= 3) {
          const stillPending = pendingRequestsFor(s1.day, s1.acceptedRequestIds, s1.schedule, s1.carryoverRequests);
          const ticked = tickApprovalsOnce(stillPending, s1.requestApprovals, s1.stakeholders);
          set({ requestApprovals: ticked });
        }

        // High/crisis declines often trigger a DM follow-up.
        if ((t.priority === 'high' || t.priority === 'crisis') && Math.random() < 0.7) {
          const tpl = pickDmTemplate('on-decline', get().dmTemplateHistoryIds);
          if (tpl) {
            const { conversations: c3, messages: m3 } = instantiateDm(
              tpl,
              Date.now(),
              get().conversations,
              get().messages,
            );
            set({
              conversations: c3,
              messages: m3,
              dmTemplateHistoryIds: [...get().dmTemplateHistoryIds, tpl.templateId],
            });
          }
        }
      },

      removeScheduled: (uid) => {
        const removed = get().schedule.find((m) => m.uid === uid);
        // Stage 5 legacy meetings cannot be removed. The joke is in the name.
        if (removed?.legacy) return;
        set((s) => ({
          schedule: s.schedule.filter((m) => m.uid !== uid),
          acceptedRequestIds: s.acceptedRequestIds.filter(
            (id) => id !== uid && id !== `recurring:${uid}`,
          ),
          detailUid: s.detailUid === uid ? null : s.detailUid,
          activityToday: removed
            ? logActivity(s.activityToday, {
                kind: 'meeting-removed',
                title: `Removed ${MEETING_TYPES[removed.typeId].title}`,
              })
            : s.activityToday,
        }));
      },

      openDetail: (uid) => set({ detailUid: uid }),
      closeDetail: () => set({ detailUid: null }),

      maybeTriggerChaos: () => {
        const s = get();
        if (s.activeChaos) return;
        if (countAcceptsToday(s.acceptedRequestIds) < 2) return;
        const available = CHAOS_EVENTS.filter((e) => !s.triggeredChaosIds.includes(e.id));
        if (available.length === 0) return;
        if (Math.random() > 0.6) return;
        const picked = available[Math.floor(Math.random() * available.length)];
        set({ activeChaos: { id: picked.id, uid: `chaos-${Date.now()}` } });
      },

      resolveChaos: (response) => {
        const s = get();
        if (!s.activeChaos) return;
        const ev = CHAOS_EVENTS.find((e) => e.id === s.activeChaos!.id);
        if (!ev) return;

        // Stage 3 "Pass to Boss" — zero KPI impact, big Boss-relationship hit.
        // The trade: you offload the work, but you owe David a favor (or two).
        const isPass = response === 'pass-to-boss';
        const impact: KpiDelta =
          response === 'attend'      ? ev.attendImpact :
          response === 'delegate'    ? ev.delegateImpact :
          response === 'reschedule'  ? ev.rescheduleImpact :
          /* pass-to-boss */         {};

        let newSchedule = s.schedule;
        if (response === 'attend') {
          const start = findFreeSlot(s.schedule, ev.durationMin);
          if (start >= 0) {
            newSchedule = [
              ...s.schedule,
              {
                uid: s.activeChaos.uid,
                typeId: 'all-hands' as MeetingTypeId,
                startMinutes: start,
                from: ev.fromWho,
              },
            ];
          }
        }

        const label =
          response === 'attend'      ? 'Attended' :
          response === 'delegate'    ? 'Delegated' :
          response === 'reschedule'  ? 'Rescheduled' :
          /* pass-to-boss */         'Passed to Boss';
        const activityKind =
          response === 'attend'      ? 'chaos-attended' :
          response === 'delegate'    ? 'chaos-delegated' :
          /* reschedule + pass */    'chaos-rescheduled';

        // Fire group channel reaction. The chaos-resolved event only knows
        // the original three responses — pass-to-boss gets its own event
        // (handled below) so #leadership and David can react specifically.
        let convos2 = s.conversations;
        let msgs2 = s.messages;
        if (!isPass) {
          ({ conversations: convos2, messages: msgs2 } = applyChatEvent(
            convos2, msgs2,
            { type: 'chaos-resolved', chaosId: ev.id, response: response as 'attend' | 'delegate' | 'reschedule' },
          ));
        } else {
          ({ conversations: convos2, messages: msgs2 } = applyChatEvent(
            convos2, msgs2,
            { type: 'passed-to-boss', chaosId: ev.id },
          ));
        }

        // Politics:
        //  - For non-pass responses, the *requesting* stakeholder's relationship
        //    changes (×Stage 3 multiplier).
        //  - For pass-to-boss, the *boss* takes a fixed -15 hit (still ×mul).
        const mul = politicsMultiplier(s.stage);
        const chaosStakeholderId = isPass ? 'boss' : senderToStakeholder(ev.fromWho);
        const rawDelta =
          isPass                     ? -15 :
          response === 'attend'      ? +8 :
          response === 'delegate'    ? -3 :
          /* reschedule */           -6;
        const chaosRelDelta = Math.round(rawDelta * mul);
        const reasonNote = isPass
          ? `Punted "${ev.title}" to you`
          : `${label} their chaos event`;
        const nextStakeholders = chaosStakeholderId
          ? adjustRelationship(s.stakeholders, chaosStakeholderId, chaosRelDelta, reasonNote)
          : s.stakeholders;
        const chaosStakeholderForToast = chaosStakeholderId
          ? nextStakeholders.find((x) => x.id === chaosStakeholderId)
          : undefined;

        set({
          activeChaos: null,
          triggeredChaosIds: [...s.triggeredChaosIds, ev.id],
          chaosDelta: sumDeltas(s.chaosDelta, impact),
          schedule: newSchedule,
          chaosPassedToBoss: isPass ? s.chaosPassedToBoss + 1 : s.chaosPassedToBoss,
          activityToday: logActivity(s.activityToday, {
            kind: activityKind,
            title: `${label}: ${ev.title}`,
            detail: ev.flavor,
            from: ev.fromWho,
          }),
          conversations: convos2,
          messages: msgs2,
          stakeholders: nextStakeholders,
          toast: {
            id: `toast-${Date.now()}-chaos`,
            title: `${label} · ${ev.title}`,
            intent: response === 'attend' ? 'info' : isPass ? 'warning' : response === 'delegate' ? 'caution' : 'warning',
            icon: 'alert',
            kpiDelta: impact,
            stakeholder: chaosStakeholderForToast
              ? { name: characterDisplayName(chaosStakeholderForToast.name), delta: chaosRelDelta }
              : undefined,
          },
        });

        // After a chaos resolves, fire a follow-up DM.
        const tpl = pickDmTemplate('on-chaos', get().dmTemplateHistoryIds);
        if (tpl) {
          const { conversations: c3, messages: m3 } = instantiateDm(
            tpl,
            Date.now(),
            get().conversations,
            get().messages,
          );
          set({
            conversations: c3,
            messages: m3,
            dmTemplateHistoryIds: [...get().dmTemplateHistoryIds, tpl.templateId],
          });
        }
      },

      openConversation: (id) =>
        set((s) => ({
          openConversationId: id,
          readConversationIds: s.readConversationIds.includes(id)
            ? s.readConversationIds
            : [...s.readConversationIds, id],
        })),
      closeConversation: () => set({ openConversationId: null }),

      replyInConversation: (id, replyIdx) => {
        const s = get();
        const convo = s.conversations.find((c) => c.id === id);
        if (!convo || !convo.pendingReplyOptions) return;
        const reply = convo.pendingReplyOptions[replyIdx];
        if (!reply) return;

        const now = Date.now();
        const outgoing = makeMessage(id, 'You', reply.text, now, undefined, true);

        // Politics: replying to a stakeholder's DM shifts the relationship.
        // Index-based heuristic: option 0 = warm reply (+3), option 1 = neutral (0),
        // option 2 = pushback (-4). Picks up most templates without hand-tuning.
        // Stage 3+ multiplies all relationship deltas.
        const stakeholderId = senderToStakeholder(convo.name);
        const replyMul = politicsMultiplier(s.stage);
        const replyDeltaRaw = replyIdx === 0 ? +3 : replyIdx === 1 ? 0 : -4;
        const replyDelta = Math.round(replyDeltaRaw * replyMul);
        const nextStakeholders = stakeholderId
          ? adjustRelationship(s.stakeholders, stakeholderId, replyDelta, `Replied "${reply.text.slice(0, 32)}"`)
          : s.stakeholders;
        const stakeholderForToast = stakeholderId
          ? nextStakeholders.find((x) => x.id === stakeholderId)
          : undefined;

        set({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, pendingReplyOptions: undefined, lastMessageAt: now } : c,
          ),
          messages: { ...s.messages, [id]: [...(s.messages[id] ?? []), outgoing] },
          kpis: applyDelta(s.kpis, reply.delta),
          activityToday: logActivity(s.activityToday, {
            kind: 'ping-replied',
            title: `${convo.name}: ${reply.text}`,
            detail: reply.log,
            from: convo.name,
          }),
          stakeholders: nextStakeholders,
          toast: {
            id: `toast-${Date.now()}-reply`,
            title: `Replied to ${characterDisplayName(convo.name)}`,
            intent: replyDelta > 0 ? 'success' : replyDelta < 0 ? 'caution' : 'info',
            icon: 'reply',
            kpiDelta: reply.delta,
            stakeholder: stakeholderForToast && replyDelta !== 0
              ? { name: characterDisplayName(stakeholderForToast.name), delta: replyDelta }
              : undefined,
          },
        });
      },

      scheduleShieldMeeting: () => {
        const s = get();
        if (s.stage < 2) return;
        const accepts = countAcceptsToday(s.acceptedRequestIds);
        if (accepts >= capFor(s.stage)) return;
        const type = MEETING_TYPES['shield-meeting'];
        const start = findFreeSlot(s.schedule, type.durationMin);
        if (start < 0) return;

        const uid = `shield-${Date.now()}`;
        const now = Date.now();

        // Materialize a meeting chat for the shield so the "You" post lands.
        const { conversations: convos1, messages: msgs1 } = ensureMeetingChat(
          'shield-meeting',
          s.conversations,
          s.messages,
          now,
        );
        // Group reaction in #engineering.
        const { conversations: convos2, messages: msgs2 } = applyChatEvent(
          convos1,
          msgs1,
          { type: 'shield-created' },
        );

        set({
          schedule: [
            ...s.schedule,
            { uid, typeId: 'shield-meeting' as MeetingTypeId, startMinutes: start, from: 'You' },
          ],
          // We don't push this into acceptedRequestIds with the "decline:" /
          // request prefix shape — instead we count shields toward the cap
          // by reusing the accept ledger with a synthetic id.
          acceptedRequestIds: [...s.acceptedRequestIds, uid],
          shieldMeetingsToday: s.shieldMeetingsToday + 1,
          activityToday: logActivity(s.activityToday, {
            kind: 'meeting-scheduled',
            title: 'Blocked focus time',
            detail: `${type.durationMin}m · no meetings, just work`,
            from: 'You',
          }),
          conversations: convos2,
          messages: msgs2,
          toast: {
            id: `toast-${Date.now()}-shield`,
            title: 'Blocked · Focus Time',
            intent: 'success',
            icon: 'check',
            kpiDelta: type.impact,
          },
        });
      },

      sendDashboardReport: () => {
        const s = get();
        if (s.stage < 2) return;
        if (s.dashboardSentToday) return;

        // Dashboard report fixed-impact (per plan): +Visibility +5, +ExecConf +3.
        // No productivity hit — the joke is that you replaced an hour of
        // discussion with a slide nobody will read.
        const delta: KpiDelta = { visibility: +5, executiveConfidence: +3 };

        // #leadership applauds the deck.
        const { conversations: convos2, messages: msgs2 } = applyChatEvent(
          s.conversations,
          s.messages,
          { type: 'dashboard-sent' },
        );

        set({
          kpis: applyDelta(s.kpis, delta),
          dashboardSentToday: true,
          activityToday: logActivity(s.activityToday, {
            kind: 'ping-replied',
            title: 'Sent dashboard report',
            detail: 'Numbers shipped. Discussion skipped.',
            from: 'You',
          }),
          conversations: convos2,
          messages: msgs2,
          toast: {
            id: `toast-${Date.now()}-dash`,
            title: 'Sent · Dashboard Report',
            intent: 'success',
            icon: 'send',
            kpiDelta: delta,
          },
        });
      },

      cookTheBooks: () => {
        const s = get();
        if (s.stage < 5) return;
        if (s.illusionSpentToday) return;

        // Per plan: spend 20 Visibility to fake +10 ExecConf for the day.
        // Tomorrow's day-end applies -15 ExecConf debt. The math is a long-
        // run loss, which is the joke. Short-run optics win is the temptation.
        const delta: KpiDelta = { visibility: -20, executiveConfidence: +10 };

        const { conversations: convos2, messages: msgs2 } = applyChatEvent(
          s.conversations,
          s.messages,
          { type: 'illusion-spent' },
        );

        set({
          kpis: applyDelta(s.kpis, delta),
          illusionSpentToday: true,
          illusionDebt: 15,
          activityToday: logActivity(s.activityToday, {
            kind: 'ping-replied',
            title: 'Cooked the books',
            detail: 'Inflated ExecConf for the day. The crash comes tomorrow.',
            from: 'You',
          }),
          conversations: convos2,
          messages: msgs2,
          toast: {
            id: `toast-${Date.now()}-cook`,
            title: 'Cooked · The Books',
            intent: 'warning',
            icon: 'sparkle',
            kpiDelta: delta,
          },
        });
      },

      endDay: () => {
        const s = get();
        const sched = s.schedule;
        const meetingsDelta: KpiDelta = sched.reduce<KpiDelta>((acc, m) => {
          if (m.uid.startsWith('chaos-')) return acc;
          const imp = MEETING_TYPES[m.typeId].impact;
          for (const k of Object.keys(imp) as (keyof KpiDelta)[]) {
            acc[k] = (acc[k] ?? 0) + (imp[k] ?? 0);
          }
          return acc;
        }, {});

        // ── Stage 0 recovery loop ──
        // Per unused accept slot the player earns a small bonus: the team gets
        // actual work done when the calendar is light. Recurring carry-overs
        // and chaos meetings DON'T count as "accepts" — only the active accepts
        // the player explicitly made today.
        const acceptsToday = countAcceptsToday(s.acceptedRequestIds);
        const unusedSlots = Math.max(0, capFor(s.stage) - acceptsToday);
        const restDelta: KpiDelta = unusedSlots > 0
          ? {
              productivity: unusedSlots * 2,
              burnout: unusedSlots * -2,
              morale: unusedSlots * 1,
            }
          : {};

        // ── Stage 4 alliance / feud bonuses ──
        // Each active alliance pumps one themed KPI. Each active feud bleeds
        // alignment. Computed off pre-end-day stakeholders (the day's actions
        // already moved them; we award based on where they stand right now).
        const allianceDelta: KpiDelta = {};
        if (s.stage >= 4) {
          for (const a of detectAlliances(s.stakeholders)) {
            if (a.kind === 'alliance') {
              const kpiKey = ALLIANCE_KPI_OWNER[allianceKey(a)];
              if (kpiKey) {
                allianceDelta[kpiKey] = (allianceDelta[kpiKey] ?? 0) + ALLIANCE_KPI_BONUS;
              }
            } else {
              // Feud — undermines alignment regardless of pair.
              allianceDelta.alignment = (allianceDelta.alignment ?? 0) - ALLIANCE_KPI_BONUS;
            }
          }
        }

        const totalDelta = sumDeltas(
          sumDeltas(sumDeltas(meetingsDelta, s.chaosDelta), restDelta),
          allianceDelta,
        );

        const timeInMeetingsMin = sched.reduce((a, m) => a + MEETING_TYPES[m.typeId].durationMin, 0);
        const peopleMet = sched.reduce((a, m) => a + MEETING_TYPES[m.typeId].attendees, 0);
        const decisionsMade = Math.max(0, Math.round(sched.length * 0.15));

        // ── Stage 4 PR Disaster auto-fire ──
        // If Boss + CEO are both cool to you at day end, the CEO posts on
        // LinkedIn and the org reads it. -15 ExecConf, fires chat broadcast,
        // counts toward the "Reassigned to Special Projects" failure.
        let prFiredThisEndDay = false;
        let extraDelta: KpiDelta = {};
        if (s.stage >= 4) {
          const boss = s.stakeholders.find((x) => x.id === 'boss');
          const ceo = s.stakeholders.find((x) => x.id === 'ceo');
          if (boss && ceo && boss.relationship < 50 && ceo.relationship < 50) {
            prFiredThisEndDay = true;
            extraDelta = { executiveConfidence: -15, visibility: +4, morale: -3 };
          }
        }

        const nextKpis = applyDelta(applyDelta(s.kpis, totalDelta), extraDelta);
        // Boss feedback now sees the post-recovery KPIs so it can praise
        // light-day restraint.
        const feedback = pickBossFeedback(totalDelta, sched.length, unusedSlots, nextKpis);

        const result: DayResult = {
          meetingsHeld: sched.length,
          peopleMet,
          decisionsMade,
          timeInMeetingsHrs: Math.round((timeInMeetingsMin / 60) * 10) / 10,
          actualWorkHrs: Math.max(0, Math.round(((540 - timeInMeetingsMin) / 60) * 10) / 10),
          kpiDelta: sumDeltas(totalDelta, extraDelta),
          restDelta,
          unusedSlots,
          boss: feedback,
        };

        // ── Stage 4 Day 20 Board Sync evaluation ──
        // At end of Day 20, check Stage 4 goals. Need 3 of 5 to "survive" the
        // Board. Anything less → Board Confidence Lost game-over.
        let boardSyncResult = s.boardSyncResult;
        let boardSyncFailed = false;
        if (s.stage === 4 && s.day === STAGE4_LAST_DAY) {
          const goals = STAGE4_GOALS;
          const hit = goals.filter((g) => {
            const v = g.kpi
              ? nextKpis[g.kpi]
              : g.stakeholderId
              ? s.stakeholders.find((x) => x.id === g.stakeholderId)?.relationship ?? 0
              : 0;
            return g.lowerIsBetter ? v <= g.target : v >= g.target;
          }).length;
          const passed = hit >= 3;
          boardSyncResult = { passed, goalsMet: hit, goalsTotal: goals.length };
          if (!passed) boardSyncFailed = true;
        }

        // ── Stage 5 Day 25 Promotion evaluation ──
        // 5 of 5 = promoted (VP). 3-4 = lateral move ("congrats... kind of").
        // <=2 = PIP game-over. Routes to 'promotion' screen on continue.
        let promotionResult = s.promotionResult;
        let pipFailed = false;
        if (s.stage === 5 && s.day === STAGE5_LAST_DAY) {
          const goals = STAGE5_GOALS;
          const hit = goals.filter((g) => {
            const v = g.kpi
              ? nextKpis[g.kpi]
              : g.stakeholderId
              ? s.stakeholders.find((x) => x.id === g.stakeholderId)?.relationship ?? 0
              : 0;
            return g.lowerIsBetter ? v <= g.target : v >= g.target;
          }).length;
          const outcome: 'promoted' | 'lateral' | 'pip' =
            hit >= 5 ? 'promoted' : hit >= 3 ? 'lateral' : 'pip';
          promotionResult = { goalsMet: hit, goalsTotal: goals.length, outcome };
          if (outcome === 'pip') pipFailed = true;
        }

        const prStrikesNext = prFiredThisEndDay ? s.prDisasterStrikes + 1 : s.prDisasterStrikes;
        const over = checkGameOver(nextKpis, s.stakeholders, s.stage, prStrikesNext, boardSyncFailed, pipFailed);

        // Fire post-meeting messages in each meeting chat.
        let convos2 = s.conversations;
        let msgs2 = s.messages;
        ({ conversations: convos2, messages: msgs2 } = fireMeetingHeldMessages(
          sched,
          convos2,
          msgs2,
          Date.now(),
        ));
        // Stage 5 AI Notes Bot — fires once per held non-chaos meeting in
        // #general. Each fire grants +1 Visibility, -1 Morale (already
        // folded into the schedule's meeting-held templates, but we also
        // emit the chat event so the bot's voice is heard).
        if (s.stage >= 5) {
          const typesHeld = new Set<MeetingTypeId>();
          for (const m of sched) {
            if (m.uid.startsWith('chaos-')) continue;
            typesHeld.add(m.typeId);
          }
          for (const tid of typesHeld) {
            ({ conversations: convos2, messages: msgs2 } = applyChatEvent(
              convos2, msgs2,
              { type: 'ai-notes-fired', meetingTypeId: tid },
            ));
          }
        }
        // Fire end-of-day sentiment reactions in group channels.
        ({ conversations: convos2, messages: msgs2 } = applyChatEvent(
          convos2, msgs2,
          { type: 'day-end', kpis: nextKpis, meetingsHeld: sched.length, unusedSlots },
        ));
        // Stage 4 PR Disaster broadcast — fires in #leadership and #general.
        if (prFiredThisEndDay) {
          ({ conversations: convos2, messages: msgs2 } = applyChatEvent(
            convos2, msgs2,
            { type: 'pr-disaster-fired' },
          ));
        }
        // Stage 4 Board Sync result — broadcast pass / fail in #leadership.
        if (boardSyncResult) {
          ({ conversations: convos2, messages: msgs2 } = applyChatEvent(
            convos2, msgs2,
            boardSyncResult.passed
              ? { type: 'board-sync-passed', goalsMet: boardSyncResult.goalsMet, goalsTotal: boardSyncResult.goalsTotal }
              : { type: 'board-sync-failed', goalsMet: boardSyncResult.goalsMet, goalsTotal: boardSyncResult.goalsTotal },
          ));
        }

        set({
          lastResult: result,
          kpis: nextKpis,
          history: [...s.history, nextKpis],
          gameOver: over,
          activeChaos: null,
          conversations: convos2,
          messages: msgs2,
          prDisasterStrikes: prStrikesNext,
          boardSyncResult,
          promotionResult,
        });
        return result;
      },

      continueToNextDay: () => {
        const s = get();
        // Stage 5 Day 25 → if a promotion result was set at end of day, route
        // to the Promotion screen instead of rolling forward. (PIP outcome
        // already routes to GameOver via the gameOver state.)
        if (s.stage === 5 && s.day >= STAGE5_LAST_DAY && s.promotionResult) {
          set({ screen: 'promotion' });
          return;
        }
        const finishedStage1 = s.stage === 1 && s.day >= STAGE1_LAST_DAY;
        const finishedStage2 = s.stage === 2 && s.day >= STAGE2_LAST_DAY;
        const finishedStage3 = s.stage === 3 && s.day >= STAGE3_LAST_DAY;
        const finishedStage4 = s.stage === 4 && s.day >= STAGE4_LAST_DAY;
        // Stage 5 doesn't advance — Day 25 ends with the Promotion screen.
        // continueToNextDay shouldn't be reachable past Stage 5 Day 25 in
        // normal play (the Day 25 day-summary routes to 'promotion').
        const nextStage: 1 | 2 | 3 | 4 | 5 = finishedStage1
          ? 2
          : finishedStage2
          ? 3
          : finishedStage3
          ? 4
          : finishedStage4
          ? 5
          : s.stage;
        const stageChanged = nextStage !== s.stage;
        const stageUnlocked: 2 | 3 | 4 | 5 | null = finishedStage1
          ? 2
          : finishedStage2
          ? 3
          : finishedStage3
          ? 4
          : finishedStage4
          ? 5
          : null;

        const recurringCarry: ScheduledMeeting[] = s.schedule
          .filter((m) => m.recurring)
          .map((m, idx) => ({
            ...m,
            uid: `recurring-d${s.day + 1}-${idx}-${m.typeId}`,
          }));

        const recurringAcceptedIds = recurringCarry.map((m) => `recurring:${m.uid}`);

        const now = Date.now();
        // Seed morning DM(s) for new day.
        let convos = s.conversations;
        let msgs = s.messages;
        let history = s.dmTemplateHistoryIds;
        for (let i = 0; i < 2; i++) {
          const tpl = pickDmTemplate('morning', history);
          if (!tpl) break;
          const r = instantiateDm(tpl, now + i, convos, msgs);
          convos = r.conversations;
          msgs = r.messages;
          history = [...history, tpl.templateId];
        }
        // Day-start group reactions.
        const dayStartFx = applyChatEvent(convos, msgs, { type: 'day-start', day: s.day + 1 });
        convos = dayStartFx.conversations;
        msgs = dayStartFx.messages;

        // ── Stage 2 Reorg Whispers ────────────────────────────────────────
        // On any Stage 2 day from day 7 onward, roll a 40% chance to
        // force-fire the reorg-announce chaos. If we hit day 10 without
        // ever firing, force it on the last day so every Stage 2 run
        // experiences the reorg at least once.
        let nextActiveChaos = null as { id: string; uid: string } | null;
        let nextReorgForced = stageChanged ? false : s.reorgForcedThisStage;
        const nextDay = s.day + 1;
        if (nextStage === 2 && !nextReorgForced) {
          const shouldForce =
            (nextDay >= 7 && Math.random() < 0.4) || nextDay === STAGE2_LAST_DAY;
          if (shouldForce) {
            nextActiveChaos = {
              id: 'reorg-announce',
              uid: `chaos-${Date.now()}-reorg`,
            };
            nextReorgForced = true;
          }
        }

        // ── Stage 4 Board Sync climax ──
        // On Day 20 (the final Stage 4 day), the Board Sync chaos is forced
        // at day-start regardless of accept count. How the player responds
        // sets up the end-of-day goal evaluation.
        if (nextStage === 4 && nextDay === STAGE4_LAST_DAY) {
          nextActiveChaos = {
            id: 'board-sync',
            uid: `chaos-${Date.now()}-board-sync`,
          };
        }

        // ── Stage 5 Legacy Meeting auto-spawn ──
        // Every Stage 5 day, one Legacy Sync gets dropped on the calendar.
        // Player can't decline or remove it. The carryover schedule (above)
        // is recurringCarry — we append the legacy meeting onto it.
        let scheduleSeed = recurringCarry;
        let scheduleSeedActivity: ActivityEntry[] = [];
        if (nextStage === 5) {
          const legacyType = MEETING_TYPES['legacy-meeting'];
          const start = findFreeSlot(scheduleSeed, legacyType.durationMin);
          if (start >= 0) {
            const luid = `legacy-d${nextDay}-${Math.random().toString(36).slice(2, 7)}`;
            scheduleSeed = [
              ...scheduleSeed,
              {
                uid: luid,
                typeId: 'legacy-meeting' as MeetingTypeId,
                startMinutes: start,
                from: 'Acme (legacy)',
                legacy: true,
              },
            ];
            scheduleSeedActivity = [
              {
                id: `legacy-${Date.now()}`,
                ts: Date.now(),
                kind: 'meeting-scheduled' as const,
                title: 'Legacy Sync added',
                detail: 'Inherited from "before your time". Cannot be removed.',
                from: 'Acme',
              },
            ];
            // Fire #general reaction.
            const fx = applyChatEvent(convos, msgs, { type: 'legacy-spawned' });
            convos = fx.conversations;
            msgs = fx.messages;
          }
        }

        // ── Stage 3 approval-chain carryover ───────────────────────────────
        // Approval-gated requests from previous days that weren't actioned
        // follow the player into the next day. On stage transitions, the
        // queue resets (Stage 4 starts fresh).
        const todayPending = pendingRequestsFor(s.day, s.acceptedRequestIds, s.schedule, s.carryoverRequests);
        const nextCarryover: MeetingRequest[] = stageChanged
          ? []
          : todayPending.filter((r) => r.approvers && r.approvers.length > 0);

        // Tick approvals once at day start so the chain visibly moves.
        let nextApprovalsAfterTick = stageChanged ? {} : { ...s.requestApprovals };
        // Drop approval entries for requests no longer in play.
        const carryoverUids = new Set(nextCarryover.map((r) => r.uid));
        for (const uid of Object.keys(nextApprovalsAfterTick)) {
          if (!carryoverUids.has(uid)) delete nextApprovalsAfterTick[uid];
        }
        if (nextStage >= 3 && !stageChanged) {
          nextApprovalsAfterTick = tickApprovalsOnce(
            nextCarryover,
            nextApprovalsAfterTick,
            s.stakeholders,
          );
        }

        // Stage 5 illusion debt — apply yesterday's "Cook the Books" hangover.
        const debt = s.illusionDebt ?? 0;
        const debtedKpis = debt > 0
          ? applyDelta(s.kpis, { executiveConfidence: -debt })
          : s.kpis;

        set({
          day: nextDay,
          stage: nextStage,
          stageUnlocked,
          schedule: scheduleSeed,
          acceptedRequestIds: recurringAcceptedIds,
          kpis: debtedKpis,
          lastResult: null,
          screen: 'calendar',
          activeChaos: nextActiveChaos,
          triggeredChaosIds: [],
          chaosDelta: {},
          // Reset Stage 2 daily actions every day; reset the "once per stage"
          // reorg flag when the stage changes.
          dashboardSentToday: false,
          shieldMeetingsToday: 0,
          reorgForcedThisStage: nextReorgForced,
          // Stage 3 ledger — carry approval queue across days, reset on stage transition.
          carryoverRequests: nextCarryover,
          requestApprovals: nextApprovalsAfterTick,
          approvalChainsCleared: stageChanged ? 0 : s.approvalChainsCleared,
          chaosPassedToBoss: stageChanged ? 0 : s.chaosPassedToBoss,
          // Stage 4 ledger — PR strikes reset on stage exit, Board Sync clears too.
          prDisasterStrikes: stageChanged ? 0 : s.prDisasterStrikes,
          boardSyncResult: stageChanged ? null : s.boardSyncResult,
          // Stage 5 ledger — reset daily flags, clear consumed debt, reset
          // promotion result on stage transition (shouldn't happen from S5
          // but defensive).
          illusionSpentToday: false,
          illusionDebt: 0,
          promotionResult: stageChanged ? null : s.promotionResult,
          activityToday: [
            ...scheduleSeedActivity,
            ...(recurringCarry.length
              ? recurringCarry.map((m, i) => ({
                  id: `dayseed-${Date.now()}-${i}`,
                  ts: Date.now() - 1000 * (recurringCarry.length - i),
                  kind: 'meeting-scheduled' as const,
                  title: `Recurring: ${MEETING_TYPES[m.typeId].title}`,
                  detail: `Carried over from yesterday`,
                  from: m.from,
                }))
              : []),
          ],
          detailUid: null,
          conversations: convos,
          messages: msgs,
          dmTemplateHistoryIds: history,
          openConversationId: null,
          toast: null,
          settingsOpen: false,
        });
      },

      clearStageUnlock: () => set({ stageUnlocked: null }),

      resetGame: () => {
        set({
          screen: 'landing',
          stage: 1,
          day: 1,
          kpis: STARTING_KPIS,
          history: [],
          schedule: [],
          acceptedRequestIds: [],
          lastResult: null,
          activeChaos: null,
          triggeredChaosIds: [],
          chaosDelta: {},
          activityToday: [],
          gameOver: null,
          stageUnlocked: null,
          detailUid: null,
          dashboardSentToday: false,
          shieldMeetingsToday: 0,
          reorgForcedThisStage: false,
          requestApprovals: {},
          carryoverRequests: [],
          approvalChainsCleared: 0,
          chaosPassedToBoss: 0,
          conversations: [],
          messages: {},
          openConversationId: null,
          dmTemplateHistoryIds: [],
          readConversationIds: [],
          stakeholders: STAKEHOLDERS_SEED,
          toast: null,
          settingsOpen: false,
        });
      },

      startGame: () => {
        const s = get();
        if (s.conversations.length > 0) return; // already started
        const now = Date.now();
        const { conversations, messages } = buildInitialChat(now);
        // Seed 2 morning DMs.
        let cs = conversations;
        let ms = messages;
        let history: string[] = [];
        for (let i = 0; i < 2; i++) {
          const tpl = pickDmTemplate('morning', history);
          if (!tpl) break;
          const r = instantiateDm(tpl, now + i, cs, ms);
          cs = r.conversations;
          ms = r.messages;
          history = [...history, tpl.templateId];
        }
        set({ conversations: cs, messages: ms, dmTemplateHistoryIds: history });
      },
    }),
    {
      name: 'meeting-tycoon-save',
      // Bumped for Stage 5: new state fields (illusionSpentToday, illusionDebt,
      // promotionResult), new MeetingTypes (committee, legacy-meeting), new
      // game-over reason (performance-improvement-plan), new chaos events
      // (committee-spawn, ai-takeover, cfo-illusion-audit), new 'promotion'
      // FlowScreen. Old saves wipe.
      version: 14,
      migrate: () => undefined,
    },
  ),
);

// ──────────────────────────────────────────────────────────────────────────
// Boss feedback — references current goal progress, light-day restraint, and
// stakeholder happiness rather than raw delta.
// ──────────────────────────────────────────────────────────────────────────
function pickBossFeedback(
  _delta: KpiDelta,
  meetingsHeld: number,
  unusedSlots: number,
  postKpis: Kpis,
): BossFeedback {
  const s = useGame.getState();
  // Note: we use postKpis (after applying deltas) rather than the persisted
  // s.kpis because the boss reacts to the NEW state, not yesterday's.
  const k = postKpis;
  const boss = s.stakeholders.find((x) => x.id === 'boss');
  const goals = stageGoalsFor(s.stage);
  const goalValue = (g: typeof STAGE1_GOALS[number]): number => {
    if (g.kpi) return k[g.kpi];
    if (g.stakeholderId) return s.stakeholders.find((x) => x.id === g.stakeholderId)?.relationship ?? 0;
    return 0;
  };
  const hitGoals = goals.filter((g) => {
    const v = goalValue(g);
    return g.lowerIsBetter ? v <= g.target : v >= g.target;
  }).length;

  // ── Critical first: boss-aware emergencies override everything else.
  if (boss && boss.relationship <= 30) {
    return {
      emoji: '😬',
      text: `${characterDisplayName(boss.name)}'s patience is running out. ${boss.lastNote ?? 'They noticed.'}`,
    };
  }

  // ── Positive: light-day praise. The Stage 0 recovery loop pays off here —
  // the boss notices when you've kept the calendar reasonable.
  if (meetingsHeld === 0) {
    return {
      emoji: '🤨',
      text: 'No meetings at all today? Bold. Suspicious. Working from a beach?',
    };
  }
  if (unusedSlots >= 3 && k.productivity >= 55) {
    return {
      emoji: '🙂',
      text: 'Light calendar, real output. The team actually shipped something. Keep this up.',
    };
  }
  if (unusedSlots >= 2 && k.burnout <= 30) {
    return {
      emoji: '🙂',
      text: "Whatever you're doing, the team isn't visibly burning out. I'll take it.",
    };
  }
  if (boss && boss.relationship >= 80) {
    return {
      emoji: '🙌',
      text: `${characterDisplayName(boss.name)} is your biggest fan today. The "high performer" rumor is circulating.`,
    };
  }
  if (hitGoals === goals.length) {
    return {
      emoji: '🙌',
      text: 'All quarterly goals on track. The CFO sent a 🙏 emoji. That is rare.',
    };
  }
  if (hitGoals >= 3) {
    return {
      emoji: '🙂',
      text: `Solid progress — ${hitGoals}/${goals.length} quarterly goals hit. Keep doing whatever you are doing.`,
    };
  }
  // Stage 3 specific: praise (or call out) bureaucratic fluency.
  if (s.stage >= 3 && s.approvalChainsCleared >= 3) {
    return {
      emoji: '🙂',
      text: `${s.approvalChainsCleared} approval chains cleared this stage. You speak Process now.`,
    };
  }
  if (s.stage >= 3 && s.chaosPassedToBoss >= 2) {
    return {
      emoji: '😬',
      text: 'You have passed two crises to me. I noticed. Try not to make it three.',
    };
  }

  // ── Negative: overload warnings.
  if (k.burnout >= 70) {
    return {
      emoji: '😬',
      text: 'Team looks tired. Have you considered another all-hands?',
    };
  }
  if (k.morale <= 30) {
    return {
      emoji: '😬',
      text: "Morale is fragile. HR is preparing 'wellness resources'. That's not a good sign.",
    };
  }

  return {
    emoji: '🙂',
    text: 'Promising. Let us circle back tomorrow on the circling-back cadence.',
  };
}

export { STARTING_KPIS, applyDelta, STAGE1_LAST_DAY, STAGE2_LAST_DAY, STAGE3_LAST_DAY, STAGE4_LAST_DAY, STAGE5_LAST_DAY, DAILY_ACCEPT_CAP };
