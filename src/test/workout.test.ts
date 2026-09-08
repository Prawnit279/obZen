/**
 * Tests for `lib/workout.ts` — the legacy session layer.
 *
 * This module writes `workoutSessions` and `exerciseLogs`, the pair the app
 * moved off when day sessions replaced them, and its only importer
 * (`ActiveSession.tsx`) is itself unreachable. It is covered here because it is
 * still shipped, and because `buildInitialSets` encodes a prescription grammar
 * — "140×8×2", "+25lbs×5×6", "BW×5" — that is worth pinning down wherever it
 * ends up living.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import type { ExerciseLog, SetLog } from '@/db/dexie'
import {
  startWorkoutSession, completeWorkoutSession,
  saveExerciseLog, updateExerciseLog, getSessionLogs, getExerciseHistory,
  buildInitialSets, calcProgressiveOverload,
  getWeeklySessionCount, getRecentSessions,
} from '@/lib/workout'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

// ── Fixtures ─────────────────────────────────────────────────────────────────

function set(over: Partial<SetLog> = {}): SetLog {
  return { setNumber: 1, weight: '100', reps: 5, isWarmup: false, completed: true, ...over }
}

function log(over: Partial<Omit<ExerciseLog, 'id'>> = {}): Omit<ExerciseLog, 'id'> {
  return {
    sessionId: 1,
    exerciseId: 'bench-press',
    exerciseName: 'Bench Press',
    date: '2026-09-01',
    sets: [set()],
    ...over,
  }
}

/** Today, in the local-date form the module writes. */
function todayLocalISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** N days before today, as a local ISO date. */
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Sessions ─────────────────────────────────────────────────────────────────

describe('startWorkoutSession', () => {
  it('writes a row dated today and returns its id', async () => {
    const id = await startWorkoutSession('Day 1')
    const row = await db.workoutSessions.get(id)

    expect(typeof id).toBe('number')
    expect(row?.dayLabel).toBe('Day 1')
    expect(row?.date).toBe(todayLocalISO())
  })

  it('leaves the session open — starting one is not finishing it', async () => {
    const id = await startWorkoutSession('Day 2')
    expect((await db.workoutSessions.get(id))?.completedAt).toBeUndefined()
  })

  it('gives each session its own id', async () => {
    const a = await startWorkoutSession('Day 1')
    const b = await startWorkoutSession('Day 1')
    expect(a).not.toBe(b)
  })
})

describe('completeWorkoutSession', () => {
  it('stamps the finish time', async () => {
    const id = await startWorkoutSession('Day 1')
    await completeWorkoutSession(id)

    const completedAt = (await db.workoutSessions.get(id))?.completedAt
    expect(completedAt).toBeDefined()
    expect(Number.isNaN(Date.parse(completedAt!))).toBe(false)
  })

  it('does nothing for an id that is not there', async () => {
    // Dexie's update is a no-op on a missing key rather than a throw, and the
    // caller has no way to tell — worth pinning so a future change is noticed.
    await expect(completeWorkoutSession(9999)).resolves.toBeUndefined()
    expect(await db.workoutSessions.count()).toBe(0)
  })
})

// ── Exercise logs ────────────────────────────────────────────────────────────

describe('saveExerciseLog and updateExerciseLog', () => {
  it('round-trips a log through the table', async () => {
    const id = await saveExerciseLog(log())
    const stored = await db.exerciseLogs.get(id)

    expect(stored?.exerciseName).toBe('Bench Press')
    expect(stored?.sets).toHaveLength(1)
  })

  it('merges an update rather than replacing the row', async () => {
    const id = await saveExerciseLog(log())
    await updateExerciseLog(id, { skipped: true })

    const stored = await db.exerciseLogs.get(id)
    expect(stored?.skipped).toBe(true)
    expect(stored?.exerciseName).toBe('Bench Press') // untouched
  })

  it('replaces the set list when one is given', async () => {
    const id = await saveExerciseLog(log())
    await updateExerciseLog(id, { sets: [set({ setNumber: 1 }), set({ setNumber: 2 })] })
    expect((await db.exerciseLogs.get(id))?.sets).toHaveLength(2)
  })
})

describe('getSessionLogs', () => {
  it('returns only the logs belonging to that session', async () => {
    await saveExerciseLog(log({ sessionId: 1, exerciseName: 'A' }))
    await saveExerciseLog(log({ sessionId: 1, exerciseName: 'B' }))
    await saveExerciseLog(log({ sessionId: 2, exerciseName: 'C' }))

    const mine = await getSessionLogs(1)
    expect(mine.map(l => l.exerciseName).sort()).toEqual(['A', 'B'])
  })

  it('returns nothing for a session with no logs', async () => {
    expect(await getSessionLogs(42)).toEqual([])
  })
})

describe('getExerciseHistory', () => {
  it('returns entries for that movement inside the window', async () => {
    await saveExerciseLog(log({ exerciseName: 'Bench Press', date: daysAgo(3) }))
    await saveExerciseLog(log({ exerciseName: 'Bench Press', date: daysAgo(10) }))

    expect(await getExerciseHistory('Bench Press', 30)).toHaveLength(2)
  })

  it('drops anything older than the window', async () => {
    await saveExerciseLog(log({ exerciseName: 'Bench Press', date: daysAgo(2) }))
    await saveExerciseLog(log({ exerciseName: 'Bench Press', date: daysAgo(60) }))

    const recent = await getExerciseHistory('Bench Press', 30)
    expect(recent).toHaveLength(1)
    expect(recent[0].date).toBe(daysAgo(2))
  })

  it('matches on the name, not the id', async () => {
    // The filter is by display name, so two ids sharing a name both come back.
    await saveExerciseLog(log({ exerciseId: 'bench-press', exerciseName: 'Bench Press', date: daysAgo(1) }))
    await saveExerciseLog(log({ exerciseId: 'barbell-bench', exerciseName: 'Bench Press', date: daysAgo(1) }))
    await saveExerciseLog(log({ exerciseId: 'deadlift', exerciseName: 'Deadlift', date: daysAgo(1) }))

    expect(await getExerciseHistory('Bench Press')).toHaveLength(2)
  })

  it('defaults to a thirty-day window', async () => {
    await saveExerciseLog(log({ date: daysAgo(29) }))
    await saveExerciseLog(log({ date: daysAgo(45) }))
    expect(await getExerciseHistory('Bench Press')).toHaveLength(1)
  })

  it('returns nothing for a movement never logged', async () => {
    expect(await getExerciseHistory('Zercher Squat')).toEqual([])
  })
})

// ── The prescription grammar ─────────────────────────────────────────────────

describe('buildInitialSets', () => {
  it('expands weight×reps×sets into that many rows', () => {
    const sets = buildInitialSets('140×8×2', '')
    expect(sets).toHaveLength(2)
    expect(sets[0]).toEqual({ setNumber: 1, weight: '140', reps: 8, isWarmup: false, completed: false })
    expect(sets[1].setNumber).toBe(2)
  })

  it('treats a missing set count as a single set', () => {
    expect(buildInitialSets('20×10', '')).toHaveLength(1)
  })

  it('keeps the weight as written, since it is not always a number', () => {
    // 'BW' and '+25lbs' are prescriptions, not quantities.
    expect(buildInitialSets('BW×5', '')[0].weight).toBe('BW')
    expect(buildInitialSets('+25lbs×5×6', '')[0].weight).toBe('+25lbs')
    expect(buildInitialSets('30lbs×8×3', '')[0].weight).toBe('30lbs')
  })

  it('splits a comma-separated prescription into its parts', () => {
    const sets = buildInitialSets('100×5, 120×3×2', '')
    expect(sets.map(s => [s.weight, s.reps])).toEqual([['100', 5], ['120', 3], ['120', 3]])
  })

  it('puts warmups first and numbers straight through into the working sets', () => {
    const sets = buildInitialSets('140×5×2', '95×5×2')

    expect(sets.map(s => s.isWarmup)).toEqual([true, true, false, false])
    expect(sets.map(s => s.setNumber)).toEqual([1, 2, 3, 4])
  })

  it('treats an em dash as no warmup at all', () => {
    // The programme writes '—' where a lift needs no warmup.
    expect(buildInitialSets('140×5', '—').every(s => !s.isWarmup)).toBe(true)
    expect(buildInitialSets('140×5', '')).toHaveLength(1)
  })

  it('keeps an unparseable part rather than dropping it', () => {
    // Better a row the user can correct than a set that silently vanishes.
    const sets = buildInitialSets('as many as possible', '')
    expect(sets).toHaveLength(1)
    expect(sets[0].weight).toBe('as many as possible')
    expect(sets[0].reps).toBe(1)
  })

  it('yields one blank row for an empty prescription', () => {
    // Not the `reps: 0` the source's final fallback suggests: `split(',')`
    // always returns at least one element and the no-match branch always
    // pushes, so `results` is never empty and that fallback is unreachable.
    // Pinned as it behaves, not as it reads.
    const sets = buildInitialSets('', '')
    expect(sets).toHaveLength(1)
    expect(sets[0]).toMatchObject({ weight: '', reps: 1 })
  })

  it('marks every set incomplete — building is not logging', () => {
    expect(buildInitialSets('140×8×3', '95×5').every(s => !s.completed)).toBe(true)
  })
})

// ── Progressive overload ─────────────────────────────────────────────────────

describe('calcProgressiveOverload', () => {
  const withSets = (sets: SetLog[]): ExerciseLog[] => [{ ...log(), sets } as ExerciseLog]

  it('reports the gain when the top set went up', () => {
    expect(calcProgressiveOverload(
      withSets([set({ weight: '110' })]),
      withSets([set({ weight: '100' })])
    )).toEqual({ delta: '+10', direction: 'up' })
  })

  it('reports the drop when it went down', () => {
    expect(calcProgressiveOverload(
      withSets([set({ weight: '90' })]),
      withSets([set({ weight: '100' })])
    )).toEqual({ delta: '-10', direction: 'down' })
  })

  it('says so when nothing moved', () => {
    expect(calcProgressiveOverload(
      withSets([set({ weight: '100' })]),
      withSets([set({ weight: '100' })])
    )).toEqual({ delta: '=', direction: 'same' })
  })

  it('calls a first-ever session new rather than an infinite gain', () => {
    expect(calcProgressiveOverload(withSets([set({ weight: '100' })]), []))
      .toEqual({ delta: '+new', direction: 'up' })
  })

  it('ignores warmups when finding the top set', () => {
    const current = withSets([set({ weight: '200', isWarmup: true }), set({ weight: '110' })])
    expect(calcProgressiveOverload(current, withSets([set({ weight: '100' })])))
      .toEqual({ delta: '+10', direction: 'up' })
  })

  it('ignores sets that were never completed', () => {
    // An entered-but-unfinished set is an intention, not a lift.
    const current = withSets([set({ weight: '200', completed: false }), set({ weight: '110' })])
    expect(calcProgressiveOverload(current, withSets([set({ weight: '100' })])))
      .toEqual({ delta: '+10', direction: 'up' })
  })

  it('ignores weights that are not numbers', () => {
    const current = withSets([set({ weight: 'BW' }), set({ weight: '110' })])
    expect(calcProgressiveOverload(current, withSets([set({ weight: '100' })])))
      .toEqual({ delta: '+10', direction: 'up' })
  })

  it('treats an all-bodyweight history as new, since nothing numeric preceded it', () => {
    expect(calcProgressiveOverload(withSets([set({ weight: '100' })]), withSets([set({ weight: 'BW' })])))
      .toEqual({ delta: '+new', direction: 'up' })
  })

  it('takes the heaviest across several logs, not just the first', () => {
    const current = [
      { ...log(), sets: [set({ weight: '100' })] } as ExerciseLog,
      { ...log(), sets: [set({ weight: '130' })] } as ExerciseLog,
    ]
    expect(calcProgressiveOverload(current, withSets([set({ weight: '100' })])))
      .toEqual({ delta: '+30', direction: 'up' })
  })

  it('handles two empty histories without dividing by nothing', () => {
    expect(calcProgressiveOverload([], [])).toEqual({ delta: '+new', direction: 'up' })
  })
})

// ── Counts and recents ───────────────────────────────────────────────────────

describe('getWeeklySessionCount', () => {
  it('counts completed sessions inside the last seven days', async () => {
    await db.workoutSessions.bulkAdd([
      { date: daysAgo(1), dayLabel: 'A', completedAt: '2026-09-01T10:00:00.000Z' },
      { date: daysAgo(3), dayLabel: 'B', completedAt: '2026-09-01T10:00:00.000Z' },
    ])
    expect(await getWeeklySessionCount()).toBe(2)
  })

  it('leaves out sessions that were started but never finished', async () => {
    await db.workoutSessions.bulkAdd([
      { date: daysAgo(1), dayLabel: 'A', completedAt: '2026-09-01T10:00:00.000Z' },
      { date: daysAgo(2), dayLabel: 'B' },
    ])
    expect(await getWeeklySessionCount()).toBe(1)
  })

  it('leaves out anything older than the week', async () => {
    await db.workoutSessions.bulkAdd([
      { date: daysAgo(30), dayLabel: 'Old', completedAt: '2026-08-01T10:00:00.000Z' },
    ])
    expect(await getWeeklySessionCount()).toBe(0)
  })

  it('is zero on an empty table', async () => {
    expect(await getWeeklySessionCount()).toBe(0)
  })
})

describe('getRecentSessions', () => {
  it('returns sessions newest first', async () => {
    await db.workoutSessions.bulkAdd([
      { date: '2026-09-01', dayLabel: 'A' },
      { date: '2026-09-05', dayLabel: 'B' },
      { date: '2026-09-03', dayLabel: 'C' },
    ])
    expect((await getRecentSessions()).map(s => s.dayLabel)).toEqual(['B', 'C', 'A'])
  })

  it('honours the limit', async () => {
    await db.workoutSessions.bulkAdd(
      Array.from({ length: 15 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, '0')}`, dayLabel: `D${i}` }))
    )
    expect(await getRecentSessions(5)).toHaveLength(5)
  })

  it('defaults to ten', async () => {
    await db.workoutSessions.bulkAdd(
      Array.from({ length: 15 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, '0')}`, dayLabel: `D${i}` }))
    )
    expect(await getRecentSessions()).toHaveLength(10)
  })

  it('is empty on an empty table', async () => {
    expect(await getRecentSessions()).toEqual([])
  })
})
