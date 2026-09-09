import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import { previewStranded, adoptStrandedSessions } from '@/utils/adoptSessions'
import { importAllDataFromJSON } from '@/lib/export'
import { belongsToProfile } from '@/lib/workoutSession'
import { PROFILE_ID } from '@/config/profiles'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

// ── Fixtures ─────────────────────────────────────────────────────────────────

function set(weight: number): LoggedSet {
  return { setNumber: 1, weight, reps: 8, unit: 'lbs', timestamp: '2026-09-01T10:00:00.000Z' }
}

function session(date: string, profileId: string | undefined, weight = 135): Omit<WorkoutDaySession, 'id'> {
  return {
    date, dayLabel: 'Day 1', ...(profileId === undefined ? {} : { profileId }),
    focus: 'Test',
    exercises: [{ exerciseId: 'hip-thrust-machine', name: 'Hip Thrust Machine', muscle: 'legs', status: 'complete', sets: [set(weight)] }],
    order: ['hip-thrust-machine'],
  }
}

function backupOf(rows: Omit<WorkoutDaySession, 'id'>[]) {
  const text = JSON.stringify({
    metadata: { exportDate: '2026-09-08T10:00:00.000Z', appVersion: '1.0.0' },
    data: { workout: { sessions: [], exerciseLogs: [], daySessions: rows } },
  })
  return { text: async () => text } as unknown as File
}

// ── Import adopts ────────────────────────────────────────────────────────────

describe('importing a backup from a build with a different profile', () => {
  it('adopts the sessions so they are actually visible', async () => {
    // The reported bug: the import succeeded, the rows were stored, and every
    // screen still said "no training logged yet".
    await importAllDataFromJSON(backupOf([session('2026-09-01', 'aishwarya')]))

    const stored = await db.workoutDaySessions.toArray()
    expect(stored).toHaveLength(1)
    expect(stored[0].profileId).toBe(PROFILE_ID)
    expect(belongsToProfile(stored[0], PROFILE_ID)).toBe(true)
  })

  it('keeps the training intact while restamping it', async () => {
    await importAllDataFromJSON(backupOf([session('2026-09-01', 'aishwarya', 155)]))

    const [stored] = await db.workoutDaySessions.toArray()
    expect(stored.exercises[0].sets[0].weight).toBe(155)
    expect(stored.focus).toBe('Test')
  })

  it('leaves a session that already belongs to this profile alone', async () => {
    await importAllDataFromJSON(backupOf([session('2026-09-01', PROFILE_ID)]))
    const [stored] = await db.workoutDaySessions.toArray()
    expect(stored.profileId).toBe(PROFILE_ID)
  })

  it('adopts an unstamped pre-profile row too', async () => {
    await importAllDataFromJSON(backupOf([session('2026-09-01', undefined)]))
    const [stored] = await db.workoutDaySessions.toArray()
    expect(belongsToProfile(stored, PROFILE_ID)).toBe(true)
  })

  it('does not duplicate a day that is already here', async () => {
    // Adopted rows key on the same profile now, so the merge can see them.
    await db.workoutDaySessions.add(session('2026-09-01', PROFILE_ID) as WorkoutDaySession)
    await importAllDataFromJSON(backupOf([session('2026-09-01', 'aishwarya')]))
    expect(await db.workoutDaySessions.count()).toBe(1)
  })
})

// ── Adopting what is already stored ──────────────────────────────────────────

describe('previewStranded', () => {
  it('counts the sessions no profile can see, and says whose they were', async () => {
    await db.workoutDaySessions.bulkAdd([
      session('2026-09-01', 'aishwarya'), session('2026-09-03', 'aishwarya'),
      session('2026-09-05', PROFILE_ID),
    ] as WorkoutDaySession[])

    const preview = await previewStranded()
    expect(preview.count).toBe(2)
    expect(preview.profileIds).toEqual(['aishwarya'])
    expect(preview.range).toEqual({ from: '2026-09-01', to: '2026-09-03' })
  })

  it('reports nothing when every session already belongs here', async () => {
    await db.workoutDaySessions.add(session('2026-09-05', PROFILE_ID) as WorkoutDaySession)
    expect(await previewStranded()).toEqual({ count: 0, profileIds: [], range: null })
  })

  it('does not count unstamped rows, which already resolve here', async () => {
    await db.workoutDaySessions.add(session('2026-09-05', undefined) as WorkoutDaySession)
    expect((await previewStranded()).count).toBe(0)
  })

  it('changes nothing', async () => {
    await db.workoutDaySessions.add(session('2026-09-01', 'aishwarya') as WorkoutDaySession)
    await previewStranded()
    expect((await db.workoutDaySessions.toArray())[0].profileId).toBe('aishwarya')
  })
})

describe('adoptStrandedSessions', () => {
  it('brings the stranded sessions into view and reports how many', async () => {
    await db.workoutDaySessions.bulkAdd([
      session('2026-09-01', 'aishwarya'), session('2026-09-03', 'aishwarya'),
    ] as WorkoutDaySession[])

    expect(await adoptStrandedSessions()).toBe(2)

    const stored = await db.workoutDaySessions.toArray()
    expect(stored.every(s => belongsToProfile(s, PROFILE_ID))).toBe(true)
  })

  it('leaves this profile’s own sessions untouched', async () => {
    await db.workoutDaySessions.bulkAdd([
      session('2026-09-01', 'aishwarya'), session('2026-09-05', PROFILE_ID, 225),
    ] as WorkoutDaySession[])
    await adoptStrandedSessions()

    const mine = (await db.workoutDaySessions.toArray()).find(s => s.date === '2026-09-05')!
    expect(mine.exercises[0].sets[0].weight).toBe(225)
  })

  it('keeps both when the same day exists under each profile', async () => {
    // History is additive here — dropping one would lose training the user
    // asked to get back.
    await db.workoutDaySessions.bulkAdd([
      session('2026-09-01', 'aishwarya', 95), session('2026-09-01', PROFILE_ID, 225),
    ] as WorkoutDaySession[])
    await adoptStrandedSessions()

    const onThatDay = (await db.workoutDaySessions.toArray()).filter(s => s.date === '2026-09-01')
    expect(onThatDay).toHaveLength(2)
    expect(onThatDay.map(s => s.exercises[0].sets[0].weight).sort((a, b) => a - b)).toEqual([95, 225])
  })

  it('is a no-op when there is nothing stranded', async () => {
    await db.workoutDaySessions.add(session('2026-09-05', PROFILE_ID) as WorkoutDaySession)
    expect(await adoptStrandedSessions()).toBe(0)
  })

  it('can be run twice without harm', async () => {
    await db.workoutDaySessions.add(session('2026-09-01', 'aishwarya') as WorkoutDaySession)
    expect(await adoptStrandedSessions()).toBe(1)
    expect(await adoptStrandedSessions()).toBe(0)
    expect(await db.workoutDaySessions.count()).toBe(1)
  })
})
