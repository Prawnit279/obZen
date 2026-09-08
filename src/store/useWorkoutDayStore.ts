import { create } from 'zustand'
import { db } from '@/db/dexie'
import type { WorkoutDaySession, ExerciseSessionState, LoggedSet } from '@/db/dexie'
import { todayISO } from '@/lib/utils'
import { getProgram, formatTarget, toExerciseId, LIBRARY_BY_ID } from '@/data/obzen-program'
import { useProfileStore } from '@/store/useProfileStore'
import { sessionProfile } from '@/lib/workoutSession'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** The profile whose program/history is currently active. */
function activeProfile(): string {
  return useProfileStore.getState().activeId
}

/** Build session-state rows from a day template (name/muscle/target persisted). */
function buildTemplateExercises(
  dayLabel: 'Day 1' | 'Day 2' | 'Day 3',
  profileId: string
): ExerciseSessionState[] {
  const program = getProgram(profileId)[dayLabel]
  if (!program) return []
  return program.exercises.map(ex => ({
    exerciseId: toExerciseId(ex.name),
    name: ex.name,
    muscle: ex.muscle,
    target: formatTarget(ex),
    cue: ex.cue,
    coached: ex.coached,
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
  /** `rpe` is 1–10 and optional; omitting it completes without a rating. */
  completeSession: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', date?: string, rpe?: number) => Promise<void>
  setSessionRpe: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', rpe: number, date?: string) => Promise<void>
  updateExerciseStatus: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, status: ExerciseSessionState['status'], date?: string) => Promise<void>
  addLoggedSet: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, set: LoggedSet, date?: string) => Promise<void>
  updateLoggedSet: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, setIndex: number, set: LoggedSet, date?: string) => Promise<void>
  removeLoggedSet: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, setIndex: number, date?: string) => Promise<void>
  reorderExercises: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', newOrder: string[], date?: string) => Promise<void>
  addExercise: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exercise: ExerciseSessionState, date?: string) => Promise<void>
  removeExercise: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, date?: string) => Promise<void>
  swapExercise: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, toName: string, date?: string) => Promise<void>
  setExerciseNote: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, note: string, date?: string) => Promise<void>
  updateExerciseUnit: (dayLabel: 'Day 1' | 'Day 2' | 'Day 3', exerciseId: string, unit: 'lbs' | 'kg', date?: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWorkoutDayStore = create<WorkoutDayState>((set, get) => {
  // Guards the first insert per key so a brand-new day is created exactly once,
  // even if several mutations fire before the add resolves.
  const pendingCreate: Record<string, Promise<number>> = {}

  /**
   * Persist the current in-memory session for `key`. On the first write it
   * inserts the row (guarded) and patches the store with the new id; afterwards
   * it upserts the full session. Placeholder sessions never call this, so simply
   * opening or tabbing a day no longer writes anything.
   */
  async function persist(key: string): Promise<void> {
    const session = get().sessions[key]
    if (!session) return

    if (session.id != null) {
      await db.workoutDaySessions.put(session)
      return
    }

    // Never create a row for a day that holds nothing (e.g. the user added an
    // exercise then removed it before anything was persisted).
    if (session.exercises.length === 0 && !session.completedAt) return

    // Guard only concurrent inserts for the *current* in-flight session. The
    // entry is always cleared once settled, so a later session for the same key
    // (new day, profile switch, or after a DB reset) inserts its own row rather
    // than reusing — and overwriting — an earlier row's id.
    if (!pendingCreate[key]) {
      pendingCreate[key] = db.workoutDaySessions
        .add(session)
        .then(newId => {
          set(s => {
            const cur = s.sessions[key]
            return cur ? { sessions: { ...s.sessions, [key]: { ...cur, id: newId as number } } } : {}
          })
          return newId as number
        })
        .finally(() => { delete pendingCreate[key] })
    }

    const id = await pendingCreate[key]
    // Write the freshest state (any mutations that landed during the insert).
    const latest = get().sessions[key]
    if (latest) await db.workoutDaySessions.put({ ...latest, id })
  }

  /** Apply an immutable update to a session and persist it. */
  async function mutate(
    key: string,
    updater: (session: WorkoutDaySession) => WorkoutDaySession
  ): Promise<void> {
    const session = get().sessions[key]
    if (!session) return
    set(s => ({ sessions: { ...s.sessions, [key]: updater(session) } }))
    await persist(key)
  }

  return {
    sessions: {},
    loading: false,

    loadSession: async (dayLabel, date = todayISO()) => {
      const profileId = activeProfile()
      const key = `${profileId}::${dayLabel}::${date}`
      if (get().sessions[key]) return // already loaded

      set({ loading: true })
      try {
        const existing = await db.workoutDaySessions
          .where('date').equals(date)
          .filter(s => s.dayLabel === dayLabel && sessionProfile(s) === profileId)
          .first()

        if (existing) {
          set(s => ({ sessions: { ...s.sessions, [key]: existing }, loading: false }))
        } else {
          // In-memory only — nothing is written until the user logs something.
          const newSession: WorkoutDaySession = { date, dayLabel, profileId, exercises: [], order: [] }
          set(s => ({ sessions: { ...s.sessions, [key]: newSession }, loading: false }))
        }
      } catch {
        set({ loading: false })
      }
    },

    // Load a day template as a starting point. Non-destructive: appends any
    // template exercise not already present and stamps the focus label.
    loadTemplate: async (dayLabel, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      const session = get().sessions[key]
      if (!session) return

      const profileId = activeProfile()
      const existingIds = new Set(session.exercises.map(e => e.exerciseId))
      const additions = buildTemplateExercises(dayLabel, profileId).filter(e => !existingIds.has(e.exerciseId))
      if (additions.length === 0 && session.focus) return

      await mutate(key, s => ({
        ...s,
        exercises: [...s.exercises, ...additions],
        order: [...s.order, ...additions.map(e => e.exerciseId)],
        focus: s.focus ?? getProgram(profileId)[dayLabel]?.focus,
      }))
    },

    // Mark the day's workout complete (stamps completedAt for history/streaks).
    completeSession: async (dayLabel, date = todayISO(), rpe) => {
      const profileId = activeProfile()
      const key = `${profileId}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        completedAt: new Date().toISOString(),
        // Only written when given, so completing without rating leaves the
        // field absent rather than storing a fabricated middle value.
        ...(rpe === undefined ? {} : { rpe }),
        focus: s.focus ?? getProgram(profileId)[dayLabel]?.focus,
      }))
    },

    /** Rate a session after the fact, or correct a rating. */
    setSessionRpe: async (dayLabel, rpe, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({ ...s, rpe }))
    },

    updateExerciseStatus: async (dayLabel, exerciseId, status, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: s.exercises.map(e => e.exerciseId === exerciseId ? { ...e, status } : e),
      }))
    },

    addLoggedSet: async (dayLabel, exerciseId, loggedSet, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: s.exercises.map(e =>
          e.exerciseId === exerciseId ? { ...e, sets: [...e.sets, loggedSet] } : e
        ),
      }))
    },

    updateLoggedSet: async (dayLabel, exerciseId, setIndex, loggedSet, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: s.exercises.map(e => {
          if (e.exerciseId !== exerciseId) return e
          return { ...e, sets: e.sets.map((set, i) => i === setIndex ? loggedSet : set) }
        }),
      }))
    },

    removeLoggedSet: async (dayLabel, exerciseId, setIndex, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: s.exercises.map(e => {
          if (e.exerciseId !== exerciseId) return e
          const sets = e.sets.filter((_, i) => i !== setIndex).map((set, i) => ({ ...set, setNumber: i + 1 }))
          return { ...e, sets }
        }),
      }))
    },

    reorderExercises: async (dayLabel, newOrder, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({ ...s, order: newOrder }))
    },

    addExercise: async (dayLabel, exercise, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: [...s.exercises, exercise],
        order: [...s.order, exercise.exerciseId],
      }))
    },

    // Drop an exercise from the day entirely (added by mistake). Any sets
    // logged against it go with it — the UI confirms before calling this.
    removeExercise: async (dayLabel, exerciseId, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: s.exercises.filter(e => e.exerciseId !== exerciseId),
        order: s.order.filter(id => id !== exerciseId),
      }))
    },

    // Replace a movement with one of its listed alternatives, in place. Any
    // sets already logged stay with the old exercise's slot being replaced —
    // swapping is meant for before you start, not mid-exercise.
    swapExercise: async (dayLabel, exerciseId, toName, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      const newId = toExerciseId(toName)
      const entry = LIBRARY_BY_ID[newId]

      await mutate(key, s => {
        if (s.exercises.some(e => e.exerciseId === newId)) return s // already there
        const replacement: ExerciseSessionState = {
          exerciseId: newId,
          name: toName,
          muscle: entry?.muscle,
          target: entry ? formatTarget(entry) : undefined,
          status: 'pending',
          sets: [],
          addedFrom: 'library',
        }
        return {
          ...s,
          exercises: s.exercises.map(e => (e.exerciseId === exerciseId ? replacement : e)),
          order: s.order.map(id => (id === exerciseId ? newId : id)),
        }
      })
    },

    setExerciseNote: async (dayLabel, exerciseId, note, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: s.exercises.map(e => e.exerciseId === exerciseId ? { ...e, note } : e),
      }))
    },

    updateExerciseUnit: async (dayLabel, exerciseId, unit, date = todayISO()) => {
      const key = `${activeProfile()}::${dayLabel}::${date}`
      await mutate(key, s => ({
        ...s,
        exercises: s.exercises.map(e => {
          if (e.exerciseId !== exerciseId) return e
          return { ...e, sets: e.sets.map(set => ({ ...set, unit })) }
        }),
      }))
    },
  }
})

// ---------------------------------------------------------------------------
// Selector helpers
// ---------------------------------------------------------------------------

export function selectDaySession(
  sessions: Record<string, WorkoutDaySession>,
  dayLabel: 'Day 1' | 'Day 2' | 'Day 3',
  date = todayISO(),
  profileId = useProfileStore.getState().activeId
): WorkoutDaySession | undefined {
  return sessions[`${profileId}::${dayLabel}::${date}`]
}

export function selectOrderedExercises(session: WorkoutDaySession): ExerciseSessionState[] {
  const map = Object.fromEntries(session.exercises.map(e => [e.exerciseId, e]))
  return session.order.map(id => map[id]).filter(Boolean)
}
