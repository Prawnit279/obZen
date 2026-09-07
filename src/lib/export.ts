/**
 * exportAllDataAsJSON — queries all 24 Dexie tables and triggers a browser download.
 * DrumPDF binary data (ArrayBuffer) is omitted — it's not JSON-serialisable and
 * would bloat the file. All other tables are exported in full.
 *
 * importAllDataFromJSON — reads an obZen backup JSON file back into IndexedDB.
 * Most tables merge by primary key (existing rows with the same id are
 * overwritten; rows absent from the backup are left untouched). Workout day
 * sessions are the exception: they merge on profile + date + day, because two
 * devices assign ids independently and matching on id would clobber unrelated
 * sessions when swapping backups between phones.
 * drumPDFs and cachedImages are skipped (binary / hollow metadata).
 */

import { type Table } from 'dexie'
import { db } from '@/db/dexie'
import { isRealSet } from '@/lib/progress'
import { exerciseNameFor } from '@/data/obzen-program'
import type { WorkoutDaySession } from '@/db/dexie'
import { sessionProfile, sessionHasActivity } from '@/lib/workoutSession'

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

  // ── Workout summary ──────────────────────────────────────────────────────────
  // Read from `workoutDaySessions`, the table the app actually writes to.
  // `workoutSessions` / `exerciseLogs` are the legacy pair and are empty on
  // every current install, so summarising them reported "0 sessions, 0
  // exercises" over a backup that in fact held months of training.
  const exerciseCount: Record<string, number> = {}
  const trainedDates: string[] = []
  let loggedExerciseCount = 0

  for (const session of workoutDaySessions) {
    let sessionHasSets = false
    for (const ex of session.exercises) {
      if (!ex.sets.some(isRealSet)) continue
      sessionHasSets = true
      loggedExerciseCount += 1
      const name = ex.name ?? exerciseNameFor(ex.exerciseId)
      exerciseCount[name] = (exerciseCount[name] ?? 0) + 1
    }
    if (sessionHasSets) trainedDates.push(session.date)
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
        totalSessions: trainedDates.length,
        totalExercisesLogged: loggedExerciseCount,
        dateRange: dateRange(trainedDates),
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

// ─────────────────────────────────────────────────────────────────────────────
// Import
// ─────────────────────────────────────────────────────────────────────────────

export interface ImportResult {
  /** Total number of records written across all tables. */
  totalRecords: number
  /** ISO timestamp from the backup's metadata.exportDate field. */
  exportDate: string
}

// ── Structural validation ─────────────────────────────────────────────────────

/** Maps each backup section to the table arrays it may contain. */
const BACKUP_SHAPE: Record<string, string[]> = {
  workout:   ['sessions', 'daySessions', 'exerciseLogs'],
  drums:     ['sessions', 'rudiments', 'songs', 'jamSessions', 'books', 'notations'],
  calendar:  ['events'],
  nutrition: ['logs', 'savedMeals'],
  meetings:  ['meetings', 'actionItems'],
  projects:  ['boards', 'tasks'],
  yoga:      ['sessions'],
  ayurveda:  ['logs'],
  vedic:     ['logs'],
  app:       ['checkIns', 'progressPhotos', 'meta'],
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Validate the structural shape of a parsed backup's `data` field. Throws a
 * descriptive Error on the first malformed section/table/row so a corrupt or
 * hand-edited backup fails fast instead of silently writing bad records into
 * IndexedDB. Field-level contents are intentionally not validated — Dexie's
 * atomic transaction rolls back cleanly if bulkPut rejects a row.
 */
function validateBackupData(data: unknown): asserts data is BackupData {
  if (!isPlainObject(data)) {
    throw new Error('Backup "data" field must be an object.')
  }
  for (const [section, tables] of Object.entries(BACKUP_SHAPE)) {
    const sectionValue = data[section]
    if (sectionValue === undefined) continue
    if (!isPlainObject(sectionValue)) {
      throw new Error(`Backup section "${section}" must be an object.`)
    }
    for (const table of tables) {
      const rows = sectionValue[table]
      if (rows === undefined) continue
      if (!Array.isArray(rows)) {
        throw new Error(`"${section}.${table}" must be an array.`)
      }
      for (let i = 0; i < rows.length; i++) {
        const row: unknown = rows[i]
        if (!isPlainObject(row)) {
          throw new Error(`"${section}.${table}[${i}]" must be an object.`)
        }
        const id = row['id']
        if (id !== undefined && typeof id !== 'number' && typeof id !== 'string') {
          throw new Error(`"${section}.${table}[${i}].id" must be a number or string.`)
        }
      }
    }
  }
}

/**
 * Parse an obZen backup JSON file and merge its records into IndexedDB.
 *
 * Uses bulkPut so records are upserted by primary key — re-importing the same
 * backup is safe and idempotent. Records that exist locally but are absent from
 * the backup are never deleted.
 *
 * drumPDFs are absent from the backup by design (binary ArrayBuffer).
 * cachedImages entries are skipped because the export omits imageData, making
 * the metadata-only rows useless to restore.
 *
 * Throws on invalid JSON, missing required fields, or Dexie write errors.
 */
export async function importAllDataFromJSON(file: File): Promise<ImportResult> {
  // ── Read and parse ──────────────────────────────────────────────────────────
  const text = await file.text()

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Invalid file — could not parse JSON.')
  }

  if (!isPlainObject(raw) || !('data' in raw) || !('metadata' in raw)) {
    throw new Error('Unrecognised backup format — missing "data" or "metadata" fields.')
  }

  const metadata = raw.metadata
  if (!isPlainObject(metadata) || typeof metadata.exportDate !== 'string') {
    throw new Error('Backup "metadata.exportDate" is missing or invalid.')
  }

  // Structural validation — throws with a descriptive path on the first bad node.
  const data = raw.data
  validateBackupData(data)

  // ── Helper ──────────────────────────────────────────────────────────────────
  let total = 0

  async function put<T>(table: Table<T>, rows: unknown[] | undefined): Promise<void> {
    if (!rows || rows.length === 0) return
    await table.bulkPut(rows as T[])
    total += rows.length
  }

  /**
   * Workout sessions are merged by their natural key (profile + date + day)
   * rather than by primary key.
   *
   * Two devices assign auto-increment ids independently, so an incoming id=1
   * is almost never the same workout as the local id=1 — a plain bulkPut would
   * silently overwrite unrelated sessions. Incoming rows are therefore matched
   * on what actually identifies a session, and inserted without their id when
   * they are new so Dexie assigns a fresh one. A local session that already
   * has logged work is never replaced.
   */
  async function mergeDaySessions(rows: unknown[] | undefined): Promise<void> {
    if (!rows || rows.length === 0) return
    const incoming = rows as WorkoutDaySession[]
    const local = await db.workoutDaySessions.toArray()

    const keyOf = (s: WorkoutDaySession) => `${sessionProfile(s)}::${s.date}::${s.dayLabel}`
    const localByKey = new Map(local.map(s => [keyOf(s), s]))

    for (const row of incoming) {
      const existing = localByKey.get(keyOf(row))
      if (!existing) {
        // New to this device — drop the foreign id so Dexie assigns its own.
        const { id: _ignored, ...withoutId } = row
        await db.workoutDaySessions.add(withoutId as WorkoutDaySession)
        total++
      } else if (!sessionHasActivity(existing) && sessionHasActivity(row)) {
        // Local placeholder, incoming has real work — take the incoming one.
        await db.workoutDaySessions.put({ ...row, id: existing.id })
        total++
      }
      // Otherwise the local session already has logged work: leave it alone.
    }
  }

  // ── Write all tables inside a single transaction ────────────────────────────
  await db.transaction('rw', [
    db.workoutSessions,
    db.workoutDaySessions,
    db.exerciseLogs,
    db.drumSessions,
    db.rudimentLogs,
    db.songs,
    db.jamSessions,
    db.drumBooks,
    db.drumNotations,
    db.calendarEvents,
    db.nutritionLogs,
    db.savedMeals,
    db.boards,
    db.tasks,
    db.meetings,
    db.actionItems,
    db.yogaSessions,
    db.checkIns,
    db.progressPhotos,
    db.ayurvedaLogs,
    db.vedicLogs,
    db.meta,
  ], async () => {
    await put(db.workoutSessions,    data.workout?.sessions)
    await mergeDaySessions(data.workout?.daySessions)
    await put(db.exerciseLogs,       data.workout?.exerciseLogs)
    await put(db.drumSessions,       data.drums?.sessions)
    await put(db.rudimentLogs,       data.drums?.rudiments)
    await put(db.songs,              data.drums?.songs)
    await put(db.jamSessions,        data.drums?.jamSessions)
    await put(db.drumBooks,          data.drums?.books)
    await put(db.drumNotations,      data.drums?.notations)
    await put(db.calendarEvents,     data.calendar?.events)
    await put(db.nutritionLogs,      data.nutrition?.logs)
    await put(db.savedMeals,         data.nutrition?.savedMeals)
    await put(db.boards,             data.projects?.boards)
    await put(db.tasks,              data.projects?.tasks)
    await put(db.meetings,           data.meetings?.meetings)
    await put(db.actionItems,        data.meetings?.actionItems)
    await put(db.yogaSessions,       data.yoga?.sessions)
    await put(db.checkIns,           data.app?.checkIns)
    await put(db.progressPhotos,     data.app?.progressPhotos)
    await put(db.ayurvedaLogs,       data.ayurveda?.logs)
    await put(db.vedicLogs,          data.vedic?.logs)
    await put(db.meta,               data.app?.meta)
    // drumPDFs and cachedImages intentionally skipped — see JSDoc above
  })

  return { totalRecords: total, exportDate: metadata.exportDate }
}

// ── Backup shape (loosely typed for forward-compatibility) ────────────────────
interface BackupData {
  workout?:   { sessions?: unknown[]; daySessions?: unknown[]; exerciseLogs?: unknown[] }
  drums?:     { sessions?: unknown[]; rudiments?: unknown[]; songs?: unknown[]; jamSessions?: unknown[]; books?: unknown[]; notations?: unknown[] }
  calendar?:  { events?: unknown[] }
  nutrition?: { logs?: unknown[]; savedMeals?: unknown[] }
  meetings?:  { meetings?: unknown[]; actionItems?: unknown[] }
  projects?:  { boards?: unknown[]; tasks?: unknown[] }
  yoga?:      { sessions?: unknown[] }
  ayurveda?:  { logs?: unknown[] }
  vedic?:     { logs?: unknown[] }
  app?:       { checkIns?: unknown[]; progressPhotos?: unknown[]; meta?: unknown[] }
}
