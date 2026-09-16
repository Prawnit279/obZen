/**
 * The bar itself.
 *
 * Sets are logged as plates — typing 135 for a row means three plates a side,
 * not 135 total — so every weight the app reports has to add the bar back. That
 * happens here rather than in the stored data: nothing is rewritten, the number
 * you typed stays the number you typed, and the correction cannot be applied
 * twice.
 *
 * Which lifts count comes from the `equipment` tag on the motion table rather
 * than from matching names, because the names lie in both directions: "Bench
 * Press" and "Deadlift" carry a bar without saying so, while several lifts
 * tagged `bar` are not loaded by a free 45 lb bar at all. Those are listed as
 * exclusions below, each with its reason, so a lift added to the motion table
 * later is picked up automatically and only the genuine exceptions need
 * maintaining. The EZ-bar lifts are the second kind of exception: genuinely
 * bar-loaded, but by a lighter bar than the tag implies.
 *
 * This module imports nothing from `progress.ts` — it is the leaf, and
 * `progress.ts` converts to kilos at the point of use — so the two do not form
 * an import cycle.
 */

import { EXERCISE_MOTIONS } from '@/data/exercise-motions'
import { canonicalExerciseId } from '@/data/exercise-renames'

/** A standard Olympic barbell. */
/**
 * Whether a reported number counts the bar.
 *
 * `with-bar` is what was lifted, and is the default everywhere. `plates-only`
 * answers the different question of what went on the bar — useful for checking
 * a figure against what you actually loaded, and meaningless for anything
 * calibrated against real load, which is why DOTS and the strength standards
 * never offer it.
 *
 * Handled here rather than threaded through the arithmetic above it. This is
 * the one place the bar is ever added, so it is the only place that needs to
 * know the difference.
 */
export type BarMode = 'with-bar' | 'plates-only'

export const DEFAULT_BAR_LB = 45

/**
 * A cambered curl bar. Lighter than an Olympic bar and it varies by gym — 15 lb
 * to 25 lb is the usual range — so this is the common Olympic-sleeve figure
 * rather than an exact one. It is still far closer than either alternative:
 * charging 45 lb overstates every curl by twenty pounds, and charging nothing
 * understates the ones logged as plates by the whole bar.
 */
export const EZ_BAR_LB = 25

/**
 * Tagged `bar` and drawn as one, but racked on an EZ bar rather than an Olympic
 * one. Listed by id because the motion table has a single `bar` tag: the
 * renderer wants a bar through both hands for these, and the load maths wants a
 * lighter one.
 */
export const EZ_BAR_LOADED: ReadonlySet<string> = new Set([
  'ez-bar-curl',
  'ez-bar-preacher-curl',
  'ez-bar-reverse-curl',
  'ez-bar-skull-crusher',
  'ez-bar-overhead-triceps-extension',
  'ez-bar-upright-row',
])

/**
 * Tagged `bar`, but not carrying a free 45 lb bar — the logged number is
 * already the whole load, so adding to it would overstate the lift.
 */
export const NOT_BAR_LOADED: ReadonlySet<string> = new Set([
  'lat-pulldown',       // cable stack; the bar is a handle
  'seated-cable-row',   // cable stack, likewise
  'smith-machine-squat', // counterbalanced, and the residue varies by machine
  'landmine-press',     // one end stays on the floor, so half the bar at most
  'chest-supported-row', // usually a machine or a T-bar, not a loaded barbell
  't-bar-row',          // anchored at one end, or a machine with its own handle
])

/**
 * Bar weight in pounds for a logged exercise, or 0 when the movement is not
 * bar-loaded. Unknown ids — custom additions the motion table has never heard
 * of — get 0, because guessing a bar onto an unknown movement would silently
 * inflate it.
 */
export function barWeightLbFor(exerciseId: string, mode: BarMode = 'with-bar'): number {
  if (mode === 'plates-only') return 0
  // Resolved first: all three lookups below are keyed by current id, and a set
  // logged before a rename carries the old one. Without this, renaming a
  // bar-loaded lift would quietly drop 45 lb from every set in its history.
  const id = canonicalExerciseId(exerciseId)
  if (NOT_BAR_LOADED.has(id)) return 0
  if (EZ_BAR_LOADED.has(id)) return EZ_BAR_LB
  return EXERCISE_MOTIONS[id]?.equipment === 'bar' ? DEFAULT_BAR_LB : 0
}


/** Whether a movement's logged weight is plates rather than the whole load. */
export function isBarLoaded(exerciseId: string): boolean {
  return barWeightLbFor(exerciseId) > 0
}
