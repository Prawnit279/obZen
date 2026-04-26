import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayISO } from '@/lib/utils'

export type ActiveStreak = {
  workout: number
  drum: number
  nutrition: number
  ayurveda: number
}

export type AppState = {
  todayCheckedIn: boolean
  lastCheckInDate: string | null
  streaks: ActiveStreak
  activeNav: string
  setActiveNav: (nav: string) => void
  setTodayCheckedIn: (val: boolean) => void
  updateStreak: (key: keyof ActiveStreak, value: number) => void
  resetStreakIfMissed: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      todayCheckedIn: false,
      lastCheckInDate: null,
      streaks: { workout: 0, drum: 0, nutrition: 0, ayurveda: 0 },
      activeNav: 'dashboard',

      setActiveNav: (nav) => set({ activeNav: nav }),

      setTodayCheckedIn: (val) =>
        set({ todayCheckedIn: val, lastCheckInDate: todayISO() }),

      updateStreak: (key, value) =>
        set(s => ({ streaks: { ...s.streaks, [key]: value } })),

      resetStreakIfMissed: () => {
        const { lastCheckInDate } = get()
        if (!lastCheckInDate) return
        const last = new Date(lastCheckInDate)
        const today = new Date()
        const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
        if (diff > 1) {
          set({ streaks: { workout: 0, drum: 0, nutrition: 0, ayurveda: 0 } })
        }
      },
    }),
    { name: 'obzen-app' }
  )
)
