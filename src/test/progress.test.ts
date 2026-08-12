import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import {
  toKg, isRealSet, epley1RM, bestE1RM, e1rmSeries, bestCurrentE1RM, sbdTotal,
  isoWeekKey, exerciseTonnage, weeklyVolume, exercisePRs, recentPRs,
  dotsScore, strengthStandard, trackingSeries, weeklyRepVolume, delta,
} from '@/lib/progress'

// ── Fixtures ─────────────────────────────────────────────────────────────────

function set(weight: number, reps: number, unit: LoggedSet['unit'] = 'kg'): LoggedSet {
  return { setNumber: 1, weight, reps, unit, timestamp: '2026-08-01T10:00:00.000Z' }
}

/** A placeholder row exactly as SetLogger persists it before the user types. */
const placeholder: LoggedSet = { setNumber: 1, weight: 0, reps: 0, unit: 'lbs', timestamp: '' }

function session(date: string, exerciseId: string, sets: LoggedSet[]): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    exercises: [{ exerciseId, status: 'complete', sets }],
    order: [exerciseId],
  }
}

// ── Unit handling ────────────────────────────────────────────────────────────

describe('unit normalisation', () => {
  it('passes kg through unchanged', () => {
    expect(toKg(100, 'kg')).toBe(100)
  })
  it('converts lbs to kg', () => {
    expect(toKg(220.462, 'lbs')).toBeCloseTo(100, 2)
  })
  it('normalises sets that mix units within one exercise', () => {
    // 100 kg and 220.462 lbs are the same load — both should give the same e1RM.
    const mixed = session('2026-08-01', 'deadlift', [set(100, 1, 'kg'), set(220.462, 1, 'lbs')])
    const sets = mixed.exercises[0].sets
    expect(toKg(sets[0].weight, 'kg')).toBeCloseTo(toKg(sets[1].weight, 'lbs'), 2)
  })
})

describe('placeholder set filtering', () => {
  it('rejects the logger placeholder row', () => {
    expect(isRealSet(placeholder)).toBe(false)
  })
  it('accepts a real logged set', () => {
    expect(isRealSet(set(60, 5))).toBe(true)
  })
  it('keeps placeholders out of tonnage', () => {
    const ex = { exerciseId: 'deadlift', status: 'complete' as const, sets: [set(100, 5), placeholder] }
    expect(exerciseTonnage(ex)).toBe(500)
  })
  it('keeps placeholders out of e1RM', () => {
    const ex = { exerciseId: 'deadlift', status: 'complete' as const, sets: [placeholder] }
    expect(bestE1RM(ex)).toBe(0)
  })
})

// ── e1RM ─────────────────────────────────────────────────────────────────────

describe('epley1RM', () => {
  it('returns the weight itself for a single', () => {
    expect(epley1RM(100, 1)).toBe(100)
  })
  it('applies the Epley formula above one rep', () => {
    // 100 × (1 + 5/30) = 116.67
    expect(epley1RM(100, 5)).toBeCloseTo(116.667, 2)
  })
  it('returns 0 for no reps', () => {
    expect(epley1RM(100, 0)).toBe(0)
  })
  it('adds bodyweight for weighted bodyweight lifts', () => {
    // (75 + 25) × (1 + 5/30)
    expect(epley1RM(25, 5, 75)).toBeCloseTo(116.667, 2)
  })
})

describe('bestE1RM', () => {
  it('takes the best set, not the last', () => {
    const ex = {
      exerciseId: 'deadlift', status: 'complete' as const,
      sets: [set(100, 5), set(140, 1), set(60, 10)], // 116.7 / 140 / 80
    }
    expect(bestE1RM(ex)).toBeCloseTo(140, 2)
  })

  it('ignores bodyweight for pure external-load lifts', () => {
    const ex = { exerciseId: 'deadlift', status: 'complete' as const, sets: [set(140, 1)] }
    expect(bestE1RM(ex, 75)).toBeCloseTo(140, 2)
  })

  it('adds full bodyweight to a weighted pull-up', () => {
    // +20 kg on the belt at 75 kg bodyweight = 95 kg moved for a single.
    const ex = { exerciseId: 'weighted-pull-ups', status: 'complete' as const, sets: [set(20, 1)] }
    expect(bestE1RM(ex, 75)).toBeCloseTo(95, 2)
  })

  it('adds only the loaded fraction for a push-up variant', () => {
    // Push-ups move ~65% of bodyweight: 10 + (75 × 0.65) = 58.75.
    const ex = { exerciseId: 'weighted-push-ups', status: 'complete' as const, sets: [set(10, 1)] }
    expect(bestE1RM(ex, 75)).toBeCloseTo(58.75, 2)
  })

  it('subtracts assistance from bodyweight on assisted work', () => {
    // 30 kg of machine assistance at 75 kg bodyweight = 45 kg actually moved.
    const ex = { exerciseId: 'assisted-pull-up', status: 'complete' as const, sets: [set(30, 1)] }
    expect(bestE1RM(ex, 75)).toBeCloseTo(45, 2)
  })

  it('never goes negative when assistance exceeds bodyweight', () => {
    const ex = { exerciseId: 'assisted-pull-up', status: 'complete' as const, sets: [set(200, 1)] }
    expect(bestE1RM(ex, 75)).toBe(0)
  })

  it('scores a weighted pull-up above a bodyweight-only one', () => {
    const weighted = { exerciseId: 'weighted-pull-ups', status: 'complete' as const, sets: [set(25, 3)] }
    const bare = { exerciseId: 'weighted-pull-ups', status: 'complete' as const, sets: [set(0, 3)] }
    expect(bestE1RM(weighted, 75)).toBeGreaterThan(bestE1RM(bare, 75))
  })
})

describe('e1rmSeries + bestCurrentE1RM', () => {
  const sessions = [
    session('2026-08-05', 'deadlift', [set(120, 5)]),
    session('2026-08-01', 'deadlift', [set(100, 5)]),
    session('2026-08-03', 'barbell-squat', [set(90, 5)]),
  ]

  it('returns one point per session, oldest first', () => {
    const series = e1rmSeries(sessions, 'deadlift')
    expect(series.map(p => p.date)).toEqual(['2026-08-01', '2026-08-05'])
  })
  it('skips sessions that do not include the exercise', () => {
    expect(e1rmSeries(sessions, 'bench-press')).toHaveLength(0)
  })
  it('rolls up to the all-time best', () => {
    expect(bestCurrentE1RM(sessions, 'deadlift')).toBeCloseTo(140, 2)
  })
  it('returns 0 for a never-logged lift', () => {
    expect(bestCurrentE1RM(sessions, 'bench-press')).toBe(0)
  })
})

describe('sbdTotal', () => {
  const ids = ['barbell-squat', 'bench-press', 'deadlift']

  it('sums the lifts that have data and reports how many are logged', () => {
    const sessions = [
      session('2026-08-01', 'barbell-squat', [set(100, 1)]),
      session('2026-08-02', 'deadlift', [set(140, 1)]),
    ]
    const total = sbdTotal(sessions, ids)
    expect(total.totalKg).toBeCloseTo(240, 2)
    expect(total.loggedCount).toBe(2) // bench not yet logged
    expect(total.lifts).toHaveLength(3)
  })
  it('is zero with no data', () => {
    expect(sbdTotal([], ids).totalKg).toBe(0)
  })
})

// ── Volume ───────────────────────────────────────────────────────────────────

describe('isoWeekKey', () => {
  it('groups a Mon–Sun week under one key', () => {
    expect(isoWeekKey('2026-08-10')).toBe(isoWeekKey('2026-08-16')) // Mon..Sun
  })
  it('separates adjacent weeks', () => {
    expect(isoWeekKey('2026-08-16')).not.toBe(isoWeekKey('2026-08-17'))
  })
})

describe('weeklyVolume', () => {
  it('sums tonnage and sets per week', () => {
    const sessions = [
      session('2026-08-10', 'deadlift', [set(100, 5), set(100, 5)]), // 1000 kg, 2 sets
      session('2026-08-12', 'deadlift', [set(50, 10)]),              //  500 kg, 1 set
    ]
    const weeks = weeklyVolume(sessions)
    expect(weeks).toHaveLength(1)
    expect(weeks[0].tonnageKg).toBeCloseTo(1500, 2)
    expect(weeks[0].sets).toBe(3)
  })
  it('splits across ISO weeks, oldest first', () => {
    const weeks = weeklyVolume([
      session('2026-08-17', 'deadlift', [set(100, 1)]),
      session('2026-08-10', 'deadlift', [set(100, 1)]),
    ])
    expect(weeks).toHaveLength(2)
    expect(weeks[0].week < weeks[1].week).toBe(true)
  })

  it('omits untrained weeks entirely, so the last entry is not necessarily now', () => {
    // The "this week" stat must look the current week up by key rather than
    // taking the last entry — after a week off the last entry is stale.
    const weeks = weeklyVolume([session('2026-08-10', 'deadlift', [set(100, 5)])])
    const trainedWeek = isoWeekKey('2026-08-10')
    const weekOff = isoWeekKey('2026-08-24')

    expect(weeks).toHaveLength(1)
    expect(weeks[weeks.length - 1].week).toBe(trainedWeek)   // last entry = stale week
    expect(weeks.find(v => v.week === weekOff)).toBeUndefined() // lookup = correctly absent
  })
})

// ── PRs ──────────────────────────────────────────────────────────────────────

describe('exercisePRs', () => {
  const sessions = [
    session('2026-08-01', 'deadlift', [set(100, 5), set(120, 3)]),
    session('2026-08-08', 'deadlift', [set(110, 5), set(150, 1)]),
  ]

  it('keeps the heaviest weight at each rep count with its date', () => {
    const prs = exercisePRs(sessions, 'deadlift')
    const five = prs.byRep.find(p => p.reps === 5)
    expect(five?.weightKg).toBeCloseTo(110, 2)
    expect(five?.date).toBe('2026-08-08')
  })
  it('records the all-time e1RM PR and when it happened', () => {
    const prs = exercisePRs(sessions, 'deadlift')
    expect(prs.bestE1RM?.e1rm).toBeCloseTo(150, 2)
    expect(prs.bestE1RM?.date).toBe('2026-08-08')
  })
  it('ignores rep counts above 12', () => {
    const prs = exercisePRs([session('2026-08-01', 'deadlift', [set(40, 20)])], 'deadlift')
    expect(prs.byRep).toHaveLength(0)
  })
  it('resolves the display name from the library', () => {
    expect(exercisePRs(sessions, 'deadlift').name).toBe('Deadlift')
  })
  it('returns empty for an assisted movement — assistance weight is not a PR', () => {
    // 30 kg of assistance is worse than 20 kg, so treating the heavier number
    // as a "record" would celebrate the wrong direction.
    const prs = exercisePRs([session('2026-08-01', 'assisted-pull-up', [set(30, 6)])], 'assisted-pull-up')
    expect(prs.byRep).toHaveLength(0)
    expect(prs.bestE1RM).toBeUndefined()
  })
  it('returns empty for a timed movement — reps there means seconds, not a rep count', () => {
    const prs = exercisePRs([session('2026-08-01', 'hollow-body-hold', [set(0, 40)])], 'hollow-body-hold')
    expect(prs.byRep).toHaveLength(0)
    expect(prs.bestE1RM).toBeUndefined()
  })
})

describe('recentPRs', () => {
  it('lists one PR per exercise, most recent first', () => {
    const prs = recentPRs([
      session('2026-08-01', 'deadlift', [set(100, 1)]),
      session('2026-08-09', 'barbell-squat', [set(90, 1)]),
    ])
    expect(prs).toHaveLength(2)
    expect(prs[0].date).toBe('2026-08-09')
  })
  it('excludes assisted/timed movements from the PR list entirely', () => {
    const prs = recentPRs([
      session('2026-08-01', 'deadlift', [set(100, 1)]),
      session('2026-08-02', 'assisted-pull-up', [set(30, 6)]),
      session('2026-08-03', 'hollow-body-hold', [set(0, 40)]),
    ])
    expect(prs.map(p => p.exerciseId)).toEqual(['deadlift'])
  })
})

// ── DOTS + standards ─────────────────────────────────────────────────────────

describe('dotsScore', () => {
  it('produces a plausible score for a real total', () => {
    // 500 kg total at 75 kg bodyweight lands in a sane DOTS range.
    const score = dotsScore(500, 75, 'male')
    expect(score).toBeGreaterThan(200)
    expect(score).toBeLessThan(500)
  })
  it('scores a lighter lifter higher for the same total', () => {
    expect(dotsScore(400, 70, 'male')).toBeGreaterThan(dotsScore(400, 100, 'male'))
  })
  it('returns 0 without a total or bodyweight', () => {
    expect(dotsScore(0, 75, 'male')).toBe(0)
    expect(dotsScore(400, 0, 'male')).toBe(0)
  })
})

describe('strengthStandard', () => {
  it('bands a lift and reports the gap to the next one', () => {
    // 150 kg squat at 75 kg = 2.0× — Advanced (1.75), Elite at 2.25.
    const result = strengthStandard('barbell-squat', 150, 75, 'male')
    expect(result?.band).toBe('Advanced')
    expect(result?.nextBand).toBe('Elite')
    expect(result?.toNextKg).toBeCloseTo(2.25 * 75 - 150, 2)
  })
  it('caps out at Elite with no next band', () => {
    const result = strengthStandard('barbell-squat', 300, 75, 'male')
    expect(result?.band).toBe('Elite')
    expect(result?.toNextKg).toBeNull()
    expect(result?.nextBand).toBeNull()
  })
  it('returns Untrained below the first threshold', () => {
    expect(strengthStandard('barbell-squat', 10, 75, 'male')?.band).toBe('Untrained')
  })
  it('returns null for an unknown lift', () => {
    expect(strengthStandard('cable-crunch', 50, 75, 'male')).toBeNull()
  })
})

// ── Tracking modes ───────────────────────────────────────────────────────────

describe('trackingSeries', () => {
  it('assisted mode takes the lowest assistance that session', () => {
    const sessions = [session('2026-08-01', 'assisted-pull-up', [set(30, 6), set(25, 6)])]
    expect(trackingSeries(sessions, 'assisted-pull-up')[0].value).toBeCloseTo(25, 2)
  })
  it('bodyweight-reps mode takes the best set', () => {
    const sessions = [session('2026-08-01', 'push-up', [set(0, 12), set(0, 18)])]
    expect(trackingSeries(sessions, 'push-up', 'bodyweight-reps')[0].value).toBe(18)
  })
  it('timed mode reads seconds from the reps field', () => {
    const sessions = [session('2026-08-01', 'hollow-body-hold', [set(0, 25), set(0, 40)])]
    expect(trackingSeries(sessions, 'hollow-body-hold')[0].value).toBe(40)
  })
  it('load mode falls back to e1RM', () => {
    const sessions = [session('2026-08-01', 'deadlift', [set(100, 1)])]
    expect(trackingSeries(sessions, 'deadlift')[0].value).toBeCloseTo(100, 2)
  })
})

describe('weeklyRepVolume', () => {
  it('totals reps per week rather than tonnage', () => {
    const weeks = weeklyRepVolume([
      session('2026-08-10', 'push-up', [set(0, 20), set(0, 15)]),
    ], 'push-up')
    expect(weeks[0].tonnageKg).toBe(35)
    expect(weeks[0].sets).toBe(2)
  })
})

describe('delta', () => {
  it('reports the change from first to last point', () => {
    expect(delta([{ date: 'a', value: 30 }, { date: 'b', value: 20 }])).toBe(-10)
  })
  it('is 0 for a single point', () => {
    expect(delta([{ date: 'a', value: 30 }])).toBe(0)
  })
})
