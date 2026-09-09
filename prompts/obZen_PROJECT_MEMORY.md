# obZen — Project Memory
_Authoritative status: 2026-08-09. Supersedes the 2026-07-17 version._

## What it is
- Personal offline-first PWA. React 18 + TypeScript + Vite 5 + Dexie v4 (IndexedDB), Tailwind + custom dark "noircut" design system. Single-device, no backend, no accounts.
- **Repo:** Prawnit279/obZen — workflow is **direct commits to `main`, no PRs**.
- **Live:** https://prawnit279.github.io/obZen/ — auto-deploys via GitHub Actions on push to main.
- **Local dev:** `npm run dev` (Vite, port 5173).
- Last known good: HEAD `7d54baf6`, tree clean, in sync with origin/main, deployed green. Gates: tsc clean · 80/80 tests (vitest + fake-indexeddb) · prod build passes.

## Current shape
- **Nav:** Home / Train / Progress / Drums / Calendar / More. (Food/Nutrition and Yoga hidden via flags.)
- **One profile.** The switchers on Home, Train and Settings are gone; `ProfileId` is the single-member union `'pronit'`. The id string is a storage key (session stamps, bodyweight log, ladder rungs), not a display value, so it stays fixed.
- Sessions stamped with the retired second profile stay in the DB and in backups but no longer match `belongsToProfile`, so they neither display nor count. No in-app path back to them.
- `AISHWARYA_PROGRAM` is retained as an `EXERCISE_LIBRARY` source only — 15 movements exist nowhere else.

| | Current |
|---|---|
| Program | 3-day split (Pull/Legs/Arms, Zercher/Quad/Shoulders, Posterior/Delts) |
| Schedule | Rolling (rest Sun/Thu) — five training days vs the Train header's `/3`, known mismatch |
| Progress panels | SBD total, DOTS, strength standards |

## Key architecture decisions (do NOT re-derive)
- **`workoutDaySessions` is the single source of truth for workouts.** Legacy `workoutSessions` / `exerciseLogs` are written only by the import utility, never in normal use. Old writer path (`src/lib/workout.ts`, `ActiveSession.tsx`, `ActiveExercise.tsx`, `SetRow.tsx`) was deleted; the tables stayed, since backup/import still carry them and the Dashboard streak reads them. Reading the wrong table was the original "empty History" bug.
- **Exercise library is static TypeScript, not a Dexie table** — `src/data/obzen-program.ts` holds both profiles' programs, the derived deduped library, and the weekly schedules.
- **Dexie still at v4 — no migration ever run.** All fields added this session (`profileId`, `focus`, `completedAt`, `cue`, `coached`, `name`, `muscle`, `target`) are non-indexed, so no version bump needed. Any change to an **indexed** field requires a version bump + explicit user sign-off.
- **Sessions persist lazily** — opening/tabbing a day writes nothing; a row is created on first real mutation (guarded against double-insert). Fixed empty-session pollution.
- **Pre-profile sessions (no `profileId`) resolve to Pronit** via `LEGACY_PROFILE_ID` in `src/lib/workoutSession.ts`.

## Files that matter
- `src/config/features.ts` — `SHOW_NUTRITION=false`, `SHOW_VEDIC=false` (reversible hides)
- `src/config/profiles.ts` — the single profile: metadata, body comp, targets
- `src/data/obzen-program.ts` — both programs, exercise library, SCHEDULES, cues
- `src/lib/workoutSession.ts` — sessionHasActivity / loggedExercises / profile attribution
- `src/store/useWorkoutDayStore.ts` — lazy-persist store, keyed `${profile}::${day}::${date}`
- `src/store/useProfileStore.ts` — active profile, localStorage-backed
- `src/pages/SessionDetail.tsx` — read-only past session (`/workout/session/:id`)
- `src/components/modules/dashboard/WeekStrip.tsx` — Mon–Sun view + scheduled plan
- `scripts/gen-icons.mjs` — regenerates PWA icons deterministically

## Hidden, not deleted
Nutrition and Vedic gated behind `SHOW_NUTRITION` / `SHOW_VEDIC` — nav, routes, dashboard cards, and the Mahadasha/Atmakaraka fields in Settings. Page components and `nutritionLogs` / `savedMeals` / `vedicLogs` tables intact. Flip a flag to restore. **Ayurveda and Dosha stayed visible.**

## Working conventions
- Commit style `type(scope): description`, no Co-Authored-By (attribution disabled globally).
- **No new dependencies without asking.** `fake-indexeddb` was the only dev dep added this session.
- `gateguard` hook blocks Write on existing files — use Edit.
- Verify with `npx tsc --noEmit` + `npx vitest run` + `npm run build` before committing.

## Known open items
- Not yet added from Aishwarya's PDF (user chose cues only): the 8-min warm-up checklist and the ground-rules card (effort/tempo/progression). Source PDF: `/Users/pronit/Documents/Docs /Aishwarya_Phase1_Training_Plan2.pdf`.
- Drum PDFs not in repo (copyright + size). Hosted Sync degrades to "Add Book". Local bulk-load: files in `public/drum-import/` + MANIFEST in `src/utils/importDrumBooks.ts`.
- `obZen_workout_import.json` never placed in `/public/`, so Settings "Import Historical Workout Data" is wired but unused.
- CI warning (non-blocking): actions/checkout@v4 + setup-node@v4 target deprecated Node 20.
- Large bundles: vexflow (691KB gz) and pdf (135KB gz) in main path; lazy-load on Drum routes is the win.
- `.claude/checkpoints.log` (gitignored) has stale entries from an unrelated "prompturtle" project.

## Planned / not yet built — Progress dashboard + Strength tools (mockups approved)
Designed with Pronit, mockups approved, captured in the build prompt **`obZen_progress_dashboard_PROMPT.md`** (the authoritative spec — supersedes Task 10 of the older `obZen_train_update_PROMPT.md`). NOT in the codebase yet. Key build rules baked in: read from `workoutDaySessions` only (profile-filtered), no Dexie migration (static-TS fields + localStorage stores), propose chart lib + STOP before installing, Edit-not-Write, verify tsc + vitest + build.

**Progress dashboard (analytics):**
- Metrics compute-on-read: e1RM (Epley), SBD total, Wilks/DOTS (est.), strength-standard bands, weekly volume/tonnage, PR tracker. Land in a tested `src/lib/progress.ts`.
- `trackingMode` per exercise (`load`/`assisted`/`bodyweight-reps`/`timed`) + `isCompetitionLift` + `progressionPath` → fields in static TS `obzen-program.ts`, not Dexie.
- Bodyweight modes: assisted → assistance→0; bodyweight-reps → max reps + weekly volume; timed → best hold seconds; weighted-BW → BW+added effective load + % of BW.
- Progression ladder per movement (Negatives→Band→Machine→Bodyweight→Weighted); current rung user-set, per-profile, stored via localStorage-store pattern (no Dexie table).
- Panels are driven by the profile's `progress` config object: powerlifting framing (SBD/Wilks/standards) plus e1RM trend, volume and PRs.
- Needs a bodyweight log (reuse `checkIns` if present, else localStorage; new Dexie table only with sign-off).

**Strength tools — Lab area (`/workout/tools`), calculators + guide ONLY (user chose this; NO program engine, does not touch logged program):**
- 1RM calculator (Epley + Brzycki) with % table; Wilks/DOTS calculator; AMRAP → e1RM.
- 5/3/1 calculator: TM = 90% of 1RM; 3-week waves (Wk1 65/75/85, Wk2 70/80/90, Wk3 75/85/95, deload 40/50/60), final set = AMRAP.
- Joker sets (+5/+10/+15% off top set, low reps, optional); Boring But Big (5×10 @ 50/60/70% TM).
- Static 5/3/1 program guide (reference only).
- **All working weights round to nearest 5 lb** (user chose lb). 5/3/1 calc can auto-fill each lift's 1RM from logged e1RM.

**Calendar change (item 15):** move Calendar to LAST nav item; mark active-profile workout days (from `workoutDaySessions`); clicking a workout day opens that day's session detail. Don't rework calendar event logic beyond this.

**Open question still flagged:** pull real DOTS/Wilks coefficients + strength-standard bands from a vetted source rather than hardcode from memory.

**Build order (agreed roadmap, in `obZen_progress_dashboard_PROMPT.md`):** these advanced-analytics items are additional to the dashboard/tools/calendar. Critical path Phase 0 → A.
- Phase 0 (foundations): (1) e1RM + PR engine in `progress.ts`; (2) session RPE field (non-indexed); (3) bodyweight log (reuse `checkIns` or localStorage).
- Phase A (core 531 signals): (4) AMRAP rep progression across cycles [highest value]; (5) e1RM trend + projection/ETA; (6) stall detection + TM-reset nudge; (7) PR/achievements feed.
- Phase B (load/recovery): (8) sRPE weekly load; (9) acute:chronic workload ratio; (10) deload recommendation.
- Phase C (distribution/balance): (11) weekly sets/muscle vs MEV/MAV/MRV [need vetted thresholds]; (12) lift ratios / lagging-lift flag; (13) adherence heatmap.
- Phase D: (14) monthly summary PDF export.
- Deferred: intensity distribution by rep range, InBody-scan overlay.

## Pronit — health / body data (InBody 270, 2026-07-16)
5'8", age 32, male. Weight 158.3 lb, SMM 73.4 lb, body fat 18.4%, BMI 24.1, BMR 1636 kcal, LBM 129.2 lb. Segmental: arms 110–112% of ideal, legs ~100% (thighs lagging). Goal: gain arm + thigh muscle, progressing toward powerlifting. Bodyweight ~75 kg. Supplements: L-Theanine (occasional), Rhodiola (pre-workout), Omega oils (after lunch), Creatine + Vega protein. Guidance given: creatine 5 g daily (not just pre-workout); ~2,600–2,800 kcal, 120–160 g protein for muscle gain.
