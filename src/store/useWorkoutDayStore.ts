import { create } from 'zustand'
import { db } from '@/db/dexie'
import type { WorkoutDaySession, ExerciseSessionState, LoggedSet } from '@/db/dexie'
import { todayISO } from '@/lib/utils'
import { OBZEN_PROGRAM, formatTarget, toExerciseId } from '@/data/obzen-program'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build session-state rows from a day template (name/muscle/target persisted). */
function buildTemplateExercises(dayLabel: 'Day 1' | 'Day 2' | 'Day 3'): ExerciseSessionState[] {
  const program = OBZEN_PROGRAM[dayLabel]
  if (!program) return []
  return program.exercises.map(ex => ({
    exerciseId: toExerciseId(ex.name),
    name: ex.name,
    muscle: ex.muscle,
    target: formatTarget(ex.sets, ex.reps, ex.rest),
    status: 'pending' as const,
    sets: [],
    addedFrom: dayLabel,
  }))
}

// ---------------------------------------------------------------------------
// Store state / actions
// ---------------------------------------------------------------------------

interface WorkoutDayState {
  // sessions keyed by `${dayLabel}::${date}`
  sessions: Record<string, WorkoutDaySession>
  loading: boolean

  loadSession: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', date?: string) => Promise<void>
  loadTemplate: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', date?: string) => Promise<void>
  completeSession: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', date?: string) => Promise<void>
  updateExerciseStatus: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, status: ExerciseSessionState['status'], date?: string) => Promise<void>
  addLoggedSet: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, set: LoggedSet, date?: string) => Promise<void>
  updateLoggedSet: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, setIndex: number, set: LoggedSet, date?: string) => Promise<void>
  removeLoggedSet: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, setIndex: number, date?: string) => Promise<void>
  reorderExercises: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', newOrder: string[], date?: string) => Promise<void>
  addExercise: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exercise: ExerciseSessionState, date?: string) => Promise<void>
  setExerciseNote: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, note: string, date?: string) => Promise<void>
  updateExerciseUnit: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, unit: 'lbs' | 'kg', date?: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWorkoutDayStore = create<WorkoutDayState>((set, get) => ({
  sessions: {},
  loading: false,

  loadSession: async (dayLabel, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    if (get().sessions[key]) return // already loaded

    set({ loading: true })
    try {
      const existing = await db.workoutDaySessions
        .where('date').equals(date)
        .filter(s => s.dayLabel === dayLabel)
        .first()

      if (existing) {
        set(s => ({ sessions: { ...s.sessions, [key]: existing }, loading: false }))
      } else {
        // Days start empty — the user loads a template or adds from the library.
        const newSession: WorkoutDaySession = {
          date,
          dayLabel,
          exercises: [],
          order: [],
        }
        const id = await db.workoutDaySessions.add(newSession) as number
        const withId = { ...newSession, id }
        set(s => ({ sessions: { ...s.sessions, [key]: withId }, loading: false }))
      }
    } catch {
      set({ loading: false })
    }
  },

  // Load a day template as a starting point. Non-destructive: appends any
  // template exercise not already present and stamps the focus label.
  loadTemplate: async (dayLabel, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const existingIds = new Set(session.exercises.map(e => e.exerciseId))
    const additions = buildTemplateExercises(dayLabel).filter(e => !existingIds.has(e.exerciseId))
    if (additions.length === 0 && session.focus) return

    const exercises = [...session.exercises, ...additions]
    const order = [...session.order, ...additions.map(e => e.exerciseId)]
    const focus = session.focus ?? OBZEN_PROGRAM[dayLabel]?.focus
    const updated = { ...session, exercises, order, focus }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises, order, focus })
  },

  // Mark the day's workout complete (stamps completedAt for history/streaks).
  completeSession: async (dayLabel, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const completedAt = new Date().toISOString()
    const focus = session.focus ?? OBZEN_PROGRAM[dayLabel]?.focus
    const updated = { ...session, completedAt, focus }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { completedAt, focus })
  },

  updateExerciseStatus: async (dayLabel, exerciseId, status, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const exercises = session.exercises.map(e =>
      e.exerciseId === exerciseId ? { ...e, status } : e
    )
    const updated = { ...session, exercises }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises })
  },

  addLoggedSet: async (dayLabel, exerciseId, loggedSet, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const exercises = session.exercises.map(e => {
      if (e.exerciseId !== exerciseId) return e
      return { ...e, sets: [...e.sets, loggedSet] }
    })
    const updated = { ...session, exercises }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises })
  },

  updateLoggedSet: async (dayLabel, exerciseId, setIndex, loggedSet, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const exercises = session.exercises.map(e => {
      if (e.exerciseId !== exerciseId) return e
      const sets = e.sets.map((s, i) => i === setIndex ? loggedSet : s)
      return { ...e, sets }
    })
    const updated = { ...session, exercises }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises })
  },

  removeLoggedSet: async (dayLabel, exerciseId, setIndex, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const exercises = session.exercises.map(e => {
      if (e.exerciseId !== exerciseId) return e
      const sets = e.sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 }))
      return { ...e, sets }
    })
    const updated = { ...session, exercises }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises })
  },

  reorderExercises: async (dayLabel, newOrder, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const updated = { ...session, order: newOrder }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { order: newOrder })
  },

  addExercise: async (dayLabel, exercise, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const exercises = [...session.exercises, exercise]
    const order = [...session.order, exercise.exerciseId]
    const updated = { ...session, exercises, order }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises, order })
  },

  setExerciseNote: async (dayLabel, exerciseId, note, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const exercises = session.exercises.map(e =>
      e.exerciseId === exerciseId ? { ...e, note } : e
    )
    const updated = { ...session, exercises }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises })
  },

  updateExerciseUnit: async (dayLabel, exerciseId, unit, date = todayISO()) => {
    const key = `${dayLabel}::${date}`
    const session = get().sessions[key]
    if (!session) return

    const exercises = session.exercises.map(e => {
      if (e.exerciseId !== exerciseId) return e
      const sets = e.sets.map(s => ({ ...s, unit }))
      return { ...e, sets }
    })
    const updated = { ...session, exercises }
    set(s => ({ sessions: { ...s.sessions, [key]: updated } }))
    if (session.id != null) await db.workoutDaySessions.update(session.id, { exercises })
  },
}))

// ---------------------------------------------------------------------------
// Selector helpers
// ---------------------------------------------------------------------------

export function selectDaySession(
  sessions: Record<string, WorkoutDaySession>,
  dayLabel: 'Day 1' | 'Day 2' | 'Day 3',
  date = todayISO()
): WorkoutDaySession | undefined {
  return sessions[`${dayLabel}::${date}`]
}

export function selectOrderedExercises(session: WorkoutDaySession): ExerciseSessionState[] {
  const map = Object.fromEntries(session.exercises.map(e => [e.exerciseId, e]))
  return session.order.map(id => map[id]).filter(Boolean)
}
