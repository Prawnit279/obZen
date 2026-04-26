import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExerciseSessionState, LoggedSet } from '@/db/dexie'
import type { ProgramExercise } from '@/data/obzen-program'
import { PULL_HEAVY_EXERCISES, FOREARM_LOAD_EXERCISES } from '@/data/obzen-program'
import { ExerciseHistory } from './ExerciseHistory'
import { SetLogger } from './SetLogger'

// ---------------------------------------------------------------------------
// Status-based style maps
// ---------------------------------------------------------------------------

const STATUS_CARD_STYLE: Record<ExerciseSessionState['status'], React.CSSProperties> = {
  pending: { borderColor: '#2a2a2a', background: '#111111' },
  complete: { borderColor: '#166534', background: 'rgba(22, 101, 52, 0.08)', borderLeftWidth: 2, borderLeftColor: '#166534' },
  skipped: { borderColor: '#7f1d1d', background: 'rgba(127, 29, 29, 0.06)', borderLeftWidth: 2, borderLeftColor: '#7f1d1d', opacity: 0.7 },
}

// ---------------------------------------------------------------------------

interface Props {
  exerciseState: ExerciseSessionState
  programExercise?: ProgramExercise
  forearmFatigue: boolean
  dayLabel: 'Day 1' | 'Day 2' | 'Day 3'
  onStatusChange: (status: ExerciseSessionState['status']) => void
  onAddSet: (set: LoggedSet) => void
  onUpdateSet: (index: number, set: LoggedSet) => void
  onRemoveSet: (index: number) => void
}

export function ExerciseCard({
  exerciseState,
  programExercise,
  forearmFatigue,
  dayLabel: _dayLabel,
  onStatusChange,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: Props) {
  const [showHistory, setShowHistory] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exerciseState.exerciseId,
  })

  const isPullHeavy = PULL_HEAVY_EXERCISES.includes(programExercise?.name ?? '')
  const isForearmLoad = FOREARM_LOAD_EXERCISES.includes(programExercise?.name ?? '')
  const hasWarning = forearmFatigue && (isPullHeavy || isForearmLoad)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { boxShadow: '0 4px 20px rgba(0,0,0,0.8)', scale: '1.02', zIndex: 50, position: 'relative' } : {}),
  }

  const displayName = programExercise?.name ?? exerciseState.exerciseId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const muscle = programExercise?.muscle ?? ''
  const working = programExercise?.working ?? ''
  const { status } = exerciseState

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...STATUS_CARD_STYLE[status] }}
      className="rounded-[2px] border overflow-hidden transition-colors"
    >
      {/* Card header */}
      <div className="flex items-stretch">
        {/* Drag handle — 6px left strip */}
        <div
          className="shrink-0 w-[6px] cursor-grab active:cursor-grabbing hover:opacity-60 transition-opacity"
          style={{ background: '#2a2a2a' }}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${displayName}`}
        />

        {/* Header content */}
        <div className="flex-1 min-w-0 px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Exercise name */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'text-[13px] leading-snug',
                    status === 'skipped' && 'opacity-50',
                    status === 'complete' && 'line-through opacity-60'
                  )}
                  style={{ color: status === 'skipped' ? '#444444' : '#d4d4d4' }}
                >
                  {displayName}
                </span>
                {exerciseState.addedFrom && (
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: '#555555' }}>
                    +{exerciseState.addedFrom}
                  </span>
                )}
                {hasWarning && (
                  <span
                    className="flex items-center gap-0.5 text-[9px] uppercase tracking-widest border rounded-[2px] px-1.5 py-0.5"
                    style={{ color: '#ca8a04', borderColor: 'rgba(161,98,7,0.5)' }}
                  >
                    <Zap size={9} />
                    Drummer
                  </span>
                )}
              </div>

              {/* Working sets label */}
              {working && (
                <div className="text-[10px] mt-0.5 uppercase tracking-widest" style={{ color: '#555555' }}>
                  {working}
                  {muscle && <span className="ml-2 normal-case capitalize">{muscle}</span>}
                </div>
              )}
            </div>

            {/* Right: chevron toggle */}
            <button
              onClick={() => setShowHistory(h => !h)}
              className="shrink-0 p-1 transition-opacity hover:opacity-70"
              style={{ color: '#555555' }}
              aria-label={showHistory ? 'Hide history' : 'Show history'}
            >
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Status action buttons */}
          <div className="flex gap-2 mt-2.5">
            {status === 'pending' && (
              <>
                <button
                  onClick={() => onStatusChange('complete')}
                  className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-[2px] transition-opacity hover:opacity-70"
                  style={{ border: '1px solid #166534', color: '#86efac' }}
                  aria-label={`Complete ${displayName}`}
                >
                  Complete
                </button>
                <button
                  onClick={() => onStatusChange('skipped')}
                  className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-[2px] transition-opacity hover:opacity-70"
                  style={{ border: '1px solid #7f1d1d', color: '#fca5a5' }}
                  aria-label={`Skip ${displayName}`}
                >
                  Skip
                </button>
              </>
            )}
            {(status === 'complete' || status === 'skipped') && (
              <button
                onClick={() => onStatusChange('pending')}
                className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-[2px] transition-opacity hover:opacity-70"
                style={{ border: '1px solid #3a3a3a', color: '#888888' }}
                aria-label={`Undo ${displayName}`}
              >
                Undo
              </button>
            )}
          </div>
        </div>

        {/* Drag handle icon on right for visual cue */}
        <div className="shrink-0 flex items-center pr-2" style={{ color: '#2a2a2a' }}>
          <GripVertical size={14} />
        </div>
      </div>

      {/* History drawer */}
      {showHistory && (
        <ExerciseHistory
          exerciseId={exerciseState.exerciseId}
          exerciseName={displayName}
        />
      )}

      {/* Set logger (hidden when skipped) */}
      {status !== 'skipped' && (
        <SetLogger
          exerciseId={exerciseState.exerciseId}
          sets={exerciseState.sets}
          onAddSet={onAddSet}
          onUpdateSet={onUpdateSet}
          onRemoveSet={onRemoveSet}
        />
      )}
    </div>
  )
}
