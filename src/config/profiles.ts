/**
 * Static profiles for the app. obZen is single-dataset (workout history and all
 * Dexie data are shared per-device), so these drive *display only* — the profile
 * switcher changes whose details and targets are shown, not which data is stored.
 */
export type ProfileId = 'pronit' | 'aishwarya'

export interface MacroTargets {
  /** Protein target as written, e.g. '150' or '110–130' (grams/day). */
  proteinG: string
  steps?: string
  calories?: string
}

export interface BodyComposition {
  bodyweight: string
  fatMass?: string
  leanMass?: string
  bodyFat?: string
  goal?: string
}

export interface Profile {
  id: ProfileId
  name: string
  dosha?: string
  /** Current training block, e.g. 'Phase 1 · Weeks 1–4 · Glutes, Core & Strength'. */
  program?: string
  body: BodyComposition
  targets: MacroTargets
  /** Astrology fields — only surfaced when SHOW_VEDIC is enabled. */
  mahadasha?: string
  atmakaraka?: string
}

export const PROFILES: Record<ProfileId, Profile> = {
  pronit: {
    id: 'pronit',
    name: 'Pronit',
    dosha: 'Pitta',
    body: { bodyweight: '75 kg' },
    targets: { proteinG: '150', calories: '2550' },
    mahadasha: 'Rahu (~2030)',
    atmakaraka: 'Saturn',
  },
  aishwarya: {
    id: 'aishwarya',
    name: 'Aishwarya',
    program: 'Phase 1 · Weeks 1–4 · Glutes, Core & Strength',
    body: {
      bodyweight: '70 kg (155 lb)',
      fatMass: '49.1 lb',
      leanMass: '106 lb',
      bodyFat: '31.7%',
      goal: 'Build glutes, lose waist fat, keep lean mass — target −17.4 lb fat, retest wk 12',
    },
    targets: { proteinG: '110–130', steps: '8–9k / day' },
  },
}

export const PROFILE_IDS: ProfileId[] = ['pronit', 'aishwarya']
