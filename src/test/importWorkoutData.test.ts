import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/db/dexie'
import { importWorkoutData } from '@/utils/importWorkoutData'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Stub global fetch to serve `payload` (or an HTTP error) for the import file. */
function stubFetch(payload: unknown, opts: { ok?: boolean; status?: number; invalidJson?: boolean } = {}) {
  const { ok = true, status = 200, invalidJson = false } = opts
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok,
    status,
    json: async () => {
      if (invalidJson) throw new SyntaxError('Unexpected token')
      return payload
    },
  })))
}

async function resetDb() {
  await db.delete()
  await db.open()
}

beforeEach(resetDb)
afterEach(() => vi.unstubAllGlobals())

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('importWorkoutData — explicit ids', () => {
  it('remaps exerciseLogs to the correct session when ids collide with positions', async () => {
    // Session A has explicit id 2 at index 0; the OLD code would let session B's
    // positional key (index 1 → i+1 = 2) overwrite A's id=2 mapping.
    stubFetch({
      workoutSessions: [
        { id: 2, date: '2026-01-01', dayLabel: 'A' },
        { id: 5, date: '2026-01-02', dayLabel: 'B' },
      ],
      exerciseLogs: [
        { sessionId: 2, exerciseId: 'sq', exerciseName: 'Squat', date: '2026-01-01', sets: [] },
        { sessionId: 5, exerciseId: 'bp', exerciseName: 'Bench', date: '2026-01-02', sets: [] },
      ],
    })

    const result = await importWorkoutData()
    expect(result).toMatchObject({ sessions: 2, exercises: 2, skipped: false })

    const sessions = await db.workoutSessions.toArray()
    const idA = sessions.find(s => s.dayLabel === 'A')!.id
    const idB = sessions.find(s => s.dayLabel === 'B')!.id

    const logs = await db.exerciseLogs.toArray()
    const squat = logs.find(l => l.exerciseName === 'Squat')!
    const bench = logs.find(l => l.exerciseName === 'Bench')!

    expect(squat.sessionId).toBe(idA)
    expect(bench.sessionId).toBe(idB)
  })

  it('strips incoming ids and lets Dexie assign fresh ones', async () => {
    stubFetch({
      workoutSessions: [{ id: 99, date: '2026-01-01', dayLabel: 'A' }],
      exerciseLogs: [],
    })
    await importWorkoutData()
    const session = await db.workoutSessions.toArray()
    expect(session).toHaveLength(1)
    expect(session[0].id).not.toBe(99)
    expect(typeof session[0].id).toBe('number')
  })
})

describe('importWorkoutData — positional ids', () => {
  it('maps 1-based sessionIds to the right sessions without collision', async () => {
    stubFetch({
      workoutSessions: [
        { date: '2026-01-01', dayLabel: 'A' },
        { date: '2026-01-02', dayLabel: 'B' },
        { date: '2026-01-03', dayLabel: 'C' },
      ],
      exerciseLogs: [
        { sessionId: 1, exerciseId: 'a', exerciseName: 'ExA', date: '2026-01-01', sets: [] },
        { sessionId: 3, exerciseId: 'c', exerciseName: 'ExC', date: '2026-01-03', sets: [] },
      ],
    })

    await importWorkoutData()
    const sessions = await db.workoutSessions.toArray()
    const idA = sessions.find(s => s.dayLabel === 'A')!.id
    const idC = sessions.find(s => s.dayLabel === 'C')!.id

    const logs = await db.exerciseLogs.toArray()
    expect(logs.find(l => l.exerciseName === 'ExA')!.sessionId).toBe(idA)
    expect(logs.find(l => l.exerciseName === 'ExC')!.sessionId).toBe(idC)
  })

  it('maps 0-based sessionIds when a log references index 0', async () => {
    stubFetch({
      workoutSessions: [
        { date: '2026-01-01', dayLabel: 'A' },
        { date: '2026-01-02', dayLabel: 'B' },
      ],
      exerciseLogs: [
        { sessionId: 0, exerciseId: 'a', exerciseName: 'ExA', date: '2026-01-01', sets: [] },
        { sessionId: 1, exerciseId: 'b', exerciseName: 'ExB', date: '2026-01-02', sets: [] },
      ],
    })

    await importWorkoutData()
    const sessions = await db.workoutSessions.toArray()
    const idA = sessions.find(s => s.dayLabel === 'A')!.id
    const idB = sessions.find(s => s.dayLabel === 'B')!.id

    const logs = await db.exerciseLogs.toArray()
    expect(logs.find(l => l.exerciseName === 'ExA')!.sessionId).toBe(idA)
    expect(logs.find(l => l.exerciseName === 'ExB')!.sessionId).toBe(idB)
  })
})

describe('importWorkoutData — idempotency & optional data', () => {
  it('skips on the second call and does not duplicate records', async () => {
    stubFetch({
      workoutSessions: [{ date: '2026-01-01', dayLabel: 'A' }],
      exerciseLogs: [{ sessionId: 1, exerciseId: 'a', exerciseName: 'ExA', date: '2026-01-01', sets: [] }],
    })

    const first = await importWorkoutData()
    expect(first.skipped).toBe(false)

    const second = await importWorkoutData()
    expect(second).toMatchObject({ sessions: 0, exercises: 0, skipped: true })

    expect(await db.workoutSessions.count()).toBe(1)
    expect(await db.exerciseLogs.count()).toBe(1)
  })

  it('imports optional workoutDaySessions', async () => {
    stubFetch({
      workoutSessions: [],
      exerciseLogs: [],
      workoutDaySessions: [{ date: '2026-01-01', dayLabel: 'A' }],
    })
    const result = await importWorkoutData()
    expect(result.daySessions).toBe(1)
    expect(await db.workoutDaySessions.count()).toBe(1)
  })
})

describe('importWorkoutData — error handling', () => {
  it('throws a helpful message when the file is missing', async () => {
    stubFetch(null, { ok: false, status: 404 })
    await expect(importWorkoutData()).rejects.toThrow(/HTTP 404|public folder/)
  })

  it('throws when the file contains invalid JSON', async () => {
    stubFetch(null, { invalidJson: true })
    await expect(importWorkoutData()).rejects.toThrow(/invalid JSON/i)
  })

  it('throws when the payload is not an object', async () => {
    stubFetch('not-an-object')
    await expect(importWorkoutData()).rejects.toThrow(/must be a JSON object/i)
  })
})
