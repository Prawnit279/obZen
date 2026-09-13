/**
 * Which parent lift each movement is a variant of.
 *
 * The catalog is 121 movements and the picker listed them flat, so finding the
 * squat you wanted meant reading past nine of them. Grouping is by *named
 * parent lift* — Squat, Deadlift, Bench Press, Curl — rather than by movement
 * pattern, so the list reads the way a lifter names things.
 *
 * This is the third way the catalog is sliced and the other two stay as they
 * are: `muscle` drives the picker's filter chips, and `DETAIL_ALIASES` in
 * exercise-guides.ts points a variant at its parent's coaching text. That last
 * one is a near-neighbour of this file and deliberately not merged with it —
 * it exists only where a parent has written setup/faults/cues to inherit, which
 * is eleven lifts, not twenty-nine families.
 *
 * Families are display-ordered by muscle group, matching the picker's chips.
 * Membership is stated family-first because that is how the categorisation
 * reads; the id lookup is inverted from it at load.
 */

export type FamilyId =
  // legs
  | 'squat' | 'lunge' | 'deadlift' | 'hinge' | 'hip-thrust' | 'glute-kickback'
  | 'leg-curl' | 'leg-extension' | 'calf-raise' | 'adduction'
  // back
  | 'pull-up' | 'row'
  // shoulders
  | 'overhead-press' | 'lateral-raise' | 'front-raise' | 'rear-delt' | 'shrug'
  // arms
  | 'curl' | 'triceps-extension' | 'wrist'
  // chest
  | 'bench-press' | 'dip' | 'push-up' | 'fly'
  // core
  | 'leg-raise' | 'crunch' | 'plank' | 'ab-wheel' | 'anti-rotation'

export interface ExerciseFamily {
  id: FamilyId
  label: string
}

/** Display order — muscle group by muscle group, as the picker's chips run. */
export const FAMILIES: ExerciseFamily[] = [
  { id: 'squat',            label: 'Squat' },
  { id: 'lunge',            label: 'Lunge & Split Squat' },
  { id: 'deadlift',         label: 'Deadlift' },
  { id: 'hinge',            label: 'Hinge' },
  { id: 'hip-thrust',       label: 'Hip Thrust & Bridge' },
  { id: 'glute-kickback',   label: 'Glute Kickback' },
  { id: 'leg-curl',         label: 'Leg Curl' },
  { id: 'leg-extension',    label: 'Leg Extension' },
  { id: 'calf-raise',       label: 'Calf Raise' },
  { id: 'adduction',        label: 'Inner Thigh' },

  { id: 'pull-up',          label: 'Pull-Up & Pulldown' },
  { id: 'row',              label: 'Row' },

  { id: 'overhead-press',   label: 'Overhead Press' },
  { id: 'lateral-raise',    label: 'Lateral Raise' },
  { id: 'front-raise',      label: 'Front Raise' },
  { id: 'rear-delt',        label: 'Rear Delt' },
  { id: 'shrug',            label: 'Shrug & Upright Row' },

  { id: 'curl',             label: 'Curl' },
  { id: 'triceps-extension', label: 'Triceps Extension' },
  { id: 'wrist',            label: 'Wrist & Forearm' },

  { id: 'bench-press',      label: 'Bench Press' },
  { id: 'dip',              label: 'Dip' },
  { id: 'push-up',          label: 'Push-Up' },
  { id: 'fly',              label: 'Fly & Pullover' },

  { id: 'leg-raise',        label: 'Leg & Knee Raise' },
  { id: 'crunch',           label: 'Crunch & Twist' },
  { id: 'plank',            label: 'Plank & Hold' },
  { id: 'ab-wheel',         label: 'Ab Wheel' },
  { id: 'anti-rotation',    label: 'Anti-Rotation & Carry' },
]

/**
 * Members by family, keyed the way `toExerciseId` slugs a name.
 *
 * The calls worth knowing about, since none of them is the only defensible one:
 *  - Leg press sits under Squat. It is the knee-dominant pattern under a
 *    different machine, and filing it alone helps nobody.
 *  - Lunges are their own family rather than squats. They load one leg and
 *    progress on their own terms.
 *  - Romanian deadlifts are Hinge, not Deadlift. The conventional pull starts
 *    from the floor and the RDL never reaches it; sharing a family would imply
 *    the loads are comparable.
 *  - The kettlebell swing is a Hinge, not its own thing — same pattern, thrown.
 *  - Lat pulldown joins the pull-ups: it is the vertical pull you can load.
 *  - The upright row sits with the shrugs. Both are traps-dominant and keep the
 *    bar against the body.
 */
const MEMBERS: Record<FamilyId, string[]> = {
  squat: [
    'barbell-squat', 'barbell-back-squat', 'front-squat', 'zercher-squat',
    'goblet-squat', 'hack-squat', 'smith-machine-squat', 'leg-press',
  ],
  lunge: [
    'bulgarian-split-squat', 'front-foot-elevated-split-squat', 'walking-lunge',
    'reverse-lunge', 'curtsy-lunge', 'step-up',
  ],
  deadlift: [
    'deadlift', 'sumo-deadlift', 'trap-bar-deadlift', 'rack-pull',
    'kettlebell-deadlift',
  ],
  hinge: [
    'romanian-deadlift', 'dumbbell-rdl', 'single-leg-rdl', 'good-morning',
    'cable-pull-through', 'kettlebell-swing',
  ],
  'hip-thrust': [
    'hip-thrust-machine', 'barbell-hip-thrust', 'single-leg-hip-thrust',
    'glute-bridge', 'frog-pump',
  ],
  'glute-kickback': ['cable-glute-kickback', 'machine-kickback', 'banded-kickback'],
  'leg-curl': ['seated-leg-curl', 'lying-leg-curl', 'nordic-negative', 'stability-ball-curl'],
  'leg-extension': ['leg-extension'],
  'calf-raise': ['standing-calf-raises', 'seated-calf-raise'],
  adduction: ['inner-thigh-machine'],

  'pull-up': [
    'pull-ups', 'chin-ups', 'neutral-grip-pull-ups', 'weighted-pull-ups',
    'assisted-pull-up', 'band-assisted-pull-up', 'lat-pulldown',
  ],
  row: [
    'barbell-row', 't-bar-row', 'seated-cable-row', 'chest-supported-row',
    'one-arm-db-row', 'machine-row', 'inverted-row',
  ],

  'overhead-press': [
    'shoulder-press-bar', 'db-shoulder-press', 'dumbbell-shoulder-press',
    'machine-shoulder-press', 'arnold-press', 'landmine-press', 'barbell-push-press',
  ],
  'lateral-raise': ['db-lateral-raises', 'dumbbell-lateral-raises'],
  'front-raise': ['barbell-front-raises', 'dumbbell-front-raise'],
  'rear-delt': [
    'rear-delt-fly', 'rear-delt-raises', 'rear-delt-fly-machine', 'face-pull',
    'band-pull-apart', 'barbell-rear-delt-row', 'dumbbell-rear-delt-row',
  ],
  shrug: ['barbell-shrug', 'dumbbell-shrug', 'ez-bar-upright-row'],

  curl: [
    'barbell-curls', 'ez-bar-curl', 'ez-bar-preacher-curl', 'ez-bar-reverse-curl',
    'hammer-curls', 'concentration-curl', 'zottman-curl', 'cable-bicep-curls',
  ],
  'triceps-extension': [
    'ez-bar-skull-crusher', 'ez-bar-overhead-triceps-extension',
    'dumbbell-overhead-triceps-extension', 'dumbbell-triceps-kickback', 'cable-triceps',
  ],
  wrist: ['barbell-wrist-curl'],

  'bench-press': [
    'bench-press', 'incline-bench-press', 'incline-dumbbell-press',
    'chest-press-machine', 'incline-chest-press-machine',
  ],
  dip: ['bar-dips', 'assisted-dip', 'bench-dip'],
  'push-up': ['push-up', 'weighted-push-ups'],
  fly: ['dumbbell-fly', 'cable-fly', 'pec-deck', 'dumbbell-pullover'],

  'leg-raise': [
    'hanging-leg-raises', 'hanging-knee-raise', 'bar-knee-raises', 'leg-lowers',
    'reverse-crunch',
  ],
  crunch: ['cable-crunch', 'russian-twists'],
  plank: ['plank', 'side-plank', 'hollow-body-hold', 'dead-bug', 'bird-dog'],
  'ab-wheel': ['ab-wheel', 'ab-wheel-from-knees'],
  'anti-rotation': ['cable-pallof-press', 'half-kneeling-chop', 'suitcase-carry'],
}

/** Family for an exercise id, inverted from the membership lists above. */
const FAMILY_BY_EXERCISE: Record<string, FamilyId> = Object.fromEntries(
  Object.entries(MEMBERS).flatMap(([family, ids]) =>
    ids.map(id => [id, family as FamilyId])
  )
)

/**
 * Family for a logged exercise id, or undefined for a custom addition the
 * catalog has never heard of — those are shown ungrouped rather than guessed at.
 */
export function familyFor(exerciseId: string): FamilyId | undefined {
  return FAMILY_BY_EXERCISE[exerciseId]
}

/**
 * Split a list into its families, in display order, plus whatever has none.
 *
 * Pure and exported for its own sake: this decides whether a movement is
 * reachable in the picker at all, and a bug here hides one rather than
 * misplacing it — nothing on screen would say so. Every input appears in
 * exactly one of the two outputs.
 */
export function groupByFamily<T>(
  items: T[],
  idOf: (item: T) => string
): { groups: { family: ExerciseFamily; members: T[] }[]; ungrouped: T[] } {
  const byFamily = new Map<FamilyId, T[]>()
  const ungrouped: T[] = []

  for (const item of items) {
    const family = familyFor(idOf(item))
    if (!family) {
      ungrouped.push(item)
      continue
    }
    byFamily.set(family, [...(byFamily.get(family) ?? []), item])
  }

  const groups = FAMILIES
    .filter(f => byFamily.has(f.id))
    .map(family => ({ family, members: byFamily.get(family.id)! }))

  return { groups, ungrouped }
}

export { MEMBERS as FAMILY_MEMBERS }
