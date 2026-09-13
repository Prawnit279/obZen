/**
 * Exercise ids that have changed since sessions were logged against them.
 *
 * A session stores `exerciseId`, which is the slug of the name at the time it
 * was logged, and nothing rewrites that stored value — the same rule the bar
 * weight follows. So renaming a movement in the catalog strands every set
 * already logged under the old slug: the lift loses its name, its tracking mode
 * and its animation, and the history shows a raw slug instead.
 *
 * Mapping old id to new here keeps that history attached. Entries are permanent
 * once added; a logged session from any past build has to keep resolving.
 *
 * A leaf module on purpose. Everything a logged id reaches resolves through it —
 * `libraryFor` (and so `exerciseNameFor`, `trackingModeFor`, `bodyweightFactorFor`),
 * `motionFor`, `guideFor`, `coreDetailFor`, `barWeightLbFor`, and the picker's
 * already-added check — and none of them should have to import each other to do
 * so. A lookup that skips it fails silently: the set stays in the database and
 * quietly stops matching the catalog.
 */

export const RENAMED_EXERCISE_IDS: Record<string, string> = {
  // The catalog called it by the machine's equipment name. Every gym calls it
  // the rear delt fly machine, and the picker should too.
  'reverse-pec-deck': 'rear-delt-fly-machine',
}

/** The id a movement is known by now, given any id it has ever been logged as. */
export function canonicalExerciseId(exerciseId: string): string {
  return RENAMED_EXERCISE_IDS[exerciseId] ?? exerciseId
}
