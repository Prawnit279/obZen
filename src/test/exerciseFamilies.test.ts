import { describe, it, expect } from 'vitest'
import {
  FAMILIES, FAMILY_MEMBERS, familyFor, groupByFamily,
} from '@/data/exercise-families'
import { EXERCISE_LIBRARY, toExerciseId, libraryFor, exerciseNameFor } from '@/data/obzen-program'
import { canonicalExerciseId, RENAMED_EXERCISE_IDS } from '@/data/exercise-renames'
import { motionFor } from '@/data/exercise-motions'
import { guideFor } from '@/data/exercise-guides'
import { barWeightLbFor } from '@/lib/barWeight'

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
    const orphans = Object.values(FAMILY_MEMBERS).flat().filter(id => !inLibrary.has(id))
    expect(orphans, `not in the library: ${orphans.join(', ')}`).toHaveLength(0)
  })

  it('gives every family a distinct label and at least one member', () => {
    // The old version of this read a lookup built by mapping FAMILIES over
    // itself, so it could not fail. Distinctness can: two families sharing a
    // label are indistinguishable in the picker.
    const labels = FAMILIES.map(f => f.label)
    expect(new Set(labels).size, `duplicate labels in: ${labels.join(', ')}`).toBe(labels.length)
    for (const family of FAMILIES) {
      expect(family.label.trim(), `${family.id} label`).not.toBe('')
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

  /**
   * Expected placements, written out independently of the data.
   *
   * Every other test here checks the categorisation against itself — that
   * nothing is unfiled, duplicated or orphaned — and all of them would pass
   * with `sumo-deadlift` filed under `hinge`. This is the one that would not.
   * At least one member per family, and every call that was judgement rather
   * than obvious.
   */
  const EXPECTED: Record<string, string> = {
    'barbell-squat': 'squat', 'leg-press': 'squat',
    'bulgarian-split-squat': 'lunge', 'walking-lunge': 'lunge',
    'deadlift': 'deadlift', 'sumo-deadlift': 'deadlift',
    'romanian-deadlift': 'hinge', 'kettlebell-swing': 'hinge',
    'hip-thrust-machine': 'hip-thrust',
    'cable-glute-kickback': 'glute-kickback',
    'seated-leg-curl': 'leg-curl',
    'leg-extension': 'leg-extension',
    'standing-calf-raises': 'calf-raise',
    'inner-thigh-machine': 'adduction',
    'pull-ups': 'pull-up', 'lat-pulldown': 'pull-up',
    'barbell-row': 'row', 't-bar-row': 'row',
    'shoulder-press-bar': 'overhead-press', 'barbell-push-press': 'overhead-press',
    'db-lateral-raises': 'lateral-raise',
    'dumbbell-front-raise': 'front-raise',
    'face-pull': 'rear-delt', 'rear-delt-fly-machine': 'rear-delt',
    'barbell-shrug': 'shrug', 'ez-bar-upright-row': 'shrug',
    'barbell-curls': 'curl', 'ez-bar-preacher-curl': 'curl',
    'ez-bar-skull-crusher': 'triceps-extension', 'cable-triceps': 'triceps-extension',
    'barbell-wrist-curl': 'wrist',
    'bench-press': 'bench-press', 'incline-chest-press-machine': 'bench-press',
    'bar-dips': 'dip',
    'push-up': 'push-up',
    'dumbbell-fly': 'fly', 'dumbbell-pullover': 'fly',
    'hanging-leg-raises': 'leg-raise',
    'cable-crunch': 'crunch',
    'plank': 'plank',
    'ab-wheel': 'ab-wheel',
    'cable-pallof-press': 'anti-rotation',
  }

  it('puts the variants where the categorisation says they go', () => {
    for (const [id, family] of Object.entries(EXPECTED)) {
      expect(familyFor(id), id).toBe(family)
    }
  })

  it('states an expectation for every family, so a new one cannot skip this', () => {
    const covered = new Set(Object.values(EXPECTED))
    const uncovered = FAMILIES.map(f => f.id).filter(id => !covered.has(id))
    expect(uncovered, `no expected placement written for: ${uncovered.join(', ')}`).toHaveLength(0)
  })

  it('leaves a custom movement ungrouped rather than guessing', () => {
    expect(familyFor('some-custom-movement')).toBeUndefined()
  })
})

describe('groupByFamily — what the picker actually renders', () => {
  const idOf = (ex: { name: string }) => toExerciseId(ex.name)

  it('loses nothing: every movement lands in exactly one bucket', () => {
    // The failure this guards is silent. A movement dropped by the grouping is
    // simply absent from the picker — no error, no empty state, nothing to see.
    const { groups, ungrouped } = groupByFamily(EXERCISE_LIBRARY, idOf)
    const rendered = [...groups.flatMap(g => g.members), ...ungrouped]
    expect(rendered).toHaveLength(EXERCISE_LIBRARY.length)
    expect(new Set(rendered.map(idOf)).size).toBe(EXERCISE_LIBRARY.length)
  })

  it('puts the whole catalog in a family, leaving the tail empty', () => {
    const { ungrouped } = groupByFamily(EXERCISE_LIBRARY, idOf)
    expect(ungrouped.map(idOf)).toEqual([])
  })

  it('keeps families in display order, and omits the empty ones', () => {
    const legs = EXERCISE_LIBRARY.filter(ex => ex.muscle === 'legs')
    const { groups } = groupByFamily(legs, idOf)
    const order = groups.map(g => g.family.id)
    const declared = FAMILIES.map(f => f.id).filter(id => order.includes(id))
    expect(order).toEqual(declared)
    expect(groups.every(g => g.members.length > 0)).toBe(true)
  })

  it('sends a movement it has never heard of to the ungrouped tail', () => {
    const custom = { name: 'Some Custom Movement' }
    const { groups, ungrouped } = groupByFamily([custom], idOf)
    expect(groups).toEqual([])
    expect(ungrouped).toEqual([custom])
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

  it('follows a rename through a legacy id that also needs normalising', () => {
    // `libraryFor` normalises punctuation for ids saved by older builds. An id
    // that needs both — normalising and then a rename — is the branch nothing
    // else reaches.
    expect(libraryFor('Reverse Pec Deck')?.name).toBe('Rear Delt Fly Machine')
    expect(libraryFor('reverse-pec-deck!')?.name).toBe('Rear Delt Fly Machine')
  })

  it('keeps the bar weight attached across a rename', () => {
    // barWeightLbFor resolves the id itself rather than borrowing motionFor, so
    // it needs its own guard: this is the lookup that silently drops 45 lb off
    // a lift's whole history if it stops following renames.
    for (const [from, to] of Object.entries(RENAMED_EXERCISE_IDS)) {
      expect(barWeightLbFor(from), `${from} → ${to}`).toBe(barWeightLbFor(to))
    }
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
