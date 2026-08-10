import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import type { LoggedSet } from '@/db/dexie'
import { useWorkoutDayStore } from '@/store/useWorkoutDayStore'
import { useProfileStore } from '@/store/useProfileStore'
import { todayISO } from '@/lib/utils'
import { sessionHasActivity, belongsToProfile } from '@/lib/workoutSession'

// Regression coverage for the empty-History bug: the live logging flow writes
// workoutDaySessions, so every read path (History, WeekStrip, SessionDetail)
// must read workoutDaySessions — not the never-populated workoutSessions.

async function resetDb() {
  await db.delete()
  await db.open()
}

beforeEach(async () => {
  await resetDb()
  // Reset the zustand singletons so cached sessions/profile don't leak.
  useWorkoutDayStore.setState({ sessions: {}, loading: false })
  useProfileStore.setState({ activeId: 'aishwarya' })
})

function makeSet(weight: number): LoggedSet {
  return { setNumber: 1, weight, reps: 10, unit: 'kg', timestamp: new Date().toISOString() }
}

describe('workout save → history round-trip', () => {
  it('persists a logged session and surfaces it in every read path', async () => {
    const store = useWorkoutDayStore.getState()
    const today = todayISO()

    // 1. A day starts empty and is NOT written to the DB until something is
    //    logged — just opening/tabbing a day must not create a row.
    await store.loadSession('Day 1')
    const key = `aishwarya::Day 1::${today}`
    expect(useWorkoutDayStore.getState().sessions[key]?.exercises).toHaveLength(0)
    expect(
      await db.workoutDaySessions.where('date').equals(today).filter(s => s.dayLabel === 'Day 1').first()
    ).toBeUndefined()

    // 2. Loading the template persists the day (first write) and stamps focus.
    await store.loadTemplate('Day 1')
    let session = (await db.workoutDaySessions.where('date').equals(today).filter(s => s.dayLabel === 'Day 1').first())!
    expect(session).toBeTruthy()
    expect(session.exercises.length).toBe(6)
    expect(session.focus).toBe('Glutes & Hamstrings')

    // 3. Log a weight, complete an exercise, complete the workout.
    const firstEx = session.exercises[0]
    await store.addLoggedSet('Day 1', firstEx.exerciseId, makeSet(60))
    await store.updateExerciseStatus('Day 1', firstEx.exerciseId, 'complete')
    await store.completeSession('Day 1')

    // 4. Everything persisted: name, weight, unit, completedAt.
    session = (await db.workoutDaySessions.get(session.id!))!
    const savedEx = session.exercises.find(e => e.exerciseId === firstEx.exerciseId)!
    expect(savedEx.name).toBe('Hip Thrust Machine')
    expect(savedEx.sets[0].weight).toBe(60)
    expect(savedEx.sets[0].unit).toBe('kg')
    expect(session.completedAt).toBeTruthy()

    // 5. History read path surfaces it with the logged weight.
    const history = (await db.workoutDaySessions.orderBy('date').reverse().toArray())
      .filter(s => s.exercises.length > 0)
    const inHistory = history.find(s => s.id === session.id)
    expect(inHistory).toBeTruthy()
    expect(inHistory!.exercises.some(e => e.sets.some(x => x.weight === 60))).toBe(true)

    // 6. WeekStrip read path (anyOf the week's dates) surfaces it.
    const week = await db.workoutDaySessions.where('date').anyOf([today]).toArray()
    expect(week.some(s => s.id === session.id && s.exercises.length > 0)).toBe(true)

    // 7. SessionDetail read path (get by id) returns it with sets.
    const detail = await db.workoutDaySessions.get(session.id!)
    expect(detail!.exercises.find(e => e.exerciseId === firstEx.exerciseId)!.sets).toHaveLength(1)

    // 8. Regression guard: the OLD table History used to read stays empty —
    //    proving the read path now matches the write path.
    expect(await db.workoutSessions.count()).toBe(0)
  })

  it('opening/tabbing days without logging creates no session rows', async () => {
    const store = useWorkoutDayStore.getState()

    // Simulate the user tabbing through all three days without logging.
    await store.loadSession('Day 1')
    await store.loadSession('Day 2')
    await store.loadSession('Day 3')

    // No empty rows written — the DB stays clean until something is logged.
    expect(await db.workoutDaySessions.count()).toBe(0)

    // Log a single set on Day 3 only.
    await store.loadTemplate('Day 3')
    const day3 = (await db.workoutDaySessions.where('dayLabel').equals('Day 3').first())!
    await store.addLoggedSet('Day 3', day3.exercises[0].exerciseId, makeSet(80))

    // Exactly one row exists, and History surfaces only Day 3 for the date.
    const rows = await db.workoutDaySessions.toArray()
    expect(rows).toHaveLength(1)
    expect(rows.filter(sessionHasActivity).map(s => s.dayLabel)).toEqual(['Day 3'])
  })

  it('loadTemplate is non-destructive and idempotent', async () => {
    const store = useWorkoutDayStore.getState()
    const today = todayISO()

    await store.loadSession('Day 2')
    await store.loadTemplate('Day 2')
    const s1 = (await db.workoutDaySessions.where('date').equals(today).filter(s => s.dayLabel === 'Day 2').first())!
    const count1 = s1.exercises.length
    expect(count1).toBe(7)

    // Log a weight, then re-load the template.
    await store.addLoggedSet('Day 2', s1.exercises[0].exerciseId, makeSet(20))
    await store.loadTemplate('Day 2')

    const s2 = (await db.workoutDaySessions.get(s1.id!))!
    expect(s2.exercises.length).toBe(count1)          // no duplicate exercises
    expect(s2.exercises[0].sets[0].weight).toBe(20)   // logged data preserved
  })

  it('keeps each profile on its own program and history', async () => {
    // Read fresh state per call — the store object is a snapshot.
    const store = () => useWorkoutDayStore.getState()

    // Pronit's Day 1 is his own split, not Aishwarya's.
    useProfileStore.setState({ activeId: 'pronit' })
    await store().loadSession('Day 1')
    await store().loadTemplate('Day 1')
    const pronitDay = (await db.workoutDaySessions.where('dayLabel').equals('Day 1').first())!
    expect(pronitDay.focus).toBe('Pull / Legs / Arms')
    expect(pronitDay.exercises.some(e => e.name === 'Weighted Pull-ups')).toBe(true)
    expect(pronitDay.profileId).toBe('pronit')

    // Aishwarya's Day 1 on the same date is a separate row with her program.
    useProfileStore.setState({ activeId: 'aishwarya' })
    await store().loadSession('Day 1')
    await store().loadTemplate('Day 1')
    const rows = await db.workoutDaySessions.where('dayLabel').equals('Day 1').toArray()
    expect(rows).toHaveLength(2)

    const hers = rows.find(r => r.profileId === 'aishwarya')!
    expect(hers.focus).toBe('Glutes & Hamstrings')
    expect(hers.exercises.some(e => e.name === 'Hip Thrust Machine')).toBe(true)

    // Each profile's history shows only their own session.
    expect(rows.filter(r => belongsToProfile(r, 'pronit'))).toHaveLength(1)
    expect(rows.filter(r => belongsToProfile(r, 'aishwarya'))).toHaveLength(1)
  })

  it('attributes pre-profile sessions to Aishwarya', async () => {
    // A row saved before profiles existed carries no profileId.
    await db.workoutDaySessions.add({
      date: todayISO(), dayLabel: 'Day 2', exercises: [], order: [],
    })
    const legacy = (await db.workoutDaySessions.toArray())[0]
    expect(belongsToProfile(legacy, 'aishwarya')).toBe(true)
    expect(belongsToProfile(legacy, 'pronit')).toBe(false)
  })
})
