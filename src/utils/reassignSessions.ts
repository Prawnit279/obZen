/**
 * Move workout sessions from one profile to another on this device.
 *
 * Needed because the app defaults to Pronit and, before the Train header showed
 * the active profile, a workout could be logged under the wrong name without
 * any visible cue. On a single-user device every session belongs to that
 * person, so a bulk move is the fix.
 *
 * Rows saved before profiles existed carry no `profileId` and resolve to
 * `LEGACY_PROFILE_ID`; `sessionProfile` is used throughout so those are matched
 * and stamped explicitly rather than left ambiguous.
 */

import { db } from '@/db/dexie'
import { sessionProfile } from '@/lib/workoutSession'

export interface ReassignPreview {
  /** Sessions currently attributed to the source profile. */
  count: number
  /** Date range of those sessions, oldest first — empty when none. */
  dates: string[]
}

/** How many sessions a move would affect, without changing anything. */
export async function previewReassign(fromProfileId: string): Promise<ReassignPreview> {
  const all = await db.workoutDaySessions.toArray()
  const matching = all.filter(s => sessionProfile(s) === fromProfileId)
  return {
    count: matching.length,
    dates: matching.map(s => s.date).sort(),
  }
}

/**
 * Reassign every session owned by `fromProfileId` to `toProfileId`.
 * Returns the number of rows moved. A no-op when the two ids are equal.
 */
export async function reassignSessions(fromProfileId: string, toProfileId: string): Promise<number> {
  if (fromProfileId === toProfileId) return 0

  return db.transaction('rw', db.workoutDaySessions, async () => {
    const all = await db.workoutDaySessions.toArray()
    const matching = all.filter(s => sessionProfile(s) === fromProfileId && s.id != null)
    if (matching.length === 0) return 0

    // bulkPut rather than per-row update so the whole move is one atomic write.
    await db.workoutDaySessions.bulkPut(
      matching.map(s => ({ ...s, profileId: toProfileId }))
    )
    return matching.length
  })
}
