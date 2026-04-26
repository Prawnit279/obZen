import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WorkoutState = {
  activeDayLabel: string | null
  activeSessionId: number | null
  setActiveDayLabel: (label: string | null) => void
  setActiveSessionId: (id: number | null) => void
  clearSession: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      activeDayLabel: null,
      activeSessionId: null,
      setActiveDayLabel: (label) => set({ activeDayLabel: label }),
      setActiveSessionId: (id) => set({ activeSessionId: id }),
      clearSession: () => set({ activeDayLabel: null, activeSessionId: null }),
    }),
    { name: 'obzen-workout' }
  )
)
