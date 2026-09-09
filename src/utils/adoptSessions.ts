/**
 * Adopting workouts that belong to no profile this app still has.
 *
 * obZen used to carry two named people. Sessions logged then, or restored from
 * a backup written then, are stamped with an id the app no longer recognises —
 * so `belongsToProfile` filters them out of every screen while they sit intact
 * in the database. Importing such a file looks like it worked, because it did:
 * the rows are there and the count is right. They are simply invisible.
 *
 * Imports adopt automatically now (see `lib/export.ts`). This is for the rows
 * that were already stored before that changed.
 */

import { db } from '@/db/dexie'
import { PROFILE_ID } from '@/config/profiles'
import { sessionProfile } from '@/lib/workoutSession'
import type { WorkoutDaySession } from '@/db/dexie'

/** A stranded session: real training, stamped with an id nothing matches. */
function isStranded(s: WorkoutDaySession): boolean {
  return sessionProfile(s) !== PROFILE_ID
}

export interface AdoptPreview {
  count: number
  /** Distinct profile ids found, for telling the user whose these were. */
  profileIds: string[]
  /** Earliest and latest dates among them, or null when there are none. */
  range: { from: string; to: string } | null
}

/** What `adoptStrandedSessions` would take on, without changing anything. */
export async function previewStranded(): Promise<AdoptPreview> {
  const stranded = (await db.workoutDaySessions.toArray()).filter(isStranded)
  if (stranded.length === 0) return { count: 0, profileIds: [], range: null }

  const dates = stranded.map(s => s.date).sort()
  return {
    count: stranded.length,
    profileIds: [...new Set(stranded.map(sessionProfile))].sort(),
    range: { from: dates[0], to: dates[dates.length - 1] },
  }
}

/**
 * Restamp every stranded session as this profile's, and return how many moved.
 *
 * Rows are rewritten rather than merged: a session already carrying a foreign
 * id cannot collide with one of this profile's, because the two were never
 * visible to each other. Where the same day already exists under this profile,
 * both remain — history is additive here, and silently dropping one of them
 * would lose training that the user explicitly asked to recover.
 */
export async function adoptStrandedSessions(): Promise<number> {
  return db.transaction('rw', db.workoutDaySessions, async () => {
    const stranded = (await db.workoutDaySessions.toArray()).filter(isStranded)
    for (const s of stranded) {
      await db.workoutDaySessions.put({ ...s, profileId: PROFILE_ID })
    }
    return stranded.length
  })
}
