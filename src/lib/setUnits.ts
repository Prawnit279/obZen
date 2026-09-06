import { trackingModeFor } from '@/data/obzen-program'
import type { TrackingMode } from '@/data/obzen-program'

/**
 * What the two numbers on a logged set actually mean for a given movement.
 *
 * `LoggedSet` stores every movement the same way — a `weight` and a `reps` —
 * but what those fields hold depends on the movement's tracking mode. A plank
 * puts *seconds* in `reps`; an assisted pull-up puts the *assistance* in
 * `weight`, where less is better. The analytics in `lib/progress.ts` have
 * always read the fields that way; this is the matching contract for the UI, so
 * the logger asks for the number it is going to interpret rather than labelling
 * every field "reps" and hoping.
 */
export interface SetUnits {
  /** Short label beside the count input. */
  countLabel: string
  /** Accessible name for the count input. */
  countAria: string
  /** Accessible name for the weight input. */
  weightAria: string
  /** The count is a duration in seconds, not a repetition count. */
  isDuration: boolean
  /** The weight is assistance taken off bodyweight — lower is better. */
  isAssistance: boolean
}

export function setUnitsForMode(mode: TrackingMode): SetUnits {
  switch (mode) {
    case 'timed':
      return {
        countLabel: 'sec',
        countAria: 'Seconds held',
        weightAria: 'Added weight',
        isDuration: true,
        isAssistance: false,
      }
    case 'assisted':
      return {
        countLabel: 'reps',
        countAria: 'Reps',
        weightAria: 'Assistance weight',
        isDuration: false,
        isAssistance: true,
      }
    default:
      return {
        countLabel: 'reps',
        countAria: 'Reps',
        weightAria: 'Weight',
        isDuration: false,
        isAssistance: false,
      }
  }
}

export function setUnitsFor(exerciseId: string): SetUnits {
  return setUnitsForMode(trackingModeFor(exerciseId))
}

/** One logged set as a line of text, e.g. '135 lb × 5', '45 s', '30 lb assist × 6'. */
export function formatSet(units: SetUnits, weightLb: number, count: number): string {
  const rounded = Math.round(weightLb * 10) / 10
  if (units.isDuration) {
    return rounded > 0 ? `${rounded} lb · ${count} s` : `${count} s`
  }
  if (units.isAssistance) {
    return `${rounded} lb assist × ${count}`
  }
  return `${rounded} lb × ${count}`
}
