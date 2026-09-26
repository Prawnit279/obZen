/**
 * Week-by-week volume, for reading rather than for charting.
 *
 * `weeklyVolume` deliberately omits untrained weeks, which is right for looking
 * one up by key and wrong for a tracker: a fortnight off is the most
 * interesting thing a volume history can tell you, and a series that simply
 * skips it reads as continuous training. So every week inside the range appears
 * here, trained or not, and a zero is a real answer.
 *
 * The three readings — everything, main work, assistance — are gathered in one
 * pass so a row cannot disagree with itself about its own week.
 */
import { describe, it, expect } from 'vitest'
import { volumeWeeks } from '@/lib/volumeWeeks'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import { isoWeekKey, lbToKg, kgToLb } from '@/lib/progress'
import { DEFAULT_BAR_LB } from '@/lib/barWeight'

const TODAY = '2026-09-24'          // a Thursday
const BAR = lbToKg(DEFAULT_BAR_LB)

function set(weight: number, reps: number, supplemental = false): LoggedSet {
  return {
    setNumber: 1, weight, reps, unit: 'kg',
    timestamp: '2026-01-01T10:00:00.000Z',
    ...(supplemental ? { isSupplemental: true } : {}),
  }
}

function session(date: string, sets: LoggedSet[]): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    exercises: [{ exerciseId: 'deadlift', status: 'complete', sets }],
    order: ['deadlift'],
  } as WorkoutDaySession
}

describe('volumeWeeks', () => {
  it('returns nothing at all when nothing has been logged', () => {
    // "All" over an empty log has no first week to start from. A row of zeroes
    // would invent a history.
    expect(volumeWeeks([], 0, 'all', TODAY)).toEqual([])
  })

  it('spans exactly the weeks the range asks for', () => {
    const weeks = volumeWeeks([session(TODAY, [set(100, 5)])], 0, '8w', TODAY)
    expect(weeks).toHaveLength(8)
  })

  it('runs oldest first and ends on this week', () => {
    const weeks = volumeWeeks([session(TODAY, [set(100, 5)])], 0, '8w', TODAY)
    const keys = weeks.map(w => w.week)
    expect(keys).toEqual([...keys].sort())
    expect(keys[keys.length - 1]).toBe(isoWeekKey(TODAY))
  })

  it('keeps an untrained week as a zero rather than skipping it', () => {
    // The whole reason this exists. A fortnight off has to be visible.
    const weeks = volumeWeeks([session(TODAY, [set(100, 5)])], 0, '8w', TODAY)
    const quiet = weeks.slice(0, -1)
    expect(quiet).not.toHaveLength(0)
    for (const w of quiet) {
      expect(w.total.sets, w.week).toBe(0)
      expect(w.total.tonnageKg, w.week).toBe(0)
    }
  })

  it('labels each week with its Monday, so a row can name a real date', () => {
    const weeks = volumeWeeks([session(TODAY, [set(100, 5)])], 0, '8w', TODAY)
    const last = weeks[weeks.length - 1]
    // The week containing Thursday 2026-09-24 begins on Monday the 21st.
    expect(last.startISO).toBe('2026-09-21')
    // And every row's Monday really is a Monday.
    for (const w of weeks) {
      expect(new Date(`${w.startISO}T12:00:00`).getDay(), w.startISO).toBe(1)
    }
  })

  it('splits each week into main work and assistance', () => {
    const weeks = volumeWeeks(
      [session(TODAY, [set(100, 5), set(50, 10, true), set(50, 10, true)])],
      0, '8w', TODAY
    )
    const now = weeks[weeks.length - 1]
    expect(now.total.sets).toBe(3)
    expect(now.main.sets).toBe(1)
    expect(now.supplemental.sets).toBe(2)
  })

  it('makes the two halves add back up to the whole, every week', () => {
    const weeks = volumeWeeks(
      [
        session('2026-09-17', [set(100, 3), set(60, 10, true)]),
        session(TODAY, [set(110, 3), set(60, 10, true), set(60, 10, true)]),
      ],
      0, '8w', TODAY
    )
    for (const w of weeks) {
      expect(w.main.sets + w.supplemental.sets, w.week).toBe(w.total.sets)
      expect(
        w.main.tonnageKg + w.supplemental.tonnageKg, w.week
      ).toBeCloseTo(w.total.tonnageKg, 6)
    }
  })

  it('counts the bar, like every other weight reading', () => {
    const weeks = volumeWeeks([session(TODAY, [set(100, 5)])], 0, '8w', TODAY)
    const now = weeks[weeks.length - 1]
    expect(now.total.tonnageKg).toBeCloseTo((100 + BAR) * 5, 4)
  })

  it('starts "all" at the first week actually trained', () => {
    const weeks = volumeWeeks(
      [session('2026-08-05', [set(100, 5)]), session(TODAY, [set(100, 5)])],
      0, 'all', TODAY
    )
    expect(weeks[0].week).toBe(isoWeekKey('2026-08-05'))
    expect(weeks[weeks.length - 1].week).toBe(isoWeekKey(TODAY))
    // Every week between the two is present, including the empty ones.
    expect(weeks.length).toBeGreaterThan(5)
  })

  it('reaches further back for six months than for eight weeks', () => {
    const sessions = [session('2026-05-06', [set(100, 5)]), session(TODAY, [set(100, 5)])]
    const short = volumeWeeks(sessions, 0, '8w', TODAY)
    const long = volumeWeeks(sessions, 0, '6m', TODAY)
    expect(long.length).toBeGreaterThan(short.length)
    // The older session falls outside eight weeks and inside six months.
    expect(short.some(w => w.total.sets > 0 && w.week === isoWeekKey('2026-05-06'))).toBe(false)
    expect(long.some(w => w.total.sets > 0 && w.week === isoWeekKey('2026-05-06'))).toBe(true)
  })

  it('scores assisted work on the load moved, not the number in the field', () => {
    const assisted = {
      ...session(TODAY, [set(30, 6)]),
      exercises: [{ exerciseId: 'assisted-pull-up', status: 'complete' as const, sets: [set(30, 6)] }],
    } as WorkoutDaySession
    const weeks = volumeWeeks([assisted], 70, 'all', TODAY)
    // 70 kg of lifter less 30 kg of assistance, six times.
    expect(weeks[weeks.length - 1].total.tonnageKg).toBeCloseTo((70 - 30) * 6, 4)
  })

  it('reports tonnage in kilos, leaving the pound conversion to the caller', () => {
    // Same contract as `weeklyVolume`, so a caller cannot convert twice.
    const weeks = volumeWeeks([session(TODAY, [set(100, 5)])], 0, '8w', TODAY)
    const kg = weeks[weeks.length - 1].total.tonnageKg
    expect(kgToLb(kg)).toBeGreaterThan(kg)
  })
})
