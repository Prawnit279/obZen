import { Card } from '@/components/ui/Card'
import { exerciseNameFor } from '@/data/obzen-program'
import type { TmAdvice, TmVerdict } from '@/lib/amrap'

const VERDICT_LABEL: Record<TmVerdict, string> = {
  advance: 'Add the jump',
  hold: 'Repeat the weight',
  reset: 'Drop back',
}

/** Only a reset earns the accent; the other two are ordinary outcomes. */
function verdictColor(verdict: TmVerdict): string {
  return verdict === 'reset' ? 'var(--violet-100)' : 'var(--ink-dim)'
}

function shortDate(iso: string): string {
  const [, month, day] = iso.split('-')
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`
}

function AdviceRow({ advice }: { advice: TmAdvice }) {
  return (
    <div
      className="flex flex-col"
      style={{
        gap: 6, padding: '12px 14px', borderRadius: 'var(--r-inset)',
        border: `1px solid ${advice.verdict === 'reset' ? 'rgba(167,139,250,0.35)' : 'var(--hairline)'}`,
        background: advice.verdict === 'reset' ? 'rgba(139,92,246,0.08)' : 'transparent',
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
          {exerciseNameFor(advice.exerciseId)}
        </span>
        <span
          className="uppercase shrink-0"
          style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
            color: verdictColor(advice.verdict),
          }}
        >
          {VERDICT_LABEL[advice.verdict]}
        </span>
      </div>

      <div className="flex items-baseline flex-wrap" style={{ gap: 8 }}>
        <span
          style={{
            fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {advice.nextTmLb} lb
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
          next training max
        </span>
      </div>

      <p style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
        {advice.set.weightLb} lb × {advice.set.reps} on {shortDate(advice.set.dateISO)} —{' '}
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{advice.e1rmLb} lb</span> estimated max.
      </p>

      <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{advice.reason}</p>
    </div>
  )
}

/**
 * What the last all-out set on each lift says about the next cycle.
 *
 * Only flagged AMRAP sets feed this, so it stays empty until sets are marked —
 * a straight set stopped at a prescribed count, and reading a ceiling off one
 * would just report the prescription back.
 */
export function AmrapCard({ advice }: { advice: TmAdvice[] }) {
  if (advice.length === 0) return null

  return (
    <Card label="Off your last all-out set">
      {advice.map(a => <AdviceRow key={a.exerciseId} advice={a} />)}

      <p style={{ fontSize: 11, color: 'var(--ink-ghost)' }}>
        The app stores no training max, so “what you have been running” is taken
        from the best estimate in your history before that set. Treat these as a
        starting point for the next cycle, not a prescription.
      </p>
    </Card>
  )
}
