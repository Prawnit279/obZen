# obZen — Train Overhaul + De-scope Prompt (paste into Claude Code)

You are a senior React/TypeScript frontend engineer working in the **obZen** repo. Make ONLY the changes listed below. Do not add features, refactors, or abstractions beyond what is requested.

## Context (carry forward — do not re-derive)
- **App:** obZen — offline-first personal PWA. React 18 + TypeScript + Vite 5, Dexie v4 (IndexedDB, 24-table schema), Tailwind + a custom dark "noircut" design system (`#111111` cards, `#2a2a2a` borders, text `#d4d4d4`/`#888888`/`#555555`, 2px radius, uppercase tracking-widest labels).
- **Nav:** Home / Train / Drum / Cal / Food / More. Routes include `/` (Dashboard), `/workout`, `/nutrition`, `/vedic`, `/ayurveda`, `/settings`.
- **Single shared app, single user profile.** Do NOT add multi-user or profile switching.
- **Dexie is the source of truth.** Schema lives in the db definition file (likely `src/db/dexie.ts`). Workout tables: `workoutSessions`, `workoutDaySessions`, `exerciseLogs`. There is a `meta` table (`++id, &key`) used as a sentinel/flag store for idempotent seeds/migrations.
- **First step: verify real paths.** File paths below are best-guess from memory. Before editing, use the Explore agent (or grep) to confirm actual component/route/table names. Never edit a path you have not confirmed exists.

## Global decisions (locked)
1. **Theme:** stay dark-themed. Do NOT switch to light. Lift background/card lightness a step and increase text contrast + base font size so everything is clearly readable. Keep the noircut identity.
2. **Scope changes are non-destructive.** Removing Nutrition and Astrology means **hide from nav + routes**, NOT delete. Keep all Dexie tables and existing data intact so they can be restored later.
3. **Ayurveda stays.** Only Vedic/astrology content is hidden.

---

## TASKS

### 1. Hide the Nutrition section (temporary, reversible)
- Remove the **Food/Nutrition** item from the bottom nav and hide the `/nutrition` route (comment out or feature-flag behind a single `const SHOW_NUTRITION = false` constant — do not delete the page component or the `nutritionLogs`/`savedMeals` tables).
- Remove the nutrition/macros card from the Dashboard (`/`) behind the same flag.

### 2. Hide all Astrology / Vedic content (keep Ayurveda)
- Hide the **Vedic** module: remove its nav/More-hub entry and hide the `/vedic` route (same reversible flag pattern, `const SHOW_VEDIC = false`; keep `vedicLogs` table + component).
- On the Dashboard, the daily tip currently shows "Vedic/Ayurveda" — keep the **Ayurveda** tip, remove the Vedic/astrology portion.
- In Settings profile, hide the astrology fields **Mahadasha** and **Atmakaraka**. Keep **Dosha** (Ayurveda). Do not delete the underlying values.

### 3. Train section — user-selected exercises per day (remove the fixed preset)
- Rework the Workout/Train flow so that for a given day the user **builds the day by selecting exercises from the exercise library**, instead of loading one hardcoded preset plan.
- Flow: pick a day → "Add exercise" → search/pick from the library → log sets/reps/weight. The user can add any number of exercises in any order.
- Remove/replace the current hardcoded preset workout so it no longer forces a fixed list. (Keep the data model; just change how a day is assembled.)

### 4. Seed the exercise library + 3 loadable day templates from the plan
Add every exercise below to the exercise library (idempotent seed guarded by a `meta` sentinel, e.g. `key: 'aishwarya-phase1-seed-v1'`). Also create **3 loadable day templates** (Day 1 / Day 2 / Day 3) the user can apply as a starting point and then edit freely. Store sets/reps/rest/swaps as fields or notes on each library exercise.

**Day 1 — Glutes & Hamstrings**
1. Hip Thrust Machine — 4×10–12, rest 90s — swaps: Barbell Hip Thrust, Single-Leg Hip Thrust, Cable Pull-Through
2. Romanian Deadlift — 3×10, rest 90s — swaps: Dumbbell RDL, Good Morning, Single-Leg RDL
3. Bulgarian Split Squat — 3×8/leg, rest 75s — swaps: Reverse Lunge, Step-Up, Walking Lunge
4. Leg Press (feet high & wide) — 3×12, rest 90s — swaps: Hack Squat, Goblet Squat, Smith Machine Squat
5. Cable Glute Kickback — 2×15/side, rest 45s — swaps: Machine Kickback, Banded Kickback, Frog Pump
6. Dead Bug (CORE) — 3×10/side, rest 45s — swaps: Hanging Knee Raise, Reverse Crunch, Bird Dog

**Day 2 — Upper Body & Core**
1. Assisted Pull-Up — 3×6–8, rest 90s — swaps: Lat Pulldown, Inverted Row, Band-Assisted Pull-Up
2. Assisted Dip — 3×6–8, rest 90s — swaps: Push-Up, Bench Dip, Chest Press Machine
3. Seated Cable Row — 3×10–12, rest 75s — swaps: Chest-Supported Row, One-Arm DB Row, Machine Row
4. Dumbbell Shoulder Press — 3×10, rest 75s — swaps: Machine Shoulder Press, Arnold Press, Landmine Press
5. Face Pull — 2×15, rest 45s — swaps: Reverse Pec Deck, Band Pull-Apart, Rear Delt Fly
6. Cable Pallof Press (CORE) — 3×10/side, rest 45s — swaps: Side Plank, Suitcase Carry, Half-Kneeling Chop
7. Hollow Body Hold (CORE) — 3×20–30s, rest 45s — swaps: Plank, Ab Wheel from Knees, Leg Lowers

**Day 3 — Legs, Deadlift & Glutes**
1. Deadlift — 4×5, rest 2–3 min — swaps: Trap-Bar Deadlift, Sumo Deadlift, Rack Pull, Kettlebell Deadlift
2. Barbell Back Squat — 3×8, rest 2 min — swaps: Goblet Squat, Hack Squat, Front-Foot-Elevated Split Squat
3. Hip Thrust Machine — 3×12, rest 90s — swaps: Glute Bridge, Cable Pull-Through, Single-Leg Hip Thrust
4. Walking Lunge — 2×10/leg, rest 75s — swaps: Reverse Lunge, Step-Up, Curtsy Lunge
5. Seated Leg Curl — 2×12, rest 60s — swaps: Lying Leg Curl, Nordic Negative, Stability Ball Curl
6. Cable Crunch (CORE) — 3×12, rest 45s — swaps: Reverse Crunch, Hanging Knee Raise, Ab Wheel

De-dupe by name so Hip Thrust Machine, Walking Lunge, Reverse Lunge, Step-Up, etc. exist once in the library even though they appear on multiple days/as swaps.

Also add a **`trackingMode`** field to every library exercise (used by Task 10). Values: `load` (barbell/dumbbell/machine weight — the default), `assisted` (machine/band-assisted, log the assistance weight), `bodyweight-reps` (push-ups, unassisted pull-ups — log reps only), `timed` (planks, holds — log seconds). Seed sensible defaults: Assisted Pull-Up / Assisted Dip → `assisted`; Dead Bug / Hollow Body Hold / Plank / Side Plank / Suitcase Carry → `timed`; Push-Up → `bodyweight-reps`; everything else → `load`. The log UI must show the right input for the mode (weight kg / assist kg / reps / seconds).

### 5. Bigger, brighter, clearer typography
- Raise the app base font size and line-height for readability (e.g. base 16px → 17–18px; ensure body copy is not below 15px anywhere).
- Increase contrast: promote muted greys (`#555555`/`#888888`) used for real content up toward `#d4d4d4`/near-white; keep only decorative labels muted.
- Lift card/background one shade lighter while staying dark. Apply via the design-system tokens, not one-off overrides, so it's consistent app-wide.

### 6. Bigger workout history rows with the full written date
- Enlarge each history entry (bigger text, more padding).
- Show the **complete date with the weekday spelled out**, e.g. `Monday, 12 August 2026` — not just "Mon 12" or a numeric day. Use a date formatter (weekday long + day + month long + year).

### 7. Persist and re-view a saved workout
- When a day's workout is **saved**, persist the exact exercises performed with their per-set weights/reps to Dexie (`workoutDaySessions` + `exerciseLogs`).
- The user must be able to reopen any past session later and see **which exercises were done and the weights used**. Add a read-only "session detail" view reachable from history.

### 8. Home shows this week's workout history
- On the Dashboard (`/`), add a **current-week view** (Mon–Sun) summarizing which workout was done on which day, so it's easy to see what to train on a given weekday. Show day name + whether a session exists + a quick summary (e.g. exercise count / muscle focus), linking into the session detail from Task 7.

### 9. Fix the empty History section — surface all data
- The History view currently shows **no data**. Debug the query so it reflects **all** saved sessions with exercises, weights, and dates.
- Likely causes to check: history reading from the wrong table (`workoutSessions` vs `workoutDaySessions`), a date filter excluding rows, sessions saved without the linking id, or a join between `workoutDaySessions` and `exerciseLogs` that returns empty. Confirm the actual save path writes what the history read expects, and make them consistent.

---

### 10. Progress & analytics dashboard (Train → "Progress" view)
Add a Progress view in the Train section that turns logged sets into strength analytics. Everything below is **computed on read from `exerciseLogs`** — no heavy schema changes. Two small additions only: a **bodyweight log** (date + kg; reuse `checkIns` if it already holds bodyweight, else add a minimal `bodyweightLogs` table) and a boolean flag on library exercises marking the **competition lifts** (`isCompetitionLift` for Barbell Back Squat, Bench Press, Deadlift) so the dashboard knows what to aggregate.

**Core strength metrics (mode `load`):**
- **Estimated 1RM (e1RM)** per exercise from working sets — Epley: `weight × (1 + reps/30)`. This is the primary progress number.
- **SBD total** — sum of best current e1RM for squat + bench + deadlift.
- **Wilks/DOTS score** — bodyweight-adjusted total, using the latest bodyweight log. Label it "(est.)". Put the coefficient formula in a small util; if unsure of exact coefficients, use DOTS and note the source in a code comment.
- **Strength standards** — per-lift and total bands (Novice → Intermediate → Advanced → Elite) for the user's bodyweight, shown as progress bars with a "X kg to next tier" readout.
- **Weekly volume/tonnage** — Σ(sets × reps × weight) per lift per week.
- **PR tracker** — best weight at each rep count (1–12) and all-time PRs with dates.

**Bodyweight/calisthenics tracking modes (drive off `trackingMode` from Task 4):**
- `assisted` — track the **assistance weight trending down**; goal line at 0 kg (= bodyweight). Chart shows assist decreasing = progress.
- `bodyweight-reps` — track **max reps in a set (AMRAP)** over time + **total weekly rep volume**.
- `timed` — track **best hold duration (seconds)** over time.
- Weighted bodyweight lifts (weighted pull-up/dip) use mode `load` with effective load = bodyweight + added weight, so they feed the same e1RM/relative-strength math; also show **added weight as % of bodyweight**.

**Progression ladder (per bodyweight movement):**
- A horizontal 5-rung path: Negatives → Band-assisted → Machine-assisted → Bodyweight → Weighted. Mark completed rungs, highlight the current rung, and show the next milestone (e.g. "5 kg assist to bodyweight"). Store the user's current rung per exercise (a small field on the library exercise or a `meta` key) — do not infer it silently; let the user set it.

**Layout:** stat-card row (e1RM squat/bench/deadlift, SBD total, Wilks) → e1RM trend line chart (S/B/D overlaid, distinct line styles, not color-only) → strength-standards progress bars → weekly volume bar chart + recent-PR list → a section of bodyweight-exercise cards (one per `trackingMode`, each with its mini trend) → progression ladders. Match the dark noircut style at the brighter/bigger sizing from Task 5.

**Charting:** obZen has no chart lib yet. Propose one (Recharts or Chart.js) and **STOP and ask before adding the dependency** per the checkpoints below. Do not hand-roll SVG charts unless the user declines a library.

## Skills & agents to use
- **Explore agent** — first, to map the real files: db schema, nav component, workout/history/dashboard components, and route definitions. Do not guess paths.
- **Plan agent** — produce a short implementation plan (touch list + order) before editing; Tasks 3, 7, 8, 9 are interconnected (they share the workout data model), so sequence them together.
- **`redesign-existing-projects`** or **`design-taste-frontend`** skill — for Tasks 5/6 (typography, contrast, history-row restyle) so changes go through design tokens and stay consistent, not ad-hoc.
- **`ai-regression-testing`** skill — after Task 9, verify the save→history round-trip (save a session, confirm it appears in History and in the Home weekly view with correct weights + full date).

## Constraints / do-not-touch
- Only make changes directly requested. No new dependencies without asking.
- Do NOT delete any Dexie table, page component, or existing user data. All "removals" are reversible hides.
- Do NOT touch: Drum, Calendar, Meetings, Projects, Yoga, Ayurveda modules, the PWA/service-worker config, or the export/import backup utilities.
- Keep the dark theme. No light mode.

## Checkpoints — output `✅ [what was done]` after each, and STOP + ask before:
- Any change to the Dexie **schema/version** (migrations affect existing data).
- Deleting or renaming any file.
- Adding any npm dependency.

## Done when
- Nutrition + Vedic/astrology are gone from nav/UI but code + tables remain; Ayurveda + Dosha still present.
- A day is built by selecting library exercises; the 3 plan templates load and are editable.
- All 19 plan exercises (deduped) are in the library with sets/reps/rest/swaps, each tagged with a `trackingMode`.
- Fonts are visibly larger and higher-contrast on a lighter-dark background, app-wide.
- History rows are larger and show e.g. `Monday, 12 August 2026`.
- Saving a workout persists exercises + weights; past sessions reopen with full detail.
- Home shows this week's Mon–Sun training summary.
- History displays all saved sessions with exercises, weights, and dates — verified by a real save→reload test.
- Progress view shows e1RM per lift, SBD total, Wilks (est.), strength-standard bars, weekly volume, and PRs — all computed from `exerciseLogs`.
- Bodyweight modes work: assisted shows assistance trending toward 0, `bodyweight-reps` shows max reps + weekly volume, `timed` shows best hold seconds; each renders its own card + mini trend.
- Each bodyweight movement has a 5-rung progression ladder with the current rung set by the user and the next milestone shown.
