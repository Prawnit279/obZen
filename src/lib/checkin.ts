import { db } from '@/db/dexie'
import type { CheckIn } from '@/db/dexie'
import { todayISO } from '@/lib/utils'

export async function saveCheckIn(data: Omit<CheckIn, 'id'>): Promise<number> {
  const existing = await db.checkIns.where('date').equals(data.date).first()
  if (existing?.id != null) {
    await db.checkIns.update(existing.id, data)
    return existing.id
  }
  return (await db.checkIns.add(data)) as number
}

export async function getTodayCheckIn(): Promise<CheckIn | undefined> {
  return db.checkIns.where('date').equals(todayISO()).first()
}

export async function getRecentCheckIns(days = 7): Promise<CheckIn[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffISO = cutoff.toISOString().split('T')[0]
  return db.checkIns.where('date').aboveOrEqual(cutoffISO).toArray()
}

export function calcWorkoutStreak(sessions: { date: string; completedAt?: string }[]): number {
  const completedDates = new Set(
    sessions.filter(s => s.completedAt).map(s => s.date)
  )
  let streak = 0
  const d = new Date()
  while (true) {
    const iso = d.toISOString().split('T')[0]
    if (completedDates.has(iso)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}
