import { useState, useRef, useCallback, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  FileText, Plus, Search, X, ChevronDown, ChevronUp,
  Trash2, Download, MoreHorizontal, AlertCircle,
} from 'lucide-react'
import { db } from '@/db/dexie'
import type { DrumBook, DrumBookCategory } from '@/db/dexie'
import { cn } from '@/lib/utils'

const MAX_BOOKS = 100
const CATEGORIES: DrumBookCategory[] = [
  'Technique', 'Independence', 'Rudiments', 'Grooves',
  'Reading', 'Bass Drum', 'Style', 'Theory', 'Other',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// PDF Viewer overlay
// ---------------------------------------------------------------------------

interface PDFViewerProps {
  bookId: number
  title: string
  onClose: () => void
}

function PDFViewer({ bookId, title, onClose }: PDFViewerProps) {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [inverted, setInverted] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<unknown>(null)

  const loadPDF = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const record = await db.drumPDFs.where('bookId').equals(bookId).first()
      if (!record) { setError('PDF data not found.'); setLoading(false); return }

      // Dynamic import to keep bundle lazy
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString()

      const loadingTask = pdfjsLib.getDocument({ data: record.data })
      const pdfDoc = await loadingTask.promise
      pdfDocRef.current = pdfDoc
      setTotalPages(pdfDoc.numPages)
      await renderPage(pdfDoc, 1)
    } catch (e) {
      setError('Failed to load PDF.')
    } finally {
      setLoading(false)
    }
  }, [bookId])

  const renderPage = async (pdfDoc: unknown, pageNum: number) => {
    const canvas = canvasRef.current
    if (!canvas || !pdfDoc) return
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdfPage = await (pdfDoc as ReturnType<typeof pdfjsLib.getDocument>['promise'] extends Promise<infer T> ? T : never).getPage(pageNum)
      const viewport = pdfPage.getViewport({ scale: window.innerWidth < 768 ? 1.2 : 1.8 })
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await pdfPage.render({ canvasContext: ctx, canvas, viewport }).promise
    } catch {
      // non-fatal
    }
  }

  // Load on mount
  useState(() => { loadPDF() })

  const goToPage = useCallback(async (p: number) => {
    if (!totalPages || p < 1 || p > totalPages) return
    setPage(p)
    if (pdfDocRef.current) await renderPage(pdfDocRef.current, p)
  }, [totalPages, pdfDocRef])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(page + 1)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(page - 1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [page, goToPage, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`PDF Viewer: ${title}`}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0a0a0a' }}
    >
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <button onClick={onClose} aria-label="Close viewer"><X size={18} style={{ color: '#555555' }} /></button>
        <div className="flex-1 min-w-0 mx-3">
          <p className="text-[12px] truncate" style={{ color: '#d4d4d4' }}>{title}</p>
          {totalPages && (
            <p className="text-[10px]" style={{ color: '#555555' }}>Page {page} / {totalPages}</p>
          )}
        </div>
        <button
          onClick={() => setInverted(v => !v)}
          className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-[2px] transition-opacity hover:opacity-70"
          style={{ border: '1px solid #2a2a2a', color: '#888888' }}
          aria-label="Toggle invert"
        >
          {inverted ? '☀' : '☾'}
        </button>
      </header>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-2">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <span className="text-[11px] uppercase tracking-widest" style={{ color: '#555555' }}>Loading PDF...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 py-20">
            <AlertCircle size={14} style={{ color: '#cc3333' }} />
            <span className="text-[11px]" style={{ color: '#cc3333' }}>{error}</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            filter: inverted ? 'invert(1) contrast(1.1)' : 'none',
            display: loading || error ? 'none' : 'block',
          }}
        />
      </div>

      {/* Page nav */}
      {totalPages && totalPages > 1 && (
        <footer className="shrink-0 flex items-center justify-center gap-4 py-3" style={{ borderTop: '1px solid #2a2a2a' }}>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-[2px] disabled:opacity-30 transition-opacity hover:opacity-70"
            style={{ border: '1px solid #2a2a2a', color: '#888888' }}
          >
            ← Prev
          </button>
          <span className="text-[10px] tabular-nums" style={{ color: '#555555' }} aria-live="polite" aria-atomic="true">{page}/{totalPages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-[2px] disabled:opacity-30 transition-opacity hover:opacity-70"
            style={{ border: '1px solid #2a2a2a', color: '#888888' }}
          >
            Next →
          </button>
        </footer>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add Book flow (3-step)
// ---------------------------------------------------------------------------

type AddStep = 'upload' | 'metadata' | 'confirm'

interface AddBookSheetProps {
  onClose: () => void
  onSaved: () => void
}

function AddBookSheet({ onClose, onSaved }: AddBookSheetProps) {
  const [step, setStep] = useState<AddStep>('upload')
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [fileSize, setFileSize] = useState(0)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState<DrumBookCategory>('Technique')
  const [tags, setTags] = useState('')
  const [pageCount, setPageCount] = useState<number | undefined>()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') return
    setUploading(true)
    setProgress(0)
    const reader = new FileReader()
    reader.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    reader.onload = async (e) => {
      const buf = e.target?.result as ArrayBuffer
      setPdfBuffer(buf)
      setFileSize(buf.byteLength)
      setTitle(file.name.replace(/\.pdf$/i, ''))
      // Try to detect page count
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
        const doc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise
        setPageCount(doc.numPages)
      } catch { /* ignore */ }
      setUploading(false)
      setStep('metadata')
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSave = async () => {
    if (!pdfBuffer || !title.trim()) return
    setSaving(true)
    try {
      const bookId = await db.drumBooks.add({
        title: title.trim(),
        author: author.trim(),
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        dateAdded: new Date().toISOString().slice(0, 10),
        pageCount,
        fileSize,
        type: 'uploaded',
      }) as number
      await db.drumPDFs.add({
        bookId,
        data: pdfBuffer,
        mimeType: 'application/pdf',
        size: fileSize,
      })
      onSaved()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save book.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-t-[4px] flex flex-col max-h-[85vh]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <span className="text-[12px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>
            Add Book — {step === 'upload' ? '1/3 Upload' : step === 'metadata' ? '2/3 Details' : '3/3 Confirm'}
          </span>
          <button onClick={onClose} aria-label="Close"><X size={16} style={{ color: '#555555' }} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 py-12 rounded-[2px] cursor-pointer transition-opacity hover:opacity-70"
              style={{ border: '1px dashed #3a3a3a' }}
            >
              <FileText size={24} style={{ color: '#555555' }} />
              <p className="text-[12px]" style={{ color: '#888888' }}>Tap to select PDF or drag here</p>
              <p className="text-[10px]" style={{ color: '#555555' }}>application/pdf only</p>
              {uploading && (
                <div className="w-full max-w-xs">
                  <div className="h-[2px] rounded-full" style={{ background: '#1a1a1a' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#d4d4d4' }} />
                  </div>
                  <p className="text-[10px] text-center mt-1" style={{ color: '#555555' }}>Reading PDF... {progress}%</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
            </div>
          )}

          {/* Step 2: Metadata */}
          {step === 'metadata' && (
            <div className="space-y-3">
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Book title" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Author</label>
                <input value={author} onChange={e => setAuthor(e.target.value)} className="input" placeholder="Author name" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={cn('px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest transition-colors')}
                      style={{ border: `1px solid ${category === c ? '#888888' : '#2a2a2a'}`, color: category === c ? '#d4d4d4' : '#555555', background: category === c ? '#181818' : 'transparent' }}
                    >{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Tags (comma separated)</label>
                <input value={tags} onChange={e => setTags(e.target.value)} className="input" placeholder="jazz, beginner, snare..." />
              </div>
              <button onClick={() => setStep('confirm')} disabled={!title.trim()}
                className="w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest transition-opacity disabled:opacity-30"
                style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="rounded-[2px] p-4 space-y-2" style={{ background: '#0d0d0d', border: '1px solid #2a2a2a' }}>
                <p className="text-[14px]" style={{ color: '#d4d4d4' }}>{title}</p>
                {author && <p className="text-[11px]" style={{ color: '#888888' }}>{author}</p>}
                <div className="flex gap-3 text-[10px] uppercase tracking-widest" style={{ color: '#555555' }}>
                  <span>{category}</span>
                  {pageCount && <span>{pageCount} pages</span>}
                  <span>{formatBytes(fileSize)}</span>
                </div>
                {tags && <p className="text-[10px]" style={{ color: '#555555' }}>{tags}</p>}
              </div>
              {saveError && (
                <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#cc3333' }}>
                  <AlertCircle size={12} /> {saveError}
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep('metadata')}
                  className="flex-1 py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest"
                  style={{ border: '1px solid #2a2a2a', color: '#555555' }}>
                  ← Back
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest disabled:opacity-40"
                  style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}>
                  {saving ? 'Saving...' : 'Save to Library'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Book card with ⋯ menu
// ---------------------------------------------------------------------------

interface BookCardProps {
  book: DrumBook
  onOpen: () => void
  onDelete: () => void
}

function BookCard({ book, onOpen, onDelete }: BookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleExport = async () => {
    const pdfRec = await db.drumPDFs.where('bookId').equals(book.id!).first()
    if (!pdfRec) return
    const blob = new Blob([pdfRec.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${book.title}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  const handleDelete = async () => {
    await db.drumPDFs.where('bookId').equals(book.id!).delete()
    await db.drumNotations.where('bookId').equals(book.id!).delete()
    await db.drumBooks.delete(book.id!)
    onDelete()
  }

  return (
    <div className="rounded-[2px] p-4" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <FileText size={16} style={{ color: '#555555', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] truncate" style={{ color: '#d4d4d4' }}>{book.title}</p>
            {book.author && <p className="text-[11px]" style={{ color: '#555555' }}>{book.author}</p>}
            <div className="flex gap-3 mt-1 text-[10px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>
              <span>{book.category}</span>
              {book.pageCount && <span>{book.pageCount}pp</span>}
              {book.fileSize && <span>{formatBytes(book.fileSize)}</span>}
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: '#3a3a3a' }}>Added {formatDate(book.dateAdded)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {book.type === 'uploaded' && (
            <button
              onClick={onOpen}
              className="px-3 py-1.5 rounded-[2px] text-[10px] uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ border: '1px solid #2a2a2a', color: '#888888' }}
            >
              Open
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="p-1.5 transition-opacity hover:opacity-70"
              style={{ color: '#555555' }}
              aria-label="Book options"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-[2px] z-10 py-1"
                style={{ background: '#181818', border: '1px solid #2a2a2a' }}
              >
                {book.type === 'uploaded' && (
                  <button onClick={handleExport}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left transition-colors hover:bg-noir-elevated"
                    style={{ color: '#888888' }}>
                    <Download size={12} /> Export PDF
                  </button>
                )}
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left transition-colors hover:bg-noir-elevated"
                    style={{ color: '#fca5a5' }}>
                    <Trash2 size={12} /> Delete
                  </button>
                ) : (
                  <button onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left"
                    style={{ color: '#fca5a5' }}>
                    <Trash2 size={12} /> Confirm Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main DrumLibrary component
// ---------------------------------------------------------------------------

const INDEXED_BOOKS: Omit<DrumBook, 'id'>[] = [
  { title: 'Stick Control', author: 'George Lawrence Stone', category: 'Technique', dateAdded: '2024-01-01', type: 'indexed', tags: ['rudiments', 'stickings'] },
  { title: 'Progressive Steps to Syncopation', author: 'Ted Reed', category: 'Reading', dateAdded: '2024-01-01', type: 'indexed', tags: ['reading', 'syncopation'] },
  { title: 'Advanced Techniques for the Modern Drummer', author: 'Jim Chapin', category: 'Independence', dateAdded: '2024-01-01', type: 'indexed', tags: ['independence', 'jazz'] },
  { title: 'The New Breed', author: 'Gary Chester', category: 'Independence', dateAdded: '2024-01-01', type: 'indexed', tags: ['independence', 'grooves'] },
  { title: 'Master Studies', author: 'Joe Morello', category: 'Technique', dateAdded: '2024-01-01', type: 'indexed', tags: ['control', 'accent'] },
  { title: 'Bass Drum Control', author: 'Colin Bailey', category: 'Bass Drum', dateAdded: '2024-01-01', type: 'indexed', tags: ['bass drum', 'technique'] },
  { title: 'Realistic Rock', author: 'Carmine Appice', category: 'Style', dateAdded: '2024-01-01', type: 'indexed', tags: ['rock', 'grooves'] },
  { title: "The Drummer's Bible", author: 'Mick Berry & Jason Gianni', category: 'Theory', dateAdded: '2024-01-01', type: 'indexed', tags: ['styles', 'reference'] },
  { title: 'Groove Essentials', author: 'Tommy Igoe', category: 'Grooves', dateAdded: '2024-01-01', type: 'indexed', tags: ['grooves', 'phrasing'] },
  { title: 'The Language of Drumming', author: 'Benny Greb', category: 'Theory', dateAdded: '2024-01-01', type: 'indexed', tags: ['theory', 'creativity'] },
  { title: 'Sticking Patterns', author: 'Gary Chaffee', category: 'Rudiments', dateAdded: '2024-01-01', type: 'indexed', tags: ['stickings', 'patterns'] },
]

async function seedIndexedBooks() {
  const already = await db.meta.where('key').equals('books-seeded').first()
  if (already) return
  await db.drumBooks.bulkAdd(INDEXED_BOOKS)
  await db.meta.add({ key: 'books-seeded', value: '1' })
}

export function DrumLibrary() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DrumBookCategory | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [viewingBook, setViewingBook] = useState<{ id: number; title: string } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    seedIndexedBooks()
    navigator.storage?.persist?.()
  }, [])

  const books = useLiveQuery(
    () => db.drumBooks.orderBy('dateAdded').reverse().toArray(),
    [refreshKey]
  )

  const totalSize = books?.reduce((s, b) => s + (b.fileSize ?? 0), 0) ?? 0
  const bookCount = books?.length ?? 0
  const atLimit = bookCount >= MAX_BOOKS

  const filtered = books?.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || b.category === categoryFilter
    return matchSearch && matchCat
  }) ?? []

  const uploaded = filtered.filter(b => b.type === 'uploaded')
  const indexed = filtered.filter(b => b.type === 'indexed')

  if (viewingBook) {
    return <PDFViewer bookId={viewingBook.id} title={viewingBook.title} onClose={() => setViewingBook(null)} />
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[12px]" style={{ color: '#d4d4d4' }}>
            DRUM LIBRARY
          </span>
          <span className="text-[10px] ml-2" style={{ color: '#555555' }}>
            {bookCount} books · {formatBytes(totalSize)}
          </span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={atLimit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-[10px] uppercase tracking-widest disabled:opacity-30 transition-opacity hover:opacity-70"
          style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}
          aria-label="Add book"
        >
          <Plus size={12} /> Add Book
        </button>
      </div>

      {/* Capacity warning */}
      {atLimit && (
        <div className="flex items-center gap-2 p-3 rounded-[2px]" style={{ border: '1px solid rgba(252,165,165,0.3)' }}>
          <AlertCircle size={12} style={{ color: '#fca5a5' }} />
          <span className="text-[11px]" style={{ color: '#fca5a5' }}>Library full (100/100). Delete a book to add more.</span>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555555' }} />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-8"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} style={{ color: '#555555' }} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-[2px] text-[10px] uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ border: '1px solid #2a2a2a', color: '#555555' }}
        >
          Filter {showFilters ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </div>

      {/* Category filter chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...CATEGORIES] as const).map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={cn('px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest transition-colors')}
              style={{ border: `1px solid ${categoryFilter === c ? '#888888' : '#2a2a2a'}`, color: categoryFilter === c ? '#d4d4d4' : '#555555', background: categoryFilter === c ? '#181818' : 'transparent' }}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Uploaded books */}
      {uploaded.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>Uploaded ({uploaded.length})</p>
          {uploaded.map(b => (
            <BookCard key={b.id} book={b}
              onOpen={() => setViewingBook({ id: b.id!, title: b.title })}
              onDelete={() => setRefreshKey(k => k + 1)}
            />
          ))}
        </div>
      )}

      {/* Indexed-only books */}
      {indexed.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>Index-only ({indexed.length})</p>
          {indexed.map(b => (
            <BookCard key={b.id} book={b}
              onOpen={() => {}}
              onDelete={() => setRefreshKey(k => k + 1)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <FileText size={28} style={{ color: '#2a2a2a' }} />
          <p className="text-[12px]" style={{ color: '#555555' }}>
            {search || categoryFilter !== 'all' ? 'No books match your filter.' : 'No books yet. Add your first PDF.'}
          </p>
        </div>
      )}

      {/* Add sheet */}
      {showAdd && (
        <AddBookSheet onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); setRefreshKey(k => k + 1) }} />
      )}
    </div>
  )
}
