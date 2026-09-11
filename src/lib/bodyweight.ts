/**
 * Bodyweight, read as a trend rather than as a scale.
 *
 * A morning weigh-in is mostly water. Sodium, carbohydrate, sleep and timing
 * move it by a kilo or more from one day to the next, so a line drawn through
 * raw readings mostly charts noise, and "change since the first reading" is at
 * the mercy of whichever mornings happen to bookend it. Everything here works
 * from a smoothed trend and a least-squares rate, and says nothing at all until
 * there are enough readings to mean something.
 *
 * Kilos throughout, like the rest of the progress maths; the screen converts to
 * pounds at the edge.
 */
import type { WorkoutDaySession } from '@/db/dexie'
import { e1rmSeries, kgToLb, lbToKg } from '@/lib/progress'
import { exerciseNameFor } from '@/data/obzen-program'

export interface WeighIn {
  /** ISO date, 'YYYY-MM-DD'. */
  date: string
  kg: number
}

export interface TrendPoint extends WeighIn {
  /** The smoothed weight on this date — what the scale is really saying. */
  trendKg: number
}

const DAY_MS = 86_400_000

/** Whole days since the epoch, in UTC so a timezone cannot shift a date. */
function dayNumber(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`) / DAY_MS
}

/** Floating-point slack for comparisons at a band's exact edge. */
const EPS = 1e-9

// ── Input ────────────────────────────────────────────────────────────────────

/**
 * The range a typed bodyweight must fall in, in pounds. Outside it a reading
 * is almost certainly a slipped key — 1650 for 165 — and one of those would
 * drag the trend for a week, so it is refused rather than stored.
 */
export const WEIGH_IN_LB = { min: 50, max: 700 } as const

/** A typed weigh-in in pounds, returned in kilos, or null if it is not plausible. */
export function parseWeighInLb(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const lb = Number(trimmed)
  if (!Number.isFinite(lb) || lb < WEIGH_IN_LB.min || lb > WEIGH_IN_LB.max) return null
  return lbToKg(lb)
}

// ── Trend ────────────────────────────────────────────────────────────────────

/**
 * How far the trend moves toward each day's reading. A quarter a day gives the
 * trend a memory of roughly a week, which is long enough to absorb a salty
 * dinner and short enough to follow a real change within a fortnight.
 */
export const TREND_ALPHA_PER_DAY = 0.25

/**
 * The trend opens on the average of the first few readings rather than on the
 * first one alone. An exponential trend inherits its starting point, so a light
 * or heavy first morning would otherwise sit at the head of the line and make
 * the early weeks look like a change that never happened.
 *
 * Only the opening week is averaged: readings further apart than that are
 * different weights rather than noise around one, and blending them would blur
 * a real change instead.
 */
export const SEED_READINGS = 3
export const SEED_WINDOW_DAYS = 7

/**
 * An exponentially smoothed trend through the weigh-ins.
 *
 * The smoothing is time-aware: a reading after a three-day gap pulls the trend
 * as three days' worth of decay would, rather than as one. Otherwise weighing
 * every day and weighing twice a week would produce different trends from the
 * same body.
 */
export function weightTrend(weighIns: WeighIn[]): TrendPoint[] {
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length === 0) return []

  const firstDay = dayNumber(sorted[0].date)
  const opening = sorted
    .slice(0, SEED_READINGS)
    .filter(w => dayNumber(w.date) - firstDay < SEED_WINDOW_DAYS)
  const seedKg = opening.reduce((sum, w) => sum + w.kg, 0) / opening.length

  const out: TrendPoint[] = []
  for (const w of sorted) {
    const prev = out[out.length - 1]
    if (!prev) {
      out.push({ date: w.date, kg: w.kg, trendKg: seedKg })
      continue
    }
    const gapDays = Math.max(1, dayNumber(w.date) - dayNumber(prev.date))
    const alpha = 1 - (1 - TREND_ALPHA_PER_DAY) ** gapDays
    out.push({ date: w.date, kg: w.kg, trendKg: prev.trendKg + alpha * (w.kg - prev.trendKg) })
  }
  return out
}

// ── Rate ─────────────────────────────────────────────────────────────────────

/** The rate reads only the most recent four weeks — today's pace, not history's. */
export const RATE_WINDOW_DAYS = 28
export const MIN_READINGS_FOR_RATE = 4
/** Readings bunched into a few days are a snapshot, not a direction. */
export const MIN_SPAN_DAYS_FOR_RATE = 10

/**
 * Change in kilos per week, as the least-squares slope through the recent
 * weigh-ins, or null when there are too few of them or they span too little
 * time to support a rate.
 *
 * Fitted to the raw readings rather than the trend: the trend lags by design,
 * and a regression is already robust to day-to-day noise without it.
 */
export function weeklyRateKg(weighIns: WeighIn[]): number | null {
  if (weighIns.length === 0) return null
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date))
  const lastDay = dayNumber(sorted[sorted.length - 1].date)
  const recent = sorted.filter(w => lastDay - dayNumber(w.date) <= RATE_WINDOW_DAYS)
  if (recent.length < MIN_READINGS_FOR_RATE) return null

  const xs = recent.map(w => dayNumber(w.date))
  if (xs[xs.length - 1] - xs[0] < MIN_SPAN_DAYS_FOR_RATE) return null

  const ys = recent.map(w => w.kg)
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length
  const my = ys.reduce((s, y) => s + y, 0) / ys.length
  let num = 0
  let den = 0
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    den += (xs[i] - mx) ** 2
  }
  return den === 0 ? null : (num / den) * 7
}

// ── Goal and reading ─────────────────────────────────────────────────────────

export type WeightPace = 'gentle' | 'steady'

/**
 * What the person is trying to do with their weight. Maintenance has no pace —
 * the point of it is not moving — so the type does not offer one.
 */
export type WeightGoal =
  | { direction: 'gain' | 'lose'; pace: WeightPace }
  | { direction: 'maintain' }

/**
 * Target rates as a percentage of bodyweight per week.
 *
 * Reference ranges, not prescriptions: they are the figures commonly given for
 * gaining with little fat and for cutting while keeping strength, and they
 * shift with training age and body composition. Expressed as a share of
 * bodyweight because a pound a week is a crawl for one lifter and a crash for
 * another.
 */
export const PACE_BANDS = {
  gain: { gentle: [0.1, 0.25], steady: [0.25, 0.5] },
  lose: { gentle: [0.25, 0.5], steady: [0.5, 1.0] },
} as const satisfies Record<'gain' | 'lose', Record<WeightPace, readonly [number, number]>>

/** Within this, either way, maintenance counts as holding. */
export const MAINTAIN_BAND_PCT = 0.25

export type WeightStatus =
  | 'on-pace' | 'too-fast' | 'too-slow' | 'wrong-way'
  | 'holding' | 'drifting'

/** How the reading should be coloured: fine, worth a look, or against the goal. */
export type WeightTone = 'good' | 'caution' | 'off'

export interface WeightReading {
  status: WeightStatus
  tone: WeightTone
  /** One plain sentence, in pounds, saying what the trend is doing. */
  sentence: string
}

const TONE: Record<WeightStatus, WeightTone> = {
  'on-pace': 'good',
  holding: 'good',
  'too-fast': 'caution',
  'too-slow': 'caution',
  drifting: 'caution',
  'wrong-way': 'off',
}

/** The goal as a lifter would name it. */
export function paceLabel(goal: WeightGoal): string {
  if (goal.direction === 'maintain') return 'Maintain'
  if (goal.direction === 'gain') return goal.pace === 'gentle' ? 'Lean gain' : 'Steady gain'
  return goal.pace === 'gentle' ? 'Gentle cut' : 'Steady cut'
}

/**
 * What the current rate means against the goal.
 *
 * A gain goal that is losing weight is "wrong way" rather than "too slow" —
 * the distinction matters, because the second is a nudge and the first is a
 * signal that something in the plan is not working.
 */
export function readWeight(rateKgPerWeek: number, trendKg: number, goal: WeightGoal): WeightReading {
  const pct = (rateKgPerWeek / trendKg) * 100
  const lbWeek = Math.abs(Math.round(kgToLb(rateKgPerWeek) * 10) / 10)
  const rate = `${lbWeek} lb a week`
  const moving = lbWeek === 0 ? 'Holding flat at' : rateKgPerWeek > 0 ? 'Gaining about' : 'Losing about'
  const make = (status: WeightStatus, sentence: string): WeightReading =>
    ({ status, tone: TONE[status], sentence })

  if (goal.direction === 'maintain') {
    if (Math.abs(pct) <= MAINTAIN_BAND_PCT + EPS) {
      return make('holding', 'Holding steady — inside your maintenance band.')
    }
    const way = rateKgPerWeek > 0 ? 'up' : 'down'
    return make('drifting', `Drifting ${way} about ${rate} — outside your maintenance band.`)
  }

  const label = paceLabel(goal).toLowerCase()
  const [lo, hi] = PACE_BANDS[goal.direction][goal.pace]
  // Positive means moving toward the goal, whichever way the goal points.
  const toward = goal.direction === 'gain' ? pct : -pct

  if (toward > hi + EPS) {
    const cost = goal.direction === 'gain'
      ? 'more of it is likely to be fat.'
      : 'strength may start to slip.'
    return make('too-fast', `${moving} ${rate} — faster than a ${label}; ${cost}`)
  }
  if (toward >= lo - EPS) {
    return make('on-pace', `${moving} ${rate} — inside your ${label} pace.`)
  }
  if (toward >= -MAINTAIN_BAND_PCT - EPS) {
    // "Short of", not "slower than": this band includes drifting slightly the
    // wrong way, where "slower" would describe a cut that is actually gaining.
    return make('too-slow', `${moving} ${rate} — short of your ${label} pace.`)
  }
  return make('wrong-way', `${moving} ${rate} — the opposite of your goal.`)
}

// ── Strength against bodyweight ──────────────────────────────────────────────

/** Six weeks: long enough for a lift to move, short enough to be recent. */
export const COMPARE_WINDOW_DAYS = 42

export interface StrengthRow {
  exerciseId: string
  name: string
  /** Estimated 1RM at the start and end of the window, in kilos. */
  fromKg: number
  toKg: number
  /** Estimated 1RM as a multiple of the trend bodyweight on that day. */
  fromRatio: number
  toRatio: number
}

export interface StrengthVsBodyweight {
  fromDate: string
  toDate: string
  /** Trend bodyweight change across the window, in kilos. */
  bodyweightChangeKg: number
  /** One row per lift with a session at both ends; lifts without are left out. */
  rows: StrengthRow[]
}

/**
 * Whether added bodyweight is arriving with added strength, per lift.
 *
 * The window is set by the weigh-ins, since there is nothing to compare
 * against without them. A lift's baseline is its last session on or before the
 * window opens — a lift trained the week before weighing began still has a fair
 * "before" — and its current figure is its latest session.
 *
 * Callers pass sessions already filtered to the active profile.
 */
export function strengthVsBodyweight(
  sessions: WorkoutDaySession[],
  liftIds: string[],
  trend: TrendPoint[]
): StrengthVsBodyweight | null {
  if (trend.length < 2) return null
  const toPt = trend[trend.length - 1]
  const endDay = dayNumber(toPt.date)
  const inWindow = trend.filter(p => endDay - dayNumber(p.date) <= COMPARE_WINDOW_DAYS)
  if (inWindow.length < 2) return null
  const fromPt = inWindow[0]

  /** Trend weight on a date: the latest point on or before it, else the first. */
  const trendAt = (date: string): number => {
    let kg = trend[0].trendKg
    for (const p of trend) {
      if (p.date > date) break
      kg = p.trendKg
    }
    return kg
  }

  const rows = liftIds.flatMap(id => {
    const points = e1rmSeries(sessions, id, toPt.trendKg).filter(p => p.date <= toPt.date)
    if (points.length < 2) return []

    const before = points.filter(p => p.date <= fromPt.date)
    const from = before.length > 0 ? before[before.length - 1] : points[0]
    const to = points[points.length - 1]
    if (from.date >= to.date) return []

    return [{
      exerciseId: id,
      name: exerciseNameFor(id),
      fromKg: from.e1rm,
      toKg: to.e1rm,
      fromRatio: from.e1rm / trendAt(from.date),
      toRatio: to.e1rm / trendAt(to.date),
    }]
  })

  return {
    fromDate: fromPt.date,
    toDate: toPt.date,
    bodyweightChangeKg: toPt.trendKg - fromPt.trendKg,
    rows,
  }
}
