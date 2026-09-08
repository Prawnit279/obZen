import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import type { CheckIn } from '@/db/dexie'
import {
  saveCheckIn, getTodayCheckIn, getRecentCheckIns, calcWorkoutStreak,
} from '@/lib/checkin'
import { todayISO } from '@/lib/utils'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

// ── Fixtures ─────────────────────────────────────────────────────────────────

function checkIn(over: Partial<Omit<CheckIn, 'id'>> = {}): Omit<CheckIn, 'id'> {
  return {
    date: todayISO(),
    mood: 3,
    energy: 3,
    soreness: 'none',
    forearmFatigue: false,
    ...over,
  }
}

/**
 * N days before today as the module reads dates.
 *
 * `todayISO` and `calcWorkoutStreak` both format through `toISOString`, so the
 * whole module works in UTC days; stepping by whole days here keeps these
 * fixtures aligned with it in any timezone.
 */
function utcDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().split('T')[0]
}

// ── saveCheckIn ──────────────────────────────────────────────────────────────

describe('saveCheckIn', () => {
  it('writes a new check-in and returns its id', async () => {
    const id = await saveCheckIn(checkIn({ mood: 4, energy: 5 }))
    const stored = await db.checkIns.get(id)

    expect(typeof id).toBe('number')
    expect(stored?.mood).toBe(4)
    expect(stored?.energy).toBe(5)
  })

  it('overwrites the same day rather than logging it twice', async () => {
    // One check-in per day is the whole contract — a second entry for today is
    // a correction, not a new reading.
    const first = await saveCheckIn(checkIn({ mood: 2 }))
    const second = await saveCheckIn(checkIn({ mood: 5 }))

    expect(second).toBe(first)
    expect(await db.checkIns.count()).toBe(1)
    expect((await db.checkIns.get(first))?.mood).toBe(5)
  })

  it('keeps different days apart', async () => {
    await saveCheckIn(checkIn({ date: utcDaysAgo(0) }))
    await saveCheckIn(checkIn({ date: utcDaysAgo(1) }))
    expect(await db.checkIns.count()).toBe(2)
  })

  it('carries every field through, optional ones included', async () => {
    const id = await saveCheckIn(checkIn({
      mood: 5, energy: 1, soreness: 'high', forearmFatigue: true, notes: 'slept badly',
    }))
    expect(await db.checkIns.get(id)).toMatchObject({
      mood: 5, energy: 1, soreness: 'high', forearmFatigue: true, notes: 'slept badly',
    })
  })

  it('replaces the stored fields on an overwrite', async () => {
    const id = await saveCheckIn(checkIn({ soreness: 'high', notes: 'stiff' }))
    await saveCheckIn(checkIn({ soreness: 'none' }))

    const stored = await db.checkIns.get(id)
    expect(stored?.soreness).toBe('none')
  })
})

// ── getTodayCheckIn ──────────────────────────────────────────────────────────

describe('getTodayCheckIn', () => {
  it('finds the entry for today', async () => {
    await saveCheckIn(checkIn({ mood: 4 }))
    expect((await getTodayCheckIn())?.mood).toBe(4)
  })

  it('returns nothing before one is logged', async () => {
    expect(await getTodayCheckIn()).toBeUndefined()
  })

  it('does not return yesterday’s entry', async () => {
    // A stale check-in shown as today's would misreport how you feel now.
    await saveCheckIn(checkIn({ date: utcDaysAgo(1), mood: 5 }))
    expect(await getTodayCheckIn()).toBeUndefined()
  })
})

// ── getRecentCheckIns ────────────────────────────────────────────────────────

describe('getRecentCheckIns', () => {
  it('returns entries inside the window', async () => {
    await saveCheckIn(checkIn({ date: utcDaysAgo(0) }))
    await saveCheckIn(checkIn({ date: utcDaysAgo(2) }))
    await saveCheckIn(checkIn({ date: utcDaysAgo(5) }))

    expect(await getRecentCheckIns(7)).toHaveLength(3)
  })

  it('drops anything older than the window', async () => {
    await saveCheckIn(checkIn({ date: utcDaysAgo(1) }))
    await saveCheckIn(checkIn({ date: utcDaysAgo(40) }))

    const recent = await getRecentCheckIns(7)
    expect(recent).toHaveLength(1)
    expect(recent[0].date).toBe(utcDaysAgo(1))
  })

  it('defaults to a week', async () => {
    await saveCheckIn(checkIn({ date: utcDaysAgo(3) }))
    await saveCheckIn(checkIn({ date: utcDaysAgo(20) }))
    expect(await getRecentCheckIns()).toHaveLength(1)
  })

  it('honours a wider window', async () => {
    await saveCheckIn(checkIn({ date: utcDaysAgo(3) }))
    await saveCheckIn(checkIn({ date: utcDaysAgo(20) }))
    expect(await getRecentCheckIns(30)).toHaveLength(2)
  })

  it('is empty when nothing has been logged', async () => {
    expect(await getRecentCheckIns()).toEqual([])
  })
})

// ── calcWorkoutStreak ────────────────────────────────────────────────────────

describe('calcWorkoutStreak', () => {
  const done = (date: string) => ({ date, completedAt: `${date}T18:00:00.000Z` })

  it('counts consecutive completed days back from today', () => {
    expect(calcWorkoutStreak([done(utcDaysAgo(0)), done(utcDaysAgo(1)), done(utcDaysAgo(2))]))
      .toBe(3)
  })

  it('stops at the first gap', () => {
    expect(calcWorkoutStreak([done(utcDaysAgo(0)), done(utcDaysAgo(1)), done(utcDaysAgo(3))]))
      .toBe(2)
  })

  it('is zero when today is missing, however long the run before it', () => {
    // The streak is anchored to today, so yesterday's run does not carry.
    expect(calcWorkoutStreak([done(utcDaysAgo(1)), done(utcDaysAgo(2)), done(utcDaysAgo(3))]))
      .toBe(0)
  })

  it('ignores sessions that were started but never completed', () => {
    expect(calcWorkoutStreak([
      { date: utcDaysAgo(0) },              // no completedAt
      done(utcDaysAgo(1)),
    ])).toBe(0)
  })

  it('counts a day once even when it holds several sessions', () => {
    expect(calcWorkoutStreak([done(utcDaysAgo(0)), done(utcDaysAgo(0)), done(utcDaysAgo(1))]))
      .toBe(2)
  })

  it('does not care what order the sessions arrive in', () => {
    expect(calcWorkoutStreak([done(utcDaysAgo(2)), done(utcDaysAgo(0)), done(utcDaysAgo(1))]))
      .toBe(3)
  })

  it('is zero for no sessions at all', () => {
    expect(calcWorkoutStreak([])).toBe(0)
  })

  it('is not thrown off by future-dated rows', () => {
    expect(calcWorkoutStreak([done(utcDaysAgo(-1)), done(utcDaysAgo(0))])).toBe(1)
  })
})
