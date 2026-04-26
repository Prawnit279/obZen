import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NutritionState = {
  isTrainingDay: boolean
  setIsTrainingDay: (val: boolean) => void
  toggleTrainingDay: () => void
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set) => ({
      isTrainingDay: true,
      setIsTrainingDay: (val) => set({ isTrainingDay: val }),
      toggleTrainingDay: () => set(s => ({ isTrainingDay: !s.isTrainingDay })),
    }),
    { name: 'obzen-nutrition' }
  )
)
