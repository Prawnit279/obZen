# obZen — Build Status
Last updated: 2026-09-18 | SHA: 5a952f18

Local-first training and drum-practice PWA. One profile, one device, no
account, no server. Everything lives in IndexedDB and localStorage, and a JSON
backup is the only way data leaves the phone.

---

## Shape of the app

**Navigation:** Home · Train · Progress · Calendar · More. Drums is hidden
behind `SHOW_DRUMS`, off — the section is intact in the tree, not deleted, so
turning the flag back on restores it whole.

**One profile.** The two-person switcher is gone. The id string `'pronit'`
survives as an internal key — sessions are stamped with it, and the bodyweight
log and ladder rungs are prefixed by it — but there is no way to change who you
are. Name, Ayurvedic type and training days are editable in Settings; key lifts
and which Progress panels appear stay in `config/profiles.ts` as programme data.

**Feature flags** (`config/features.ts`), all currently off: Nutrition, Yoga,
Vedic, Astrology, Drums. Yoga's screens and data are still in the tree — its
programme is also the source of fifteen library exercises, so it cannot simply
be deleted. Drums is the same shape and for the same reason: the flag gates the
route, both nav surfaces and the dashboard chart, and nothing was removed.

---

## Built

### Infrastructure
- Vite 5 + React 18 + TypeScript strict, Tailwind + CSS custom properties
- Dexie v4 — 24 tables, schema version 4. Non-indexed fields (`rpe`, `isAmrap`,
  `isSupplemental`, `circuitId`, `circuits`) were added without a version bump;
  only indexes are versioned.
- **10 themes**, five dark and five light. A dark theme is `--bg`, six accent
  steps and three accent channels, nothing more; the light themes share one
  restatement of the whole token set and add only their own ramp. Four
  families — Amethyst, Cobalt, Raspberry, Lagoon — exist in both modes; Ember
  and Daylight are one-offs.
- **Amethyst is the default**, and so defines the base ramp in `:root` rather
  than overriding it — its `[data-theme]` block only registers `color-scheme`.
  Violet, Crimson, Void Purple and Steel Blue were retired. The choice is
  persisted, so retiring one strands whoever had it selected: `RETIRED_THEMES`
  in `useThemeStore` maps each to a survivor, and both the boot-time DOM apply
  and the zustand `migrate` resolve through it so the two cannot disagree.
  Violet was the default, so that migration is the one most devices take.
- Tinted surfaces mix from `--accent-rgb` / `--accent-soft-rgb` /
  `--accent-deep-rgb` rather than literal violet rgba. Until they did, every
  theme wore a violet wash: a selected day tab came out lavender in the blue
  theme. The only accent literals left are the switcher's own swatches, which
  must stay literal: all fourteen render while one theme is active, so a var
  would paint them identically. A sweep that matches only `rgba(...)` misses
  bare hex — a chart fill survived the first pass that way.
- PWA: service worker, manifest, offline-first
- GitHub Pages deploy on every push to main, with the tests gating it
- **951 tests**, `src/lib` at 96% of statements
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
- Set-by-set logging, drag-to-reorder, swap, add from a **121-exercise
  library**. The catalog is derived from both programme templates plus their
  swaps and `EXTRA_LIBRARY`; the free-weight set added there covers EZ bar (six
  movements, the first in the app), barbell, dumbbell, and the cable, machine
  and kettlebell work that came with them. Every entry has a movement
  animation — a test enforces it, so a library addition without one fails.
- The picker groups those 121 into **29 families by parent lift**
  (`exercise-families.ts`) — Squat, Deadlift, Curl, Rear Delt and so on.
  Families are collapsed while browsing, so the list reads as an index, and
  open automatically while searching, because a hit inside a collapsed family
  looks like no hit. Legs splits four ways at the top: Squat (leg press
  included), Lunge & Split Squat, Deadlift, Hinge (every RDL, plus the swing).
  Tests hold both directions — nothing in the library is unfiled, nothing is
  filed twice, no family names a movement the library lacks, and no family
  spans two muscle groups, which the filter chips assume.
- Session RPE, and two per-set flags: **AMRAP**, which drives the 5/3/1 training
  max and the top-set history, and **supplemental**, which separates assistance
  volume from main work. Both are recorded rather than inferred — a session
  holds each exercise once, so a lift's five-by-ten sits in the same entry as
  its working sets and nothing downstream could tell them apart.
- **Circuits** — group the day's own exercises into rounds, up to five
  movements and three or four deep. Ungrouping never deletes. The set logger
  does not yet know about rounds.
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
- Load & recovery (ACWR), sets per muscle against MEV/MAV/MRV, plan vs actual,
  progression ladders
- **Weekly volume**, counted as tonnage or as sets — heavy triples and light
  tens can land on a similar total while being nothing alike. Once sets are
  marked supplemental it also splits main work from assistance, which on a
  five-by-ten week is the difference between 5,110 lb and 10,000 lb.
- **Current block** — which programme, which week of the cycle, which cycle,
  whether it is a deload, and the sets this week asks for, supplemental
  included. Percentages come from `strengthTools`, never restated.
- **Top sets** — the AMRAP reps against what the week called for, over time.
  Reads only sets flagged in the logger, the same rule `lib/amrap.ts` applies:
  an unflagged rep count cannot say whether the lifter stopped by instruction
  or by limit.
- **Bar mode** — every total and trend can be read with the bar or as plates
  only. DOTS and the strength standards never follow it: they are calibrated
  against real load, so plates-only there would be a wrong score rather than
  the same strength read differently.
- **Worth knowing** — six readings drawn from what is already recorded: an
  unkept plan, low recovery against a heavy week, a trained lift the block has
  no training max for, no marked top set since the block began, an unfinished
  questionnaire, a weigh-in gone stale behind a goal. Every tip prints what it
  was read from, none prescribes training, and the card is absent entirely when
  there is nothing to say. Sits above the view tabs because the tips span all
  three. Thresholds in `lib/guidance.ts` are reporting thresholds, documented as
  such — they decide when something is worth mentioning, never what to lift.
- Print to PDF through the browser's own dialog

### Programmes
- `data/programs.ts` holds four: **5/3/1** and **Boring But Big** are
  `available` and fully encoded; **Tactical Barbell** and **Bigger Leaner
  Stronger** are `needs-source` and prescribe nothing. Tactical Barbell's four
  templates — Operator, Fighter, Zulu, Gladiator — are declared with every
  number `null`, and `isTemplateReady` reports all four as not yet followable.
  A test pins that none holds a number nobody supplied.
- **A 20-question intake** (`data/intake-questions.ts`) across six sections,
  each question recording what it drives. A skipped question is absent, never
  defaulted.
- `recommendProgram` scores rather than filters: unanswered questions count
  neither way, and a programme that cannot be followed never leads. The card
  shows the reasons for *and* against, and what the recommendation is based on.
- **Starting a block** records programme, start date and the training maxes it
  began with, seeded from logged history via `bestCurrentE1RM`. A lift with
  nothing logged gets no entry rather than a guessed one. `templateId` is
  always null — a programme offering a choice says so instead of picking one.

### Everything else
Drums (timer, 39 rudiments, songs, jams, book library, PDF viewer), Calendar,
Meetings, Projects kanban.

**Settings** is ordered by what you do with it: the two cards you edit
(Profile, then Appearance) come first, then the one you act on (Data), then the
ones you only read. Everything in that last group folds — Appearance, Storage,
Image Cache, Migration, App — and each closed header carries its own answer, so
Appearance reads "Amethyst · dark" and Storage reads "24.8 KB" without opening.
A folded section that says nothing only costs a tap.

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

### Waiting on numbers
**Tactical Barbell** cannot prescribe until three things are supplied: the set
counts and reps per template, the percentages and what they are of (a training
max and a true max give different weights off the same percentage), and how
weight moves between blocks. Which templates to offer is settled — all four.
Nothing here will be guessed; the container holds `null` until the numbers
arrive. **Bigger Leaner Stronger** is untouched, per instruction.

### Deferred
Yoga pose animation rewrite, streaks, focus timer, weekly review, global search,
progress photos, analytics (external tool). Circuits exist but the set logger
does not yet know about rounds.

### Traps worth knowing
- `exercise-motions-data.ts` type-imports from `exercise-motions.ts`, which
  value-imports the data back. Safe only because that import is `import type`.
  The same shape now holds for `exercise-motions-extra.ts` and
  `exercise-guides-extra.ts`, which exist because their parents were at the
  file-size ceiling. Both tables are merged by the module that owns the types.
- A new theme needs three accent channels as well as its ramp. Ship the ramp
  alone and every tinted surface silently falls back to the violet in `:root`.
- **Renaming a movement strands its history.** A session stores the slug of the
  name it was logged under and nothing rewrites it, so the old id has to keep
  resolving: add it to `exercise-renames.ts`, which `libraryFor`, `motionFor`
  and `guideFor` all pass through. Entries there are permanent. Reverse Pec Deck
  → Rear Delt Fly Machine is the one that exists, and the test for it is the
  template.
- `epley1RM` exists twice with different units — `progress.ts` in kg,
  `strengthTools.ts` in lb. Correct today, easy to import the wrong one.
- **A rule stated twice is a rule half-tested.** The top-set history guarded the
  deload both explicitly and through the wave's own `isAmrap` flag; either half
  could be deleted with every test still passing. Derive the guard once and let
  the mutation fail.
- **Set flags are omitted, never `false`.** `isAmrap` and `isSupplemental` are
  deleted from the object when off, so no stored row or backup gains a key that
  says nothing. `withFlag` in `SetLogger` is the only place that rule lives.
- Tools has both a route and a Train tab, the same duplication the Progress tab
  had before it was removed.
