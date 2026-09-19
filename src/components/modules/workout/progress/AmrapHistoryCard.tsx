import { Target } from 'lucide-react'
import { amrapHistory } from '@/lib/block'
import type { AmrapAttempt } from '@/lib/block'
import type { ActiveBlock } from '@/store/useBlockStore'
import type { WorkoutDaySession } from '@/db/dexie'
import { Card } from '@/components/ui/Card'

interface Props {
  block: ActiveBlock
  sessions: WorkoutDaySession[]
}

/** How many attempts to show per lift. Older ones are summarised, not dropped. */
const SHOWN = 6

/**
 * Top sets against what the week asked for.
 *
 * The one number in 5/3/1 that is not decided in advance: the last set says
 * "and as many as you can", so the reps are the result rather than the
 * prescription. Read in order they are the clearest evidence a block is working
 * — the same percentage of the same training max going up in reps week on week
 * is progress that the weight on the bar does not show.
 *
 * Weights are printed beside the reps rather than left to the chart, because a
 * rep count means nothing without knowing what it was done with.
 */
export function AmrapHistoryCard({ block, sessions }: Props) {
  const byLift = Object.keys(block.trainingMaxLb)
    .map(id => ({ id, attempts: amrapHistory(block, sessions, id) }))
    .filter(l => l.attempts.length > 0)
    .sort((a, b) => a.attempts[0].name.localeCompare(b.attempts[0].name))

  // Nothing logged under this block yet. A card saying so would be a card
  // saying nothing, so it stays away until there is a set to show.
  if (byLift.length === 0) return null

  return (
    <Card label="Top sets">
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: -4 }}>
        Each marked top set, against the reps the week called for.
      </p>

      {byLift.map(({ id, attempts }) => (
        <LiftHistory key={id} attempts={attempts} />
      ))}
    </Card>
  )
}

function LiftHistory({ attempts }: { attempts: AmrapAttempt[] }) {
  const shown = attempts.slice(-SHOWN)
  const hit = attempts.filter(a => a.repsVsTarget >= 0).length

  return (
    <div style={{ marginTop: 6 }}>
      <div
        className="flex items-baseline justify-between"
        style={{ gap: 10, paddingBottom: 6, borderBottom: '1px solid var(--hairline-soft)' }}
      >
        <span style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-2)' }}>{attempts[0].name}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
          {hit} of {attempts.length} on target
        </span>
      </div>

      {/* Keyed with the index because two sessions can share a date — the same
          lift trained twice in a day is unusual but not impossible. */}
      {shown.map((a, i) => (
        <div
          key={`${a.date}-${i}`}
          className="flex items-baseline"
          style={{ gap: 10, marginTop: 7, fontVariantNumeric: 'tabular-nums' }}
        >
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', width: '3.6em', flexShrink: 0 }}>
            {a.date.slice(5)}
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', width: '3.4em', flexShrink: 0 }}>
            W{a.week}·c{a.cycle}
          </span>
          <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-2)', flex: 1 }}>
            {Math.round(a.weightLb)} lb × {a.reps}
            <span style={{ color: 'var(--ink-faint)' }}> / {a.targetReps}+</span>
          </span>
          <Delta value={a.repsVsTarget} />
        </div>
      ))}

      {attempts.length > shown.length && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: 6 }}>
          {attempts.length - shown.length} earlier{' '}
          {attempts.length - shown.length === 1 ? 'set' : 'sets'} counted in the tally above.
        </p>
      )}
    </div>
  )
}

/**
 * Reps over or under the target. Zero reads as "met" rather than as a nought,
 * because hitting the prescription exactly is a pass and a bare 0 looks like a
 * failure.
 */
function Delta({ value }: { value: number }) {
  const met = value >= 0
  return (
    <span
      className="flex items-center"
      style={{
        gap: 4, flexShrink: 0,
        fontSize: 'var(--text-md)', fontVariantNumeric: 'tabular-nums',
        color: met ? 'var(--ok)' : 'var(--ink-dim)',
      }}
    >
      {value > 0 && <Target size={11} />}
      {value === 0 ? 'met' : value > 0 ? `+${value}` : value}
    </span>
  )
}
