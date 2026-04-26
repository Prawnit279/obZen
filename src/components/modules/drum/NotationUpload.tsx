import { useState, useRef } from 'react'
import type { NotationData } from '@/data/notation-types'
import { parseStickingText } from '@/data/rudiment-notation'
import { db } from '@/db/dexie'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, Type, CheckCircle } from 'lucide-react'

interface Props {
  lessonId: string
  onSaved: (data: NotationData) => void
}

type Mode = 'choose' | 'pdf' | 'text'

export function NotationUpload({ lessonId, onSaved }: Props) {
  const [mode, setMode] = useState<Mode>('choose')
  const [pdfText, setPdfText] = useState('')
  const [manualText, setManualText] = useState('')
  const [tempo, setTempo] = useState('80')
  const [preview, setPreview] = useState<NotationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePdfFile = async (file: File) => {
    setLoading(true)
    setError('')
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      // Use CDN worker to avoid Vite worker bundle complexity
      GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${(await import('pdfjs-dist/package.json')).version}/build/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await getDocument({ data: arrayBuffer }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item: unknown) => {
          const t = item as { str?: string }
          return t.str ?? ''
        }).join(' ') + '\n'
      }
      setPdfText(text.trim() || '(No extractable text — this PDF likely uses image-based notation. Use text input instead.)')
      setMode('pdf')
    } catch (err) {
      setError('Could not read PDF. Try the text input method instead.')
      setMode('text')
    } finally {
      setLoading(false)
    }
  }

  const handleParseText = (raw: string) => {
    const bpm = parseInt(tempo, 10) || 80
    const data = parseStickingText(raw, bpm)
    const withLesson = { ...data, lessonId }
    setPreview(withLesson)
    return withLesson
  }

  const handleSave = async () => {
    if (!preview) return
    setSaved(false)
    // Store in Dexie as a serialized JSON blob under lessonId
    // We reuse the ayurvedaLogs table approach — store as notes field
    // Instead, store in a dedicated notation key-value via existing db
    // Use localStorage as a lightweight store for notation blobs
    const key = `notation:${lessonId}`
    localStorage.setItem(key, JSON.stringify(preview))
    setSaved(true)
    onSaved(preview)
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 py-2 text-[11px] text-noir-accent">
        <CheckCircle size={13} />
        Notation saved.
      </div>
    )
  }

  if (mode === 'choose') {
    return (
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-3">Add Notation</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex flex-col items-center gap-2 p-4 border border-noir-border rounded-[2px] hover:border-noir-strong transition-colors"
          >
            <Upload size={18} className="text-noir-dim" />
            <span className="text-[10px] uppercase tracking-widest text-noir-dim">{loading ? 'Reading…' : 'From PDF'}</span>
          </button>
          <button
            onClick={() => setMode('text')}
            className="flex flex-col items-center gap-2 p-4 border border-noir-border rounded-[2px] hover:border-noir-strong transition-colors"
          >
            <Type size={18} className="text-noir-dim" />
            <span className="text-[10px] uppercase tracking-widest text-noir-dim">Text Pattern</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfFile(f) }}
        />
        {error && <div className="text-[11px] text-noir-red">{error}</div>}
      </div>
    )
  }

  if (mode === 'pdf') {
    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest text-noir-dim">Extracted PDF Text</div>
        <div className="text-[11px] text-noir-muted bg-noir-elevated border border-noir-border rounded-[2px] p-3 max-h-32 overflow-y-auto whitespace-pre-wrap">
          {pdfText}
        </div>
        <div className="text-[10px] text-noir-dim border-l border-noir-strong pl-2">
          Most drum notation books use image-based PDFs. Copy any R/L sticking patterns you see and enter them below.
        </div>
        <Button variant="ghost" fullWidth onClick={() => setMode('text')}>
          <Type size={13} className="inline mr-1.5" />
          Enter sticking pattern manually
        </Button>
        <Button variant="ghost" onClick={() => setMode('choose')}>Back</Button>
      </div>
    )
  }

  // Text input mode
  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-widest text-noir-dim">Sticking Pattern</div>
      <div className="text-[10px] text-noir-dim space-y-0.5">
        <div>Enter R and L tokens separated by spaces.</div>
        <div>Use <span className="text-noir-accent">R&gt;</span> for accented notes, <span className="text-noir-accent">_</span> for rests.</div>
        <div>Example: <span className="font-mono text-noir-accent">R L R R L R L L</span></div>
      </div>
      <textarea
        value={manualText}
        onChange={e => setManualText(e.target.value)}
        placeholder="R L R R L R L L R L R R L R L L"
        rows={3}
        className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] font-mono text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong resize-none uppercase"
      />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-1.5">Tempo (BPM)</div>
          <input
            value={tempo}
            onChange={e => setTempo(e.target.value.replace(/\D/, ''))}
            placeholder="80"
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent focus:outline-none focus:border-noir-strong"
          />
        </div>
        <div className="pt-5">
          <Button
            variant="ghost"
            onClick={() => handleParseText(manualText)}
            disabled={!manualText.trim()}
          >
            <FileText size={13} className="inline mr-1.5" />
            Preview
          </Button>
        </div>
      </div>

      {preview && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-noir-dim">
            {preview.measures.length} measure{preview.measures.length !== 1 ? 's' : ''} · {preview.measures.reduce((a, m) => a + m.notes.filter(n => !n.rest).length, 0)} notes
          </div>
          <div className="flex gap-2">
            <Button variant="primary" fullWidth onClick={handleSave}>Save Notation</Button>
            <Button variant="ghost" onClick={() => setPreview(null)}>Clear</Button>
          </div>
        </div>
      )}

      <Button variant="ghost" onClick={() => setMode('choose')}>Back</Button>
    </div>
  )
}

// Load saved notation for a lessonId from localStorage
export function loadSavedNotation(lessonId: string): NotationData | null {
  const raw = localStorage.getItem(`notation:${lessonId}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as NotationData
  } catch {
    return null
  }
}

// Unused import suppression — db is available for future Dexie storage migration
void (db as unknown)
