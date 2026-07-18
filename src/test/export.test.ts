import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import { importAllDataFromJSON } from '@/lib/export'

// ── Helpers ───────────────────────────────────────────────────────────────────

// jsdom's File does not implement `.text()`, so return a minimal stub exposing
// only the method importAllDataFromJSON actually calls.
function backupFile(obj: unknown): File {
  const text = JSON.stringify(obj)
  return { text: async () => text } as unknown as File
}

function rawFile(text: string): File {
  return { text: async () => text } as unknown as File
}

const validBackup = {
  metadata: { exportDate: '2026-01-01T00:00:00.000Z', appVersion: '1.0.0' },
  data: {
    workout: {
      sessions: [{ id: 1, date: '2026-01-01', dayLabel: 'A' }],
      exerciseLogs: [{ id: 1, sessionId: 1, exerciseId: 'a', exerciseName: 'ExA', date: '2026-01-01', sets: [] }],
    },
    drums: {
      books: [{ id: 1, title: 'Book', author: '', category: 'Other', dateAdded: '2026-01-01', type: 'indexed' }],
    },
    app: {
      meta: [{ id: 1, key: 'foo', value: 'bar' }],
    },
  },
}

beforeEach(async () => {
  await db.delete()
  await db.open()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('importAllDataFromJSON — happy path', () => {
  it('writes every section and reports the record count + export date', async () => {
    const result = await importAllDataFromJSON(backupFile(validBackup))
    expect(result.totalRecords).toBe(4) // sessions + exerciseLogs + books + meta
    expect(result.exportDate).toBe('2026-01-01T00:00:00.000Z')

    expect(await db.workoutSessions.count()).toBe(1)
    expect(await db.exerciseLogs.count()).toBe(1)
    expect(await db.drumBooks.count()).toBe(1)
    expect((await db.meta.where('key').equals('foo').first())?.value).toBe('bar')
  })

  it('is idempotent — re-importing upserts by id without duplicating', async () => {
    await importAllDataFromJSON(backupFile(validBackup))
    const second = await importAllDataFromJSON(backupFile(validBackup))
    expect(second.totalRecords).toBe(4)
    expect(await db.workoutSessions.count()).toBe(1)
    expect(await db.drumBooks.count()).toBe(1)
    expect(await db.meta.count()).toBe(1)
  })

  it('never writes drumPDFs even if the backup includes them', async () => {
    const withPdf = {
      ...validBackup,
      data: { ...validBackup.data, drums: { ...validBackup.data.drums } },
    }
    // drumPDFs is not part of BACKUP_SHAPE, so it is ignored regardless.
    await importAllDataFromJSON(backupFile(withPdf))
    expect(await db.drumPDFs.count()).toBe(0)
  })
})

describe('importAllDataFromJSON — validation errors', () => {
  it('rejects unparseable JSON', async () => {
    await expect(importAllDataFromJSON(rawFile('{ not json'))).rejects.toThrow(/could not parse JSON/i)
  })

  it('rejects a backup missing data/metadata', async () => {
    await expect(importAllDataFromJSON(backupFile({ metadata: { exportDate: 'x' } })))
      .rejects.toThrow(/missing "data" or "metadata"/i)
  })

  it('rejects a missing or invalid metadata.exportDate', async () => {
    await expect(importAllDataFromJSON(backupFile({ data: {}, metadata: {} })))
      .rejects.toThrow(/exportDate.*invalid|invalid/i)
  })

  it('rejects a section that is not an object', async () => {
    await expect(importAllDataFromJSON(backupFile({
      data: { workout: [] },
      metadata: { exportDate: 'x' },
    }))).rejects.toThrow(/section "workout" must be an object/i)
  })

  it('rejects a table that is not an array', async () => {
    await expect(importAllDataFromJSON(backupFile({
      data: { workout: { sessions: 'oops' } },
      metadata: { exportDate: 'x' },
    }))).rejects.toThrow(/"workout\.sessions" must be an array/i)
  })

  it('rejects a non-object row', async () => {
    await expect(importAllDataFromJSON(backupFile({
      data: { workout: { sessions: [42] } },
      metadata: { exportDate: 'x' },
    }))).rejects.toThrow(/"workout\.sessions\[0\]" must be an object/i)
  })

  it('writes nothing when validation fails', async () => {
    await expect(importAllDataFromJSON(backupFile({
      data: { workout: { sessions: 'oops' } },
      metadata: { exportDate: 'x' },
    }))).rejects.toThrow()
    expect(await db.workoutSessions.count()).toBe(0)
  })
})
