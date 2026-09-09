/**
 * The app's single profile — its details, targets, and which Progress panels it
 * shows.
 *
 * obZen used to carry two named people with a switcher between them. That is
 * gone: there is one profile now, and no way to change who you are.
 *
 * The id string stays `'pronit'` deliberately. It is not a display value — it
 * is the key logged sessions are stamped with, and the prefix under which
 * bodyweight entries and progression ladder rungs are stored. Changing it would
 * orphan all of that, so it stays as the stable internal identifier while the
 * *concept* of choosing a profile disappears.
 *
 * Sessions stamped with the old second profile remain in the database and in
 * backups, but nothing matches them any more, so they neither display nor count.
 */
export type ProfileId = 'pronit'

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
}

export const PROFILE_IDS: ProfileId[] = ['pronit']

/** The one profile. Prefer this over indexing `PROFILES` by a variable. */
export const PROFILE_ID: ProfileId = 'pronit'
