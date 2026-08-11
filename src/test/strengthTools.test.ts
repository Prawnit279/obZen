import { describe, it, expect } from 'vitest'
import {
  roundTo5, epley1RM, brzycki1RM, estimate1RM, percentageTable,
  amrapEstimate, trainingMax, fiveThreeOneWave, jokerSets, bbbSet,
} from '@/lib/strengthTools'
import { dotsScore, wilksScore } from '@/lib/progress'

describe('roundTo5', () => {
  it('rounds down when closer to the lower multiple', () => {
    expect(roundTo5(202)).toBe(200)
  })
  it('rounds up when closer to the higher multiple', () => {
    expect(roundTo5(203)).toBe(205)
  })
  it('rounds a halfway value up', () => {
    expect(roundTo5(202.5)).toBe(205)
  })
  it('leaves an exact multiple unchanged', () => {
    expect(roundTo5(225)).toBe(225)
  })
})

describe('1RM estimators', () => {
  it('epley returns the weight itself for a single', () => {
    expect(epley1RM(315, 1)).toBe(315)
  })
  it('epley applies the formula above one rep', () => {
    // 225 × (1 + 5/30) = 262.5
    expect(epley1RM(225, 5)).toBeCloseTo(262.5, 2)
  })
  it('brzycki returns the weight itself for a single', () => {
    expect(brzycki1RM(315, 1)).toBe(315)
  })
  it('brzycki applies the formula above one rep', () => {
    // 225 × 36/32 = 253.125
    expect(brzycki1RM(225, 5)).toBeCloseTo(253.125, 2)
  })
  it('brzycki is undefined at 37+ reps and returns 0', () => {
    expect(brzycki1RM(100, 37)).toBe(0)
  })
  it('both return 0 for non-positive weight or reps', () => {
    expect(epley1RM(0, 5)).toBe(0)
    expect(epley1RM(100, 0)).toBe(0)
    expect(brzycki1RM(100, 0)).toBe(0)
  })
  it('estimate1RM reports both side by side', () => {
    const est = estimate1RM(225, 5)
    expect(est.epley).toBeCloseTo(262.5, 2)
    expect(est.brzycki).toBeCloseTo(253.125, 2)
  })
})

describe('percentageTable', () => {
  it('produces one rounded row per requested percentage', () => {
    const table = percentageTable(300)
    expect(table).toHaveLength(10) // default STANDARD_PERCENTS
    expect(table[0]).toEqual({ pct: 95, weight: roundTo5(300 * 0.95) })
  })
  it('honours a custom percent list', () => {
    const table = percentageTable(200, [100, 50])
    expect(table).toEqual([{ pct: 100, weight: 200 }, { pct: 50, weight: 100 }])
  })
})

describe('amrapEstimate', () => {
  it('estimates 1RM without a target', () => {
    const result = amrapEstimate(225, 8)
    expect(result.e1rm.epley).toBeCloseTo(225 * (1 + 8 / 30), 2)
    expect(result.repsVsTarget).toBeUndefined()
  })
  it('reports the gap against an expected rep count', () => {
    expect(amrapEstimate(225, 8, 5).repsVsTarget).toBe(3)
    expect(amrapEstimate(225, 3, 5).repsVsTarget).toBe(-2)
  })
})

describe('trainingMax', () => {
  it('is 90% of e1RM, rounded to 5 lb', () => {
    expect(trainingMax(300)).toBe(270)
  })
  it('rounds the 90% result', () => {
    // 315 × 0.9 = 283.5 -> rounds to 285
    expect(trainingMax(315)).toBe(285)
  })
})

describe('fiveThreeOneWave', () => {
  // TM = 300 keeps every percentage an exact multiple of 5, isolating the
  // wave-scheme logic from rounding behaviour (covered separately above).
  const tm = 300

  it('week 1 is 65/75/85 for 5/5/5+, with the AMRAP flag only on the last set', () => {
    const week1 = fiveThreeOneWave(tm, 1)
    expect(week1).toEqual([
      { pct: 65, weight: 195, reps: '5', isAmrap: false },
      { pct: 75, weight: 225, reps: '5', isAmrap: false },
      { pct: 85, weight: 255, reps: '5+', isAmrap: true },
    ])
  })

  it('week 2 is 70/80/90 for 3/3/3+', () => {
    const week2 = fiveThreeOneWave(tm, 2)
    expect(week2.map(s => s.weight)).toEqual([210, 240, 270])
    expect(week2.map(s => s.reps)).toEqual(['3', '3', '3+'])
    expect(week2[2].isAmrap).toBe(true)
  })

  it('week 3 is 75/85/95 for 5/3/1+', () => {
    const week3 = fiveThreeOneWave(tm, 3)
    expect(week3.map(s => s.weight)).toEqual([225, 255, 285])
    expect(week3.map(s => s.reps)).toEqual(['5', '3', '1+'])
  })

  it('deload is 40/50/60 for 5/5/5 with no AMRAP set', () => {
    const deload = fiveThreeOneWave(tm, 'deload')
    expect(deload.map(s => s.weight)).toEqual([120, 150, 180])
    expect(deload.every(s => !s.isAmrap)).toBe(true)
  })

  it('rounds every set weight to the nearest 5 lb', () => {
    // TM = 270 produces non-exact percentages throughout.
    const week1 = fiveThreeOneWave(270, 1)
    for (const set of week1) {
      expect(set.weight % 5).toBe(0)
    }
  })
})

describe('jokerSets', () => {
  it('adds the default +5/+10/+15% bumps, rounded to 5 lb', () => {
    const jokers = jokerSets(255)
    expect(jokers).toEqual([
      { bump: 5, weight: roundTo5(255 * 1.05) },
      { bump: 10, weight: roundTo5(255 * 1.10) },
      { bump: 15, weight: roundTo5(255 * 1.15) },
    ])
  })
  it('accepts a custom bump list', () => {
    expect(jokerSets(200, [20])).toEqual([{ bump: 20, weight: 240 }])
  })
})

describe('bbbSet', () => {
  it('defaults to 50% for 5x10', () => {
    const bbb = bbbSet(270)
    expect(bbb).toEqual({ pct: 50, weight: 135, sets: 5, reps: 10 })
  })
  it('honours a different percentage', () => {
    expect(bbbSet(270, 60).weight).toBe(roundTo5(270 * 0.6))
    expect(bbbSet(270, 70).weight).toBe(roundTo5(270 * 0.7))
  })
})

// The Tools Wilks/DOTS panel reuses progress.ts's kg-based scores directly —
// this just confirms wilksScore behaves sanely alongside the existing dotsScore.
describe('wilksScore (shared with the Tools panel)', () => {
  it('produces a plausible score for a real total', () => {
    const score = wilksScore(500, 75, 'male')
    expect(score).toBeGreaterThan(200)
    expect(score).toBeLessThan(600)
  })
  it('scores a lighter lifter higher for the same total, like DOTS', () => {
    expect(wilksScore(400, 70, 'male')).toBeGreaterThan(wilksScore(400, 100, 'male'))
  })
  it('returns 0 without a total or bodyweight', () => {
    expect(wilksScore(0, 75, 'male')).toBe(0)
    expect(wilksScore(400, 0, 'male')).toBe(0)
  })
  it('and dotsScore broadly agree in direction for the same inputs', () => {
    const wilks = wilksScore(500, 75, 'male')
    const dots = dotsScore(500, 75, 'male')
    expect(Math.abs(wilks - dots)).toBeLessThan(100)
  })
})
