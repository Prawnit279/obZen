import { db } from '@/db/dexie'
import type { DrumSession, RudimentLog, Song } from '@/db/dexie'
import { todayISO } from '@/lib/utils'

export async function startDrumSession(focusArea: string, bookRef?: string): Promise<number> {
  const id = await db.drumSessions.add({
    date: todayISO(),
    focusArea,
    duration: 0,
    bookRef,
  }) as number
  // DEBUG — remove before shipping Phase 7
  console.log('[obZen] drumSessions.add →', { id, focusArea, date: todayISO() })
  return id
}

export async function completeDrumSession(
  id: number,
  durationSeconds: number,
  bpmAchieved?: number,
  notes?: string
): Promise<void> {
  await db.drumSessions.update(id, {
    duration: durationSeconds,
    bpmAchieved,
    notes,
    completedAt: new Date().toISOString(),
  })
}

export async function logRudiment(sessionId: number, rudimentId: string, bpm: number, notes?: string): Promise<number> {
  const id = await db.rudimentLogs.add({
    sessionId,
    rudimentId,
    bpm,
    date: todayISO(),
    notes,
  }) as number
  // DEBUG — remove before shipping Phase 7
  console.log('[obZen] rudimentLogs.add →', { id, sessionId, rudimentId, bpm })
  return id
}

export async function addSong(song: Omit<Song, 'id' | 'addedAt'>): Promise<number> {
  return db.songs.add({ ...song, addedAt: new Date().toISOString() }) as Promise<number>
}

export async function updateSong(id: number, song: Partial<Omit<Song, 'id' | 'addedAt'>>): Promise<void> {
  await db.songs.update(id, song)
}

export async function deleteSong(id: number): Promise<void> {
  await db.songs.delete(id)
}

export async function getRecentDrumSessions(limit = 20): Promise<DrumSession[]> {
  return db.drumSessions.orderBy('date').reverse().limit(limit).toArray()
}

export async function getRudimentLogsForSession(sessionId: number): Promise<RudimentLog[]> {
  return db.rudimentLogs.where('sessionId').equals(sessionId).toArray()
}

export function calcDrumStreak(sessions: DrumSession[]): number {
  if (sessions.length === 0) return 0
  const completed = sessions
    .filter(s => !!s.completedAt)
    .map(s => s.date)
    .sort()
    .reverse()

  if (completed.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let cursor = new Date(today)

  for (const dateStr of completed) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === cursor.getTime()) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (d < cursor) {
      break
    }
  }
  return streak
}
