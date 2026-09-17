/**
 * Turning a block into this week's sets.
 *
 * The rule throughout: nothing is invented. A programme whose numbers were
 * never supplied says so; a lift with no training max is absent rather than
 * given a guessed one; and the percentages come from `strengthTools`, which has
 * its own tests, rather than being restated here.
 */
import { describe, it, expect } from 'vitest'
import { weekPrescription, blockProgress } from '@/lib/block'
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
    const p = weekPrescription(block(), wk(1))!
    const squat = p.lifts.find(l => l.exerciseId === 'barbell-squat')!
    // Deferred to strengthTools rather than restated — if the wave changes
    // there, this follows rather than disagreeing.
    expect(squat.sets).toEqual(fiveThreeOneWave(315, 1))
    expect(squat.trainingMaxLb).toBe(315)
  })

  it('changes the wave as the weeks pass', () => {
    const week1 = weekPrescription(block(), wk(1))!.lifts[0].sets
    const week3 = weekPrescription(block(), wk(3))!.lifts[0].sets
    expect(week1).not.toEqual(week3)
    expect(week3[week3.length - 1].reps).toMatch(/1\+?/)
  })

  it('drops to the deload wave in week four', () => {
    const p = weekPrescription(block(), wk(4))!
    expect(p.lifts[0].sets).toEqual(fiveThreeOneWave(315, 'deload'))
    expect(p.lifts[0].sets.every(s => !s.isAmrap)).toBe(true)
  })

  it('leaves out a lift with no training max rather than guessing one', () => {
    const p = weekPrescription(block({ trainingMaxLb: { 'barbell-squat': 315, deadlift: 0 } }), wk(1))!
    expect(p.lifts.map(l => l.exerciseId)).toEqual(['barbell-squat'])
  })

  it('prescribes nothing at all when no training max is set', () => {
    const p = weekPrescription(block({ trainingMaxLb: {} }), wk(1))!
    expect(p.lifts).toEqual([])
    expect(p.unavailable).toBeNull()   // the block is fine; it just has no maxes
  })
})

// ── Supplemental work ────────────────────────────────────────────────────────

describe('supplemental volume', () => {
  it('is absent on the programme that carries none', () => {
    expect(weekPrescription(block(), wk(1))?.supplemental).toBeNull()
  })

  it('is five sets of ten on the one that does', () => {
    const p = weekPrescription(block({ programId: 'bbb' }), wk(1))!
    expect(p.supplemental).toHaveLength(2)
    const squat = p.supplemental!.find(s => /squat/i.test(s.label))!
    expect(squat).toMatchObject({ sets: 5, reps: 10, weightLb: bbbSet(315, 50).weight })
  })

  it('is dropped in the deload week', () => {
    // A deload carrying five sets of ten is not a deload.
    expect(weekPrescription(block({ programId: 'bbb' }), wk(4))?.supplemental).toBeNull()
  })
})

// ── Programmes that cannot prescribe ─────────────────────────────────────────

describe('a programme whose numbers were never supplied', () => {
  it('says what it is waiting for, not merely that it cannot', () => {
    const p = weekPrescription(block({ programId: 'tactical-barbell', templateId: 'operator' }), wk(1))!
    expect(p.lifts).toEqual([])
    // The specific message matters. "No prescription encoded" is true of any
    // programme without a wave; this one has to name the numbers it wants, or
    // there is nothing to act on.
    expect(p.unavailable).toMatch(/set counts|percentages|blocks/i)
    expect(p.unavailable).toBe(programById('tactical-barbell')!.needs)
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
