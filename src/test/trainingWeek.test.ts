/**
 * Day numbers as positions in a week rather than template names.
 *
 * The rule under test throughout: a day number is derived from the calendar,
 * so backdating a session renumbers the week rather than leaving two sessions
 * both claiming to be Day 2.
 */
import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import {
  trainedDates, weekSessions, dayNumberFor, weekSlots,
  isTrainingDays, TRAINING_DAY_CHOICES, DEFAULT_TRAINING_DAYS,
} from '@/lib/trainingWeek'
import { isoWeekKey } from '@/lib/progress'

// 2026-09-07 is a Monday, so this whole week shares one ISO week key.
const MON = '2026-09-07'
const TUE = '2026-09-08'
const WED = '2026-09-09'
const THU = '2026-09-10'
const FRI = '2026-09-11'
const NEXT_MON = '2026-09-14'
const WEEK = isoWeekKey(MON)

const set: LoggedSet = { setNumber: 1, weight: 225, reps: 5, unit: 'lbs', timestamp: `${MON}T10:00:00.000Z` }

function logged(date: string): WorkoutDaySession {
  return {
    date, dayLabel: 'Day 1', profileId: 'pronit',
    exercises: [{ exerciseId: 'barbell-squat', status: 'complete', muscle: 'legs', sets: [set] }],
    order: ['barbell-squat'],
  }
}

/** Opened but never logged — the app writes these when a day is tabbed into. */
function empty(date: string): WorkoutDaySession {
  return { date, dayLabel: 'Day 2', profileId: 'pronit', exercises: [], order: [] }
}

// ── trainedDates ─────────────────────────────────────────────────────────────

describe('trainedDates', () => {
  it('returns the week’s trained days earliest first', () => {
    const sessions = [logged(WED), logged(MON), logged(FRI)]
    expect(trainedDates(sessions, WEEK)).toEqual([MON, WED, FRI])
  })

  it('ignores a day that was opened but never logged', () => {
    // An empty day taking slot one would push every real session down a place.
    expect(trainedDates([empty(MON), logged(WED)], WEEK)).toEqual([WED])
  })

  it('ignores other weeks', () => {
    expect(trainedDates([logged(MON), logged(NEXT_MON)], WEEK)).toEqual([MON])
  })

  it('counts a date once even if two rows share it', () => {
    expect(trainedDates([logged(MON), logged(MON)], WEEK)).toEqual([MON])
  })

  it('keeps both of a genuine two-a-day, in a stable order', () => {
    // Same date, different labels. Collapsing them would hide a session that
    // happened; ordering them by label keeps the pair from swapping about.
    const second = { ...logged(MON), dayLabel: 'Day 2' as const }
    const week = weekSessions([second, logged(MON)], WEEK)
    expect(week.map(s => s.dayLabel)).toEqual(['Day 1', 'Day 2'])
  })

  it('is empty for a week with no training', () => {
    expect(trainedDates([], WEEK)).toEqual([])
  })
})

// ── dayNumberFor ─────────────────────────────────────────────────────────────

describe('dayNumberFor', () => {
  const sessions = [logged(MON), logged(WED), logged(FRI)]

  it('numbers by position in the week, not by what was trained', () => {
    expect(dayNumberFor(sessions, MON)).toBe(1)
    expect(dayNumberFor(sessions, WED)).toBe(2)
    expect(dayNumberFor(sessions, FRI)).toBe(3)
  })

  it('renumbers the week when an earlier session is backdated in', () => {
    // The reason the number is derived and never stored. Log Wednesday first,
    // add Monday after, and Wednesday has to become Day 2.
    expect(dayNumberFor([logged(WED)], WED)).toBe(1)
    expect(dayNumberFor([logged(WED), logged(MON)], WED)).toBe(2)
  })

  it('numbers each week from one again', () => {
    const twoWeeks = [logged(MON), logged(WED), logged(NEXT_MON)]
    expect(dayNumberFor(twoWeeks, NEXT_MON)).toBe(1)
  })

  it('gives no number to a day with nothing logged', () => {
    expect(dayNumberFor([logged(MON)], TUE)).toBeNull()
    expect(dayNumberFor([empty(TUE)], TUE)).toBeNull()
  })
})

// ── weekSlots ────────────────────────────────────────────────────────────────

describe('weekSlots', () => {
  it('fills the planned slots in date order and leaves the rest to come', () => {
    const slots = weekSlots([logged(MON), logged(WED)], WEEK, 3, WED)

    expect(slots.map(s => s.day)).toEqual([1, 2, 3])
    expect(slots.map(s => s.session?.date ?? null)).toEqual([MON, WED, null])
  })

  it('marks the slot a session logged today would land in', () => {
    const slots = weekSlots([logged(MON)], WEEK, 3, WED)
    expect(slots.find(s => s.isToday)?.day).toBe(2)
    expect(slots.find(s => s.isToday)?.session).toBeNull()
  })

  it('marks today’s own slot once it has been logged', () => {
    const slots = weekSlots([logged(MON), logged(WED)], WEEK, 3, WED)
    expect(slots.find(s => s.isToday)?.day).toBe(2)
    expect(slots.find(s => s.isToday)?.session?.date).toBe(WED)
  })

  it('grows past the plan rather than hiding a session that happened', () => {
    // Four days trained on a three-day plan. A setting must never be the reason
    // real training has nowhere to appear.
    const sessions = [logged(MON), logged(TUE), logged(WED), logged(THU)]
    const slots = weekSlots(sessions, WEEK, 3, THU)

    expect(slots).toHaveLength(4)
    expect(slots[3].session?.date).toBe(THU)
  })

  it('shows the full plan before anything has been logged', () => {
    const slots = weekSlots([], WEEK, 5, MON)
    expect(slots).toHaveLength(5)
    expect(slots.every(s => s.session === null)).toBe(true)
    expect(slots.find(s => s.isToday)?.day).toBe(1)
  })

  it('marks no slot as today when looking at another week', () => {
    const slots = weekSlots([logged(MON), logged(WED)], WEEK, 3, NEXT_MON)
    expect(slots.some(s => s.isToday)).toBe(false)
  })

  it('honours every offered day count', () => {
    for (const n of TRAINING_DAY_CHOICES) {
      expect(weekSlots([], WEEK, n, MON)).toHaveLength(n)
    }
  })
})

// ── The setting ──────────────────────────────────────────────────────────────

describe('isTrainingDays', () => {
  it('accepts two through six', () => {
    for (const n of [2, 3, 4, 5, 6]) expect(isTrainingDays(n)).toBe(true)
  })

  it('refuses anything else, including what storage might hand back', () => {
    for (const bad of [1, 7, 0, -3, 3.5, '3', null, undefined, {}]) {
      expect(isTrainingDays(bad)).toBe(false)
    }
  })

  it('defaults to the three-day week the app shipped with', () => {
    expect(DEFAULT_TRAINING_DAYS).toBe(3)
    expect(isTrainingDays(DEFAULT_TRAINING_DAYS)).toBe(true)
  })
})
