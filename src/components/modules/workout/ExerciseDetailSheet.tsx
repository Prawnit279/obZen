import { useState } from 'react'
import { X, Repeat } from 'lucide-react'
import { guideFor, coreDetailFor, MUSCLE_LABEL } from '@/data/exercise-guides'
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
  /** Sets already logged against this exercise — swapping would discard them. */
  loggedSetCount?: number
  /** Exercise ids already on this day; swapping to one of these would be a no-op. */
  presentExerciseIds?: string[]
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
export function ExerciseDetailSheet({
  exerciseId, name, muscle, target, cue,
  loggedSetCount = 0, presentExerciseIds = [], onSwap, onClose,
}: Props) {
  const guide = guideFor(exerciseId, muscle)
  const swaps = LIBRARY_BY_ID[exerciseId]?.swaps ?? []
  const motion = motionFor(exerciseId)
  const detail = coreDetailFor(exerciseId)

  // Swapping replaces the slot outright, so anything already logged is lost.
  // Mirrors the confirm the remove button has used all along.
  const [pendingSwap, setPendingSwap] = useState<string | null>(null)

  const requestSwap = (swapName: string) => {
    if (loggedSetCount > 0) {
      setPendingSwap(swapName)
      return
    }
    onSwap?.(swapName)
  }

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

          {/* Setting up, before the first rep */}
          {detail?.setup && (
            <section>
              <h3 className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                Setting up
              </h3>
              <ul className="space-y-1.5">
                {detail.setup.map((line, i) => (
                  <li key={i} className="text-[14px] leading-snug pl-3" style={{ color: 'var(--accent)', borderLeft: '2px solid var(--border)' }}>
                    {line}
                  </li>
                ))}
              </ul>
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

          {/* Common faults and their fixes */}
          {detail?.mistakes && (
            <section>
              <h3 className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                Common mistakes
              </h3>
              <div className="space-y-2.5">
                {detail.mistakes.map((m, i) => (
                  <div key={i} className="rounded-[2px] p-3" style={{ background: 'var(--elevated)' }}>
                    <div className="flex gap-2 text-[13px] leading-snug">
                      <span className="shrink-0" style={{ color: 'var(--skip-text)' }}>✕</span>
                      <span style={{ color: 'var(--muted)' }}>{m.wrong}</span>
                    </div>
                    <div className="flex gap-2 text-[13px] leading-snug mt-1">
                      <span className="shrink-0" style={{ color: 'var(--complete-text)' }}>✓</span>
                      <span style={{ color: 'var(--accent)' }}>{m.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* What a good set looks like */}
          {detail?.cues && (
            <section>
              <h3 className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                You did it right if
              </h3>
              <ul className="space-y-1">
                {detail.cues.map((c, i) => (
                  <li key={i} className="flex gap-2 text-[14px] leading-snug" style={{ color: 'var(--accent)' }}>
                    <span className="shrink-0" style={{ color: 'var(--complete-text)' }}>·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Swap options straight from the plan */}
          {swaps.length > 0 && (
            <section>
              <h3 className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                Swap for
              </h3>
              <div className="space-y-1.5">
                {swaps.map(swapName => {
                  const alreadyOnDay = presentExerciseIds.includes(toExerciseId(swapName))
                  const confirming = pendingSwap === swapName

                  if (confirming) {
                    return (
                      <div
                        key={swapName}
                        className="rounded-[2px] p-3 space-y-2"
                        style={{ border: '1px solid var(--skip-border)', background: 'rgba(127,29,29,0.08)' }}
                      >
                        <p className="text-[13px]" style={{ color: 'var(--accent)' }}>
                          Swap to {swapName}?
                          <span style={{ color: 'var(--skip-text)' }}>
                            {' '}Your {loggedSetCount} logged{' '}
                            {loggedSetCount === 1 ? 'set' : 'sets'} will be lost.
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPendingSwap(null)}
                            className="flex-1 py-2 rounded-[2px] text-[12px] uppercase tracking-widest"
                            style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => { setPendingSwap(null); onSwap?.(swapName) }}
                            className="flex-1 py-2 rounded-[2px] text-[12px] uppercase tracking-widest"
                            style={{ border: '1px solid var(--skip-border)', color: 'var(--skip-text)' }}
                          >
                            Swap
                          </button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={swapName}
                      onClick={() => requestSwap(swapName)}
                      disabled={!onSwap || alreadyOnDay}
                      title={alreadyOnDay ? `${swapName} is already on this day` : undefined}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-[2px] text-left transition-opacity hover:opacity-75 disabled:opacity-60"
                      style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
                    >
                      <span className="text-[14px]" style={{ color: 'var(--accent)' }}>{swapName}</span>
                      {alreadyOnDay ? (
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>
                          already added
                        </span>
                      ) : onSwap ? (
                        <Repeat size={14} style={{ color: 'var(--dim)' }} />
                      ) : null}
                    </button>
                  )
                })}
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
