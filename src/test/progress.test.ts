import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import {
  toKg, isRealSet, epley1RM, bestE1RM, e1rmSeries, bestCurrentE1RM, sbdTotal, recentPRs,
  isoWeekKey, exerciseTonnage, weeklyVolume, fillWeeks, exercisePRs,
  dotsScore, strengthStandard, trackingSeries, weeklyRepVolume, delta, suggestProgression, topOfRepRange, kgToLb, lbToKg,
} from '@/lib/progress'
import { COMPETITION_LIFT_IDS } from '@/data/obzen-program'
import { DEFAULT_BAR_LB } from '@/lib/barWeight'

/**
 * Sets are logged as plates, so every bar-loaded fixture below moves the number
 * in `set(...)` plus a bar. Deadlift and Barbell Squat are bar-loaded; push-ups,
 * hollow-body holds and machine work are not.
 */
const BAR = lbToKg(DEFAULT_BAR_LB)

/** Epley, for expectations that have to account for the bar under the reps. */
const e1rm = (loadKg: number, reps: number) => loadKg * (1 + reps / 30)

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
    expect(exerciseTonnage(ex)).toBeCloseTo((100 + BAR) * 5, 2)
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
      // With the bar: 140.5 / 160.4 / 107.2 — the heavy single still wins.
      sets: [set(100, 5), set(140, 1), set(60, 10)],
    }
    expect(bestE1RM(ex)).toBeCloseTo(140 + BAR, 2)
  })

  it('ignores bodyweight for pure external-load lifts', () => {
    const ex = { exerciseId: 'deadlift', status: 'complete' as const, sets: [set(140, 1)] }
    expect(bestE1RM(ex, 75)).toBeCloseTo(140 + BAR, 2)
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
    expect(bestCurrentE1RM(sessions, 'deadlift')).toBeCloseTo(e1rm(120 + BAR, 5), 2)
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
    expect(total.totalKg).toBeCloseTo(240 + 2 * BAR, 2) // a bar on each of the two
    expect(total.loggedCount).toBe(2) // bench not yet logged
    expect(total.lifts).toHaveLength(3)
  })
  it('is zero with no data', () => {
    expect(sbdTotal([], ids).totalKg).toBe(0)
  })
})

// ── Volume ───────────────────────────────────────────────────────────────────

describe('COMPETITION_LIFT_IDS — the total is defined by the flag', () => {
  it('is exactly squat, bench and deadlift', () => {
    expect(COMPETITION_LIFT_IDS).toEqual(['barbell-squat', 'bench-press', 'deadlift'])
  })

  it('every competition lift has a strength standard', () => {
    for (const id of COMPETITION_LIFT_IDS) {
      expect(strengthStandard(id, 150, 80, 'male'), id).not.toBeNull()
    }
  })

  it('is independent of a profile\'s charted key lifts', () => {
    // Regression: the SBD total used to follow keyLiftIds, so re-pointing a
    // profile's charts would silently change a figure still labelled "total".
    const sessions = [
      session('2026-08-10', 'barbell-squat', [set(150, 5)]),
      session('2026-08-10', 'bench-press', [set(100, 5)]),
      session('2026-08-10', 'deadlift', [set(200, 5)]),
      session('2026-08-11', 'goblet-squat', [set(40, 10)]),
    ]
    const fromFlag = sbdTotal(sessions, COMPETITION_LIFT_IDS)
    expect(fromFlag.loggedCount).toBe(3)
    expect(fromFlag.totalKg).toBeCloseTo(
      sbdTotal(sessions, ['barbell-squat', 'bench-press', 'deadlift']).totalKg, 2
    )
    // A different charted lift set would have produced a different "total".
    expect(sbdTotal(sessions, ['goblet-squat', 'bench-press', 'deadlift']).totalKg)
      .not.toBeCloseTo(fromFlag.totalKg, 2)
  })
})

describe('isoWeekKey', () => {
  it('groups a Mon–Sun week under one key', () => {
    expect(isoWeekKey('2026-08-10')).toBe(isoWeekKey('2026-08-16')) // Mon..Sun
  })
  it('separates adjacent weeks', () => {
    expect(isoWeekKey('2026-08-16')).not.toBe(isoWeekKey('2026-08-17'))
  })
})

describe('exerciseTonnage — scores the load actually moved', () => {
  const BW = 70

  it('counts a barbell lift as weight × reps', () => {
    const ex = session('2026-08-10', 'deadlift', [set(100, 5), set(100, 5)]).exercises[0]
    expect(exerciseTonnage(ex, BW)).toBeCloseTo((100 + BAR) * 10, 2)
  })

  it('subtracts assistance instead of adding it', () => {
    // Regression: assistance used to be counted as load, so *more* help scored
    // as more work and an unassisted rep scored as none at all.
    const heavy = session('2026-08-10', 'assisted-pull-up', [set(30, 6)]).exercises[0]
    const light = session('2026-08-10', 'assisted-pull-up', [set(10, 6)]).exercises[0]
    const none  = session('2026-08-10', 'assisted-pull-up', [set(0, 6)]).exercises[0]

    expect(exerciseTonnage(heavy, BW)).toBeCloseTo((70 - 30) * 6, 2)
    expect(exerciseTonnage(light, BW)).toBeCloseTo((70 - 10) * 6, 2)
    expect(exerciseTonnage(none, BW)).toBeCloseTo(70 * 6, 2)

    // Less assistance is now strictly more work, all the way to unassisted.
    expect(exerciseTonnage(light, BW)).toBeGreaterThan(exerciseTonnage(heavy, BW))
    expect(exerciseTonnage(none, BW)).toBeGreaterThan(exerciseTonnage(light, BW))
  })

  it('never goes negative when assistance exceeds bodyweight', () => {
    const ex = session('2026-08-10', 'assisted-pull-up', [set(200, 5)]).exercises[0]
    expect(exerciseTonnage(ex, BW)).toBe(0)
  })

  it('counts the bodyweight a push-up actually moves', () => {
    const ex = session('2026-08-10', 'push-up', [set(0, 20)]).exercises[0]
    // Push-ups load ~0.65 of bodyweight; they used to score zero.
    expect(exerciseTonnage(ex, BW)).toBeCloseTo(70 * 0.65 * 20, 2)
  })

  it('gives a timed hold no tonnage, because the count is seconds', () => {
    const ex = session('2026-08-10', 'plank', [set(0, 60)]).exercises[0]
    expect(exerciseTonnage(ex, BW)).toBe(0)
  })

  it('leaves barbell work unchanged when no bodyweight is known', () => {
    const ex = session('2026-08-10', 'deadlift', [set(100, 5)]).exercises[0]
    expect(exerciseTonnage(ex)).toBeCloseTo(exerciseTonnage(ex, BW), 2)
  })
})

describe('weeklyVolume', () => {
  it('sums tonnage and sets per week', () => {
    const sessions = [
      session('2026-08-10', 'deadlift', [set(100, 5), set(100, 5)]), // 2 sets
      session('2026-08-12', 'deadlift', [set(50, 10)]),              // 1 set
    ]
    const weeks = weeklyVolume(sessions)
    expect(weeks).toHaveLength(1)
    expect(weeks[0].tonnageKg).toBeCloseTo((100 + BAR) * 10 + (50 + BAR) * 10, 2)
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

  it('scores a week of assisted work on the load moved, not the assistance', () => {
    const weeks = weeklyVolume([session('2026-08-10', 'assisted-pull-up', [set(30, 6)])], 70)
    expect(weeks[0].tonnageKg).toBeCloseTo((70 - 30) * 6, 2)
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

describe('fillWeeks — a layoff reads as a gap, not as training', () => {
  it('pads untrained weeks with zeros', () => {
    const volume = weeklyVolume([
      session('2026-08-10', 'deadlift', [set(100, 5)]),
      session('2026-08-31', 'deadlift', [set(100, 5)]),
    ])
    // Sparse: two trained weeks, three weeks apart.
    expect(volume).toHaveLength(2)

    const filled = fillWeeks(volume, '2026-08-31', 4)
    expect(filled).toHaveLength(4)
    const week = (100 + BAR) * 5
    filled.map(v => v.tonnageKg).forEach((t, i) =>
      expect(t).toBeCloseTo(i === 0 || i === 3 ? week : 0, 2))
    expect(filled[0].week).toBe(isoWeekKey('2026-08-10'))
    expect(filled[3].week).toBe(isoWeekKey('2026-08-31'))
  })

  it('runs oldest to newest and ends on the given week', () => {
    const filled = fillWeeks([], '2026-08-31', 3)
    expect(filled.map(v => v.week)).toEqual([
      isoWeekKey('2026-08-17'), isoWeekKey('2026-08-24'), isoWeekKey('2026-08-31'),
    ])
    expect(filled.every(v => v.tonnageKg === 0 && v.sets === 0)).toBe(true)
  })

  it('spans a year boundary without duplicating a week', () => {
    const filled = fillWeeks([], '2027-01-10', 6)
    expect(new Set(filled.map(v => v.week)).size).toBe(6)
  })
})

describe('exercisePRs', () => {
  const sessions = [
    session('2026-08-01', 'deadlift', [set(100, 5), set(120, 3)]),
    session('2026-08-08', 'deadlift', [set(110, 5), set(150, 1)]),
  ]

  it('keeps the heaviest weight at each rep count with its date', () => {
    const prs = exercisePRs(sessions, 'deadlift')
    const five = prs.byRep.find(p => p.reps === 5)
    expect(five?.weightKg).toBeCloseTo(110 + BAR, 2)
    expect(five?.date).toBe('2026-08-08')
  })
  it('records the all-time e1RM PR and when it happened', () => {
    const prs = exercisePRs(sessions, 'deadlift')
    expect(prs.bestE1RM?.e1rm).toBeCloseTo(150 + BAR, 2)
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

describe('strengthStandard — eliteRatio tops each lift\'s own scale', () => {
  const BW = 80

  it('reports the Elite threshold for the lift, not a shared number', () => {
    expect(strengthStandard('bench-press', 100, BW, 'male')!.eliteRatio).toBeCloseTo(2.0, 5)
    expect(strengthStandard('deadlift', 100, BW, 'male')!.eliteRatio).toBeCloseTo(2.75, 5)
    expect(strengthStandard('total', 300, BW, 'male')!.eliteRatio).toBeCloseTo(7.0, 5)
  })

  it('puts every lift at a full bar exactly at Elite', () => {
    // Regression: one shared 2.75 divisor showed an Elite bench at 73% and a
    // Novice total at 100%.
    for (const key of ['barbell-squat', 'bench-press', 'deadlift', 'total']) {
      const atElite = strengthStandard(key, 1, BW, 'male')!.eliteRatio * BW
      const std = strengthStandard(key, atElite, BW, 'male')!
      expect(std.band, key).toBe('Elite')
      expect(std.ratio / std.eliteRatio, key).toBeCloseTo(1, 5)
    }
  })

  it('leaves a novice total well short of a full bar', () => {
    const std = strengthStandard('total', 2.75 * BW, BW, 'male')!
    expect(std.band).toBe('Novice')
    expect(std.ratio / std.eliteRatio).toBeLessThan(0.5)
  })
})

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
    expect(trackingSeries(sessions, 'deadlift')[0].value).toBeCloseTo(100 + BAR, 2)
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

describe('recentPRs — reports the weight actually lifted', () => {
  it('uses the heaviest real set, not the inflated e1RM', () => {
    // 90 kg x 12 gives an Epley e1RM of 126 — showing that as a "personal
    // record" would claim a lift that never happened.
    const sessions = [session('2026-08-10', 'hip-thrust-machine', [set(90, 12)])]
    const [pr] = recentPRs(sessions)

    expect(pr.weightKg).toBe(90)
    expect(pr.reps).toBe(12)
    expect(pr.e1rm).toBeCloseTo(126, 1) // still available, clearly secondary
  })

  it('prefers the heaviest set over one with more reps', () => {
    const sessions = [
      session('2026-08-10', 'hip-thrust-machine', [set(60, 15), set(100, 5)]),
    ]
    const [pr] = recentPRs(sessions)
    expect(pr.weightKg).toBe(100)
    expect(pr.reps).toBe(5)
  })

  it('dates the PR to the session where the heaviest set happened', () => {
    const sessions = [
      session('2026-08-01', 'hip-thrust-machine', [set(100, 5)]),
      session('2026-08-10', 'hip-thrust-machine', [set(80, 5)]),
    ]
    const [pr] = recentPRs(sessions)
    expect(pr.weightKg).toBe(100)
    expect(pr.date).toBe('2026-08-01')
  })
})

describe('suggestProgression — her plan\'s add-load rule', () => {
  const at = (date: string, sets: LoggedSet[]) => session(date, 'hip-thrust-machine', sets)

  it('suggests more load after two sessions at the top of the range', () => {
    const sessions = [at('2026-08-05', [set(40, 12), set(40, 12)]), at('2026-08-08', [set(40, 12), set(40, 12)])]
    const s = suggestProgression(sessions, 'hip-thrust-machine', '10–12', 'legs')
    expect(s).toBeDefined()
    expect(s!.currentKg).toBe(40)
    expect(kgToLb(s!.nextKg - s!.currentKg)).toBeCloseTo(5, 1) // +5 lb, lower body
  })

  it('stays silent after only one qualifying session', () => {
    const sessions = [at('2026-08-08', [set(40, 12)])]
    expect(suggestProgression(sessions, 'hip-thrust-machine', '10–12', 'legs')).toBeUndefined()
  })

  it('stays silent when a set fell short of the range', () => {
    const sessions = [at('2026-08-05', [set(40, 12), set(40, 10)]), at('2026-08-08', [set(40, 12), set(40, 12)])]
    expect(suggestProgression(sessions, 'hip-thrust-machine', '10–12', 'legs')).toBeUndefined()
  })

  it('uses the smaller jump for upper body', () => {
    const sessions = [at('2026-08-05', [set(20, 10)]), at('2026-08-08', [set(20, 10)])]
    const s = suggestProgression(sessions, 'hip-thrust-machine', '10', 'shoulders')
    expect(kgToLb(s!.nextKg - s!.currentKg)).toBeCloseTo(2.5, 1)
  })

  it('does not apply to timed holds', () => {
    expect(topOfRepRange('20–30s')).toBeUndefined()
  })

  it('reads the top of a range correctly', () => {
    expect(topOfRepRange('10–12')).toBe(12)
    expect(topOfRepRange('8/leg')).toBe(8)
    expect(topOfRepRange('5')).toBe(5)
  })
})
