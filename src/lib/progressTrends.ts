import type { WorkoutDaySession } from '@/db/dexie'
import { trackingModeFor, exerciseNameFor } from '@/data/obzen-program'
import { e1rmSeries, realSets, toKg, bestE1RM } from '@/lib/progress'
import type { E1RMPoint } from '@/lib/progress'

/**
 * Derived training signals — direction, staleness and records over time.
 *
 * Everything here reads the same `workoutDaySessions` the rest of the app does
 * and stores nothing. Kept apart from `progress.ts` because that module is the
 * measurement layer (what a set was worth) while this one is the interpretation
 * layer (what a run of sets means), and the two have different reasons to
 * change.
 */

const MS_PER_WEEK = 7 * 864e5

function weeksBetween(fromISO: string, toISO: string): number {
  return (Date.parse(`${toISO}T12:00:00`) - Date.parse(`${fromISO}T12:00:00`)) / MS_PER_WEEK
}

// ── Trend ────────────────────────────────────────────────────────────────────

export interface Trend {
  /** Least-squares gradient in kg per week. Negative means going backwards. */
  slopeKgPerWeek: number
  /** Most recent estimated 1RM in the series, kg. */
  latestKg: number
  /** Points the fit was made from. Two is the minimum that defines a line. */
  points: number
  /** Weeks spanned from first session to last. */
  weeks: number
}

/**
 * Least-squares fit through an e1RM series.
 *
 * Returns null below two points: one session is a reading, not a direction, and
 * drawing a trend through it would invent confidence that is not there.
 */
export function e1rmTrend(points: E1RMPoint[]): Trend | null {
  if (points.length < 2) return null

  const first = points[0].date
  const xs = points.map(p => weeksBetween(first, p.date))
  const ys = points.map(p => p.e1rm)
  const n = points.length
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n

  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }

  // Every session on the same date — a vertical fit has no gradient.
  if (den === 0) return null

  return {
    slopeKgPerWeek: num / den,
    latestKg: ys[n - 1],
    points: n,
    weeks: xs[n - 1],
  }
}

/**
 * Weeks until a trend reaches `goalKg` at its current gradient.
 *
 * Null when the goal is already met, or when the trend is flat or falling — a
 * projection along a downward line would print a date the lift never reaches.
 */
export function weeksToGoal(trend: Trend, goalKg: number): number | null {
  if (trend.latestKg >= goalKg) return null
  if (trend.slopeKgPerWeek <= 0) return null
  return (goalKg - trend.latestKg) / trend.slopeKgPerWeek
}

// ── Stall detection ──────────────────────────────────────────────────────────

/** Weeks without a new best before a lift counts as stalled. */
export const STALL_WEEKS = 4

/** How much 5/3/1 takes off a training max when a lift stops moving. */
export const TM_RESET_FRACTION = 0.9

export interface StallCheck {
  stalled: boolean
  /** Weeks between the best session and the most recent one. */
  weeksSincePeak: number
  peakKg: number
  peakDate: string
  /** Training max to come back at, kg — 90% of the peak, per 5/3/1. */
  resetToKg: number
}

/**
 * Whether a lift has gone `weeks` without beating its own best.
 *
 * Measured from the peak to the latest session rather than to today, so a
 * deliberate break does not read as a stall — only training that is happening
 * and not progressing does.
 */
export function stallCheck(points: E1RMPoint[], weeks = STALL_WEEKS): StallCheck | null {
  if (points.length < 2) return null

  const peak = points.reduce((best, p) => (p.e1rm > best.e1rm ? p : best), points[0])
  const latest = points[points.length - 1]
  const since = weeksBetween(peak.date, latest.date)

  return {
    stalled: since >= weeks,
    weeksSincePeak: since,
    peakKg: peak.e1rm,
    peakDate: peak.date,
    resetToKg: peak.e1rm * TM_RESET_FRACTION,
  }
}

// ── Records as they were set ─────────────────────────────────────────────────

export type PRKind = 'weight' | 'e1rm'

export interface PREvent {
  date: string
  exerciseId: string
  name: string
  kind: PRKind
  /** kg for both kinds — a weight PR is the bar, an e1RM PR is the estimate. */
  valueKg: number
  /** The record it beat, or null when it was the first one set. */
  previousKg: number | null
  /** Reps performed, for a weight PR. */
  reps?: number
}

/**
 * Every moment a record was broken, most recent first.
 *
 * `recentPRs` in `progress.ts` answers "what is this lift's best?" — one row
 * per exercise. This answers "what did I beat, and when?", which is a different
 * list: a lift that improved four times appears four times, and a lift that has
 * never improved does not appear at all.
 *
 * Weight records are only tracked for `load` movements. For an assisted lift a
 * heavier number is more help rather than more work, and for a timed hold the
 * reps field is seconds — neither is a heavier lift.
 */
export function prFeed(sessions: WorkoutDaySession[], bodyweightKg = 0): PREvent[] {
  const chronological = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  const bestWeight = new Map<string, number>()
  const bestE1rm = new Map<string, number>()
  const events: PREvent[] = []

  for (const session of chronological) {
    for (const ex of session.exercises) {
      const sets = realSets(ex)
      if (sets.length === 0) continue

      const id = ex.exerciseId
      const name = ex.name ?? exerciseNameFor(id)
      const isLoad = trackingModeFor(id) === 'load'

      if (isLoad) {
        const heaviest = sets.reduce(
          (best, s) => (toKg(s.weight, s.unit) > toKg(best.weight, best.unit) ? s : best),
          sets[0]
        )
        const weightKg = toKg(heaviest.weight, heaviest.unit)
        const prev = bestWeight.get(id)
        if (weightKg > 0 && (prev === undefined || weightKg > prev)) {
          events.push({
            date: session.date, exerciseId: id, name, kind: 'weight',
            valueKg: weightKg, previousKg: prev ?? null, reps: heaviest.reps,
          })
          bestWeight.set(id, weightKg)
        }
      }

      const e1rm = bestE1RM(ex, bodyweightKg)
      const prevE = bestE1rm.get(id)
      if (e1rm > 0 && (prevE === undefined || e1rm > prevE)) {
        // A first-ever session sets both records at once; the weight row already
        // says it, so only report the estimate when it beat something.
        if (prevE !== undefined) {
          events.push({
            date: session.date, exerciseId: id, name, kind: 'e1rm',
            valueKg: e1rm, previousKg: prevE,
          })
        }
        bestE1rm.set(id, e1rm)
      }
    }
  }

  return events.reverse()
}

// ── Per-lift summary, for the view ───────────────────────────────────────────

export interface LiftSignal {
  exerciseId: string
  name: string
  trend: Trend | null
  stall: StallCheck | null
}

/** Trend and stall state for each of a profile's key lifts. */
export function liftSignals(
  sessions: WorkoutDaySession[],
  exerciseIds: string[],
  bodyweightKg = 0
): LiftSignal[] {
  return exerciseIds.map(id => {
    const points = e1rmSeries(sessions, id, bodyweightKg)
    return {
      exerciseId: id,
      name: exerciseNameFor(id),
      trend: e1rmTrend(points),
      stall: stallCheck(points),
    }
  })
}
