import { Card } from '@/components/ui/Card'
import { displayLb, kgToLb } from '@/lib/progress'
import type { LiftSignal } from '@/lib/progressTrends'


/**
 * Rate of change per key lift, under the trend chart.
 *
 * A chart shows the shape; this says how fast. A lift with one session has no
 * direction yet and says so rather than showing a zero, which would read as
 * "not moving" instead of "not enough data".
 */
export function TrendRates({ signals }: { signals: LiftSignal[] }) {
  if (signals.length === 0) return null
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      {signals.map(sig => {
        const rate = sig.trend ? kgToLb(sig.trend.slopeKgPerWeek) : null
        const rising = (rate ?? 0) > 0.05
        const falling = (rate ?? 0) < -0.05
        return (
          <div key={sig.exerciseId} className="flex items-baseline justify-between" style={{ gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{sig.name}</span>
            {rate === null ? (
              <span style={{ fontSize: 11, color: 'var(--ink-ghost)' }}>not enough sessions</span>
            ) : (
              <span
                style={{
                  fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  color: rising ? 'var(--ok)' : falling ? 'var(--red)' : 'var(--ink-faint)',
                }}
              >
                {rate > 0 ? '+' : ''}{Math.round(rate * 10) / 10} lb/week
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Lifts that are being trained but not improving.
 *
 * Measured from a lift's best session to its most recent one, so a deliberate
 * break never reads as a stall. The suggested training max is 90% of the peak,
 * which is what 5/3/1 does when a lift stops moving.
 */
export function StallCard({ signals }: { signals: LiftSignal[] }) {
  return (
    <Card elevated style={{ border: '1px solid rgba(167,139,250,0.30)' }}>
      <h3
        className="uppercase"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--violet-100)' }}
      >
        Not moving
      </h3>
      <div className="flex flex-col" style={{ gap: 12 }}>
        {signals.map(sig => (
          <div key={sig.exerciseId} className="flex flex-col" style={{ gap: 2 }}>
            <div className="flex items-baseline justify-between" style={{ gap: 12 }}>
              <span style={{ fontSize: 15, color: 'var(--ink)' }}>{sig.name}</span>
              <span
                style={{ fontSize: 13, color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums' }}
              >
                {Math.round(sig.stall!.weeksSincePeak)} weeks
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
              Best {displayLb(sig.stall!.peakKg)} lb on {sig.stall!.peakDate}. Consider resetting
              the training max to {displayLb(sig.stall!.resetToKg)} lb.
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

