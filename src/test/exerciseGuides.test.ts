import { describe, it, expect } from 'vitest'
import { EXERCISE_MOTIONS, motionFor } from '@/data/exercise-motions'
import { EXERCISE_GUIDES, guideFor, coreDetailFor, MUSCLE_LABEL } from '@/data/exercise-guides'
import { EXERCISE_LIBRARY, toExerciseId } from '@/data/obzen-program'

const JOINTS = ['head', 'neck', 'hip', 'knee', 'ankle', 'elbow', 'hand'] as const

describe('exercise motions', () => {
  it('every motion has at least two poses so it actually moves', () => {
    for (const [id, m] of Object.entries(EXERCISE_MOTIONS)) {
      expect(m.poses.length, `${id} needs 2+ poses`).toBeGreaterThanOrEqual(2)
    }
  })

  it('every pose defines every joint, in-canvas', () => {
    for (const [id, m] of Object.entries(EXERCISE_MOTIONS)) {
      for (const p of m.poses) {
        for (const j of JOINTS) {
          const point = p[j]
          expect(point, `${id}.${j} missing`).toBeDefined()
          expect(point).toHaveLength(2)
          // Canvas is 200x150; allow a little overflow for hangs below the frame.
          expect(point[0], `${id}.${j} x off-canvas`).toBeGreaterThanOrEqual(0)
          expect(point[0], `${id}.${j} x off-canvas`).toBeLessThanOrEqual(200)
          expect(point[1], `${id}.${j} y off-canvas`).toBeGreaterThanOrEqual(0)
          expect(point[1], `${id}.${j} y off-canvas`).toBeLessThanOrEqual(160)
        }
      }
    }
  })

  it('poses actually differ — a motion that never moves is a bug', () => {
    for (const [id, m] of Object.entries(EXERCISE_MOTIONS)) {
      const first = JSON.stringify(m.poses[0])
      const moved = m.poses.slice(1).some(p => JSON.stringify(p) !== first)
      expect(moved, `${id} has identical poses`).toBe(true)
    }
  })

  it('every motion is captioned and has a sane duration', () => {
    for (const [id, m] of Object.entries(EXERCISE_MOTIONS)) {
      expect(m.caption.length, `${id} caption`).toBeGreaterThan(0)
      expect(m.durationSec).toBeGreaterThan(1)
      expect(m.durationSec).toBeLessThan(6)
    }
  })
})

describe('exercise guides', () => {
  it('every guide names at least one primary muscle', () => {
    for (const [id, g] of Object.entries(EXERCISE_GUIDES)) {
      expect(g.primary.length, `${id} primary`).toBeGreaterThan(0)
    }
  })

  it('every muscle id used has a display label', () => {
    for (const [id, g] of Object.entries(EXERCISE_GUIDES)) {
      for (const m of [...g.primary, ...(g.secondary ?? [])]) {
        expect(MUSCLE_LABEL[m], `${id} uses unlabelled muscle ${m}`).toBeTruthy()
      }
    }
  })

  it('a muscle is never both primary and secondary for one exercise', () => {
    for (const [id, g] of Object.entries(EXERCISE_GUIDES)) {
      const overlap = (g.secondary ?? []).filter(m => g.primary.includes(m))
      expect(overlap, `${id} lists ${overlap.join(',')} twice`).toHaveLength(0)
    }
  })

  it('falls back to the muscle group for an unknown exercise', () => {
    expect(guideFor('not-a-real-exercise', 'legs')?.primary.length).toBeGreaterThan(0)
    expect(guideFor('not-a-real-exercise', undefined)).toBeUndefined()
  })
})

describe('library coverage', () => {
  it('the exercises in the programmes all have a movement animation', () => {
    const missing = EXERCISE_LIBRARY
      .map(ex => toExerciseId(ex.name))
      .filter(id => !motionFor(id))
    expect(missing, `no animation for: ${missing.join(', ')}`).toHaveLength(0)
  })

  it('includes the movements added from the reference set', () => {
    const names = EXERCISE_LIBRARY.map(e => e.name)
    for (const n of ['Bar Dips', 'Pull-Ups', 'Chin-Ups', 'Barbell Curls', 'Zottman Curl',
                     'Barbell Rear Delt Row', 'Dumbbell Lateral Raises']) {
      expect(names, `${n} missing from library`).toContain(n)
    }
  })
})

describe('core lifts — the ones actually trained most', () => {
  const CORE = ['deadlift', 'barbell-squat', 'bench-press', 'hip-thrust-machine',
    'romanian-deadlift', 'pull-ups', 'leg-press', 'barbell-row', 'push-up',
    'hanging-leg-raises', 'bar-dips']

  it('each has a smoother 5-keyframe animation', () => {
    for (const id of CORE) {
      expect(motionFor(id)?.poses.length, `${id} keyframes`).toBeGreaterThanOrEqual(5)
    }
  })

  it('each has setup, common mistakes and success cues', () => {
    for (const id of CORE) {
      const d = coreDetailFor(id)
      expect(d?.setup?.length, `${id} setup`).toBeGreaterThan(0)
      expect(d?.mistakes?.length, `${id} mistakes`).toBeGreaterThan(0)
      expect(d?.cues?.length, `${id} cues`).toBeGreaterThan(0)
    }
  })

  it('every mistake pairs a fault with its fix', () => {
    for (const id of CORE) {
      for (const m of coreDetailFor(id)!.mistakes!) {
        expect(m.wrong.length).toBeGreaterThan(0)
        expect(m.fix.length).toBeGreaterThan(0)
      }
    }
  })

  it('variants inherit their parent lift detail', () => {
    // A back squat should get the squat guidance, a chin-up the pull-up's.
    expect(coreDetailFor('barbell-back-squat')).toBe(coreDetailFor('barbell-squat'))
    expect(coreDetailFor('chin-ups')).toBe(coreDetailFor('pull-ups'))
    expect(coreDetailFor('seated-cable-row')).toBe(coreDetailFor('barbell-row'))
    expect(coreDetailFor('assisted-dip')).toBe(coreDetailFor('bar-dips'))
  })

  it('leaves non-core movements without the extra detail', () => {
    expect(coreDetailFor('face-pull')).toBeUndefined()
  })
})

describe('drawing angle', () => {
  /** Mirrors the renderer's rule; see isProfileView in ExerciseAnimation. */
  const drawsInProfile = (id: string) => {
    const m = EXERCISE_MOTIONS[id]
    if (m.view === 'side') return true
    return Math.abs(m.poses[0].hip[1] - m.poses[0].neck[1]) < 18
  }

  it('draws hinges and rows in profile, where the hip angle is visible', () => {
    const hingesAndRows = [
      'deadlift', 'sumo-deadlift', 'trap-bar-deadlift', 'kettlebell-deadlift',
      'romanian-deadlift', 'dumbbell-rdl', 'single-leg-rdl', 'good-morning',
      'cable-pull-through', 'barbell-row', 'seated-cable-row', 'machine-row',
      'one-arm-db-row', 'chest-supported-row', 'inverted-row',
      'barbell-rear-delt-row', 'dumbbell-rear-delt-row',
    ]
    for (const id of hingesAndRows) {
      expect(drawsInProfile(id), `${id} should be drawn in profile`).toBe(true)
    }
  })

  it('draws lying movements in profile without needing a flag', () => {
    // Their geometry gives them away: no vertical room to draw a front figure.
    for (const id of ['bench-press', 'leg-press', 'dead-bug', 'push-up']) {
      expect(EXERCISE_MOTIONS[id].view, `${id} should not need a flag`).toBeUndefined()
      expect(drawsInProfile(id), `${id} should be drawn in profile`).toBe(true)
    }
  })

  it('keeps upright movements facing the viewer', () => {
    for (const id of ['barbell-squat', 'pull-ups', 'db-shoulder-press', 'db-lateral-raises', 'goblet-squat']) {
      expect(drawsInProfile(id), `${id} should face forward`).toBe(false)
    }
  })
})
