import type { WorkoutDaySession } from '@/db/dexie'
import { trackingModeFor, exerciseNameFor } from '@/data/obzen-program'
import { e1rmSeries, realSets, setLoadKg, bestE1RM } from '@/lib/progress'
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
          (best, s) => (setLoadKg(id, s) > setLoadKg(id, best) ? s : best),
          sets[0]
        )
        const weightKg = setLoadKg(id, heaviest)
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

// ── Session load ─────────────────────────────────────────────────────────────

export interface SessionLoad {
  date: string
  /** RPE × reps performed. Zero when the session was never rated. */
  load: number
  reps: number
  rpe: number | null
}

/** Total reps actually performed across a session, all movements. */
function sessionReps(session: WorkoutDaySession): number {
  return session.exercises.reduce(
    (n, ex) => n + realSets(ex).reduce((r, s) => r + s.reps, 0),
    0
  )
}

/**
 * Session load, oldest first — the sRPE method: how hard it felt times how much
 * was done.
 *
 * An unrated session contributes no load rather than an assumed one. Guessing a
 * middle RPE would put invented numbers into the ratio below, which is the one
 * place in the app that turns a number into a recommendation.
 */
export function sessionLoads(sessions: WorkoutDaySession[]): SessionLoad[] {
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(s => {
      const reps = sessionReps(s)
      const rpe = typeof s.rpe === 'number' ? s.rpe : null
      return { date: s.date, reps, rpe, load: rpe === null ? 0 : rpe * reps }
    })
}

// ── Acute : chronic workload ─────────────────────────────────────────────────

/**
 * ⚠️ Reference bands, not independently verified. The 0.8–1.3 "sweet spot" and
 * the 1.5 upper bound come from the sports-science literature on acute:chronic
 * workload, which is itself contested — several later papers dispute the
 * method. Treat the reading as a prompt to look at your week, not a verdict.
 */
export const ACWR_BANDS = { low: 0.8, high: 1.3, spike: 1.5 } as const

export type AcwrVerdict = 'detraining' | 'steady' | 'elevated' | 'spike' | 'unknown'

export interface Acwr {
  /** Load over the last 7 days. */
  acute: number
  /** Average 7-day load over the last 28. */
  chronic: number
  ratio: number | null
  verdict: AcwrVerdict
  /** Rated sessions in the 28-day window — the ratio means little below a few. */
  ratedSessions: number
}

/**
 * Acute (7-day) load against chronic (28-day average) load.
 *
 * Returns `unknown` rather than a number when there is not enough rated
 * training behind it: a ratio built on one session is arithmetic, not a signal.
 */
export function acwr(loads: SessionLoad[], todayISODate: string, minRated = 3): Acwr {
  const today = Date.parse(`${todayISODate}T12:00:00`)
  const withinDays = (d: string, days: number) =>
    today - Date.parse(`${d}T12:00:00`) < days * 864e5 &&
    Date.parse(`${d}T12:00:00`) <= today

  const rated = loads.filter(l => l.rpe !== null)
  const acute = rated.filter(l => withinDays(l.date, 7)).reduce((n, l) => n + l.load, 0)
  const last28 = rated.filter(l => withinDays(l.date, 28))
  const chronic = last28.reduce((n, l) => n + l.load, 0) / 4

  if (last28.length < minRated || chronic === 0) {
    return { acute, chronic, ratio: null, verdict: 'unknown', ratedSessions: last28.length }
  }

  const ratio = acute / chronic
  const verdict: AcwrVerdict =
    ratio < ACWR_BANDS.low ? 'detraining'
    : ratio <= ACWR_BANDS.high ? 'steady'
    : ratio < ACWR_BANDS.spike ? 'elevated'
    : 'spike'

  return { acute, chronic, ratio, verdict, ratedSessions: last28.length }
}

// ── Deload ───────────────────────────────────────────────────────────────────

export interface DeloadAdvice {
  recommend: boolean
  /** Plain-language reasons, in the order they were found. */
  reasons: string[]
}

/**
 * Whether to suggest a lighter week, from the signals already computed.
 *
 * Deliberately conservative: one signal alone is noise, so two must agree
 * before this recommends anything. A stalled lift plus a load spike is a case;
 * either on its own is a week to watch.
 */
export function deloadAdvice(signals: LiftSignal[], load: Acwr): DeloadAdvice {
  const reasons: string[] = []

  const stalled = signals.filter(s => s.stall?.stalled)
  if (stalled.length > 0) {
    reasons.push(
      stalled.length === 1
        ? `${stalled[0].name} has not improved in ${Math.round(stalled[0].stall!.weeksSincePeak)} weeks`
        : `${stalled.length} lifts have stopped improving`
    )
  }

  if (load.verdict === 'spike') {
    reasons.push(`This week's load is ${load.ratio!.toFixed(1)}× your recent average`)
  } else if (load.verdict === 'elevated') {
    reasons.push(`This week's load is running above your recent average`)
  }

  const falling = signals.filter(s => s.trend && s.trend.slopeKgPerWeek < 0)
  if (falling.length >= 2) {
    reasons.push(`${falling.length} lifts are trending down`)
  }

  return { recommend: reasons.length >= 2, reasons }
}

// ── Adherence ────────────────────────────────────────────────────────────────

export type DayState = 'trained' | 'missed' | 'rest' | 'future'

export interface AdherenceDay {
  date: string
  /** 0 = Sunday, matching Date.getDay. */
  weekday: number
  state: DayState
}

export interface Adherence {
  /** Oldest week first; each row is Sunday-to-Saturday. */
  weeks: AdherenceDay[][]
  /** Planned training days that were trained, over the whole window. */
  trained: number
  planned: number
  /** Trained days that were not on the plan — credit, never a penalty. */
  extra: number
}

function dateOnly(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Planned against actual training, as a grid of weeks.
 *
 * A day is `missed` only when the plan called for training and none happened,
 * and only in the past — an upcoming scheduled day is `future`, not a failure.
 * Training on a rest day counts as `trained` and is reported separately as
 * `extra`: doing more than planned should never read as being off-plan.
 */
export function adherence(
  sessions: WorkoutDaySession[],
  isScheduledTraining: (date: Date) => boolean,
  todayISODate: string,
  weeksBack = 8
): Adherence {
  const trainedDates = new Set(sessions.map(s => s.date))
  const today = new Date(`${todayISODate}T12:00:00`)

  // Start on the Sunday `weeksBack - 1` weeks before this one.
  const start = new Date(today)
  start.setDate(start.getDate() - today.getDay() - (weeksBack - 1) * 7)

  const weeks: AdherenceDay[][] = []
  let trained = 0
  let planned = 0
  let extra = 0

  for (let w = 0; w < weeksBack; w++) {
    const row: AdherenceDay[] = []
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start)
      cur.setDate(start.getDate() + w * 7 + d)
      const iso = dateOnly(cur)
      const didTrain = trainedDates.has(iso)
      const scheduled = isScheduledTraining(cur)
      const isFuture = iso > todayISODate

      if (scheduled && !isFuture) planned += 1
      if (didTrain) trained += scheduled ? 1 : 0
      if (didTrain && !scheduled) extra += 1

      const state: DayState =
        didTrain ? 'trained'
        : isFuture ? 'future'
        : scheduled ? 'missed'
        : 'rest'

      row.push({ date: iso, weekday: cur.getDay(), state })
    }
    weeks.push(row)
  }

  return { weeks, trained, planned, extra }
}

// ── Lift balance ─────────────────────────────────────────────────────────────

/**
 * ⚠️ Reference ratios, not independently verified — and genuinely variable:
 * they shift with limb length, stance, and which lift someone has trained
 * hardest. Treat a lagging lift as a question worth asking, not a fault.
 *
 * Expressed against the squat, which is the usual anchor.
 */
export const LIFT_RATIOS: Record<string, number> = {
  'barbell-squat': 1,
  'bench-press': 0.75,
  'deadlift': 1.2,
}

export interface LiftBalance {
  exerciseId: string
  name: string
  e1rmKg: number
  /** Actual multiple of the squat. */
  ratio: number
  /** What the reference set expects. */
  expected: number
  /** Actual over expected — below 1 means behind the others. */
  index: number
}

export interface BalanceReport {
  lifts: LiftBalance[]
  /** The lift furthest behind, when one is meaningfully adrift. */
  lagging: LiftBalance | null
}

/** How far a lift is behind the reference before it is worth naming. */
export const LAGGING_THRESHOLD = 0.9

/**
 * Each competition lift against the reference ratios, anchored on the squat.
 *
 * Returns nothing useful until all three are logged — a ratio needs both terms,
 * and calling a lift "lagging" because it has never been recorded would be
 * wrong in a way the reader cannot see.
 */
export function liftBalance(
  bests: { exerciseId: string; name: string; e1rm: number }[]
): BalanceReport {
  const squat = bests.find(b => b.exerciseId === 'barbell-squat')
  if (!squat || squat.e1rm <= 0 || bests.some(b => b.e1rm <= 0)) {
    return { lifts: [], lagging: null }
  }

  const lifts = bests
    .filter(b => LIFT_RATIOS[b.exerciseId] !== undefined)
    .map(b => {
      const ratio = b.e1rm / squat.e1rm
      const expected = LIFT_RATIOS[b.exerciseId]
      return {
        exerciseId: b.exerciseId, name: b.name, e1rmKg: b.e1rm,
        ratio, expected, index: ratio / expected,
      }
    })

  if (lifts.length < 3) return { lifts, lagging: null }

  const worst = lifts.reduce((a, b) => (b.index < a.index ? b : a))
  return { lifts, lagging: worst.index < LAGGING_THRESHOLD ? worst : null }
}
