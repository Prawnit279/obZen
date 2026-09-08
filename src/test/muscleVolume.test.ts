import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import {
  weeklySetsByMuscle, muscleReadings, bandFor,
  MUSCLE_LANDMARKS, TRACKED_MUSCLES,
} from '@/lib/muscleVolume'

// ── Fixtures ─────────────────────────────────────────────────────────────────

function set(n: number, reps = 8): LoggedSet {
  return { setNumber: n, weight: 100, reps, unit: 'lbs', timestamp: '2026-08-01T10:00:00.000Z' }
}

function sets(count: number): LoggedSet[] {
  return Array.from({ length: count }, (_, i) => set(i + 1))
}

function session(
  date: string,
  entries: { exerciseId: string; muscle?: string; sets: LoggedSet[] }[]
): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    exercises: entries.map(e => ({
      exerciseId: e.exerciseId, status: 'complete', muscle: e.muscle, sets: e.sets,
    })),
    order: entries.map(e => e.exerciseId),
  }
}

// ── weeklySetsByMuscle ───────────────────────────────────────────────────────

describe('weeklySetsByMuscle', () => {
  it('counts hard sets per muscle group per week', () => {
    const rows = weeklySetsByMuscle([
      session('2026-08-03', [
        { exerciseId: 'barbell-squat', muscle: 'legs', sets: sets(4) },
        { exerciseId: 'bench-press', muscle: 'chest', sets: sets(3) },
      ]),
      session('2026-08-05', [
        { exerciseId: 'leg-press', muscle: 'legs', sets: sets(3) },
      ]),
    ])

    const legs = rows.find(r => r.muscle === 'legs')!
    expect(legs.sets).toBe(7)
    expect(rows.find(r => r.muscle === 'chest')!.sets).toBe(3)
  })

  it('separates weeks rather than pooling them', () => {
    const rows = weeklySetsByMuscle([
      session('2026-08-03', [{ exerciseId: 'barbell-squat', muscle: 'legs', sets: sets(4) }]),
      session('2026-08-10', [{ exerciseId: 'barbell-squat', muscle: 'legs', sets: sets(6) }]),
    ])

    const legWeeks = rows.filter(r => r.muscle === 'legs')
    expect(legWeeks).toHaveLength(2)
    expect(legWeeks.map(r => r.sets).sort((a, b) => a - b)).toEqual([4, 6])
  })

  it('does not count placeholder rows the logger never saved', () => {
    const placeholder: LoggedSet = {
      setNumber: 1, weight: 0, reps: 0, unit: 'lbs', timestamp: '',
    }
    const rows = weeklySetsByMuscle([
      session('2026-08-03', [
        { exerciseId: 'barbell-squat', muscle: 'legs', sets: [set(1), placeholder] },
      ]),
    ])
    expect(rows.find(r => r.muscle === 'legs')!.sets).toBe(1)
  })

  it('leaves timed holds out — a plank is not a working set in this sense', () => {
    const rows = weeklySetsByMuscle([
      session('2026-08-03', [{ exerciseId: 'plank', muscle: 'core', sets: sets(3) }]),
    ])
    expect(rows.find(r => r.muscle === 'core')).toBeUndefined()
  })

  it('skips exercises with no muscle recorded rather than inventing a group', () => {
    const rows = weeklySetsByMuscle([
      session('2026-08-03', [{ exerciseId: 'mystery-lift', sets: sets(5) }]),
    ])
    expect(rows).toEqual([])
  })

  it('returns nothing for an empty history', () => {
    expect(weeklySetsByMuscle([])).toEqual([])
  })
})

// ── bandFor ──────────────────────────────────────────────────────────────────

describe('bandFor', () => {
  const landmark = { muscle: 'chest', covers: ['chest'], mev: 8, mav: 20, mrv: 22 }

  it('calls anything under the minimum below', () => {
    expect(bandFor(0, landmark)).toBe('below')
    expect(bandFor(7, landmark)).toBe('below')
  })

  it('treats the minimum itself as productive', () => {
    expect(bandFor(8, landmark)).toBe('productive')
    expect(bandFor(20, landmark)).toBe('productive')
  })

  it('calls the stretch between adaptive and recoverable high', () => {
    expect(bandFor(21, landmark)).toBe('high')
    expect(bandFor(22, landmark)).toBe('high')
  })

  it('flags anything past the recoverable ceiling', () => {
    expect(bandFor(23, landmark)).toBe('over')
  })

  it('never calls nought sets productive, even where the minimum is nought', () => {
    // Core's MEV is 0 because direct ab work is optional — but reporting an
    // untrained muscle as "in range" would read as approval.
    const core = { muscle: 'core', covers: ['abs'], mev: 0, mav: 20, mrv: 25 }
    expect(bandFor(0, core)).toBe('below')
    expect(bandFor(1, core)).toBe('productive')
  })
})

// ── muscleReadings ───────────────────────────────────────────────────────────

describe('muscleReadings', () => {
  it('reports the current week against each landmark', () => {
    const readings = muscleReadings(
      [session('2026-09-02', [{ exerciseId: 'bench-press', muscle: 'chest', sets: sets(10) }])],
      '2026-09-04'
    )
    const chest = readings.find(r => r.muscle === 'chest')!
    expect(chest.sets).toBe(10)
    expect(chest.band).toBe('productive')
  })

  it('counts a muscle trained zero times this week as zero, not missing', () => {
    // Silence would read as "no data"; nought sets is a real and useful answer.
    const readings = muscleReadings(
      [session('2026-09-02', [{ exerciseId: 'bench-press', muscle: 'chest', sets: sets(10) }])],
      '2026-09-04'
    )
    expect(readings.map(r => r.muscle).sort()).toEqual([...TRACKED_MUSCLES].sort())
    expect(readings.find(r => r.muscle === 'back')!.sets).toBe(0)
  })

  it('ignores weeks other than the one asked about', () => {
    const readings = muscleReadings(
      [
        session('2026-08-03', [{ exerciseId: 'bench-press', muscle: 'chest', sets: sets(12) }]),
        session('2026-09-02', [{ exerciseId: 'bench-press', muscle: 'chest', sets: sets(4) }]),
      ],
      '2026-09-04'
    )
    expect(readings.find(r => r.muscle === 'chest')!.sets).toBe(4)
  })

  it('carries the landmark through so the caller can show its coverage', () => {
    const readings = muscleReadings([], '2026-09-04')
    const legs = readings.find(r => r.muscle === 'legs')!
    expect(legs.landmark.covers.length).toBeGreaterThan(1)
    expect(legs.sets).toBe(0)
    expect(legs.band).toBe('below')
  })
})

// ── Landmarks ────────────────────────────────────────────────────────────────

describe('MUSCLE_LANDMARKS', () => {
  it('covers every muscle group the app records', () => {
    for (const muscle of TRACKED_MUSCLES) {
      expect(MUSCLE_LANDMARKS[muscle]).toBeDefined()
    }
  })

  it('keeps each landmark ordered — minimum, adaptive, recoverable', () => {
    for (const muscle of TRACKED_MUSCLES) {
      const l = MUSCLE_LANDMARKS[muscle]
      expect(l.mev).toBeLessThanOrEqual(l.mav)
      expect(l.mav).toBeLessThanOrEqual(l.mrv)
    }
  })

  it('names what each coarse group is standing in for', () => {
    // 'legs' and 'arms' aggregate several muscles, and the band is a sum —
    // the covered list is what makes that legible rather than mysterious.
    expect(MUSCLE_LANDMARKS.legs.covers).toContain('quads')
    expect(MUSCLE_LANDMARKS.arms.covers).toContain('triceps')
  })
})
