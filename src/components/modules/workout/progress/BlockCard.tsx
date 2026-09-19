import { Repeat, Info } from 'lucide-react'
import { weekPrescription, blockProgress } from '@/lib/block'
import type { ActiveBlock } from '@/store/useBlockStore'
import { Card } from '@/components/ui/Card'

interface Props {
  block: ActiveBlock
  todayISO: string
  onEnd: () => void
}

/**
 * Where you are in the block, and what this week asks for.
 *
 * Shown only while a block is running, so it is never a card explaining that
 * there is nothing to show. A deload week is called out rather than left to be
 * inferred from lighter numbers, because the whole point of one is that it is
 * deliberate.
 */
export function BlockCard({ block, todayISO, onEnd }: Props) {
  const p = weekPrescription(block, todayISO)
  if (!p) return null

  const fraction = blockProgress(block, todayISO)

  return (
    <Card label="Current block">
      <div className="flex items-baseline justify-between" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            {p.program.name}
            {p.template && (
              <span style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-dim)' }}> · {p.template.name}</span>
            )}
          </div>
          <div style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)', marginTop: 2 }}>
            Week {p.week} of {p.program.cycleWeeks} · cycle {p.cycle}
            {p.isDeload && (
              <span style={{ color: 'var(--accent)' }}> · deload</span>
            )}
          </div>
        </div>
        <button onClick={onEnd} style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-dim)' }}>
          End block
        </button>
      </div>

      {fraction !== null && (
        <div
          role="progressbar"
          aria-valuenow={p.week}
          aria-valuemin={1}
          aria-valuemax={p.program.cycleWeeks}
          aria-label="Position in the block"
          style={{ height: 4, borderRadius: 'var(--r-bar)', background: 'rgb(255 255 255 / 0.07)', marginTop: 12 }}
        >
          <div
            style={{
              width: `${Math.min(100, fraction * 100)}%`, height: '100%',
              borderRadius: 'var(--r-bar)',
              background: p.isDeload ? 'var(--ink-faint)' : 'var(--violet-400)',
              transition: 'width var(--t-base) var(--ease-out)',
            }}
          />
        </div>
      )}

      {/* A block on a programme whose numbers were never supplied is a real
          state. Saying what is missing beats filling the gap in. */}
      {p.unavailable && (
        <p
          className="flex items-start"
          style={{ gap: 8, fontSize: 'var(--text-md)', color: 'var(--ink-faint)', marginTop: 14 }}
        >
          <Info size={14} style={{ flexShrink: 0, marginTop: 3 }} />
          <span>Needs {p.unavailable}</span>
        </p>
      )}

      {p.lifts.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            className="uppercase"
            style={{ fontSize: 'var(--text-sm)', letterSpacing: '0.12em', color: 'var(--ink-faint)', marginBottom: 10 }}
          >
            This week
          </div>

          {p.lifts.map(lift => (
            <div key={lift.exerciseId} style={{ marginBottom: 12 }}>
              <div className="flex items-baseline justify-between" style={{ gap: 10 }}>
                <span style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-2)' }}>{lift.name}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
                  TM {lift.trainingMaxLb} lb
                </span>
              </div>
              <div className="flex" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {lift.sets.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 9px', borderRadius: 'var(--r-pill)',
                      fontSize: 'var(--text-md)', fontVariantNumeric: 'tabular-nums',
                      border: `1px solid ${s.isAmrap ? 'rgb(var(--accent-soft-rgb) / 0.45)' : 'var(--hairline)'}`,
                      color: s.isAmrap ? 'var(--ink)' : 'var(--ink-dim)',
                    }}
                  >
                    {s.weight} × {s.reps}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {p.supplemental && p.supplemental.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hairline-soft)' }}>
          <div
            className="uppercase flex items-center"
            style={{ gap: 6, fontSize: 'var(--text-sm)', letterSpacing: '0.12em', color: 'var(--ink-faint)', marginBottom: 8 }}
          >
            <Repeat size={12} /> Supplemental
          </div>
          {p.supplemental.map(s => (
            <div
              key={s.label}
              className="flex items-baseline justify-between"
              style={{ gap: 10, marginBottom: 4 }}
            >
              <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>{s.label}</span>
              <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
                {s.weightLb} lb × {s.sets}×{s.reps}
                <span style={{ color: 'var(--ink-faint)' }}> · {s.percentOfTm}%</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
