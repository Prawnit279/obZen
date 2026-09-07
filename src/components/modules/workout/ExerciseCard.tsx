import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical, Zap, Trash2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExerciseSessionState, LoggedSet } from '@/db/dexie'
import type { ProgramExercise } from '@/data/obzen-program'
import { PULL_HEAVY_EXERCISES, FOREARM_LOAD_EXERCISES } from '@/data/obzen-program'
import { ExerciseHistory } from './ExerciseHistory'
import { SetLogger } from './SetLogger'
import { ExerciseDetailSheet } from './ExerciseDetailSheet'
import { displayLb } from '@/lib/progress'
import type { ProgressionSuggestion } from '@/lib/progress'

// ---------------------------------------------------------------------------
// Status-based style maps
// ---------------------------------------------------------------------------

const STATUS_CARD_STYLE: Record<ExerciseSessionState['status'], React.CSSProperties> = {
  pending: { borderColor: 'var(--hairline)', background: 'var(--card)' },
  complete: { borderColor: 'var(--complete-border)', background: 'var(--complete-bg)', borderLeftWidth: 2, borderLeftColor: 'var(--complete-border)' },
  skipped: { borderColor: 'var(--skip-border)', background: 'var(--skip-bg)', borderLeftWidth: 2, borderLeftColor: 'var(--skip-border)', opacity: 0.7 },
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
  /** Replace this exercise with one of its listed alternatives. */
  onSwapExercise?: (toName: string) => void
  /** Exercise ids already on this day, so the sheet can rule out no-op swaps. */
  presentExerciseIds?: string[]
  /** Add-load suggestion when the plan's progression rule is met. */
  progression?: ProgressionSuggestion
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
  onSwapExercise,
  presentExerciseIds,
  progression,
}: Props) {
  const [showHistory, setShowHistory] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
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
      style={{ borderRadius: 'var(--r-card)', ...style, ...STATUS_CARD_STYLE[status] }}
      className="border overflow-hidden transition-colors"
    >
      {/* Card header */}
      <div className="flex items-stretch">
        {/* Drag handle — 6px left strip */}
        <div
          className="shrink-0 w-[6px] cursor-grab active:cursor-grabbing hover:opacity-60 transition-opacity"
          style={{ background: 'rgba(255,255,255,0.07)' }}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${displayName}`}
        />

        {/* Header content */}
        <div className="flex-1 min-w-0 px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Exercise name — tap for form, muscles worked and swaps */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowDetail(true)}
                  className={cn(
                    'text-left underline decoration-dashed underline-offset-4',
                    status === 'skipped' && 'opacity-50',
                    status === 'complete' && 'line-through opacity-60'
                  )}
                  style={{
                    fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25,
                    color: status === 'skipped' ? 'var(--ink-faint)' : 'var(--ink)',
                    // Visible enough to read as tappable on both themes.
                    textDecorationColor: 'var(--ink-off)',
                  }}
                  aria-label={`How to perform ${displayName}`}
                >
                  {displayName}
                </button>
                {exerciseState.addedFrom && (
                  <span className="uppercase" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-faint)' }}>
                    +{exerciseState.addedFrom}
                  </span>
                )}
                {coached && (
                  <span
                    className="uppercase"
                    style={{
                      fontSize: 11, letterSpacing: '0.08em', padding: '2px 8px',
                      borderRadius: 'var(--r-pill)', border: '1px solid var(--hairline)',
                      color: 'var(--ink-dim)',
                    }}
                  >
                    Pronit coaches
                  </span>
                )}
                {hasWarning && (
                  <span
                    className="flex items-center gap-1 uppercase"
                    style={{
                      fontSize: 11, letterSpacing: '0.08em', padding: '2px 8px',
                      borderRadius: 'var(--r-pill)',
                      color: 'var(--violet-100)', border: '1px solid rgba(167,139,250,0.35)',
                    }}
                  >
                    <Zap size={10} />
                    Drummer
                  </span>
                )}
              </div>

              {/* Prescription / muscle label */}
              {(target || muscle) && (
                <div className="uppercase" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-dim)', marginTop: 4 }}>
                  {target}
                  {muscle && <span className="ml-2 normal-case capitalize">{muscle}</span>}
                </div>
              )}

              {/* Add-load suggestion, once the plan's rule is met */}
              {progression && status !== 'skipped' && (
                <div
                  className="inline-block"
                  style={{
                    marginTop: 8, padding: '3px 10px', borderRadius: 'var(--r-pill)',
                    fontSize: 11, color: 'var(--complete-text)',
                    border: '1px solid var(--complete-border)',
                  }}
                >
                  Try {displayLb(progression.nextKg)} lb today — you hit the top of the range twice at{' '}
                  {displayLb(progression.currentKg)} lb
                </div>
              )}

              {/* Coaching cue from the plan */}
              {cue && status !== 'skipped' && (
                <p
                  style={{
                    fontSize: 13, lineHeight: 1.5, marginTop: 8, paddingLeft: 10,
                    color: 'var(--ink-dim)', borderLeft: '2px solid rgba(167,139,250,0.35)',
                  }}
                >
                  {cue}
                </p>
              )}
            </div>

            {/* Right: guide, history toggle, remove */}
            <div className="shrink-0 flex items-center gap-1">
              <button
                onClick={() => setShowDetail(true)}
                className="p-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted)' }}
                aria-label={`How to perform ${displayName}`}
                title="How to perform it · muscles worked · swaps"
              >
                <BookOpen size={16} />
              </button>
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
              className="space-y-2"
              style={{
                marginTop: 10, padding: 12, borderRadius: 'var(--r-inset)',
                border: '1px solid var(--skip-border)', background: 'var(--skip-bg)',
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
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
                  className="uppercase transition-opacity hover:opacity-70"
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--r-control)',
                    fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                    border: '1px solid var(--hairline)', color: 'var(--ink-dim)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={onRemoveExercise}
                  className="uppercase transition-opacity hover:opacity-70"
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--r-control)',
                    fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                    border: '1px solid var(--skip-border)', color: 'var(--skip-text)',
                  }}
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
                  className="uppercase transition-opacity hover:opacity-70"
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--r-control)',
                    fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                    border: '1px solid var(--complete-border)', color: 'var(--complete-text)',
                  }}
                  aria-label={`Complete ${displayName}`}
                >
                  Complete
                </button>
                <button
                  onClick={() => onStatusChange('skipped')}
                  className="uppercase transition-opacity hover:opacity-70"
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--r-control)',
                    fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                    border: '1px solid var(--skip-border)', color: 'var(--skip-text)',
                  }}
                  aria-label={`Skip ${displayName}`}
                >
                  Skip
                </button>
              </>
            )}
            {(status === 'complete' || status === 'skipped') && (
              <button
                onClick={() => onStatusChange('pending')}
                className="uppercase transition-opacity hover:opacity-70"
                style={{
                  padding: '6px 12px', borderRadius: 'var(--r-control)',
                  fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                  border: '1px solid var(--hairline)', color: 'var(--ink-dim)',
                }}
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

      {/* Form, muscles worked and swap options */}
      {showDetail && (
        <ExerciseDetailSheet
          exerciseId={exerciseState.exerciseId}
          name={displayName}
          muscle={muscle}
          target={target}
          cue={cue}
          loggedSetCount={exerciseState.sets.length}
          presentExerciseIds={presentExerciseIds}
          onSwap={onSwapExercise && (toName => {
            onSwapExercise(toName)
            setShowDetail(false)
          })}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  )
}
