import type { WorkoutDaySession, ExerciseSessionState } from '@/db/dexie'

/**
 * Sessions logged before profiles existed carry no profileId. They were all
 * Aishwarya's Phase 1 workouts, so they're attributed to her.
 */
export const LEGACY_PROFILE_ID = 'aishwarya'

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
