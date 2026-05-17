import type { ChaosEvent, MeetingType, MeetingRequest, QuarterlyGoal, StageId } from './types';

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

  // ── Stage 2 mechanics ──────────────────────────────────────────────────────
  'shield-meeting': {
    id: 'shield-meeting',
    title: 'Focus Time (Blocked)',
    durationMin: 60,
    attendees: 1,
    priority: 'low',
    emoji: '🛡️',
    // Purely defensive: pay one accept slot, take no relationship hit,
    // and let the team actually work.
    impact: { productivity: +6, morale: +2, burnout: -3 },
    flavor: 'You blocked your own calendar. Revolutionary.',
  },
  'board-pre-read': {
    id: 'board-pre-read',
    title: 'Board Pre-read Prep',
    durationMin: 90,
    attendees: 4,
    priority: 'high',
    emoji: '📑',
    impact: { executiveConfidence: +8, visibility: +6, productivity: -6, burnout: +4, morale: -2 },
    flavor: 'Reading a deck about reading a deck.',
  },
  'quarterly-review': {
    id: 'quarterly-review',
    title: 'Quarterly Business Review',
    durationMin: 90,
    attendees: 10,
    priority: 'high',
    emoji: '📊',
    impact: { visibility: +10, executiveConfidence: +6, alignment: +3, productivity: -7, burnout: +3 },
    flavor: 'Where last quarter\'s reality meets next quarter\'s story.',
  },
  'reorg-meeting': {
    id: 'reorg-meeting',
    title: 'Reorg Announcement',
    durationMin: 60,
    attendees: 23,
    priority: 'crisis',
    emoji: '🌀',
    impact: { visibility: +4, alignment: -6, morale: -8, executiveConfidence: -3, burnout: +5 },
    flavor: 'New boxes on the org chart. Same people inside them. Maybe.',
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

  // ── Stage 2 (Days 6-10) — 8 requests/day, accept cap 4. Forced rejection.
  //    Cast leans on CEO / CFO / CTO with board-prep + QBR pressure.
  6: [
    { uid: 'd6-r1', typeId: 'standup', from: 'Engineering', note: 'Monday standup. Half the team is "WFH".' },
    { uid: 'd6-r2', typeId: 'board-pre-read', from: 'CFO', note: 'Board reads on Thursday. Slides due tomorrow.' },
    { uid: 'd6-r3', typeId: 'quarterly-review', from: 'CEO', note: 'QBR prep. Numbers will be "contextualized".' },
    { uid: 'd6-r4', typeId: 'eng-escalation', from: 'CTO', note: 'Prod is fine. Raj is not. He needs an hour.' },
    { uid: 'd6-r5', typeId: 'okr-checkin', from: 'VP Strategy', note: 'Mid-quarter pulse. "Aspirational" targets being trimmed.' },
    { uid: 'd6-r6', typeId: '1on1', from: 'Your Boss', note: 'Monday check-in. Word "alignment" expected 4+ times.' },
    { uid: 'd6-r7', typeId: 'all-hands', from: 'HR', note: 'Mandatory. New benefits announcement (it is one benefit).' },
    { uid: 'd6-r8', typeId: 'culture-sync', from: 'People Ops', note: 'Post-weekend vibes check. Pre-reorg jitters.' },
  ],
  7: [
    { uid: 'd7-r1', typeId: 'standup', from: 'Engineering', note: 'Tuesday. Someone wrote "no blockers" again.' },
    { uid: 'd7-r2', typeId: 'budget-review', from: 'CFO', note: 'Spend is "interesting". Diana wants explanations.' },
    { uid: 'd7-r3', typeId: 'pre-read-sync', from: 'Strategy', note: 'Pre-reading the pre-read for the board pre-read.' },
    { uid: 'd7-r4', typeId: 'design-review', from: 'Design', note: 'New onboarding flow. Bring tasteful opinions.' },
    { uid: 'd7-r5', typeId: 'stakeholder-sync', from: 'Sales', note: 'Pat L. wants "5 min". It will be 45.' },
    { uid: 'd7-r6', typeId: 'retro', from: 'Engineering', note: 'Three stickies. Two say "comms". One says "?".' },
    { uid: 'd7-r7', typeId: 'board-pre-read', from: 'CFO', note: 'Round 2. Slides "need work".' },
    { uid: 'd7-r8', typeId: 'town-hall', from: 'CEO', note: 'All-hands tomorrow needs a warm-up town hall today.' },
  ],
  8: [
    { uid: 'd8-r1', typeId: 'standup', from: 'Engineering', note: 'Wednesday. Standup energy: declining.' },
    { uid: 'd8-r2', typeId: 'quarterly-review', from: 'CEO', note: 'QBR day. Slide 12 needs you specifically.' },
    { uid: 'd8-r3', typeId: 'pr-cleanup', from: 'Legal', note: 'CEO previewed numbers on a podcast. Lawyers calling.' },
    { uid: 'd8-r4', typeId: 'eng-escalation', from: 'CTO', note: 'Raj is now "concerned about velocity". Hour minimum.' },
    { uid: 'd8-r5', typeId: 'okr-checkin', from: 'VP Strategy', note: 'OKRs are now KORs. They sound better.' },
    { uid: 'd8-r6', typeId: 'strategy-offsite', from: 'Leadership', note: 'Surprise offsite added. 2 hours. Lunch included.' },
    { uid: 'd8-r7', typeId: '1on1', from: 'Your Boss', note: '"Just a vibe check." It will not be.' },
    { uid: 'd8-r8', typeId: 'all-hands', from: 'CEO', note: 'QBR readout. Cameras on, enthusiasm mandatory.' },
  ],
  9: [
    { uid: 'd9-r1', typeId: 'standup', from: 'Engineering', note: 'Thursday standup. Riya skipped. Tension.' },
    { uid: 'd9-r2', typeId: 'project-kickoff', from: 'Product', note: 'Q4 initiative. Already 2 weeks late.' },
    { uid: 'd9-r3', typeId: 'budget-review', from: 'CFO', note: 'Re-reviewing yesterday\'s review. Numbers changed.' },
    { uid: 'd9-r4', typeId: 'retro', from: 'Engineering', note: 'Weekly retro. "More retros" suggested unironically.' },
    { uid: 'd9-r5', typeId: 'board-pre-read', from: 'CFO', note: 'Final round. Board reads in 24 hours.' },
    { uid: 'd9-r6', typeId: 'culture-sync', from: 'HR', note: 'Reorg rumors discussed at the coffee machine.' },
    { uid: 'd9-r7', typeId: 'town-hall', from: 'CEO', note: 'Town hall tomorrow. CEO "has news".' },
    { uid: 'd9-r8', typeId: 'stakeholder-sync', from: 'Marketing', note: 'Brand re-aligning around the realignment.' },
  ],
  10: [
    { uid: 'd10-r1', typeId: 'standup', from: 'Engineering', note: 'Friday standup. Friday energy: nonexistent.' },
    { uid: 'd10-r2', typeId: 'all-hands', from: 'CEO', note: 'Week-closer. Possibly a reorg announcement.' },
    { uid: 'd10-r3', typeId: 'retro', from: 'Product', note: 'Week retro. Bring resilience.' },
    { uid: 'd10-r4', typeId: 'eng-escalation', from: 'CTO', note: 'Same prod issue, new name.' },
    { uid: 'd10-r5', typeId: 'quarterly-review', from: 'CFO', note: 'QBR debrief. Diana has notes.' },
    { uid: 'd10-r6', typeId: 'strategy-offsite', from: 'Leadership', note: 'Reorg planning offsite. Hush-hush.' },
    { uid: 'd10-r7', typeId: 'board-pre-read', from: 'CFO', note: 'Weekend reading. Diana said "thanks in advance".' },
    { uid: 'd10-r8', typeId: 'culture-sync', from: 'HR', note: 'Mandatory cake. Possibly farewell cake.' },
  ],

  // ── Stage 3 (Days 11-15) — Bureaucracy. Same 8/day pace, but ~2 of every
  //    8 requests carry an Approval Chain (needs 3 of 5 leaders to sign off
  //    before you can even accept). The waiting itself is the cost.
  11: [
    { uid: 'd11-r1', typeId: 'standup', from: 'Engineering', note: 'Monday standup. New OKR season. Nobody is ready.' },
    { uid: 'd11-r2', typeId: 'project-kickoff', from: 'Product', note: 'Q4 platform refresh. Needs leadership sign-off.',
      approvers: ['cfo', 'cto', 'vp_strategy', 'ceo', 'boss'], requiresApprovals: 3 },
    { uid: 'd11-r3', typeId: 'budget-review', from: 'CFO', note: 'Q4 headcount conversation. Diana brought a calculator.' },
    { uid: 'd11-r4', typeId: 'okr-checkin', from: 'VP Strategy', note: 'New "stretch" KORs being introduced.' },
    { uid: 'd11-r5', typeId: 'stakeholder-sync', from: 'Sales', note: 'Pat wants alignment on the realigned alignment.' },
    { uid: 'd11-r6', typeId: 'eng-escalation', from: 'CTO', note: 'Raj is escalating about escalations.' },
    { uid: 'd11-r7', typeId: 'culture-sync', from: 'People Ops', note: 'Post-reorg vibes audit. Bring optimism.' },
    { uid: 'd11-r8', typeId: 'strategy-offsite', from: 'Leadership', note: 'Off-cycle strategy reset. Approval required.',
      approvers: ['ceo', 'cfo', 'cto', 'vp_strategy', 'chro'], requiresApprovals: 3 },
  ],
  12: [
    { uid: 'd12-r1', typeId: 'standup', from: 'Engineering', note: 'Tuesday. Two new acronyms introduced overnight.' },
    { uid: 'd12-r2', typeId: 'design-review', from: 'Design', note: 'Onboarding flow v3. v2 was approved yesterday.' },
    { uid: 'd12-r3', typeId: 'budget-review', from: 'CFO', note: 'Re-review of the budget review. Diana found a row.',
      approvers: ['cfo', 'ceo', 'boss', 'vp_strategy', 'cto'], requiresApprovals: 3 },
    { uid: 'd12-r4', typeId: 'pre-read-sync', from: 'Strategy', note: 'Pre-reading the deck about the previous pre-read.' },
    { uid: 'd12-r5', typeId: 'town-hall', from: 'CEO', note: 'Marcus wants to "address the room".' },
    { uid: 'd12-r6', typeId: 'retro', from: 'Engineering', note: 'Three stickies. All say "approvals".' },
    { uid: 'd12-r7', typeId: '1on1', from: 'Your Boss', note: 'David has feedback. Possibly career feedback.' },
    { uid: 'd12-r8', typeId: 'pr-cleanup', from: 'Legal', note: 'A VP forwarded a tweet. Lawyers want a sync.' },
  ],
  13: [
    { uid: 'd13-r1', typeId: 'standup', from: 'Engineering', note: 'Wednesday. Standup ran 45 minutes yesterday.' },
    { uid: 'd13-r2', typeId: 'okr-checkin', from: 'VP Strategy', note: 'KORs are now OKR-Rs. Rolling rebrand.' },
    { uid: 'd13-r3', typeId: 'stakeholder-sync', from: 'Marketing', note: 'Cross-functional sync. Needs three sign-offs.',
      approvers: ['vp_strategy', 'cfo', 'cto', 'ceo', 'chro'], requiresApprovals: 3 },
    { uid: 'd13-r4', typeId: 'eng-escalation', from: 'CTO', note: 'Raj filed a meta-escalation about the escalation process.' },
    { uid: 'd13-r5', typeId: 'budget-review', from: 'CFO', note: 'Headcount freeze briefing. Cameras off.' },
    { uid: 'd13-r6', typeId: 'culture-sync', from: 'HR', note: 'Survey results came back. They are "interesting".' },
    { uid: 'd13-r7', typeId: 'town-hall', from: 'CEO', note: 'Mid-week alignment. Mandatory smiling.' },
    { uid: 'd13-r8', typeId: 'pre-read-sync', from: 'Strategy', note: 'Sync about a doc nobody read yet.' },
  ],
  14: [
    { uid: 'd14-r1', typeId: 'standup', from: 'Engineering', note: 'Thursday. Riya muted herself permanently.' },
    { uid: 'd14-r2', typeId: 'project-kickoff', from: 'Product', note: 'New initiative. Needs broad sign-off.',
      approvers: ['ceo', 'cfo', 'cto', 'vp_strategy', 'boss'], requiresApprovals: 3 },
    { uid: 'd14-r3', typeId: 'budget-review', from: 'CFO', note: 'Diana has produced a spreadsheet of spreadsheets.' },
    { uid: 'd14-r4', typeId: 'retro', from: 'Product', note: 'Retro about retros. Recursion intended.' },
    { uid: 'd14-r5', typeId: 'stakeholder-sync', from: 'Sales', note: 'Sales wants pipeline alignment. Again.' },
    { uid: 'd14-r6', typeId: 'design-review', from: 'Design', note: 'Same flow, slightly bluer shadows.' },
    { uid: 'd14-r7', typeId: 'okr-checkin', from: 'VP Strategy', note: 'Tom rebranded "stretch" to "ambitious".' },
    { uid: 'd14-r8', typeId: 'eng-escalation', from: 'CTO', note: 'Process is now an incident.' },
  ],
  15: [
    { uid: 'd15-r1', typeId: 'standup', from: 'Engineering', note: 'Friday. Standup has been replaced with silence.' },
    { uid: 'd15-r2', typeId: 'all-hands', from: 'CEO', note: 'Week-closer. Probably a process announcement.' },
    { uid: 'd15-r3', typeId: 'quarterly-review', from: 'CFO', note: 'Mid-Q deep-dive. Diana brought a deck of decks.',
      approvers: ['cfo', 'ceo', 'vp_strategy', 'cto', 'boss'], requiresApprovals: 3 },
    { uid: 'd15-r4', typeId: 'pr-cleanup', from: 'Legal', note: 'Someone summarized the reorg incorrectly externally.' },
    { uid: 'd15-r5', typeId: 'retro', from: 'Engineering', note: 'Sprint retro. Three sticky notes about sticky notes.' },
    { uid: 'd15-r6', typeId: 'strategy-offsite', from: 'Leadership', note: 'Off-cycle planning. Approval required.',
      approvers: ['ceo', 'cfo', 'cto', 'vp_strategy', 'chro'], requiresApprovals: 3 },
    { uid: 'd15-r7', typeId: 'town-hall', from: 'CEO', note: 'Quarterly close. Marcus prepared remarks.' },
    { uid: 'd15-r8', typeId: 'culture-sync', from: 'HR', note: 'End-of-week vibes. Optional but observed.' },
  ],

  // ── Stage 4 (Days 16-20) — Corporate Madness. The org chart eats itself.
  //    Boss + CEO under constant pressure (PR Disaster watching for both <50).
  //    Day 20 = Board Sync climax. Approval chains continue. Alliances matter.
  16: [
    { uid: 'd16-r1', typeId: 'standup', from: 'Engineering', note: 'Monday. Riya is "exploring opportunities".' },
    { uid: 'd16-r2', typeId: 'strategy-offsite', from: 'Leadership', note: 'Pre-Board strategy session. Approval chain attached.',
      approvers: ['ceo', 'cfo', 'cto', 'vp_strategy', 'chro'], requiresApprovals: 3 },
    { uid: 'd16-r3', typeId: 'board-pre-read', from: 'CFO', note: 'Board reads on Friday. Drafts due now.' },
    { uid: 'd16-r4', typeId: 'eng-escalation', from: 'CTO', note: 'Raj wants a "feud-resolution meeting" with Tom.' },
    { uid: 'd16-r5', typeId: 'okr-checkin', from: 'VP Strategy', note: 'Tom is preparing a slide for the board himself.' },
    { uid: 'd16-r6', typeId: '1on1', from: 'Your Boss', note: 'David needs a candid sync. (It is never candid.)' },
    { uid: 'd16-r7', typeId: 'pr-cleanup', from: 'Legal', note: 'CEO posted on LinkedIn again. Lawyers convening.' },
    { uid: 'd16-r8', typeId: 'culture-sync', from: 'People Ops', note: 'Survey results trending "concerning".' },
  ],
  17: [
    { uid: 'd17-r1', typeId: 'standup', from: 'Engineering', note: 'Tuesday. Half the team is in "interview prep" mode.' },
    { uid: 'd17-r2', typeId: 'quarterly-review', from: 'CEO', note: 'Marcus wants a polished QBR for the board.',
      approvers: ['ceo', 'cfo', 'vp_strategy', 'boss', 'cto'], requiresApprovals: 3 },
    { uid: 'd17-r3', typeId: 'board-pre-read', from: 'CFO', note: 'Board materials v2. Diana flagged 14 items.' },
    { uid: 'd17-r4', typeId: 'town-hall', from: 'CEO', note: 'Pre-Board "pulse". Cameras on.' },
    { uid: 'd17-r5', typeId: 'design-review', from: 'Design', note: 'New board-deck visual identity. Three rounds in.' },
    { uid: 'd17-r6', typeId: 'budget-review', from: 'CFO', note: 'Diana is asking about "the gap".' },
    { uid: 'd17-r7', typeId: 'eng-escalation', from: 'CTO', note: 'Raj wants the no-meetings policy ratified.' },
    { uid: 'd17-r8', typeId: 'stakeholder-sync', from: 'Marketing', note: 'Press strategy for the post-Board narrative.' },
  ],
  18: [
    { uid: 'd18-r1', typeId: 'standup', from: 'Engineering', note: 'Wednesday. Marcus W. submitted resignation. (Reconsidered after lunch.)' },
    { uid: 'd18-r2', typeId: 'project-kickoff', from: 'Product', note: 'Board-mandated "AI Initiative". Sign-offs in motion.',
      approvers: ['ceo', 'cto', 'cfo', 'vp_strategy', 'boss'], requiresApprovals: 3 },
    { uid: 'd18-r3', typeId: 'pr-cleanup', from: 'Legal', note: 'Pre-Board press statement drafting.' },
    { uid: 'd18-r4', typeId: 'retro', from: 'Engineering', note: 'Mid-week retro about retros about retros.' },
    { uid: 'd18-r5', typeId: 'board-pre-read', from: 'CFO', note: 'Final round. Diana sleeping in office.' },
    { uid: 'd18-r6', typeId: 'culture-sync', from: 'HR', note: 'Wellness check ahead of Board scrutiny.' },
    { uid: 'd18-r7', typeId: 'town-hall', from: 'CEO', note: 'Marcus wants energy rehearsed before Friday.' },
    { uid: 'd18-r8', typeId: 'strategy-offsite', from: 'Leadership', note: 'Final pre-Board alignment. All hands on deck.',
      approvers: ['ceo', 'cfo', 'cto', 'vp_strategy', 'chro'], requiresApprovals: 3 },
  ],
  19: [
    { uid: 'd19-r1', typeId: 'standup', from: 'Engineering', note: 'Thursday. Standup is now async (by force, not choice).' },
    { uid: 'd19-r2', typeId: 'board-pre-read', from: 'CFO', note: 'Last-minute corrections. Diana in command mode.' },
    { uid: 'd19-r3', typeId: 'quarterly-review', from: 'CEO', note: 'Dry run of the Board QBR.' },
    { uid: 'd19-r4', typeId: 'eng-escalation', from: 'CTO', note: 'Raj wants engineering excluded from Board scrutiny.' },
    { uid: 'd19-r5', typeId: '1on1', from: 'Your Boss', note: 'David wants pre-Board reassurance. He sounds nervous.' },
    { uid: 'd19-r6', typeId: 'pr-cleanup', from: 'Legal', note: 'Final press statement. Three lawyers, four opinions.' },
    { uid: 'd19-r7', typeId: 'town-hall', from: 'CEO', note: 'Pre-Board pep talk. Mandatory smiling.' },
    { uid: 'd19-r8', typeId: 'okr-checkin', from: 'VP Strategy', note: 'Tom rebranded KORs as "Board Reportable Outcomes" (BROs).' },
  ],
  20: [
    { uid: 'd20-r1', typeId: 'standup', from: 'Engineering', note: 'Friday. Board day. Skeleton crew on standup.' },
    { uid: 'd20-r2', typeId: 'all-hands', from: 'CEO', note: 'Pre-Board rally. Then radio silence until 4 PM.' },
    { uid: 'd20-r3', typeId: 'board-pre-read', from: 'CFO', note: 'Final-final-FINAL revision. Diana is a ghost.' },
    { uid: 'd20-r4', typeId: 'pr-cleanup', from: 'Legal', note: 'Post-Board press strategy. Cameras may be present.' },
    { uid: 'd20-r5', typeId: 'culture-sync', from: 'HR', note: 'Post-Board "decompression" session. Pre-loaded with snacks.' },
    { uid: 'd20-r6', typeId: 'quarterly-review', from: 'CEO', note: 'Post-Board recap with leadership.',
      approvers: ['ceo', 'cfo', 'vp_strategy', 'boss', 'cto'], requiresApprovals: 3 },
    { uid: 'd20-r7', typeId: 'town-hall', from: 'CEO', note: 'Post-Board town hall. "We are aligned."' },
    { uid: 'd20-r8', typeId: 'retro', from: 'Product', note: 'Stage retro. Reflect on the bureaucracy you endured.' },
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

  // ── Stage 2 chaos events ────────────────────────────────────────────────
  {
    id: 'reorg-announce',
    emoji: '🌀',
    title: 'Reorg Announced at All-Hands',
    fromWho: 'CEO',
    durationMin: 60,
    attendees: 'Whole company',
    flavor: 'Teams are being "realigned". Boxes on the org chart are shuffling. Your name is on a slide.',
    // Attending is mandatory politics; declining is career-ending. All paths
    // hurt — the question is who you hurt and how much.
    attendImpact: { morale: -8, alignment: -6, executiveConfidence: +6, visibility: +5, burnout: +4 },
    delegateImpact: { morale: -4, alignment: -8, executiveConfidence: -12, visibility: -4 },
    rescheduleImpact: { morale: -6, alignment: -10, executiveConfidence: -18, visibility: -6 },
  },
  {
    id: 'quarterly-surprise',
    emoji: '📊',
    title: 'CEO: "QBR Slides by EOD?"',
    fromWho: 'CEO',
    durationMin: 60,
    attendees: 'You, alone, in a doc',
    flavor: 'Marcus wants a "punchy" deck for the board call he just remembered.',
    attendImpact: { visibility: +10, executiveConfidence: +8, productivity: -8, burnout: +5, morale: -3 },
    delegateImpact: { visibility: -2, executiveConfidence: -8, productivity: +2, morale: +1 },
    rescheduleImpact: { visibility: -5, executiveConfidence: -12, alignment: -3, morale: +2 },
  },
  {
    id: 'two-town-halls',
    emoji: '🏛️',
    title: 'Two Town Halls. Both Mandatory.',
    fromWho: 'CEO & CHRO',
    durationMin: 90,
    attendees: 'Everyone, twice',
    flavor: 'CEO scheduled one. CHRO scheduled one. Neither knew. Both are "non-negotiable".',
    attendImpact: { visibility: +12, productivity: -12, morale: -6, burnout: +6 },
    delegateImpact: { visibility: -3, executiveConfidence: -6, morale: +2 },
    rescheduleImpact: { visibility: -6, executiveConfidence: -10, alignment: -4, morale: +3 },
  },

  // ── Stage 3 chaos events ────────────────────────────────────────────────
  {
    id: 'cfo-blocks-budget',
    emoji: '🧾',
    title: 'CFO Froze Your Spend',
    fromWho: 'CFO',
    durationMin: 60,
    attendees: 'You, Diana, a spreadsheet',
    flavor: 'Diana put a hold on your initiative until you "walk her through the model".',
    attendImpact: { executiveConfidence: +6, productivity: -10, burnout: +4, morale: -3 },
    delegateImpact: { executiveConfidence: -8, alignment: -3, productivity: -2 },
    rescheduleImpact: { executiveConfidence: -12, visibility: -4, alignment: -3 },
  },
  {
    id: 'cto-no-meeting-mondays',
    emoji: '🚫',
    title: 'CTO Started a "No Meeting Mondays" Thread',
    fromWho: 'CTO',
    durationMin: 30,
    attendees: '#engineering · loudly',
    flavor: 'Raj posted a manifesto in #engineering. People are reacting with 🔥 emoji.',
    attendImpact: { morale: +6, alignment: +4, executiveConfidence: -6, visibility: -3 },
    delegateImpact: { morale: -2, alignment: -3, productivity: -1 },
    rescheduleImpact: { morale: -4, alignment: -5, visibility: -2 },
  },
  {
    id: 'vp-quarterly-deepdive',
    emoji: '🔬',
    title: 'VP Wants a "Quarterly Deep Dive"',
    fromWho: 'VP Strategy',
    durationMin: 90,
    attendees: '8 reluctant leads',
    flavor: 'Tom wants 90 minutes on your area. He brought a framework. He always brings a framework.',
    attendImpact: { visibility: +10, executiveConfidence: +5, alignment: +3, productivity: -8, burnout: +4 },
    delegateImpact: { visibility: -3, alignment: -2, executiveConfidence: -4 },
    rescheduleImpact: { visibility: -6, executiveConfidence: -8, alignment: -3 },
  },

  // ── Stage 4 chaos events ────────────────────────────────────────────────
  {
    id: 'backchannel-cfo',
    emoji: '🤫',
    title: 'Diana Asks You to Slow-Walk Raj\'s Budget',
    fromWho: 'CFO',
    durationMin: 30,
    attendees: 'You + Diana, off the calendar',
    flavor: '"Just take your time getting back to him." She is not asking.',
    // Attend = play along (Diana ↑↑, but CTO will find out → relationship cost there too)
    // Delegate = polite no
    // Reschedule = pretend you missed it
    attendImpact: { executiveConfidence: +6, visibility: +3, alignment: -6, morale: -4 },
    delegateImpact: { executiveConfidence: -4, alignment: +2, morale: +2 },
    rescheduleImpact: { executiveConfidence: -8, alignment: +3, morale: +3 },
  },
  {
    id: 'feud-cto-vp',
    emoji: '⚔️',
    title: 'Raj and Tom Are Not Speaking',
    fromWho: 'CTO',
    durationMin: 45,
    attendees: 'You, the messenger',
    flavor: 'Raj filed a grievance about Tom\'s framework. Tom filed a counter-grievance. You are now the diplomat.',
    attendImpact: { alignment: +6, executiveConfidence: +4, productivity: -5, burnout: +3 },
    delegateImpact: { alignment: -5, executiveConfidence: -3 },
    rescheduleImpact: { alignment: -8, morale: -3, executiveConfidence: -5 },
  },
  {
    id: 'ceo-linkedin-disaster',
    emoji: '🤳',
    title: 'CEO Posted Something Concerning on LinkedIn',
    fromWho: 'CEO LinkedIn',
    durationMin: 60,
    attendees: 'You, Legal, PR',
    flavor: '"Real leaders don\'t need work-life balance. ⚡" Comments are on. Reply count: 312.',
    attendImpact: { executiveConfidence: +8, visibility: +6, productivity: -8, burnout: +5, morale: -5 },
    delegateImpact: { executiveConfidence: -6, visibility: -3, morale: -2 },
    rescheduleImpact: { executiveConfidence: -10, visibility: -6, morale: +2 },
  },
  {
    id: 'board-pre-read-rush',
    emoji: '📑',
    title: 'Board Wants Pre-Read by EOD',
    fromWho: 'CFO',
    durationMin: 90,
    attendees: 'You, alone, with a deck',
    flavor: 'Diana forwarded a Board email. The subject line is "URGENT". The body is also "URGENT".',
    attendImpact: { executiveConfidence: +10, visibility: +5, productivity: -10, burnout: +6 },
    delegateImpact: { executiveConfidence: -8, visibility: -3, productivity: -2 },
    rescheduleImpact: { executiveConfidence: -15, visibility: -5, alignment: -3 },
  },

  // ── Board Sync climax — Stage 4 Day 20. Force-fired at day start. The
  //    "attend" outcome is the only path forward; delegate/reschedule are
  //    career-ending choices the player CAN make for the joke.
  {
    id: 'board-sync',
    emoji: '🏛️',
    title: 'The Board Sync',
    fromWho: 'Board Chair',
    durationMin: 120,
    attendees: '7 Board members, all of leadership',
    flavor: '"Walk us through the quarter." Marcus is sweating. Diana has rehearsed her slide twelve times. You have one shot.',
    attendImpact: { executiveConfidence: +15, visibility: +12, alignment: +4, productivity: -12, burnout: +8 },
    delegateImpact: { executiveConfidence: -25, visibility: -10, alignment: -8, morale: -4 },
    rescheduleImpact: { executiveConfidence: -40, visibility: -15, alignment: -10, morale: -2 },
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

/**
 * Stage 2 quarterly goals — the bar moves: Visibility becomes harder, Boss
 * trust matters more, Burnout cap loosens to acknowledge the pressure, and
 * we add a CHRO-anchored "Survive the Reorg" check (the people lead being
 * happy with you is the most honest reorg-survival signal we can model).
 */
export const STAGE2_GOALS: QuarterlyGoal[] = [
  { id: 'g2-visibility', label: 'Hit Visibility Target',  kpi: 'visibility',     emoji: '👁️', target: 70 },
  { id: 'g2-boss',       label: 'Maintain Boss Trust',    stakeholderId: 'boss', emoji: '🤝', target: 65 },
  { id: 'g2-chro',       label: 'Survive the Reorg',      stakeholderId: 'chro', emoji: '🌀', target: 55 },
  { id: 'g2-prod',       label: 'Sustain Output',         kpi: 'productivity',   emoji: '🚀', target: 35 },
  { id: 'g2-burnout',    label: "Don't Implode",          kpi: 'burnout',        emoji: '🔥', target: 65, lowerIsBetter: true },
];

/**
 * Stage 3 quarterly goals — politics replace output. "Decision Velocity" and
 * "Maintain Coalition" model the Stage 3 thesis: in bureaucracy, the work
 * is about who lines up behind you, not what you ship.
 *
 * Note: "Decision Velocity" and "Survive Approval Chains" rely on counters
 * tracked in the store (decisionsThisStage, approvalChainsCleared) rather
 * than KPIs — those goals show progress as N/target.
 */
export const STAGE3_GOALS: QuarterlyGoal[] = [
  { id: 'g3-boss',     label: 'Boss Patience',          stakeholderId: 'boss', emoji: '🤝', target: 50 },
  { id: 'g3-cfo',      label: 'No CFO Blocks',          stakeholderId: 'cfo',  emoji: '🧾', target: 40 },
  { id: 'g3-coalition', label: 'Maintain Coalition',    kpi: 'alignment',      emoji: '🤝', target: 60 },
  { id: 'g3-velocity', label: 'Decision Velocity',      kpi: 'executiveConfidence', emoji: '⚡', target: 55 },
  { id: 'g3-burnout',  label: "Don't Burn Out",         kpi: 'burnout',        emoji: '🔥', target: 70, lowerIsBetter: true },
];

/**
 * Stage 4 quarterly goals — survive the Board, hold an alliance, keep the
 * CEO and Boss out of a PR Disaster pairing. Visibility cap is high because
 * the Board Sync is a visibility windfall; if you tank it, the goal is
 * lost AND a game-over fires.
 */
export const STAGE4_GOALS: QuarterlyGoal[] = [
  { id: 'g4-boss',     label: 'Boss Confidence',        stakeholderId: 'boss', emoji: '🤝', target: 55 },
  { id: 'g4-ceo',      label: 'CEO Patience',           stakeholderId: 'ceo',  emoji: '👔', target: 55 },
  { id: 'g4-alignment', label: 'Hold the Coalition',    kpi: 'alignment',      emoji: '🤝', target: 65 },
  { id: 'g4-visibility', label: 'Survive the Board',    kpi: 'visibility',     emoji: '🏛️', target: 70 },
  { id: 'g4-burnout',  label: "Don't Implode",          kpi: 'burnout',        emoji: '🔥', target: 75, lowerIsBetter: true },
];

/** Stage → quarterly goal set. Falls back to Stage 1 for stages not built yet. */
export function stageGoalsFor(stage: StageId): QuarterlyGoal[] {
  if (stage === 4) return STAGE4_GOALS;
  if (stage === 3) return STAGE3_GOALS;
  if (stage === 2) return STAGE2_GOALS;
  return STAGE1_GOALS;
}

/**
 * Stage → daily accept cap. The Stage 2 drop from 5 → 4 is the single most
 * felt change of the stage transition; once it lands, every "yes" forces a
 * "no" somewhere else. Stage 3 holds the cap at 4 — pressure comes from
 * approval chains, not slot scarcity.
 */
export function capFor(stage: StageId): number {
  if (stage >= 2) return 4;
  return 5;
}

/**
 * Stage 3+ politics multiplier. Per the gameplay plan, Stage 3 doubles down
 * on political consequences: every relationship change is ×1.5. Mistakes
 * hurt more, alliances pay more. Stage 4 bumps it again — alliances and
 * feuds are real, the Board is watching.
 */
export function politicsMultiplier(stage: StageId): number {
  if (stage >= 4) return 1.75;
  if (stage >= 3) return 1.5;
  return 1;
}

/**
 * Stage 2-only chaos pool. Reorg Whispers fires *one* of these on a random
 * Stage 2 day regardless of accept count — see store.maybeTriggerChaos /
 * continueToNextDay for the trigger.
 */
export const STAGE2_FORCED_CHAOS_IDS = ['reorg-announce'] as const;

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
