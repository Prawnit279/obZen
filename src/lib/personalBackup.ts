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
import { WEIGH_IN_LB, isWeightGoal } from '@/lib/bodyweight'
import type { WeighIn, WeightGoal } from '@/lib/bodyweight'
import { lbToKg } from '@/lib/progress'
import { useIntakeStore } from '@/store/useIntakeStore'
import { useBlockStore } from '@/store/useBlockStore'
import type { ActiveBlock } from '@/store/useBlockStore'
import type { IntakeAnswers } from '@/lib/intake'
import { isTrainingDays } from '@/lib/trainingWeek'
import type { TrainingDays } from '@/lib/trainingWeek'
import type { BarMode } from '@/lib/barWeight'

export interface PersonalSection {
  bodyweight?: WeighIn[]
  /** Keyed `${profileId}::${exerciseId}`, exactly as the progress store keys them. */
  ladderRungs?: Record<string, number>
  profile?: {
    name?: string
    dosha?: Dosha
    weightGoal?: WeightGoal | null
    trainingDays?: TrainingDays
    barMode?: BarMode
  }
  /**
   * The goal questionnaire.
   *
   * Twenty answers given once, and the single most tedious thing to lose — it
   * was absent from the backup entirely, so a restored phone came back with
   * every workout and an empty questionnaire.
   */
  intake?: {
    answers?: IntakeAnswers
    seen?: string[]
    completedAt?: string | null
  }
  /** The running programme, start date and training maxes. Null when none. */
  block?: ActiveBlock | null
}

/** A generous ceiling — the longest ladder in the programme is far shorter. */
const MAX_RUNG = 50
const MAX_NAME = 60
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * A date that both looks right and exists.
 *
 * `Date.parse` is not a calendar check: it rolls 2026-02-30 forward to March 2
 * rather than rejecting it. The row would then be stored as the February string
 * it claims to be, sorted as February, and have its day gaps measured as March.
 * Round-tripping the parsed date catches exactly that.
 */
function isCalendarDate(date: string): boolean {
  if (!ISO_DATE.test(date)) return false
  const parsed = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}

// ── Collect ──────────────────────────────────────────────────────────────────

export function collectPersonal(): PersonalSection {
  const progress = useProgressStore.getState()
  const settings = useProfileSettingsStore.getState()
  const intake = useIntakeStore.getState()
  return {
    bodyweight: progress.getBodyweight(PROFILE_ID).map(e => ({ date: e.date, kg: e.kg })),
    ladderRungs: { ...progress.rungs },
    profile: {
      name: settings.name,
      dosha: settings.dosha,
      weightGoal: settings.weightGoal,
      trainingDays: settings.trainingDays,
      barMode: settings.barMode,
    },
    intake: {
      answers: intake.answers,
      seen: intake.seen,
      completedAt: intake.completedAt,
    },
    block: useBlockStore.getState().block,
  }
}

// ── Validate ─────────────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
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
    const rows = raw.bodyweight.map((row: unknown, i: number) => {
      const at = `personal.bodyweight[${i}]`
      if (!isPlainObject(row)) throw new Error(`"${at}" must be an object.`)
      const { date, kg } = row
      if (typeof date !== 'string' || !isCalendarDate(date)) {
        throw new Error(`"${at}.date" must be a real date like 2026-09-10.`)
      }
      if (typeof kg !== 'number' || !Number.isFinite(kg) || kg < minKg || kg > maxKg) {
        throw new Error(`"${at}.kg" must be a bodyweight between ${WEIGH_IN_LB.min} and ${WEIGH_IN_LB.max} lb.`)
      }
      return { date, kg }
    })
    // A file can carry the same day twice — two exports concatenated by hand,
    // say. On the device, logging a day again overwrites it, so the later row
    // wins here too rather than the log gaining a duplicate it cannot get any
    // other way.
    const byDate = new Map(rows.map(r => [r.date, r]))
    out.bodyweight = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
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
    if (p.trainingDays !== undefined) {
      if (!isTrainingDays(p.trainingDays)) {
        throw new Error('"personal.profile.trainingDays" must be a day count the plan offers.')
      }
      profile.trainingDays = p.trainingDays as TrainingDays
    }
    if (p.barMode !== undefined) {
      if (p.barMode !== 'with-bar' && p.barMode !== 'plates-only') {
        throw new Error('"personal.profile.barMode" must be "with-bar" or "plates-only".')
      }
      profile.barMode = p.barMode as BarMode
    }
    out.profile = profile
  }

  if (raw.intake !== undefined) out.intake = validateIntake(raw.intake)
  if (raw.block !== undefined) out.block = validateBlock(raw.block)

  return out
}

// ── Restore ──────────────────────────────────────────────────────────────────

/** The answer shapes `lib/intake.ts` declares. A file may carry no others. */
const ANSWER_KINDS = new Set(['single', 'multi', 'scale', 'number', 'date', 'lifts'])

/**
 * Check a questionnaire from a file.
 *
 * These answers feed the programme recommendation, so a malformed one is
 * rejected whole rather than half-read — a half-read questionnaire would
 * recommend off a subset without anything saying so, which is the one failure
 * the recommendation is built to avoid.
 *
 * Ids are not checked against the current question set: the store's own
 * rehydration already drops unknown ones, and rejecting a whole backup because
 * a question was renamed since it was written would lose far more than it
 * saved.
 */
function validateIntake(raw: unknown): PersonalSection['intake'] {
  if (!isPlainObject(raw)) throw new Error('Backup "personal.intake" must be an object.')
  const out: NonNullable<PersonalSection['intake']> = {}

  if (raw.answers !== undefined) {
    if (!isPlainObject(raw.answers)) throw new Error('"personal.intake.answers" must be an object.')
    const answers: IntakeAnswers = {}
    for (const [id, a] of Object.entries(raw.answers)) {
      if (!isPlainObject(a) || typeof a.kind !== 'string' || !ANSWER_KINDS.has(a.kind)) {
        throw new Error(`"personal.intake.answers.${id}" is not an answer.`)
      }
      answers[id] = a as IntakeAnswers[string]
    }
    out.answers = answers
  }

  if (raw.seen !== undefined) {
    if (!Array.isArray(raw.seen) || raw.seen.some(id => typeof id !== 'string')) {
      throw new Error('"personal.intake.seen" must be a list of question ids.')
    }
    out.seen = raw.seen as string[]
  }

  if (raw.completedAt !== undefined) {
    // Null is carried through rather than dropped. "Never finished" is a value
    // the store holds, not the absence of one, and a backup that quietly lost
    // the difference would not survive its own round trip.
    if (raw.completedAt !== null && typeof raw.completedAt !== 'string') {
      throw new Error('"personal.intake.completedAt" must be a timestamp or null.')
    }
    out.completedAt = raw.completedAt
  }

  return out
}

/**
 * Check a running block from a file.
 *
 * The same fields `useBlockStore` validates on rehydration, and for the same
 * reason — except that the programme id is deliberately not checked against
 * this build's list here. The store drops a block naming a programme it does
 * not have, so a file written against a later build restores cleanly and is
 * swept on the next load rather than rejecting the whole backup.
 */
function validateBlock(raw: unknown): ActiveBlock | null {
  if (raw === null) return null
  if (!isPlainObject(raw)) throw new Error('Backup "personal.block" must be an object or null.')
  if (typeof raw.programId !== 'string' || raw.programId === '') {
    throw new Error('"personal.block.programId" is required.')
  }
  if (typeof raw.startedOn !== 'string' || !isCalendarDate(raw.startedOn)) {
    throw new Error('"personal.block.startedOn" must be a real YYYY-MM-DD date.')
  }
  if (!isPlainObject(raw.trainingMaxLb)) {
    throw new Error('"personal.block.trainingMaxLb" must be an object.')
  }
  for (const [id, lb] of Object.entries(raw.trainingMaxLb)) {
    if (typeof lb !== 'number' || !Number.isFinite(lb) || lb <= 0) {
      throw new Error(`"personal.block.trainingMaxLb.${id}" must be a positive number.`)
    }
  }
  return {
    programId: raw.programId,
    templateId: typeof raw.templateId === 'string' ? raw.templateId : null,
    startedOn: raw.startedOn,
    trainingMaxLb: raw.trainingMaxLb as Record<string, number>,
  }
}

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
    const { name, dosha, weightGoal, trainingDays, barMode } = section.profile
    // "Untouched" means still at the default: only those are safe to fill.
    const patch = {
      ...(name && s.name === PROFILE_SETTINGS_DEFAULTS.name ? { name } : {}),
      ...(dosha && s.dosha === PROFILE_SETTINGS_DEFAULTS.dosha ? { dosha } : {}),
      ...(weightGoal && s.weightGoal === null ? { weightGoal } : {}),
      ...(trainingDays && s.trainingDays === PROFILE_SETTINGS_DEFAULTS.trainingDays
        ? { trainingDays } : {}),
      ...(barMode && s.barMode === PROFILE_SETTINGS_DEFAULTS.barMode ? { barMode } : {}),
    }
    const fields = Object.keys(patch).length
    if (fields > 0) {
      useProfileSettingsStore.setState(patch)
      restored += fields
    }
  }

  // Only onto a questionnaire that has not been started here. Gaps are filled,
  // nothing is replaced — the same rule the fields above follow, and the one
  // that matters most here: restoring an old backup onto a phone in use must
  // not quietly swap out answers given on it since.
  if (section.intake?.answers && Object.keys(section.intake.answers).length > 0) {
    const here = useIntakeStore.getState()
    if (Object.keys(here.answers).length === 0) {
      useIntakeStore.setState({
        answers: section.intake.answers,
        seen: section.intake.seen ?? Object.keys(section.intake.answers),
        completedAt: section.intake.completedAt ?? here.completedAt,
      })
      restored += Object.keys(section.intake.answers).length
    }
  }

  // Likewise: a block already running here is the current one, whatever a file
  // from another device says.
  if (section.block && useBlockStore.getState().block === null) {
    useBlockStore.setState({ block: section.block })
    restored += 1
  }

  return restored
}
