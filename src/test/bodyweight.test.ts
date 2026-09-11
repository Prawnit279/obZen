import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import {
  weightTrend, weeklyRateKg, readWeight, paceLabel, strengthVsBodyweight, parseWeighInLb,
  TREND_ALPHA_PER_DAY, PACE_BANDS, MAINTAIN_BAND_PCT, SEED_READINGS, SEED_WINDOW_DAYS,
  MIN_READINGS_FOR_RATE, RATE_WINDOW_DAYS, WEIGH_IN_LB,
} from '@/lib/bodyweight'
import type { WeighIn, WeightGoal } from '@/lib/bodyweight'
import { lbToKg, kgToLb } from '@/lib/progress'

// ── Fixtures ─────────────────────────────────────────────────────────────────

/** ISO date `n` days after 2026-08-01. */
function day(n: number): string {
  return new Date(Date.UTC(2026, 7, 1 + n)).toISOString().slice(0, 10)
}

/** A weigh-in every `step` days, following `kgAt(dayIndex)`. */
function series(days: number, step: number, kgAt: (d: number) => number): WeighIn[] {
  const out: WeighIn[] = []
  for (let d = 0; d <= days; d += step) out.push({ date: day(d), kg: kgAt(d) })
  return out
}

function set(weightLb: number, reps: number): LoggedSet {
  return { setNumber: 1, weight: weightLb, reps, unit: 'lbs', timestamp: '2026-08-01T10:00:00.000Z' }
}

function session(date: string, exerciseId: string, weightLb: number, reps = 1): WorkoutDaySession {
  return {
    date, dayLabel: 'Day 1', profileId: 'pronit',
    exercises: [{ exerciseId, status: 'complete', sets: [set(weightLb, reps)] }],
    order: [exerciseId],
  }
}

// ── weightTrend ──────────────────────────────────────────────────────────────

describe('weightTrend', () => {
  it('is empty for no weigh-ins', () => {
    expect(weightTrend([])).toEqual([])
  })

  it('starts the trend at the first reading', () => {
    expect(weightTrend([{ date: day(0), kg: 80 }])).toEqual([{ date: day(0), kg: 80, trendKg: 80 }])
  })

  it('moves a day’s share of the way toward each new reading', () => {
    // Three steady readings pin the opening at 80, so the fourth's pull is clean.
    const pts = weightTrend([...series(2, 1, () => 80), { date: day(3), kg: 82 }])
    expect(pts[3].trendKg).toBeCloseTo(80 + TREND_ALPHA_PER_DAY * 2, 6)
  })

  it('lets a reading after a gap pull harder, since the trend has had longer to go stale', () => {
    // Three days without weighing is three days of decay, not one.
    const pts = weightTrend([...series(2, 1, () => 80), { date: day(5), kg: 82 }])
    const alpha = 1 - (1 - TREND_ALPHA_PER_DAY) ** 3
    expect(pts[3].trendKg).toBeCloseTo(80 + alpha * 2, 6)
  })

  it('opens on the average of the first readings, not on one morning', () => {
    // A light first morning used to anchor the whole line low, so the trend
    // "climbed" partly out of nothing more than where it happened to start.
    const [first] = weightTrend([
      { date: day(0), kg: 79 }, { date: day(1), kg: 81 }, { date: day(2), kg: 80.5 }, { date: day(3), kg: 80.4 },
    ])
    expect(first.trendKg).toBeCloseTo((79 + 81 + 80.5) / SEED_READINGS, 6)
    expect(first.kg).toBe(79) // the dot still shows what the scale said
  })

  it('only averages the opening week, so a slow start cannot blur a real change', () => {
    // Readings a fortnight apart are different weights, not noise around one.
    const [first] = weightTrend([{ date: day(0), kg: 80 }, { date: day(SEED_WINDOW_DAYS + 7), kg: 84 }])
    expect(first.trendKg).toBe(80)
  })

  it('damps a single heavy morning instead of following it', () => {
    // The reason for a trend at all: one salty dinner is not a 2 kg gain.
    const pts = weightTrend([
      ...series(10, 1, () => 80),
      { date: day(11), kg: 82 },
    ])
    const last = pts[pts.length - 1]
    expect(last.kg).toBe(82)
    expect(last.trendKg).toBeLessThan(80.6)
  })

  it('holds a flat series flat', () => {
    expect(weightTrend(series(14, 1, () => 75)).every(p => p.trendKg === 75)).toBe(true)
  })

  it('sorts its input by date without changing it', () => {
    const input: WeighIn[] = [{ date: day(2), kg: 81 }, { date: day(0), kg: 80 }]
    const copy = input.map(e => ({ ...e }))
    const pts = weightTrend(input)

    expect(pts.map(p => p.date)).toEqual([day(0), day(2)])
    expect(input).toEqual(copy)
  })
})

// ── weeklyRateKg ─────────────────────────────────────────────────────────────

describe('weeklyRateKg', () => {
  it('says nothing below the minimum number of weigh-ins', () => {
    const few = series(21, 7, d => 80 - d * 0.05).slice(0, MIN_READINGS_FOR_RATE - 1)
    expect(weeklyRateKg(few)).toBeNull()
  })

  it('says nothing when the readings span too few days to mean a trend', () => {
    // Six readings over five days are six mornings, not a rate.
    expect(weeklyRateKg(series(5, 1, d => 80 + d * 0.1))).toBeNull()
  })

  it('recovers a steady loss exactly', () => {
    const losing = series(21, 1, d => 80 - (0.5 / 7) * d)
    expect(weeklyRateKg(losing)).toBeCloseTo(-0.5, 6)
  })

  it('recovers a steady gain through day-to-day noise', () => {
    const noise = [0.6, -0.4, 0.2, -0.7, 0.5, -0.1, 0.3]
    const gaining = series(27, 1, d => 80 + (0.3 / 7) * d + noise[d % noise.length])
    expect(weeklyRateKg(gaining)!).toBeCloseTo(0.3, 1)
  })

  it('only reads the most recent weeks', () => {
    // A big cut long ago, then flat: the rate is today's, not the history's.
    const old = series(30, 2, d => 90 - d * 0.3)
    // Flat for exactly one rate window, starting a month after the cut ended.
    const flatRecent = Array.from(
      { length: RATE_WINDOW_DAYS / 2 + 1 },
      (_, i) => ({ date: day(60 + i * 2), kg: 81 })
    )
    expect(weeklyRateKg([...old, ...flatRecent])).toBeCloseTo(0, 6)
  })
})

// ── readWeight ───────────────────────────────────────────────────────────────

describe('readWeight', () => {
  const at80 = (pctPerWeek: number) => (80 * pctPerWeek) / 100 // kg/week for 80 kg
  const leanGain: WeightGoal = { direction: 'gain', pace: 'gentle' }
  const steadyCut: WeightGoal = { direction: 'lose', pace: 'steady' }
  const maintain: WeightGoal = { direction: 'maintain' }

  it('calls a gain inside the lean band on pace', () => {
    const [lo, hi] = PACE_BANDS.gain.gentle
    const r = readWeight(at80((lo + hi) / 2), 80, leanGain)
    expect(r.status).toBe('on-pace')
    expect(r.tone).toBe('good')
  })

  it('counts the band edges as on pace', () => {
    const [lo, hi] = PACE_BANDS.gain.gentle
    expect(readWeight(at80(lo), 80, leanGain).status).toBe('on-pace')
    expect(readWeight(at80(hi), 80, leanGain).status).toBe('on-pace')
  })

  it('holds the edge even where floating point lands a hair short of it', () => {
    // At 57 kg an exact 0.25 % a week computes as 0.24999999999999997 %. At
    // 80 kg it happens to come out exact, which is why the case above alone
    // could not tell whether the comparison tolerates this.
    const steadyGain: WeightGoal = { direction: 'gain', pace: 'steady' }
    const [lo] = PACE_BANDS.gain.steady
    expect(((57 * lo / 100) / 57) * 100).toBeLessThan(lo)   // the premise
    expect(readWeight((57 * lo) / 100, 57, steadyGain).status).toBe('on-pace')
  })

  it('flags a gain faster than the chosen pace', () => {
    const r = readWeight(at80(PACE_BANDS.gain.gentle[1] + 0.2), 80, leanGain)
    expect(r.status).toBe('too-fast')
    expect(r.tone).toBe('caution')
  })

  it('flags a gain that has stalled below the pace', () => {
    expect(readWeight(at80(0.02), 80, leanGain).status).toBe('too-slow')
  })

  it('calls losing weight on a gain goal the wrong way, not merely slow', () => {
    const r = readWeight(at80(-0.6), 80, leanGain)
    expect(r.status).toBe('wrong-way')
    expect(r.tone).toBe('off')
  })

  it('mirrors all of that for a cut', () => {
    const [lo, hi] = PACE_BANDS.lose.steady
    expect(readWeight(at80(-(lo + hi) / 2), 80, steadyCut).status).toBe('on-pace')
    expect(readWeight(at80(-(hi + 0.5)), 80, steadyCut).status).toBe('too-fast')
    expect(readWeight(at80(-0.05), 80, steadyCut).status).toBe('too-slow')
    expect(readWeight(at80(0.6), 80, steadyCut).status).toBe('wrong-way')
  })

  it('reads maintenance as holding inside the band and drifting outside it', () => {
    expect(readWeight(at80(MAINTAIN_BAND_PCT / 2), 80, maintain).status).toBe('holding')
    expect(readWeight(at80(MAINTAIN_BAND_PCT * 2), 80, maintain).status).toBe('drifting')
    expect(readWeight(at80(-MAINTAIN_BAND_PCT * 2), 80, maintain).status).toBe('drifting')
  })

  it('says which way maintenance is drifting', () => {
    expect(readWeight(at80(0.8), 80, maintain).sentence).toMatch(/up/i)
    expect(readWeight(at80(-0.8), 80, maintain).sentence).toMatch(/down/i)
  })

  it('writes the rate in pounds a week', () => {
    // 0.25 kg/week is 0.55 lb/week; the app speaks pounds.
    const r = readWeight(0.25, 80, leanGain)
    expect(r.sentence).toContain(`${Math.round(kgToLb(0.25) * 10) / 10} lb a week`)
  })

  it('scales the bands with bodyweight rather than using fixed pounds', () => {
    // 0.4 kg/week is lean for a 200 kg lifter and fast for a 60 kg one.
    expect(readWeight(0.4, 200, leanGain).status).toBe('on-pace')
    expect(readWeight(0.4, 60, leanGain).status).toBe('too-fast')
  })
})

describe('paceLabel', () => {
  it('names each goal in the terms a lifter would use', () => {
    expect(paceLabel({ direction: 'gain', pace: 'gentle' })).toBe('Lean gain')
    expect(paceLabel({ direction: 'gain', pace: 'steady' })).toBe('Steady gain')
    expect(paceLabel({ direction: 'lose', pace: 'gentle' })).toBe('Gentle cut')
    expect(paceLabel({ direction: 'lose', pace: 'steady' })).toBe('Steady cut')
    expect(paceLabel({ direction: 'maintain' })).toBe('Maintain')
  })
})

// ── strengthVsBodyweight ─────────────────────────────────────────────────────

describe('strengthVsBodyweight', () => {
  const trend = weightTrend(series(35, 7, d => lbToKg(165 + d / 7)))  // +1 lb a week

  it('says nothing until there are two weigh-ins to compare', () => {
    expect(strengthVsBodyweight([], ['barbell-squat'], weightTrend([{ date: day(0), kg: 75 }]))).toBeNull()
  })

  it('reports the bodyweight change across the window from the trend', () => {
    const cmp = strengthVsBodyweight([], ['barbell-squat'], trend)!
    expect(cmp.fromDate).toBe(day(0))
    expect(cmp.toDate).toBe(day(35))
    expect(kgToLb(cmp.bodyweightChangeKg)).toBeGreaterThan(0)
  })

  it('compares a lift’s estimated max, then and now, against bodyweight', () => {
    const sessions = [
      session(day(0), 'deadlift', 300),   // + 45 lb bar = 345
      session(day(35), 'deadlift', 330),  // + 45 lb bar = 375
    ]
    const [row] = strengthVsBodyweight(sessions, ['deadlift'], trend)!.rows

    expect(row.exerciseId).toBe('deadlift')
    expect(kgToLb(row.toKg - row.fromKg)).toBeCloseTo(30, 0)
    expect(row.toRatio).toBeGreaterThan(row.fromRatio)
  })

  it('leaves out a lift with only one session in reach', () => {
    const sessions = [session(day(35), 'deadlift', 330)]
    expect(strengthVsBodyweight(sessions, ['deadlift'], trend)!.rows).toEqual([])
  })

  it('uses the last session before the window as the baseline', () => {
    // Trained in late July, weighed from August: July is the fair "before".
    const sessions = [
      session('2026-07-20', 'deadlift', 300),
      session(day(35), 'deadlift', 330),
    ]
    const [row] = strengthVsBodyweight(sessions, ['deadlift'], trend)!.rows
    expect(kgToLb(row.toKg - row.fromKg)).toBeCloseTo(30, 0)
  })

  it('keeps the lifts in the order they were asked for', () => {
    const sessions = [
      session(day(0), 'bench-press', 185), session(day(35), 'bench-press', 195),
      session(day(0), 'deadlift', 300),    session(day(35), 'deadlift', 330),
    ]
    const rows = strengthVsBodyweight(sessions, ['deadlift', 'bench-press'], trend)!.rows
    expect(rows.map(r => r.exerciseId)).toEqual(['deadlift', 'bench-press'])
  })
})

// ── parseWeighInLb ───────────────────────────────────────────────────────────

describe('parseWeighInLb', () => {
  it('reads a typed weight in pounds and returns kilos', () => {
    expect(parseWeighInLb('165')).toBeCloseTo(lbToKg(165), 6)
    expect(parseWeighInLb(' 165.4 ')).toBeCloseTo(lbToKg(165.4), 6)
  })

  it('refuses anything that is not a number', () => {
    for (const text of ['', '   ', 'abc', '16o', 'NaN']) expect(parseWeighInLb(text)).toBeNull()
  })

  it('refuses a slipped key rather than storing it', () => {
    // 1650 for 165 would drag the trend for a week.
    expect(parseWeighInLb('1650')).toBeNull()
    expect(parseWeighInLb('16.5')).toBeNull()
    expect(parseWeighInLb('0')).toBeNull()
    expect(parseWeighInLb('-165')).toBeNull()
  })

  it('accepts the ends of the plausible range', () => {
    expect(parseWeighInLb(String(WEIGH_IN_LB.min))).not.toBeNull()
    expect(parseWeighInLb(String(WEIGH_IN_LB.max))).not.toBeNull()
    expect(parseWeighInLb(String(WEIGH_IN_LB.max + 1))).toBeNull()
  })
})
