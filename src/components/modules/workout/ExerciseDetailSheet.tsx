import { X, Repeat } from 'lucide-react'
import { guideFor, MUSCLE_LABEL } from '@/data/exercise-guides'
import { MuscleFigure, MUSCLE_PRIMARY_COLOR, MUSCLE_SECONDARY_COLOR } from './MuscleFigure'
import { ExerciseAnimation } from './ExerciseAnimation'
import { motionFor } from '@/data/exercise-motions'
import { LIBRARY_BY_ID, toExerciseId } from '@/data/obzen-program'

interface Props {
  exerciseId: string
  name: string
  muscle?: string
  target?: string
  cue?: string
  /** Swap the exercise for one of its listed alternatives. */
  onSwap?: (toName: string) => void
  onClose: () => void
}

function Legend({ colour, label, muscles }: { colour: string; label: string; muscles: string[] }) {
  if (muscles.length === 0) return null
  return (
    <div className="flex items-start gap-2">
      <span className="w-3 h-3 rounded-[2px] mt-0.5 shrink-0" style={{ background: colour }} />
      <div>
        <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>{label}</div>
        <div className="text-[13px]" style={{ color: 'var(--accent)' }}>{muscles.join(' · ')}</div>
      </div>
    </div>
  )
}

/**
 * What an exercise works and how to do it — opened by tapping an exercise.
 * Swap options come from the movement's own plan entry, so alternatives are
 * the ones actually prescribed rather than a generic substitution list.
 */
export function ExerciseDetailSheet({ exerciseId, name, muscle, target, cue, onSwap, onClose }: Props) {
  const guide = guideFor(exerciseId, muscle)
  const swaps = LIBRARY_BY_ID[exerciseId]?.swaps ?? []
  const motion = motionFor(exerciseId)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-t-[4px] flex flex-col max-h-[88vh]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <header
          className="flex items-start justify-between gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="min-w-0">
            <h2 className="text-[16px]" style={{ color: 'var(--accent)' }}>{name}</h2>
            {target && (
              <p className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--muted)' }}>
                {target}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={18} style={{ color: 'var(--dim)' }} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* The movement itself */}
          {motion && <ExerciseAnimation motion={motion} label={name} />}

          {/* What it works */}
          {guide && (
            <section>
              <MuscleFigure primary={guide.primary} secondary={guide.secondary} />
              <div className="space-y-2 mt-3">
                <Legend
                  colour={MUSCLE_PRIMARY_COLOR} label="Primary"
                  muscles={guide.primary.map(m => MUSCLE_LABEL[m])}
                />
                <Legend
                  colour={MUSCLE_SECONDARY_COLOR} label="Also works"
                  muscles={(guide.secondary ?? []).map(m => MUSCLE_LABEL[m])}
                />
              </div>
            </section>
          )}

          {/* How to do it */}
          {guide && guide.steps.length > 0 && (
            <section>
              <h3 className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                How to perform it
              </h3>
              <ol className="space-y-2">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[14px] leading-snug" style={{ color: 'var(--accent)' }}>
                    <span className="tabular-nums shrink-0" style={{ color: 'var(--dim)' }}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {cue && (
            <p
              className="text-[13px] leading-snug pl-3"
              style={{ color: 'var(--muted)', borderLeft: '2px solid var(--border-strong)' }}
            >
              {cue}
            </p>
          )}

          {/* Swap options straight from the plan */}
          {swaps.length > 0 && (
            <section>
              <h3 className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                Swap for
              </h3>
              <div className="space-y-1.5">
                {swaps.map(swapName => (
                  <button
                    key={swapName}
                    onClick={() => onSwap?.(swapName)}
                    disabled={!onSwap}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-[2px] text-left transition-opacity hover:opacity-75 disabled:opacity-60"
                    style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-[14px]" style={{ color: 'var(--accent)' }}>{swapName}</span>
                    {onSwap && <Repeat size={14} style={{ color: 'var(--dim)' }} />}
                  </button>
                ))}
              </div>
              <p className="text-[11px] mt-2" style={{ color: 'var(--dim)' }}>
                Cap it at two swaps per session, so there is still enough repetition to track progress.
              </p>
            </section>
          )}

          {!guide && swaps.length === 0 && (
            <p className="text-[13px]" style={{ color: 'var(--dim)' }}>
              No guide for this movement yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export { toExerciseId }
