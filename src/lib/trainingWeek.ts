/**
 * Which training day of the week a session is.
 *
 * "Day 1" used to name a template — Pull/Legs/Arms — and there were exactly
 * three of them. It now names a position: the first session of the week, then
 * the second, whatever you happened to do in them.
 *
 * The position is derived from the date every time it is needed, never stored.
 * Freezing it at save time would be wrong the moment a session is backdated:
 * log Wednesday first and Monday after, and the stored order and the calendar
 * order disagree. Derivation cannot drift because there is nothing to drift
 * from.
 */

import type { WorkoutDaySession } from '@/db/dexie'
import { isoWeekKey } from '@/lib/progress'
import { sessionHasActivity } from '@/lib/workoutSession'

/** How many days a week the plan calls for. */
export const TRAINING_DAY_CHOICES = [2, 3, 4, 5, 6] as const
export type TrainingDays = typeof TRAINING_DAY_CHOICES[number]

export const DEFAULT_TRAINING_DAYS: TrainingDays = 3

export function isTrainingDays(value: unknown): value is TrainingDays {
  return TRAINING_DAY_CHOICES.includes(value as TrainingDays)
}

export interface DaySlot {
  /** 1-based position in the week — what the Program page calls "Day 1". */
  day: number
  /** The session that fills it, or null while the slot is still to come. */
  date: string | null
  /** True when this is the slot a session logged today would occupy. */
  isToday: boolean
}

/**
 * The dates trained in a week, earliest first.
 *
 * Only sessions with something actually logged count. An opened-but-empty day
 * is not a training day, and letting it take slot 1 would push a real session
 * down a place.
 */
export function trainedDates(sessions: WorkoutDaySession[], weekKey: string): string[] {
  const dates = sessions
    .filter(s => isoWeekKey(s.date) === weekKey && sessionHasActivity(s))
    .map(s => s.date)
  return [...new Set(dates)].sort()
}

/**
 * Which training day of its week a date is, or null if nothing was logged then.
 *
 * One-based, so the first session of the week is Day 1.
 */
export function dayNumberFor(
  sessions: WorkoutDaySession[],
  date: string
): number | null {
  const index = trainedDates(sessions, isoWeekKey(date)).indexOf(date)
  return index === -1 ? null : index + 1
}

/**
 * The week laid out as the Program page shows it.
 *
 * Slots the plan asks for, filled in date order by what was actually trained.
 * If more days were trained than planned the week grows to fit them — a setting
 * should never be the reason a logged session has nowhere to appear.
 */
export function weekSlots(
  sessions: WorkoutDaySession[],
  weekKey: string,
  daysPerWeek: number,
  todayISO: string
): DaySlot[] {
  const trained = trainedDates(sessions, weekKey)
  const count = Math.max(daysPerWeek, trained.length)
  const todayIndex = trained.indexOf(todayISO)

  // Today has not been logged yet, so it would land in the first free slot —
  // unless the week is already full, in which case it extends it.
  const nextFree = isoWeekKey(todayISO) === weekKey ? trained.length : -1

  return Array.from({ length: count }, (_, i) => ({
    day: i + 1,
    date: trained[i] ?? null,
    isToday: todayIndex === -1 ? i === nextFree : i === todayIndex,
  }))
}
