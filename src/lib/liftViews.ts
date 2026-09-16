/**
 * The ways of looking at a lift's history.
 *
 * One chart answered one question: how many pounds is the estimated max. That
 * is the right default and a poor only option — a full history compresses the
 * last six weeks into nothing, a heavy lift and a light one cannot be compared
 * on a shared axis, and none of it says whether a lift is moving because you
 * got stronger or because you got heavier.
 *
 * Each measure here is a different y-value over the same sessions, so the chart
 * stays one chart and the choice is the caller's.
 */

import type { WorkoutDaySession } from '@/db/dexie'
import { realSets, loadedWeightKg, bestE1RM, kgToLb } from '@/lib/progress'
import type { BarMode } from '@/lib/barWeight'
import type { TrendPoint } from '@/lib/bodyweight'

export type LiftMeasure = 'e1rm' | 'topSet' | 'perBw' | 'percent'
export type LiftRange = '8w' | '6m' | 'all'

export const LIFT_MEASURES: { value: LiftMeasure; label: string }[] = [
  { value: 'e1rm', label: 'Est. 1RM' },
  { value: 'topSet', label: 'Top set' },
  { value: 'perBw', label: '×BW' },
  { value: 'percent', label: '% change' },
]

export const LIFT_RANGES: { value: LiftRange; label: string }[] = [
  { value: '8w', label: '8 weeks' },
  { value: '6m', label: '6 months' },
  { value: 'all', label: 'All' },
]

/**
 * What the chart is called when it cannot be seen.
 *
 * Spelled out per measure rather than composed from a name and a unit, which
 * produced "×BW in ×BW" for anything whose name already carried its unit.
 */
export const MEASURE_AXIS_LABEL: Record<LiftMeasure, string> = {
  e1rm: 'Estimated 1RM in pounds',
  topSet: 'Heaviest set in pounds',
  perBw: 'Estimated 1RM per pound of bodyweight',
  percent: 'Percent change since the start of the window',
}

const DAYS: Record<Exclude<LiftRange, 'all'>, number> = { '8w': 56, '6m': 183 }

/**
 * The earliest date a range includes, or null when it includes everything.
 *
 * Dates are compared as strings throughout the app, so this returns one too.
 */
export function rangeStart(range: LiftRange, todayISO: string): string | null {
  if (range === 'all') return null
  const d = new Date(`${todayISO}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - DAYS[range])
  return d.toISOString().slice(0, 10)
}

export interface LiftPoint {
  date: string
  value: number
}

/** The bodyweight the trend says you were on a date — the nearest reading at or before it. */
function trendAt(trend: TrendPoint[], date: string): number {
  let kg = 0
  for (const p of trend) {
    if (p.date > date) break
    kg = p.trendKg
  }
  // Before the first weigh-in, fall back to the earliest one rather than zero.
  return kg || trend[0]?.trendKg || 0
}

/**
 * One lift's history under the chosen measure, in display units.
 *
 * `percent` is change from the first session *in the window*, so narrowing the
 * range re-bases it — which is the point: it answers "what has this lift done
 * lately", not "since the beginning of time".
 */
export function liftPoints(
  sessions: WorkoutDaySession[],
  exerciseId: string,
  measure: LiftMeasure,
  trend: TrendPoint[],
  range: LiftRange,
  todayISO: string,
  barMode: BarMode = 'with-bar'
): LiftPoint[] {
  const from = rangeStart(range, todayISO)

  const base = sessions
    .filter(s => (from === null || s.date >= from) && s.date <= todayISO)
    .flatMap(s => {
      const ex = s.exercises.find(e => e.exerciseId === exerciseId)
      if (!ex || realSets(ex).length === 0) return []
      const bodyweightKg = trendAt(trend, s.date)

      if (measure === 'topSet') {
        // What actually went on the bar — no bodyweight, no rep estimate.
        const heaviest = Math.max(...realSets(ex).map(set => loadedWeightKg(exerciseId, set, barMode)))
        return heaviest > 0 ? [{ date: s.date, value: kgToLb(heaviest) }] : []
      }

      const e1rm = bestE1RM(ex, bodyweightKg, barMode)
      if (e1rm <= 0) return []

      if (measure === 'perBw') {
        // Strength carried per pound of lifter. Without a weigh-in there is no
        // ratio to give, and inventing one would read as a real number.
        return bodyweightKg > 0
          ? [{ date: s.date, value: Math.round((e1rm / bodyweightKg) * 100) / 100 }]
          : []
      }
      return [{ date: s.date, value: kgToLb(e1rm) }]
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  if (measure !== 'percent') return base

  // Percent needs something to be a percent of.
  const first = base[0]?.value
  if (first === undefined || first === 0) return []
  return base.map(p => ({
    date: p.date,
    value: Math.round(((p.value - first) / first) * 1000) / 10,
  }))
}
