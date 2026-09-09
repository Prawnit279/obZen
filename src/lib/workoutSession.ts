import type { WorkoutDaySession, ExerciseSessionState } from '@/db/dexie'

/**
 * Sessions logged before profiles existed carry no profileId, and resolve to
 * the one profile that remains.
 *
 * This filter is also what retires the app's former second profile: those rows
 * are stamped with an id nothing matches any more, so they stay in the database
 * and in backups while being invisible to every read path.
 */
export const LEGACY_PROFILE_ID = 'pronit'

export function sessionProfile(s: WorkoutDaySession): string {
  return s.profileId ?? LEGACY_PROFILE_ID
}

export function belongsToProfile(s: WorkoutDaySession, profileId: string): boolean {
  return sessionProfile(s) === profileId
}

/** An exercise counts as "done" if it was marked complete or has any logged set. */
export function isExerciseLogged(e: ExerciseSessionState): boolean {
  return e.status === 'complete' || e.sets.length > 0
}

/**
 * True when a day session represents real training — the workout was completed,
 * or at least one exercise was done. Empty/placeholder sessions (opened but
 * never logged) return false so they stay out of history and the week view.
 */
export function sessionHasActivity(s: WorkoutDaySession): boolean {
  return !!s.completedAt || s.exercises.some(isExerciseLogged)
}

/** Only the exercises the user actually did (complete or with logged sets). */
export function loggedExercises(s: WorkoutDaySession): ExerciseSessionState[] {
  return s.exercises.filter(isExerciseLogged)
}

/** Total logged sets across all exercises in a session. */
export function totalSets(s: WorkoutDaySession): number {
  return s.exercises.reduce((n, e) => n + e.sets.length, 0)
}
