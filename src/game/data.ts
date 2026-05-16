import type { ChaosEvent, MeetingType, MeetingRequest, QuarterlyGoal } from './types';

export const COMPANY = {
  name: 'Acme Corp',
  tagline: 'We build stuff nobody has time to use.',
  employees: 23,
  departments: 5,
  meetingsPerWeek: 127,
  actualWorkPct: 2,
  timeInMeetingsPct: 87,
};

export const PRIORITIES_Q = [
  'Improve Alignment',
  'Increase Visibility',
  'Prepare for Reorg',
  'Win the Strategy Award',
];

export const RISK_ALERTS = [
  { tone: 'danger', text: 'Team morale is… let’s say "fragile".' },
  { tone: 'warning', text: 'Engineering is drowning.' },
  { tone: 'warning', text: 'CEO wants a town hall.' },
] as const;

export const BOSS = {
  name: 'Your Boss',
  alias: 'aka The Expectation Machine',
  ask: 'Make sure the team is aligned, visible, and productive. And loop me in.',
};

/**
 * Meeting catalog. `impact` values are applied if scheduled.
 * KPIs are scaled small per-meeting; total day impact is a sum.
 */
export const MEETING_TYPES: Record<string, MeetingType> = {
  standup: {
    id: 'standup',
    title: 'Team Standup',
    durationMin: 30,
    attendees: 8,
    priority: 'recurring',
    emoji: '☕',
    impact: { alignment: +5, morale: -1, visibility: +2, productivity: -2 },
    flavor: 'Everyone says what they did yesterday. Nobody listens.',
  },
  'project-kickoff': {
    id: 'project-kickoff',
    title: 'Project Kickoff',
    durationMin: 60,
    attendees: 6,
    priority: 'high',
    emoji: '🚀',
    impact: { alignment: +8, visibility: +4, productivity: -3, burnout: +2 },
    flavor: 'A 60-minute meeting to align on a project that started two weeks ago.',
  },
  '1on1': {
    id: '1on1',
    title: '1:1 with Manager',
    durationMin: 30,
    attendees: 2,
    priority: 'medium',
    emoji: '🤝',
    impact: { morale: +4, executiveConfidence: +3, productivity: -1 },
    flavor: 'A safe space to discuss your "growth areas".',
  },
  'stakeholder-sync': {
    id: 'stakeholder-sync',
    title: 'Stakeholder Sync',
    durationMin: 60,
    attendees: 5,
    priority: 'high',
    emoji: '🧭',
    impact: { alignment: +6, visibility: +6, executiveConfidence: +4, productivity: -4, burnout: +2 },
    flavor: 'Five people. Three opinions. Zero decisions.',
  },
  'town-hall': {
    id: 'town-hall',
    title: 'Town Hall',
    durationMin: 60,
    attendees: 23,
    priority: 'high',
    emoji: '🏛️',
    impact: { visibility: +12, alignment: +3, morale: -3, productivity: -6, burnout: +3 },
    flavor: 'All-hands. Mandatory enthusiasm.',
  },
  'strategy-offsite': {
    id: 'strategy-offsite',
    title: 'Strategy Offsite',
    durationMin: 120,
    attendees: 12,
    priority: 'high',
    emoji: '🌄',
    impact: { executiveConfidence: +10, visibility: +6, alignment: +5, productivity: -10, burnout: +4 },
    flavor: 'A 2-hour strategy session that produces a 4-quadrant matrix.',
  },
  'budget-review': {
    id: 'budget-review',
    title: 'Budget Review',
    durationMin: 60,
    attendees: 7,
    priority: 'medium',
    emoji: '💰',
    impact: { executiveConfidence: +5, alignment: +2, morale: -2, productivity: -3 },
    flavor: 'A spreadsheet so beautiful it hides the truth.',
  },
  'all-hands': {
    id: 'all-hands',
    title: 'All Hands (Mandatory Fun)',
    durationMin: 60,
    attendees: 23,
    priority: 'optional',
    emoji: '🎉',
    impact: { visibility: +8, morale: -4, productivity: -5, burnout: +3 },
    flavor: 'Camera-on policy strictly enforced.',
  },
  'pre-read-sync': {
    id: 'pre-read-sync',
    title: 'Pre-read Alignment',
    durationMin: 30,
    attendees: 4,
    priority: 'recurring',
    emoji: '📑',
    impact: { alignment: +6, productivity: -2, burnout: +1 },
    flavor: 'A meeting to align on the document we will read before the next meeting.',
  },
  retro: {
    id: 'retro',
    title: 'Sprint Retrospective',
    durationMin: 60,
    attendees: 8,
    priority: 'recurring',
    emoji: '🪞',
    impact: { alignment: +4, morale: +3, productivity: -3, burnout: +1 },
    flavor: 'Three sticky notes that say "communication".',
  },
  'okr-checkin': {
    id: 'okr-checkin',
    title: 'OKR Check-in',
    durationMin: 60,
    attendees: 9,
    priority: 'high',
    emoji: '🎯',
    impact: { alignment: +7, executiveConfidence: +5, visibility: +4, productivity: -4, burnout: +2 },
    flavor: 'Where stretch goals come to be politely rephrased.',
  },
  'design-review': {
    id: 'design-review',
    title: 'Design Review',
    durationMin: 45,
    attendees: 6,
    priority: 'medium',
    emoji: '🎨',
    impact: { alignment: +4, morale: +2, productivity: -3 },
    flavor: 'Bikeshed Olympics, sponsored by Figma.',
  },
  'eng-escalation': {
    id: 'eng-escalation',
    title: 'Engineering Escalation',
    durationMin: 60,
    attendees: 5,
    priority: 'crisis',
    emoji: '🚨',
    impact: { productivity: -6, alignment: +3, executiveConfidence: +8, burnout: +5, morale: -3 },
    flavor: 'Production is fine. The meeting about production is not.',
  },
  'culture-sync': {
    id: 'culture-sync',
    title: 'Culture Sync',
    durationMin: 45,
    attendees: 14,
    priority: 'optional',
    emoji: '🌱',
    impact: { morale: +5, visibility: +3, productivity: -3, burnout: +1 },
    flavor: 'Topic: are we still a family. Answer: legally, no.',
  },
  'pr-cleanup': {
    id: 'pr-cleanup',
    title: 'PR Statement Drafting',
    durationMin: 60,
    attendees: 7,
    priority: 'crisis',
    emoji: '🧯',
    impact: { executiveConfidence: +10, visibility: +5, productivity: -8, burnout: +4, morale: -3 },
    flavor: 'Someone tweeted. Lawyers are involved.',
  },
};

/**
 * Per-day open requests. Days beyond what's defined will fall back to the last day's
 * pool with a different prefix.
 */
export const REQUEST_POOL: Record<number, MeetingRequest[]> = {
  1: [
    { uid: 'd1-r1', typeId: 'standup', from: 'Engineering', note: 'Recurring. Cannot be avoided.' },
    { uid: 'd1-r2', typeId: 'project-kickoff', from: 'Product', note: 'Kicking off the Q3 synergy engine.' },
    { uid: 'd1-r3', typeId: '1on1', from: 'Your Boss', note: 'Wants to "check in" before lunch.' },
    { uid: 'd1-r4', typeId: 'stakeholder-sync', from: 'Sales', note: 'Just for visibility. Promise.' },
    { uid: 'd1-r5', typeId: 'town-hall', from: 'CEO', note: 'You will be expected to smile.' },
    { uid: 'd1-r6', typeId: 'all-hands', from: 'HR', note: 'Mandatory fun. Cameras on.' },
  ],
  2: [
    { uid: 'd2-r1', typeId: 'standup', from: 'Engineering', note: 'Still recurring. Still cannot be avoided.' },
    { uid: 'd2-r2', typeId: 'pre-read-sync', from: 'Strategy', note: 'Required reading before tomorrow’s reading.' },
    { uid: 'd2-r3', typeId: 'design-review', from: 'Design', note: 'Bring opinions. Or just nod.' },
    { uid: 'd2-r4', typeId: 'budget-review', from: 'Finance', note: 'Q3 burn looks "interesting".' },
    { uid: 'd2-r5', typeId: 'okr-checkin', from: 'VP Strategy', note: 'How are we tracking against fictional goals?' },
    { uid: 'd2-r6', typeId: 'stakeholder-sync', from: 'Marketing', note: 'Brand-aligning the alignment.' },
  ],
  3: [
    { uid: 'd3-r1', typeId: 'standup', from: 'Engineering', note: 'Day 3 of the standup. Some questions emerging.' },
    { uid: 'd3-r2', typeId: 'retro', from: 'Engineering', note: 'Three sticky notes. All say "comms".' },
    { uid: 'd3-r3', typeId: 'eng-escalation', from: 'CTO', note: 'Prod is fine. He is not.' },
    { uid: 'd3-r4', typeId: 'culture-sync', from: 'People Ops', note: 'How are we *feeling*?' },
    { uid: 'd3-r5', typeId: 'stakeholder-sync', from: 'Customer Success', note: 'Re-aligning on the realignment.' },
    { uid: 'd3-r6', typeId: 'all-hands', from: 'CEO', note: '"Brief" update. Cameras on.' },
  ],
  4: [
    { uid: 'd4-r1', typeId: 'standup', from: 'Engineering', note: 'Someone asked to skip. Tension rising.' },
    { uid: 'd4-r2', typeId: 'okr-checkin', from: 'VP Strategy', note: 'Mid-quarter "honest" check-in.' },
    { uid: 'd4-r3', typeId: 'pr-cleanup', from: 'Legal', note: 'A VP tweeted. We need words.' },
    { uid: 'd4-r4', typeId: 'town-hall', from: 'CEO', note: 'Will address "the thing" briefly.' },
    { uid: 'd4-r5', typeId: '1on1', from: 'Your Boss', note: '"Just a sync." It is never just a sync.' },
    { uid: 'd4-r6', typeId: 'design-review', from: 'Design', note: 'Re-reviewing last week’s review.' },
  ],
  5: [
    { uid: 'd5-r1', typeId: 'standup', from: 'Engineering', note: 'Friday standup. Pure ritual now.' },
    { uid: 'd5-r2', typeId: 'strategy-offsite', from: 'Leadership', note: 'Two hours. Four-quadrant matrix incoming.' },
    { uid: 'd5-r3', typeId: 'retro', from: 'Product', note: 'Week retro. Bring your "growth mindset".' },
    { uid: 'd5-r4', typeId: 'all-hands', from: 'CEO', note: 'Weekly closer. Possibly an announcement.' },
    { uid: 'd5-r5', typeId: 'culture-sync', from: 'HR', note: 'Mandatory cake. Mandatory enthusiasm.' },
    { uid: 'd5-r6', typeId: 'budget-review', from: 'CFO', note: 'Reviewing what the review revealed.' },
  ],
};

export function requestsForDay(day: number): MeetingRequest[] {
  const max = Math.max(...Object.keys(REQUEST_POOL).map((k) => parseInt(k, 10)));
  if (REQUEST_POOL[day]) return REQUEST_POOL[day];
  // For days beyond, re-shuffle the last day's pool with a new uid prefix.
  return REQUEST_POOL[max].map((r) => ({ ...r, uid: `d${day}-${r.uid.split('-').pop()}` }));
}

/** Back-compat alias used in a few imports. */
export const DAY1_REQUESTS = REQUEST_POOL[1];

/**
 * Chaos events — random corporate disasters that interrupt Plan Day.
 * Player picks one of three responses, each with different KPI impact.
 */
export const CHAOS_EVENTS: ChaosEvent[] = [
  {
    id: 'ceo-quick-sync',
    emoji: '⚡',
    title: 'CEO Added a "Quick Sync"',
    fromWho: 'CEO',
    durationMin: 45,
    attendees: 'Everyone',
    flavor: 'It cannot wait. It also has no agenda.',
    attendImpact: { productivity: -12, morale: -4, executiveConfidence: +8, visibility: +6, burnout: +3 },
    delegateImpact: { productivity: -2, morale: +1, executiveConfidence: -6, visibility: -2 },
    rescheduleImpact: { productivity: +3, morale: +2, executiveConfidence: -10, visibility: -3 },
  },
  {
    id: 'reply-all-storm',
    emoji: '📧',
    title: 'Reply-All Storm',
    fromWho: '47 colleagues',
    durationMin: 30,
    attendees: 'Mostly bystanders',
    flavor: 'Someone hit Reply All on a calendar invite. It is escalating.',
    attendImpact: { productivity: -8, morale: -6, visibility: +3, burnout: +4 },
    delegateImpact: { productivity: -1, morale: -2, alignment: -3 },
    rescheduleImpact: { productivity: 0, morale: -3, alignment: -4 },
  },
  {
    id: 'mandatory-fun',
    emoji: '🎉',
    title: 'Mandatory Fun Friday',
    fromWho: 'HR',
    durationMin: 60,
    attendees: 'All employees',
    flavor: 'Camera-on policy. Costume optional but encouraged.',
    attendImpact: { productivity: -6, morale: -5, visibility: +10, burnout: +2 },
    delegateImpact: { productivity: -1, morale: +2, visibility: -1 },
    rescheduleImpact: { productivity: +2, morale: +4, visibility: -4, executiveConfidence: -3 },
  },
  {
    id: 'linkedin-post',
    emoji: '🤳',
    title: 'Executive Read One LinkedIn Post',
    fromWho: 'VP Strategy',
    durationMin: 45,
    attendees: '12 reluctant leads',
    flavor: 'Wants to "explore AI-native synergy" by EOW.',
    attendImpact: { productivity: -10, alignment: -2, executiveConfidence: +6, visibility: +4 },
    delegateImpact: { productivity: -2, executiveConfidence: -3, alignment: -2 },
    rescheduleImpact: { productivity: +2, executiveConfidence: -6, visibility: -3 },
  },
];

/** Stage 1 quarterly goals — visible on Overview as progress bars. */
export const STAGE1_GOALS: QuarterlyGoal[] = [
  { id: 'g-boss',       label: 'Keep the Boss Happy',     stakeholderId: 'boss', emoji: '', target: 70 },
  { id: 'g-alignment',  label: 'Improve Alignment',       kpi: 'alignment',      emoji: '🧭', target: 60 },
  { id: 'g-visibility', label: 'Increase Visibility',     kpi: 'visibility',     emoji: '👁️', target: 55 },
  { id: 'g-burnout',    label: 'Keep Burnout Sustainable', kpi: 'burnout',       emoji: '🔥', target: 60, lowerIsBetter: true },
  { id: 'g-confidence', label: 'Win the Strategy Award',  kpi: 'executiveConfidence', emoji: '🏆', target: 65 },
];

/** Boss feedback rules — picked by KPI delta scoring after Day 1. */
export const BOSS_FEEDBACK_RULES: Array<{
  match: (delta: Partial<Record<string, number>>, held: number) => boolean;
  emoji: string;
  text: string;
}> = [
  {
    match: (_d, held) => held === 0,
    emoji: '😐',
    text: 'You held no meetings today. Bold. Possibly career-limiting.',
  },
  {
    match: (_d, held) => held >= 6,
    emoji: '🤩',
    text: 'Now THIS is what visibility looks like. Burnout is a feature, not a bug.',
  },
  {
    match: (d) => (d.alignment ?? 0) >= 15 && (d.visibility ?? 0) >= 10,
    emoji: '🙂',
    text: 'Good start. Make sure to keep everyone in the loop. Always.',
  },
  {
    match: (d) => (d.morale ?? 0) <= -8,
    emoji: '😬',
    text: 'The team seems… tired. Have you considered another all-hands?',
  },
  {
    match: () => true,
    emoji: '🙂',
    text: 'Promising start. Let’s circle back tomorrow on the circling-back cadence.',
  },
];
