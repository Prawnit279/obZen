/**
 * SpeechUI — mic FAB + result card + hint sheet + unsupported notice.
 * Rendered once in AppShell. Self-contained speech state.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, MicOff, ChevronDown } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { executeSpeechIntent } from '@/lib/speech-actions'
import type { SpeechIntent, SpeechActionResult } from '@/lib/speech-recognition'
import { db } from '@/db/dexie'
import type { CalendarEvent } from '@/db/dexie'
import { cn } from '@/lib/utils'

// Prop type for ResultCard — combines action result with the raw intent
interface ResultCardIntent extends SpeechActionResult {
  raw: SpeechIntent
}

// ── Helpers ────────────────────────────────────────────────────────────────

function friendlyDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function friendlyTime(hhmm?: string): string | null {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  const mins = m > 0 ? `:${String(m).padStart(2, '0')}` : ''
  return `${hour}${mins} ${ampm}`
}

const INTENT_LABEL: Record<string, string> = {
  ADD_JAM_SESSION:    'Jam Session',
  ADD_MEETING:        'Meeting',
  ADD_CALENDAR_EVENT: 'Calendar Event',
  SET_REMINDER:       'Reminder',
  OPEN_MODULE:        'Navigate',
  UNKNOWN:            'Unknown',
}

// ── Command Hints ──────────────────────────────────────────────────────────

const HINT_GROUPS = [
  {
    label: 'Scheduling',
    hints: [
      '"Schedule a jam session Friday at 7pm"',
      '"Add a meeting tomorrow at 2pm"',
      '"Book band rehearsal Monday at the studio"',
    ],
  },
  {
    label: 'Planning',
    hints: [
      '"Remind me to do breathing exercises tonight"',
      '"Add drum practice Saturday morning"',
    ],
  },
  {
    label: 'Navigation',
    hints: [
      '"Open drum studio"',
      '"Go to nutrition"',
      '"Show me the calendar"',
    ],
  },
]

// ── Hint Sheet ─────────────────────────────────────────────────────────────

function HintSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice commands"
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-t-[4px] max-h-[70vh] overflow-y-auto"
        style={{ background: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center justify-between px-4 py-3 sticky top-0" style={{ background: '#111111', borderBottom: '1px solid #2a2a2a' }}>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#555555' }}>
            Voice Commands
          </span>
          {/* min 44×44 touch target */}
          <button
            onClick={onClose}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-noir-dim hover:text-noir-muted transition-colors"
            aria-label="Close hints"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5">
          {HINT_GROUPS.map(group => (
            <div key={group.label}>
              <div className="text-[9px] uppercase tracking-widest mb-2.5" style={{ color: '#555555' }}>
                {group.label}
              </div>
              <div className="space-y-2">
                {group.hints.map(hint => (
                  <div
                    key={hint}
                    className="text-[12px] pl-3"
                    style={{ color: '#888888', borderLeft: '1px solid #2a2a2a' }}
                  >
                    {hint}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Unsupported Notice ─────────────────────────────────────────────────────

function UnsupportedNotice({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Speech not supported"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="w-full max-w-xs rounded-[2px] p-5 space-y-3"
        style={{ background: '#111111', border: '1px solid #2a2a2a' }}
      >
        <div className="text-[11px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>
          Speech Recognition
        </div>
        <p className="text-[12px]" style={{ color: '#888888' }}>
          Not supported in this browser.<br />
          Use Chrome or Safari (iOS 16.4+).
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 text-[10px] uppercase tracking-widest rounded-[2px] transition-colors"
          style={{ border: '1px solid #3a3a3a', color: '#888888' }}
        >
          OK
        </button>
      </div>
    </div>
  )
}

// ── Result Card ────────────────────────────────────────────────────────────

interface ResultCardProps {
  transcript: string
  intent: ResultCardIntent
  onConfirm: () => Promise<void>
  onCancel: () => void
  confirming: boolean
}

function ResultCard({ transcript, intent, onConfirm, onCancel, confirming }: ResultCardProps) {
  const { raw } = intent
  const dateStr    = 'date'      in raw ? (raw as { date: string }).date           : null
  const timeStr    = 'time'      in raw ? (raw as { time?: string }).time          : null
  const venueStr   = 'venue'     in raw ? (raw as { venue?: string }).venue        : null
  const titleStr   = 'title'     in raw ? (raw as { title: string }).title         : null
  const attendees  = 'attendees' in raw ? (raw as { attendees?: string[] }).attendees : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm voice command"
      className="fixed left-3 right-3 z-50 rounded-[2px] p-4 space-y-3"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        background: '#111111',
        border: '1px solid #2a2a2a',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.6)',
      }}
    >
      {/* Transcript */}
      <div className="flex items-start gap-2">
        <Mic size={12} style={{ color: '#555555', marginTop: 2, flexShrink: 0 }} />
        <p className="text-[11px] italic leading-relaxed" style={{ color: '#888888' }}>
          "{transcript}"
        </p>
      </div>

      {/* Parsed intent */}
      <div className="space-y-1">
        <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--theme-border-active)' }}>
          {INTENT_LABEL[raw.type] ?? raw.type}
        </div>
        {titleStr && (
          <div className="text-[13px]" style={{ color: '#ffffff' }}>{titleStr}</div>
        )}
        {dateStr && (
          <div className="text-[12px]" style={{ color: '#d4d4d4' }}>
            {friendlyDate(dateStr)}
            {timeStr && <span> · {friendlyTime(timeStr)}</span>}
          </div>
        )}
        {venueStr && (
          <div className="text-[11px]" style={{ color: '#888888' }}>at {venueStr}</div>
        )}
        {attendees && attendees.length > 0 && (
          <div className="text-[11px]" style={{ color: '#888888' }}>
            with {attendees.join(', ')}
          </div>
        )}
        {!intent.success && (
          <div className="text-[11px]" style={{ color: '#cc3333' }}>{intent.message}</div>
        )}
      </div>

      {/* Actions */}
      {intent.requiresConfirmation && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 py-2.5 text-[10px] uppercase tracking-widest rounded-[2px] disabled:opacity-40 transition-colors"
            style={{ border: '1px solid var(--theme-border-active)', color: 'var(--theme-border-active)' }}
            aria-label="Confirm voice command"
          >
            {confirming ? 'Saving…' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 py-2.5 text-[10px] uppercase tracking-widest rounded-[2px] transition-colors"
            style={{ border: '1px solid #3a3a3a', color: '#888888' }}
            aria-label="Cancel voice command"
          >
            Cancel
          </button>
        </div>
      )}
      {!intent.requiresConfirmation && (
        <button
          onClick={onCancel}
          className="w-full py-2.5 text-[10px] uppercase tracking-widest rounded-[2px] transition-colors"
          style={{ border: '1px solid #3a3a3a', color: '#888888' }}
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}

// ── Main SpeechUI ──────────────────────────────────────────────────────────

export function SpeechUI() {
  const navigate = useNavigate()
  const { isListening, transcript, result, error, supported,
          startListening, stopListening, reset } = useSpeechRecognition()

  const [showResult, setShowResult]         = useState(false)
  const [showHints, setShowHints]           = useState(false)
  const [showUnsupported, setShowUnsupported] = useState(false)
  const [confirming, setConfirming]         = useState(false)

  const pressTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Show result card when a transcript is finalised
  useEffect(() => {
    if (!result) return
    const action = executeSpeechIntent(result.intent)

    // Navigation intent: execute immediately, no card
    if (action.navigateTo) {
      navigate(action.navigateTo)
      reset()
      return
    }

    setShowResult(true)

    // Auto-dismiss after 15 s if no action taken
    clearTimeout(dismissTimerRef.current ?? undefined)
    dismissTimerRef.current = setTimeout(() => {
      setShowResult(false)
      reset()
    }, 15_000)
  }, [result, navigate, reset])

  // Announce listening errors to screen readers
  useEffect(() => {
    if (error && error !== 'not-supported') {
      // non-fatal errors (no-speech, aborted) — just reset
      reset()
    }
  }, [error, reset])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(pressTimerRef.current ?? undefined)
      clearTimeout(dismissTimerRef.current ?? undefined)
    }
  }, [])

  // ── Long-press logic ────────────────────────────────────────────────────

  const handlePointerDown = useCallback(() => {
    pressTimerRef.current = setTimeout(() => setShowHints(true), 500)
  }, [])

  const handlePointerUp = useCallback(() => {
    clearTimeout(pressTimerRef.current ?? undefined)
  }, [])

  const handleMicClick = useCallback(() => {
    clearTimeout(pressTimerRef.current ?? undefined)
    if (!supported) {
      setShowUnsupported(true)
      return
    }
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [supported, isListening, startListening, stopListening])

  // ── Confirm handler — writes to Dexie ─────────────────────────────────

  const handleConfirm = useCallback(async () => {
    if (!result) return
    setConfirming(true)
    clearTimeout(dismissTimerRef.current ?? undefined)
    try {
      const { intent } = result
      switch (intent.type) {
        case 'ADD_JAM_SESSION':
          await db.jamSessions.add({
            date:      intent.date,
            time:      intent.time ?? '00:00',
            venue:     intent.venue ?? '',
            bandmates: [],
            setlist:   [],
            preCeck:   [],
            status:    'upcoming',
          })
          // Mirror to calendar
          await db.calendarEvents.add({
            title:     `Jam Session${intent.venue ? ` at ${intent.venue}` : ''}`,
            date:      intent.date,
            startTime: intent.time,
            category:  'jam' as CalendarEvent['category'],
          })
          break

        case 'ADD_MEETING':
          await db.meetings.add({
            date:      intent.date,
            time:      intent.time ?? '00:00',
            title:     intent.title,
            attendees: intent.attendees,
            status:    'open',
          })
          break

        case 'ADD_CALENDAR_EVENT': {
          const category = (intent.category as CalendarEvent['category']) ?? 'personal'
          await db.calendarEvents.add({
            title:     intent.title,
            date:      intent.date,
            startTime: intent.time,
            category,
          })
          break
        }

        case 'SET_REMINDER':
          await db.calendarEvents.add({
            title:     intent.text.slice(0, 80),
            date:      intent.date,
            startTime: intent.time,
            category:  'personal' as CalendarEvent['category'],
          })
          break

        default:
          break
      }
    } catch (e) {
      // Write failed — stay on card so user sees unchanged state
      console.error('Speech intent write failed:', e)
    } finally {
      setConfirming(false)
      setShowResult(false)
      reset()
    }
  }, [result, reset])

  const handleCancel = useCallback(() => {
    clearTimeout(dismissTimerRef.current ?? undefined)
    setShowResult(false)
    reset()
  }, [reset])

  // ── Mic button state ────────────────────────────────────────────────────

  const isProcessing = !isListening && !!transcript && !result

  // Don't render if unsupported (spec: hidden when unsupported)
  if (!supported) {
    return showUnsupported
      ? <UnsupportedNotice onClose={() => setShowUnsupported(false)} />
      : (
        <button
          onClick={() => setShowUnsupported(true)}
          aria-label="Voice commands (not supported)"
          className="fixed z-41 flex items-center justify-center"
          style={{
            bottom: 'env(safe-area-inset-bottom, 0px)',
            right: 0,
            width: 50,
            height: 56,
          }}
        >
          <Mic size={18} style={{ color: '#333333' }} />
        </button>
      )
  }

  const actionForResult: ResultCardIntent | null = result
    ? { ...executeSpeechIntent(result.intent), raw: result.intent }
    : null

  return (
    <>
      {/* Live transcript label — above mic while listening */}
      {isListening && transcript && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="fixed z-50 text-right pointer-events-none"
          style={{
            bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
            right: 54,
            maxWidth: 220,
          }}
        >
          <p
            className="text-[11px] uppercase tracking-widest leading-tight"
            style={{ color: '#888888' }}
          >
            {transcript.slice(0, 80)}{transcript.length > 80 ? '…' : ''}
          </p>
        </div>
      )}

      {/* Result card */}
      {showResult && result && actionForResult && (
        <ResultCard
          transcript={result.transcript}
          intent={actionForResult}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirming={confirming}
        />
      )}

      {/* Hint sheet */}
      {showHints && <HintSheet onClose={() => setShowHints(false)} />}

      {/* Unsupported notice */}
      {showUnsupported && <UnsupportedNotice onClose={() => setShowUnsupported(false)} />}

      {/* Mic FAB — sits at right edge of bottom nav zone */}
      <button
        onClick={handleMicClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label={
          isListening    ? 'Stop listening' :
          isProcessing   ? 'Processing speech…' :
          'Start voice command (hold for help)'
        }
        aria-pressed={isListening}
        className={cn(
          'fixed z-[41] flex items-center justify-center rounded-full transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-[var(--theme-border-active)]'
        )}
        style={{
          bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
          right: 4,
          width: 44,
          height: 44,
        }}
      >
        {/* Pulse ring — only while listening */}
        {isListening && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: 'var(--theme-border-active)',
              opacity: 0.25,
            }}
          />
        )}

        {isProcessing
          ? <MicOff size={18} style={{ color: '#888888' }} />
          : <Mic
              size={18}
              style={{
                color: isListening
                  ? 'var(--theme-border-active)'
                  : '#555555',
                position: 'relative',
              }}
            />
        }
      </button>
    </>
  )
}
