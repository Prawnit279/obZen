import { describe, it, expect } from 'vitest'
import { RUDIMENTS, getRudimentsByFamily, getRudimentsByDifficulty } from '@/data/rudiments'
import { OBZEN_PROGRAM, SWAP_OPTIONS } from '@/data/obzen-program'
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
  it('has 3 training days', () => {
    expect(Object.keys(OBZEN_PROGRAM)).toHaveLength(3)
  })
  it('each day has exercises', () => {
    for (const day of Object.values(OBZEN_PROGRAM)) {
      expect(day.exercises.length).toBeGreaterThan(0)
      expect(day.focus).toBeTruthy()
    }
  })
  it('all swap options cover expected muscle groups', () => {
    const groups = ['legs', 'shoulders', 'back', 'chest', 'arms', 'core']
    groups.forEach(g => {
      expect(SWAP_OPTIONS[g as keyof typeof SWAP_OPTIONS]).toBeDefined()
      expect(SWAP_OPTIONS[g as keyof typeof SWAP_OPTIONS].length).toBeGreaterThan(0)
    })
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
