import { Card } from '@/components/ui/Card'
import { liftHue } from './Charts'
import type { BalanceReport } from '@/lib/progressTrends'


/**
 * The three competition lifts against one another.
 *
 * The reference ratios vary genuinely between people — limb length, stance,
 * training history — so a lagging lift is posed as a question rather than
 * stated as a fault, and the caveat sits in the card.
 */
export function BalanceCard({ report }: { report: BalanceReport }) {
  return (
    <Card label="Lift balance">
      <div className="flex flex-col" style={{ gap: 10 }}>
        {report.lifts.map(l => {
          const pct = Math.min(100, (l.index / 1.2) * 100)
          const behind = l.index < 1
          return (
            <div key={l.exerciseId} className="flex flex-col" style={{ gap: 5 }}>
              <div className="flex items-baseline justify-between" style={{ fontSize: 13, gap: 12 }}>
                <span style={{ color: 'var(--ink-2)' }}>{l.name}</span>
                <span style={{ color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {l.ratio.toFixed(2)}× squat
                  <span style={{ color: 'var(--ink-faint)' }}> vs {l.expected.toFixed(2)}</span>
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 'var(--r-bar)', background: 'rgba(255,255,255,0.06)' }}>
                <div
                  style={{
                    width: `${pct}%`, height: '100%', borderRadius: 'var(--r-bar)',
                    background: behind ? 'var(--lift-row)' : liftHue(l.name),
                    transition: 'width var(--t-base) var(--ease-out)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {report.lagging && (
        <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          {report.lagging.name} is furthest behind the others. Worth asking whether
          it needs more attention — or whether these ratios simply are not yours.
        </p>
      )}

      <p
        style={{
          fontSize: 11, color: 'var(--ink-faint)',
          paddingTop: 12, borderTop: '1px solid var(--hairline-soft)',
        }}
      >
        Reference ratios only. They shift with limb length, stance and which lift
        you have trained hardest, so read a gap as a question, not a fault.
      </p>
    </Card>
  )
}

