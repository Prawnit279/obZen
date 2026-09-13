# obZen — Build Status
Last updated: 2026-09-13 | SHA: 219bfb73

Local-first training and drum-practice PWA. One profile, one device, no
account, no server. Everything lives in IndexedDB and localStorage, and a JSON
backup is the only way data leaves the phone.

---

## Shape of the app

**Navigation:** Home · Train · Progress · Drums · Calendar · More.

**One profile.** The two-person switcher is gone. The id string `'pronit'`
survives as an internal key — sessions are stamped with it, and the bodyweight
log and ladder rungs are prefixed by it — but there is no way to change who you
are. Name, Ayurvedic type and training days are editable in Settings; key lifts
and which Progress panels appear stay in `config/profiles.ts` as programme data.

**Feature flags** (`config/features.ts`), all currently off: Nutrition, Yoga,
Vedic, Astrology. Yoga's screens and data are still in the tree — its programme
is also the source of fifteen library exercises, so it cannot simply be deleted.

---

## Built

### Infrastructure
- Vite 5 + React 18 + TypeScript strict, Tailwind + CSS custom properties
- Dexie v4 — 24 tables, schema version 4. Non-indexed fields (`rpe`, `isAmrap`)
  were added without a version bump; only indexes are versioned.
- 6 themes (violet default, plus Daylight, crimson, void, steel, ember)
- PWA: service worker, manifest, offline-first
- GitHub Pages deploy on every push to main, with the tests gating it
- **729 tests**, `src/lib` at 96% of statements
- All type sizes come from `--text-*` tokens (globals.css) — no hardcoded
  `fontSize`/`text-[Npx]` anywhere, including SVG (which needs
  `style={{ fontSize: 'var(...)' }}`, not the `fontSize="N"` attribute — a
  first sweep missed 41 of these because it only matched the CSS/Tailwind
  forms, and left `.input` at a literal 15px until the scale moved under it)
- The scale sits **one rung above the design's original**, on a ladder 1px
  apart to 18px and 2px apart above it. It went two rungs up first and read
  too large on a phone. The cost of coming back down is that `--text-3xs` and
  `--text-2xs` are under 11px again; both are label-only.

### Train
- 2–6 day week, set in Settings. Day N is the week's Nth logged session, and
  the number is derived from the date every time — backdating a session
  renumbers the week rather than leaving two claiming the same number. The
  stored `dayLabel` is an opaque key, not the number on screen.
- Three day templates (Pull/Legs/Arms, Zercher/Quad/Shoulders, Posterior/Delts)
  load as a starting point; slots beyond them start empty.
- Set-by-set logging, drag-to-reorder, swap, add from a **119-exercise
  library** (40 legs, 21 shoulders, 17 core, 14 arms, 14 back, 13 chest). The
  catalog is derived from both programme templates plus their swaps and
  `EXTRA_LIBRARY`; the free-weight set added there covers EZ bar (six
  movements, the first in the app), barbell, dumbbell, and the cable, machine
  and kettlebell work that came with them. Every entry has a movement
  animation — a test enforces it, so a library addition without one fails.
- Session RPE, and a per-set AMRAP flag that drives the 5/3/1 training max
- Tabs: Program · History · Tools. The open tab lives in the URL.

### Progress
Three views, in the URL as `?view=`: **Strength · Body · Workload**. Closed
views stay mounted and are hidden only on screen, so Print still captures the
whole page.

- **Lift trend** — Est. 1RM, top set, ×BW, or % change; 8 weeks / 6 months /
  all; one lift or every lift. One shared axis with rounded gridlines
  (200/250/300, not the raw padded min/mid/max); each line prints its
  current value beside its end point; tap the chart to read any session
  (a guide line, a dot per lift, the key switches to that day's numbers —
  a lift not trained that day says so rather than showing 0)
- SBD total, DOTS, strength standards, PRs, recent breaks, lift balance
- **Weight check** — weigh-in log, smoothed trend, read against a goal you set,
  and strength against bodyweight
- Load & recovery (ACWR), sets per muscle against MEV/MAV/MRV, weekly tonnage,
  plan vs actual, progression ladders
- Print to PDF through the browser's own dialog

### Everything else
Drums (timer, 39 rudiments, songs, jams, book library, PDF viewer), Calendar,
Meetings, Projects kanban, Settings (themes, profile, storage, backup).

### Data
- **JSON export and import** — every table plus weigh-ins, goal, name and
  dosha. Import validates the whole file before writing anything, merges day
  sessions on profile+date+day, and fills gaps in personal settings without
  overwriting what is already there.
- Imported workouts are adopted into this device's profile.

---

## Known and deliberate

- **The bar counts.** Sets are logged as plates; the bar is added wherever load
  is computed, for 22 Olympic-bar lifts at 45 lb and 6 EZ-bar lifts at 25 lb.
  Stored values are never rewritten, so it cannot be applied twice. Which lifts
  count comes from the motion table's `equipment` tag, with two id lists for the
  exceptions: the EZ bar (drawn as a bar, but not a 45 lb one) and the six that
  carry no free bar at all (cable stacks, the Smith machine, the landmine, the
  T-bar).
- **Bodyweight is in strength, not in records.** A weighted pull-up PR reads
  "25 lb × 5" — what went on the belt — while its estimated 1RM includes the
  lifter.
- **Silence over invention.** ×BW with no weigh-in, ACWR under three rated
  sessions, a trend under two points: each says so rather than showing a number.
- Retired second-profile sessions stay in the database and in backups, matched
  by nothing, so they neither display nor count.

---

## Remaining

### Untested
`axis-master.ts` and `metronome.ts` are now covered (44 tests). `axis-master.ts`
is dead code, though — nothing imports it, including its own `clamp`, which is
shadowed by an unused-but-different `clamp` in `lib/utils.ts`; worth deleting
rather than maintaining. `src/pages` still sits at 0% — several findings from
the last review land there.

### Partially built
| Area | What's missing |
|---|---|
| Nutrition | Meal logging UI is a stub; flag-hidden |
| Meetings | Action items table exists in Dexie, not surfaced |
| Calendar | Week / day tabs exist, only month renders |
| Projects | Board cards show a task count of 0 |

### Deferred
Yoga pose animation rewrite, streaks, focus timer, weekly review, global search,
progress photos, analytics (external tool).

### Traps worth knowing
- `exercise-motions-data.ts` type-imports from `exercise-motions.ts`, which
  value-imports the data back. Safe only because that import is `import type`.
  The same shape now holds for `exercise-motions-extra.ts` and
  `exercise-guides-extra.ts`, which exist because their parents were at the
  file-size ceiling. Both tables are merged by the module that owns the types.
- `epley1RM` exists twice with different units — `progress.ts` in kg,
  `strengthTools.ts` in lb. Correct today, easy to import the wrong one.
- Tools has both a route and a Train tab, the same duplication the Progress tab
  had before it was removed.
