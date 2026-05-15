import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActivityEntry,
  ChaosResponse,
  DayResult,
  FlowScreen,
  GameOver,
  Kpis,
  KpiDelta,
  MeetingTypeId,
  ScheduledMeeting,
} from './types';
import {
  CHAOS_EVENTS,
  MEETING_TYPES,
  STAGE1_GOALS,
  requestsForDay,
} from './data';
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
/** Max number of non-recurring meetings the player can accept per day. */
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

/**
 * Pick a boss reaction. Goal status takes priority over generic KPI rules so the
 * boss feels like she's tracking your quarter, not just today's delta.
 */
function bossFeedbackFor(prevKpis: Kpis, nextKpis: Kpis, sched: number): BossFeedback {
  const hit = STAGE1_GOALS.filter((g) =>
    g.lowerIsBetter ? nextKpis[g.kpi] <= g.target : nextKpis[g.kpi] >= g.target,
  );
  const justHit = hit.filter((g) =>
    g.lowerIsBetter ? prevKpis[g.kpi] > g.target : prevKpis[g.kpi] < g.target,
  );
  const justLost = STAGE1_GOALS.filter((g) => {
    const wasHit = g.lowerIsBetter ? prevKpis[g.kpi] <= g.target : prevKpis[g.kpi] >= g.target;
    const stillHit = g.lowerIsBetter ? nextKpis[g.kpi] <= g.target : nextKpis[g.kpi] >= g.target;
    return wasHit && !stillHit;
  });

  // All four goals achieved — the rare "win"
  if (hit.length === STAGE1_GOALS.length) {
    return {
      emoji: '🏆',
      text: `All four quarterly goals hit. The CFO is "circling back to celebrate the celebration."`,
    };
  }
  if (justLost.length > 0) {
    const g = justLost[0];
    return {
      emoji: '📉',
      text: `You just lost the ${g.label} goal. We'll need a 30-min "alignment chat" tomorrow.`,
    };
  }
  if (justHit.length > 0) {
    const g = justHit[0];
    return {
      emoji: '🎯',
      text: `Hit the ${g.label} target today. I've already taken credit on LinkedIn.`,
    };
  }

  // Pressure when burnout is high
  if (nextKpis.burnout >= 70) {
    return {
      emoji: '😬',
      text: `Burnout is at ${nextKpis.burnout}. HR is preparing "wellness resources". Keep pushing.`,
    };
  }
  // Pressure when productivity is bottoming out
  if (nextKpis.productivity <= 15) {
    return {
      emoji: '🤨',
      text: `Productivity is ${nextKpis.productivity}. Visibility is what matters, but eyebrows are being raised.`,
    };
  }
  // Empty day
  if (sched === 0) {
    return {
      emoji: '😐',
      text: `You held no meetings today. Bold. Possibly career-limiting.`,
    };
  }
  // Cram day
  if (sched >= 6) {
    return {
      emoji: '🤩',
      text: `Now THIS is what visibility looks like. Burnout is a feature, not a bug.`,
    };
  }
  return {
    emoji: '🙂',
    text: `Promising day. Let's circle back tomorrow on the circling-back cadence.`,
  };
}

const checkGameOver = (k: Kpis): GameOver | null => {
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

  /** Meeting currently shown in the bottom-sheet detail view. null = closed. */
  detailUid: string | null;

  setScreen: (s: FlowScreen) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  removeScheduled: (uid: string) => void;
  openDetail: (uid: string) => void;
  closeDetail: () => void;
  maybeTriggerChaos: () => void;
  resolveChaos: (response: ChaosResponse) => void;
  endDay: () => DayResult;
  continueToNextDay: () => void;
  clearStageUnlock: () => void;
  resetGame: () => void;
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

/** How many non-recurring requests the player has actively accepted today. */
const countAcceptsToday = (acceptedIds: string[]): number =>
  acceptedIds.filter((id) => !id.startsWith('decline:') && !id.startsWith('chaos-')).length;

/**
 * Project a KPI delta over current state, returning the *new* values. Used by the
 * inbox to preview "what happens if you accept this".
 */
export function projectKpis(current: Kpis, delta: KpiDelta): Kpis {
  return applyDelta(current, delta);
}

/**
 * The single source of truth for "what's still in the inbox today".
 * - Filters out accepted and declined requests
 * - Filters out recurring requests whose typeId is already on the calendar
 *   (so e.g. "Team Standup" doesn't keep re-appearing once accepted once)
 */
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

      setScreen: (s) => set({ screen: s }),

      acceptRequest: (requestId) => {
        const requests = requestsForDay(get().day);
        const req = requests.find((r) => r.uid === requestId);
        if (!req) return;
        if (get().acceptedRequestIds.includes(requestId)) return;

        const beforeCount = countAcceptsToday(get().acceptedRequestIds);
        // Cap on new accepts per day — recurring carry-overs don't count.
        if (beforeCount >= DAILY_ACCEPT_CAP) return;

        const type = MEETING_TYPES[req.typeId];
        const start = findFreeSlot(get().schedule, type.durationMin);
        if (start < 0) return;
        const isRecurring = type.priority === 'recurring';
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
        }));

        // Chaos trigger lives here (not in a React effect) so it fires exactly
        // once at the moment the count crosses a threshold — not every time
        // `activeChaos` toggles.
        const afterCount = beforeCount + 1;
        if ((afterCount === 2 || afterCount === 4) && !get().activeChaos) {
          // Defer slightly so the request-accept animation can play before the modal slams in.
          setTimeout(() => {
            if (get().activeChaos) return;
            const available = CHAOS_EVENTS.filter((e) => !get().triggeredChaosIds.includes(e.id));
            if (available.length === 0) return;
            if (Math.random() > 0.6) return;
            const picked = available[Math.floor(Math.random() * available.length)];
            set({ activeChaos: { id: picked.id, uid: `chaos-${Date.now()}` } });
          }, 350);
        }
      },

      declineRequest: (requestId) => {
        const requests = requestsForDay(get().day);
        const req = requests.find((r) => r.uid === requestId);
        if (!req) return;
        if (get().acceptedRequestIds.includes(`decline:${requestId}`)) return;

        // Decline cost — varies by who/what you're saying no to. Applied immediately
        // so the player feels the consequence (and so it's reflected in the
        // goal-projection on the next request they look at).
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
          // optional / low — declining is essentially free
          cost = {};
          detail = `${req.from} understood. (Probably.)`;
        }

        set((s) => ({
          acceptedRequestIds: [...s.acceptedRequestIds, `decline:${requestId}`],
          kpis: applyDelta(s.kpis, cost),
          activityToday: logActivity(s.activityToday, {
            kind: 'meeting-declined',
            title: `Declined ${t.title}`,
            detail,
            from: req.from,
          }),
        }));
      },

      removeScheduled: (uid) => {
        const removed = get().schedule.find((m) => m.uid === uid);
        set((s) => ({
          schedule: s.schedule.filter((m) => m.uid !== uid),
          // Drop both accept marker AND any recurring-carry marker
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

        const totalDelta = sumDeltas(meetingsDelta, s.chaosDelta);

        const timeInMeetingsMin = sched.reduce(
          (a, m) => a + MEETING_TYPES[m.typeId].durationMin,
          0,
        );
        const peopleMet = sched.reduce(
          (a, m) => a + MEETING_TYPES[m.typeId].attendees,
          0,
        );
        const decisionsMade = Math.max(0, Math.round(sched.length * 0.15));

        const nextKpis = applyDelta(s.kpis, totalDelta);
        const over = checkGameOver(nextKpis);
        const feedback = bossFeedbackFor(s.kpis, nextKpis, sched.length);

        const result: DayResult = {
          meetingsHeld: sched.length,
          peopleMet,
          decisionsMade,
          timeInMeetingsHrs: Math.round((timeInMeetingsMin / 60) * 10) / 10,
          actualWorkHrs: Math.max(0, Math.round(((540 - timeInMeetingsMin) / 60) * 10) / 10),
          kpiDelta: totalDelta,
          boss: feedback,
        };

        set({
          lastResult: result,
          kpis: nextKpis,
          history: [...s.history, nextKpis],
          gameOver: over,
          activeChaos: null,
        });
        return result;
      },

      continueToNextDay: () => {
        const s = get();
        const finishedStage1 = s.stage === 1 && s.day >= STAGE1_LAST_DAY;

        // Carry recurring meetings forward, re-slotted to their original times
        // so the player wakes up with their recurring calendar already populated.
        const recurringCarry: ScheduledMeeting[] = s.schedule
          .filter((m) => m.recurring)
          .map((m, idx) => ({
            ...m,
            uid: `recurring-d${s.day + 1}-${idx}-${m.typeId}`,
          }));

        // Mark them as "auto-accepted" so they're not counted toward the daily cap
        // and don't appear in the inbox.
        const recurringAcceptedIds = recurringCarry.map((m) => `recurring:${m.uid}`);

        set({
          day: s.day + 1,
          stage: finishedStage1 ? 2 : s.stage,
          stageUnlocked: finishedStage1 ? 2 : null,
          schedule: recurringCarry,
          acceptedRequestIds: recurringAcceptedIds,
          lastResult: null,
          screen: 'calendar',
          activeChaos: null,
          triggeredChaosIds: [],
          chaosDelta: {},
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
        });
      },
    }),
    {
      name: 'meeting-tycoon-save',
      version: 5,
      migrate: () => undefined,
    },
  ),
);

export { STARTING_KPIS, applyDelta, STAGE1_LAST_DAY, DAILY_ACCEPT_CAP };
