/**
 * The personal half of a backup — what lives in localStorage, not IndexedDB.
 *
 * Weigh-ins, the weight goal, name, dosha and progression ladder rungs are all
 * kept in small persisted stores beside the database rather than in it, so the
 * table-by-table export never saw them. A backup restored onto a new phone came
 * back with every workout and not one weigh-in.
 *
 * Restoring fills gaps and never overwrites. On a fresh device that puts
 * everything back; on a device already in use it cannot rename you, replace a
 * weigh-in you logged yourself, or swap out a goal you chose — the same rule
 * the workout import follows for sessions that already have logged work.
 */
import { PROFILE_ID } from '@/config/profiles'
import { DOSHAS } from '@/data/doshas'
import type { Dosha } from '@/data/doshas'
import { useProgressStore } from '@/store/useProgressStore'
import { useProfileSettingsStore, PROFILE_SETTINGS_DEFAULTS } from '@/store/useProfileSettingsStore'
import { WEIGH_IN_LB } from '@/lib/bodyweight'
import type { WeighIn, WeightGoal } from '@/lib/bodyweight'
import { lbToKg } from '@/lib/progress'

export interface PersonalSection {
  bodyweight?: WeighIn[]
  /** Keyed `${profileId}::${exerciseId}`, exactly as the progress store keys them. */
  ladderRungs?: Record<string, number>
  profile?: {
    name?: string
    dosha?: Dosha
    weightGoal?: WeightGoal | null
  }
}

/** A generous ceiling — the longest ladder in the programme is far shorter. */
const MAX_RUNG = 50
const MAX_NAME = 60
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// ── Collect ──────────────────────────────────────────────────────────────────

export function collectPersonal(): PersonalSection {
  const progress = useProgressStore.getState()
  const settings = useProfileSettingsStore.getState()
  return {
    bodyweight: progress.getBodyweight(PROFILE_ID).map(e => ({ date: e.date, kg: e.kg })),
    ladderRungs: { ...progress.rungs },
    profile: { name: settings.name, dosha: settings.dosha, weightGoal: settings.weightGoal },
  }
}

// ── Validate ─────────────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isWeightGoal(v: unknown): v is WeightGoal {
  if (!isPlainObject(v)) return false
  if (v.direction === 'maintain') return true
  return (v.direction === 'gain' || v.direction === 'lose')
    && (v.pace === 'gentle' || v.pace === 'steady')
}

/**
 * Check a backup's personal section, returning it typed or throwing with the
 * path of the first bad field.
 *
 * Unlike the database tables this has no transaction to roll back, so a bad
 * row would stay written. Everything is therefore checked field by field, and
 * the caller runs this before touching the database so a corrupt section
 * rejects the whole file.
 */
export function validatePersonal(raw: unknown): PersonalSection {
  if (!isPlainObject(raw)) throw new Error('Backup "personal" section must be an object.')
  const out: PersonalSection = {}

  if (raw.bodyweight !== undefined) {
    if (!Array.isArray(raw.bodyweight)) throw new Error('"personal.bodyweight" must be an array.')
    const minKg = lbToKg(WEIGH_IN_LB.min)
    const maxKg = lbToKg(WEIGH_IN_LB.max)
    out.bodyweight = raw.bodyweight.map((row: unknown, i: number) => {
      const at = `personal.bodyweight[${i}]`
      if (!isPlainObject(row)) throw new Error(`"${at}" must be an object.`)
      const { date, kg } = row
      if (typeof date !== 'string' || !ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
        throw new Error(`"${at}.date" must be a date like 2026-09-10.`)
      }
      if (typeof kg !== 'number' || !Number.isFinite(kg) || kg < minKg || kg > maxKg) {
        throw new Error(`"${at}.kg" must be a bodyweight between ${WEIGH_IN_LB.min} and ${WEIGH_IN_LB.max} lb.`)
      }
      return { date, kg }
    })
  }

  if (raw.ladderRungs !== undefined) {
    if (!isPlainObject(raw.ladderRungs)) throw new Error('"personal.ladderRungs" must be an object.')
    for (const [key, rung] of Object.entries(raw.ladderRungs)) {
      if (typeof rung !== 'number' || !Number.isInteger(rung) || rung < 0 || rung > MAX_RUNG) {
        throw new Error(`"personal.ladderRungs.${key}" must be a whole number from 0 to ${MAX_RUNG}.`)
      }
    }
    out.ladderRungs = { ...(raw.ladderRungs as Record<string, number>) }
  }

  if (raw.profile !== undefined) {
    const p = raw.profile
    if (!isPlainObject(p)) throw new Error('"personal.profile" must be an object.')
    const profile: NonNullable<PersonalSection['profile']> = {}

    if (p.name !== undefined) {
      if (typeof p.name !== 'string' || p.name.trim() === '' || p.name.length > MAX_NAME) {
        throw new Error(`"personal.profile.name" must be text, 1 to ${MAX_NAME} characters.`)
      }
      profile.name = p.name
    }
    if (p.dosha !== undefined) {
      if (!(DOSHAS as readonly unknown[]).includes(p.dosha)) {
        throw new Error(`"personal.profile.dosha" must be one of ${DOSHAS.join(', ')}.`)
      }
      profile.dosha = p.dosha as Dosha
    }
    if (p.weightGoal !== undefined) {
      if (p.weightGoal !== null && !isWeightGoal(p.weightGoal)) {
        throw new Error('"personal.profile.weightGoal" is not a goal this app could have written.')
      }
      profile.weightGoal = p.weightGoal
    }
    out.profile = profile
  }

  return out
}

// ── Restore ──────────────────────────────────────────────────────────────────

/** Fill what this device lacks. Returns how many values were actually added. */
export function restorePersonal(section: PersonalSection): number {
  let restored = 0

  if (section.bodyweight && section.bodyweight.length > 0) {
    const local = useProgressStore.getState().getBodyweight(PROFILE_ID)
    const have = new Set(local.map(e => e.date))
    const incoming = section.bodyweight.filter(e => !have.has(e.date))
    if (incoming.length > 0) {
      const merged = [...local, ...incoming].sort((a, b) => a.date.localeCompare(b.date))
      useProgressStore.setState(s => ({ bodyweight: { ...s.bodyweight, [PROFILE_ID]: merged } }))
      restored += incoming.length
    }
  }

  if (section.ladderRungs) {
    const local = useProgressStore.getState().rungs
    const missing = Object.entries(section.ladderRungs).filter(([key]) => !(key in local))
    if (missing.length > 0) {
      useProgressStore.setState(s => ({ rungs: { ...Object.fromEntries(missing), ...s.rungs } }))
      restored += missing.length
    }
  }

  if (section.profile) {
    const s = useProfileSettingsStore.getState()
    const { name, dosha, weightGoal } = section.profile
    // "Untouched" means still at the default: only those are safe to fill.
    const patch = {
      ...(name && s.name === PROFILE_SETTINGS_DEFAULTS.name ? { name } : {}),
      ...(dosha && s.dosha === PROFILE_SETTINGS_DEFAULTS.dosha ? { dosha } : {}),
      ...(weightGoal && s.weightGoal === null ? { weightGoal } : {}),
    }
    const fields = Object.keys(patch).length
    if (fields > 0) {
      useProfileSettingsStore.setState(patch)
      restored += fields
    }
  }

  return restored
}
