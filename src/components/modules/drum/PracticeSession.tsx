import { useState, useEffect, useRef } from 'react'
import { RUDIMENTS } from '@/data/rudiments'
import { DRUM_BOOKS } from '@/data/drum-lessons'
import type { FocusArea } from '@/data/drum-lessons'
import { startDrumSession, completeDrumSession, logRudiment } from '@/lib/drum'
import { formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Timer, Square, CheckCircle } from 'lucide-react'

type FocusType = 'rudiment' | 'lesson' | 'free'

interface Props {
  currentBpm: number
  onComplete: () => void
}

const FOCUS_AREAS: FocusArea[] = [
  'rudiments', 'grooves', 'fills', 'independence', 'dynamics',
  'bass-drum', 'linear', 'phrasing', 'stickings', 'reading', 'coordination',
]

export function PracticeSession({ currentBpm, onComplete }: Props) {
  const [phase, setPhase] = useState<'setup' | 'active' | 'complete'>('setup')
  const [focusType, setFocusType] = useState<FocusType>('free')
  const [selectedRudimentId, setSelectedRudimentId] = useState<string>('')
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [freeLabel, setFreeLabel] = useState<FocusArea>('grooves')

  const [elapsed, setElapsed] = useState(0)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [bpmAchieved, setBpmAchieved] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleStart = async () => {
    let focusArea = freeLabel as string
    let bookRef: string | undefined

    if (focusType === 'rudiment' && selectedRudimentId) {
      const r = RUDIMENTS.find(r => r.id === selectedRudimentId)
      focusArea = `rudiment:${r?.name ?? selectedRudimentId}`
    } else if (focusType === 'lesson' && selectedLessonId) {
      const allLessons = DRUM_BOOKS.flatMap(b => b.lessons)
      const lesson = allLessons.find(l => l.id === selectedLessonId)
      focusArea = `lesson:${lesson?.concept ?? selectedLessonId}`
      bookRef = lesson?.book
    }

    const id = await startDrumSession(focusArea, bookRef)
    setSessionId(id)
    setElapsed(0)
    setPhase('active')
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
  }

  const handleStop = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setPhase('complete')
  }

  const handleSave = async () => {
    if (!sessionId) return
    setSaving(true)
    const bpm = bpmAchieved ? parseInt(bpmAchieved, 10) : currentBpm
    await completeDrumSession(sessionId, elapsed, bpm, notes || undefined)
    if (focusType === 'rudiment' && selectedRudimentId) {
      await logRudiment(sessionId, selectedRudimentId, bpm, notes || undefined)
    }
    setSaving(false)
    onComplete()
    setPhase('setup')
    setElapsed(0)
    setSessionId(null)
    setBpmAchieved('')
    setNotes('')
  }

  if (phase === 'active') {
    return (
      <div className="space-y-4 p-4 border border-noir-accent/40 rounded-[2px] bg-noir-elevated">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-noir-muted">Session in progress</div>
            <div className="flex items-center gap-2 mt-1">
              <Timer size={14} className="text-noir-dim" />
              <span className="text-[32px] text-noir-white font-light font-mono leading-none">
                {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-noir-dim">Metronome</div>
            <div className="text-[20px] text-noir-accent">{currentBpm} BPM</div>
          </div>
        </div>
        <Button variant="ghost" fullWidth onClick={handleStop}>
          <Square size={13} className="inline mr-1.5" />
          Stop Session
        </Button>
      </div>
    )
  }

  if (phase === 'complete') {
    return (
      <div className="space-y-4 p-4 border border-noir-border rounded-[2px]">
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-noir-accent" />
          <span className="text-[11px] uppercase tracking-widest text-noir-accent">Session Complete</span>
        </div>
        <div className="text-[13px] text-noir-muted">
          Duration: {formatDuration(Math.floor(elapsed / 60))}
          {elapsed % 60 > 0 && ` ${elapsed % 60}s`}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">BPM Achieved</div>
          <input
            value={bpmAchieved}
            onChange={e => setBpmAchieved(e.target.value.replace(/\D/, ''))}
            placeholder={`${currentBpm} (metronome BPM)`}
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong"
          />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Notes (optional)</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What you worked on, what clicked, what to revisit..."
            rows={2}
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong resize-none"
          />
        </div>
        <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Log Session'}
        </Button>
      </div>
    )
  }

  // Setup phase
  return (
    <div className="space-y-4 p-4 border border-noir-border rounded-[2px]">
      <div className="text-[10px] uppercase tracking-widest text-noir-muted">New Practice Session</div>

      {/* Focus type */}
      <div className="grid grid-cols-3 gap-1.5">
        {(['rudiment', 'lesson', 'free'] as FocusType[]).map(t => (
          <button
            key={t}
            onClick={() => setFocusType(t)}
            className={cn(
              'py-2 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
              focusType === t
                ? 'border-noir-accent text-noir-white bg-noir-elevated'
                : 'border-noir-border text-noir-dim hover:border-noir-strong'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Rudiment picker */}
      {focusType === 'rudiment' && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Select Rudiment</div>
          <select
            value={selectedRudimentId}
            onChange={e => setSelectedRudimentId(e.target.value)}
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent focus:outline-none focus:border-noir-strong"
          >
            <option value="">— choose —</option>
            {RUDIMENTS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Lesson picker */}
      {focusType === 'lesson' && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Select Lesson</div>
          <select
            value={selectedLessonId}
            onChange={e => setSelectedLessonId(e.target.value)}
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent focus:outline-none focus:border-noir-strong"
          >
            <option value="">— choose —</option>
            {DRUM_BOOKS.map(book => (
              <optgroup key={book.id} label={book.title}>
                {book.lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.concept}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Free focus area */}
      {focusType === 'free' && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Focus Area</div>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_AREAS.map(area => (
              <button
                key={area}
                onClick={() => setFreeLabel(area)}
                className={cn(
                  'px-2.5 py-1.5 border rounded-[2px] text-[9px] uppercase tracking-widest transition-colors',
                  freeLabel === area
                    ? 'border-noir-accent text-noir-white bg-noir-elevated'
                    : 'border-noir-border text-noir-dim hover:border-noir-strong'
                )}
              >
                {area.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button variant="primary" fullWidth onClick={handleStart}>
        Start Session
      </Button>
    </div>
  )
}
