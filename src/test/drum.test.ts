import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import type { DrumSession, Song } from '@/db/dexie'
import {
  startDrumSession, completeDrumSession, logRudiment,
  addSong, updateSong, deleteSong,
  getRecentDrumSessions, getRudimentLogsForSession, calcDrumStreak,
} from '@/lib/drum'
import { todayISO } from '@/lib/utils'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

// ── Fixtures ─────────────────────────────────────────────────────────────────

function song(over: Partial<Omit<Song, 'id' | 'addedAt'>> = {}): Omit<Song, 'id' | 'addedAt'> {
  return {
    title: 'Rosanna',
    artist: 'Toto',
    status: 'learning',
    purpose: 'cover',
    ...over,
  }
}

/**
 * The date string `calcDrumStreak` will read as N days before today.
 *
 * The function parses 'YYYY-MM-DD' with `new Date(...)`, which is UTC midnight,
 * and then compares against a *local* midnight. West of Greenwich those are
 * different days, so a plain local date string would make these tests pass only
 * east of UTC. Searching for the string the function actually resolves to the
 * wanted day keeps them meaningful everywhere — and documents the mismatch
 * rather than hiding it.
 */
function drumDate(daysAgo: number): string {
  const target = new Date()
  target.setHours(0, 0, 0, 0)
  target.setDate(target.getDate() - daysAgo)

  for (let shift = -1; shift <= 1; shift++) {
    const candidate = new Date(target)
    candidate.setDate(candidate.getDate() + shift)
    const iso = [
      candidate.getFullYear(),
      String(candidate.getMonth() + 1).padStart(2, '0'),
      String(candidate.getDate()).padStart(2, '0'),
    ].join('-')

    const asRead = new Date(iso)
    asRead.setHours(0, 0, 0, 0)
    if (asRead.getTime() === target.getTime()) return iso
  }
  throw new Error(`no date string resolves to ${daysAgo} days ago`)
}

// ── Sessions ─────────────────────────────────────────────────────────────────

describe('startDrumSession', () => {
  it('opens a session dated today and returns its id', async () => {
    const id = await startDrumSession('Rudiments')
    const row = await db.drumSessions.get(id)

    expect(typeof id).toBe('number')
    expect(row?.focusArea).toBe('Rudiments')
    expect(row?.date).toBe(todayISO())
  })

  it('starts at zero duration and unfinished', async () => {
    const row = await db.drumSessions.get(await startDrumSession('Grooves'))
    expect(row?.duration).toBe(0)
    expect(row?.completedAt).toBeUndefined()
  })

  it('keeps a book reference when one is given', async () => {
    const withRef = await db.drumSessions.get(await startDrumSession('Reading', 'Stick Control p.5'))
    const without = await db.drumSessions.get(await startDrumSession('Reading'))

    expect(withRef?.bookRef).toBe('Stick Control p.5')
    expect(without?.bookRef).toBeUndefined()
  })
})

describe('completeDrumSession', () => {
  it('records duration, tempo and the finish time', async () => {
    const id = await startDrumSession('Rudiments')
    await completeDrumSession(id, 1800, 120, 'clean at 120')

    const row = await db.drumSessions.get(id)
    expect(row?.duration).toBe(1800)
    expect(row?.bpmAchieved).toBe(120)
    expect(row?.notes).toBe('clean at 120')
    expect(Number.isNaN(Date.parse(row!.completedAt!))).toBe(false)
  })

  it('completes without a tempo or notes', async () => {
    const id = await startDrumSession('Grooves')
    await completeDrumSession(id, 600)

    const row = await db.drumSessions.get(id)
    expect(row?.duration).toBe(600)
    expect(row?.completedAt).toBeDefined()
    expect(row?.bpmAchieved).toBeUndefined()
  })

  it('leaves the focus area alone', async () => {
    const id = await startDrumSession('Independence')
    await completeDrumSession(id, 900)
    expect((await db.drumSessions.get(id))?.focusArea).toBe('Independence')
  })
})

// ── Rudiment logs ────────────────────────────────────────────────────────────

describe('logRudiment', () => {
  it('stores the rudiment, tempo and session it belongs to', async () => {
    const sessionId = await startDrumSession('Rudiments')
    const id = await logRudiment(sessionId, 'single-stroke-roll', 140, 'right hand lagging')

    expect(await db.rudimentLogs.get(id)).toMatchObject({
      sessionId, rudimentId: 'single-stroke-roll', bpm: 140, notes: 'right hand lagging',
    })
  })

  it('dates the log today', async () => {
    const id = await logRudiment(1, 'paradiddle', 100)
    expect((await db.rudimentLogs.get(id))?.date).toBe(todayISO())
  })
})

describe('getRudimentLogsForSession', () => {
  it('returns only the logs for that session', async () => {
    await logRudiment(1, 'paradiddle', 100)
    await logRudiment(1, 'flam', 90)
    await logRudiment(2, 'double-stroke-roll', 110)

    const mine = await getRudimentLogsForSession(1)
    expect(mine.map(l => l.rudimentId).sort()).toEqual(['flam', 'paradiddle'])
  })

  it('is empty for a session with nothing logged', async () => {
    expect(await getRudimentLogsForSession(99)).toEqual([])
  })
})

// ── Songs ────────────────────────────────────────────────────────────────────

describe('addSong', () => {
  it('stores the song and stamps when it was added', async () => {
    const id = await addSong(song({ bpm: 88, timeSignature: '4/4' }))
    const stored = await db.songs.get(id)

    expect(stored).toMatchObject({ title: 'Rosanna', artist: 'Toto', bpm: 88, timeSignature: '4/4' })
    expect(Number.isNaN(Date.parse(stored!.addedAt))).toBe(false)
  })

  it('does not take an addedAt from the caller', async () => {
    // The stamp is the module's to set, so a passed-in value cannot rewrite it.
    const id = await addSong({ ...song(), addedAt: '1999-01-01T00:00:00.000Z' } as Omit<Song, 'id' | 'addedAt'>)
    expect((await db.songs.get(id))?.addedAt).not.toBe('1999-01-01T00:00:00.000Z')
  })
})

describe('updateSong', () => {
  it('merges the change and leaves the rest alone', async () => {
    const id = await addSong(song({ status: 'learning' }))
    await updateSong(id, { status: 'ready' })

    const stored = await db.songs.get(id)
    expect(stored?.status).toBe('ready')
    expect(stored?.title).toBe('Rosanna')
  })

  it('keeps the original added stamp', async () => {
    const id = await addSong(song())
    const before = (await db.songs.get(id))?.addedAt
    await updateSong(id, { bpm: 92 })
    expect((await db.songs.get(id))?.addedAt).toBe(before)
  })
})

describe('deleteSong', () => {
  it('removes the song', async () => {
    const id = await addSong(song())
    await deleteSong(id)
    expect(await db.songs.get(id)).toBeUndefined()
  })

  it('leaves the other songs alone', async () => {
    const keep = await addSong(song({ title: 'Keep' }))
    await deleteSong(await addSong(song({ title: 'Drop' })))

    expect(await db.songs.count()).toBe(1)
    expect((await db.songs.get(keep))?.title).toBe('Keep')
  })
})

// ── Recents ──────────────────────────────────────────────────────────────────

describe('getRecentDrumSessions', () => {
  it('returns sessions newest first', async () => {
    await db.drumSessions.bulkAdd([
      { date: '2026-09-01', focusArea: 'A', duration: 0 },
      { date: '2026-09-05', focusArea: 'B', duration: 0 },
      { date: '2026-09-03', focusArea: 'C', duration: 0 },
    ])
    expect((await getRecentDrumSessions()).map(s => s.focusArea)).toEqual(['B', 'C', 'A'])
  })

  it('honours the limit and defaults to twenty', async () => {
    const many: DrumSession[] = Array.from({ length: 25 }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, '0')}`, focusArea: `F${i}`, duration: 0,
    }))
    await db.drumSessions.bulkAdd(many)

    expect(await getRecentDrumSessions(5)).toHaveLength(5)
    expect(await getRecentDrumSessions()).toHaveLength(20)
  })

  it('is empty on an empty table', async () => {
    expect(await getRecentDrumSessions()).toEqual([])
  })
})

// ── Streak ───────────────────────────────────────────────────────────────────

describe('calcDrumStreak', () => {
  const done = (daysAgo: number): DrumSession => ({
    date: drumDate(daysAgo), focusArea: 'Rudiments', duration: 600,
    completedAt: '2026-09-08T18:00:00.000Z',
  })

  it('counts consecutive completed days back from today', () => {
    expect(calcDrumStreak([done(0), done(1), done(2)])).toBe(3)
  })

  it('stops at the first gap', () => {
    expect(calcDrumStreak([done(0), done(1), done(3)])).toBe(2)
  })

  it('is zero when today has no session', () => {
    expect(calcDrumStreak([done(1), done(2)])).toBe(0)
  })

  it('ignores sessions that were started but never completed', () => {
    const open: DrumSession = { date: drumDate(0), focusArea: 'Grooves', duration: 0 }
    expect(calcDrumStreak([open, done(1)])).toBe(0)
  })

  it('is zero for an empty list', () => {
    expect(calcDrumStreak([])).toBe(0)
  })

  it('is zero when nothing was ever completed', () => {
    const open: DrumSession = { date: drumDate(0), focusArea: 'Grooves', duration: 0 }
    expect(calcDrumStreak([open])).toBe(0)
  })

  it('does not care what order the sessions arrive in', () => {
    expect(calcDrumStreak([done(2), done(0), done(1)])).toBe(3)
  })

  it('counts a single day as one', () => {
    expect(calcDrumStreak([done(0)])).toBe(1)
  })
})
