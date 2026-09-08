# obZen — Project Status

> Snapshot of how the app is put together and why, written to bring a new
> session (or a new pair of eyes) up to speed without re-deriving decisions.
> Last updated at commit `7d54baf6`.

## What it is

Personal offline-first PWA — **React 18 + TypeScript + Vite 5 + Dexie v4
(IndexedDB)**, Tailwind with a custom dark "noircut" design system.
Single-device, no backend, no accounts.

- **Repo:** `Prawnit279/obZen` — direct commits to `main`, no PR workflow
- **Live:** https://prawnit279.github.io/obZen/ — GitHub Actions deploys on push to `main`
- **Dev:** `npm run dev` (Vite, port 5173)
- **Gates:** `npx tsc --noEmit` · `npx vitest run` (80 tests) · `npm run build`

## Current shape

**Navigation:** Home / Train / Drum / Cal / More. (Food is hidden — see
[Hidden, not deleted](#hidden-not-deleted).)

**Two profiles**, switched from the Home header (`Pronit` | `Aishwarya`,
persisted in `localStorage`, defaults to Pronit). The active profile drives the
training program, the weekly schedule, and which workout history is shown.

This is **not authentication** — it is a view switch over one shared device
database. Anyone using the device can switch to either profile. Real separation
would need a backend with accounts.

| | Pronit | Aishwarya |
|---|---|---|
| Program | 3-day split (Pull/Legs/Arms, Zercher/Quad/Shoulders, Posterior/Delts) | Phase 1 · Weeks 1–4 · Glutes, Core & Strength |
| Schedule | Rolling pattern (rest Sun/Thu) | Fixed Mon/Wed/Fri, walks Tue/Thu, rest Sat/Sun |
| Coaching cues | — | All 19 exercises, verbatim from her Phase 1 plan |

## Architecture decisions

These are settled. Re-opening one is a deliberate choice, not a default.

1. **`workoutDaySessions` is the single source of truth for workouts.**
   The legacy `workoutSessions` / `exerciseLogs` tables still exist but are
   written *only* by the import utility, never by normal use, and read only by
   the Dashboard streak. The old writer path — `src/lib/workout.ts`,
   `ActiveSession.tsx`, `ActiveExercise.tsx` and `SetRow.tsx` — was deleted;
   the tables stayed, because backup and import still carry them. History
   reading the wrong table was the original "empty History" bug.

2. **The exercise library is static TypeScript, not a Dexie table.**
   `src/data/obzen-program.ts` holds both programs, the derived deduped
   library, the weekly schedules, and the coaching cues. No seeding, no
   migration, inherently idempotent.

3. **Dexie is still at version 4 — no migration has ever been run.**
   Every field added recently (`profileId`, `focus`, `completedAt`, `cue`,
   `coached`, `name`, `muscle`, `target`) is **non-indexed**, which Dexie
   allows without a version bump. Changing an *indexed* field would require a
   version bump and a migration — treat that as a stop-and-confirm change,
   since it touches existing user data.

4. **Sessions persist lazily.** Opening or tabbing between days writes nothing;
   the row is created on the first real mutation, guarded against double-insert.
   This is what stopped empty-session pollution (days showing Day 1/2/3 at once).

5. **Pre-profile sessions (no `profileId`) resolve to Pronit** via
   `LEGACY_PROFILE_ID` in `src/lib/workoutSession.ts`. Safe because a device
   that started using the app after profiles shipped has no unstamped rows, so
   nothing is ever misattributed on a new user's device.

## Files that matter

| Path | Role |
|---|---|
| `src/config/features.ts` | `SHOW_NUTRITION` / `SHOW_VEDIC` reversible hides |
| `src/config/profiles.ts` | Profile metadata, body composition, targets |
| `src/data/obzen-program.ts` | Both programs, exercise library, `SCHEDULES`, cues |
| `src/lib/workoutSession.ts` | `sessionHasActivity` / `loggedExercises` / profile attribution |
| `src/store/useWorkoutDayStore.ts` | Lazy-persist store, keyed `${profile}::${day}::${date}` |
| `src/store/useProfileStore.ts` | Active profile, localStorage-backed |
| `src/pages/SessionDetail.tsx` | Read-only past session (`/workout/session/:id`) |
| `src/components/modules/dashboard/WeekStrip.tsx` | Mon–Sun view + scheduled plan |
| `scripts/gen-icons.mjs` | Regenerates the PWA icons deterministically |

## Hidden, not deleted

Nutrition and Vedic are gated behind `SHOW_NUTRITION` / `SHOW_VEDIC` — nav
items, routes, dashboard cards, and the Mahadasha / Atmakaraka rows in
Settings. The page components and the `nutritionLogs`, `savedMeals` and
`vedicLogs` tables are fully intact; flip a flag to restore with no data loss.
Ayurveda and the Dosha field stayed visible.

## Open items

- **Not yet added from Aishwarya's Phase 1 plan:** the 8-minute warm-up
  checklist and the ground-rules card (effort, tempo, progression rule). The
  exercises, sets/reps, rest and swaps already match the plan exactly.
- **Drum PDFs are not committed** (copyright + repo size). Sync degrades
  gracefully on the hosted build and points users at "Add Book". To bulk-load
  locally: drop files in `public/drum-import/`, add entries to `MANIFEST` in
  `src/utils/importDrumBooks.ts`, then click Sync.
- **`obZen_workout_import.json` was never placed in `/public/`**, so the
  Settings "Import Historical Workout Data" button is wired but unused.
- **CI warning (non-blocking):** `actions/checkout@v4` and
  `actions/setup-node@v4` target the deprecated Node 20.
- **Bundle size:** vexflow (~691 KB gz) and pdf (~135 KB gz) sit in the main
  path. Lazy-loading them on the Drum routes is the highest-leverage win if
  initial load ever matters.

## Conventions

- Commits: `type(scope): description`. No `Co-Authored-By` (attribution is
  disabled globally).
- No new dependencies without asking. `fake-indexeddb` (dev) is the only one
  added recently, to let Dexie run in tests.
- Verify with `tsc` + `vitest` + `build` before committing.
