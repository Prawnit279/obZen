export type MuscleGroup = 'legs' | 'back' | 'shoulders' | 'arms' | 'chest' | 'core'

export interface ProgramExercise {
  name: string
  muscle: MuscleGroup
  /** Prescribed working sets. */
  sets: number
  /** Rep target as written on the plan, e.g. '10–12', '8/leg', '20–30s'. */
  reps: string
  /** Rest between sets as written on the plan, e.g. '90s', '2–3 min'. */
  rest: string
  /** Core/ab movement — surfaced with a CORE tag in the UI. */
  isCore?: boolean
  /** Suggested alternatives for this movement. */
  swaps: string[]
}

export interface ProgramDay {
  focus: string
  exercises: ProgramExercise[]
}

/** Human-readable prescription summary, e.g. '4 × 10–12 · 90s'. */
export function formatTarget(sets: number, reps: string, rest: string): string {
  return `${sets} × ${reps} · rest ${rest}`
}

/** Slug used as the stable exerciseId for a movement name. */
export function toExerciseId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * The three loadable day templates. A day is no longer auto-loaded — the user
 * either loads one of these as a starting point or builds a day from the
 * exercise library, then edits freely. (Phase 1 glute/hamstring program.)
 */
export const OBZEN_PROGRAM: Record<string, ProgramDay> = {
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

/** A pickable catalog entry — same shape a template exercise carries. */
export interface LibraryExercise {
  name: string
  muscle: MuscleGroup
  sets: number
  reps: string
  rest: string
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
function buildLibrary(program: Record<string, ProgramDay>): LibraryExercise[] {
  const byName = new Map<string, LibraryExercise>()
  const mains = Object.values(program).flatMap(day => day.exercises)

  for (const ex of mains) {
    if (!byName.has(ex.name)) {
      byName.set(ex.name, {
        name: ex.name, muscle: ex.muscle, sets: ex.sets,
        reps: ex.reps, rest: ex.rest, isCore: ex.isCore, swaps: ex.swaps,
      })
    }
  }
  for (const ex of mains) {
    for (const swapName of ex.swaps) {
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

export const EXERCISE_LIBRARY: LibraryExercise[] = buildLibrary(OBZEN_PROGRAM)

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
