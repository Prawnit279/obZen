import { Card } from '@/components/ui/Card'
import type { Acwr, DeloadAdvice } from '@/lib/progressTrends'

const ACWR_LABEL: Record<Acwr['verdict'], string> = {
  detraining: 'Backing off',
  steady: 'Steady',
  elevated: 'Ramping up',
  spike: 'Sharp jump',
  unknown: 'Not enough rated sessions',
}

/**
 * Weekly load against the recent average, and whether to take a lighter week.
 *
 * Everything here is built from session RPE, so it says what it does not know
 * rather than printing a ratio from one rated session — which would be
 * arithmetic dressed up as a signal.
 */
export function LoadCard({ load, deload, rated }: { load: Acwr; deload: DeloadAdvice; rated: number }) {
  const known = load.ratio !== null
  return (
    <Card label="Load & recovery">
      <div className="flex items-baseline" style={{ gap: 8 }}>
        <span
          style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {known ? `${load.ratio!.toFixed(2)}×` : '—'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{ACWR_LABEL[load.verdict]}</span>
      </div>

      {known ? (
        <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          This week against your four-week average, from {rated} rated{' '}
          {rated === 1 ? 'session' : 'sessions'}.
        </p>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          Rate a few sessions when you finish them and this will compare your
          current week against your recent average.
        </p>
      )}

      {deload.reasons.length > 0 && (
        <div
          className="flex flex-col"
          style={{
            gap: 4, padding: '12px 14px', borderRadius: 'var(--r-inset)',
            border: `1px solid ${deload.recommend ? 'rgba(167,139,250,0.35)' : 'var(--hairline)'}`,
            background: deload.recommend ? 'rgba(139,92,246,0.08)' : 'transparent',
          }}
        >
          <span
            className="uppercase"
            style={{
              fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
              color: deload.recommend ? 'var(--violet-100)' : 'var(--ink-dim)',
            }}
          >
            {deload.recommend ? 'Consider a lighter week' : 'Worth watching'}
          </span>
          {deload.reasons.map(r => (
            <span key={r} style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{r}</span>
          ))}
        </div>
      )}

      {known && (
        <p
          style={{
            fontSize: 11, color: 'var(--ink-faint)',
            paddingTop: 12, borderTop: '1px solid var(--hairline-soft)',
          }}
        >
          Acute:chronic bands are reference values and the method itself is
          contested in the literature — read this as a prompt to look at your
          week, not a verdict.
        </p>
      )}
    </Card>
  )
}
