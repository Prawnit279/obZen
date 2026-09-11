import { useState } from 'react'
import { kgToLb } from '@/lib/progress'
import { PACE_BANDS } from '@/lib/bodyweight'
import type { WeightGoal, WeightPace } from '@/lib/bodyweight'

type Direction = WeightGoal['direction']

interface Props {
  /** The goal already set, when this is an edit rather than a first answer. */
  current: WeightGoal | null
  /** Used to turn the percentage ranges into pounds a week. */
  bodyweightKg: number | undefined
  onChoose: (goal: WeightGoal) => void
  /** Offered only when changing an existing goal. */
  onCancel?: () => void
}

const INTENTIONS: { value: Direction; title: string; detail: string }[] = [
  { value: 'gain', title: 'Build', detail: 'Gain weight to get stronger' },
  { value: 'lose', title: 'Cut', detail: 'Lose fat, keep your strength' },
  { value: 'maintain', title: 'Maintain', detail: 'Hold steady while you train' },
]

const PACE_NAMES: Record<'gain' | 'lose', Record<WeightPace, string>> = {
  gain: { gentle: 'Lean', steady: 'Steady' },
  lose: { gentle: 'Gentle', steady: 'Steady' },
}

const PACE_DETAIL: Record<'gain' | 'lose', Record<WeightPace, string>> = {
  gain: {
    gentle: 'Slower, with the least fat along the way',
    steady: 'Faster, accepting some fat for quicker strength',
  },
  lose: {
    gentle: 'Easier to hold and kindest to your lifts',
    steady: 'Quicker, but strength can dip',
  },
}

/** A pace range in the unit the person thinks in. */
function rangeText(direction: 'gain' | 'lose', pace: WeightPace, bodyweightKg: number | undefined): string {
  const [lo, hi] = PACE_BANDS[direction][pace]
  if (!bodyweightKg) return `${lo}–${hi}% of bodyweight a week`
  const lb = (pct: number) => Math.round(kgToLb((bodyweightKg * pct) / 100) * 10) / 10
  return `${lb(lo)}–${lb(hi)} lb a week`
}

/**
 * Asks what the person is aiming for before the weight trend is judged.
 *
 * Intention first, then — for building or cutting — how hard. The ranges are
 * given in pounds a week at the person's own weight, since "0.25 % of
 * bodyweight" is accurate but means nothing standing on a scale.
 */
export function WeightGoalPicker({ current, bodyweightKg, onChoose, onCancel }: Props) {
  const [direction, setDirection] = useState<Direction | null>(current?.direction ?? null)
  const [pace, setPace] = useState<WeightPace | null>(
    current && current.direction !== 'maintain' ? current.pace : null
  )

  const ready = direction === 'maintain' || (direction !== null && pace !== null)

  const choose = () => {
    if (direction === 'maintain') onChoose({ direction: 'maintain' })
    else if (direction && pace) onChoose({ direction, pace })
  }

  return (
    <div
      className="flex flex-col"
      style={{
        gap: 12, padding: 14, borderRadius: 'var(--r-inset)',
        background: 'var(--card-accent)', border: '1px solid var(--hairline)',
      }}
    >
      <div className="flex flex-col" style={{ gap: 3 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>What are you aiming for?</p>
        <p style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
          This decides how your trend is read. Until you choose, it is shown without a verdict.
        </p>
      </div>

      <div role="radiogroup" aria-label="Weight goal" className="flex flex-col" style={{ gap: 6 }}>
        {INTENTIONS.map(opt => (
          <Choice
            key={opt.value}
            checked={direction === opt.value}
            title={opt.title}
            detail={opt.detail}
            onSelect={() => {
              setDirection(opt.value)
              if (opt.value === 'maintain') setPace(null)
            }}
          />
        ))}
      </div>

      {(direction === 'gain' || direction === 'lose') && (
        <div role="radiogroup" aria-label="Pace" className="flex flex-col" style={{ gap: 6 }}>
          <p className="uppercase" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
            How fast
          </p>
          {(['gentle', 'steady'] as const).map(p => (
            <Choice
              key={p}
              checked={pace === p}
              title={`${PACE_NAMES[direction][p]} · ${rangeText(direction, p, bodyweightKg)}`}
              detail={PACE_DETAIL[direction][p]}
              onSelect={() => setPace(p)}
            />
          ))}
        </div>
      )}

      <div className="flex" style={{ gap: 8 }}>
        <button
          onClick={choose}
          disabled={!ready}
          className="flex-1 transition-opacity disabled:opacity-35"
          style={{
            padding: '10px 14px', borderRadius: 'var(--r-control)', border: 'none',
            fontSize: 13, fontWeight: 600, color: 'var(--on-accent)',
            background: 'linear-gradient(140deg, var(--violet-400), var(--violet-900))',
          }}
        >
          {current ? 'Update goal' : 'Set goal'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: '10px 14px', borderRadius: 'var(--r-control)',
              border: '1px solid var(--hairline)', background: 'transparent',
              fontSize: 13, color: 'var(--ink-dim)',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

function Choice({ checked, title, detail, onSelect }: {
  checked: boolean; title: string; detail: string; onSelect: () => void
}) {
  return (
    <button
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex flex-col text-left transition-colors"
      style={{
        gap: 2, padding: '9px 12px', borderRadius: 'var(--r-control)',
        border: `1px solid ${checked ? 'var(--violet-200)' : 'var(--hairline)'}`,
        // Mixed from the theme's own accent, so Steel reads blue and Ember orange.
        background: checked ? 'color-mix(in srgb, var(--violet-400) 14%, transparent)' : 'transparent',
      }}
    >
      <span style={{ fontSize: 13.5, fontWeight: 600, color: checked ? 'var(--ink)' : 'var(--ink-2)' }}>
        {title}
      </span>
      <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{detail}</span>
    </button>
  )
}
