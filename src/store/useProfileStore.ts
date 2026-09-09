import { create } from 'zustand'
import { PROFILE_ID } from '@/config/profiles'
import type { ProfileId } from '@/config/profiles'

/**
 * The active profile — now a constant, since there is only one.
 *
 * The store survives the removal of the switcher rather than being deleted so
 * that the fourteen screens reading `activeId` keep a single, obvious place to
 * get it from. There is no setter: nothing can change who you are, and the
 * stale `obzen-active-profile` key left in localStorage by older builds is
 * simply ignored rather than read back.
 */
interface ProfileState {
  activeId: ProfileId
}

export const useProfileStore = create<ProfileState>(() => ({
  activeId: PROFILE_ID,
}))
