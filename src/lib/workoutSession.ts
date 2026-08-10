import type { WorkoutDaySession, ExerciseSessionState } from '@/db/dexie'

/**
 * Sessions logged before profiles existed carry no profileId. The app was
 * single-user up to that point and all of that history is Pronit's, so
 * unstamped rows are attributed to him.
 *
 * This only affects rows with no profileId, which by definition predate the
 * profile feature — a device that started using the app after profiles shipped
 * has none, so nothing is ever misattributed on a new user's device.
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
