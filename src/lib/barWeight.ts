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
 * maintaining.
 *
 * This module imports nothing from `progress.ts` — it is the leaf, and
 * `progress.ts` converts to kilos at the point of use — so the two do not form
 * an import cycle.
 */

import { EXERCISE_MOTIONS } from '@/data/exercise-motions'

/** A standard Olympic barbell. */
export const DEFAULT_BAR_LB = 45

/**
 * Tagged `bar`, but not carrying a free 45 lb bar — the logged number is
 * already the whole load, so adding to it would overstate the lift.
 */
const NOT_BAR_LOADED: ReadonlySet<string> = new Set([
  'lat-pulldown',       // cable stack; the bar is a handle
  'seated-cable-row',   // cable stack, likewise
  'smith-machine-squat', // counterbalanced, and the residue varies by machine
  'landmine-press',     // one end stays on the floor, so half the bar at most
  'chest-supported-row', // usually a machine or a T-bar, not a loaded barbell
])

/**
 * Bar weight in pounds for a logged exercise, or 0 when the movement is not
 * bar-loaded. Unknown ids — custom additions the motion table has never heard
 * of — get 0, because guessing a bar onto an unknown movement would silently
 * inflate it.
 */
export function barWeightLbFor(exerciseId: string): number {
  if (NOT_BAR_LOADED.has(exerciseId)) return 0
  return EXERCISE_MOTIONS[exerciseId]?.equipment === 'bar' ? DEFAULT_BAR_LB : 0
}


/** Whether a movement's logged weight is plates rather than the whole load. */
export function isBarLoaded(exerciseId: string): boolean {
  return barWeightLbFor(exerciseId) > 0
}
