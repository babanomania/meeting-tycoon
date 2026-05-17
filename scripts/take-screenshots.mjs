/**
 * Headless screenshot pipeline for Meeting Tycoon.
 *
 * Spins up Chromium, opens the running dev server (you must `npm run dev`
 * yourself first), and for each scenario:
 *   - resizes the viewport
 *   - first calls startGame() to seed conversations / DMs so chat shots
 *     have content
 *   - then merges a scene-specific state patch via window.__useGame.setState
 *   - waits long enough for framer-motion entries to settle
 *   - saves a PNG into docs/assets/screenshots/
 *
 * Scene names are semantic — they describe the content of the shot, not
 * just the stage/day. New scenes should follow the same convention.
 *
 * Run: `npm run dev` in one terminal, then `npm run screenshots` in another.
 */
import { chromium } from 'playwright';
import { mkdir, rm, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'docs', 'assets', 'screenshots');
const URL = process.env.PREVIEW_URL ?? 'http://localhost:5173/';

const MOBILE = { width: 390, height: 844 };
// Game is mobile-first; screenshots are mobile-only by design.

// ──────────────────────────────────────────────────────────────────────────
// Reusable state fragments — keep individual scenes terse and consistent.
// ──────────────────────────────────────────────────────────────────────────

// Six stakeholders with paired-friendship pattern that lights up THREE
// alliances on the People map (boss⇄CEO, CEO⇄VP_strategy, CFO⇄CEO are all
// at ≥70). Also keeps CTO ≥ 70 to pair with CHRO.
const STAKEHOLDERS_ALLIED = [
  { id: 'boss',         name: 'Your Boss',  role: 'Director · Manager',       relationship: 78, trend: 'up' },
  { id: 'ceo',          name: 'CEO',         role: 'Chief Executive',          relationship: 82, trend: 'up' },
  { id: 'cfo',          name: 'CFO',         role: 'Chief Financial Officer',  relationship: 72, trend: 'up' },
  { id: 'cto',          name: 'CTO',         role: 'Chief Technology Officer', relationship: 74, trend: 'up' },
  { id: 'chro',         name: 'CHRO',        role: 'Chief People Officer',     relationship: 73, trend: 'up' },
  { id: 'vp_strategy',  name: 'VP Strategy', role: 'Strategy & Synergy',       relationship: 71, trend: 'up' },
];

const STAKEHOLDERS_HOSTILE = [
  { id: 'boss',         name: 'Your Boss',   role: 'Director · Manager',       relationship: 28, trend: 'down', lastNote: 'patience running out' },
  { id: 'ceo',          name: 'CEO',         role: 'Chief Executive',          relationship: 32, trend: 'down' },
  { id: 'cfo',          name: 'CFO',         role: 'Chief Financial Officer',  relationship: 22, trend: 'down', lastNote: 'froze your budget' },
  { id: 'cto',          name: 'CTO',         role: 'Chief Technology Officer', relationship: 36 },
  { id: 'chro',         name: 'CHRO',        role: 'Chief People Officer',     relationship: 30 },
  { id: 'vp_strategy',  name: 'VP Strategy', role: 'Strategy & Synergy',       relationship: 26 },
];

const STAKEHOLDERS_NEUTRAL = [
  { id: 'boss',         name: 'Your Boss',  role: 'Director · Manager',       relationship: 62, trend: 'up' },
  { id: 'ceo',          name: 'CEO',         role: 'Chief Executive',          relationship: 54 },
  { id: 'cfo',          name: 'CFO',         role: 'Chief Financial Officer',  relationship: 50 },
  { id: 'cto',          name: 'CTO',         role: 'Chief Technology Officer', relationship: 58, trend: 'up' },
  { id: 'chro',         name: 'CHRO',        role: 'Chief People Officer',     relationship: 52 },
  { id: 'vp_strategy',  name: 'VP Strategy', role: 'Strategy & Synergy',       relationship: 46, trend: 'down' },
];

/** Stage 1: 3 normal meetings, 2 slots unused — looks calm. */
const SCHEDULE_STAGE1 = [
  { uid: 'demo-1', typeId: 'standup',          startMinutes: 0,   from: 'Engineering', recurring: true },
  { uid: 'demo-2', typeId: '1on1',             startMinutes: 60,  from: 'Your Boss' },
  { uid: 'demo-3', typeId: 'stakeholder-sync', startMinutes: 120, from: 'Sales' },
];

/** Stage 2: defensive — standup + shield (focus block) + a high-priority. */
const SCHEDULE_STAGE2 = [
  { uid: 'demo-1', typeId: 'standup',          startMinutes: 0,   from: 'Engineering', recurring: true },
  { uid: 'demo-2', typeId: 'board-pre-read',   startMinutes: 60,  from: 'CFO' },
  { uid: 'demo-3', typeId: 'shield-meeting',   startMinutes: 180, from: 'You' },
  { uid: 'demo-4', typeId: 'town-hall',        startMinutes: 240, from: 'CEO' },
];

/** Stage 5: standup + legacy (undeclinable) + a real meeting + a committee. */
const SCHEDULE_STAGE5 = [
  { uid: 'demo-1', typeId: 'standup',          startMinutes: 0,   from: 'Engineering', recurring: true },
  { uid: 'demo-2', typeId: 'legacy-meeting',   startMinutes: 60,  from: 'Acme (legacy)', legacy: true },
  { uid: 'demo-3', typeId: 'quarterly-review', startMinutes: 180, from: 'CEO' },
  { uid: 'demo-4', typeId: 'committee',        startMinutes: 300, from: 'Auto-spawned', committee: true },
];

// ──────────────────────────────────────────────────────────────────────────
// Scenes
// ──────────────────────────────────────────────────────────────────────────

const SCENES = [
  // ── Landing / Onboarding ────────────────────────────────────────────
  {
    name: '01-landing-mobile',
    viewport: MOBILE,
    seedChat: false,
    state: { screen: 'landing', stage: 1, day: 1, schedule: [], conversations: [], history: [] },
    wait: 700,
  },
  {
    name: '02-onboarding',
    viewport: MOBILE,
    seedChat: false,
    state: { screen: 'onboarding' },
    wait: 400,
  },

  // ── The four core play screens (Stage 1, Day 2-3) ───────────────────
  {
    name: '03-calendar',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'calendar', stage: 1, day: 2,
      schedule: SCHEDULE_STAGE1,
      acceptedRequestIds: ['demo-2', 'demo-3', 'recurring:demo-1'],
    },
    wait: 500,
  },
  {
    name: '04-inbox',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'inbox', stage: 1, day: 2,
      schedule: SCHEDULE_STAGE1,
      acceptedRequestIds: ['demo-2', 'demo-3', 'recurring:demo-1'],
    },
    wait: 500,
  },
  {
    name: '05-home',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'home', stage: 1, day: 3,
      schedule: SCHEDULE_STAGE1,
      kpis: { productivity: 58, morale: 64, burnout: 32, alignment: 52, executiveConfidence: 48, visibility: 42 },
      history: [
        { productivity: 50, morale: 68, burnout: 22, alignment: 45, executiveConfidence: 40, visibility: 30 },
        { productivity: 55, morale: 66, burnout: 28, alignment: 48, executiveConfidence: 44, visibility: 36 },
      ],
      stakeholders: STAKEHOLDERS_NEUTRAL,
    },
    wait: 600,
  },
  {
    name: '06-people',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'people', stage: 1, day: 3,
      stakeholders: STAKEHOLDERS_NEUTRAL,
    },
    wait: 500,
  },
  {
    name: '07-day-summary',
    viewport: MOBILE,
    seedChat: true,
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
    wait: 500,
  },

  // ── Chat (with seeded conversations) ────────────────────────────────
  {
    name: '08-chat-list',
    viewport: MOBILE,
    seedChat: true,
    state: { screen: 'chat', stage: 2, day: 7 },
    wait: 500,
  },

  // ── Stage-unlock splashes (all four) ────────────────────────────────
  // These have framer-motion entries with delay 0.35s + i*0.07s per item,
  // so 5-item splashes need ~1.4s to fully settle.
  {
    name: '10-stage-unlock-welcome-to-reality',
    viewport: MOBILE,
    seedChat: false,
    state: { screen: 'stage-unlock', stage: 2, day: 6, stageUnlocked: 2 },
    wait: 1500,
  },
  {
    name: '11-stage-unlock-bureaucracy',
    viewport: MOBILE,
    seedChat: false,
    state: { screen: 'stage-unlock', stage: 3, day: 11, stageUnlocked: 3 },
    wait: 1500,
  },
  {
    name: '12-stage-unlock-corporate-madness',
    viewport: MOBILE,
    seedChat: false,
    state: { screen: 'stage-unlock', stage: 4, day: 16, stageUnlocked: 4 },
    wait: 1500,
  },
  {
    name: '13-stage-unlock-executive-absurdity',
    viewport: MOBILE,
    seedChat: false,
    state: { screen: 'stage-unlock', stage: 5, day: 21, stageUnlocked: 5 },
    wait: 1500,
  },

  // ── Stage-specific mechanics in action ──────────────────────────────
  {
    name: '20-stage2-calendar-defensive-tools',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'calendar', stage: 2, day: 8,
      schedule: SCHEDULE_STAGE2,
      acceptedRequestIds: ['demo-2', 'demo-3', 'recurring:demo-1', 'demo-4'],
      dashboardSentToday: false,
      shieldMeetingsToday: 1,
    },
    wait: 600,
  },
  {
    name: '21-stage3-inbox-approval-chains',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'inbox', stage: 3, day: 12,
      schedule: [
        { uid: 'demo-1', typeId: 'standup', startMinutes: 0, from: 'Engineering', recurring: true },
      ],
      acceptedRequestIds: ['recurring:demo-1'],
      // Pre-populate approvals so several chains visibly partway through.
      requestApprovals: {
        'd12-r3': ['cfo', 'ceo'],          // 2 of 3 — almost there
        'd11-r2': ['cfo', 'cto', 'vp_strategy'], // 3 of 3 — UNLOCKED
      },
      carryoverRequests: [
        { uid: 'd11-r2', typeId: 'project-kickoff', from: 'Product',
          note: 'Q4 platform refresh. Needs leadership sign-off.',
          approvers: ['cfo', 'cto', 'vp_strategy', 'ceo', 'boss'], requiresApprovals: 3 },
      ],
    },
    wait: 600,
  },
  {
    name: '22-stage4-people-alliances',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'people', stage: 4, day: 18,
      stakeholders: STAKEHOLDERS_ALLIED,
    },
    wait: 700,
  },
  {
    name: '23-stage5-calendar-cook-the-books',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'calendar', stage: 5, day: 23,
      schedule: SCHEDULE_STAGE5,
      acceptedRequestIds: ['demo-3', 'recurring:demo-1'],
      dashboardSentToday: false,
      shieldMeetingsToday: 0,
      illusionSpentToday: false,
    },
    wait: 600,
  },

  // ── Chaos modal (with Stage 3+ Pass to Boss option visible) ─────────
  {
    name: '24-chaos-modal-pass-to-boss',
    viewport: MOBILE,
    seedChat: true,
    state: {
      // Modal only renders on inbox screen — see App.tsx.
      screen: 'inbox', stage: 3, day: 13,
      schedule: SCHEDULE_STAGE1,
      acceptedRequestIds: ['recurring:demo-1'],
      activeChaos: { id: 'cfo-blocks-budget', uid: 'chaos-demo' },
    },
    wait: 700,
  },

  // ── Endings ─────────────────────────────────────────────────────────
  {
    name: '40-game-over-restructured',
    viewport: MOBILE,
    seedChat: true,
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
    wait: 500,
  },
  {
    name: '41-promotion-won',
    viewport: MOBILE,
    seedChat: true,
    state: {
      screen: 'promotion', stage: 5, day: 25,
      stakeholders: STAKEHOLDERS_ALLIED,
      kpis: { productivity: 72, morale: 78, burnout: 38, alignment: 80, executiveConfidence: 82, visibility: 84 },
      promotionResult: { goalsMet: 5, goalsTotal: 5, outcome: 'promoted' },
    },
    // Long wait so the confetti animation has fallen visibly into frame.
    wait: 2200,
  },
];

async function run() {
  // Fresh output — drop any stale screenshots first so we don't leave
  // orphan files behind when scenes are renamed/removed.
  try {
    const existing = await readdir(OUT_DIR);
    for (const f of existing) {
      if (f.endsWith('.png')) await rm(resolve(OUT_DIR, f));
    }
  } catch {
    // dir doesn't exist yet — that's fine
  }
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  await page.setViewportSize(MOBILE);
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!(window).__useGame, { timeout: 5000 });

  let done = 0;
  for (const scene of SCENES) {
    await page.setViewportSize(scene.viewport);

    // Optionally seed chat first (start the game once so DM_TEMPLATES fire
    // and group channels get their static lore). Calling startGame() is a
    // no-op if conversations are already populated.
    if (scene.seedChat) {
      await page.evaluate(() => {
        // @ts-expect-error
        const store = window.__useGame;
        const s = store.getState();
        if (s.conversations.length === 0) s.startGame();
      });
    } else {
      // Wipe conversations to make Landing / Onboarding feel "fresh".
      await page.evaluate(() => {
        // @ts-expect-error
        window.__useGame.setState({ conversations: [], messages: {} });
      });
    }

    // Apply scene state. Always clear cross-cutting fields so they don't
    // bleed across shots — stageUnlocked / gameOver / activeChaos triggers
    // a useEffect in App.tsx that force-routes to the matching screen, so
    // we MUST reset them unless the current scene wants them set.
    await page.evaluate((state) => {
      // @ts-expect-error
      const store = window.__useGame;
      const reset = {
        settingsOpen: false,
        toast: null,
        stageUnlocked: null,
        gameOver: null,
        activeChaos: null,
        openConversationId: null,
        detailUid: null,
      };
      store.setState({ ...reset, ...state });
    }, scene.state);

    await page.waitForTimeout(scene.wait ?? 500);

    const out = `${OUT_DIR}/${scene.name}.png`;
    await page.screenshot({ path: out, fullPage: false });
    done++;
    console.log(`  ✓ [${done}/${SCENES.length}] ${scene.name}.png (${scene.viewport.width}×${scene.viewport.height})`);
  }

  await browser.close();
  console.log(`\n  Saved ${done} screenshots to ${OUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
