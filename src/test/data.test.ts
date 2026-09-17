import { describe, it, expect } from 'vitest'
import { RUDIMENTS, getRudimentsByFamily, getRudimentsByDifficulty } from '@/data/rudiments'
import { PRONIT_PROGRAM, AISHWARYA_PROGRAM, SWAP_OPTIONS, EXERCISE_LIBRARY, getScheduledDay } from '@/data/obzen-program'
import type { ProgramDay } from '@/data/obzen-program'
import { EXERCISES, getExercisesByMuscle } from '@/data/exercises'
import { YOGA_POSES, getPosesBySequence } from '@/data/yoga-poses'
import { PITTA_REMEDIES, PITTA_DINACHARYA } from '@/data/ayurveda'
import { VEDIC_REMEDIES } from '@/data/vedic-remedies'
import { DRUM_BOOKS, ALL_LESSONS } from '@/data/drum-lessons'

describe('Rudiments', () => {
  it('has 39 rudiments', () => {
    expect(RUDIMENTS.length).toBe(39)
  })
  it('all rudiments have required fields', () => {
    for (const r of RUDIMENTS) {
      expect(r.id).toBeTruthy()
      expect(r.name).toBeTruthy()
      expect(r.family).toBeTruthy()
      expect(r.notation).toBeTruthy()
      expect(r.bpmRange.min).toBeGreaterThan(0)
      expect(r.bpmRange.max).toBeGreaterThan(r.bpmRange.min)
      expect(r.tips).toHaveLength(4)
    }
  })
  it('filters by family', () => {
    const singles = getRudimentsByFamily('single-stroke')
    expect(singles.length).toBeGreaterThan(0)
    singles.forEach(r => expect(r.family).toBe('single-stroke'))
  })
  it('filters by difficulty', () => {
    const beginners = getRudimentsByDifficulty('beginner')
    expect(beginners.length).toBeGreaterThan(0)
    beginners.forEach(r => expect(r.difficulty).toBe('beginner'))
  })
})

describe('Obzen Program', () => {
  it('each profile has 3 training days', () => {
    expect(Object.keys(PRONIT_PROGRAM)).toHaveLength(3)
    expect(Object.keys(AISHWARYA_PROGRAM)).toHaveLength(3)
  })
  it('each day has exercises', () => {
    const days: ProgramDay[] = [
      ...Object.values(PRONIT_PROGRAM),
      ...Object.values(AISHWARYA_PROGRAM),
    ]
    for (const day of days) {
      expect(day.exercises.length).toBeGreaterThan(0)
      expect(day.focus).toBeTruthy()
    }
  })
  it('keeps the two profiles on different programs', () => {
    expect(PRONIT_PROGRAM['Day 1'].focus).not.toBe(AISHWARYA_PROGRAM['Day 1'].focus)
  })

  // 2026-08-10 is a Monday.
  const monday = new Date(2026, 7, 10)
  const at = (days: number, offset: number) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + offset)
    return getScheduledDay(days, d)
  }
  /** Offsets from Monday that are training days, for a given plan. */
  const trainingOffsets = (days: number) =>
    [0, 1, 2, 3, 4, 5, 6].filter(o => at(days, o).kind === 'train')

  it('schedules exactly as many training days as the plan asks for', () => {
    // It used to ignore the setting and call five days a week training whatever
    // the plan said, reporting two missed sessions a week to anyone on three.
    for (const days of [2, 3, 4, 5, 6]) {
      expect(trainingOffsets(days), `${days} days`).toHaveLength(days)
    }
  })

  it('spreads them rather than stacking them', () => {
    // Rest between sessions is the point of choosing fewer of them. Three days
    // go Mon/Wed/Fri, not Mon/Tue/Wed.
    expect(trainingOffsets(3)).toEqual([0, 2, 4])
    expect(trainingOffsets(2)).toEqual([0, 3])
  })

  it('keeps Sunday free until the week is nearly full', () => {
    for (const days of [2, 3, 4, 5]) {
      expect(trainingOffsets(days), `${days} days`).not.toContain(6)
    }
  })

  it('falls back to three days for a count it does not recognise', () => {
    // Storage can hand back anything; a plan of zero days is not a rest week.
    expect(trainingOffsets(0)).toEqual(trainingOffsets(3))
    expect(trainingOffsets(99)).toEqual(trainingOffsets(3))
  })

  it('names a programme day for every training day it schedules', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      for (const offset of trainingOffsets(days)) {
        const entry = at(days, offset)
        expect(entry.kind === 'train' && entry.dayLabel, `${days}d +${offset}`).toMatch(/^Day \d$/)
      }
    }
  })

  it('gives every Aishwarya exercise a coaching cue', () => {
    for (const day of Object.values(AISHWARYA_PROGRAM)) {
      for (const ex of day.exercises) {
        expect(ex.cue, `${ex.name} is missing a cue`).toBeTruthy()
      }
    }
  })
  it('swap options are defined for every muscle group', () => {
    const groups = ['legs', 'shoulders', 'back', 'chest', 'arms', 'core']
    groups.forEach(g => {
      expect(SWAP_OPTIONS[g as keyof typeof SWAP_OPTIONS]).toBeDefined()
    })
  })
  it('library covers the program muscle groups', () => {
    // The Phase 1 program uses these groups (no dedicated arm work).
    const covered = ['legs', 'back', 'shoulders', 'chest', 'core']
    covered.forEach(g => {
      expect(SWAP_OPTIONS[g as keyof typeof SWAP_OPTIONS].length).toBeGreaterThan(0)
    })
  })
  it('exercise library is non-empty and deduped by name', () => {
    expect(EXERCISE_LIBRARY.length).toBeGreaterThan(0)
    const names = EXERCISE_LIBRARY.map(e => e.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('Exercises', () => {
  it('has 60+ exercises', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(60)
  })
  it('all exercises have required fields', () => {
    for (const e of EXERCISES) {
      expect(e.id).toBeTruthy()
      expect(e.name).toBeTruthy()
      expect(e.muscleGroup).toBeTruthy()
      expect(e.category).toBeTruthy()
    }
  })
  it('filters by muscle group', () => {
    const legs = getExercisesByMuscle('legs')
    expect(legs.length).toBeGreaterThan(0)
    legs.forEach(e => expect(e.muscleGroup).toBe('legs'))
  })
})

describe('Yoga Poses', () => {
  it('has 30+ poses', () => {
    expect(YOGA_POSES.length).toBeGreaterThanOrEqual(30)
  })
  it('all poses have required fields', () => {
    for (const p of YOGA_POSES) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.cues).toHaveLength(4)
    }
  })
  it('sequences have poses', () => {
    const preWorkout = getPosesBySequence('pre-workout')
    expect(preWorkout.length).toBeGreaterThan(0)
    const cooling = getPosesBySequence('pitta-cooling')
    expect(cooling.length).toBeGreaterThan(0)
  })
})

describe('Ayurveda Data', () => {
  it('has 10 Pitta remedies', () => {
    expect(PITTA_REMEDIES).toHaveLength(10)
  })
  it('all remedies have required fields', () => {
    for (const r of PITTA_REMEDIES) {
      expect(r.condition).toBeTruthy()
      expect(r.remedies.length).toBeGreaterThan(0)
      expect(r.herbs.length).toBeGreaterThan(0)
      expect(r.lifestyle).toBeTruthy()
    }
  })
  it('morning practices have ids', () => {
    for (const p of PITTA_DINACHARYA.morningPractices) {
      expect(p.id).toBeTruthy()
      expect(p.label).toBeTruthy()
    }
  })
})

describe('Vedic Remedies', () => {
  it('has 7 planetary remedies', () => {
    expect(VEDIC_REMEDIES).toHaveLength(7)
  })
  it('all remedies have affirmations', () => {
    for (const r of VEDIC_REMEDIES) {
      expect(r.affirmation).toBeTruthy()
      expect(r.meditation).toBeTruthy()
      expect(r.remedies.length).toBeGreaterThan(0)
    }
  })
})

describe('Drum Books', () => {
  it('has 13 books', () => {
    expect(DRUM_BOOKS).toHaveLength(13)
  })
  it('all books have lessons', () => {
    for (const book of DRUM_BOOKS) {
      expect(book.lessons.length).toBeGreaterThan(0)
    }
  })
  it('all lessons have required fields', () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.id).toBeTruthy()
      expect(lesson.concept).toBeTruthy()
      expect(lesson.practiceGoal).toBeTruthy()
    }
  })
})
