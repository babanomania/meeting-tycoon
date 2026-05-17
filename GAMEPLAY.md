# Meeting Tycoon — How the Game Actually Works

> A reference for players who want to know what's behind the calendar, and
> for contributors who want to extend it without breaking the math.

This document is the gameplay manual. The [README](./README.md) is for
running the project. Start here if you want to know what every screen and
every number means.

---

## Table of contents

1. [The premise](#the-premise)
2. [A typical day](#a-typical-day)
3. [The six KPIs](#the-six-kpis)
4. [The recovery loop](#the-recovery-loop)
5. [The six stakeholders](#the-six-stakeholders)
6. [The five stages](#the-five-stages)
7. [Stage 1 — The First Week](#stage-1--the-first-week)
8. [Stage 2 — Welcome to Reality](#stage-2--welcome-to-reality)
9. [Stage 3 — Bureaucracy](#stage-3--bureaucracy)
10. [Stage 4 — Corporate Madness](#stage-4--corporate-madness)
11. [Stage 5 — Executive Absurdity](#stage-5--executive-absurdity)
12. [Eight endings](#eight-endings)
13. [Chat](#chat)
14. [Save data](#save-data)

---

## The premise

You're the new manager at **Acme Corp** — a 23-person company that holds
127 meetings a week and spends 2% of its time on actual work. You report to
**David Chen** ("Your Boss"). Above him: a CEO who saw a competitor demo
last night, a CFO with a spreadsheet of spreadsheets, a CTO threatening
"no-meeting Mondays," a CHRO with a wellness survey, and a VP of Strategy
who brought a framework.

You have **25 in-game days** (5 stages × 5 days). Each day plays in about
90 seconds. At the end of Day 25 you either get **promoted to VP**, get a
**lateral move** (the corporate consolation prize), or get put on a
**Performance Improvement Plan**.

In between: 8 thematic ways to fail.

---

## A typical day

A single day flows through these screens:

1. **Calendar** — your agenda for today. Hours 9 AM – 6 PM, color-coded
   by priority. Recurring meetings carry over from yesterday and arrive
   pre-booked.
2. **Inbox** — between 6 and 8 meeting requests waiting. Each shows
   sender, duration, attendees, priority, KPI impact, and which quarterly
   goal it moves. You **Accept** or **Decline** each.
3. **Chaos** — somewhere between accept #2 and accept #4, there's a 60%
   chance a random chaos event interrupts you. You **Attend**, **Delegate**,
   **Reschedule**, or (Stage 3+) **Pass to Boss**.
4. **Chat** — channels (`#general`, `#engineering`, `#leadership`,
   `#culture`) plus DMs from stakeholders. Read-only group channels react
   to your actions. DMs from stakeholders give you reply options that
   shift their relationship.
5. **Home** — at any point, check the company vibe headline, the 5
   quarterly goals, and the KPI ↔ sponsor matrix.
6. **People** — stakeholder map (hub-and-spoke) with relationship scores.
   Stage 4+ overlays alliance and feud edges between paired stakeholders.
7. **End Day** — calculates: KPI deltas from meetings + chaos + rest
   recovery + (Stage 4+) alliance bonuses + (Stage 4+) PR disaster +
   (Stage 5+) AI Notes Bot stacking. Then **Day Summary** screen.
8. **Day Summary** — meetings held, time in meetings, decisions made, rest
   recovery card (if you left slots unused), KPI impact, boss feedback
   line. Continue → next day, or game-over screen if a failure mode hit,
   or stage-unlock splash if you crossed a stage boundary, or Promotion
   screen on Day 25.

You have a **daily accept cap**: 5 in Stage 1, **4 from Stage 2 onward**.
Once you've accepted that many meetings, Accept buttons go disabled.

---

## The six KPIs

All KPIs are 0–100. **Burnout is inverted** — lower is better, going down
shows as a green delta with a down arrow.

| KPI | Sponsor | What moves it up | What moves it down |
|---|---|---|---|
| **Productivity** | CTO Raj Patel | Light calendar (rest), shield meetings, focus blocks | Crisis meetings, every accepted meeting, town halls |
| **Morale** | CHRO | Culture syncs, retros, 1:1s, restraint | Town halls, reorgs, all-hands, PR disasters |
| **Burnout** | CFO Diana Vargas | _(lower = better)_ Rest, shield meetings | Crisis events, board pre-reads, day with no unused slots |
| **Alignment** | Your Boss David Chen | Standups, OKRs, alignment meetings, pre-read syncs | Skipping recurring meetings, feuds (Stage 4+) |
| **Exec Confidence** | CEO Marcus Hale | Board pre-reads, QBRs, attending CEO chaos, fast replies | Rescheduling executive chaos, PR disasters |
| **Visibility** | VP Strategy Tom Whitfield | Town halls, all-hands, dashboard reports, board sync | "Cooking the books" (Stage 5+ costs 20 to fake ExecConf) |

The Home screen pairs each KPI with its sponsor's relationship score —
making the cause/effect visible. A KPI's sponsor going hostile usually
means you're about to bleed that KPI.

---

## The recovery loop

The single most important balancing mechanic. Without it the game would
only ever take from you.

**At end of day, for each unused accept slot:**

- **Productivity +2**
- **Burnout −2**
- **Morale +1**

An empty calendar earns +10 / −10 / +5. A maxed-out 5-meeting day earns
nothing.

**Restraint is a strategy.** You don't have to fill the calendar. The
"Rest & Recovery" card on the Day Summary surfaces this explicitly so the
restraint feels rewarded.

---

## The six stakeholders

| Id | Name | Role | Why they matter |
|---|---|---|---|
| `boss` | David Chen ("Your Boss") | Director · your manager | Your default relationship. Goal in every stage. Promotion gates through him. |
| `ceo` | Marcus Hale | Chief Executive | The Promotion letter writer. Posts on LinkedIn. Triggers PR Disaster with the Boss. |
| `cfo` | Diana Vargas | Chief Financial Officer | Audits the books. Blocks budgets. Gates Stage 5 Promotion. |
| `cto` | Raj Patel | Chief Technology Officer | Files "no-meeting Mondays" manifestos. Owns Productivity. |
| `chro` | CHRO | People Ops lead | Owns Morale. Watches the reorg fallout in Stage 2+. |
| `vp_strategy` | Tom Whitfield | VP, Strategy | Owns Visibility. Brings frameworks. Feuds with CTO. |

Each starts at **50/100** (neutral). Every action that touches a
stakeholder shifts their relationship; the **People** screen visualizes
this as a hub-and-spoke map colored by sentiment (hostile / cool / neutral
/ friendly / champion).

Stage 3+ applies a **politics multiplier** (×1.5 at Stage 3, ×1.75 at
Stage 4+) to every relationship delta. Mistakes get more expensive.

---

## The five stages

Each stage runs **5 in-game days**. Pressure scales by adding new
mechanics, not bigger numbers.

| Stage | Days | Theme | Key cap change |
|---|---|---|---|
| 1 | 1–5 | The First Week | 6 requests/day, 5 accepts |
| 2 | 6–10 | Welcome to Reality | **8 requests/day, 4 accepts** |
| 3 | 11–15 | Bureaucracy | Same caps, approval chains added |
| 4 | 16–20 | Corporate Madness | Same caps, alliances/feuds active |
| 5 | 21–25 | Executive Absurdity | Same caps, every accept spawns a committee |

The most-felt change is the **Stage 2 cap drop from 5 → 4**. Once it
lands, every "yes" forces a "no" somewhere else.

---

## Stage 1 — The First Week

> Days 1–5. Learn the ropes. Or pretend to.

The baseline. Five days of:
- 6 meeting requests per day
- 5 accept slots per day
- 4 group channels (`#general`, `#engineering`, `#leadership`, `#culture`)
- 4 chaos events possible
- 6 stakeholders, all starting neutral
- 5 quarterly goals (Boss ≥70, Alignment ≥60, Visibility ≥55, Burnout
  ≤60, ExecConf ≥65)

The "tutorial stage". Nothing fancy. You can win or lose Stage 1 entirely
on your accept/decline pattern.

**Failures possible:** Team Walkout (Morale ≤10), Forced Sabbatical
(Burnout ≥92), Reassigned (ExecConf ≤15).

---

## Stage 2 — Welcome to Reality

> Days 6–10. The honeymoon ends Monday.

Everything ramps. New mechanics:

- **Inbox Overload** — day pool grows to 8 requests/day.
- **Accept cap drops to 4.** This is the single most felt change. Every
  yes now forces a no.
- **Shield Meeting** — a defensive 60-minute focus block. Costs 1 accept
  slot, +6 Productivity / +2 Morale / −3 Burnout, zero relationship hit.
  Calendar header button.
- **Dashboard Report** — once-per-day daily action. +5 Visibility /
  +3 ExecConf, no Productivity cost. Calendar header button.
- **Recurring Cost Inflation** — declining a `recurring` request now
  costs ×1.5 relationship hit (the team notices when you skip standup).
- **Reorg Whispers** — on one random day from Day 7 onward (forced on
  Day 10 if it hasn't fired), the `reorg-announce` chaos triggers at
  day-start regardless of your accept count. Big impact: −Morale,
  −Alignment, +Burnout for everyone.
- **Three new chaos events:** `reorg-announce`, `quarterly-surprise`
  (CEO needs QBR slides by EOD), `two-town-halls` (both mandatory).
- **New goals:** Visibility ≥70, Boss ≥65, Productivity ≥35,
  Burnout ≤65, CHRO ≥55 (Survive the Reorg).

**New failure:** **"Restructured"** — 4+ stakeholders at ≤50 → game over
with the "exciting lateral move" letter.

---

## Stage 3 — Bureaucracy

> Days 11–15. Process eats people.

The political stage. Mechanics:

- **Approval Chains** — ~2 of every 8 daily requests carry an `approvers`
  list and `requiresApprovals` count (default 3 of 5). You **cannot
  accept** until enough listed stakeholders sign off. Approvals tick
  forward on every accept/decline action plus at day start, weighted by
  current relationship — high-friendship stakeholders sign off faster.
- **Carryover Queue** — approval-gated requests that don't get actioned
  by end of day carry to tomorrow's inbox. They sit there occupying
  mental space until accepted or declined. Resets on stage transition.
- **Pass to Boss** (chaos response) — new 4th option on the Chaos modal,
  Stage 3+. Zero KPI hit, −15 Boss relationship. The "is this worth the
  political cost?" test.
- **Politics ×1.5** — every relationship delta scales up.
- **Three new chaos events:** `cfo-blocks-budget`, `cto-no-meeting-mondays`,
  `vp-quarterly-deepdive`.
- **New goals:** Boss ≥50, CFO ≥40 (No CFO Blocks), Alignment ≥60
  (Maintain Coalition), ExecConf ≥55 (Decision Velocity), Burnout ≤70.

**New failure:** **Process Paralysis** — every stakeholder ≤50
simultaneously → game over with the "you've been technically PTO for three
weeks" letter.

### How approval ticking works

Per pending approval-gated request, per tick, for each not-yet-approved
stakeholder in its `approvers` list:

```
relationship ≥ 70  → 55% chance to sign off
relationship 50–69 → 35% chance
relationship 30–49 → 20% chance
relationship < 30  → 10% chance
```

Ticks fire on: every accept, every decline, day-start. So chains move
visibly through the day, and rough mornings drag.

---

## Stage 4 — Corporate Madness

> Days 16–20. The org chart eats itself.

The chaos stage. Mechanics:

- **Stakeholder Alliances** — five hand-picked stakeholder pairs (Boss⇄CEO,
  CFO⇄CEO, CEO⇄VP, CTO⇄CHRO, VP⇄CHRO). When both are at **≥70**, they form
  an **alliance** that adds **+3 to a themed KPI** at day-end (Boss⇄CEO →
  Visibility, CTO⇄CHRO → Morale, etc).
- **Feuds** — when both stakeholders in a pair are at **≤30**, they
  actively undermine each other, costing **−3 Alignment** per feud at
  day-end.
- **People screen overlay** — the stakeholder map adds green ALLIANCE arcs
  and red dashed FEUD arcs between paired nodes when active.
- **PR Disaster auto-fire** — at day-end, if **Boss < 50 AND CEO < 50**,
  the CEO posts something concerning on LinkedIn: **−15 ExecConf**,
  +4 Visibility, −3 Morale, broadcast across `#leadership`, `#general`,
  `#engineering`. Tracked as `prDisasterStrikes` — **2 strikes in one
  stage = "Reassigned to Special Projects"** game over.
- **Politics ×1.75** — multiplier bumps again.
- **Four new chaos events:** `backchannel-cfo` (Diana asks you to
  slow-walk Raj's budget), `feud-cto-vp` (you mediate), `ceo-linkedin-disaster`
  (Marcus posts again), `board-pre-read-rush` (Diana flags 14 items).
- **New goals:** Boss ≥55, CEO ≥55, Alignment ≥65, Visibility ≥70,
  Burnout ≤75.

**The Day 20 Board Sync** — climax event. Force-fired at day-start
regardless of accept count: a 2-hour `board-sync` chaos. **At end of
Day 20**, Stage 4 goals are evaluated:

- **3+ of 5 goals hit** → Stage 5 unlock splash
- **<3 hit** → **Board Confidence Lost** game over

---

## Stage 5 — Executive Absurdity

> Days 21–25. Maintain the illusion.

The endgame stage. Mechanics:

- **Mandatory Committees** — every accepted Stage 5+ meeting silently
  spawns a 30-min Follow-up Committee on the same day's calendar (if a
  free slot exists). Doesn't count against the accept cap, but eats your
  focus time. Shields, legacy meetings, and committees themselves don't
  recurse.
- **AI Meeting Notes Bot** — at day-end, for every meeting type held,
  an `Acme AI Notes Bot` message fires in `#general` ("Summary attached.
  Key takeaway: alignment. Action items: alignment."). Visibility +1 /
  Morale −1 per fire, compounding.
- **Legacy Meetings** — at every Stage 5 day-start, one "Legacy Sync
  (Inherited)" meeting auto-appears on the calendar. Marked `legacy: true`.
  **Cannot be removed.** Predates the calendar system itself.
- **Cook the Books** — once-per-day action. **−20 Visibility for
  +10 ExecConf today.** Queues **−15 ExecConf for tomorrow** as
  `illusionDebt`. The math is a long-run loss; the short-run optics win
  is the temptation. Surfaces as a yellow button on the Calendar header
  (Stage 5+ only).
- **Three new chaos events:** `committee-spawn` (the Q3 Synergy
  Sub-Committee), `ai-takeover` (the bot replies to humans),
  `cfo-illusion-audit` (Diana audits your reported numbers).
- **New goals:** CEO ≥70 (CEO writes the letter), CFO ≥60 (CFO signs
  off), Visibility ≥75 (Maintain the Illusion), ExecConf ≥70
  (Boardroom-Ready), Burnout ≤80 (Survive Yourself).

**The Day 25 Promotion** — endgame evaluation:

- **5 of 5 goals hit** → **Promoted to VP of Synergy**. Confetti. David
  writes a real letter.
- **3–4 hit** → **"Lateral move"**. Same Promotion screen, muted copy.
- **≤2 hit** → **Performance Improvement Plan** (8th failure mode).

---

## Eight endings

Seven failure modes and one win condition. Each ending is named
specifically because the ending IS the punchline.

### Failures

| Ending | Triggered by | Earliest stage |
|---|---|---|
| **Team Walkout** | Morale ≤10 | Stage 1 |
| **Reassigned** | ExecConf ≤15 | Stage 1 |
| **Forced Sabbatical** | Burnout ≥92 | Stage 1 |
| **"Restructured"** | 4+ stakeholders ≤50 | Stage 2+ |
| **Process Paralysis** | All 6 stakeholders ≤50 simultaneously | Stage 3+ |
| **Board Confidence Lost** | <3 of 5 Stage 4 goals hit at end of Day 20 | Stage 4 |
| **Reassigned to Special Projects** | 2+ PR Disasters in one stage | Stage 4+ |
| **Performance Improvement Plan** | ≤2 of 5 Stage 5 goals hit at end of Day 25 | Stage 5 |

### Win

| Ending | Triggered by |
|---|---|
| **VP of Synergy (Promoted)** | 5 of 5 Stage 5 goals hit at end of Day 25 |

A "Lateral Move" (3–4 of 5 Stage 5 goals) routes to the Promotion screen
with consolation copy. Not a failure, not a win.

---

## Chat

The chat system has three kinds of conversations:

- **Group channels** (`#general`, `#engineering`, `#leadership`,
  `#culture`) — read-only. The team gossips, leadership broadcasts, HR
  reminds you about cameras-on policy. They react to your actions in
  real time via the `EVENT_REACTIONS` table.
- **Meeting chats** — auto-created per meeting type the first time you
  accept one. Accumulates pre-meeting chatter (a seed message) plus
  post-meeting follow-ups when the meeting "happens" at end of day.
- **DMs** — 1:1 threads with named characters. These surface
  dynamically as templates fire based on triggers (morning, on-accept,
  on-decline, on-chaos, random). They support **player replies** — three
  options per DM, each shifting the stakeholder's relationship by
  +3 / 0 / −4 (scaled by the politics multiplier).

Every chat event keys off a `ChatEvent` discriminated union. New
mechanics generally add a new event type (`approval-cleared`,
`pr-disaster-fired`, `ai-notes-fired`, etc.) so chat can react.

---

## Save data

State persists to `localStorage` under the key `meeting-tycoon-save` via
Zustand's `persist` middleware. **Bumping `version` in
`src/game/store.ts` wipes all saves** on next load — done whenever new
state fields or new game-over reasons are added.

There's no migration logic. The game is short (25 days, ~30 min) so
losing a save on an upgrade is acceptable.

Current version: **14** (Stage 5 + Promotion screen).

---

## Reading the code

The full system maps cleanly onto a few files:

| File | What's in it |
|---|---|
| `src/game/types.ts` | All domain types — `Kpis`, `MeetingType`, `ChatEvent`, `GameOverReason`, `FlowScreen` |
| `src/game/data.ts` | `MEETING_TYPES`, `REQUEST_POOL` (keyed by day 1–25), `CHAOS_EVENTS`, `STAGE_GOALS`, `capFor`, `politicsMultiplier`, `stageGoalsFor` |
| `src/game/store.ts` | The Zustand store. Every game rule. Single source of truth. ~1300 lines, mostly comments. |
| `src/game/politics.ts` | Stakeholder roster, sentiment math, `senderToStakeholder`, `detectAlliances` |
| `src/game/chat.ts` | Seed conversations, `DM_TEMPLATES`, `EVENT_REACTIONS`, `MEETING_HELD_TEMPLATES` |
| `src/game/characters.ts` | Display name + avatar resolution |

If you want to know *why* a number moved, search `src/game/store.ts` for
the action that fired (`acceptRequest`, `declineRequest`, `resolveChaos`,
`endDay`, etc). Every relationship change and KPI delta has a comment
explaining it.
