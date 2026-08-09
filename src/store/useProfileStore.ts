import { create } from 'zustand'
import type { ProfileId } from '@/config/profiles'

const STORAGE_KEY = 'obzen-active-profile'

function loadActiveId(): ProfileId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'pronit' || stored === 'aishwarya') return stored
  } catch {
    // localStorage unavailable — fall through to default
  }
  return 'pronit'
}

interface ProfileState {
  activeId: ProfileId
  setActive: (id: ProfileId) => void
}

export const useProfileStore = create<ProfileState>(set => ({
  activeId: loadActiveId(),
  setActive: (id: ProfileId) => {
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // best-effort persistence
    }
    set({ activeId: id })
  },
}))
