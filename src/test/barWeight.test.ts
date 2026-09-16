import { describe, it, expect } from 'vitest'
import {
  barWeightLbFor, isBarLoaded, DEFAULT_BAR_LB, EZ_BAR_LB, EZ_BAR_LOADED, NOT_BAR_LOADED,
} from '@/lib/barWeight'
import { EXERCISE_MOTIONS } from '@/data/exercise-motions'
import { trackingModeFor } from '@/data/obzen-program'
import {
  bestE1RM, exerciseTonnage, loadedWeightLb, loadedWeightKg,
  setWeightLb, setLoadKg, lbToKg, kgToLb, sbdTotal,
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

  it('gives the EZ bar its own weight rather than the Olympic one', () => {
    // These are tagged `bar` because that is what the renderer should draw. The
    // load maths must not read the tag as 45 lb: a curl logged on a 25 lb bar
    // would gain twenty pounds it never had.
    for (const id of ['ez-bar-curl', 'ez-bar-skull-crusher', 'ez-bar-upright-row']) {
      expect(EXERCISE_MOTIONS[id].equipment).toBe('bar')
      expect(barWeightLbFor(id)).toBe(EZ_BAR_LB)
    }
    expect(EZ_BAR_LB).toBeLessThan(DEFAULT_BAR_LB)
  })

  it('keeps the two exception lists honest', () => {
    // This replaced a set of hardcoded counts (34/22/6/6). They broke on every
    // unrelated bar-tagged addition, and the partition they asserted held by
    // construction — `barWeightLbFor` returns one of three values, so the three
    // buckets could never fail to sum. These are the properties that can fail.
    const tagged = new Set(
      Object.entries(EXERCISE_MOTIONS).filter(([, m]) => m.equipment === 'bar').map(([id]) => id)
    )

    // An exception only means anything for a lift the tag actually caught.
    for (const id of [...EZ_BAR_LOADED, ...NOT_BAR_LOADED]) {
      expect(tagged.has(id), `${id} is excepted but is not tagged 'bar'`).toBe(true)
    }
    // A lift cannot be both a lighter bar and no bar at all.
    const both = [...EZ_BAR_LOADED].filter(id => NOT_BAR_LOADED.has(id))
    expect(both, `listed twice: ${both.join(', ')}`).toHaveLength(0)
    // And each list does what it says.
    for (const id of EZ_BAR_LOADED) expect(barWeightLbFor(id), id).toBe(EZ_BAR_LB)
    for (const id of NOT_BAR_LOADED) expect(barWeightLbFor(id), id).toBe(0)
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

// ── Bodyweight belongs in strength, not in a record row ──────────────────────

describe('loadedWeightKg vs setLoadKg', () => {
  const pullup = {
    exerciseId: 'weighted-pull-ups', status: 'complete' as const,
    sets: [{ setNumber: 1, weight: 25, reps: 5, unit: 'lbs' as const, timestamp: '2026-08-01T10:00:00.000Z' }],
  }
  const BW_KG = 80

  it('keeps bodyweight out of what was hung off the belt', () => {
    // The PR card renders this as "25 lb × 5". Folding in 80 kg of lifter would
    // make the row read 201 lb — true of the load, useless as a record you can
    // reproduce.
    expect(kgToLb(loadedWeightKg('weighted-pull-ups', pullup.sets[0]))).toBeCloseTo(25, 1)
  })

  it('puts bodyweight into the strength estimate on the same set', () => {
    // Adjacent on the card, and deliberately different: an estimated 1RM for a
    // pull-up is meaningless without the body it lifted.
    const e1rm = bestE1RM(pullup, BW_KG)
    expect(kgToLb(e1rm)).toBeGreaterThan(200)
  })

  it('still adds the bar where there is one', () => {
    const set = { setNumber: 1, weight: 225, reps: 5, unit: 'lbs' as const, timestamp: '2026-08-01T10:00:00.000Z' }
    expect(kgToLb(loadedWeightKg('barbell-squat', set))).toBeCloseTo(270, 1)
    expect(kgToLb(loadedWeightKg('leg-press', set))).toBeCloseTo(225, 1)
  })
})

// ── Reading the same lift both ways ──────────────────────────────────────────

describe('plates-only mode', () => {
  const set = { setNumber: 1, weight: 225, reps: 5, unit: 'lbs' as const, timestamp: '2026-08-01T10:00:00.000Z' }
  const squat = { exerciseId: 'barbell-squat', status: 'complete' as const, sets: [set] }
  const session = {
    date: '2026-08-01', dayLabel: 'Day 1' as const, profileId: 'pronit',
    exercises: [squat], order: ['barbell-squat'],
  }

  it('drops the bar from the reported weight', () => {
    expect(barWeightLbFor('barbell-squat', 'plates-only')).toBe(0)
    expect(kgToLb(loadedWeightKg('barbell-squat', set, 'plates-only'))).toBeCloseTo(225, 1)
    expect(kgToLb(loadedWeightKg('barbell-squat', set, 'with-bar'))).toBeCloseTo(270, 1)
  })

  it('defaults to counting the bar when no mode is given', () => {
    // Every existing caller relies on this — the default must stay with-bar.
    expect(barWeightLbFor('barbell-squat')).toBe(DEFAULT_BAR_LB)
    expect(loadedWeightKg('barbell-squat', set)).toBe(loadedWeightKg('barbell-squat', set, 'with-bar'))
  })

  it('changes an estimated max by the bar scaled through the reps', () => {
    // Not a flat 45: Epley multiplies the load by (1 + reps/30), so at 5 reps
    // the bar is worth 45 × 7/6 = 52.5 lb of estimated max. This is why the
    // mode has to reach the arithmetic rather than being subtracted after.
    const withBar = kgToLb(bestE1RM(squat, 0, 'with-bar'))
    const plates = kgToLb(bestE1RM(squat, 0, 'plates-only'))
    expect(withBar - plates).toBeCloseTo(45 * (1 + 5 / 30), 1)
  })

  it('carries through to the SBD total', () => {
    const withBar = sbdTotal([session], ['barbell-squat'], 'with-bar')
    const plates = sbdTotal([session], ['barbell-squat'], 'plates-only')
    expect(kgToLb(withBar.totalKg - plates.totalKg)).toBeCloseTo(45 * (1 + 5 / 30), 1)
    // Both still count the lift as logged — the mode changes the number, not
    // whether there is one.
    expect(plates.loggedCount).toBe(withBar.loggedCount)
  })

  it('leaves a lift that never had a bar identical either way', () => {
    const legPress = { exerciseId: 'leg-press', status: 'complete' as const, sets: [set] }
    expect(bestE1RM(legPress, 0, 'plates-only')).toBe(bestE1RM(legPress, 0, 'with-bar'))
  })
})
