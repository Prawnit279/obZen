/**
 * importWorkoutData — one-time migration helper.
 *
 * Fetches /obZen_workout_import.json from the public directory, strips all
 * auto-increment id fields so Dexie assigns fresh ones, and writes the records
 * into IndexedDB inside a single atomic transaction.
 *
 * Duplicate prevention: a sentinel row is written to the meta table after a
 * successful import. Calling the function again simply returns { skipped: true }.
 *
 * Expected JSON shape:
 * {
 *   "workoutSessions":     [{ date, dayLabel, duration?, notes?, completedAt?, ...extras }],
 *   "exerciseLogs":        [{ sessionId, exerciseId, exerciseName, date, sets[], injuryFlag?, skipped? }],
 *   "workoutDaySessions":  [{ date, dayLabel, exercises[], order[] }]   // optional
 * }
 *
 * sessionId values in exerciseLogs must match the id values (or array position
 * when id is absent) of the corresponding workoutSessions entry.
 */

import { db } from '@/db/dexie'
import type { WorkoutSession, ExerciseLog, WorkoutDaySession } from '@/db/dexie'

const SENTINEL_KEY = 'workout-historical-import-v1'

export interface ImportWorkoutResult {
  sessions: number
  exercises: number
  daySessions: number
  skipped: boolean
}

// ── Internal types for the raw JSON payload ───────────────────────────────────

interface RawSession extends Omit<WorkoutSession, 'id'> {
  id?: number | string
}

interface RawExerciseLog extends Omit<ExerciseLog, 'id' | 'sessionId'> {
  id?: number | string
  sessionId: number | string
}

interface RawDaySession extends Omit<WorkoutDaySession, 'id'> {
  id?: number | string
}

interface ImportPayload {
  workoutSessions?: RawSession[]
  exerciseLogs?: RawExerciseLog[]
  workoutDaySessions?: RawDaySession[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return a shallow copy of obj with the `id` key removed. */
function withoutId(obj: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...obj }
  delete copy['id']
  return copy
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function importWorkoutData(): Promise<ImportWorkoutResult> {
  // ── 1. Duplicate guard ──────────────────────────────────────────────────────
  const alreadyDone = await db.meta.where('key').equals(SENTINEL_KEY).count()
  if (alreadyDone > 0) {
    return { sessions: 0, exercises: 0, daySessions: 0, skipped: true }
  }

  // ── 2. Fetch and validate payload ───────────────────────────────────────────
  const res = await fetch('/obZen_workout_import.json')
  if (!res.ok) {
    throw new Error(
      `Could not load import file (HTTP ${res.status}). ` +
      'Place obZen_workout_import.json in the /public folder and try again.'
    )
  }

  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    throw new Error('obZen_workout_import.json contains invalid JSON.')
  }

  if (typeof payload !== 'object' || payload === null) {
    throw new Error('obZen_workout_import.json must be a JSON object.')
  }

  const {
    workoutSessions:    rawSessions    = [],
    exerciseLogs:       rawLogs        = [],
    workoutDaySessions: rawDaySessions = [],
  } = payload as ImportPayload

  // ── 3. Import inside one transaction ────────────────────────────────────────
  let sessionCount    = 0
  let exerciseCount   = 0
  let daySessionCount = 0

  await db.transaction('rw', [
    db.workoutSessions,
    db.workoutDaySessions,
    db.exerciseLogs,
    db.meta,
  ], async () => {

    // -- Sessions ---------------------------------------------------------------
    if (rawSessions.length > 0) {
      const sessionRows = rawSessions.map(s =>
        withoutId(s as unknown as Record<string, unknown>) as Omit<WorkoutSession, 'id'>
      )
      // bulkAdd returns the auto-assigned keys in insertion order
      const newIds = (await db.workoutSessions.bulkAdd(
        sessionRows as WorkoutSession[],
        { allKeys: true }
      )) as number[]

      sessionCount = newIds.length

      // Build old-sessionId → new-Dexie-id map for exerciseLogs remapping.
      // Each session contributes exactly one key so entries never collide:
      //  • If every session declares an explicit id, map by that id.
      //  • Otherwise sessionIds are positional — detect a single 0-based or
      //    1-based scheme (a log referencing 0 implies 0-based) and map with it.
      const idMap = new Map<number | string, number>()
      const allHaveIds = rawSessions.every(s => s.id !== undefined)
      const zeroBased = rawLogs.some(log => log.sessionId === 0)
      rawSessions.forEach((s, i) => {
        const key = allHaveIds ? s.id! : (zeroBased ? i : i + 1)
        idMap.set(key, newIds[i])
      })

      // -- Exercise logs ----------------------------------------------------------
      if (rawLogs.length > 0) {
        const logRows = rawLogs.map(log => {
          const base = withoutId(log as unknown as Record<string, unknown>)
          // Remap sessionId to the new auto-assigned integer
          const mappedId = idMap.get(log.sessionId)
          return {
            ...base,
            sessionId: mappedId !== undefined ? mappedId : (log.sessionId as number),
          } as Omit<ExerciseLog, 'id'>
        })
        await db.exerciseLogs.bulkAdd(logRows as ExerciseLog[])
        exerciseCount = logRows.length
      }
    }

    // -- WorkoutDaySessions (optional) ------------------------------------------
    if (rawDaySessions.length > 0) {
      const dayRows = rawDaySessions.map(d =>
        withoutId(d as unknown as Record<string, unknown>) as Omit<WorkoutDaySession, 'id'>
      )
      await db.workoutDaySessions.bulkAdd(dayRows as WorkoutDaySession[])
      daySessionCount = dayRows.length
    }

    // -- Sentinel ---------------------------------------------------------------
    await db.meta.add({ key: SENTINEL_KEY, value: new Date().toISOString() })
  })

  return {
    sessions:    sessionCount,
    exercises:   exerciseCount,
    daySessions: daySessionCount,
    skipped:     false,
  }
}
