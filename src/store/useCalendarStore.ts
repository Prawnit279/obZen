import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CalendarView = 'month' | 'week' | 'day'

export type CalendarState = {
  view: CalendarView
  selectedDate: string
  setView: (v: CalendarView) => void
  setSelectedDate: (d: string) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      view: 'month',
      selectedDate: new Date().toISOString().split('T')[0],
      setView: (view) => set({ view }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
    }),
    { name: 'obzen-calendar' }
  )
)
