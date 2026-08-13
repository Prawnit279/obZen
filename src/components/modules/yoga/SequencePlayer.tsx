import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Play, Pause, SkipForward, CheckCircle } from 'lucide-react'
import { db } from '@/db/dexie'
import { todayISO, cn } from '@/lib/utils'
import { AnimatedPose, hasPoseAnim } from '@/components/modules/yoga/AnimatedPose'
import type { YogaPose } from '@/data/yoga-poses'

interface Props {
  poses: YogaPose[]
  sequenceName: string
  onClose: () => void
}

type Phase = 'ready' | 'active' | 'done'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDurationSecs(dur: string): number {
  const rangeMatch = dur.match(/(\d+)[–\-](\d+)/)
  if (rangeMatch) return Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2)
  const m = dur.match(/(\d+)/)
  if (!m) return 30
  const n = parseInt(m[1])
  if (dur.includes('round') || dur.includes('rep')) return Math.max(n * 3, 30)
  return n
}

function formatTime(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function playBeep(ctx: AudioContext, freq: number, duration: number): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function playCompletionBeep(ctx: AudioContext): void {
  playBeep(ctx, 880, 0.25)
  setTimeout(() => playBeep(ctx, 1100, 0.35), 280)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SequencePlayer({ poses, sequenceName, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [poseIdx, setPoseIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>([])

  const sessionStartRef = useRef<number>(0)
  const poseStartRef = useRef<number>(0)
  const pauseOffsetRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Keep a stable ref to advancePose to avoid stale closures in the interval
  const advancePoseRef = useRef<(currentIdx: number) => void>(() => undefined)

  const advancePose = useCallback(
    (currentIdx: number) => {
      if (audioCtxRef.current) playCompletionBeep(audioCtxRef.current)
      setCompletedIds(prev => [...prev, poses[currentIdx].id])
      if (currentIdx >= poses.length - 1) {
        setPhase('done')
      } else {
        setPoseIdx(currentIdx + 1)
      }
    },
    [poses],
  )

  // Keep ref in sync so the interval closure always calls the latest version
  useEffect(() => {
    advancePoseRef.current = advancePose
  }, [advancePose])

  // Reset timer when pose changes while active
  useEffect(() => {
    if (phase !== 'active') return
    poseStartRef.current = Date.now()
    pauseOffsetRef.current = 0
    setTimeLeft(parseDurationSecs(poses[poseIdx].duration))
    setPaused(false)
  }, [poseIdx, phase, poses])

  // Countdown interval
  useEffect(() => {
    if (phase !== 'active' || paused) return

    const poseDur = parseDurationSecs(poses[poseIdx].duration)

    const id = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - poseStartRef.current - pauseOffsetRef.current) / 1000,
      )
      const remaining = Math.max(0, poseDur - elapsed)
      setTimeLeft(remaining)
      if (remaining === 0) {
        clearInterval(id)
        advancePoseRef.current(poseIdx)
      }
    }, 500)

    return () => clearInterval(id)
  }, [phase, paused, poseIdx, poses])

  // Save session and close
  const handleFinish = useCallback(async () => {
    const totalMin = Math.round((Date.now() - sessionStartRef.current) / 60000)
    try {
      await db.yogaSessions.add({
        date: todayISO(),
        sequenceId: 'player-session',
        sequenceName,
        duration: Math.max(1, totalMin),
        posesDone: completedIds,
      })
    } catch {
      // Non-critical — still close on error
    }
    onClose()
  }, [completedIds, onClose, sequenceName])

  // Begin sequence
  function handleBegin(): void {
    // Lazily create AudioContext on user interaction (browser autoplay policy)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    sessionStartRef.current = Date.now()
    poseStartRef.current = Date.now()
    pauseOffsetRef.current = 0
    setTimeLeft(parseDurationSecs(poses[0].duration))
    setPoseIdx(0)
    setCompletedIds([])
    setPhase('active')
  }

  function handlePauseResume(): void {
    if (paused) {
      pauseOffsetRef.current += Date.now() - pausedAtRef.current
      setPaused(false)
    } else {
      pausedAtRef.current = Date.now()
      setPaused(true)
    }
  }

  function handleSkip(): void {
    advancePoseRef.current(poseIdx)
  }

  function handleEnd(): void {
    setPhase('done')
  }

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const currentPose = poses[poseIdx]
  const nextPose = poseIdx < poses.length - 1 ? poses[poseIdx + 1] : null
  const poseDur = phase === 'active' ? parseDurationSecs(currentPose.duration) : 1
  const progressPct = phase === 'active' ? Math.round((timeLeft / poseDur) * 100) : 100
  const totalMinutesElapsed = Math.max(
    1,
    Math.round((Date.now() - sessionStartRef.current) / 60000),
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="shrink-0 flex items-center gap-3 p-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={phase === 'done' ? handleFinish : onClose}
          className="flex items-center justify-center w-8 h-8 rounded-sm transition-opacity hover:opacity-60"
          aria-label="Close sequence player"
        >
          <X size={18} style={{ color: 'var(--dim)' }} />
        </button>

        <div className="flex-1 min-w-0">
          {phase === 'active' && (
            <p
              className="text-[10px] tracking-widest uppercase mb-0.5"
              style={{ color: 'var(--dim)' }}
            >
              Pose {poseIdx + 1} of {poses.length}
            </p>
          )}
          <p
            className="text-[13px] truncate"
            style={{ color: 'var(--accent)' }}
          >
            {sequenceName}
          </p>
        </div>
      </header>

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4">

        {/* ---- READY ---- */}
        {phase === 'ready' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-xs mt-8">
            <div className="flex flex-col items-center gap-1">
              <h1
                className="text-[22px] text-center font-medium tracking-wide"
                style={{ color: 'var(--accent)' }}
              >
                {sequenceName}
              </h1>
              <p className="text-[13px]" style={{ color: 'var(--dim)' }}>
                {poses.length} pose{poses.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Preview first 3 poses */}
            <ul className="flex flex-col gap-1 w-full">
              {poses.slice(0, 3).map((p, i) => (
                <li
                  key={p.id}
                  className="text-[12px] px-3 py-1.5 rounded"
                  style={{ color: 'var(--dim)', background: 'var(--surface)' }}
                >
                  {i + 1}. {p.name}
                </li>
              ))}
              {poses.length > 3 && (
                <li className="text-[11px] px-3" style={{ color: 'var(--dim)' }}>
                  +{poses.length - 3} more
                </li>
              )}
            </ul>

            <button
              onClick={handleBegin}
              className={cn(
                'w-full py-3 rounded text-[14px] tracking-widest uppercase transition-opacity hover:opacity-80',
              )}
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >
              Begin
            </button>
          </div>
        )}

        {/* ---- ACTIVE ---- */}
        {phase === 'active' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-4">
            {/* Pose illustration */}
            <div
              className="flex items-center justify-center rounded"
              style={{
                width: 128,
                height: 144,
                background: 'var(--surface)',
                border: '1px solid #1e1e1e',
              }}
            >
              {hasPoseAnim(currentPose.id) ? (
                <AnimatedPose
                  poseId={currentPose.id}
                  size="medium"
                  autoPlay={!paused}
                />
              ) : (
                <div
                  className="flex items-center justify-center w-[120px] h-[135px] rounded"
                  style={{ background: 'var(--elevated)' }}
                >
                  <span className="text-[11px]" style={{ color: 'var(--dim)' }}>
                    —
                  </span>
                </div>
              )}
            </div>

            {/* Pose name */}
            <div className="flex flex-col items-center gap-0.5 text-center">
              <h2
                className="text-[18px] uppercase tracking-wide leading-snug"
                style={{ color: 'var(--accent)' }}
              >
                {currentPose.name}
              </h2>
              {currentPose.sanskritName && (
                <p className="text-[11px] italic" style={{ color: 'var(--dim)' }}>
                  {currentPose.sanskritName}
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-[2px] rounded-full" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: '#d4d4d4',
                  transition: 'none',
                }}
              />
            </div>

            {/* Timer */}
            <p className="text-[36px] font-mono tabular-nums" style={{ color: 'var(--accent)' }}>
              {formatTime(timeLeft)}
            </p>

            {/* Pitta note */}
            {currentPose.pittaNote && (
              <div
                className="w-full pl-3"
                style={{ borderLeft: '2px solid var(--border)' }}
              >
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--dim)' }}>
                  Pitta: {currentPose.pittaNote}
                </p>
              </div>
            )}

            {/* Next pose hint */}
            {nextPose && (
              <p className="text-[11px] uppercase tracking-widest mt-1" style={{ color: 'var(--dim)' }}>
                Next: {nextPose.name}
              </p>
            )}
          </div>
        )}

        {/* ---- DONE ---- */}
        {phase === 'done' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-xs mt-10">
            <CheckCircle size={48} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-[20px]" style={{ color: 'var(--accent)' }}>
                Sequence Complete
              </h2>
              <p className="text-[13px]" style={{ color: 'var(--dim)' }}>
                {completedIds.length} pose{completedIds.length !== 1 ? 's' : ''} &middot;{' '}
                {totalMinutesElapsed} min
              </p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 rounded text-[14px] tracking-widest uppercase transition-opacity hover:opacity-80"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >
              Close
            </button>
          </div>
        )}
      </main>

      {/* Footer controls — active phase only */}
      {phase === 'active' && (
        <footer
          className="shrink-0 flex gap-3 p-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* End */}
          <button
            onClick={handleEnd}
            className="flex items-center justify-center px-4 py-2 rounded text-[13px] transition-opacity hover:opacity-70"
            style={{ border: '1px solid var(--border)', color: 'var(--dim)' }}
            aria-label="End sequence"
          >
            End
          </button>

          {/* Pause / Resume */}
          <button
            onClick={handlePauseResume}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-[13px] transition-opacity hover:opacity-70"
            style={{ border: '1px solid #888888', color: 'var(--muted)' }}
            aria-label={paused ? 'Resume' : 'Pause'}
          >
            {paused ? (
              <>
                <Play size={15} />
                Resume
              </>
            ) : (
              <>
                <Pause size={15} />
                Pause
              </>
            )}
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded text-[13px] transition-opacity hover:opacity-70"
            style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
            aria-label="Skip to next pose"
          >
            <SkipForward size={15} />
          </button>
        </footer>
      )}
    </div>
  )
}
