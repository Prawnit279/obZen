/**
 * AMRAP sets and what they say about the next Training Max.
 *
 * A straight set stops at a prescribed rep count, so its estimated max only
 * tells you the set was not maximal. An AMRAP — as many reps as possible — is
 * the one set that actually probes the ceiling, which is why 5/3/1 puts one at
 * the end of every working wave and reads the whole cycle off it.
 *
 * The app does not store a Training Max. Rather than invent one, this module
 * derives the bar from history: the strongest estimated max recorded *before*
 * the AMRAP in question stands in for "the TM you have been running". That is
 * an approximation, and the reason strings say so rather than presenting the
 * output as a prescription.
 *
 * Units follow 5/3/1's own convention — pounds, rounded to the nearest 5 —
 * which is why this reuses the pound-native calculators in `strengthTools.ts`
 * rather than the kilo-based ones in `progress.ts`.
 */

import type { WorkoutDaySession, LoggedSet, ExerciseSessionState } from '@/db/dexie'
import { isRealSet, setWeightLb, loadedWeightLb, isUpperBodyMuscle } from '@/lib/progress'
import { epley1RM, roundTo5, trainingMax } from '@/lib/strengthTools'

/** A Training Max is 90% of an estimated 1RM. */
export const TM_FRACTION = 0.9

/**
 * How far a lift may slip before the advice stops being "repeat it" and becomes
 * "reset". A tenth off the best is 5/3/1's own stall threshold.
 */
export const RESET_BAND = 0.9

/** Standard cycle jumps: 5 lb on upper-body lifts, 10 lb on lower. */
export const UPPER_INCREMENT_LB = 5
export const LOWER_INCREMENT_LB = 10

/** An AMRAP set as it was logged, with the lift and day it belongs to. */
export interface AmrapSet {
  exerciseId: string
  dateISO: string
  weightLb: number
  reps: number
  /** Muscle group as persisted on the session — decides the cycle increment. */
  muscle?: string
}

export type TmVerdict = 'advance' | 'hold' | 'reset'

export interface TmAdvice {
  exerciseId: string
  /** The set this reading came from. */
  set: AmrapSet
  /** Estimated 1RM the AMRAP implies, in pounds. */
  e1rmLb: number
  /** 90% of that — the Training Max 5/3/1 would run off this set. */
  impliedTmLb: number
  /** The Training Max implied by the lift's best earlier session, if any. */
  priorTmLb: number | null
  incrementLb: number
  /** What to run next cycle. */
  nextTmLb: number
  verdict: TmVerdict
  reason: string
}

/** The heaviest flagged, actually-performed AMRAP in one exercise entry. */
function heaviestAmrap(ex: ExerciseSessionState): LoggedSet | undefined {
  return ex.sets
    .filter(s => s.isAmrap === true && isRealSet(s))
    .reduce<LoggedSet | undefined>(
      (best, s) => (best === undefined || setWeightLb(s) > setWeightLb(best) ? s : best),
      undefined
    )
}

/**
 * The newest AMRAP set recorded for each of the given lifts, in the order the
 * lifts were asked for. Lifts with no flagged set are simply absent — an
 * unflagged history cannot say whether a rep count was a limit or an
 * instruction, so guessing would be worse than staying quiet.
 */
export function latestAmrapSets(
  sessions: WorkoutDaySession[],
  exerciseIds: string[]
): AmrapSet[] {
  return exerciseIds.flatMap(exerciseId => {
    const candidates = sessions
      .flatMap(session => {
        const ex = session.exercises.find(e => e.exerciseId === exerciseId)
        if (!ex) return []
        const best = heaviestAmrap(ex)
        return best === undefined
          ? []
          : [{
              exerciseId,
              dateISO: session.date,
              weightLb: loadedWeightLb(exerciseId, best),
              reps: best.reps,
              muscle: ex.muscle,
            }]
      })
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO))

    return candidates.length > 0 ? [candidates[0]] : []
  })
}

/**
 * The best Training Max implied by anything this lift did strictly before
 * `beforeISO`. Null when the AMRAP is the first thing on record.
 */
function priorTrainingMax(
  sessions: WorkoutDaySession[],
  exerciseId: string,
  beforeISO: string
): number | null {
  const best = sessions
    .filter(s => s.date < beforeISO)
    .flatMap(session => {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId)
      return ex ? ex.sets.filter(isRealSet) : []
    })
    .reduce((max, s) => Math.max(max, epley1RM(loadedWeightLb(exerciseId, s), s.reps)), 0)

  return best > 0 ? trainingMax(best) : null
}

/**
 * The verdict, carrying the prior Training Max where one exists.
 *
 * `hold` and `reset` are only reachable with something earlier to compare
 * against, and saying so in the type means `nextTmFor` can read that number
 * without a non-null assertion standing in for an invariant kept elsewhere.
 */
type Reading =
  | { verdict: 'advance'; priorTmLb: number | null }
  | { verdict: 'hold' | 'reset'; priorTmLb: number }

function readingFor(impliedTmLb: number, priorTmLb: number | null): Reading {
  if (priorTmLb === null || impliedTmLb >= priorTmLb) {
    return { verdict: 'advance', priorTmLb }
  }
  return impliedTmLb >= priorTmLb * RESET_BAND
    ? { verdict: 'hold', priorTmLb }
    : { verdict: 'reset', priorTmLb }
}

function reasonFor(verdict: TmVerdict, impliedTmLb: number, priorTmLb: number | null): string {
  if (priorTmLb === null) {
    return 'First AMRAP on record, so this sets the baseline rather than testing one.'
  }
  const pct = Math.round((impliedTmLb / priorTmLb) * 100)
  switch (verdict) {
    case 'advance':
      return `This set supports a Training Max of ${impliedTmLb} lb, at or above the ${priorTmLb} lb your best session implies.`
    case 'hold':
      return `This set implies ${impliedTmLb} lb — ${pct}% of the ${priorTmLb} lb your best session supports. Worth repeating the weight before adding to it.`
    case 'reset':
      return `This set implies ${impliedTmLb} lb — ${pct}% of the ${priorTmLb} lb your best session supports. 5/3/1 would drop back and build again.`
  }
}

function nextTmFor(reading: Reading, impliedTmLb: number, incrementLb: number): number {
  switch (reading.verdict) {
    // Nothing earlier to beat, or the lift is keeping up: take the cycle jump
    // from whichever Training Max is higher.
    case 'advance':
      return Math.max(impliedTmLb, reading.priorTmLb ?? 0) + incrementLb
    // A bad day, not a stall — run the same weight again.
    case 'hold':
      return reading.priorTmLb
    // The book's reset: back to 90% and rebuild.
    case 'reset':
      return roundTo5(reading.priorTmLb * RESET_BAND)
  }
}

/**
 * What each lift's most recent AMRAP suggests for the next cycle's Training
 * Max. Lifts with no flagged set are omitted entirely.
 */
export function tmAdvice(
  sessions: WorkoutDaySession[],
  exerciseIds: string[]
): TmAdvice[] {
  return latestAmrapSets(sessions, exerciseIds).map(set => {
    const e1rmLb = roundTo5(epley1RM(set.weightLb, set.reps))
    const impliedTmLb = trainingMax(epley1RM(set.weightLb, set.reps))
    const priorTmLb = priorTrainingMax(sessions, set.exerciseId, set.dateISO)
    const incrementLb = isUpperBodyMuscle(set.muscle) ? UPPER_INCREMENT_LB : LOWER_INCREMENT_LB
    const reading = readingFor(impliedTmLb, priorTmLb)

    return {
      exerciseId: set.exerciseId,
      set,
      e1rmLb,
      impliedTmLb,
      priorTmLb,
      incrementLb,
      nextTmLb: nextTmFor(reading, impliedTmLb, incrementLb),
      verdict: reading.verdict,
      reason: reasonFor(reading.verdict, impliedTmLb, priorTmLb),
    }
  })
}
