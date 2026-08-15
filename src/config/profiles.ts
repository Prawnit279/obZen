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
  /** As written for display, e.g. '70 kg (155 lb)'. */
  bodyweight: string
  /** Machine-readable starting bodyweight in kg — seeds the bodyweight log. */
  bodyweightKg?: number
  fatMass?: string
  leanMass?: string
  bodyFat?: string
  goal?: string
}

/**
 * Which panels the Progress view shows for a profile, and which lifts it leads
 * with. Kept as config so the view has no per-person conditionals scattered
 * through it.
 */
export interface ProgressConfig {
  /** Exercise ids charted on the e1RM trend, in display order. */
  keyLiftIds: string[]
  /** Show SBD total, DOTS and powerlifting strength standards. */
  showPowerlifting: boolean
  /** Show a bodyweight trend line (fat-loss oriented goals). */
  showBodyweightTrend: boolean
}

export interface Profile {
  id: ProfileId
  name: string
  dosha?: string
  /** Current training block, e.g. 'Phase 1 · Weeks 1–4 · Glutes, Core & Strength'. */
  program?: string
  body: BodyComposition
  targets: MacroTargets
  /** Coefficient set for the DOTS/Wilks estimate. */
  sex?: 'male' | 'female'
  progress: ProgressConfig
  /** Astrology fields — only surfaced when SHOW_VEDIC is enabled. */
  mahadasha?: string
  atmakaraka?: string
}

export const PROFILES: Record<ProfileId, Profile> = {
  pronit: {
    id: 'pronit',
    name: 'Pronit',
    dosha: 'Pitta',
    body: { bodyweight: '165 lb (75 kg)', bodyweightKg: 75 },
    targets: { proteinG: '150', calories: '2550' },
    sex: 'male',
    progress: {
      keyLiftIds: ['barbell-squat', 'bench-press', 'deadlift'],
      showPowerlifting: true,
      showBodyweightTrend: false,
    },
    mahadasha: 'Rahu (~2030)',
    atmakaraka: 'Saturn',
  },
  aishwarya: {
    id: 'aishwarya',
    name: 'Aishwarya',
    program: 'Phase 1 · Weeks 1–4 · Glutes, Core & Strength',
    body: {
      bodyweight: '155 lb (70 kg)',
      bodyweightKg: 70,
      fatMass: '49.1 lb',
      leanMass: '106 lb',
      bodyFat: '31.7%',
      goal: 'Build glutes, lose waist fat, keep lean mass — target −17.4 lb fat, retest wk 12',
    },
    targets: { proteinG: '110–130', steps: '8–9k / day' },
    progress: {
      // Phase 1 is glutes/core/fat-loss — powerlifting framing does not apply.
      keyLiftIds: ['hip-thrust-machine', 'romanian-deadlift', 'barbell-back-squat'],
      showPowerlifting: false,
      showBodyweightTrend: true,
    },
  },
}

export const PROFILE_IDS: ProfileId[] = ['pronit', 'aishwarya']
