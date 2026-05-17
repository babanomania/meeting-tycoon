/**
 * Headless screenshot pipeline for Meeting Tycoon.
 *
 * Spins up Chromium, opens the running dev server (you must `npm run dev`
 * yourself first), and for each scenario:
 *   - resizes the viewport (mobile 390x844 / desktop 1280x800)
 *   - pokes the Zustand store via window.__useGame.setState(...) to land
 *     on the right screen with realistic state
 *   - takes a PNG screenshot into docs/assets/screenshots/
 *
 * The store is exposed on window only in dev mode (see src/main.tsx).
 *
 * Run: `npm run dev` in one terminal, then `npm run screenshots` in another.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'docs', 'assets', 'screenshots');
const URL = process.env.PREVIEW_URL ?? 'http://localhost:5173/';

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

/**
 * Build a realistic schedule fragment for a given stage/day.
 * Returns ScheduledMeeting[] entries suitable for store.setState({schedule}).
 */
function buildSchedule(stage) {
  // Stage 1: 3 normal meetings
  if (stage <= 1) {
    return [
      { uid: 'demo-1', typeId: 'standup',        startMinutes: 0,   from: 'Engineering', recurring: true },
      { uid: 'demo-2', typeId: '1on1',           startMinutes: 60,  from: 'Your Boss' },
      { uid: 'demo-3', typeId: 'stakeholder-sync', startMinutes: 120, from: 'Sales' },
    ];
  }
  // Stage 2: a heavier load
  if (stage === 2) {
    return [
      { uid: 'demo-1', typeId: 'standup',          startMinutes: 0,   from: 'Engineering', recurring: true },
      { uid: 'demo-2', typeId: 'board-pre-read',   startMinutes: 60,  from: 'CFO' },
      { uid: 'demo-3', typeId: 'shield-meeting',   startMinutes: 180, from: 'You' },
      { uid: 'demo-4', typeId: 'town-hall',        startMinutes: 240, from: 'CEO' },
    ];
  }
  // Stage 3: with carryover approval-gated requests in the schedule too
  if (stage === 3) {
    return [
      { uid: 'demo-1', typeId: 'standup',         startMinutes: 0,   from: 'Engineering', recurring: true },
      { uid: 'demo-2', typeId: 'budget-review',   startMinutes: 60,  from: 'CFO' },
      { uid: 'demo-3', typeId: 'okr-checkin',     startMinutes: 180, from: 'VP Strategy' },
    ];
  }
  // Stage 4: pre-Board frenzy
  if (stage === 4) {
    return [
      { uid: 'demo-1', typeId: 'standup',         startMinutes: 0,   from: 'Engineering', recurring: true },
      { uid: 'demo-2', typeId: 'board-pre-read',  startMinutes: 60,  from: 'CFO' },
      { uid: 'demo-3', typeId: 'quarterly-review', startMinutes: 180, from: 'CEO' },
      { uid: 'demo-4', typeId: 'pr-cleanup',      startMinutes: 270, from: 'Legal' },
    ];
  }
  // Stage 5: includes a legacy and a committee for visual flavor
  return [
    { uid: 'demo-1', typeId: 'standup',          startMinutes: 0,   from: 'Engineering', recurring: true },
    { uid: 'demo-2', typeId: 'legacy-meeting',   startMinutes: 60,  from: 'Acme (legacy)', legacy: true },
    { uid: 'demo-3', typeId: 'quarterly-review', startMinutes: 180, from: 'CEO' },
    { uid: 'demo-4', typeId: 'committee',        startMinutes: 300, from: 'Auto-spawned', committee: true },
  ];
}

/**
 * Stakeholder presets — used by alliance/feud-aware scenes.
 */
const STAKEHOLDERS_FRIENDLY = [
  { id: 'boss',         name: 'Your Boss',  role: 'Director · Manager',       relationship: 78, trend: 'up' },
  { id: 'ceo',          name: 'CEO',         role: 'Chief Executive',          relationship: 74, trend: 'up' },
  { id: 'cfo',          name: 'CFO',         role: 'Chief Financial Officer',  relationship: 62 },
  { id: 'cto',          name: 'CTO',         role: 'Chief Technology Officer', relationship: 71, trend: 'up' },
  { id: 'chro',         name: 'CHRO',        role: 'Chief People Officer',     relationship: 73, trend: 'up' },
  { id: 'vp_strategy',  name: 'VP Strategy', role: 'Strategy & Synergy',       relationship: 55 },
];

const STAKEHOLDERS_HOSTILE = [
  { id: 'boss',         name: 'Your Boss',   role: 'Director · Manager',       relationship: 28, trend: 'down', lastNote: "patience running out" },
  { id: 'ceo',          name: 'CEO',         role: 'Chief Executive',          relationship: 35, trend: 'down' },
  { id: 'cfo',          name: 'CFO',         role: 'Chief Financial Officer',  relationship: 22, trend: 'down', lastNote: 'froze your budget' },
  { id: 'cto',          name: 'CTO',         role: 'Chief Technology Officer', relationship: 40 },
  { id: 'chro',         name: 'CHRO',        role: 'Chief People Officer',     relationship: 30 },
  { id: 'vp_strategy',  name: 'VP Strategy', role: 'Strategy & Synergy',       relationship: 26 },
];

/**
 * Scenes to capture. Each scene describes the target viewport and a
 * partial state to merge into the store. The state shape mirrors
 * GameState in src/game/store.ts.
 */
const SCENES = [
  // ── LANDING / ONBOARDING ────────────────────────────────────────────
  {
    name: '01-landing-mobile',
    viewport: MOBILE,
    state: { screen: 'landing', stage: 1, day: 1, schedule: [], conversations: [], history: [] },
  },
  {
    name: '01-landing-desktop',
    viewport: DESKTOP,
    state: { screen: 'landing', stage: 1, day: 1, schedule: [], conversations: [], history: [] },
  },
  {
    name: '02-onboarding-mobile',
    viewport: MOBILE,
    state: { screen: 'onboarding' },
  },

  // ── STAGE 1: THE FIRST WEEK ─────────────────────────────────────────
  {
    name: '10-stage1-calendar',
    viewport: MOBILE,
    state: {
      screen: 'calendar', stage: 1, day: 2,
      schedule: buildSchedule(1),
      acceptedRequestIds: ['demo-2', 'demo-3', 'recurring:demo-1'],
    },
  },
  {
    name: '11-stage1-inbox',
    viewport: MOBILE,
    state: {
      screen: 'inbox', stage: 1, day: 2,
      schedule: buildSchedule(1),
      acceptedRequestIds: ['demo-2', 'demo-3', 'recurring:demo-1'],
    },
  },
  {
    name: '12-stage1-home',
    viewport: MOBILE,
    state: {
      screen: 'home', stage: 1, day: 3,
      schedule: buildSchedule(1),
      kpis: { productivity: 58, morale: 64, burnout: 32, alignment: 52, executiveConfidence: 48, visibility: 42 },
      history: [
        { productivity: 50, morale: 68, burnout: 22, alignment: 45, executiveConfidence: 40, visibility: 30 },
        { productivity: 55, morale: 66, burnout: 28, alignment: 48, executiveConfidence: 44, visibility: 36 },
      ],
    },
  },
  {
    name: '13-stage1-people',
    viewport: MOBILE,
    state: {
      screen: 'people', stage: 1, day: 3,
      stakeholders: [
        { id: 'boss',        name: 'Your Boss',  role: 'Director · Manager',       relationship: 62, trend: 'up' },
        { id: 'ceo',         name: 'CEO',         role: 'Chief Executive',          relationship: 54 },
        { id: 'cfo',         name: 'CFO',         role: 'Chief Financial Officer',  relationship: 50 },
        { id: 'cto',         name: 'CTO',         role: 'Chief Technology Officer', relationship: 58, trend: 'up' },
        { id: 'chro',        name: 'CHRO',        role: 'Chief People Officer',     relationship: 52 },
        { id: 'vp_strategy', name: 'VP Strategy', role: 'Strategy & Synergy',       relationship: 46, trend: 'down' },
      ],
    },
  },
  {
    name: '14-stage1-day-summary',
    viewport: MOBILE,
    state: {
      screen: 'day-summary', stage: 1, day: 2,
      lastResult: {
        meetingsHeld: 3, peopleMet: 12, decisionsMade: 1,
        timeInMeetingsHrs: 2.5, actualWorkHrs: 6.5,
        kpiDelta: { productivity: 4, morale: 2, burnout: -4, alignment: 5, visibility: 2 },
        restDelta: { productivity: 4, morale: 2, burnout: -4 },
        unusedSlots: 2,
        boss: { emoji: '🙂', text: 'Light calendar, real output. The team actually shipped something. Keep this up.' },
      },
    },
  },

  // ── CHAT ────────────────────────────────────────────────────────────
  {
    name: '20-chat-list',
    viewport: MOBILE,
    state: { screen: 'chat', stage: 2, day: 7 },
  },

  // ── STAGE 2: WELCOME TO REALITY ─────────────────────────────────────
  {
    name: '30-stage2-calendar',
    viewport: MOBILE,
    state: {
      screen: 'calendar', stage: 2, day: 8,
      schedule: buildSchedule(2),
      acceptedRequestIds: ['demo-2', 'demo-3', 'recurring:demo-1', 'demo-4'],
      dashboardSentToday: false,
      shieldMeetingsToday: 1,
    },
  },
  {
    name: '31-stage2-stage-unlock',
    viewport: MOBILE,
    state: { screen: 'stage-unlock', stageUnlocked: 2, stage: 2, day: 6 },
  },

  // ── STAGE 3: BUREAUCRACY ────────────────────────────────────────────
  {
    name: '40-stage3-inbox-approvals',
    viewport: MOBILE,
    state: {
      screen: 'inbox', stage: 3, day: 12,
      schedule: buildSchedule(3),
      acceptedRequestIds: ['recurring:demo-1'],
      requestApprovals: {
        'd12-r3': ['cfo', 'ceo'],
        'd11-r2': ['cfo', 'cto', 'vp_strategy'],
      },
      carryoverRequests: [],
    },
  },
  {
    name: '41-stage3-stage-unlock',
    viewport: MOBILE,
    state: { screen: 'stage-unlock', stageUnlocked: 3, stage: 3, day: 11 },
  },

  // ── STAGE 4: CORPORATE MADNESS ──────────────────────────────────────
  {
    name: '50-stage4-people-alliances',
    viewport: MOBILE,
    state: {
      screen: 'people', stage: 4, day: 18,
      stakeholders: STAKEHOLDERS_FRIENDLY,
    },
  },
  {
    name: '51-stage4-calendar',
    viewport: MOBILE,
    state: {
      screen: 'calendar', stage: 4, day: 19,
      schedule: buildSchedule(4),
      acceptedRequestIds: ['demo-2', 'demo-3', 'recurring:demo-1', 'demo-4'],
      dashboardSentToday: true,
    },
  },

  // ── STAGE 5: EXECUTIVE ABSURDITY ────────────────────────────────────
  {
    name: '60-stage5-calendar-cook-books',
    viewport: MOBILE,
    state: {
      screen: 'calendar', stage: 5, day: 23,
      schedule: buildSchedule(5),
      acceptedRequestIds: ['demo-3', 'recurring:demo-1'],
      dashboardSentToday: false,
      shieldMeetingsToday: 0,
      illusionSpentToday: false,
    },
  },
  {
    name: '61-stage5-stage-unlock',
    viewport: MOBILE,
    state: { screen: 'stage-unlock', stageUnlocked: 5, stage: 5, day: 21 },
  },

  // ── ENDINGS ─────────────────────────────────────────────────────────
  {
    name: '70-game-over-restructured',
    viewport: MOBILE,
    state: {
      screen: 'game-over', stage: 2, day: 9,
      stakeholders: STAKEHOLDERS_HOSTILE,
      kpis: { productivity: 22, morale: 28, burnout: 78, alignment: 30, executiveConfidence: 25, visibility: 32 },
      gameOver: {
        reason: 'restructured',
        emoji: '🌀',
        title: "You've Been 'Restructured'",
        body: 'Leadership felt the org would benefit from "a fresh perspective in your role". You retain the title and lose every responsibility. HR called it "an exciting lateral move".',
      },
    },
  },
  {
    name: '71-promotion-won-desktop',
    viewport: DESKTOP,
    state: {
      screen: 'promotion', stage: 5, day: 25,
      promotionResult: { goalsMet: 5, goalsTotal: 5, outcome: 'promoted' },
    },
  },
  {
    name: '72-promotion-won-mobile',
    viewport: MOBILE,
    state: {
      screen: 'promotion', stage: 5, day: 25,
      promotionResult: { goalsMet: 5, goalsTotal: 5, outcome: 'promoted' },
    },
  },
];

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  // Initial page load — primes the React app + exposes window.__useGame.
  await page.setViewportSize(MOBILE);
  await page.goto(URL, { waitUntil: 'networkidle' });

  // Wait for the store to be exposed.
  await page.waitForFunction(() => !!(window).__useGame, { timeout: 5000 });

  let done = 0;
  for (const scene of SCENES) {
    await page.setViewportSize(scene.viewport);
    // Apply state via Zustand setState. Spread to keep other fields intact.
    await page.evaluate((state) => {
      // @ts-expect-error window.__useGame is the Zustand hook
      const store = window.__useGame;
      store.setState({ ...state, settingsOpen: false, toast: null });
    }, scene.state);
    // Give React time to re-render and any framer-motion entry to settle.
    await page.waitForTimeout(400);

    const out = `${OUT_DIR}/${scene.name}.png`;
    await page.screenshot({ path: out, fullPage: false });
    done++;
    console.log(`  ✓ [${done}/${SCENES.length}] ${scene.name}.png (${scene.viewport.width}x${scene.viewport.height})`);
  }

  await browser.close();
  console.log(`\n  Saved ${done} screenshots to ${OUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
