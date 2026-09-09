export type MuscleGroup = 'legs' | 'back' | 'shoulders' | 'arms' | 'chest' | 'core'

export interface ProgramExercise {
  name: string
  muscle: MuscleGroup
  /** Prescribed working sets (sets/reps/rest style plans). */
  sets?: number
  /** Rep target as written on the plan, e.g. '10–12', '8/leg', '20–30s'. */
  reps?: string
  /** Rest between sets as written on the plan, e.g. '90s', '2–3 min'. */
  rest?: string
  /** Warm-up prescription as written, e.g. '45×10, 110×10' (load-based plans). */
  warmup?: string
  /** Working-set prescription as written, e.g. '140×8×2' (load-based plans). */
  working?: string
  /** Core/ab movement — surfaced with a CORE tag in the UI. */
  isCore?: boolean
  /** Coaching cue for this movement, as written on the plan. */
  cue?: string
  /** Lifts the plan marks "Pronit coaches this". */
  coached?: boolean
  /** Suggested alternatives for this movement. */
  swaps?: string[]
}

/** One weekday in a profile's training week. */
export type ScheduleEntry =
  | { kind: 'train'; dayLabel: string }
  | { kind: 'off'; label: string }

export interface ProgramDay {
  focus: string
  exercises: ProgramExercise[]
}

/**
 * Human-readable prescription summary. Supports both plan styles: sets/reps/rest
 * (e.g. '4 × 10–12 · rest 90s') and load-based working sets (e.g. '140×8×2').
 */
export function formatTarget(ex: ProgramExercise): string {
  if (ex.sets != null && ex.reps) {
    return `${ex.sets} × ${ex.reps}${ex.rest ? ` · rest ${ex.rest}` : ''}`
  }
  return ex.working ?? ''
}

/** Slug used as the stable exerciseId for a movement name. */
export function toExerciseId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Aishwarya — Phase 1 (Weeks 1–4): Glutes, Core & Strength.
 * Sets/reps/rest style with swap options per movement.
 */
/**
 * No longer a selectable program — kept because `EXERCISE_LIBRARY` is built
 * from both templates, and fifteen movements appear only here: assisted
 * pull-ups and dips, barbell back squat, Bulgarian split squat, face pulls,
 * hollow body holds, walking lunges and the rest. Dropping it would remove
 * them from the exercise picker and leave any already-logged sets pointing at
 * an id the library no longer knows.
 */
export const AISHWARYA_PROGRAM: Record<string, ProgramDay> = {
  'Day 1': {
    focus: 'Glutes & Hamstrings',
    exercises: [
      { name: 'Hip Thrust Machine',    muscle: 'legs', sets: 4, reps: '10–12',  rest: '90s', cue: 'Chin tucked, ribs down. Hold the squeeze at the top for a full second before lowering.', swaps: ['Barbell Hip Thrust', 'Single-Leg Hip Thrust', 'Cable Pull-Through'] },
      { name: 'Romanian Deadlift',     muscle: 'legs', sets: 3, reps: '10',      rest: '90s', cue: 'Push the hips back with soft knees. Stop the moment you feel the hamstring stretch, not lower.', swaps: ['Dumbbell RDL', 'Good Morning', 'Single-Leg RDL'] },
      { name: 'Bulgarian Split Squat', muscle: 'legs', sets: 3, reps: '8/leg',   rest: '75s', cue: 'Lean the torso slightly forward. That is what shifts the work out of the quad and into the glute.', swaps: ['Reverse Lunge', 'Step-Up', 'Walking Lunge'] },
      { name: 'Leg Press',             muscle: 'legs', sets: 3, reps: '12',      rest: '90s', cue: 'Feet high and wide. High foot placement loads glutes and hamstrings. Never lock the knees out at the top.', swaps: ['Hack Squat', 'Goblet Squat', 'Smith Machine Squat'] },
      { name: 'Cable Glute Kickback',  muscle: 'legs', sets: 2, reps: '15/side', rest: '45s', cue: 'Slow on the way back. This is a finisher for blood flow, not a max effort lift.', swaps: ['Machine Kickback', 'Banded Kickback', 'Frog Pump'] },
      { name: 'Dead Bug',              muscle: 'core', sets: 3, reps: '10/side', rest: '45s', isCore: true, cue: 'Lower back stays glued to the floor for the entire set. If it lifts, shorten the reach.', swaps: ['Hanging Knee Raise', 'Reverse Crunch', 'Bird Dog'] },
    ],
  },
  'Day 2': {
    focus: 'Upper Body & Core',
    exercises: [
      { name: 'Assisted Pull-Up',        muscle: 'back',      sets: 3, reps: '6–8',    rest: '90s', coached: true, cue: 'Start with the most assistance available. Full hang at the bottom, chest toward the bar.', swaps: ['Lat Pulldown', 'Inverted Row', 'Band-Assisted Pull-Up'] },
      { name: 'Assisted Dip',            muscle: 'chest',     sets: 3, reps: '6–8',    rest: '90s', coached: true, cue: 'Lean forward slightly. Stop at the depth where the shoulder feels stretched, never below it.', swaps: ['Push-Up', 'Bench Dip', 'Chest Press Machine'] },
      { name: 'Seated Cable Row',        muscle: 'back',      sets: 3, reps: '10–12',  rest: '75s', cue: 'Pull to the belly button and drive the shoulder blades back. No rocking the torso.', swaps: ['Chest-Supported Row', 'One-Arm DB Row', 'Machine Row'] },
      { name: 'Dumbbell Shoulder Press', muscle: 'shoulders', sets: 3, reps: '10',     rest: '75s', cue: 'Ribs down, glutes tight. Press up and slightly back rather than forward.', swaps: ['Machine Shoulder Press', 'Arnold Press', 'Landmine Press'] },
      { name: 'Face Pull',               muscle: 'shoulders', sets: 2, reps: '15',     rest: '45s', cue: 'Pull toward the forehead with elbows high. This is the antidote to a desk job.', swaps: ['Reverse Pec Deck', 'Band Pull-Apart', 'Rear Delt Fly'] },
      { name: 'Cable Pallof Press',      muscle: 'core',      sets: 3, reps: '10/side',rest: '45s', isCore: true, cue: 'Resist the twist. Nothing moves except your arms. This is the waist exercise that works.', swaps: ['Side Plank', 'Suitcase Carry', 'Half-Kneeling Chop'] },
      { name: 'Hollow Body Hold',        muscle: 'core',      sets: 3, reps: '20–30s', rest: '45s', isCore: true, cue: 'Lower back pressed flat into the floor. Drop the legs closer to the ground to make it harder.', swaps: ['Plank', 'Ab Wheel from Knees', 'Leg Lowers'] },
    ],
  },
  'Day 3': {
    focus: 'Legs, Deadlift & Glutes',
    exercises: [
      { name: 'Deadlift',           muscle: 'legs', sets: 4, reps: '5',      rest: '2–3 min', coached: true, cue: 'Weeks 1 to 4 are technique only. Bar stays against the shins. End the set the moment the back rounds.', swaps: ['Trap-Bar Deadlift', 'Sumo Deadlift', 'Rack Pull', 'Kettlebell Deadlift'] },
      { name: 'Barbell Back Squat', muscle: 'legs', sets: 3, reps: '8',      rest: '2 min',   cue: 'Sit down between the hips, knees tracking over the toes. Earn depth before you add weight.', swaps: ['Goblet Squat', 'Hack Squat', 'Front-Foot-Elevated Split Squat'] },
      { name: 'Hip Thrust Machine', muscle: 'legs', sets: 3, reps: '12',     rest: '90s',     cue: 'Second glute session of the week. Go lighter than Day 1 and chase the squeeze instead of the load.', swaps: ['Glute Bridge', 'Cable Pull-Through', 'Single-Leg Hip Thrust'] },
      { name: 'Walking Lunge',      muscle: 'legs', sets: 2, reps: '10/leg', rest: '75s',     cue: 'A long stride hits the glutes, a short stride hits the quads. Take the long one.', swaps: ['Reverse Lunge', 'Step-Up', 'Curtsy Lunge'] },
      { name: 'Seated Leg Curl',    muscle: 'legs', sets: 2, reps: '12',     rest: '60s',     cue: 'Slow on the way back. The hamstrings finish what the Romanian deadlift started on Day 1.', swaps: ['Lying Leg Curl', 'Nordic Negative', 'Stability Ball Curl'] },
      { name: 'Cable Crunch',       muscle: 'core', sets: 3, reps: '12',     rest: '45s',     isCore: true, cue: 'Curl the ribs toward the hips. The hips themselves stay completely still.', swaps: ['Reverse Crunch', 'Hanging Knee Raise', 'Ab Wheel'] },
    ],
  },
}

/**
 * Pronit — 3-day split. Load-based prescriptions (warm-up + working sets) as
 * originally programmed.
 */
export const PRONIT_PROGRAM: Record<string, ProgramDay> = {
  'Day 1': {
    focus: 'Pull / Legs / Arms',
    exercises: [
      { name: 'Leg Press',            muscle: 'legs',      warmup: '45×10, 110×10',    working: '140×8×2' },
      { name: 'Weighted Pull-ups',    muscle: 'back',      warmup: 'BW×5',             working: '+25lbs×5×6' },
      { name: 'Barbell Row',          muscle: 'back',      warmup: 'light',            working: '20×10×3' },
      { name: 'DB Lateral Raises',    muscle: 'shoulders', warmup: '10×10',            working: '12×10×3' },
      { name: 'Cable Bicep Curls',    muscle: 'arms',      warmup: 'light',            working: '30lbs×8×3' },
      { name: 'Cable Triceps',        muscle: 'arms',      warmup: 'light',            working: '30lbs×10×3' },
      { name: 'Standing Calf Raises', muscle: 'legs',      warmup: '40×15',            working: '50lbs×15×3' },
      { name: 'Bar Knee Raises',      muscle: 'core',      warmup: '—',                working: 'BW×10×3', isCore: true },
      { name: 'Leg Extension',        muscle: 'legs',      warmup: '30×10, 60×10',     working: '80×10×1' },
      { name: 'Barbell Squat',        muscle: 'legs',      warmup: 'BW×10, 20×5, 40×5', working: '50×5×2' },
    ],
  },
  'Day 2': {
    focus: 'Zercher / Quad / Shoulders',
    exercises: [
      { name: 'Zercher Squat',        muscle: 'legs',      warmup: 'BW×8, 20×10',       working: '40×8×2, 50×5×2' },
      { name: 'Barbell Squat',        muscle: 'legs',      warmup: 'BW×5, 50×5, 70×5',  working: '90×5×3' },
      { name: 'Leg Press',            muscle: 'legs',      warmup: '45×10, 110×10',     working: '130×8×3' },
      { name: 'Leg Extension',        muscle: 'legs',      warmup: '60×8, 90×8',        working: '100×8×2, 110×8×1' },
      { name: 'Shoulder Press (Bar)', muscle: 'shoulders', warmup: '40×8, 65×8',        working: '80×8×2' },
      { name: 'DB Shoulder Press',    muscle: 'shoulders', warmup: '25×10',             working: '30×10×3, 35×10×2' },
      { name: 'Weighted Pull-ups',    muscle: 'back',      warmup: 'BW×5',              working: '+25lbs×5×6' },
      { name: 'Weighted Push-ups',    muscle: 'chest',     warmup: 'BW×10',             working: '10lbs×12×3' },
      { name: 'Russian Twists',       muscle: 'core',      warmup: '—',                 working: '15lbs×10×3', isCore: true },
      { name: 'Hanging Leg Raises',   muscle: 'core',      warmup: '—',                 working: 'BW×10×3', isCore: true },
    ],
  },
  'Day 3': {
    focus: 'Posterior / Delts / Forearms / Calves',
    exercises: [
      { name: 'Deadlift',             muscle: 'legs',      warmup: 'BW×5, 20×5, 50×5, 70×5', working: '90×5×3' },
      { name: 'Romanian Deadlift',    muscle: 'legs',      warmup: 'light',             working: '50lbs×8×3' },
      { name: 'DB Shoulder Press',    muscle: 'shoulders', warmup: '25×10',             working: '30×10×3, 35×10×2' },
      { name: 'DB Lateral Raises',    muscle: 'shoulders', warmup: '10×10',             working: '12×10×3' },
      { name: 'Rear Delt Raises',     muscle: 'shoulders', warmup: 'light',             working: '10-12lbs×12×3' },
      { name: 'Weighted Pull-ups',    muscle: 'back',      warmup: 'BW×5',              working: '+25lbs×5×3' },
      { name: 'Hammer Curls',         muscle: 'arms',      warmup: '25×10',             working: '35lbs×10×3' },
      { name: 'Standing Calf Raises', muscle: 'legs',      warmup: '40×15',             working: '50lbs×15×3' },
      { name: 'Hanging Leg Raises',   muscle: 'core',      warmup: '—',                 working: 'BW×10×3', isCore: true },
    ],
  },
}

/**
 * The day templates. There is one profile now, so this always returns the same
 * set — the parameter is kept because the signature is threaded through the
 * session store and the screens, and because sessions are still stamped with a
 * profile id.
 */
export function getProgram(_profileId?: string): Record<string, ProgramDay> {
  return PRONIT_PROGRAM
}

/**
 * What is scheduled on `date`: rest on Sunday and Thursday, otherwise rotate
 * through the program days.
 *
 * The per-profile schedule table went with the second profile. Note this
 * rotation marks five training days a week while the Train header still counts
 * against three — a pre-existing mismatch, left as it was rather than changed
 * silently here.
 */
export function getScheduledDay(_profileId?: string, date = new Date()): ScheduleEntry {
  const weekday = date.getDay()
  if (weekday === 0 || weekday === 4) return { kind: 'off', label: 'Rest Day' }
  const days = Object.keys(PRONIT_PROGRAM)
  return { kind: 'train', dayLabel: days[weekday % days.length] }
}

/**
 * How progress is measured for a movement.
 *  - `load`            heavier weight is better (default)
 *  - `assisted`        less assistance is better — trends down toward bodyweight
 *  - `bodyweight-reps` more reps in a set is better
 *  - `timed`           a longer hold is better
 */
export type TrackingMode = 'load' | 'assisted' | 'bodyweight-reps' | 'timed'

/** Rungs a bodyweight movement climbs on the way to being unassisted. */
export const DEFAULT_PROGRESSION_PATH = [
  'Negatives', 'Band-assisted', 'Machine-assisted', 'Bodyweight', 'Weighted',
]

/** Movements whose tracking mode differs from the `load` default. */
const TRACKING_MODES: Record<string, TrackingMode> = {
  'Assisted Pull-Up': 'assisted',
  'Assisted Dip': 'assisted',
  'Band-Assisted Pull-Up': 'assisted',
  'Hollow Body Hold': 'timed',
  'Plank': 'timed',
  'Side Plank': 'timed',
  'Suitcase Carry': 'timed',
  'Dead Bug': 'timed',
  'Push-Up': 'bodyweight-reps',
}

/** The three powerlifting competition lifts (Pronit's SBD total). */
const COMPETITION_LIFTS = new Set(['Barbell Squat', 'Bench Press', 'Deadlift'])

/**
 * Fraction of bodyweight a movement actually loads, for movements where the
 * body is the resistance. Used to compute effective load: a weighted pull-up
 * at +25 lb moves bodyweight *plus* the plates, so scoring it on the plates
 * alone badly understates it.
 *
 * Deliberately not derived from `trackingMode` — "weighted pull-up" is a
 * `load` movement that is still bodyweight-driven, which is exactly the case
 * a mode-based rule missed. Anything absent here is pure external load
 * (barbells, machines) and needs no adjustment.
 */
const BODYWEIGHT_FACTORS: Record<string, number> = {
  'Weighted Pull-ups': 1,
  'Assisted Pull-Up': 1,
  'Band-Assisted Pull-Up': 1,
  'Assisted Dip': 1,
  'Weighted Push-ups': 0.65,
  'Push-Up': 0.65,
  'Inverted Row': 0.5,
  'Bench Dip': 0.4,
}

/** A pickable catalog entry — same shape a template exercise carries. */
export interface LibraryExercise {
  name: string
  muscle: MuscleGroup
  sets?: number
  reps?: string
  rest?: string
  warmup?: string
  working?: string
  isCore?: boolean
  swaps: string[]
  /** How progress is measured for this movement. */
  trackingMode: TrackingMode
  /** Part of the squat/bench/deadlift total. */
  isCompetitionLift: boolean
  /** Ladder rungs, for movements worked up to unassisted. */
  progressionPath?: string[]
  /** Fraction of bodyweight this movement loads (absent = external load only). */
  bodyweightFactor?: number
}

/**
 * Deduped exercise library derived from the templates. Every main movement is
 * included with its full prescription; each swap is folded in as a pickable
 * entry that inherits its parent's muscle group (with a sensible default
 * prescription the user can edit). Deduped by name — main prescriptions win, so
 * e.g. Hip Thrust Machine appears once despite being on Days 1 and 3.
 */
function buildLibrary(programs: Record<string, ProgramDay>[]): LibraryExercise[] {
  const byName = new Map<string, LibraryExercise>()
  const mains = programs.flatMap(p => Object.values(p).flatMap(day => day.exercises))

  /** Attach the progress-tracking metadata every catalog entry carries. */
  const withTracking = (entry: Omit<LibraryExercise, 'trackingMode' | 'isCompetitionLift'>): LibraryExercise => {
    const trackingMode = TRACKING_MODES[entry.name] ?? 'load'
    return {
      ...entry,
      trackingMode,
      isCompetitionLift: COMPETITION_LIFTS.has(entry.name),
      progressionPath: trackingMode === 'assisted' || trackingMode === 'bodyweight-reps'
        ? DEFAULT_PROGRESSION_PATH
        : undefined,
      bodyweightFactor: BODYWEIGHT_FACTORS[entry.name],
    }
  }

  for (const ex of mains) {
    if (!byName.has(ex.name)) {
      byName.set(ex.name, withTracking({
        name: ex.name, muscle: ex.muscle, sets: ex.sets, reps: ex.reps, rest: ex.rest,
        warmup: ex.warmup, working: ex.working, isCore: ex.isCore, swaps: ex.swaps ?? [],
      }))
    }
  }
  for (const ex of mains) {
    for (const swapName of ex.swaps ?? []) {
      if (!byName.has(swapName)) {
        byName.set(swapName, withTracking({
          name: swapName, muscle: ex.muscle, sets: 3, reps: '10',
          rest: '60s', isCore: ex.isCore, swaps: [],
        }))
      }
    }
  }
  // Movements that belong in the catalog but appear in neither program —
  // Bench Press completes the SBD total, the rest are common alternatives.
  for (const extra of EXTRA_LIBRARY) {
    if (!byName.has(extra.name)) byName.set(extra.name, withTracking(extra))
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/** Pickable movements outside either program's day templates. */
const EXTRA_LIBRARY: Omit<LibraryExercise, 'trackingMode' | 'isCompetitionLift'>[] = [
  { name: 'Bench Press', muscle: 'chest', sets: 3, reps: '5', rest: '2–3 min',
    swaps: ['Dumbbell Bench Press', 'Close-Grip Bench Press', 'Chest Press Machine'] },
  { name: 'Bar Dips', muscle: 'chest', sets: 3, reps: '6–10', rest: '90s',
    swaps: ['Assisted Dip', 'Bench Dip', 'Push-Up'] },
  { name: 'Pull-Ups', muscle: 'back', sets: 3, reps: '5–8', rest: '90s',
    swaps: ['Chin-Ups', 'Neutral Grip Pull-Ups', 'Lat Pulldown'] },
  { name: 'Chin-Ups', muscle: 'back', sets: 3, reps: '5–8', rest: '90s',
    swaps: ['Pull-Ups', 'Neutral Grip Pull-Ups', 'Lat Pulldown'] },
  { name: 'Neutral Grip Pull-Ups', muscle: 'back', sets: 3, reps: '5–8', rest: '90s',
    swaps: ['Pull-Ups', 'Chin-Ups', 'Lat Pulldown'] },
  { name: 'Barbell Rear Delt Row', muscle: 'shoulders', sets: 3, reps: '10–12', rest: '75s',
    swaps: ['Dumbbell Rear Delt Row', 'Face Pull', 'Reverse Pec Deck'] },
  { name: 'Dumbbell Rear Delt Row', muscle: 'shoulders', sets: 3, reps: '10–12', rest: '75s',
    swaps: ['Barbell Rear Delt Row', 'Face Pull', 'Rear Delt Fly'] },
  { name: 'Barbell Front Raises', muscle: 'shoulders', sets: 3, reps: '10–12', rest: '60s',
    swaps: ['Dumbbell Lateral Raises', 'Landmine Press'] },
  { name: 'Dumbbell Lateral Raises', muscle: 'shoulders', sets: 3, reps: '12–15', rest: '60s',
    swaps: ['Cable Lateral Raises', 'Barbell Front Raises'] },
  { name: 'Barbell Curls', muscle: 'arms', sets: 3, reps: '8–10', rest: '60s',
    swaps: ['Hammer Curls', 'Zottman Curl', 'Cable Bicep Curls'] },
  { name: 'Zottman Curl', muscle: 'arms', sets: 3, reps: '10–12', rest: '60s',
    swaps: ['Barbell Curls', 'Hammer Curls'] },
]

/** Combined catalog — every movement from both programs is pickable. */
export const EXERCISE_LIBRARY: LibraryExercise[] = buildLibrary([PRONIT_PROGRAM, AISHWARYA_PROGRAM])

/** Catalog entry for an exercise id, for consumers that only persist the id. */
export const LIBRARY_BY_ID: Record<string, LibraryExercise> = Object.fromEntries(
  EXERCISE_LIBRARY.map(ex => [toExerciseId(ex.name), ex])
)

/**
 * The squat/bench/deadlift ids that make up a powerlifting total, derived from
 * the `isCompetitionLift` flag rather than restated. The SBD panels read this,
 * so a profile's charted key lifts and the lifts summed into a "total" can be
 * changed independently without the total quietly becoming something else.
 */
export const COMPETITION_LIFT_IDS: string[] = EXERCISE_LIBRARY
  .filter(ex => ex.isCompetitionLift)
  .map(ex => toExerciseId(ex.name))

/**
 * Catalog entry for a logged exercise id, tolerating ids saved by older builds.
 *
 * `toExerciseId` strips punctuation, but sessions logged before it did still
 * carry ids like `shoulder-press-(bar)`. Those resolve to nothing on an exact
 * lookup, so the movement loses its name, muscle group and tracking mode and
 * shows as a raw slug. Normalising the id the same way `toExerciseId` does
 * recovers them without touching the stored data.
 */
export function libraryFor(exerciseId: string): LibraryExercise | undefined {
  const exact = LIBRARY_BY_ID[exerciseId]
  if (exact) return exact
  const normalised = toExerciseId(exerciseId)
  return normalised === exerciseId ? undefined : LIBRARY_BY_ID[normalised]
}

/** Display name for a logged exercise id, falling back to the id itself. */
export function exerciseNameFor(exerciseId: string): string {
  return libraryFor(exerciseId)?.name ?? exerciseId
}

/** Tracking mode for a logged exercise id (defaults to `load` for custom adds). */
export function trackingModeFor(exerciseId: string): TrackingMode {
  return libraryFor(exerciseId)?.trackingMode ?? 'load'
}

/** Fraction of bodyweight a logged exercise loads (0 = external load only). */
export function bodyweightFactorFor(exerciseId: string): number {
  return libraryFor(exerciseId)?.bodyweightFactor ?? 0
}

/** Library names grouped by muscle — kept for consumers that filter by group. */
export const SWAP_OPTIONS: Record<MuscleGroup, string[]> = EXERCISE_LIBRARY.reduce(
  (groups, ex) => {
    groups[ex.muscle].push(ex.name)
    return groups
  },
  { legs: [], back: [], shoulders: [], arms: [], chest: [], core: [] } as Record<MuscleGroup, string[]>
)

/** Pull-dominant movements — used to auto-flag pull volume on fatigue days. */
export const PULL_HEAVY_EXERCISES = [
  'Assisted Pull-Up', 'Lat Pulldown', 'Inverted Row', 'Band-Assisted Pull-Up',
  'Seated Cable Row', 'Chest-Supported Row', 'One-Arm DB Row', 'Machine Row',
]

/** Grip/forearm-loading movements — flagged when forearm fatigue is logged. */
export const FOREARM_LOAD_EXERCISES = [
  'Deadlift', 'Romanian Deadlift', 'Dumbbell RDL', 'Assisted Pull-Up',
  'Seated Cable Row', 'One-Arm DB Row', 'Kettlebell Deadlift',
]
