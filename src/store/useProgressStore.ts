import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileId } from '@/config/profiles'

/**
 * Mutable, per-profile progress state that has no home in the static program
 * data: which rung of a progression ladder the user is currently on, and a
 * bodyweight log (needed for DOTS and for weighted-bodyweight effective load).
 *
 * Deliberately localStorage rather than Dexie — both are small, low-frequency,
 * and non-time-critical, so adding an IndexedDB table (and a schema version
 * bump) would not earn its cost.
 */

export interface BodyweightEntry {
  /** ISO date, 'YYYY-MM-DD'. */
  date: string
  kg: number
}

/** Ladder rungs are keyed by profile + exercise so the two profiles differ. */
function rungKey(profileId: ProfileId, exerciseId: string): string {
  return `${profileId}::${exerciseId}`
}

interface ProgressState {
  /** Current ladder rung index, keyed `${profileId}::${exerciseId}`. */
  rungs: Record<string, number>
  /** Bodyweight entries per profile, kept sorted oldest first. */
  bodyweight: Record<string, BodyweightEntry[]>

  getRung: (profileId: ProfileId, exerciseId: string) => number
  setRung: (profileId: ProfileId, exerciseId: string, rung: number) => void
  logBodyweight: (profileId: ProfileId, date: string, kg: number) => void
  removeBodyweight: (profileId: ProfileId, date: string) => void
  getBodyweight: (profileId: ProfileId) => BodyweightEntry[]
  /** Most recent logged bodyweight, or undefined when nothing is logged. */
  latestBodyweight: (profileId: ProfileId) => number | undefined
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      rungs: {},
      bodyweight: {},

      getRung: (profileId, exerciseId) => get().rungs[rungKey(profileId, exerciseId)] ?? 0,

      setRung: (profileId, exerciseId, rung) =>
        set(s => ({ rungs: { ...s.rungs, [rungKey(profileId, exerciseId)]: rung } })),

      logBodyweight: (profileId, date, kg) =>
        set(s => {
          const existing = s.bodyweight[profileId] ?? []
          // One entry per date — logging the same day again overwrites it.
          const next = [...existing.filter(e => e.date !== date), { date, kg }]
            .sort((a, b) => a.date.localeCompare(b.date))
          return { bodyweight: { ...s.bodyweight, [profileId]: next } }
        }),

      removeBodyweight: (profileId, date) =>
        set(s => ({
          bodyweight: {
            ...s.bodyweight,
            [profileId]: (s.bodyweight[profileId] ?? []).filter(e => e.date !== date),
          },
        })),

      getBodyweight: profileId => get().bodyweight[profileId] ?? [],

      latestBodyweight: profileId => {
        const entries = get().bodyweight[profileId] ?? []
        return entries.length > 0 ? entries[entries.length - 1].kg : undefined
      },
    }),
    { name: 'obzen-progress' }
  )
)
