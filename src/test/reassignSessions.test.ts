import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import type { LoggedSet } from '@/db/dexie'
import { previewReassign, reassignSessions } from '@/utils/reassignSessions'
import { sessionProfile } from '@/lib/workoutSession'

function set(weight: number): LoggedSet {
  return { setNumber: 1, weight, reps: 5, unit: 'kg', timestamp: '2026-08-10T10:00:00.000Z' }
}

/** `profileId: undefined` models a row written before profiles existed. */
async function addSession(date: string, profileId?: string) {
  await db.workoutDaySessions.add({
    date,
    dayLabel: 'Day 1',
    ...(profileId ? { profileId } : {}),
    exercises: [{ exerciseId: 'deadlift', status: 'complete', sets: [set(100)] }],
    order: ['deadlift'],
  })
}

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('previewReassign', () => {
  it('counts only the source profile’s sessions', async () => {
    await addSession('2026-08-10', 'pronit')
    await addSession('2026-08-11', 'pronit')
    await addSession('2026-08-12', 'aishwarya')

    expect((await previewReassign('pronit')).count).toBe(2)
    expect((await previewReassign('aishwarya')).count).toBe(1)
  })

  it('includes legacy rows, which resolve to Pronit', async () => {
    await addSession('2026-08-10') // no profileId
    expect((await previewReassign('pronit')).count).toBe(1)
    expect((await previewReassign('aishwarya')).count).toBe(0)
  })

  it('returns the dates oldest first and changes nothing', async () => {
    await addSession('2026-08-12', 'pronit')
    await addSession('2026-08-10', 'pronit')

    const preview = await previewReassign('pronit')
    expect(preview.dates).toEqual(['2026-08-10', '2026-08-12'])
    // Still attributed to the source — preview must not mutate.
    expect((await previewReassign('pronit')).count).toBe(2)
  })
})

describe('reassignSessions', () => {
  it('moves every source session and leaves the others alone', async () => {
    await addSession('2026-08-10', 'pronit')
    await addSession('2026-08-11', 'pronit')
    await addSession('2026-08-12', 'aishwarya')

    expect(await reassignSessions('pronit', 'aishwarya')).toBe(2)

    const rows = await db.workoutDaySessions.toArray()
    expect(rows).toHaveLength(3)
    expect(rows.every(r => sessionProfile(r) === 'aishwarya')).toBe(true)
  })

  it('stamps legacy rows explicitly instead of leaving them ambiguous', async () => {
    await addSession('2026-08-10') // no profileId -> resolves to pronit

    expect(await reassignSessions('pronit', 'aishwarya')).toBe(1)

    const row = (await db.workoutDaySessions.toArray())[0]
    expect(row.profileId).toBe('aishwarya') // explicit, not inferred
  })

  it('preserves the logged sets', async () => {
    await addSession('2026-08-10', 'pronit')
    await reassignSessions('pronit', 'aishwarya')

    const row = (await db.workoutDaySessions.toArray())[0]
    expect(row.exercises[0].sets[0].weight).toBe(100)
    expect(row.date).toBe('2026-08-10')
  })

  it('is a no-op when source and target match', async () => {
    await addSession('2026-08-10', 'pronit')
    expect(await reassignSessions('pronit', 'pronit')).toBe(0)
  })

  it('is a no-op when the source has nothing', async () => {
    await addSession('2026-08-10', 'pronit')
    expect(await reassignSessions('aishwarya', 'pronit')).toBe(0)
    expect((await previewReassign('pronit')).count).toBe(1)
  })

  it('moving twice does not lose or duplicate sessions', async () => {
    await addSession('2026-08-10', 'pronit')
    await reassignSessions('pronit', 'aishwarya')
    await reassignSessions('aishwarya', 'pronit')

    const rows = await db.workoutDaySessions.toArray()
    expect(rows).toHaveLength(1)
    expect(sessionProfile(rows[0])).toBe('pronit')
  })
})
