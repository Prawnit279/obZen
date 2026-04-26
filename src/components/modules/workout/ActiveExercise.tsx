import { useState } from 'react'
import type { ExerciseLog, SetLog } from '@/db/dexie'
import { SWAP_OPTIONS, PULL_HEAVY_EXERCISES, FOREARM_LOAD_EXERCISES } from '@/data/obzen-program'
import type { MuscleGroup } from '@/data/obzen-program'
import { SetRow } from './SetRow'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { RefreshCw, SkipForward, AlertTriangle, Flag, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  log: ExerciseLog
  forearmFatigue: boolean
  onChange: (updated: ExerciseLog) => void
  onSkip: () => void
  isActive: boolean
  onActivate: () => void
}

export function ActiveExercise({ log, forearmFatigue, onChange, onSkip, isActive, onActivate }: Props) {
  const [showSwap, setShowSwap] = useState(false)

  const isPullHeavy = PULL_HEAVY_EXERCISES.includes(log.exerciseName)
  const isForearmLoad = FOREARM_LOAD_EXERCISES.includes(log.exerciseName)
  const hasWarning = forearmFatigue && (isPullHeavy || isForearmLoad)

  const completedSets = log.sets.filter(s => !s.isWarmup && s.completed).length
  const totalWorkingSets = log.sets.filter(s => !s.isWarmup).length
  const allDone = totalWorkingSets > 0 && completedSets === totalWorkingSets

  const updateSet = (index: number, updated: SetLog) => {
    const newSets = log.sets.map((s, i) => i === index ? updated : s)
    onChange({ ...log, sets: newSets })
  }

  const swapOptions = SWAP_OPTIONS[log.exerciseName.toLowerCase() as MuscleGroup]
    ?? SWAP_OPTIONS['legs']

  const doSwap = (name: string) => {
    onChange({ ...log, exerciseName: name })
    setShowSwap(false)
  }

  const flagInjury = () => {
    onChange({ ...log, injuryFlag: !log.injuryFlag })
  }

  return (
    <div
      className={cn(
        'border rounded-[2px] transition-colors',
        log.skipped && 'opacity-40',
        log.injuryFlag && 'border-noir-red/60',
        hasWarning && !log.injuryFlag && 'border-yellow-700/50',
        allDone && !log.skipped && !log.injuryFlag && 'border-noir-accent/40',
        !hasWarning && !log.injuryFlag && !allDone && 'border-noir-border',
        isActive ? 'bg-noir-elevated' : 'bg-noir-surface'
      )}
    >
      {/* Header */}
      <button
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-2"
        onClick={onActivate}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[13px]', allDone ? 'text-noir-muted line-through' : 'text-noir-accent')}>
              {log.exerciseName}
            </span>
            {log.skipped && <Badge variant="dim">Skipped</Badge>}
            {log.injuryFlag && <Badge variant="red">Injury Flag</Badge>}
            {hasWarning && !log.injuryFlag && (
              <span className="text-[9px] uppercase tracking-widest text-yellow-600 border border-yellow-700/60 rounded-[2px] px-1.5 py-0.5">
                Drummer Flag
              </span>
            )}
          </div>
          {totalWorkingSets > 0 && (
            <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-0.5">
              {completedSets}/{totalWorkingSets} working sets
            </div>
          )}
        </div>
        {isActive ? <ChevronUp size={14} className="text-noir-dim shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-noir-dim shrink-0 mt-0.5" />}
      </button>

      {/* Expanded */}
      {isActive && !log.skipped && (
        <div className="border-t border-noir-border px-4 pb-4">
          {hasWarning && (
            <div className="flex items-center gap-2 py-2.5 border-b border-noir-border mb-2">
              <AlertTriangle size={12} className="text-yellow-600 shrink-0" />
              <span className="text-[11px] text-yellow-600">
                {isPullHeavy ? 'Reduce pull volume — forearm fatigue active' : 'High forearm load — consider swapping'}
              </span>
            </div>
          )}

          {/* Sets */}
          <div className="py-1">
            {log.sets.map((set, i) => (
              <SetRow key={i} set={set} onChange={updated => updateSet(i, updated)} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowSwap(s => !s)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-dim hover:border-noir-strong hover:text-noir-muted transition-colors"
            >
              <RefreshCw size={11} />
              Swap
            </button>
            <button
              onClick={onSkip}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-dim hover:border-noir-strong hover:text-noir-muted transition-colors"
            >
              <SkipForward size={11} />
              Skip
            </button>
            <button
              onClick={flagInjury}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors ml-auto',
                log.injuryFlag
                  ? 'border-noir-red text-noir-red'
                  : 'border-noir-border text-noir-dim hover:border-noir-red hover:text-noir-red'
              )}
            >
              <Flag size={11} />
              Injury
            </button>
          </div>

          {/* Swap panel */}
          {showSwap && (
            <div className="mt-3 pt-3 border-t border-noir-border">
              <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-2">Same muscle group</div>
              <div className="flex flex-wrap gap-1.5">
                {swapOptions.filter(s => s !== log.exerciseName).slice(0, 8).map(name => (
                  <button
                    key={name}
                    onClick={() => doSwap(name)}
                    className="text-[11px] border border-noir-border rounded-[2px] px-2 py-0.5 text-noir-muted hover:border-noir-strong hover:text-noir-accent transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
