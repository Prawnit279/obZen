/**
 * The backup summary must describe the training the file actually contains.
 *
 * It used to be computed from `workoutSessions` / `exerciseLogs` — the legacy
 * pair, empty on every current install — so a real export of months of training
 * reported "0 sessions, 0 exercises, date range —". The data was always intact
 * in `workoutDaySessions`; only the summary lied, which is worse than an
 * obvious failure because it looks like data loss.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/db/dexie'
import { exportAllDataAsJSON } from '@/lib/export'
import { libraryFor, exerciseNameFor, trackingModeFor } from '@/data/obzen-program'
import type { LoggedSet } from '@/db/dexie'

const set = (weight: number, reps: number): LoggedSet =>
  ({ setNumber: 1, weight, reps, unit: 'lbs', timestamp: '2026-05-02T17:00:00.000Z' })

/** A placeholder row exactly as the logger persists it before the user types. */
const placeholder: LoggedSet = { setNumber: 1, weight: 0, reps: 0, unit: 'lbs', timestamp: '' }

beforeEach(async () => {
  await db.delete()
  await db.open()
})

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * `exportAllDataAsJSON` writes a file rather than returning one, so intercept
 * the object URL it builds and read the payload back out of that Blob. Testing
 * the shipped function keeps the download path covered too.
 */
async function summary() {
  let captured: Blob | undefined
  const createObjectURL = vi.fn((blob: Blob) => { captured = blob; return 'blob:test' })
  // jsdom implements neither of these, so define rather than spy.
  Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true })
  Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  await exportAllDataAsJSON()

  expect(createObjectURL).toHaveBeenCalledOnce()
  return JSON.parse(await readBlob(captured!)).summary.workout
}

/** jsdom's Blob implements neither text() nor stream(); FileReader it does. */
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

describe('export summary — counts real training', () => {
  it('reports sessions, exercises and range from day sessions', async () => {
    await db.workoutDaySessions.bulkAdd([
      {
        date: '2026-05-02', dayLabel: 'Day 2', order: ['leg-press', 'deadlift'],
        exercises: [
          { exerciseId: 'leg-press', status: 'complete', sets: [set(90, 10), set(140, 10)] },
          { exerciseId: 'deadlift', status: 'complete', sets: [set(100, 5)] },
        ],
      },
      {
        date: '2026-09-06', dayLabel: 'Day 1', order: ['barbell-squat'],
        exercises: [{ exerciseId: 'barbell-squat', status: 'complete', sets: [set(90, 5)] }],
      },
    ])

    const s = await summary()
    expect(s.totalSessions).toBe(2)
    expect(s.totalExercisesLogged).toBe(3)
    expect(s.dateRange).toBe('2026-05-02 to 2026-09-06')
    expect(s.topExercises.length).toBeGreaterThan(0)
  })

  it('excludes sessions that were opened but never logged', async () => {
    await db.workoutDaySessions.bulkAdd([
      {
        date: '2026-05-03', dayLabel: 'Day 1', order: ['leg-press'],
        exercises: [{ exerciseId: 'leg-press', status: 'pending', sets: [] }],
      },
      {
        date: '2026-05-04', dayLabel: 'Day 1', order: ['leg-press'],
        exercises: [{ exerciseId: 'leg-press', status: 'pending', sets: [placeholder] }],
      },
    ])
    const s = await summary()
    expect(s.totalSessions).toBe(0)
    expect(s.totalExercisesLogged).toBe(0)
    expect(s.dateRange).toBe('—')
  })

  it('names exercises rather than listing raw ids', async () => {
    await db.workoutDaySessions.add({
      date: '2026-05-02', dayLabel: 'Day 1', order: ['deadlift'],
      exercises: [{ exerciseId: 'deadlift', status: 'complete', sets: [set(100, 5)] }],
    })
    const s = await summary()
    expect(s.topExercises[0]).toEqual({ name: 'Deadlift', timesLogged: 1 })
  })
})

describe('libraryFor — ids saved by older builds still resolve', () => {
  it('recovers an id that kept its punctuation', () => {
    // Real id from a 2026-05 backup; toExerciseId strips the parentheses.
    expect(libraryFor('shoulder-press-(bar)')).toBeDefined()
    expect(exerciseNameFor('shoulder-press-(bar)')).toBe('Shoulder Press (Bar)')
  })

  it('gives a recovered id its real tracking mode, not the default', () => {
    expect(trackingModeFor('assisted-pull-up')).toBe('assisted')
    // A punctuated legacy form resolves to the same entry.
    expect(libraryFor('assisted-pull-up')?.name).toBe('Assisted Pull-Up')
  })

  it('still returns undefined for a genuinely unknown movement', () => {
    expect(libraryFor('not-a-real-lift')).toBeUndefined()
    expect(exerciseNameFor('not-a-real-lift')).toBe('not-a-real-lift')
  })

  it('resolves every exercise id in the 2026-09-06 backup', () => {
    const ids = [
      'leg-press', 'weighted-pull-ups', 'barbell-row', 'db-lateral-raises', 'cable-bicep-curls',
      'cable-triceps', 'standing-calf-raises', 'bar-knee-raises', 'leg-extension', 'barbell-squat',
      'zercher-squat', 'shoulder-press-(bar)', 'db-shoulder-press', 'weighted-push-ups',
      'russian-twists', 'hanging-leg-raises', 'deadlift', 'romanian-deadlift',
      'rear-delt-raises', 'hammer-curls',
    ]
    expect(ids.filter(id => !libraryFor(id))).toEqual([])
  })
})
