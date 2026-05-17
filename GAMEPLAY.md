# Meeting Tycoon — How the Game Actually Works

> A reference for players who want to know what's behind the calendar, and
> for contributors who want to extend it without breaking the math.

This document is the gameplay manual. The [README](./README.md) is for
running the project. Start here if you want to know what every screen and
every number means.

<p align="center">
  <a href="https://babanomania.github.io/meeting-tycoon/"><strong>▶ Play in browser</strong></a>
  &nbsp;·&nbsp;
  <a href="./README.md">Back to README</a>
</p>

---

## Table of contents

1. [The premise](#the-premise)
2. [Onboarding](#onboarding)
3. [A typical day — the four core screens](#a-typical-day--the-four-core-screens)
4. [The six KPIs](#the-six-kpis)
5. [The recovery loop](#the-recovery-loop)
6. [The six stakeholders](#the-six-stakeholders)
7. [The five stages](#the-five-stages)
8. [Stage 1 — The First Week](#stage-1--the-first-week)
9. [Stage 2 — Welcome to Reality](#stage-2--welcome-to-reality)
10. [Stage 3 — Bureaucracy](#stage-3--bureaucracy)
11. [Stage 4 — Corporate Madness](#stage-4--corporate-madness)
12. [Stage 5 — Executive Absurdity](#stage-5--executive-absurdity)
13. [Chaos events](#chaos-events)
14. [Eight endings](#eight-endings)
15. [Chat](#chat)
16. [Save data](#save-data)

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

## Onboarding

A one-screen intro from David Chen — your boss — setting the assignment.
You're now "Meeting Manager," World's Okayest Manager. 23 employees. 127
meetings already on your calendar. **You can't actually decline.**

<p align="center">
  <img src="docs/assets/screenshots/02-onboarding.png" alt="Onboarding screen with David Chen's letter" width="380">
</p>

---

## A typical day — the four core screens

The game loop loops through four primary screens, accessible from a bottom
nav that mimics Teams / Outlook on mobile.

<table>
<tr>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/03-calendar.png" alt="Calendar agenda for Tuesday Day 2" width="320"><br>
  <sub><b>Calendar</b> — your agenda for today. Hours 9 AM – 6 PM, color-coded by priority. Recurring meetings carry over. The capacity strip shows "3/5 accepts left" and "7h focus." Goals pill at the top tracks 1/5 quarterly goals hit.</sub>
</td>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/04-inbox.png" alt="Inbox with five pending requests showing KPI projections" width="320"><br>
  <sub><b>Inbox</b> — pending meeting requests. Each card shows sender, duration, attendees, priority pill, the KPI delta, and how each goal moves if you accept. You can accept 3 more meetings today. Choose wisely.</sub>
</td>
</tr>
<tr>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/05-home.png" alt="Home screen — Acme Corp hero, quarterly goals, KPI x sponsor matrix" width="320"><br>
  <sub><b>Home</b> — company hero ("Wednesday · Day 3 of 5 · Another day at the office"), the 5 quarterly goals (1/5 hit), and the KPI×Sponsor matrix that pairs each metric with its owning stakeholder. Productivity → Raj. Morale → Maya. Burnout → Diana.</sub>
</td>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/06-people.png" alt="People — Boss happiness card and stakeholder hub-and-spoke map" width="320"><br>
  <sub><b>People</b> — Boss happiness front and center (David Chen, 62). The hub-and-spoke map below shows all six executives with relationship scores and sentiment labels (FRIENDLY / NEUTRAL / HOSTILE). Political Heat strip below.</sub>
</td>
</tr>
</table>

End of day → **Day Summary** screen:

<p align="center">
  <img src="docs/assets/screenshots/07-day-summary.png" alt="Day Summary with daily breakdown, Rest & Recovery card, KPI Impact, and David's feedback line" width="380">
</p>

Meetings held, time in meetings, decisions made — then the **Rest &
Recovery** card (when you leave slots unused), KPI Impact, and a one-line
boss feedback at the bottom: *"Light calendar, real output. The team
actually shipped something. Keep this up."*

---

## The six KPIs

All KPIs are 0–100. **Burnout is inverted** — lower is better, going down
shows as a green delta with a down arrow.

| KPI | Sponsor | What moves it up | What moves it down |
|---|---|---|---|
| **Productivity** | Raj (CTO) | Light calendar (rest), shield meetings, focus blocks | Crisis meetings, every accepted meeting, town halls |
| **Morale** | Maya (CHRO) | Culture syncs, retros, 1:1s, restraint | Town halls, reorgs, all-hands, PR disasters |
| **Burnout** | Diana (CFO) | _(lower = better)_ Rest, shield meetings | Crisis events, board pre-reads, day with no unused slots |
| **Alignment** | David (Boss) | Standups, OKRs, alignment meetings, pre-read syncs | Skipping recurring meetings, feuds (Stage 4+) |
| **Exec Confidence** | Marcus (CEO) | Board pre-reads, QBRs, attending CEO chaos, fast replies | Rescheduling executive chaos, PR disasters |
| **Visibility** | Tom (VP Strategy) | Town halls, all-hands, dashboard reports, board sync | "Cooking the books" (Stage 5+ costs 20 to fake ExecConf) |

The Home screen (above) pairs each KPI with its sponsor's relationship
score in a side-by-side matrix — making the cause/effect visible. A KPI's
sponsor going hostile usually means you're about to bleed that KPI.

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

The Day Summary screen above shows this explicitly: **2 slots unused →
+4 / −4 / +2** as a dedicated "Rest & Recovery" card with a soft green
accent. Restraint is a strategy. The card is the visible reward.

---

## The six stakeholders

The People screen renders them as a hub-and-spoke map with you in the
center. Each stakeholder is a real character — avatar, role, relationship
score 0–100, last-action note, trend indicator.

| Id | Name | Role | Why they matter |
|---|---|---|---|
| `boss` | **David Chen** | Director · your manager | Default relationship. Goal in every stage. Promotion gates through him. |
| `ceo` | **Marcus Hale** | Chief Executive | The Promotion letter writer. Posts on LinkedIn. Triggers PR Disaster with the Boss. |
| `cfo` | **Diana Vargas** | Chief Financial Officer | Audits the books. Blocks budgets. Gates Stage 5 Promotion. |
| `cto` | **Raj Patel** | Chief Technology Officer | Files "no-meeting Mondays" manifestos. Owns Productivity. |
| `chro` | **Maya** (CHRO) | People Ops lead | Owns Morale. Watches the reorg fallout in Stage 2+. |
| `vp_strategy` | **Tom Whitfield** | VP, Strategy | Owns Visibility. Brings frameworks. Feuds with CTO. |

Each starts at **50/100** (neutral). Every action that touches a
stakeholder shifts their relationship; the **People** map (shown above)
colors edges and rings by sentiment — friendly is teal, hostile is rose,
neutral is grey.

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

Crossing a stage boundary triggers a confetti splash that names the new
stage and previews the mechanics you're about to meet:

<table>
<tr>
<td width="25%" align="center">
  <img src="docs/assets/screenshots/10-stage-unlock-welcome-to-reality.png" alt="Stage 2 Unlocked — Welcome to Reality" width="220"><br>
  <sub><b>Stage 2</b><br>Welcome to Reality</sub>
</td>
<td width="25%" align="center">
  <img src="docs/assets/screenshots/11-stage-unlock-bureaucracy.png" alt="Stage 3 Unlocked — Bureaucracy" width="220"><br>
  <sub><b>Stage 3</b><br>Bureaucracy</sub>
</td>
<td width="25%" align="center">
  <img src="docs/assets/screenshots/12-stage-unlock-corporate-madness.png" alt="Stage 4 Unlocked — Corporate Madness" width="220"><br>
  <sub><b>Stage 4</b><br>Corporate Madness</sub>
</td>
<td width="25%" align="center">
  <img src="docs/assets/screenshots/13-stage-unlock-executive-absurdity.png" alt="Stage 5 Unlocked — Executive Absurdity" width="220"><br>
  <sub><b>Stage 5</b><br>Executive Absurdity</sub>
</td>
</tr>
</table>

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
- **Dashboard Report** — once-per-day daily action. +5 Visibility /
  +3 ExecConf, no Productivity cost.
- **Recurring Cost Inflation** — declining a `recurring` request now
  costs ×1.5 relationship hit (the team notices when you skip standup).
- **Reorg Whispers** — on one random day from Day 7 onward (forced on
  Day 10 if it hasn't fired), the `reorg-announce` chaos triggers at
  day-start regardless of your accept count.
- **Three new chaos events:** `reorg-announce`, `quarterly-surprise`,
  `two-town-halls`.

Both new defensive tools appear in the Calendar header — **Shield 60m**
(green, with a ×N counter once used) and **Send Report** (purple,
disables after the daily use):

<p align="center">
  <img src="docs/assets/screenshots/20-stage2-calendar-defensive-tools.png" alt="Stage 2 calendar showing Shield 60m and Send Report buttons in the header" width="380">
</p>

Note the new title ("Wednesday · Week 2"), the smaller capacity strip
showing "1/4 accepts left", and the **Focus Time (Blocked)** emerald block
mid-day — the player's own Shield Meeting in action.

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
  mental space until accepted or declined.
- **Pass to Boss** (chaos response) — new 4th option on the Chaos modal,
  Stage 3+. Zero KPI hit, −15 Boss relationship. The "is this worth the
  political cost?" test.
- **Politics ×1.5** — every relationship delta scales up.
- **Three new chaos events:** `cfo-blocks-budget`, `cto-no-meeting-mondays`,
  `vp-quarterly-deepdive`.

<table>
<tr>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/21-stage3-inbox-approval-chains.png" alt="Stage 3 inbox showing a Project Kickoff request with a green 'Ready to accept · 3/3' chip" width="320"><br>
  <sub><b>Approval chains in action.</b> Top card: a Project Kickoff that needed 3 of 5 sign-offs. CFO, CTO, and VP have signed — the chip is green and Accept is no longer disabled. Avatars of the approvers are shown right on the card.</sub>
</td>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/24-chaos-modal-pass-to-boss.png" alt="Chaos modal showing CFO chaos with four response options including Pass to Boss" width="320"><br>
  <sub><b>Pass to Boss</b> appears as the fourth chaos option in Stage 3+. Zero KPI hit, but David Chen takes a relationship hit ("They will remember"). The trade-off is the joke.</sub>
</td>
</tr>
</table>

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
- **Four new chaos events:** `backchannel-cfo`, `feud-cto-vp`,
  `ceo-linkedin-disaster`, `board-pre-read-rush`.

The People map gains green **ALLIANCE** arcs the moment a pair both cross
≥70 — three are visible here (boss⇄CEO, CFO⇄CEO, CEO⇄VP):

<p align="center">
  <img src="docs/assets/screenshots/22-stage4-people-alliances.png" alt="Stage 4 People screen with three green ALLIANCE chips overlaying the stakeholder map" width="380">
</p>

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
  focus time.
- **AI Meeting Notes Bot** — at day-end, for every meeting type held,
  an `Acme AI Notes Bot` message fires in `#general` ("Summary attached.
  Key takeaway: alignment. Action items: alignment."). +1 Visibility /
  −1 Morale per fire, compounding.
- **Legacy Meetings** — at every Stage 5 day-start, one "Legacy Sync
  (Inherited)" meeting auto-appears on the calendar. **Cannot be
  removed.** Predates the calendar system itself.
- **Cook the Books** — once-per-day action. **−20 Visibility for
  +10 ExecConf today.** Queues **−15 ExecConf for tomorrow** as
  `illusionDebt`. The math is a long-run loss; the short-run optics win
  is the temptation.
- **Three new chaos events:** `committee-spawn`, `ai-takeover`,
  `cfo-illusion-audit`.

The Calendar header gains the third defensive button — **Cook the Books**
(amber). The agenda below shows all three Stage 5 meeting types at once:
a recurring Standup, the undeclinable Legacy Sync, a real QBR, and an
auto-spawned Follow-up Committee:

<p align="center">
  <img src="docs/assets/screenshots/23-stage5-calendar-cook-the-books.png" alt="Stage 5 calendar with Shield, Send Report, and Cook the Books buttons; agenda shows Standup, Legacy Sync (Inherited), Quarterly Business Review, and Follow-up Committee" width="380">
</p>

**The Day 25 Promotion** — endgame evaluation:

- **5 of 5 goals hit** → **Promoted to VP of Synergy**. Confetti. David
  writes a real letter.
- **3–4 hit** → **"Lateral move"**. Same Promotion screen, muted copy.
- **≤2 hit** → **Performance Improvement Plan** (8th failure mode).

---

## Chaos events

Random corporate interruptions that fire during day play, between accept
#2 and accept #4 with a ~60% chance. The Chaos modal slides up from the
bottom and shows the consequences of each response upfront — you're never
surprised by the math, only by the situation.

Each chaos event has up to **four responses**, each with its own KPI
impact and relationship hit:

- **Attend** — take the productivity hit, keep the boss happy.
- **Delegate** — send a warrior in your place. Less KPI cost, mild
  relationship hit.
- **Reschedule** — punt the meeting. Big relationship hit.
- **Pass to Boss** _(Stage 3+ only)_ — punt it to David. Zero KPI hit,
  −15 Boss relationship. "They will remember."

(See the Chaos modal screenshot in the [Stage 3](#stage-3--bureaucracy)
section above.)

The stage you're in determines the pool: Stage 1 has 4 events (CEO Quick
Sync, Reply-All Storm, Mandatory Fun Friday, Executive LinkedIn Post).
Stages 2–5 add 3–4 each. Some are force-fired regardless of accept count
(Stage 2's Reorg, Stage 4's Day 20 Board Sync).

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

Every failure uses the same screen pattern — a thematic icon, the named
ending, an in-character body paragraph, your final 6-KPI snapshot, and a
"Start over" button. The Promotion (win) screen is a different surface:
full-bleed brand purple gradient, confetti, David's congrats letter, and
a stats card summarizing the 25-day run.

<table>
<tr>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/40-game-over-restructured.png" alt="Game Over screen — You've Been 'Restructured' — with final KPI state and HR's lateral move letter" width="320"><br>
  <sub><b>A failure ending</b> — the "Restructured" screen with HR's lateral-move letter and the final 6-KPI snapshot showing how the run ended.</sub>
</td>
<td width="50%" align="center">
  <img src="docs/assets/screenshots/41-promotion-won.png" alt="Promotion screen — You've been promoted — with confetti, David Chen's letter, and the 25-day stats" width="320"><br>
  <sub><b>The win condition.</b> Confetti, "You've been promoted." Day 25 / 5/5 goals hit / OUTCOME: PROMOTED. David writes the congrats letter himself.</sub>
</td>
</tr>
</table>

---

## Chat

The chat system (`#general`, `#engineering`, `#leadership`, `#culture`)
seeds with corporate gossip on Day 1 and reacts to your actions
throughout the run. Three kinds of conversations:

- **Group channels** — read-only. The team gossips, leadership
  broadcasts, HR reminds you about cameras-on policy. They react to your
  actions in real time via the `EVENT_REACTIONS` table.
- **Meeting chats** — auto-created per meeting type the first time you
  accept one. Accumulates pre-meeting chatter plus post-meeting
  follow-ups when the meeting "happens" at end of day.
- **DMs** — 1:1 threads with named characters. These surface
  dynamically as templates fire based on triggers (morning, on-accept,
  on-decline, on-chaos, random). They support **player replies** — three
  options per DM, each shifting the stakeholder's relationship by
  +3 / 0 / −4 (scaled by the politics multiplier).

<p align="center">
  <img src="docs/assets/screenshots/08-chat-list.png" alt="Chat list showing four group channels and two incoming DMs (Acme Ops, Marcus Hale)" width="380">
</p>

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

---

## Regenerating these screenshots

```bash
npm run dev          # in one terminal
npm run screenshots  # in another — Playwright + Chromium
```

The script (`scripts/take-screenshots.mjs`) opens the live preview, pokes
the Zustand store via `window.__useGame.setState(...)` to land on each
scene, and saves PNGs to `docs/assets/screenshots/`. The script wipes the
output directory before each run, so renaming a scene won't leave orphan
files behind. Store exposure on window is dev-only — see `src/main.tsx`.
