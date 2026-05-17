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
  MeetingTypeId,
  ScheduledMeeting,
  Stakeholder,
} from './types';
import {
  STAKEHOLDERS_SEED,
  adjustRelationship,
  senderToStakeholder,
} from './politics';
import { characterDisplayName } from './characters';
import {
  CHAOS_EVENTS,
  MEETING_TYPES,
  STAGE1_GOALS,
  capFor,
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
/**
 * Legacy constant — still exported for older callers that hard-coded "5".
 * New code should call `capFor(stage)` instead. The Stage 2 transition
 * drops the cap to 4 and that change must be observed everywhere the UI
 * shows "accepts left", or the player will misread the calendar load.
 */
const DAILY_ACCEPT_CAP = 5;

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

const checkGameOver = (
  k: Kpis,
  stakeholders: Stakeholder[],
  stage: 1 | 2 | 3 | 4 | 5,
): GameOver | null => {
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
) {
  const recurringTypeIds = new Set(schedule.filter((m) => m.recurring).map((m) => m.typeId));
  return requestsForDay(day).filter((r) => {
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
      screen: 'onboarding',
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
        const requests = requestsForDay(get().day);
        const req = requests.find((r) => r.uid === requestId);
        if (!req) return;
        if (get().acceptedRequestIds.includes(requestId)) return;

        const beforeCount = countAcceptsToday(get().acceptedRequestIds);
        if (beforeCount >= capFor(get().stage)) return;

        const type = MEETING_TYPES[req.typeId];
        const start = findFreeSlot(get().schedule, type.durationMin);
        if (start < 0) return;
        const isRecurring = type.priority === 'recurring';

        // Materialize meeting chat for this type if not already there.
        const now = Date.now();
        const { conversations: convos1, messages: msgs1 } = ensureMeetingChat(
          req.typeId as MeetingTypeId,
          get().conversations,
          get().messages,
          now,
        );

        // Fire any group-channel reactions.
        const evt: ChatEvent = { type: 'meeting-accepted', meetingTypeId: req.typeId as MeetingTypeId };
        const { conversations: convos2, messages: msgs2 } = applyChatEvent(convos1, msgs1, evt);

        // Politics: accepting from a stakeholder is a small relationship boost.
        const stakeholderId = senderToStakeholder(req.from);
        const nextStakeholders = stakeholderId
          ? adjustRelationship(get().stakeholders, stakeholderId, +5, `Accepted ${type.title}`)
          : get().stakeholders;
        const stakeholderForToast = stakeholderId
          ? nextStakeholders.find((x) => x.id === stakeholderId)
          : undefined;

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
          activityToday: logActivity(s.activityToday, {
            kind: 'meeting-scheduled',
            title: `Scheduled ${type.title}`,
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
            title: `Scheduled · ${type.title}`,
            intent: 'info',
            icon: 'calendar',
            kpiDelta: type.impact,
            stakeholder: stakeholderForToast
              ? { name: characterDisplayName(stakeholderForToast.name), delta: +5 }
              : undefined,
          },
        }));

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
        const requests = requestsForDay(get().day);
        const req = requests.find((r) => r.uid === requestId);
        if (!req) return;
        if (get().acceptedRequestIds.includes(`decline:${requestId}`)) return;

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
          get().conversations,
          get().messages,
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
        if (get().stage >= 2 && t.priority === 'recurring') {
          declineDelta = Math.round(declineDelta * 1.5);
        }
        const nextStakeholders = stakeholderId
          ? adjustRelationship(get().stakeholders, stakeholderId, declineDelta, `Declined ${t.title}`)
          : get().stakeholders;
        const stakeholderForToast = stakeholderId
          ? nextStakeholders.find((x) => x.id === stakeholderId)
          : undefined;

        set((s) => ({
          acceptedRequestIds: [...s.acceptedRequestIds, `decline:${requestId}`],
          kpis: applyDelta(s.kpis, cost),
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
        const impact =
          response === 'attend'
            ? ev.attendImpact
            : response === 'delegate'
            ? ev.delegateImpact
            : ev.rescheduleImpact;

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
          response === 'attend'
            ? 'Attended'
            : response === 'delegate'
            ? 'Delegated'
            : 'Rescheduled';
        const activityKind =
          response === 'attend'
            ? 'chaos-attended'
            : response === 'delegate'
            ? 'chaos-delegated'
            : 'chaos-rescheduled';

        // Fire group channel reaction.
        const { conversations: convos2, messages: msgs2 } = applyChatEvent(
          s.conversations,
          s.messages,
          { type: 'chaos-resolved', chaosId: ev.id, response },
        );

        // Politics: how the player responded to chaos hits the requesting stakeholder.
        const chaosStakeholderId = senderToStakeholder(ev.fromWho);
        const chaosRelDelta =
          response === 'attend' ? +8 :
          response === 'delegate' ? -3 :
          /* reschedule */ -6;
        const nextStakeholders = chaosStakeholderId
          ? adjustRelationship(s.stakeholders, chaosStakeholderId, chaosRelDelta, `${label} their chaos event`)
          : s.stakeholders;
        const chaosStakeholderForToast = chaosStakeholderId
          ? nextStakeholders.find((x) => x.id === chaosStakeholderId)
          : undefined;

        set({
          activeChaos: null,
          triggeredChaosIds: [...s.triggeredChaosIds, ev.id],
          chaosDelta: sumDeltas(s.chaosDelta, impact),
          schedule: newSchedule,
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
            intent: response === 'attend' ? 'info' : response === 'delegate' ? 'caution' : 'warning',
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
        const stakeholderId = senderToStakeholder(convo.name);
        const replyDelta = replyIdx === 0 ? +3 : replyIdx === 1 ? 0 : -4;
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

        const totalDelta = sumDeltas(sumDeltas(meetingsDelta, s.chaosDelta), restDelta);

        const timeInMeetingsMin = sched.reduce((a, m) => a + MEETING_TYPES[m.typeId].durationMin, 0);
        const peopleMet = sched.reduce((a, m) => a + MEETING_TYPES[m.typeId].attendees, 0);
        const decisionsMade = Math.max(0, Math.round(sched.length * 0.15));

        const nextKpis = applyDelta(s.kpis, totalDelta);
        // Boss feedback now sees the post-recovery KPIs so it can praise
        // light-day restraint.
        const feedback = pickBossFeedback(totalDelta, sched.length, unusedSlots, nextKpis);

        const result: DayResult = {
          meetingsHeld: sched.length,
          peopleMet,
          decisionsMade,
          timeInMeetingsHrs: Math.round((timeInMeetingsMin / 60) * 10) / 10,
          actualWorkHrs: Math.max(0, Math.round(((540 - timeInMeetingsMin) / 60) * 10) / 10),
          kpiDelta: totalDelta,
          restDelta,
          unusedSlots,
          boss: feedback,
        };

        const over = checkGameOver(nextKpis, s.stakeholders, s.stage);

        // Fire post-meeting messages in each meeting chat.
        const { conversations: convos1, messages: msgs1 } = fireMeetingHeldMessages(
          sched,
          s.conversations,
          s.messages,
          Date.now(),
        );
        // Fire end-of-day sentiment reactions in group channels. Now passes
        // meetings + unusedSlots so reactions can fire for light/recovered days.
        const { conversations: convos2, messages: msgs2 } = applyChatEvent(
          convos1,
          msgs1,
          { type: 'day-end', kpis: nextKpis, meetingsHeld: sched.length, unusedSlots },
        );

        set({
          lastResult: result,
          kpis: nextKpis,
          history: [...s.history, nextKpis],
          gameOver: over,
          activeChaos: null,
          conversations: convos2,
          messages: msgs2,
        });
        return result;
      },

      continueToNextDay: () => {
        const s = get();
        const finishedStage1 = s.stage === 1 && s.day >= STAGE1_LAST_DAY;
        const finishedStage2 = s.stage === 2 && s.day >= STAGE2_LAST_DAY;
        const nextStage: 1 | 2 | 3 | 4 | 5 = finishedStage1
          ? 2
          : finishedStage2
          ? 3
          : s.stage;
        const stageChanged = nextStage !== s.stage;
        const stageUnlocked: 2 | 3 | 4 | 5 | null = finishedStage1
          ? 2
          : finishedStage2
          ? 3
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

        set({
          day: nextDay,
          stage: nextStage,
          stageUnlocked,
          schedule: recurringCarry,
          acceptedRequestIds: recurringAcceptedIds,
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
          activityToday: recurringCarry.length
            ? recurringCarry.map((m, i) => ({
                id: `dayseed-${Date.now()}-${i}`,
                ts: Date.now() - 1000 * (recurringCarry.length - i),
                kind: 'meeting-scheduled' as const,
                title: `Recurring: ${MEETING_TYPES[m.typeId].title}`,
                detail: `Carried over from yesterday`,
                from: m.from,
              }))
            : [],
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
          screen: 'onboarding',
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
      // Bumped for Stage 2: new state fields (dashboardSentToday,
      // shieldMeetingsToday, reorgForcedThisStage) + new game-over reason
      // would otherwise round-trip from stale saves.
      version: 10,
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

export { STARTING_KPIS, applyDelta, STAGE1_LAST_DAY, STAGE2_LAST_DAY, DAILY_ACCEPT_CAP };
