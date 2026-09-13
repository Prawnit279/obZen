import { describe, it, expect } from 'vitest'
import {
  FAMILIES, FAMILY_MEMBERS, FAMILY_BY_EXERCISE, FAMILY_LABEL, familyFor,
} from '@/data/exercise-families'
import { EXERCISE_LIBRARY, toExerciseId, libraryFor, exerciseNameFor } from '@/data/obzen-program'
import { canonicalExerciseId, RENAMED_EXERCISE_IDS } from '@/data/exercise-renames'
import { motionFor } from '@/data/exercise-motions'
import { guideFor } from '@/data/exercise-guides'

describe('exercise families', () => {
  it('files every movement in the library', () => {
    // The point of the grouping is that the picker has no ungrouped remainder.
    // A library addition without a family would silently vanish from the list.
    const missing = EXERCISE_LIBRARY
      .map(ex => toExerciseId(ex.name))
      .filter(id => !familyFor(id))
    expect(missing, `no family for: ${missing.join(', ')}`).toHaveLength(0)
  })

  it('files each movement exactly once', () => {
    const seen = new Map<string, string>()
    const twice: string[] = []
    for (const [family, ids] of Object.entries(FAMILY_MEMBERS)) {
      for (const id of ids) {
        if (seen.has(id)) twice.push(`${id} (${seen.get(id)} + ${family})`)
        seen.set(id, family)
      }
    }
    expect(twice, `filed twice: ${twice.join(', ')}`).toHaveLength(0)
  })

  it('lists no movement the library does not have', () => {
    // Guards the other direction: a renamed or dropped exercise leaves a member
    // id behind that matches nothing, and the family quietly shrinks.
    const inLibrary = new Set(EXERCISE_LIBRARY.map(ex => toExerciseId(ex.name)))
    const orphans = Object.keys(FAMILY_BY_EXERCISE).filter(id => !inLibrary.has(id))
    expect(orphans, `not in the library: ${orphans.join(', ')}`).toHaveLength(0)
  })

  it('gives every family a label and at least one member', () => {
    for (const family of FAMILIES) {
      expect(FAMILY_LABEL[family.id], `${family.id} label`).toBeTruthy()
      expect(FAMILY_MEMBERS[family.id]?.length, `${family.id} members`).toBeGreaterThan(0)
    }
  })

  it('declares every family it files movements into', () => {
    const declared = new Set(FAMILIES.map(f => f.id))
    const undeclared = Object.keys(FAMILY_MEMBERS).filter(id => !declared.has(id as never))
    expect(undeclared, `undeclared: ${undeclared.join(', ')}`).toHaveLength(0)
  })

  it('keeps a family inside one muscle group, which is what the chips assume', () => {
    // The picker filters by muscle and then groups; a family spanning two
    // groups would appear under both, half-empty each time.
    const muscleOf = new Map(EXERCISE_LIBRARY.map(ex => [toExerciseId(ex.name), ex.muscle]))
    const split: string[] = []
    for (const [family, ids] of Object.entries(FAMILY_MEMBERS)) {
      const muscles = new Set(ids.map(id => muscleOf.get(id)).filter(Boolean))
      if (muscles.size > 1) split.push(`${family} (${[...muscles].join(', ')})`)
    }
    expect(split, `spans muscle groups: ${split.join(', ')}`).toHaveLength(0)
  })

  it('puts the variants where the categorisation says they go', () => {
    // The calls that were judgement rather than obvious.
    expect(familyFor('leg-press')).toBe('squat')
    expect(familyFor('bulgarian-split-squat')).toBe('lunge')
    expect(familyFor('romanian-deadlift')).toBe('hinge')
    expect(familyFor('kettlebell-swing')).toBe('hinge')
    expect(familyFor('sumo-deadlift')).toBe('deadlift')
    expect(familyFor('lat-pulldown')).toBe('pull-up')
    expect(familyFor('ez-bar-upright-row')).toBe('shrug')
    expect(familyFor('ez-bar-skull-crusher')).toBe('triceps-extension')
  })

  it('leaves a custom movement ungrouped rather than guessing', () => {
    expect(familyFor('some-custom-movement')).toBeUndefined()
  })
})

describe('renamed movements keep their history', () => {
  // Sessions store the slug of the name they were logged under, and nothing
  // rewrites it. Every lookup a logged id reaches has to follow the rename, or
  // the set survives in the database and disappears from the app.
  const OLD = 'reverse-pec-deck'
  const NEW = 'rear-delt-fly-machine'

  it('resolves an old id to the renamed catalog entry', () => {
    expect(canonicalExerciseId(OLD)).toBe(NEW)
    expect(libraryFor(OLD)?.name).toBe('Rear Delt Fly Machine')
    expect(exerciseNameFor(OLD)).toBe('Rear Delt Fly Machine')
  })

  it('still finds the animation and the guide', () => {
    expect(motionFor(OLD)).toBeDefined()
    expect(motionFor(OLD)).toBe(motionFor(NEW))
    expect(guideFor(OLD, 'shoulders')).toEqual(guideFor(NEW, 'shoulders'))
  })

  it('leaves an id that was never renamed alone', () => {
    expect(canonicalExerciseId('barbell-squat')).toBe('barbell-squat')
    expect(canonicalExerciseId('some-custom-movement')).toBe('some-custom-movement')
  })

  it('points every rename at a movement that exists', () => {
    for (const [from, to] of Object.entries(RENAMED_EXERCISE_IDS)) {
      expect(libraryFor(to), `${from} → ${to} is not in the library`).toBeDefined()
      expect(libraryFor(from)).toBe(libraryFor(to))
    }
  })
})
