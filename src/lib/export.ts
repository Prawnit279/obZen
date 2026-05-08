/**
 * exportAllDataAsJSON — queries all 24 Dexie tables and triggers a browser download.
 * DrumPDF binary data (ArrayBuffer) is omitted — it's not JSON-serialisable and
 * would bloat the file. All other tables are exported in full.
 */

import { db } from '@/db/dexie'

function getDeviceId(): string {
  const key = 'obzen-device-id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

function dateRange(dates: string[]): string {
  if (dates.length === 0) return '—'
  const sorted = [...dates].sort()
  return sorted[0] === sorted[sorted.length - 1]
    ? sorted[0]
    : `${sorted[0]} to ${sorted[sorted.length - 1]}`
}

function avgBpm(sessions: { bpmAchieved?: number }[]): number {
  const with_bpm = sessions.filter(s => s.bpmAchieved != null)
  if (with_bpm.length === 0) return 0
  return Math.round(with_bpm.reduce((s, r) => s + (r.bpmAchieved ?? 0), 0) / with_bpm.length)
}

export async function exportAllDataAsJSON(): Promise<void> {
  // ── Fetch all tables in parallel ────────────────────────────────────────────
  const [
    workoutSessions,
    workoutDaySessions,
    exerciseLogs,
    drumSessions,
    rudimentLogs,
    songs,
    jamSessions,
    drumBooks,
    drumNotations,
    // drumPDFs skipped — binary ArrayBuffer not JSON-safe
    calendarEvents,
    nutritionLogs,
    savedMeals,
    boards,
    tasks,
    meetings,
    actionItems,
    yogaSessions,
    checkIns,
    progressPhotos,
    ayurvedaLogs,
    vedicLogs,
    cachedImages,
    meta,
  ] = await Promise.all([
    db.workoutSessions.toArray(),
    db.workoutDaySessions.toArray(),
    db.exerciseLogs.toArray(),
    db.drumSessions.toArray(),
    db.rudimentLogs.toArray(),
    db.songs.toArray(),
    db.jamSessions.toArray(),
    db.drumBooks.toArray(),
    db.drumNotations.toArray(),
    db.calendarEvents.toArray(),
    db.nutritionLogs.toArray(),
    db.savedMeals.toArray(),
    db.boards.toArray(),
    db.tasks.toArray(),
    db.meetings.toArray(),
    db.actionItems.toArray(),
    db.yogaSessions.toArray(),
    db.checkIns.toArray(),
    db.progressPhotos.toArray(),
    db.ayurvedaLogs.toArray(),
    db.vedicLogs.toArray(),
    db.cachedImages.toArray(),
    db.meta.toArray(),
  ])

  // ── Top exercises by frequency ───────────────────────────────────────────────
  const exerciseCount: Record<string, number> = {}
  for (const log of exerciseLogs) {
    exerciseCount[log.exerciseName] = (exerciseCount[log.exerciseName] ?? 0) + 1
  }
  const topExercises = Object.entries(exerciseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, timesLogged]) => ({ name, timesLogged }))

  // ── Open action items count ──────────────────────────────────────────────────
  const openActionItems = actionItems.filter(a => a.status === 'open').length

  // ── Build export payload ─────────────────────────────────────────────────────
  const now = new Date().toISOString()
  const payload = {
    metadata: {
      exportDate: now,
      appVersion: '1.0.0',
      deviceId: getDeviceId(),
      note: 'drumPDFs table omitted (binary data). Re-upload PDFs after import.',
    },
    summary: {
      workout: {
        totalSessions: workoutSessions.length,
        totalExercisesLogged: exerciseLogs.length,
        dateRange: dateRange(workoutSessions.map(s => s.date)),
        topExercises,
      },
      drums: {
        totalSessions: drumSessions.length,
        totalRudimentsLogged: rudimentLogs.length,
        avgBpm: avgBpm(drumSessions),
        dateRange: dateRange(drumSessions.map(s => s.date)),
      },
      calendar: {
        totalEvents: calendarEvents.length,
      },
      meetings: {
        totalMeetings: meetings.length,
        openActionItems,
      },
      ayurveda: {
        daysLogged: ayurvedaLogs.length,
      },
      projects: {
        totalBoards: boards.length,
        totalTasks: tasks.length,
        openTasks: tasks.filter(t => t.status === 'todo').length,
      },
      yoga: {
        totalSessions: yogaSessions.length,
      },
    },
    data: {
      workout: {
        sessions: workoutSessions,
        daySessions: workoutDaySessions,
        exerciseLogs,
      },
      drums: {
        sessions: drumSessions,
        rudiments: rudimentLogs,
        songs,
        jamSessions,
        books: drumBooks,
        notations: drumNotations,
      },
      calendar: {
        events: calendarEvents,
      },
      nutrition: {
        logs: nutritionLogs,
        savedMeals,
      },
      meetings: {
        meetings,
        actionItems,
      },
      projects: {
        boards,
        tasks,
      },
      yoga: {
        sessions: yogaSessions,
      },
      ayurveda: {
        logs: ayurvedaLogs,
      },
      vedic: {
        logs: vedicLogs,
      },
      app: {
        checkIns,
        progressPhotos,
        cachedImages: cachedImages.map(({ id, key, type, generatedAt, size }) => ({
          id, key, type, generatedAt, size,
          // imageData omitted — base64 would bloat the file
        })),
        meta,
      },
    },
  }

  // ── Trigger download ─────────────────────────────────────────────────────────
  const timestamp = now.replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
  const filename  = `obZen-backup-${timestamp}.json`
  const blob      = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url       = URL.createObjectURL(blob)
  const a         = document.createElement('a')
  a.href          = url
  a.download      = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
