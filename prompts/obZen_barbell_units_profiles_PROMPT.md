# obZen — Barbell weight, units, profile removal, backup reminder & bodyweight (paste into Claude Code)

You are a senior React/TypeScript engineer working in the **obZen** repo. Implement the six changes below and nothing else. No extra features, refactors, or abstractions.

## Context (carry forward — real architecture, do not re-derive)
- Offline-first PWA. React 18 + TS + Vite 5 + Dexie v4 (IndexedDB), Tailwind + dark "noircut" design system. Repo `Prawnit279/obZen`, **direct commits to `main`, no PRs**.
- **`workoutDaySessions` is the ONLY read/write source of truth for workouts.** `workoutSessions` / `exerciseLogs` are legacy (import-only) — do not read/write them.
- **Exercise library is static TypeScript**: `src/data/obzen-program.ts` (both programs, deduped library, `SCHEDULES`, cues).
- **Dexie is at v4, no migration ever run.** New non-indexed fields are fine. A new **indexed field or new table** = version bump = **STOP and get user sign-off first.**
- Session store `src/store/useWorkoutDayStore.ts`, keyed `` `${profile}::${day}::${date}` ``, lazy-persist. Helpers `sessionHasActivity` / `loggedExercises` and `LEGACY_PROFILE_ID` in `src/lib/workoutSession.ts`. Profiles via `src/store/useProfileStore.ts`. Read-only past session `src/pages/SessionDetail.tsx`. Feature flags `src/config/features.ts`. Existing helpers: `realSets()`, `setWeightLb()`. Existing JSON backup: `exportAllDataAsJSON` / `importAllDataFromJSON` in `src/lib/export.ts`.

## STEP 0 — read before writing
Use the Explore agent, then read: `obzen-program.ts`, `workoutSession.ts`, `useWorkoutDayStore.ts`, `useProfileStore.ts`, `src/lib/export.ts`, `SessionDetail.tsx`, and the history/logging components. Confirm the **exact per-set shape** stored in `workoutDaySessions` (how weight/reps live on a set) and the JSON backup schema. Build against the real shapes. Plan (Plan agent) before editing.

## Repo constraints (hard)
- No new dependencies without asking. `gateguard` blocks `Write` on existing files — use `Edit`.
- No Dexie version bump / new indexed field / new table without explicit sign-off (STOP and ask).
- Before any commit: `npx tsc --noEmit` && `npx vitest run` (keep existing suite green) && `npm run build`. Commit style `type(scope): description`, no Co-Authored-By.
- Keep the dark noircut theme.

---

## TASK 1 — Barbell bar weight (default 45 lb, editable), applied going forward
- Add an editable **`barWeight`** field (number, lb; default **45**) to every library exercise whose name contains "Barbell", in `src/data/obzen-program.ts` (static, non-indexed — no Dexie change). Editable per exercise so 35 lb bars, EZ bars (~15–25 lb), and trap bars can differ.
- **When logging such an exercise going forward, the stored working weight INCLUDES the bar.** The logger shows the breakdown explicitly, e.g. `Bar 45 + plates 135 = 180 lb total`, and stores the total. The user enters plate load; the app adds the exercise's `barWeight`.
- Make bar inclusion **visible and per-set overridable** (a small toggle) so a user who enters a full total, or does a bar-less variant, isn't double-counted.
- All charts/e1RM/volume read the stored total as-is (they already use `setWeightLb()` — do not add the bar a second time in calculations).

## TASK 2 — Correct historical logs via import (NOT auto-migration)
- Do **NOT** auto-mutate existing logs. The user will supply corrected, bar-inclusive historical data as JSON (the "memory"/backup files).
- Ensure the existing **JSON import path** (`importAllDataFromJSON`, Settings → Import Backup) ingests this corrected data into `workoutDaySessions`, **upsert-by-id, idempotent** (re-importing the same file changes nothing). Imported values are taken **as-is** — the Task 1 bar auto-add must NOT be applied to imported sets (they already include the bar).
- If the corrected file's shape differs from the current backup schema, add a small, clearly-scoped adapter — confirm the real schema in Step 0 first. Show a summary after import (records written, date range).

## TASK 3 — Remove Pronit/Aishwarya profiles (collapse to a single user, reversible)
- Remove the profile switcher from everywhere it appears (Home header toggle, Settings, anywhere else). **No profile names or switch UI must be visible** — the app should read as single-user to anyone it's sent to.
- Collapse to one active identity: force the active profile to the single user's id app-wide (reuse `LEGACY_PROFILE_ID` / the existing store default) so all reads/writes resolve to one identity and nothing breaks.
- **Keep the other profile's rows in the DB, never queried or shown** (reversible, non-destructive) — do NOT delete data and do NOT run a Dexie migration. Gate the removal behind a single constant/flag (like the existing `SHOW_*` flags) so it can be reversed.
- Only the retained user's program from `obzen-program.ts` is shown.

## TASK 4 — Weekly backup reminder (in-app)
- Add an in-app reminder that nudges the user to export a JSON backup **weekly**. Track `lastBackupExportAt` in localStorage; if >7 days (or never), show a dismissible banner (Home + Settings) with a one-tap **Export now** that calls the existing `exportAllDataAsJSON` and updates the timestamp.
- Keep it non-intrusive (dismiss snoozes for the week). This is an in-app banner, not an OS notification.

## TASK 5 — View logged history in both lb and kg
- Add a **lb ⇄ kg toggle** to the workout history and `SessionDetail` views. Storage stays in the app's existing canonical unit (confirm in Step 0); the toggle only converts for **display**.
- Conversion `kg = lb / 2.20462`; round sensibly (kg to 1 decimal or 0.5 increments, lb to nearest whole). Persist the choice in localStorage. Apply to per-set weights, totals, and any weight shown in history.

## TASK 6 — Bodyweight tracking section
- Add a section to log **bodyweight on a daily/weekly basis** with date, plus a trend chart over time. Show latest value, change vs last entry, and a simple line chart.
- **Reuse `checkIns` if it already stores bodyweight**; otherwise persist via the existing localStorage-store pattern. Do NOT add a Dexie table without sign-off.
- This bodyweight log is the same source the planned relative-strength / Wilks features will read — store it cleanly (date + value + unit).

---

## Skills & agents
- **Explore** — Step 0: confirm set shape, backup schema, profile wiring, history components.
- **Plan** — sequence: Task 3 (profile collapse, touches read paths) → Task 1 (bar field + logger) → Task 2 (import) → Task 5 (unit toggle) → Task 6 (bodyweight) → Task 4 (reminder).
- **`ai-regression-testing`** — vitest (fake-indexeddb): bar total math + no double-add, idempotent import, unit conversion round-trip, single-profile read/write. Keep the suite green.

## Do NOT touch
Drum, Cal, Meetings, Projects, Yoga, Ayurveda; hidden Nutrition/Vedic flags; PWA/service-worker config; the legacy `workoutSessions`/`exerciseLogs` writer path.

## Checkpoints — output `✅ [what was done]` per task, STOP + ask before:
- Any Dexie version bump, new table, or new indexed field.
- Adding any npm dependency (incl. a chart lib for Task 6 — propose one first).
- Deleting or renaming any file, or deleting any user data.

## Done when
- Barbell exercises log with an editable bar weight (default 45 lb) included in the stored total, shown as a breakdown, per-set overridable; calculations don't double-add the bar.
- Corrected historical data imports via JSON (upsert, idempotent) into `workoutDaySessions`, taken as-is with no bar re-add.
- No profile switcher or names are visible anywhere; app behaves single-user; the other profile's data remains in the DB, hidden, reversible; no migration run.
- A weekly in-app backup reminder appears when due, with working Export now.
- History and SessionDetail have a working lb⇄kg display toggle, storage unit unchanged.
- A bodyweight section logs daily/weekly weight with a trend chart, stored cleanly (date+value+unit).
- `tsc` clean, full vitest suite green (existing + new), `npm run build` passes.
