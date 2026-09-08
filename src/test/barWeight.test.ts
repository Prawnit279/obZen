import { describe, it, expect } from 'vitest'
import { barWeightLbFor, isBarLoaded, DEFAULT_BAR_LB } from '@/lib/barWeight'
import { EXERCISE_MOTIONS } from '@/data/exercise-motions'
import { trackingModeFor } from '@/data/obzen-program'
import {
  bestE1RM, exerciseTonnage, loadedWeightLb, setWeightLb, setLoadKg, lbToKg,
} from '@/lib/progress'

describe('barWeightLbFor', () => {
  it('gives the standard bar to lifts named for it', () => {
    for (const id of ['barbell-squat', 'barbell-back-squat', 'barbell-row', 'barbell-curls']) {
      expect(barWeightLbFor(id)).toBe(DEFAULT_BAR_LB)
    }
  })

  it('gives it to bar lifts whose names never say so', () => {
    // The whole reason the equipment tag is used instead of the name: these
    // three carry a bar, and two of them are competition lifts.
    for (const id of ['bench-press', 'deadlift', 'sumo-deadlift', 'romanian-deadlift']) {
      expect(barWeightLbFor(id)).toBe(DEFAULT_BAR_LB)
    }
  })

  it('leaves cable and machine work alone even when it is tagged as a bar', () => {
    // The logged number on these is already the whole load.
    for (const id of ['lat-pulldown', 'seated-cable-row', 'smith-machine-squat', 'landmine-press']) {
      expect(EXERCISE_MOTIONS[id].equipment).toBe('bar')  // the tag really does say bar
      expect(barWeightLbFor(id)).toBe(0)                  // and we still refuse it
    }
  })

  it('gives nothing to dumbbell, bodyweight or machine movements', () => {
    for (const id of ['db-shoulder-press', 'goblet-squat', 'leg-press', 'push-up', 'plank']) {
      expect(barWeightLbFor(id)).toBe(0)
    }
  })

  it('gives nothing to pull-up bar work', () => {
    // A fixed bar holds you up; it is not load you added.
    for (const id of ['pull-ups', 'chin-ups', 'weighted-pull-ups', 'assisted-pull-up']) {
      expect(barWeightLbFor(id)).toBe(0)
    }
  })

  it('gives nothing to an id it has never heard of', () => {
    // Custom additions must not silently gain 45 lb.
    expect(barWeightLbFor('some-custom-movement')).toBe(0)
    expect(barWeightLbFor('')).toBe(0)
  })

  it('covers exactly the bar lifts that are not excluded', () => {
    const tagged = Object.entries(EXERCISE_MOTIONS)
      .filter(([, m]) => m.equipment === 'bar')
      .map(([id]) => id)
    const loaded = tagged.filter(isBarLoaded)

    expect(tagged).toHaveLength(22)
    expect(loaded).toHaveLength(17)
  })
})

describe('isBarLoaded', () => {
  it('is true exactly when a bar weight applies', () => {
    expect(isBarLoaded('bench-press')).toBe(true)
    expect(isBarLoaded('lat-pulldown')).toBe(false)
    expect(isBarLoaded('goblet-squat')).toBe(false)
  })
})

// ── The bar reaching the numbers ─────────────────────────────────────────────

describe('the bar reaches every metric', () => {
  const sets = [{ setNumber: 1, weight: 100, reps: 5, unit: 'kg' as const, timestamp: '2026-08-01T10:00:00.000Z' }]
  const barbell = { exerciseId: 'deadlift', status: 'complete' as const, sets }
  const machine = { exerciseId: 'leg-press', status: 'complete' as const, sets }
  const BAR_KG = lbToKg(DEFAULT_BAR_LB)

  it('adds it to estimated 1RM', () => {
    expect(bestE1RM(barbell) - bestE1RM(machine)).toBeCloseTo(BAR_KG * (1 + 5 / 30), 4)
  })

  it('adds it to every rep of tonnage', () => {
    // The bar is lifted on each rep, so it counts five times over five reps.
    expect(exerciseTonnage(barbell) - exerciseTonnage(machine)).toBeCloseTo(BAR_KG * 5, 4)
  })

  it('adds it to the pounds shown on screen', () => {
    expect(loadedWeightLb('deadlift', sets[0])).toBeCloseTo(220.46 + DEFAULT_BAR_LB, 1)
    expect(loadedWeightLb('leg-press', sets[0])).toBeCloseTo(220.46, 1)
  })

  it('leaves the stored set untouched', () => {
    // The correction lives in the maths, so the logged number stays what was
    // typed — which is what makes it impossible to apply twice.
    expect(setWeightLb(sets[0])).toBeCloseTo(220.46, 1)
    expect(sets[0].weight).toBe(100)
  })

  it('reads an assisted lift as bodyweight less the assistance', () => {
    const set = { setNumber: 1, weight: 20, reps: 5, unit: 'kg' as const, timestamp: '2026-08-01T10:00:00.000Z' }
    // 80 kg of bodyweight less 20 kg of assistance is 60 kg moved.
    expect(setLoadKg('assisted-pull-up', set, 80)).toBeCloseTo(60, 4)
  })

  it('never marks an assistance-tracked movement as bar-loaded', () => {
    // `setLoadKg` returns early for assisted lifts, so a bar weight there would
    // be silently ignored. This is the invariant that makes that safe: nothing
    // hangs from a fixed bar and loads a free one at the same time.
    const assistedAndBarLoaded = Object.keys(EXERCISE_MOTIONS)
      .filter(id => trackingModeFor(id) === 'assisted' && isBarLoaded(id))
    expect(assistedAndBarLoaded).toEqual([])
  })
})
