/**
 * Stateless strength calculators for the Tools/Lab area: 1RM estimators, a
 * percentage reference table, and the 5/3/1 method (training max, the 3-week
 * wave, Joker sets, Boring But Big).
 *
 * Unlike `progress.ts` — which works in kg because it reads real logged sets
 * and DOTS/Wilks are internationally kg-calibrated — these calculators follow
 * 5/3/1's own convention (pounds, rounded to the nearest 5 lb) and take
 * manually-typed input. They do not read from or write to Dexie or any store;
 * every function here is pure.
 */

export function roundTo5(n: number): number {
  return Math.round(n / 5) * 5
}

// ── 1RM estimators ───────────────────────────────────────────────────────────

/** Epley: w × (1 + reps/30). A single rep returns the weight itself. */
export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  return reps === 1 ? weight : weight * (1 + reps / 30)
}

/**
 * Brzycki: w × 36 / (37 − reps). Undefined at 37+ reps (denominator hits 0 or
 * goes negative), so this returns 0 there rather than a nonsense number.
 */
export function brzycki1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0 || reps >= 37) return 0
  return reps === 1 ? weight : weight * (36 / (37 - reps))
}

export interface OneRMEstimate {
  epley: number
  brzycki: number
}

export function estimate1RM(weight: number, reps: number): OneRMEstimate {
  return { epley: epley1RM(weight, reps), brzycki: brzycki1RM(weight, reps) }
}

// ── Percentage table ─────────────────────────────────────────────────────────

export interface PercentRow {
  pct: number
  weight: number
}

export const STANDARD_PERCENTS = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50]

/** Rounded working weights at each percentage of an e1RM. */
export function percentageTable(e1rm: number, percents: number[] = STANDARD_PERCENTS): PercentRow[] {
  return percents.map(pct => ({ pct, weight: roundTo5((e1rm * pct) / 100) }))
}

// ── AMRAP ────────────────────────────────────────────────────────────────────

export interface AmrapResult {
  e1rm: OneRMEstimate
  /** How many more/fewer reps were done than the target, when one is given. */
  repsVsTarget?: number
}

/** Estimate 1RM from a top/AMRAP set, optionally compared against an expected rep count. */
export function amrapEstimate(weight: number, reps: number, expectedReps?: number): AmrapResult {
  const e1rm = estimate1RM(weight, reps)
  return expectedReps === undefined ? { e1rm } : { e1rm, repsVsTarget: reps - expectedReps }
}

// ── 5/3/1 ────────────────────────────────────────────────────────────────────

/** Training Max — 90% of e1RM, rounded to 5 lb. Everything else is a % of this. */
export function trainingMax(e1rm: number): number {
  return roundTo5(e1rm * 0.9)
}

export interface WaveSet {
  pct: number
  weight: number
  /** Prescribed reps, with a trailing '+' on the AMRAP set. */
  reps: string
  isAmrap: boolean
}

export type WaveWeek = 1 | 2 | 3 | 'deload'

interface Scheme { pct: number; reps: string; isAmrap: boolean }

const WAVE_SCHEME: Record<1 | 2 | 3, Scheme[]> = {
  1: [{ pct: 65, reps: '5', isAmrap: false }, { pct: 75, reps: '5', isAmrap: false }, { pct: 85, reps: '5', isAmrap: true }],
  2: [{ pct: 70, reps: '3', isAmrap: false }, { pct: 80, reps: '3', isAmrap: false }, { pct: 90, reps: '3', isAmrap: true }],
  3: [{ pct: 75, reps: '5', isAmrap: false }, { pct: 85, reps: '3', isAmrap: false }, { pct: 95, reps: '1', isAmrap: true }],
}

const DELOAD_SCHEME: Scheme[] = [
  { pct: 40, reps: '5', isAmrap: false }, { pct: 50, reps: '5', isAmrap: false }, { pct: 60, reps: '5', isAmrap: false },
]

/** The three working sets for a given week of the wave, off a Training Max. */
export function fiveThreeOneWave(tm: number, week: WaveWeek): WaveSet[] {
  const scheme = week === 'deload' ? DELOAD_SCHEME : WAVE_SCHEME[week]
  return scheme.map(s => ({
    pct: s.pct,
    weight: roundTo5((tm * s.pct) / 100),
    reps: s.isAmrap ? `${s.reps}+` : s.reps,
    isAmrap: s.isAmrap,
  }))
}

// ── Joker sets ───────────────────────────────────────────────────────────────

export interface JokerSet {
  /** Percentage added on top of the reference weight, e.g. 5 for +5%. */
  bump: number
  weight: number
}

/**
 * Optional heavier singles/doubles/triples above the top set — only worth
 * taking when the top set felt strong. `referenceWeight` is normally that
 * session's actual top-set weight (not always exactly a wave percentage).
 */
export function jokerSets(referenceWeight: number, bumps: number[] = [5, 10, 15]): JokerSet[] {
  return bumps.map(bump => ({ bump, weight: roundTo5(referenceWeight * (1 + bump / 100)) }))
}

// ── Boring But Big ───────────────────────────────────────────────────────────

export type BBBPercent = 50 | 60 | 70

export interface BBBResult {
  pct: BBBPercent
  weight: number
  sets: number
  reps: number
}

/** 5×10 Boring But Big set, off Training Max. */
export function bbbSet(tm: number, pct: BBBPercent = 50): BBBResult {
  return { pct, weight: roundTo5((tm * pct) / 100), sets: 5, reps: 10 }
}
