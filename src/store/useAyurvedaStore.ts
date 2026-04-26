import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AyurvedaState = {
  todayCompleted: string[]
  toggleRoutineItem: (id: string) => void
  resetForDay: () => void
  lastResetDate: string | null
  checkAndReset: (todayISO: string) => void
}

export const useAyurvedaStore = create<AyurvedaState>()(
  persist(
    (set, get) => ({
      todayCompleted: [],
      lastResetDate: null,

      toggleRoutineItem: (id) =>
        set(s => ({
          todayCompleted: s.todayCompleted.includes(id)
            ? s.todayCompleted.filter(i => i !== id)
            : [...s.todayCompleted, id],
        })),

      resetForDay: () =>
        set({ todayCompleted: [], lastResetDate: new Date().toISOString().split('T')[0] }),

      checkAndReset: (todayISO) => {
        const { lastResetDate } = get()
        if (lastResetDate !== todayISO) {
          set({ todayCompleted: [], lastResetDate: todayISO })
        }
      },
    }),
    { name: 'obzen-ayurveda' }
  )
)
