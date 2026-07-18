import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/db/dexie'
import { importDrumBooks } from '@/utils/importDrumBooks'

// pdfjs is dynamically imported inside detectPageCount — mock it so no real
// worker loads and page detection returns a deterministic count.
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: () => ({ promise: Promise.resolve({ numPages: 12 }) }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Stub fetch to return a small PDF buffer for every file, or fail specific ones. */
function stubFetch(failFor: string[] = []) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const failed = failFor.some(f => url.includes(f))
    return {
      ok: !failed,
      status: failed ? 404 : 200,
      arrayBuffer: async () => new ArrayBuffer(2048),
    }
  }))
}

async function seedIndexedBook(title: string) {
  await db.drumBooks.add({
    title,
    author: 'Seed Author',
    category: 'Other',
    dateAdded: '2024-01-01',
    type: 'indexed',
    tags: [],
  })
}

beforeEach(async () => {
  await db.delete()
  await db.open()
})
afterEach(() => vi.unstubAllGlobals())

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('importDrumBooks — fresh import', () => {
  it('attaches PDFs to matched indexed books and creates the rest', async () => {
    // Seed the three books the manifest matches by title.
    await seedIndexedBook('The Language of Drumming')
    await seedIndexedBook('Sticking Patterns')
    await seedIndexedBook('Progressive Steps to Syncopation')
    stubFetch()

    const result = await importDrumBooks()

    expect(result.imported).toHaveLength(5)
    expect(result.failed).toHaveLength(0)

    // 3 seeded (now upgraded) + 2 newly created = 5 books, each with one PDF.
    expect(await db.drumBooks.count()).toBe(5)
    expect(await db.drumPDFs.count()).toBe(5)

    // Matched books flipped from 'indexed' to 'uploaded' and gained a page count.
    const lang = await db.drumBooks.where('title').equals('The Language of Drumming').first()
    expect(lang?.type).toBe('uploaded')
    expect(lang?.pageCount).toBe(12)
    expect(lang?.fileSize).toBe(2048)

    // A book with no manifest match is created fresh.
    const cook = await db.drumBooks.where('title').equals('The Cook Book').first()
    expect(cook?.type).toBe('uploaded')
  })

  it('does not create duplicate rows for matched titles', async () => {
    await seedIndexedBook('Sticking Patterns')
    stubFetch()
    await importDrumBooks()
    const matches = await db.drumBooks.where('title').equals('Sticking Patterns').toArray()
    expect(matches).toHaveLength(1)
  })
})

describe('importDrumBooks — idempotency', () => {
  it('skips already-imported files on a second run', async () => {
    stubFetch()
    const first = await importDrumBooks()
    expect(first.imported).toHaveLength(5)

    const second = await importDrumBooks()
    expect(second.imported).toHaveLength(0)
    expect(second.skipped).toHaveLength(5)

    // No duplicate PDFs written.
    expect(await db.drumPDFs.count()).toBe(5)
  })
})

describe('importDrumBooks — partial failure', () => {
  it('records failed fetches without aborting the whole sync', async () => {
    stubFetch(['40-rudiments.pdf'])
    const result = await importDrumBooks()

    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].file).toBe('40-rudiments.pdf')
    expect(result.imported).toHaveLength(4)

    // The failed file left no sentinel, so a later successful run can retry it.
    stubFetch()
    const retry = await importDrumBooks()
    expect(retry.imported).toEqual(['40-rudiments.pdf'])
  })
})
