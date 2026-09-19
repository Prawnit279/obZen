/**
 * Turning a block into this week's sets.
 *
 * The rule throughout: nothing is invented. A programme whose numbers were
 * never supplied says so; a lift with no training max is absent rather than
 * given a guessed one; and the percentages come from `strengthTools`, which has
 * its own tests, rather than being restated here.
 */
import { describe, it, expect } from 'vitest'
import { weekPrescription, blockProgress, amrapHistory } from '@/lib/block'
import type { WeekPrescription } from '@/lib/block'
import type { ActiveBlock } from '@/store/useBlockStore'
import { fiveThreeOneWave, bbbSet } from '@/lib/strengthTools'
import { programById } from '@/data/programs'

const START = '2026-09-07'          // a Monday
const wk = (n: number) => {
  const d = new Date(Date.UTC(2026, 8, 7 + (n - 1) * 7))
  return d.toISOString().slice(0, 10)
}

function block(over: Partial<ActiveBlock> = {}): ActiveBlock {
  return {
    programId: 'five-three-one',
    templateId: null,
    startedOn: START,
    trainingMaxLb: { 'barbell-squat': 315, 'bench-press': 225 },
    ...over,
  }
}

/**
 * Narrows to a week that actually prescribes.
 *
 * The union exists so "has a reason" and "has lifts" cannot both be true, and
 * a cast here would walk straight past the thing it is protecting — so this
 * asserts the discriminant before narrowing.
 */
function ready(p: WeekPrescription | null) {
  expect(p?.status).toBe('ready')
  return p as Extract<WeekPrescription, { status: 'ready' }>
}

/** The mirror of `ready`, for a week that cannot prescribe. */
function unavailable(p: WeekPrescription | null) {
  expect(p?.status).toBe('unavailable')
  return p as Extract<WeekPrescription, { status: 'unavailable' }>
}

// ── Where in the cycle ───────────────────────────────────────────────────────

describe('the week it reports', () => {
  it('counts weeks and cycles from the start', () => {
    expect(weekPrescription(block(), wk(1))).toMatchObject({ week: 1, cycle: 1 })
    expect(weekPrescription(block(), wk(3))).toMatchObject({ week: 3, cycle: 1 })
    expect(weekPrescription(block(), wk(5))).toMatchObject({ week: 1, cycle: 2 })
  })

  it('marks the deload week', () => {
    expect(weekPrescription(block(), wk(4))?.isDeload).toBe(true)
    expect(weekPrescription(block(), wk(3))?.isDeload).toBe(false)
  })

  it('reports nothing before the block began', () => {
    expect(weekPrescription(block(), '2026-09-01')).toBeNull()
  })

  it('reports nothing for a programme this build does not have', () => {
    expect(weekPrescription(block({ programId: 'gone' }), wk(1))).toBeNull()
  })
})

// ── The sets themselves ──────────────────────────────────────────────────────

describe('what it prescribes', () => {
  it('gives each lift the wave for that week, off its own training max', () => {
    const p = ready(weekPrescription(block(), wk(1)))
    const squat = p.lifts.find(l => l.exerciseId === 'barbell-squat')!
    // Deferred to strengthTools rather than restated — if the wave changes
    // there, this follows rather than disagreeing.
    expect(squat.sets).toEqual(fiveThreeOneWave(315, 1))
    expect(squat.trainingMaxLb).toBe(315)
  })

  it('changes the wave as the weeks pass', () => {
    const week1 = ready(weekPrescription(block(), wk(1))).lifts[0].sets
    const week3 = ready(weekPrescription(block(), wk(3))).lifts[0].sets
    expect(week1).not.toEqual(week3)
    expect(week3[week3.length - 1].reps).toMatch(/1\+?/)
  })

  it('drops to the deload wave in week four', () => {
    const p = ready(weekPrescription(block(), wk(4)))
    expect(p.lifts[0].sets).toEqual(fiveThreeOneWave(315, 'deload'))
    expect(p.lifts[0].sets.every(s => !s.isAmrap)).toBe(true)
  })

  it('leaves out a lift with no training max rather than guessing one', () => {
    const p = ready(weekPrescription(block({ trainingMaxLb: { 'barbell-squat': 315, deadlift: 0 } }), wk(1)))
    expect(p.lifts.map(l => l.exerciseId)).toEqual(['barbell-squat'])
  })

  it('prescribes nothing at all when no training max is set', () => {
    // The block is fine; it just has no maxes — so this is a `ready` week with
    // an empty list, not an unavailable one. The union keeps those apart.
    const p = ready(weekPrescription(block({ trainingMaxLb: {} }), wk(1)))
    expect(p.lifts).toEqual([])
  })
})

// ── Supplemental work ────────────────────────────────────────────────────────

describe('supplemental volume', () => {
  it('is absent on the programme that carries none', () => {
    expect(ready(weekPrescription(block(), wk(1))).supplemental).toBeNull()
  })

  it('is five sets of ten on the one that does', () => {
    const p = ready(weekPrescription(block({ programId: 'bbb' }), wk(1)))
    expect(p.supplemental).toHaveLength(2)
    const squat = p.supplemental!.find(s => /squat/i.test(s.label))!
    expect(squat).toMatchObject({ sets: 5, reps: 10, weightLb: bbbSet(315, 50).weight })
  })

  it('is dropped in the deload week', () => {
    // A deload carrying five sets of ten is not a deload.
    expect(ready(weekPrescription(block({ programId: 'bbb' }), wk(4))).supplemental).toBeNull()
  })
})

// ── Programmes that cannot prescribe ─────────────────────────────────────────

describe('a programme whose numbers were never supplied', () => {
  it('says what it is waiting for, not merely that it cannot', () => {
    const p = unavailable(weekPrescription(block({ programId: 'tactical-barbell', templateId: 'operator' }), wk(1)))
    // No `lifts` to assert empty any more — the type does not carry them on
    // this branch at all, which is the point of the union.
    //
    // The specific message matters. "No prescription encoded" is true of any
    // programme without a wave; this one has to name the numbers it wants, or
    // there is nothing to act on.
    expect(p.reason).toMatch(/set counts|percentages|blocks/i)
    expect(p.reason).toBe(programById('tactical-barbell')!.needs)
  })

  it('still reports where in the cycle you are', () => {
    // The block is real even when the prescription is not.
    const p = weekPrescription(block({ programId: 'tactical-barbell', templateId: 'operator' }), wk(2))!
    expect(p.week).toBe(2)
    expect(p.template?.name).toBe('Operator')
  })
})

// ── Progress through the block ───────────────────────────────────────────────

describe('blockProgress', () => {
  it('runs from a quarter to the whole across a four-week cycle', () => {
    expect(blockProgress(block(), wk(1))).toBeCloseTo(0.25, 5)
    expect(blockProgress(block(), wk(4))).toBeCloseTo(1, 5)
  })

  it('starts over with the next cycle', () => {
    expect(blockProgress(block(), wk(5))).toBeCloseTo(0.25, 5)
  })

  it('reports nothing before the block began', () => {
    expect(blockProgress(block(), '2026-09-01')).toBeNull()
  })
})

// ── Top sets against what was asked for ──────────────────────────────────────

describe('amrapHistory', () => {
  /** A session holding one lift's sets, weights in pounds as they are logged. */
  function session(date: string, exerciseId: string, sets: [number, number][]) {
    return {
      date,
      dayLabel: 'Day 1' as const,
      profileId: 'pronit',
      order: [exerciseId],
      exercises: [{
        exerciseId,
        status: 'complete' as const,
        // The last set carries the AMRAP flag, as the logger's toggle sets it.
        sets: sets.map(([weight, reps], i) => ({
          setNumber: i + 1, weight, reps,
          unit: 'lbs' as const, timestamp: `${date}T10:0${i}:00.000Z`,
          isAmrap: i === sets.length - 1,
        })),
      }],
    }
  }

  /** Week one off a 315 training max: 205, 235, 270 — the last one an AMRAP. */
  const weekOne = (date: string, topReps: number) =>
    session(date, 'barbell-squat', [[160, 5], [190, 5], [225, topReps]])

  it('reads the set the lifter flagged as the top set', () => {
    const [attempt] = amrapHistory(block(), [weekOne(wk(1), 8)], 'barbell-squat')
    expect(attempt.reps).toBe(8)
    // 225 logged as plates, plus the 45 lb bar.
    expect(attempt.weightLb).toBeCloseTo(270, 0)
  })

  it('ignores a session where nothing was flagged, heavy or not', () => {
    // The rule `lib/amrap.ts` already applies: five reps at the prescribed
    // weight is either the five it asked for or five and no more, and an
    // unflagged set cannot say which. A missing row asks for the flag; a
    // guessed one would quietly become evidence.
    const unflagged = {
      ...weekOne(wk(1), 8),
      exercises: [{
        exerciseId: 'barbell-squat',
        status: 'complete' as const,
        sets: [{
          setNumber: 1, weight: 225, reps: 8,
          unit: 'lbs' as const, timestamp: `${wk(1)}T10:00:00.000Z`,
        }],
      }],
    }
    expect(amrapHistory(block(), [unflagged], 'barbell-squat')).toEqual([])
  })

  it('takes the heaviest flagged set when a day has more than one', () => {
    const twice = session(wk(1), 'barbell-squat', [[225, 8], [245, 3]])
    // Both flagged by the fixture would be wrong — only the last is. Flag both
    // explicitly to pin which one wins.
    twice.exercises[0].sets = twice.exercises[0].sets.map(s => ({ ...s, isAmrap: true }))
    const [attempt] = amrapHistory(block(), [twice], 'barbell-squat')
    expect(attempt.reps).toBe(3)
    expect(attempt.weightLb).toBeCloseTo(290, 0)   // 245 plates plus the bar
  })

  it('does not let a heavier unflagged set displace the flagged one', () => {
    // A joker single above the top set is heavier and is not the AMRAP.
    const withJoker = session(wk(1), 'barbell-squat', [[225, 8], [275, 1]])
    withJoker.exercises[0].sets = withJoker.exercises[0].sets.map((s, i) => ({
      ...s, isAmrap: i === 0,
    }))
    const [attempt] = amrapHistory(block(), [withJoker], 'barbell-squat')
    expect(attempt.reps).toBe(8)
    expect(attempt.weightLb).toBeCloseTo(270, 0)
  })

  it('compares the reps against the week, not against a fixed number', () => {
    // Five-plus in week one, three-plus in week two, one-plus in week three.
    const history = amrapHistory(block(), [
      weekOne(wk(1), 7), weekOne(wk(2), 5), weekOne(wk(3), 3),
    ], 'barbell-squat')
    expect(history.map(a => a.targetReps)).toEqual([5, 3, 1])
    expect(history.map(a => a.repsVsTarget)).toEqual([2, 2, 2])
  })

  it('takes the rep target from the wave rather than restating it', () => {
    // The same source the prescription uses, so the two cannot disagree.
    for (const week of [1, 2, 3] as const) {
      const amrap = fiveThreeOneWave(315, week).find(s => s.isAmrap)!
      const [attempt] = amrapHistory(block(), [weekOne(wk(week), 4)], 'barbell-squat')
      expect(attempt.targetReps).toBe(Number(amrap.reps.replace('+', '')))
    }
  })

  it('reports coming up short as a negative', () => {
    const [attempt] = amrapHistory(block(), [weekOne(wk(1), 3)], 'barbell-squat')
    expect(attempt.repsVsTarget).toBe(-2)
  })

  it('skips the deload week, which has no top set to beat', () => {
    expect(amrapHistory(block(), [weekOne(wk(4), 5)], 'barbell-squat')).toEqual([])
  })

  it('ignores anything logged before the block began', () => {
    // Four consecutive days, so they cover all four positions in the cycle. A
    // single date could be excluded for landing on a deload rather than for
    // predating the block, and would still pass with the start date ignored.
    const before = ['2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06']
    expect(amrapHistory(block(), before.map(d => weekOne(d, 9)), 'barbell-squat')).toEqual([])
  })

  it('counts the first day of the block itself', () => {
    // The boundary the test above leans on: excluded up to the start, included
    // from it.
    expect(amrapHistory(block(), [weekOne(START, 6)], 'barbell-squat')).toHaveLength(1)
  })

  it('ignores other lifts', () => {
    const history = amrapHistory(block(), [
      weekOne(wk(1), 6),
      session(wk(1), 'bench-press', [[185, 4]]),
    ], 'barbell-squat')
    expect(history).toHaveLength(1)
    expect(history[0].exerciseId).toBe('barbell-squat')
  })

  it('gives nothing for a lift the block carries no training max for', () => {
    // The same rule the prescription follows: absent beats guessed. Without a
    // training max there is no wave, so there is no target to have missed.
    const history = amrapHistory(block(), [session(wk(1), 'deadlift', [[315, 5]])], 'deadlift')
    expect(history).toEqual([])
  })

  it('skips a session where the lift was only warmed up, never logged', () => {
    const empty = { ...session(wk(1), 'barbell-squat', []), exercises: [
      { exerciseId: 'barbell-squat', status: 'skipped' as const, sets: [] },
    ] }
    expect(amrapHistory(block(), [empty], 'barbell-squat')).toEqual([])
  })

  it('returns attempts oldest first, whatever order the sessions arrive in', () => {
    const history = amrapHistory(block(), [
      weekOne(wk(3), 1), weekOne(wk(1), 5), weekOne(wk(2), 3),
    ], 'barbell-squat')
    expect(history.map(a => a.date)).toEqual([wk(1), wk(2), wk(3)])
  })

  it('says what the week prescribed, so a mismatched weight is visible', () => {
    const [attempt] = amrapHistory(block(), [weekOne(wk(1), 5)], 'barbell-squat')
    const amrap = fiveThreeOneWave(315, 1).find(s => s.isAmrap)!
    expect(attempt.prescribedWeightLb).toBe(amrap.weight)
  })

  it('says what the week prescribed even when the set matched it', () => {
    // `e1rmLb` used to be asserted here. It was computed for every attempt and
    // never read by anything, so it was dropped rather than kept warm by its
    // own test — `lib/amrap.ts` already derives an estimated max from flagged
    // sets, and that one has a consumer.
    const [attempt] = amrapHistory(block(), [weekOne(wk(1), 5)], 'barbell-squat')
    expect(attempt.prescribedWeightLb).toBe(fiveThreeOneWave(315, 1).find(s => s.isAmrap)!.weight)
  })

  it('gives nothing for a programme with no wave encoded', () => {
    const tb = block({ programId: 'tactical-barbell', templateId: 'operator' })
    expect(amrapHistory(tb, [weekOne(wk(1), 5)], 'barbell-squat')).toEqual([])
  })
})
