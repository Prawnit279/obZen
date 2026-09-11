import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PROFILES, PROFILE_ID } from '@/config/profiles'
import type { Dosha } from '@/data/doshas'
import type { WeightGoal } from '@/lib/bodyweight'

/**
 * The parts of the profile the user owns.
 *
 * Everything else in `config/profiles.ts` is programme data — key lifts, which
 * Progress panels appear — and stays in code. Name and dosha are not: they
 * describe the person holding the phone, and on a per-device app that person is
 * whoever installed it. Kept in localStorage beside the other small preferences
 * rather than in Dexie, for the same reason as the bodyweight log: too small
 * and too infrequent to earn a table and a schema version.
 *
 * Both fields fall back to the values in `config/profiles.ts`, so an install
 * that has never opened Settings looks exactly as it did before.
 *
 * The weight goal is the one field with no default. It is what decides whether
 * a pound gained is progress or drift, and that is the person's call — so the
 * app asks rather than assuming, and until it has an answer the trend is shown
 * without being judged.
 */

/**
 * The static defaults, used until the user sets their own. Exported so a
 * backup restore can tell a value nobody has touched from one somebody chose.
 */
export const PROFILE_SETTINGS_DEFAULTS = {
  name: PROFILES[PROFILE_ID].name,
  dosha: (PROFILES[PROFILE_ID].dosha ?? 'Pitta') as Dosha,
  weightGoal: null as WeightGoal | null,
}

interface ProfileSettingsState {
  name: string
  dosha: Dosha
  /** Null until the person has said what they are aiming for. */
  weightGoal: WeightGoal | null
  setName: (name: string) => void
  setDosha: (dosha: Dosha) => void
  setWeightGoal: (goal: WeightGoal | null) => void
  reset: () => void
}

export const useProfileSettingsStore = create<ProfileSettingsState>()(
  persist(
    set => ({
      ...PROFILE_SETTINGS_DEFAULTS,
      // An all-space name would render as a blank heading with no way to tell
      // the app is working, so it falls back rather than being stored.
      setName: (name: string) =>
        set({ name: name.trim().length > 0 ? name : PROFILE_SETTINGS_DEFAULTS.name }),
      setDosha: (dosha: Dosha) => set({ dosha }),
      setWeightGoal: (weightGoal: WeightGoal | null) => set({ weightGoal }),
      reset: () => set({ ...PROFILE_SETTINGS_DEFAULTS }),
    }),
    { name: 'obzen-profile-settings' }
  )
)

/** The display name, for the many places that only need that. */
export function useProfileName(): string {
  return useProfileSettingsStore(s => s.name)
}
