# Meeting Tycoon

> A satirical corporate management sim. Schedule meetings. Survive politics. Maintain the illusion.

<p align="center">
  <img src="docs/assets/hero.svg" alt="Meeting Tycoon — a mobile-styled calendar overflowing with meetings, KPI chips, and a panicked Slack message from engineering" width="100%">
</p>

You play a new manager at **Acme Corp**, a 23-person company that holds 127
meetings a week and spends 2% of its time on actual work. Your job: triage an
inbox of meeting requests, defend your calendar, keep six leadership
stakeholders happy, and survive the slow descent from "promising new manager"
to "VP". Each day plays in about 90 seconds. Each stage adds one new mechanic
designed to make the last stage's mechanics harder.

The game is the joke. The joke is corporate life.

---

## Stack

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS** for styling — Microsoft Fluent–inspired (tight 4–8 px corners, subtle shadows)
- **Zustand** for state (with localStorage `persist`)
- **Framer Motion** for animation

Single-page app, mobile-first, designed to look like Microsoft Teams /
Outlook running on a phone. Renders inside a `<PhoneFrame />` on desktop so
the simulation always feels handheld.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run typecheck  # tsc -b --noEmit
```

No backend. No accounts. The game state lives in `localStorage` under the key
`meeting-tycoon-save` — bumping `persist.version` in `src/game/store.ts`
wipes all saves on next load.

---

## The five stages

Each stage runs 5 in-game days. Pressure scales with new constraints, not
more numbers.

| Stage | Days | Theme | Big idea |
|---|---|---|---|
| **1** | 1–5 | The First Week | 6 requests/day, 5 accepts, learn the ropes |
| **2** | 6–10 | Welcome to Reality | 8 requests/day, cap drops to 4, Shield Meeting + Dashboard Report unlock, one forced Reorg |
| **3** | 11–15 | Bureaucracy | Approval chains (3 of 5 sign-offs), Pass-to-Boss chaos option, Politics ×1.5, Process Paralysis failure |
| **4** | 16–20 | Corporate Madness | Stakeholder alliances, crisis stacking, the Board Sync climax *(in design)* |
| **5** | 21–25 | Executive Absurdity | Mandatory committees, AI Notes Bot, the Executive Dashboard illusion *(in design)* |

Stages 1, 2, and 3 are fully playable today. Stages 4–5 have a complete
design doc and ship in subsequent build sessions. See
`docs/gameplay-plan.md`-style notes referenced in the project plan for the
full spec.

---

## The KPI loop

Six KPIs, each sponsored by a real stakeholder. Burnout is inverted (lower
is better — going down shows green).

| KPI | Sponsor | What moves it |
|---|---|---|
| Productivity | CTO Raj Patel | Few meetings = up. Escalations = down. |
| Morale | CHRO | Culture syncs, retros = up. Town halls, reorgs = down. |
| Burnout | CFO Diana Vargas | Recovery on light days. Crisis meetings = up. |
| Alignment | Your Boss David Chen | Standups, OKRs, alignment meetings = up. |
| Exec Confidence | CEO Marcus Hale | Board pre-reads, QBRs, replying fast = up. |
| Visibility | VP Strategy Tom Whitfield | Town halls, dashboards = up. |

End of each day, the boss writes you a one-line review. End of each stage,
you either advance or get a thematic game-over: **Team Walkout**, **Forced
Sabbatical**, **You've been "Restructured"**, or the all-time classic
**Reassigned to Special Projects**.

---

## The recovery loop (Stage 0 polish)

The single most important mechanic. For every unused accept slot at end of
day, the team earns:

- **Productivity +2**
- **Burnout −2**
- **Morale +1**

An empty calendar earns +10 / −10 / +5. A maxed-out day earns nothing.
**Restraint is a strategy.** Without this, every play feels like losing.
Surfaced as its own "Rest & Recovery" card on the Day Summary.

---

## Project layout

```
src/
├── components/          # PhoneFrame, KpiToast, StakeholderMap, etc.
├── game/
│   ├── data.ts          # MEETING_TYPES, REQUEST_POOL, CHAOS_EVENTS, STAGE_GOALS
│   ├── store.ts         # Zustand store — single source of truth
│   ├── chat.ts          # Channel + DM templates + event reactions
│   ├── types.ts         # Domain types
│   ├── politics.ts      # Stakeholder relationship math
│   └── characters.ts    # Display name + avatar resolution
├── screens/
│   ├── Onboarding.tsx
│   ├── Calendar.tsx     # Day-of-week agenda grid
│   ├── Inbox.tsx        # Meeting requests + impact projection
│   ├── Chat.tsx         # Teams-style threads
│   ├── Home.tsx         # Company hero + Quarterly Goals + KPI×People matrix
│   ├── People.tsx       # Stakeholder map (hub-and-spoke SVG)
│   ├── DaySummary.tsx
│   ├── StageUnlock.tsx
│   └── GameOver.tsx
└── App.tsx              # Screen router
```

The store (`src/game/store.ts`) is intentionally thick — every gameplay rule
lives there so the UI stays a thin projection of state. New mechanics
generally mean: a new action on the store + a new screen surface that calls
it + an entry in `EVENT_REACTIONS` so chat reflects the change.

---

## Adding a new meeting type

1. Add the id to `MeetingTypeId` in `src/game/types.ts`.
2. Add a `MeetingType` entry to `MEETING_TYPES` in `src/game/data.ts` with
   `durationMin`, `attendees`, `priority`, `impact`, and a `flavor` line of
   corporate humor.
3. (Optional) Add it to `MEETING_CHAT_META` and `MEETING_HELD_TEMPLATES` in
   `src/game/chat.ts` so the meeting gets a chat thread and post-meeting
   chatter.
4. Reference it from a day in `REQUEST_POOL` (or trigger it from a chaos
   event / a new action).

That's it — the calendar, inbox impact projection, KPI math, and Day Summary
all pick it up automatically.

---

## Design references

- **Microsoft Fluent UI** — corner radii (4–8 px), elevation, MessageBar
  layout for the KPI toast
- **Microsoft Teams / Outlook mobile** — channel list, thread view, avatar
  initials, reaction strip
- **The actual experience of working at a SaaS company** — primary source
  material

---

## Status

Stage 1 ✅ · Stage 2 ✅ · Stage 3 ✅ · Stages 4–5 designed, not yet built.

No tests yet — gameplay is iterated through playthroughs. The build is the
test plan: typecheck (`npm run typecheck`) and production build
(`npm run build`) must stay green. Add a [Stage 3+] commit log entry when
you ship the next stage.

---

## License

Private project. All corporate satire intentional.
