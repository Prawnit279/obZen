/**
 * importDrumBooks — syncs PDFs from /public/drum-import into the Drum Library.
 *
 * Each entry in MANIFEST points at a file in /public/drum-import. On first run,
 * the PDF is fetched, page count is detected via pdfjs, and a DrumBook +
 * DrumPDF record is created (or, if `matchTitle` matches an existing
 * index-only book, the PDF is attached to that record instead of creating a
 * duplicate).
 *
 * Per-file meta sentinels (`drum-import:<file>`) make this safe to re-run:
 * already-imported files are skipped, so new entries can be appended to
 * MANIFEST and new PDFs dropped into /public/drum-import at any time —
 * re-running only processes what's new.
 */

import { db } from '@/db/dexie'
import type { DrumBookCategory } from '@/db/dexie'

interface ManifestEntry {
  /** Filename under /public/drum-import */
  file: string
  /** If set, attach this PDF to an existing indexed book with this exact title instead of creating a new one. */
  matchTitle?: string
  title?: string
  author?: string
  category?: DrumBookCategory
  tags?: string[]
}

const MANIFEST: ManifestEntry[] = [
  {
    file: '40-rudiments.pdf',
    title: '40 Essential Drum Rudiments',
    author: 'Percussive Arts Society',
    category: 'Rudiments',
    tags: ['rudiments', 'reference'],
  },
  {
    file: 'benny-greb-language-of-drumming.pdf',
    matchTitle: 'The Language of Drumming',
    author: 'Benny Greb',
    category: 'Theory',
    tags: ['theory', 'creativity'],
  },
  {
    file: 'gary-chaffee-sticking-patterns.pdf',
    matchTitle: 'Sticking Patterns',
    author: 'Gary Chaffee',
    category: 'Rudiments',
    tags: ['stickings', 'patterns'],
  },
  {
    file: 'john-pickering-cook-book.pdf',
    title: 'The Cook Book',
    author: 'John Pickering',
    category: 'Grooves',
    tags: ['grooves', 'patterns'],
  },
  {
    file: 'syncopation.pdf',
    matchTitle: 'Progressive Steps to Syncopation',
    author: 'Ted Reed',
    category: 'Reading',
    tags: ['reading', 'syncopation'],
  },
]

export interface ImportDrumBooksResult {
  imported: string[]
  skipped: string[]
  failed: { file: string; error: string }[]
}

async function detectPageCount(buf: ArrayBuffer): Promise<number | undefined> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
    const doc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise
    return doc.numPages
  } catch {
    return undefined
  }
}

export async function importDrumBooks(): Promise<ImportDrumBooksResult> {
  const imported: string[] = []
  const skipped: string[] = []
  const failed: { file: string; error: string }[] = []

  for (const entry of MANIFEST) {
    const sentinelKey = `drum-import:${entry.file}`
    const already = await db.meta.where('key').equals(sentinelKey).count()
    if (already > 0) {
      skipped.push(entry.file)
      continue
    }

    try {
      const res = await fetch(`/drum-import/${entry.file}`)
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${entry.file}`)
      const buf = await res.arrayBuffer()
      const pageCount = await detectPageCount(buf)
      const today = new Date().toISOString().slice(0, 10)

      // Write the book, its PDF, and the sentinel atomically. If any step
      // fails the whole book rolls back, so a re-sync never finds an
      // un-sentineled book/PDF and duplicates it. (fetch/detectPageCount stay
      // outside — a Dexie transaction cannot span non-Dexie async work.)
      await db.transaction('rw', [db.drumBooks, db.drumPDFs, db.meta], async () => {
        const existing = entry.matchTitle
          ? await db.drumBooks.where('title').equals(entry.matchTitle).first()
          : undefined

        let bookId: number
        if (existing) {
          bookId = existing.id!
          await db.drumBooks.update(bookId, {
            type: 'uploaded',
            fileSize: buf.byteLength,
            pageCount,
            dateAdded: today,
          })
        } else {
          bookId = (await db.drumBooks.add({
            title: entry.matchTitle ?? entry.title ?? entry.file,
            author: entry.author ?? '',
            category: entry.category ?? 'Other',
            tags: entry.tags ?? [],
            dateAdded: today,
            pageCount,
            fileSize: buf.byteLength,
            type: 'uploaded',
          })) as number
        }

        await db.drumPDFs.add({
          bookId,
          data: buf,
          mimeType: 'application/pdf',
          size: buf.byteLength,
        })

        await db.meta.add({ key: sentinelKey, value: new Date().toISOString() })
      })

      imported.push(entry.file)
    } catch (err: unknown) {
      failed.push({ file: entry.file, error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return { imported, skipped, failed }
}
