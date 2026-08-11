import { useState, useMemo } from 'react'
import { estimate1RM, percentageTable, roundTo5 } from '@/lib/strengthTools'
import { ToolCard, NumberField } from './ToolCard'

/**
 * Covers both the 1RM calculator and the AMRAP estimator — they take the same
 * weight+reps input and the same Epley/Brzycki math; "AMRAP" adds an optional
 * expected-reps comparison on top, so one card serves both.
 */
export function OneRmCard() {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [expectedReps, setExpectedReps] = useState('')

  const w = Number(weight)
  const r = Number(reps)
  const valid = w > 0 && r > 0

  const est = useMemo(() => (valid ? estimate1RM(w, r) : null), [valid, w, r])
  const table = useMemo(() => (est ? percentageTable(roundTo5(est.epley)) : []), [est])

  const target = Number(expectedReps)
  const hasTarget = valid && target > 0
  const repsDelta = hasTarget ? r - target : null

  return (
    <ToolCard label="1-Rep Max & AMRAP" sub="From a single set or a top/AMRAP set — Epley and Brzycki side by side.">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <NumberField label="Weight" value={weight} onChange={setWeight} placeholder="225" suffix="lb" />
        <NumberField label="Reps" value={reps} onChange={setReps} placeholder="5" />
      </div>
      <NumberField
        label="Expected reps (optional, for an AMRAP set)"
        value={expectedReps}
        onChange={setExpectedReps}
        placeholder="e.g. 5"
      />

      {est && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-4">
            <div>
              <div className="text-[22px] tabular-nums" style={{ color: '#e2e2e2' }}>{Math.round(est.epley)}</div>
              <div className="text-[11px] uppercase tracking-widest" style={{ color: '#8a8a8a' }}>Epley e1RM</div>
            </div>
            <div>
              <div className="text-[22px] tabular-nums" style={{ color: '#e2e2e2' }}>
                {est.brzycki > 0 ? Math.round(est.brzycki) : '—'}
              </div>
              <div className="text-[11px] uppercase tracking-widest" style={{ color: '#8a8a8a' }}>Brzycki e1RM</div>
            </div>
          </div>

          {repsDelta !== null && (
            <p className="text-[13px]" style={{ color: repsDelta >= 0 ? '#86efac' : '#fca5a5' }}>
              {repsDelta >= 0 ? `+${repsDelta} rep${repsDelta === 1 ? '' : 's'} over target` : `${repsDelta} reps under target`}
            </p>
          )}

          <div>
            <div className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: '#8a8a8a' }}>
              Working weights (% of Epley e1RM)
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {table.map(row => (
                <div key={row.pct} className="text-center rounded-[2px] py-1.5" style={{ background: '#1e1e1e' }}>
                  <div className="text-[13px] tabular-nums" style={{ color: '#e2e2e2' }}>{row.weight}</div>
                  <div className="text-[10px]" style={{ color: '#6f6f6f' }}>{row.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolCard>
  )
}
