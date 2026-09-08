import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import type { LoggedSet, WorkoutDaySession } from '@/db/dexie'
import { useProfileStore } from '@/store/useProfileStore'
import { useProgressStore } from '@/store/useProgressStore'
import { belongsToProfile, sessionHasActivity } from '@/lib/workoutSession'
import {
  bestCurrentE1RM, sbdTotal, weeklyVolume, recentPRs, exercisePRs, trackingSeries,
} from '@/lib/progress'
import { lbToKg } from '@/lib/progress'
import { DEFAULT_BAR_LB } from '@/lib/barWeight'

/** Squat and deadlift are bar-loaded, so each set carries a bar over its plates. */
const BAR = lbToKg(DEFAULT_BAR_LB)

/**
 * End-to-end coverage for the Progress view's data path: sessions go into
 * Dexie, get filtered to the active profile the same way the view does, and
 * flow correctly into every metric.
 */

async function resetDb() {
  await db.delete()
  await db.open()
}

beforeEach(async () => {
  await resetDb()
  useProfileStore.setState({ activeId: 'pronit' })
  useProgressStore.setState({ rungs: {}, bodyweight: {} })
})

function set(weight: number, reps: number, unit: LoggedSet['unit'] = 'kg'): LoggedSet {
  return { setNumber: 1, weight, reps, unit, timestamp: '2026-08-10T10:00:00.000Z' }
}

async function seed(session: Omit<WorkoutDaySession, 'id'>) {
  await db.workoutDaySessions.add(session as WorkoutDaySession)
}

/** The exact filter the Progress view applies. */
async function loadFor(profileId: string): Promise<WorkoutDaySession[]> {
  const all = await db.workoutDaySessions.orderBy('date').toArray()
  return all.filter(s => belongsToProfile(s, profileId) && sessionHasActivity(s))
}

describe('progress data path — profile filtering', () => {
  beforeEach(async () => {
    await seed({
      date: '2026-08-10', dayLabel: 'Day 1', profileId: 'pronit',
      exercises: [{ exerciseId: 'deadlift', status: 'complete', sets: [set(140, 5)] }],
      order: ['deadlift'],
    })
    await seed({
      date: '2026-08-11', dayLabel: 'Day 1', profileId: 'aishwarya',
      exercises: [{ exerciseId: 'hip-thrust-machine', status: 'complete', sets: [set(60, 10)] }],
      order: ['hip-thrust-machine'],
    })
  })

  it("shows only the active profile's sessions", async () => {
    expect(await loadFor('pronit')).toHaveLength(1)
    expect(await loadFor('aishwarya')).toHaveLength(1)
  })

  it("does not leak the other profile's lifts into e1RM", async () => {
    const mine = await loadFor('pronit')
    expect(bestCurrentE1RM(mine, 'deadlift')).toBeGreaterThan(0)
    expect(bestCurrentE1RM(mine, 'hip-thrust-machine')).toBe(0)
  })

  it('attributes pre-profile rows to Pronit', async () => {
    await seed({
      date: '2026-08-09', dayLabel: 'Day 2',
      exercises: [{ exerciseId: 'barbell-squat', status: 'complete', sets: [set(100, 5)] }],
      order: ['barbell-squat'],
    })
    expect(await loadFor('pronit')).toHaveLength(2)
    expect(await loadFor('aishwarya')).toHaveLength(1)
  })

  it('excludes sessions with no real activity', async () => {
    await seed({ date: '2026-08-12', dayLabel: 'Day 3', profileId: 'pronit', exercises: [], order: [] })
    expect(await loadFor('pronit')).toHaveLength(1)
  })
})

describe('progress data path — a seeded session reaches every metric', () => {
  beforeEach(async () => {
    await seed({
      date: '2026-08-10', dayLabel: 'Day 3', profileId: 'pronit',
      exercises: [
        { exerciseId: 'barbell-squat', status: 'complete', sets: [set(100, 5), set(120, 3)] },
        { exerciseId: 'deadlift', status: 'complete', sets: [set(150, 1)] },
        // Placeholder row the logger persists before the user types — must be ignored.
        { exerciseId: 'bench-press', status: 'pending', sets: [{ setNumber: 1, weight: 0, reps: 0, unit: 'lbs', timestamp: '' }] },
      ],
      order: ['barbell-squat', 'deadlift', 'bench-press'],
    })
  })

  it('feeds e1RM', async () => {
    const mine = await loadFor('pronit')
    // With the bar: 120.4×5 gives 140.5, 140.4×3 gives 154.5 — the triple wins.
    expect(bestCurrentE1RM(mine, 'barbell-squat')).toBeCloseTo((120 + BAR) * 1.1, 1)
  })

  it('feeds the SBD total and counts only logged lifts', async () => {
    const total = sbdTotal(await loadFor('pronit'), ['barbell-squat', 'bench-press', 'deadlift'])
    expect(total.loggedCount).toBe(2) // bench had only a placeholder row
    expect(total.totalKg).toBeCloseTo((120 + BAR) * 1.1 + (150 + BAR), 1)
  })

  it('feeds weekly volume, ignoring placeholder sets', async () => {
    const weeks = weeklyVolume(await loadFor('pronit'))
    expect(weeks).toHaveLength(1)
    // squat 100×5 + 120×3 = 860, deadlift 150×1 = 150
    expect(weeks[0].tonnageKg).toBeCloseTo(
      (100 + BAR) * 5 + (120 + BAR) * 3 + (150 + BAR), 1)
    expect(weeks[0].sets).toBe(3) // placeholder not counted
  })

  it('feeds PR detection', async () => {
    const mine = await loadFor('pronit')
    const prs = exercisePRs(mine, 'barbell-squat')
    expect(prs.byRep.find(p => p.reps === 3)?.weightKg).toBeCloseTo(120 + BAR, 1)
    expect(prs.bestE1RM?.date).toBe('2026-08-10')

    const all = recentPRs(mine)
    expect(all.map(p => p.exerciseId).sort()).toEqual(['barbell-squat', 'deadlift'])
  })

  it('feeds tracking-mode series', async () => {
    await seed({
      date: '2026-08-12', dayLabel: 'Day 2', profileId: 'pronit',
      exercises: [{ exerciseId: 'assisted-pull-up', status: 'complete', sets: [set(30, 6), set(25, 6)] }],
      order: ['assisted-pull-up'],
    })
    const series = trackingSeries(await loadFor('pronit'), 'assisted-pull-up')
    expect(series[0].value).toBeCloseTo(25, 1) // lowest assistance that session
  })

  it('normalises a session logged in lbs', async () => {
    await seed({
      date: '2026-08-17', dayLabel: 'Day 3', profileId: 'pronit',
      exercises: [{ exerciseId: 'deadlift', status: 'complete', sets: [set(220.462, 1, 'lbs')] }],
      order: ['deadlift'],
    })
    // 220.462 lbs == 100 kg, so the 150 kg single stays the best.
    expect(bestCurrentE1RM(await loadFor('pronit'), 'deadlift')).toBeCloseTo(150 + BAR, 1)
  })
})

describe('progress store — ladder rungs are per profile', () => {
  it('keeps rungs separate for the two profiles', () => {
    const { setRung, getRung } = useProgressStore.getState()
    setRung('pronit', 'assisted-pull-up', 3)
    setRung('aishwarya', 'assisted-pull-up', 1)
    expect(useProgressStore.getState().getRung('pronit', 'assisted-pull-up')).toBe(3)
    expect(useProgressStore.getState().getRung('aishwarya', 'assisted-pull-up')).toBe(1)
    expect(getRung('pronit', 'never-set')).toBe(0)
  })

  it('logs bodyweight per profile, one entry per date', () => {
    const { logBodyweight } = useProgressStore.getState()
    logBodyweight('pronit', '2026-08-10', 75)
    logBodyweight('pronit', '2026-08-10', 74.5) // same day overwrites
    logBodyweight('pronit', '2026-08-11', 74)
    const entries = useProgressStore.getState().getBodyweight('pronit')
    expect(entries).toHaveLength(2)
    expect(entries[0].kg).toBe(74.5)
    expect(useProgressStore.getState().latestBodyweight('pronit')).toBe(74)
    expect(useProgressStore.getState().latestBodyweight('aishwarya')).toBeUndefined()
  })
})
