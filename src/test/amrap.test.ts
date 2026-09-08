import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import {
  latestAmrapSets, tmAdvice,
  TM_FRACTION, RESET_BAND, UPPER_INCREMENT_LB, LOWER_INCREMENT_LB,
} from '@/lib/amrap'

// ── Fixtures ─────────────────────────────────────────────────────────────────

function set(weight: number, reps: number, isAmrap?: boolean): LoggedSet {
  return {
    setNumber: 1, weight, reps, unit: 'lbs',
    timestamp: '2026-08-01T10:00:00.000Z',
    ...(isAmrap === undefined ? {} : { isAmrap }),
  }
}

function session(
  date: string,
  exerciseId: string,
  sets: LoggedSet[],
  muscle = 'legs'
): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    exercises: [{ exerciseId, status: 'complete', muscle, sets }],
    order: [exerciseId],
  }
}

// ── latestAmrapSets ──────────────────────────────────────────────────────────

describe('latestAmrapSets', () => {
  it('picks the newest flagged set for each lift', () => {
    const sessions = [
      session('2026-08-01', 'barbell-squat', [set(300, 5, true)]),
      session('2026-08-15', 'barbell-squat', [set(315, 4, true)]),
      session('2026-08-08', 'bench-press', [set(200, 6, true)], 'chest'),
    ]
    const found = latestAmrapSets(sessions, ['barbell-squat', 'bench-press'])

    expect(found).toHaveLength(2)
    const squat = found.find(a => a.exerciseId === 'barbell-squat')!
    expect(squat.dateISO).toBe('2026-08-15')
    expect(squat.weightLb).toBe(315)
    expect(squat.reps).toBe(4)
  })

  it('ignores sets that were never flagged', () => {
    // The whole point of the flag is that a straight set is not an AMRAP —
    // its rep count was prescribed, so its e1RM understates the lift.
    const sessions = [session('2026-08-01', 'barbell-squat', [set(300, 5), set(300, 5, false)])]
    expect(latestAmrapSets(sessions, ['barbell-squat'])).toEqual([])
  })

  it('ignores placeholder rows the logger has not saved', () => {
    const placeholder: LoggedSet = {
      setNumber: 1, weight: 300, reps: 0, unit: 'lbs', timestamp: '', isAmrap: true,
    }
    expect(latestAmrapSets([session('2026-08-01', 'barbell-squat', [placeholder])], ['barbell-squat']))
      .toEqual([])
  })

  it('converts a kilo set into pounds so the 5/3/1 maths stays in one unit', () => {
    const kg: LoggedSet = {
      setNumber: 1, weight: 100, reps: 5, unit: 'kg',
      timestamp: '2026-08-01T10:00:00.000Z', isAmrap: true,
    }
    const [found] = latestAmrapSets([session('2026-08-01', 'barbell-squat', [kg])], ['barbell-squat'])
    expect(found.weightLb).toBeCloseTo(220.46, 1)
  })

  it('returns nothing for a lift that was never trained', () => {
    expect(latestAmrapSets([], ['barbell-squat'])).toEqual([])
  })

  it('takes the heaviest when one session flags more than one set', () => {
    const sessions = [
      session('2026-08-01', 'barbell-squat', [set(275, 8, true), set(315, 3, true)]),
    ]
    expect(latestAmrapSets(sessions, ['barbell-squat'])[0].weightLb).toBe(315)
  })
})

// ── tmAdvice ─────────────────────────────────────────────────────────────────

describe('tmAdvice', () => {
  it('seeds a Training Max from a first AMRAP and adds the cycle jump', () => {
    // 300 x 5 -> Epley e1RM 350 -> TM 315 -> next cycle 325 (lower body).
    const sessions = [session('2026-08-15', 'barbell-squat', [set(300, 5, true)])]
    const [advice] = tmAdvice(sessions, ['barbell-squat'])

    expect(advice.e1rmLb).toBe(350)
    expect(advice.impliedTmLb).toBe(315)
    expect(advice.priorTmLb).toBeNull()
    expect(advice.incrementLb).toBe(LOWER_INCREMENT_LB)
    expect(advice.nextTmLb).toBe(325)
    expect(advice.verdict).toBe('advance')
  })

  it('advances when the AMRAP still supports the Training Max', () => {
    const sessions = [
      // Earlier, weaker session sets the prior bar.
      session('2026-08-01', 'barbell-squat', [set(275, 5, true)]),
      session('2026-08-15', 'barbell-squat', [set(300, 5, true)]),
    ]
    const [advice] = tmAdvice(sessions, ['barbell-squat'])

    expect(advice.priorTmLb).toBe(290) // 275x5 -> 320.83 e1RM -> TM 290
    expect(advice.impliedTmLb).toBe(315)
    expect(advice.verdict).toBe('advance')
    expect(advice.nextTmLb).toBe(325)
  })

  it('holds when the AMRAP slips but stays inside the reset band', () => {
    // Prior TM 315; today implies 290, which is 92% of it — a bad day, not a stall.
    const sessions = [
      session('2026-08-01', 'barbell-squat', [set(300, 5, true)]),
      session('2026-08-15', 'barbell-squat', [set(275, 5, true)]),
    ]
    const [advice] = tmAdvice(sessions, ['barbell-squat'])

    expect(advice.priorTmLb).toBe(315)
    expect(advice.impliedTmLb).toBe(290)
    expect(advice.verdict).toBe('hold')
    expect(advice.nextTmLb).toBe(315) // repeat, do not jump
  })

  it('resets to 90% of the prior Training Max once the lift falls out of the band', () => {
    // Prior TM 315; today implies 240, which is 76% — the 5/3/1 reset case.
    const sessions = [
      session('2026-08-01', 'barbell-squat', [set(300, 5, true)]),
      session('2026-08-15', 'barbell-squat', [set(225, 5, true)]),
    ]
    const [advice] = tmAdvice(sessions, ['barbell-squat'])

    expect(advice.verdict).toBe('reset')
    expect(advice.nextTmLb).toBe(285) // roundTo5(315 * 0.9)
  })

  it('uses the smaller jump for upper-body lifts', () => {
    const sessions = [session('2026-08-15', 'bench-press', [set(200, 5, true)], 'chest')]
    const [advice] = tmAdvice(sessions, ['bench-press'])

    expect(advice.incrementLb).toBe(UPPER_INCREMENT_LB)
    expect(advice.impliedTmLb).toBe(210) // 233.33 e1RM -> 210
    expect(advice.nextTmLb).toBe(215)
  })

  it('says nothing at all until a set is flagged', () => {
    // Silence is the honest output here — an unflagged history cannot tell us
    // whether a rep count was a limit or a prescription.
    const sessions = [session('2026-08-15', 'barbell-squat', [set(300, 5)])]
    expect(tmAdvice(sessions, ['barbell-squat'])).toEqual([])
  })

  it('reports one entry per lift, newest first', () => {
    const sessions = [
      session('2026-08-01', 'bench-press', [set(200, 5, true)], 'chest'),
      session('2026-08-15', 'barbell-squat', [set(300, 5, true)]),
    ]
    const advice = tmAdvice(sessions, ['barbell-squat', 'bench-press'])

    expect(advice.map(a => a.exerciseId)).toEqual(['barbell-squat', 'bench-press'])
  })

  it('carries a reason for every verdict', () => {
    const sessions = [
      session('2026-08-01', 'barbell-squat', [set(300, 5, true)]),
      session('2026-08-15', 'barbell-squat', [set(225, 5, true)]),
    ]
    expect(tmAdvice(sessions, ['barbell-squat'])[0].reason).toMatch(/\S/)
  })
})

// ── Constants ────────────────────────────────────────────────────────────────

describe('5/3/1 constants', () => {
  it('keeps the Training Max at the book’s 90% of estimated max', () => {
    expect(TM_FRACTION).toBe(0.9)
  })

  it('resets only after a lift drops more than a tenth off its best', () => {
    expect(RESET_BAND).toBe(0.9)
  })

  it('jumps upper body in 5 lb and lower body in 10 lb', () => {
    expect(UPPER_INCREMENT_LB).toBe(5)
    expect(LOWER_INCREMENT_LB).toBe(10)
  })
})
