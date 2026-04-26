import { useState, useEffect, useCallback, useRef } from 'react'
import { X, CheckCircle } from 'lucide-react'
import type { BreathingTechnique } from '@/data/yoga-poses'
import { BreathingAnimation } from '@/components/modules/yoga/BreathingAnimation'

interface BreathingTimerProps {
  technique: BreathingTechnique
  onClose: () => void
}

type Phase = 'inhale' | 'hold-full' | 'exhale' | 'hold-empty' | 'pump'

interface PhaseConfig {
  sequence: Phase[]
  durations: Record<Phase, number>
  interval: number
}

const PHASE_COLORS: Record<Phase, string> = {
  inhale: '#d4d4d4',
  'hold-full': '#888888',
  exhale: '#555555',
  'hold-empty': '#888888',
  pump: '#d4d4d4',
}

const PHASE_LABELS: Record<Phase, string> = {
  inhale: 'INHALE',
  'hold-full': 'HOLD',
  exhale: 'EXHALE',
  'hold-empty': 'HOLD',
  pump: 'PUMP',
}

function getPhaseConfig(techniqueId: string): PhaseConfig {
  switch (techniqueId) {
    case 'box-breathing':
      return {
        sequence: ['inhale', 'hold-full', 'exhale', 'hold-empty'],
        durations: { inhale: 4, 'hold-full': 4, exhale: 4, 'hold-empty': 4, pump: 0 },
        interval: 1000,
      }
    case '4-7-8':
      return {
        sequence: ['inhale', 'hold-full', 'exhale'],
        durations: { inhale: 4, 'hold-full': 7, exhale: 8, 'hold-empty': 0, pump: 0 },
        interval: 1000,
      }
    case 'kapalbhati':
      return {
        sequence: ['pump'],
        durations: { inhale: 0, 'hold-full': 0, exhale: 0, 'hold-empty': 0, pump: 1 },
        interval: 500,
      }
    case 'ujjayi':
      return {
        sequence: ['inhale', 'exhale'],
        durations: { inhale: 4, 'hold-full': 0, exhale: 4, 'hold-empty': 0, pump: 0 },
        interval: 1000,
      }
    default:
      return {
        sequence: ['inhale', 'exhale'],
        durations: { inhale: 4, 'hold-full': 0, exhale: 6, 'hold-empty': 0, pump: 0 },
        interval: 1000,
      }
  }
}

const isKapalbhati = (id: string) => id === 'kapalbhati'

export function BreathingTimer({ technique, onClose }: BreathingTimerProps) {
  const config = getPhaseConfig(technique.id)
  const totalRounds = technique.rounds ?? 5

  const [phase, setPhase] = useState<Phase>(config.sequence[0])
  const phaseIndexRef = useRef<number>(0)
  const [count, setCount] = useState(config.durations[config.sequence[0]])
  const [roundsDone, setRoundsDone] = useState(0)
  const [pumpCount, setPumpCount] = useState(0)
  const [running, setRunning] = useState(true)
  const [sessionDone, setSessionDone] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Kapalbhati: pumps per round (30 pumps = 1 round at 0.5s each = 15s)
  const PUMPS_PER_ROUND = 30

  const tick = useCallback(() => {
    if (isKapalbhati(technique.id)) {
      setPumpCount(prev => {
        const next = prev + 1
        if (next >= PUMPS_PER_ROUND) {
          setRoundsDone(r => {
            const newRounds = r + 1
            if (newRounds >= totalRounds) {
              setSessionDone(true)
            }
            return newRounds
          })
          return 0
        }
        return next
      })
      return
    }

    setCount(prev => {
      if (prev > 1) return prev - 1

      // Advance to next phase
      const nextPi = (phaseIndexRef.current + 1) % config.sequence.length
      phaseIndexRef.current = nextPi
      const nextPhase = config.sequence[nextPi]
      setPhase(nextPhase)

      const isNewCycle = nextPi === 0
      if (isNewCycle) {
        setRoundsDone(r => {
          const newRounds = r + 1
          if (newRounds >= totalRounds) {
            setSessionDone(true)
          }
          return newRounds
        })
      }

      setCount(config.durations[nextPhase])
      return prev
    })
  }, [technique.id, config.sequence, config.durations, totalRounds])

  useEffect(() => {
    if (!running || sessionDone) {
      clearTimer()
      return
    }

    intervalRef.current = setInterval(tick, config.interval)
    return clearTimer
  }, [running, sessionDone, tick, config.interval, clearTimer])

  const handlePauseResume = () => setRunning(r => !r)

  const handleEnd = () => {
    clearTimer()
    onClose()
  }

  const currentPhaseLabel = PHASE_LABELS[phase]
  const currentPhaseColor = PHASE_COLORS[phase]
  const displayCount = isKapalbhati(technique.id) ? null : count
  const shouldShowCount = !isKapalbhati(technique.id) && technique.id !== 'ujjayi'

  if (sessionDone) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <CheckCircle size={64} style={{ color: '#d4d4d4' }} strokeWidth={1} />
        <div className="flex flex-col items-center gap-3">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: '#888888' }}
          >
            SESSION COMPLETE
          </p>
          <p
            className="text-4xl font-light tracking-widest uppercase"
            style={{ color: '#ffffff' }}
          >
            {technique.name}
          </p>
          <p
            className="text-sm tracking-widest uppercase"
            style={{ color: '#555555' }}
          >
            {totalRounds} ROUNDS COMPLETED
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-10 py-3 tracking-widest uppercase text-xs"
          style={{
            backgroundColor: '#181818',
            color: '#d4d4d4',
            border: '1px solid #2a2a2a',
          }}
        >
          CLOSE
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #2a2a2a' }}
      >
        <button
          onClick={handleEnd}
          aria-label="Close breathing session"
          style={{ color: '#555555' }}
          className="hover:opacity-70 transition-opacity"
        >
          <X size={20} />
        </button>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: '#888888' }}
        >
          {technique.name}
        </p>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: '#555555' }}
        >
          {isKapalbhati(technique.id)
            ? `ROUND ${Math.min(roundsDone + 1, totalRounds)}/${totalRounds}`
            : `ROUND ${Math.min(roundsDone + 1, totalRounds)}/${totalRounds}`}
        </p>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        {/* Animation */}
        <div style={{ width: 160, height: 160 }} className="flex items-center justify-center">
          <BreathingAnimation techniqueId={technique.id} />
        </div>

        {/* Phase label */}
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-3xl tracking-widest uppercase font-light"
            style={{ color: currentPhaseColor }}
          >
            {isKapalbhati(technique.id) ? 'PUMP' : currentPhaseLabel}
          </p>

          {/* Count or pump tally */}
          {isKapalbhati(technique.id) ? (
            <p
              className="text-lg tracking-widest uppercase"
              style={{ color: '#555555' }}
            >
              {pumpCount + 1}/{PUMPS_PER_ROUND}
            </p>
          ) : shouldShowCount && displayCount !== null ? (
            <p
              className="text-xl tracking-widest"
              style={{ color: '#555555' }}
            >
              {displayCount}
            </p>
          ) : null}
        </div>

        {/* Pitta note */}
        {technique.pittaNote && (
          <p
            className="text-xs tracking-widest uppercase text-center max-w-xs"
            style={{ color: '#555555' }}
          >
            {technique.pittaNote}
          </p>
        )}
      </main>

      {/* Footer */}
      <footer
        className="flex items-center justify-center gap-4 px-6 py-5"
        style={{ borderTop: '1px solid #2a2a2a' }}
      >
        <button
          onClick={handleEnd}
          className="px-6 py-2 text-xs tracking-widest uppercase"
          style={{
            backgroundColor: 'transparent',
            color: '#555555',
            border: '1px solid #2a2a2a',
          }}
        >
          END SESSION
        </button>
        <button
          onClick={handlePauseResume}
          className="px-6 py-2 text-xs tracking-widest uppercase"
          style={{
            backgroundColor: '#181818',
            color: '#d4d4d4',
            border: '1px solid #2a2a2a',
          }}
        >
          {running ? 'PAUSE' : 'RESUME'}
        </button>
      </footer>
    </div>
  )
}
