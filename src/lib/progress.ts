/**
 * Strength-progress calculations.
 *
 * Everything here is pure and computed on read from `workoutDaySessions` — no
 * derived data is stored. Callers are responsible for filtering sessions to the
 * active profile (see `belongsToProfile`).
 *
 * Two properties of the logged data drive most of the care taken below:
 *  - `LoggedSet.unit` is per-set, so sets in one exercise may mix lbs and kg.
 *    Everything is normalised to kg before any arithmetic.
 *  - The set logger persists placeholder rows (`weight: 0, reps: 0,
 *    timestamp: ''`). Those are not real sets and are filtered out everywhere.
 */

import type { WorkoutDaySession, ExerciseSessionState, LoggedSet } from '@/db/dexie'
import { trackingModeFor, bodyweightFactorFor, LIBRARY_BY_ID } from '@/data/obzen-program'
import type { TrackingMode } from '@/data/obzen-program'

const LB_PER_KG = 2.2046226218

export function toKg(weight: number, unit: LoggedSet['unit']): number {
  return unit === 'kg' ? weight : weight / LB_PER_KG
}

/** A set actually performed — placeholder rows from the logger are excluded. */
export function isRealSet(s: LoggedSet): boolean {
  return s.reps > 0 && s.timestamp !== ''
}

export function realSets(ex: ExerciseSessionState): LoggedSet[] {
  return ex.sets.filter(isRealSet)
}

// ── e1RM ─────────────────────────────────────────────────────────────────────

/**
 * Epley estimated 1-rep max, in kg. A single rep returns the weight itself.
 * `addedBodyweightKg` covers weighted bodyweight lifts, where the effective
 * load is bodyweight + added weight.
 */
export function epley1RM(weightKg: number, reps: number, addedBodyweightKg = 0): number {
  if (reps <= 0) return 0
  const load = weightKg + addedBodyweightKg
  return reps === 1 ? load : load * (1 + reps / 30)
}

/**
 * Best e1RM across an exercise's sets in one session.
 *
 * Note: the logged data has no warmup flag, so every real set is a candidate —
 * taking the max means warmups can never beat a true working set anyway.
 */
export function bestE1RM(ex: ExerciseSessionState, bodyweightKg = 0): number {
  const mode = trackingModeFor(ex.exerciseId)
  // Portion of bodyweight this movement actually moves — 0 for barbell/machine
  // work, ~1 for a pull-up, ~0.65 for a push-up.
  const bodyweightLoad = bodyweightKg * bodyweightFactorFor(ex.exerciseId)

  return realSets(ex).reduce((best, s) => {
    const logged = toKg(s.weight, s.unit)
    // Assistance is subtracted from the bodyweight being moved; every other
    // movement adds its external load on top.
    const load = mode === 'assisted'
      ? Math.max(0, bodyweightLoad - logged)
      : logged + bodyweightLoad
    const e1rm = epley1RM(load, s.reps)
    return e1rm > best ? e1rm : best
  }, 0)
}

export interface E1RMPoint {
  date: string
  e1rm: number
}

/** e1RM per session for one exercise, oldest first. Sessions without it are skipped. */
export function e1rmSeries(
  sessions: WorkoutDaySession[],
  exerciseId: string,
  bodyweightKg = 0
): E1RMPoint[] {
  return sessions
    .flatMap(session => {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId)
      if (!ex) return []
      const e1rm = bestE1RM(ex, bodyweightKg)
      return e1rm > 0 ? [{ date: session.date, e1rm }] : []
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Highest e1RM ever recorded for an exercise, or 0 when never logged. */
export function bestCurrentE1RM(
  sessions: WorkoutDaySession[],
  exerciseId: string,
  bodyweightKg = 0
): number {
  return e1rmSeries(sessions, exerciseId, bodyweightKg)
    .reduce((max, p) => (p.e1rm > max ? p.e1rm : max), 0)
}

export interface SbdTotal {
  /** Best e1RM per competition lift, keyed by exercise id. */
  lifts: { exerciseId: string; name: string; e1rm: number }[]
  /** Sum of the lifts that have data. */
  totalKg: number
  /** How many of the three lifts have been logged. */
  loggedCount: number
}

/** Squat + bench + deadlift total, from the lifts flagged `isCompetitionLift`. */
export function sbdTotal(sessions: WorkoutDaySession[], competitionLiftIds: string[]): SbdTotal {
  const lifts = competitionLiftIds.map(exerciseId => ({
    exerciseId,
    name: LIBRARY_BY_ID[exerciseId]?.name ?? exerciseId,
    e1rm: bestCurrentE1RM(sessions, exerciseId),
  }))
  return {
    lifts,
    totalKg: lifts.reduce((sum, l) => sum + l.e1rm, 0),
    loggedCount: lifts.filter(l => l.e1rm > 0).length,
  }
}

// ── Volume ───────────────────────────────────────────────────────────────────

/** ISO-8601 week key, e.g. '2026-W32'. Weeks start Monday. */
export function isoWeekKey(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00')
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - day + 3) // Thursday of this week decides the year
  const isoYear = d.getFullYear()
  const firstThursday = new Date(isoYear, 0, 4)
  const firstDay = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3)
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 864e5))
  return `${isoYear}-W${String(week).padStart(2, '0')}`
}

/** Tonnage for one exercise in one session: Σ(reps × weight) over real sets, kg. */
export function exerciseTonnage(ex: ExerciseSessionState): number {
  return realSets(ex).reduce((sum, s) => sum + toKg(s.weight, s.unit) * s.reps, 0)
}

export interface WeeklyVolume {
  week: string
  tonnageKg: number
  sets: number
}

/** Total tonnage and set count per ISO week, oldest first. */
export function weeklyVolume(sessions: WorkoutDaySession[]): WeeklyVolume[] {
  const byWeek = new Map<string, WeeklyVolume>()
  for (const session of sessions) {
    const week = isoWeekKey(session.date)
    const entry = byWeek.get(week) ?? { week, tonnageKg: 0, sets: 0 }
    for (const ex of session.exercises) {
      entry.tonnageKg += exerciseTonnage(ex)
      entry.sets += realSets(ex).length
    }
    byWeek.set(week, entry)
  }
  return [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week))
}

/** Tonnage per ISO week for a single exercise, oldest first. */
export function weeklyVolumeForExercise(
  sessions: WorkoutDaySession[],
  exerciseId: string
): WeeklyVolume[] {
  const relevant = sessions
    .map(s => ({ ...s, exercises: s.exercises.filter(e => e.exerciseId === exerciseId) }))
    .filter(s => s.exercises.length > 0)
  return weeklyVolume(relevant)
}

// ── Personal records ─────────────────────────────────────────────────────────

export interface RepPR {
  reps: number
  weightKg: number
  date: string
}

export interface ExercisePRs {
  exerciseId: string
  name: string
  /** Heaviest weight lifted at each rep count 1–12, when one exists. */
  byRep: RepPR[]
  /** All-time best e1RM and the session that set it. */
  bestE1RM?: { e1rm: number; date: string }
}

const MAX_PR_REPS = 12

/**
 * Best weight at each rep count 1–12 plus the all-time e1RM PR, for one exercise.
 *
 * Scoped to `load`-tracking exercises: "heaviest weight" as a personal record
 * only makes sense when a heavier logged weight means more resistance overcome.
 * For `assisted` movements the logged weight is assistance — less is progress,
 * so treating it as a weight PR would celebrate the wrong direction. For
 * `timed` movements the reps field holds seconds, not a rep count. Those
 * movements get their own directionally-correct cards (see `trackingSeries`);
 * this intentionally returns empty for them rather than showing a misleading PR.
 */
export function exercisePRs(
  sessions: WorkoutDaySession[],
  exerciseId: string,
  bodyweightKg = 0
): ExercisePRs {
  const name = LIBRARY_BY_ID[exerciseId]?.name ?? exerciseId
  if (trackingModeFor(exerciseId) !== 'load') {
    return { exerciseId, name, byRep: [], bestE1RM: undefined }
  }

  const byRep = new Map<number, RepPR>()
  let best: { e1rm: number; date: string } | undefined

  for (const session of sessions) {
    const ex = session.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) continue

    for (const s of realSets(ex)) {
      if (s.reps < 1 || s.reps > MAX_PR_REPS) continue
      const weightKg = toKg(s.weight, s.unit)
      const current = byRep.get(s.reps)
      if (!current || weightKg > current.weightKg) {
        byRep.set(s.reps, { reps: s.reps, weightKg, date: session.date })
      }
    }

    const e1rm = bestE1RM(ex, bodyweightKg)
    if (e1rm > 0 && (!best || e1rm > best.e1rm)) best = { e1rm, date: session.date }
  }

  return {
    exerciseId,
    name,
    byRep: [...byRep.values()].sort((a, b) => a.reps - b.reps),
    bestE1RM: best,
  }
}

export interface RecentPR {
  exerciseId: string
  name: string
  e1rm: number
  date: string
}

/** Every exercise's all-time e1RM PR, most recent first. */
export function recentPRs(sessions: WorkoutDaySession[], bodyweightKg = 0): RecentPR[] {
  const ids = new Set(sessions.flatMap(s => s.exercises.map(e => e.exerciseId)))
  return [...ids]
    .map(id => {
      const pr = exercisePRs(sessions, id, bodyweightKg)
      return pr.bestE1RM
        ? { exerciseId: id, name: pr.name, e1rm: pr.bestE1RM.e1rm, date: pr.bestE1RM.date }
        : null
    })
    .filter((x): x is RecentPR => x !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
}

// ── DOTS (bodyweight-adjusted total) ─────────────────────────────────────────

/**
 * DOTS coefficients (Dynamic Objective Team Scoring), the IPF's replacement for
 * Wilks. Score = total × 500 / (a·bw⁴ + b·bw³ + c·bw² + d·bw + e), bodyweight in kg.
 *
 * ⚠️ These constants and the strength-standard thresholds below are reference
 * values and have NOT been independently verified — treat every number they
 * produce as an estimate, which is why the UI labels it "(est.)". Worth a review
 * against an authoritative source before relying on them.
 */
const DOTS_COEFFICIENTS = {
  male:   { a: -0.0000010930, b: 0.0007391293, c: -0.1918759221, d: 24.0900756, e: -307.75076 },
  female: { a: -0.0000010706, b: 0.0005158568, c: -0.1126655495, d: 13.6175032, e: -57.96288 },
} as const

export function dotsScore(totalKg: number, bodyweightKg: number, sex: 'male' | 'female'): number {
  if (totalKg <= 0 || bodyweightKg <= 0) return 0
  const { a, b, c, d, e } = DOTS_COEFFICIENTS[sex]
  const bw = bodyweightKg
  const denominator = a * bw ** 4 + b * bw ** 3 + c * bw ** 2 + d * bw + e
  return denominator === 0 ? 0 : (totalKg * 500) / denominator
}

/**
 * Classic Wilks coefficients (pre-2020), predecessor to DOTS — still commonly
 * shown alongside it. Score = total × 500 / (a + b·bw + c·bw² + d·bw³ + e·bw⁴ + f·bw⁵),
 * bodyweight in kg.
 *
 * ⚠️ Same caveat as DOTS above: reference values, not independently verified —
 * the UI labels this "(est.)" and it should be checked against a source you
 * trust before being treated as authoritative.
 */
const WILKS_COEFFICIENTS = {
  male:   { a: -216.0475144,        b: 16.2606339,      c: -0.002388645,   d: -0.00113732,    e: 7.01863e-6,  f: -1.291e-8 },
  female: { a: 594.31747775582,     b: -27.23842536447, c: 0.82112226871,  d: -0.00930733913, e: 4.731582e-5, f: -9.054e-8 },
} as const

export function wilksScore(totalKg: number, bodyweightKg: number, sex: 'male' | 'female'): number {
  if (totalKg <= 0 || bodyweightKg <= 0) return 0
  const { a, b, c, d, e, f } = WILKS_COEFFICIENTS[sex]
  const bw = bodyweightKg
  const denominator = a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5
  return denominator === 0 ? 0 : (totalKg * 500) / denominator
}

// ── Strength standards ───────────────────────────────────────────────────────

export type StrengthBand = 'Untrained' | 'Novice' | 'Intermediate' | 'Advanced' | 'Elite'

const BANDS: StrengthBand[] = ['Untrained', 'Novice', 'Intermediate', 'Advanced', 'Elite']

/**
 * Strength standards as multiples of bodyweight, per lift and for the total.
 * Thresholds are the entry point for each band above Untrained.
 *
 * ⚠️ Reference values only — see the DOTS warning above. Should be reviewed
 * before being treated as authoritative.
 */
const STANDARDS: Record<string, Record<'male' | 'female', number[]>> = {
  //                        Novice, Intermediate, Advanced, Elite  (× bodyweight)
  'barbell-squat':  { male: [0.75, 1.25, 1.75, 2.25], female: [0.50, 0.90, 1.35, 1.80] },
  'bench-press':    { male: [0.50, 1.00, 1.50, 2.00], female: [0.25, 0.50, 0.85, 1.20] },
  'deadlift':       { male: [1.00, 1.50, 2.25, 2.75], female: [0.60, 1.10, 1.60, 2.10] },
  total:            { male: [2.25, 3.75, 5.50, 7.00], female: [1.35, 2.50, 3.80, 5.10] },
}

export interface StandardResult {
  band: StrengthBand
  /** Multiple of bodyweight currently lifted. */
  ratio: number
  /** kg still needed to reach the next band, or null at Elite. */
  toNextKg: number | null
  nextBand: StrengthBand | null
}

/** Current strength band for a lift (or 'total'), plus the gap to the next one. */
export function strengthStandard(
  key: string,
  liftKg: number,
  bodyweightKg: number,
  sex: 'male' | 'female'
): StandardResult | null {
  const thresholds = STANDARDS[key]?.[sex]
  if (!thresholds || bodyweightKg <= 0) return null

  const ratio = liftKg / bodyweightKg
  let bandIndex = 0
  for (let i = 0; i < thresholds.length; i++) {
    if (ratio >= thresholds[i]) bandIndex = i + 1
  }

  const nextThreshold = thresholds[bandIndex]
  return {
    band: BANDS[bandIndex],
    ratio,
    toNextKg: nextThreshold === undefined ? null : Math.max(0, nextThreshold * bodyweightKg - liftKg),
    nextBand: nextThreshold === undefined ? null : BANDS[bandIndex + 1],
  }
}

// ── Bodyweight-mode metrics ──────────────────────────────────────────────────

export interface TrackPoint {
  date: string
  value: number
}

/**
 * The series to chart for a movement, chosen by its tracking mode:
 *  - `assisted`        lowest assistance weight that session (down is progress)
 *  - `bodyweight-reps` most reps in a single set
 *  - `timed`           longest hold, taken from the reps field (seconds)
 *  - `load`            best e1RM
 */
export function trackingSeries(
  sessions: WorkoutDaySession[],
  exerciseId: string,
  mode: TrackingMode = trackingModeFor(exerciseId),
  bodyweightKg = 0
): TrackPoint[] {
  return sessions
    .flatMap(session => {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId)
      if (!ex) return []
      const sets = realSets(ex)
      if (sets.length === 0) return []

      let value: number
      switch (mode) {
        case 'assisted':
          value = Math.min(...sets.map(s => toKg(s.weight, s.unit)))
          break
        case 'bodyweight-reps':
          value = Math.max(...sets.map(s => s.reps))
          break
        case 'timed':
          value = Math.max(...sets.map(s => s.reps)) // reps field holds seconds
          break
        default:
          value = bestE1RM(ex, bodyweightKg)
      }
      return [{ date: session.date, value }]
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Total reps performed for a movement per ISO week (bodyweight-reps mode). */
export function weeklyRepVolume(sessions: WorkoutDaySession[], exerciseId: string): WeeklyVolume[] {
  const byWeek = new Map<string, WeeklyVolume>()
  for (const session of sessions) {
    const ex = session.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    const sets = realSets(ex)
    if (sets.length === 0) continue
    const week = isoWeekKey(session.date)
    const entry = byWeek.get(week) ?? { week, tonnageKg: 0, sets: 0 }
    entry.tonnageKg += sets.reduce((n, s) => n + s.reps, 0) // reps, not kg, in this mode
    entry.sets += sets.length
    byWeek.set(week, entry)
  }
  return [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week))
}

/** Change between the first and last point of a series. */
export function delta(points: TrackPoint[]): number {
  if (points.length < 2) return 0
  return points[points.length - 1].value - points[0].value
}
