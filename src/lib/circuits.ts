/**
 * Circuits — a handful of exercises worked in rounds rather than one at a time.
 *
 * The limits are the point. A circuit long enough to forget the start of is not
 * a circuit, and rounds outside a narrow band stop being one too, so both are
 * enforced here rather than left to the caller to remember.
 */

import type { Circuit, ExerciseSessionState, WorkoutDaySession } from '@/db/dexie'

/** Past this a circuit is just the session. */
export const MAX_CIRCUIT_EXERCISES = 5
export const MIN_CIRCUIT_ROUNDS = 3
export const MAX_CIRCUIT_ROUNDS = 4

export function isValidRounds(rounds: number): boolean {
  return Number.isInteger(rounds)
    && rounds >= MIN_CIRCUIT_ROUNDS
    && rounds <= MAX_CIRCUIT_ROUNDS
}

/** The exercises in a circuit, in the order the session holds them. */
export function circuitMembers(
  session: WorkoutDaySession,
  circuitId: string
): ExerciseSessionState[] {
  return session.exercises.filter(e => e.circuitId === circuitId)
}

/** Whether another exercise will fit. */
export function canAddToCircuit(session: WorkoutDaySession, circuitId: string): boolean {
  return circuitMembers(session, circuitId).length < MAX_CIRCUIT_EXERCISES
}

/**
 * Circuits with nothing left in them.
 *
 * Removing the last exercise leaves a circuit that renders as an empty heading
 * and counts toward nothing, so callers sweep these rather than leaving them.
 */
export function emptyCircuitIds(session: WorkoutDaySession): string[] {
  return (session.circuits ?? [])
    .filter(c => circuitMembers(session, c.id).length === 0)
    .map(c => c.id)
}

/** Adds a circuit and moves the given exercises into it. Immutable. */
export function addCircuit(
  session: WorkoutDaySession,
  circuit: Circuit,
  exerciseIds: string[]
): WorkoutDaySession {
  const taking = exerciseIds.slice(0, MAX_CIRCUIT_EXERCISES)
  return {
    ...session,
    circuits: [...(session.circuits ?? []), circuit],
    exercises: session.exercises.map(e =>
      taking.includes(e.exerciseId) ? { ...e, circuitId: circuit.id } : e),
  }
}

/**
 * Removes a circuit, leaving its exercises in the session as ordinary ones.
 *
 * Deleting the exercises with it would lose logged sets, which is never what
 * "ungroup these" means.
 */
export function removeCircuit(session: WorkoutDaySession, circuitId: string): WorkoutDaySession {
  return {
    ...session,
    circuits: (session.circuits ?? []).filter(c => c.id !== circuitId),
    exercises: session.exercises.map(e =>
      e.circuitId === circuitId ? { ...e, circuitId: undefined } : e),
  }
}

/** Changes how many rounds a circuit runs. Out-of-range values are refused. */
export function setCircuitRounds(
  session: WorkoutDaySession,
  circuitId: string,
  rounds: number
): WorkoutDaySession {
  if (!isValidRounds(rounds)) return session
  return {
    ...session,
    circuits: (session.circuits ?? []).map(c => (c.id === circuitId ? { ...c, rounds } : c)),
  }
}

/** Takes one exercise out of its circuit, leaving the rest alone. */
export function removeFromCircuit(
  session: WorkoutDaySession,
  exerciseId: string
): WorkoutDaySession {
  return {
    ...session,
    exercises: session.exercises.map(e =>
      e.exerciseId === exerciseId ? { ...e, circuitId: undefined } : e),
  }
}

/**
 * The circuit an exercise belongs to, or null when it stands on its own.
 *
 * Null rather than a circuit of one: standing alone is the ordinary case, and
 * the logger changes what it says only when there really are rounds to count.
 *
 * A dangling `circuitId` — a member whose circuit has been removed but which
 * has not been swept yet — also reads as null. Storage outlives the grouping,
 * and an exercise pointing at nothing is ungrouped in every way that matters.
 */
export function circuitFor(
  session: WorkoutDaySession,
  exerciseId: string
): Circuit | null {
  const entry = session.exercises.find(e => e.exerciseId === exerciseId)
  if (!entry?.circuitId) return null
  return (session.circuits ?? []).find(c => c.id === entry.circuitId) ?? null
}

/**
 * What to call each row of a circuit exercise.
 *
 * A set inside a circuit is a time through it, so the rows are rounds. The
 * labels follow the rows that exist rather than the rounds declared: logging a
 * fifth set in a four-round circuit is a fifth time through, not an error, and
 * capping the label there would leave two rows both reading "Round 4".
 *
 * Which is why the declared round count is not a parameter — it would only
 * ever have been ignored.
 */
export function roundLabels(rowCount: number): string[] {
  return Array.from({ length: rowCount }, (_, i) => `Round ${i + 1}`)
}
