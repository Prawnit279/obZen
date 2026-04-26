import { db } from '@/db/dexie'
import type { ExerciseLog, SetLog, WorkoutSession } from '@/db/dexie'
import { todayISO } from '@/lib/utils'

export async function startWorkoutSession(dayLabel: string): Promise<number> {
  const id = await db.workoutSessions.add({
    date: todayISO(),
    dayLabel,
  })
  return id as number
}

export async function completeWorkoutSession(sessionId: number): Promise<void> {
  await db.workoutSessions.update(sessionId, {
    completedAt: new Date().toISOString(),
  })
}

export async function saveExerciseLog(log: Omit<ExerciseLog, 'id'>): Promise<number> {
  const id = await db.exerciseLogs.add(log)
  return id as number
}

export async function updateExerciseLog(id: number, updates: Partial<ExerciseLog>): Promise<void> {
  await db.exerciseLogs.update(id, updates)
}

export async function getSessionLogs(sessionId: number): Promise<ExerciseLog[]> {
  return db.exerciseLogs.where('sessionId').equals(sessionId).toArray()
}

export async function getExerciseHistory(
  exerciseName: string,
  limitDays = 30
): Promise<ExerciseLog[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - limitDays)
  const cutoffISO = cutoff.toISOString().split('T')[0]
  return db.exerciseLogs
    .where('date').aboveOrEqual(cutoffISO)
    .filter(log => log.exerciseName === exerciseName)
    .toArray()
}

export function buildInitialSets(working: string, warmup: string): SetLog[] {
  const sets: SetLog[] = []

  if (warmup && warmup !== '—') {
    const warmupSets = parseSetString(warmup)
    warmupSets.forEach((s, i) => {
      sets.push({ setNumber: i + 1, weight: s.weight, reps: s.reps, isWarmup: true, completed: false })
    })
  }

  const workingSets = parseSetString(working)
  const offset = sets.length
  workingSets.forEach((s, i) => {
    sets.push({ setNumber: offset + i + 1, weight: s.weight, reps: s.reps, isWarmup: false, completed: false })
  })

  return sets
}

function parseSetString(str: string): { weight: string; reps: number }[] {
  const results: { weight: string; reps: number }[] = []
  const parts = str.split(',').map(s => s.trim())

  for (const part of parts) {
    // Patterns: "140×8×2", "BW×5", "+25lbs×5×6", "30lbs×8×3", "20×10"
    const match = part.match(/^([^×]+)×(\d+)(?:×(\d+))?$/)
    if (!match) {
      results.push({ weight: part, reps: 1 })
      continue
    }
    const weight = match[1].trim()
    const reps = parseInt(match[2], 10)
    const numSets = match[3] ? parseInt(match[3], 10) : 1
    for (let i = 0; i < numSets; i++) {
      results.push({ weight, reps })
    }
  }

  return results.length > 0 ? results : [{ weight: '', reps: 0 }]
}

export function calcProgressiveOverload(
  current: ExerciseLog[],
  previous: ExerciseLog[]
): { delta: string; direction: 'up' | 'down' | 'same' } {
  const getMaxWeight = (logs: ExerciseLog[]) => {
    let max = 0
    for (const log of logs) {
      for (const set of log.sets) {
        if (!set.isWarmup && set.completed) {
          const w = parseFloat(set.weight)
          if (!isNaN(w) && w > max) max = w
        }
      }
    }
    return max
  }

  const currMax = getMaxWeight(current)
  const prevMax = getMaxWeight(previous)

  if (prevMax === 0) return { delta: '+new', direction: 'up' }
  const diff = currMax - prevMax
  if (diff > 0) return { delta: `+${diff}`, direction: 'up' }
  if (diff < 0) return { delta: `${diff}`, direction: 'down' }
  return { delta: '=', direction: 'same' }
}

export async function getWeeklySessionCount(): Promise<number> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const cutoff = weekAgo.toISOString().split('T')[0]
  return db.workoutSessions
    .where('date').aboveOrEqual(cutoff)
    .filter(s => !!s.completedAt)
    .count()
}

export async function getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
  const all = await db.workoutSessions
    .orderBy('date')
    .reverse()
    .limit(limit)
    .toArray()
  return all
}
