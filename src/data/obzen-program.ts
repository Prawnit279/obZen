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
  /** Suggested alternatives for this movement. */
  swaps?: string[]
}

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
export const AISHWARYA_PROGRAM: Record<string, ProgramDay> = {
  'Day 1': {
    focus: 'Glutes & Hamstrings',
    exercises: [
      { name: 'Hip Thrust Machine',    muscle: 'legs', sets: 4, reps: '10–12',  rest: '90s', swaps: ['Barbell Hip Thrust', 'Single-Leg Hip Thrust', 'Cable Pull-Through'] },
      { name: 'Romanian Deadlift',     muscle: 'legs', sets: 3, reps: '10',      rest: '90s', swaps: ['Dumbbell RDL', 'Good Morning', 'Single-Leg RDL'] },
      { name: 'Bulgarian Split Squat', muscle: 'legs', sets: 3, reps: '8/leg',   rest: '75s', swaps: ['Reverse Lunge', 'Step-Up', 'Walking Lunge'] },
      { name: 'Leg Press',             muscle: 'legs', sets: 3, reps: '12',      rest: '90s', swaps: ['Hack Squat', 'Goblet Squat', 'Smith Machine Squat'] },
      { name: 'Cable Glute Kickback',  muscle: 'legs', sets: 2, reps: '15/side', rest: '45s', swaps: ['Machine Kickback', 'Banded Kickback', 'Frog Pump'] },
      { name: 'Dead Bug',              muscle: 'core', sets: 3, reps: '10/side', rest: '45s', isCore: true, swaps: ['Hanging Knee Raise', 'Reverse Crunch', 'Bird Dog'] },
    ],
  },
  'Day 2': {
    focus: 'Upper Body & Core',
    exercises: [
      { name: 'Assisted Pull-Up',        muscle: 'back',      sets: 3, reps: '6–8',    rest: '90s', swaps: ['Lat Pulldown', 'Inverted Row', 'Band-Assisted Pull-Up'] },
      { name: 'Assisted Dip',            muscle: 'chest',     sets: 3, reps: '6–8',    rest: '90s', swaps: ['Push-Up', 'Bench Dip', 'Chest Press Machine'] },
      { name: 'Seated Cable Row',        muscle: 'back',      sets: 3, reps: '10–12',  rest: '75s', swaps: ['Chest-Supported Row', 'One-Arm DB Row', 'Machine Row'] },
      { name: 'Dumbbell Shoulder Press', muscle: 'shoulders', sets: 3, reps: '10',     rest: '75s', swaps: ['Machine Shoulder Press', 'Arnold Press', 'Landmine Press'] },
      { name: 'Face Pull',               muscle: 'shoulders', sets: 2, reps: '15',     rest: '45s', swaps: ['Reverse Pec Deck', 'Band Pull-Apart', 'Rear Delt Fly'] },
      { name: 'Cable Pallof Press',      muscle: 'core',      sets: 3, reps: '10/side',rest: '45s', isCore: true, swaps: ['Side Plank', 'Suitcase Carry', 'Half-Kneeling Chop'] },
      { name: 'Hollow Body Hold',        muscle: 'core',      sets: 3, reps: '20–30s', rest: '45s', isCore: true, swaps: ['Plank', 'Ab Wheel from Knees', 'Leg Lowers'] },
    ],
  },
  'Day 3': {
    focus: 'Legs, Deadlift & Glutes',
    exercises: [
      { name: 'Deadlift',           muscle: 'legs', sets: 4, reps: '5',      rest: '2–3 min', swaps: ['Trap-Bar Deadlift', 'Sumo Deadlift', 'Rack Pull', 'Kettlebell Deadlift'] },
      { name: 'Barbell Back Squat', muscle: 'legs', sets: 3, reps: '8',      rest: '2 min',   swaps: ['Goblet Squat', 'Hack Squat', 'Front-Foot-Elevated Split Squat'] },
      { name: 'Hip Thrust Machine', muscle: 'legs', sets: 3, reps: '12',     rest: '90s',     swaps: ['Glute Bridge', 'Cable Pull-Through', 'Single-Leg Hip Thrust'] },
      { name: 'Walking Lunge',      muscle: 'legs', sets: 2, reps: '10/leg', rest: '75s',     swaps: ['Reverse Lunge', 'Step-Up', 'Curtsy Lunge'] },
      { name: 'Seated Leg Curl',    muscle: 'legs', sets: 2, reps: '12',     rest: '60s',     swaps: ['Lying Leg Curl', 'Nordic Negative', 'Stability Ball Curl'] },
      { name: 'Cable Crunch',       muscle: 'core', sets: 3, reps: '12',     rest: '45s',     isCore: true, swaps: ['Reverse Crunch', 'Hanging Knee Raise', 'Ab Wheel'] },
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

/** Day templates per profile — the Home switcher selects which set is active. */
export const PROGRAMS_BY_PROFILE: Record<string, Record<string, ProgramDay>> = {
  pronit: PRONIT_PROGRAM,
  aishwarya: AISHWARYA_PROGRAM,
}

export function getProgram(profileId: string): Record<string, ProgramDay> {
  return PROGRAMS_BY_PROFILE[profileId] ?? PRONIT_PROGRAM
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

  for (const ex of mains) {
    if (!byName.has(ex.name)) {
      byName.set(ex.name, {
        name: ex.name, muscle: ex.muscle, sets: ex.sets, reps: ex.reps, rest: ex.rest,
        warmup: ex.warmup, working: ex.working, isCore: ex.isCore, swaps: ex.swaps ?? [],
      })
    }
  }
  for (const ex of mains) {
    for (const swapName of ex.swaps ?? []) {
      if (!byName.has(swapName)) {
        byName.set(swapName, {
          name: swapName, muscle: ex.muscle, sets: 3, reps: '10',
          rest: '60s', isCore: ex.isCore, swaps: [],
        })
      }
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/** Combined catalog — every movement from both programs is pickable. */
export const EXERCISE_LIBRARY: LibraryExercise[] = buildLibrary([PRONIT_PROGRAM, AISHWARYA_PROGRAM])

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
