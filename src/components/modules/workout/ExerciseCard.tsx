import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, Zap, Trash2 } from 'lucide-react'
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
  pending: { borderColor: 'var(--border)', background: 'var(--surface)' },
  complete: { borderColor: 'var(--complete-border)', background: 'rgba(22, 101, 52, 0.08)', borderLeftWidth: 2, borderLeftColor: 'var(--complete-border)' },
  skipped: { borderColor: 'var(--skip-border)', background: 'rgba(127, 29, 29, 0.06)', borderLeftWidth: 2, borderLeftColor: 'var(--skip-border)', opacity: 0.7 },
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
  /** Drop this exercise from the day entirely. */
  onRemoveExercise: () => void
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
  onRemoveExercise,
}: Props) {
  const [showHistory, setShowHistory] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exerciseState.exerciseId,
  })

  const displayName = exerciseState.name
    ?? programExercise?.name
    ?? exerciseState.exerciseId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const muscle = exerciseState.muscle ?? programExercise?.muscle ?? ''
  const target = exerciseState.target ?? ''
  const cue = exerciseState.cue ?? programExercise?.cue
  const coached = exerciseState.coached ?? programExercise?.coached

  const isPullHeavy = PULL_HEAVY_EXERCISES.includes(displayName)
  const isForearmLoad = FOREARM_LOAD_EXERCISES.includes(displayName)
  const hasWarning = forearmFatigue && (isPullHeavy || isForearmLoad)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { boxShadow: '0 4px 20px rgba(0,0,0,0.8)', scale: '1.02', zIndex: 50, position: 'relative' } : {}),
  }

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
          style={{ background: 'var(--border)' }}
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
                    'text-[15px] leading-snug',
                    status === 'skipped' && 'opacity-50',
                    status === 'complete' && 'line-through opacity-60'
                  )}
                  style={{ color: status === 'skipped' ? 'var(--dim)' : 'var(--accent)' }}
                >
                  {displayName}
                </span>
                {exerciseState.addedFrom && (
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>
                    +{exerciseState.addedFrom}
                  </span>
                )}
                {coached && (
                  <span
                    className="text-[9px] uppercase tracking-widest border rounded-[2px] px-1.5 py-0.5"
                    style={{ color: 'var(--muted)', borderColor: 'var(--border-strong)' }}
                  >
                    Pronit coaches
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

              {/* Prescription / muscle label */}
              {(target || muscle) && (
                <div className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  {target}
                  {muscle && <span className="ml-2 normal-case capitalize">{muscle}</span>}
                </div>
              )}

              {/* Coaching cue from the plan */}
              {cue && status !== 'skipped' && (
                <p
                  className="text-[13px] leading-snug mt-1.5 pl-2.5"
                  style={{ color: 'var(--muted)', borderLeft: '1px solid var(--border-strong)' }}
                >
                  {cue}
                </p>
              )}
            </div>

            {/* Right: history toggle + remove */}
            <div className="shrink-0 flex items-center gap-1">
              <button
                onClick={() => setShowHistory(h => !h)}
                className="p-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)' }}
                aria-label={showHistory ? 'Hide history' : 'Show history'}
              >
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setConfirmRemove(true)}
                className="p-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)' }}
                aria-label={`Remove ${displayName} from this day`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Remove confirmation */}
          {confirmRemove && (
            <div
              className="mt-2.5 p-2.5 rounded-[2px] space-y-2"
              style={{ border: '1px solid var(--skip-border)', background: 'rgba(127,29,29,0.08)' }}
            >
              <p className="text-[13px]" style={{ color: 'var(--accent)' }}>
                Remove {displayName} from this day?
                {exerciseState.sets.length > 0 && (
                  <span style={{ color: 'var(--skip-text)' }}>
                    {' '}{exerciseState.sets.length} logged{' '}
                    {exerciseState.sets.length === 1 ? 'set' : 'sets'} will be lost.
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmRemove(false)}
                  className="px-3 py-1.5 text-[12px] uppercase tracking-widest rounded-[2px] transition-opacity hover:opacity-70"
                  style={{ border: '1px solid var(--border-strong)', color: 'var(--muted)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={onRemoveExercise}
                  className="px-3 py-1.5 text-[12px] uppercase tracking-widest rounded-[2px] transition-opacity hover:opacity-70"
                  style={{ border: '1px solid var(--skip-border)', color: 'var(--skip-text)' }}
                  aria-label={`Confirm remove ${displayName}`}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Status action buttons */}
          <div className="flex gap-2 mt-2.5">
            {status === 'pending' && (
              <>
                <button
                  onClick={() => onStatusChange('complete')}
                  className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-[2px] transition-opacity hover:opacity-70"
                  style={{ border: '1px solid var(--complete-border)', color: 'var(--complete-text)' }}
                  aria-label={`Complete ${displayName}`}
                >
                  Complete
                </button>
                <button
                  onClick={() => onStatusChange('skipped')}
                  className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-[2px] transition-opacity hover:opacity-70"
                  style={{ border: '1px solid var(--skip-border)', color: 'var(--skip-text)' }}
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
                style={{ border: '1px solid var(--border-strong)', color: 'var(--muted)' }}
                aria-label={`Undo ${displayName}`}
              >
                Undo
              </button>
            )}
          </div>
        </div>

        {/* Drag handle icon on right for visual cue */}
        <div className="shrink-0 flex items-center pr-2" style={{ color: 'var(--dim)' }}>
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
