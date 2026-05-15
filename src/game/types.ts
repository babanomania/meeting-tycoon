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
  | 'pr-cleanup';

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
}

export type StageId = 1 | 2 | 3 | 4 | 5;

export type FlowScreen =
  | 'onboarding'
  | 'calendar'
  | 'inbox'
  | 'day-summary'
  | 'metrics'
  | 'activity'
  | 'more'
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

export type ChaosResponse = 'attend' | 'delegate' | 'reschedule';

export type ActivityKind =
  | 'meeting-scheduled'
  | 'meeting-removed'
  | 'meeting-declined'
  | 'chaos-attended'
  | 'chaos-delegated'
  | 'chaos-rescheduled';

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
  /** Which KPI this goal tracks */
  kpi: KpiKey;
  /** Target value to hit. If kpi is 'burnout', "achieved" means staying *below* target. */
  target: number;
  /** If true, a lower KPI value is better (i.e. burnout). */
  lowerIsBetter?: boolean;
}

export type GameOverReason =
  | 'team-walkout'
  | 'fired-low-confidence'
  | 'burnout-sabbatical';

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
  kpiDelta: KpiDelta;
  boss: BossFeedback;
}
