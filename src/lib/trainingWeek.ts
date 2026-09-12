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
  /** The session filling it, or null while the slot is still to come. */
  session: WorkoutDaySession | null
  /** True when this is the slot a session logged today occupies, or would. */
  isToday: boolean
}

/**
 * The week's training, earliest first.
 *
 * Only sessions with something logged count. An opened-but-empty day is not a
 * training day, and letting it hold a position would push a real session down
 * one. Ordered by date, then by the stored label so that two sessions on one
 * date — a genuine two-a-day — keep a stable order instead of swapping around.
 */
export function weekSessions(
  sessions: WorkoutDaySession[],
  weekKey: string
): WorkoutDaySession[] {
  return sessions
    .filter(s => isoWeekKey(s.date) === weekKey && sessionHasActivity(s))
    .sort((a, b) => a.date.localeCompare(b.date) || a.dayLabel.localeCompare(b.dayLabel))
}

/** The dates trained in a week, earliest first. */
export function trainedDates(sessions: WorkoutDaySession[], weekKey: string): string[] {
  return [...new Set(weekSessions(sessions, weekKey).map(s => s.date))]
}

/**
 * Which training day of its week a session is, or null if it holds no position.
 *
 * Identified by date *and* label, because the label is what tells two sessions
 * on one date apart.
 */
export function dayNumberFor(
  sessions: WorkoutDaySession[],
  date: string,
  dayLabel?: string
): number | null {
  const week = weekSessions(sessions, isoWeekKey(date))
  const index = week.findIndex(s =>
    s.date === date && (dayLabel === undefined || s.dayLabel === dayLabel))
  return index === -1 ? null : index + 1
}

/**
 * The week laid out as the Program page shows it.
 *
 * Slots the plan asks for, filled in order by what was actually trained. If
 * more was trained than planned the week grows to fit it — a setting should
 * never be the reason a logged session has nowhere to appear.
 */
export function weekSlots(
  sessions: WorkoutDaySession[],
  weekKey: string,
  daysPerWeek: number,
  todayISO: string
): DaySlot[] {
  const week = weekSessions(sessions, weekKey)
  const count = Math.max(daysPerWeek, week.length)
  const todayIndex = week.findIndex(s => s.date === todayISO)

  // Today is unlogged, so it would land in the first free slot — but only if
  // today belongs to the week being shown.
  const nextFree = isoWeekKey(todayISO) === weekKey ? week.length : -1

  return Array.from({ length: count }, (_, i) => ({
    day: i + 1,
    session: week[i] ?? null,
    isToday: todayIndex === -1 ? i === nextFree : i === todayIndex,
  }))
}
