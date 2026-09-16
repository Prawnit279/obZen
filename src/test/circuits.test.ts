/**
 * Circuits.
 *
 * The rule doing most of the work here: ungrouping is not deleting. A circuit
 * can be taken apart, resized or emptied, and the exercises — with every set
 * logged into them — survive all of it.
 */
import { describe, it, expect } from 'vitest'
import {
  isValidRounds, circuitMembers, canAddToCircuit, emptyCircuitIds,
  addCircuit, removeCircuit, setCircuitRounds, removeFromCircuit,
  MAX_CIRCUIT_EXERCISES, MIN_CIRCUIT_ROUNDS, MAX_CIRCUIT_ROUNDS,
} from '@/lib/circuits'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'

const loggedSet: LoggedSet = {
  setNumber: 1, weight: 0, reps: 15, unit: 'lbs', timestamp: '2026-09-16T10:00:00.000Z',
}

function ex(id: string, circuitId?: string, sets: LoggedSet[] = []) {
  return { exerciseId: id, status: 'pending' as const, sets, ...(circuitId ? { circuitId } : {}) }
}

function session(over: Partial<WorkoutDaySession> = {}): WorkoutDaySession {
  return {
    date: '2026-09-16', dayLabel: 'Day 1', profileId: 'pronit',
    exercises: [ex('plank'), ex('cable-crunch'), ex('dead-bug')],
    order: ['plank', 'cable-crunch', 'dead-bug'],
    ...over,
  }
}

const abs = { id: 'c1', name: 'Abs', rounds: 3 }

// ── The limits ───────────────────────────────────────────────────────────────

describe('rounds', () => {
  it('accepts three and four', () => {
    expect(isValidRounds(3)).toBe(true)
    expect(isValidRounds(4)).toBe(true)
  })

  it('refuses anything outside that, including what storage might hand back', () => {
    for (const bad of [0, 1, 2, 5, 10, -3, 3.5, NaN, Infinity]) {
      expect(isValidRounds(bad), String(bad)).toBe(false)
    }
  })

  it('states the band it enforces', () => {
    expect(MIN_CIRCUIT_ROUNDS).toBe(3)
    expect(MAX_CIRCUIT_ROUNDS).toBe(4)
  })
})

describe('size', () => {
  it('caps a circuit at five exercises', () => {
    expect(MAX_CIRCUIT_EXERCISES).toBe(5)
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const many = session({ exercises: ids.map(id => ex(id)), order: ids })
    const built = addCircuit(many, abs, ids)

    expect(circuitMembers(built, 'c1')).toHaveLength(5)
    // The two that did not fit are still in the session, just not grouped.
    expect(built.exercises).toHaveLength(7)
  })

  it('says when another will not fit', () => {
    const ids = ['a', 'b', 'c', 'd', 'e']
    const full = session({ exercises: ids.map(id => ex(id, 'c1')), order: ids, circuits: [abs] })
    expect(canAddToCircuit(full, 'c1')).toBe(false)
    expect(canAddToCircuit(session({ circuits: [abs] }), 'c1')).toBe(true)
  })
})

// ── Building one ─────────────────────────────────────────────────────────────

describe('addCircuit', () => {
  it('groups the exercises named and leaves the rest alone', () => {
    const built = addCircuit(session(), abs, ['plank', 'dead-bug'])
    expect(circuitMembers(built, 'c1').map(e => e.exerciseId)).toEqual(['plank', 'dead-bug'])
    expect(built.exercises.find(e => e.exerciseId === 'cable-crunch')?.circuitId).toBeUndefined()
  })

  it('keeps rounds in one place, not on every member', () => {
    // Members cannot disagree about how many rounds there are.
    const built = addCircuit(session(), abs, ['plank'])
    expect(built.circuits).toEqual([abs])
    for (const e of circuitMembers(built, 'c1')) {
      expect(e).not.toHaveProperty('rounds')
    }
  })

  it('does not modify the session it was given', () => {
    const before = session()
    addCircuit(before, abs, ['plank'])
    expect(before.circuits).toBeUndefined()
    expect(before.exercises[0].circuitId).toBeUndefined()
  })

  it('keeps the order the session already had', () => {
    const built = addCircuit(session(), abs, ['dead-bug', 'plank'])
    expect(circuitMembers(built, 'c1').map(e => e.exerciseId)).toEqual(['plank', 'dead-bug'])
  })
})

// ── Taking one apart ─────────────────────────────────────────────────────────

describe('removeCircuit', () => {
  it('ungroups without deleting anything', () => {
    // The whole point: logged work survives losing its grouping.
    const withSets = session({
      exercises: [ex('plank', 'c1', [loggedSet]), ex('cable-crunch', 'c1'), ex('dead-bug')],
      circuits: [abs],
    })
    const after = removeCircuit(withSets, 'c1')

    expect(after.circuits).toEqual([])
    expect(after.exercises).toHaveLength(3)
    expect(after.exercises[0].sets).toEqual([loggedSet])
    expect(after.exercises.every(e => e.circuitId === undefined)).toBe(true)
  })

  it('leaves another circuit untouched', () => {
    const two = session({
      exercises: [ex('plank', 'c1'), ex('dead-bug', 'c2')],
      circuits: [abs, { id: 'c2', name: 'Calves', rounds: 4 }],
    })
    const after = removeCircuit(two, 'c1')
    expect(after.circuits?.map(c => c.id)).toEqual(['c2'])
    expect(after.exercises.find(e => e.exerciseId === 'dead-bug')?.circuitId).toBe('c2')
  })
})

describe('removeFromCircuit', () => {
  it('takes one out and leaves the circuit standing', () => {
    const built = addCircuit(session(), abs, ['plank', 'dead-bug'])
    const after = removeFromCircuit(built, 'plank')

    expect(circuitMembers(after, 'c1').map(e => e.exerciseId)).toEqual(['dead-bug'])
    expect(after.circuits).toHaveLength(1)
    expect(after.exercises).toHaveLength(3)
  })
})

// ── Rounds on an existing circuit ────────────────────────────────────────────

describe('setCircuitRounds', () => {
  it('changes them within the band', () => {
    const built = addCircuit(session(), abs, ['plank'])
    expect(setCircuitRounds(built, 'c1', 4).circuits?.[0].rounds).toBe(4)
  })

  it('refuses a value outside it rather than clamping', () => {
    // Clamping would silently store something other than what was asked for.
    const built = addCircuit(session(), abs, ['plank'])
    for (const bad of [2, 5, 0, NaN]) {
      expect(setCircuitRounds(built, 'c1', bad).circuits?.[0].rounds).toBe(3)
    }
  })

  it('ignores a circuit that is not there', () => {
    const built = addCircuit(session(), abs, ['plank'])
    expect(setCircuitRounds(built, 'nope', 4).circuits).toEqual([abs])
  })
})

// ── Leftovers ────────────────────────────────────────────────────────────────

describe('emptyCircuitIds', () => {
  it('finds a circuit nothing is left in', () => {
    const built = addCircuit(session(), abs, ['plank'])
    expect(emptyCircuitIds(built)).toEqual([])
    expect(emptyCircuitIds(removeFromCircuit(built, 'plank'))).toEqual(['c1'])
  })

  it('is empty for a session with no circuits at all', () => {
    expect(emptyCircuitIds(session())).toEqual([])
  })
})
