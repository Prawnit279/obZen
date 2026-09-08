# obZen — Progress & Analytics Dashboard (paste into Claude Code)

You are a senior React/TypeScript engineer working in the **obZen** repo. Build a strength-progress dashboard in the Train section. Make ONLY what's specified. No features, refactors, or abstractions beyond this.

## Context (carry forward — this is the real 2026-08-09 architecture, do not re-derive)
- Offline-first PWA. React 18 + TS + Vite 5 + Dexie v4 (IndexedDB), Tailwind + dark "noircut" design system. Single device, no backend, no accounts. Repo `Prawnit279/obZen`, **direct commits to `main`, no PRs**.
- **Read source of truth for workouts is `workoutDaySessions` ONLY.** The `workoutSessions` / `exerciseLogs` tables are legacy, written only by the import utility — treat them as dead. Reading the wrong table caused the original empty-History bug. Do not read them here.
- **The exercise library is static TypeScript**, not a Dexie table: `src/data/obzen-program.ts` (both profiles' programs, the derived deduped library, `SCHEDULES`, cues).
- **Two profiles** (Pronit | Aishwarya) via `src/store/useProfileStore.ts` (active profile, localStorage). Sessions are attributed by `profileId`; pre-profile rows resolve to Pronit via `LEGACY_PROFILE_ID` in `src/lib/workoutSession.ts`. The dashboard MUST show only the active profile's data.
- **Dexie is at v4 and no migration has ever run.** Fields added so far are all non-indexed. Adding an indexed field OR a new table/store = a version bump = **STOP and get explicit user sign-off first.**
- Session store: `src/store/useWorkoutDayStore.ts`, keyed `` `${profile}::${day}::${date}` ``, persists lazily (row created on first real mutation). Attribution/derivation helpers: `sessionHasActivity`, `loggedExercises` in `src/lib/workoutSession.ts`. Read-only past session: `src/pages/SessionDetail.tsx`. Week view: `src/components/modules/dashboard/WeekStrip.tsx`.

## STEP 0 — read before writing (don't guess shapes)
Use the Explore agent, then read in full: `src/data/obzen-program.ts`, `src/lib/workoutSession.ts`, `src/store/useWorkoutDayStore.ts`, `src/config/profiles.ts`, the Dexie schema/db definition, and `SessionDetail.tsx`. Confirm the **exact per-set shape** logged in `workoutDaySessions` (how weight, reps, and any per-set fields are stored) and how `loggedExercises` returns data. Build every calculation against the real shape you observe, not an assumed one. Produce a short plan (Plan agent) before editing.

## Repo constraints (hard)
- No new dependencies without asking. `gateguard` hook blocks `Write` on existing files — use `Edit`.
- No Dexie version bump / no new indexed field / no new table without explicit user sign-off (STOP and ask).
- Before any commit: `npx tsc --noEmit` && `npx vitest run` (keep the existing 80/80 green) && `npm run build`. Commit style `type(scope): description`, no Co-Authored-By.
- Keep the dark noircut theme, at the brighter/bigger sizing already in the app.

---

## FEATURE: Progress view

Add a **Progress** view inside Train (new route, e.g. `/workout/progress`, linked from the Train area). All analytics are **computed on read from `workoutDaySessions` filtered to the active profile** — no data duplication.

### 1. Static-TS additions (`src/data/obzen-program.ts`)
Add to each library exercise (these are non-indexed static data, no Dexie change):
- `trackingMode`: `'load' | 'assisted' | 'bodyweight-reps' | 'timed'` (default `'load'`). Seed: Assisted Pull-Up / Assisted Dip → `assisted`; Hollow Body Hold / Plank / Side Plank / Suitcase Carry / Dead Bug → `timed`; Push-Up → `bodyweight-reps`; rest → `load`.
- `isCompetitionLift`: boolean — true for Back Squat, Bench Press, Deadlift (Pronit's SBD). 
- `progressionPath?`: ordered rung labels for bodyweight movements (default `['Negatives','Band-assisted','Machine-assisted','Bodyweight','Weighted']`).

### 2. Calculations (pure functions + unit tests)
Put these in a new `src/lib/progress.ts` with vitest coverage:
- **e1RM** (mode `load`): Epley `weight * (1 + reps/30)`; use the best working set per exercise per session. For weighted bodyweight lifts, effective load = bodyweight + added weight.
- **Best current e1RM** per exercise (rolling max over recent sessions).
- **SBD total** = Σ best e1RM of the three `isCompetitionLift` exercises.
- **Weekly volume/tonnage** = Σ(sets × reps × weight) per lift per ISO week.
- **PRs**: best weight at each rep count 1–12, and all-time e1RM PR, with the session date.
- **Wilks/DOTS (est.)**: bodyweight-adjusted total. Use the standard **DOTS** formula; put the coefficients in one clearly-commented constant block and label the UI value "(est.)". **Flag in your summary that the coefficients + strength-standard thresholds should be user-reviewed** — do not present them as authoritative.
- **Strength standards**: per-lift + total bands (Novice → Intermediate → Advanced → Elite) for the user's bodyweight/sex; return current band + kg-to-next.

### 3. Bodyweight tracking modes (from `trackingMode`)
- `assisted` — chart the **assistance weight trending down** toward a 0 kg goal line (down = progress).
- `bodyweight-reps` — **max reps in a set** over time + **weekly total rep volume**.
- `timed` — **best hold duration (sec)** over time.
- Each renders a card (label, current value + delta, mini trend) styled like the existing noircut cards.

### 4. Progression ladder
Per bodyweight movement: horizontal rungs from `progressionPath`, completed rungs marked, current rung highlighted, next milestone shown (e.g. "5 kg assist to bodyweight"). The **current rung is user-set and per-profile** — it's mutable state, so it CANNOT live in the static TS. Persist it via the existing localStorage store pattern (like `useProfileStore`), keyed by `profileId + exerciseId`. Do NOT add a Dexie table for this.

### 5. Bodyweight log (for Wilks + weighted-BW effective load)
Wilks/DOTS needs bodyweight over time. **First check whether a `checkIns` (or similar) table already stores bodyweight and reuse it.** If nothing suitable exists, persist a lightweight bodyweight log via the localStorage-store pattern rather than a new Dexie table — and if you believe a Dexie table is genuinely required, STOP and ask (version bump + sign-off).

### 6. Profile-aware panels
The dashboard adapts to the active profile:
- **Pronit** (powerlifting goal): SBD total, e1RM stat cards for S/B/D, Wilks (est.), strength-standard bars, weekly volume, PRs, plus his bodyweight-mode cards + ladders.
- **Aishwarya** (Phase 1 glutes/core/fat-loss — powerlifting framing does NOT apply): lead with e1RM trend for her key lifts (hip thrust, RDL, squat), weekly volume, PRs, and a **bodyweight trend** line; show her bodyweight-mode cards + ladders. Hide SBD/Wilks/powerlifting-standards for her.
- Make "which lifts are key" and "show powerlifting panels?" a small per-profile config object, not hardcoded conditionals scattered through the view.

### 7. Layout (noircut, brighter/bigger)
Stat-card row → e1RM trend line chart (key lifts overlaid, distinct line styles so it's not color-only) → standards bars (Pronit) / bodyweight trend (Aishwarya) → weekly volume bar chart + recent-PR list → bodyweight-mode cards → progression ladders. Reuse existing card/token styles.

### 8. Charting
obZen has no chart library yet. **Propose one (Recharts or Chart.js) and STOP for approval before installing.** If the user declines a dependency, render lightweight inline SVG charts instead (line + bar only).

## FEATURE: Strength tools & 5/3/1 reference (calculators + guide only)
Add a **Lab / Tools** area in Train (e.g. `/workout/tools`). These are stateless calculators + a static reference — **do NOT build a program engine, and do NOT change the user's current logged program.** All working-weight outputs round to the **nearest 5 lb**. If obZen stores lifts in kg, convert for display but keep 5 lb rounding on the lb output (offer a kg/lb view only if the app already has a unit setting).

### 9. One Rep Max calculator
- Input: weight + reps → estimated 1RM (Epley `w*(1+reps/30)`; also show Brzycki for comparison).
- Output a percentage table off the e1RM (95/90/85/80/75/70/65/60/55/50%) with rounded loads, so it doubles as a working-weight reference.

### 10. Wilks / DOTS / AMRAP calculator
- **Wilks & DOTS**: input bodyweight + sex + total (or a single lift) → score, both formulas side by side, labelled "(est.)". Reuse the coefficient block from `progress.ts`; flag coefficients for user review.
- **AMRAP**: input the weight + reps of a top/AMRAP set → estimated 1RM, and (optional) compare against an expected-reps target.

### 11. 5/3/1 calculator
- Input: estimated 1RM per lift → **Training Max = 90% of 1RM** (rounded 5 lb).
- Generate the standard 3-week wave working sets off TM (rounded 5 lb):
  - Week 1 (5/5/5+): 65% / 75% / 85%
  - Week 2 (3/3/3+): 70% / 80% / 90%
  - Week 3 (5/3/1+): 75% / 85% / 95%
  - Deload (optional toggle): 40% / 50% / 60%
- Mark the final set of each week as the AMRAP ("+") set.

### 12. Joker sets
- From the top set weight (or TM), generate optional heavier sets by adding ~5% increments (e.g. +5% / +10% / +15%) for low reps (1–3), rounded 5 lb. Clearly labelled optional/autoregulated — only when the top set felt strong.

### 13. Boring But Big (BBB)
- From TM, compute 5×10 BBB weight at a selectable percentage (50% / 60% / 70%, default 50%), rounded 5 lb. Let the user pick same-lift or opposite-lift BBB (display note only — no program change).

### 14. 5/3/1 program guide (static reference)
- A read-only reference page explaining: Training Max (why 90%), the 3-week wave + rep scheme, the AMRAP top set and its purpose, cycle progression (+5 lb upper body, +10 lb lower body to TM each cycle), the deload, Joker sets, and BBB. Plain-language, matches the noircut style. Reference only — it does not drive any logging.

## FEATURE: Calendar nav change
### 15. Move Calendar to the end of the nav + workout markers
- Reorder the bottom nav so **Calendar is the last item** (e.g. Home / Train / Drum / More / Cal).
- On the calendar, **mark days that have a logged workout for the active profile** (a dot/indicator; read from `workoutDaySessions`, profile-filtered).
- **Clicking a marked workout day navigates to that day's session detail** (`SessionDetail`, `/workout/session/:id` or the equivalent day route). Non-workout days behave as they do today.

## Build order (phased roadmap — follow this sequence)
Build and commit in phases; each phase should be tsc-clean, tests green, and build-passing before starting the next. Effort: S ≤ half day, M ~1–2 days, L ~3+. Everything reads from `workoutDaySessions` (profile-filtered) unless noted. The advanced-analytics items (Phase A–D below) are IN ADDITION to the dashboard/tools/calendar features specified above; the critical path is Phase 0 → A.

**Phase 0 — Foundations (do first; they unlock the rest)**
1. e1RM + PR engine in `src/lib/progress.ts` — Epley e1RM, best-per-session, all-time + rep PRs. `M`. Prerequisite for A4/A5/A6/A7.
2. Session RPE field — one non-indexed field per session (no Dexie migration). `S`. Unlocks all of Phase B.
3. Bodyweight log — reuse `checkIns` if present, else localStorage store. `S`. Unlocks relative strength + accurate Wilks.

**Phase A — Core 531 progress signals (highest payoff)**
4. AMRAP rep progression across cycles — this-cycle vs last-cycle AMRAP e1RM per lift/week. `M`. Needs #1. Highest-value view for a 531 user.
5. e1RM trend + projection — slope (lb/week) + ETA to a goal. `M`. Needs #1.
6. Stall / plateau detection + TM-reset nudge — flag lifts with no PR in N weeks. `S`. Needs #1, #4.
7. PR / achievements feed — reuses #1. `S`.

**Phase B — Load & recovery**
8. Session load (sRPE) — RPE × reps, weekly trend. `S`. Needs #2.
9. Acute:chronic workload ratio gauge — 7-day vs 28-day tonnage. `M`.
10. Deload recommendation — combines #6 + #8 + #9. `S`. Build last in this phase.

**Phase C — Distribution & balance**
11. Weekly sets per muscle vs MEV/MAV/MRV landmarks (color-coded). `M`. Needs vetted threshold values — do NOT hardcode from memory; pull from a source or flag for user review.
12. Lift ratios / lagging-lift flag (bench:squat:deadlift, push/pull). `S`.
13. Adherence heatmap — planned vs completed, per-weekday. `S`. Independent; can pull earlier as a quick win.

**Phase D — Reporting**
14. Monthly summary export — PDF recap of lifts, tonnage, PRs, bodyweight change. `M`. Build once the metrics exist.

Deferred (nice-to-have refinements, not in this build): intensity distribution by rep range, InBody-scan overlay on strength trend.

## Skills & agents
- **Explore** — Step 0, map the real data shapes and existing Train/route wiring.
- **Plan** — sequence: static-TS fields → `progress.ts` + tests → data hooks → view + charts → profile config.
- **`ai-regression-testing`** — write vitest tests (fake-indexeddb) for e1RM, weekly volume, PR detection, and profile filtering; verify a seeded session flows into every metric. Keep total suite green.

## Do NOT touch
Drum, Meetings, Projects, Yoga, Ayurveda; the hidden Nutrition/Vedic flags; PWA/service-worker config; export/import utilities; the legacy `workoutSessions`/`exerciseLogs` writer path. (Calendar IS in scope — item 15 only: nav reorder, workout markers, click-through. Don't rework its event logic beyond that.)

## Checkpoints — output `✅ [what was done]` per step, and STOP + ask before:
- Any Dexie **version bump**, new **table**, or new **indexed field**.
- Adding any **npm dependency** (incl. the chart library).
- Deleting or renaming any file.

## Done when
- A Progress route exists in Train, showing only the active profile's data, computed from `workoutDaySessions`.
- e1RM, SBD total (Pronit), Wilks (est.), standards, weekly volume, and PRs all compute correctly from real logged sets — proven by vitest tests.
- `trackingMode` drives the right metric per exercise: assisted → assistance↓, `bodyweight-reps` → max reps + volume, `timed` → seconds.
- Each bodyweight movement shows a progression ladder with a user-set, per-profile current rung.
- Profile switch re-renders the correct panel set (Pronit powerlifting vs Aishwarya glute/core + bodyweight trend).
- No Dexie migration was introduced (or, if unavoidable, it was signed off).
- A Lab/Tools area exists with working calculators: 1RM, Wilks/DOTS, AMRAP, 5/3/1 (TM + 3-week wave), Joker sets, BBB — all rounding to 5 lb, tested for correct math.
- A static 5/3/1 program guide page is reachable for reference (no logging behaviour).
- Calendar is the last nav item, marks the active profile's workout days, and clicking a workout day opens that day's session detail.
- `tsc` clean, full vitest suite green (existing 80 + new), `npm run build` passes.
