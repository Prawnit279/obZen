import { useNavigate } from 'react-router-dom'
import { Check, AlertCircle, Lock } from 'lucide-react'
import { recommendProgram } from '@/lib/programs'
import type { ProgramMatch } from '@/lib/programs'
import type { IntakeAnswers } from '@/lib/intake'
import { Card } from '@/components/ui/Card'

interface Props {
  answers: IntakeAnswers
}

/**
 * What the answers point at.
 *
 * Shows its reasoning rather than just a name, because the reasoning is what
 * makes the recommendation checkable — a programme title on its own asks to be
 * taken on trust. What is missing is named too: a shortlist drawn from three
 * answers is a different thing from one drawn from seven, and the reader is
 * the only one who can decide whether that is good enough.
 */
export function ProgramMatchCard({ answers }: Props) {
  const navigate = useNavigate()
  const { matches, missing, undecidable } = recommendProgram(answers)

  if (undecidable) {
    return (
      <Card label="Your programme">
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>
          Nothing that decides this has been answered yet, so there is no
          recommendation to make. Answering the goal, experience and schedule
          questions is enough to produce one.
        </p>
      </Card>
    )
  }

  const [best, ...rest] = matches
  const usableRest = rest.filter(m => m.program.status === 'available')
  const blocked = matches.filter(m => m.program.status === 'needs-source')

  return (
    <Card label="Your programme">
      <Recommendation match={best} lead />

      {missing.length > 0 && (
        <p
          className="flex items-start"
          style={{ gap: 8, fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: 12 }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Based on {matches.length > 0 ? best.reasons.length + best.against.length : 0} of
            {' '}{best.reasons.length + best.against.length + missing.length} questions.{' '}
            <button
              onClick={() => navigate('/intake')}
              style={{ color: 'var(--ink-dim)', textDecoration: 'underline' }}
            >
              {missing.length} still unanswered
            </button>
            {' '}— answering them may change this.
          </span>
        </p>
      )}

      {usableRest.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--hairline-soft)' }}>
          <div
            className="uppercase"
            style={{ fontSize: 'var(--text-sm)', letterSpacing: '0.12em', color: 'var(--ink-faint)', marginBottom: 10 }}
          >
            Also fits
          </div>
          {usableRest.map(m => <Recommendation key={m.program.id} match={m} />)}
        </div>
      )}

      {blocked.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--hairline-soft)' }}>
          <div
            className="uppercase flex items-center"
            style={{ gap: 6, fontSize: 'var(--text-sm)', letterSpacing: '0.12em', color: 'var(--ink-faint)', marginBottom: 8 }}
          >
            <Lock size={12} /> Not ready yet
          </div>
          {blocked.map(m => (
            <div key={m.program.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-2)' }}>
                {m.program.name}
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
                  {' '}· {m.program.source}
                </span>
              </div>
              {/* Says what it is waiting for, so it is obvious this is a gap
                  rather than a programme that does not exist. */}
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: 2 }}>
                Needs {m.program.needs}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function Recommendation({ match, lead }: { match: ProgramMatch; lead?: boolean }) {
  const { program, reasons, against } = match
  return (
    <div style={{ marginBottom: lead ? 0 : 12 }}>
      <div className="flex items-baseline" style={{ gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: lead ? 'var(--text-3xl)' : 'var(--text-lg)',
            fontWeight: lead ? 700 : 500,
            letterSpacing: lead ? '-0.02em' : undefined,
            color: 'var(--ink)',
          }}
        >
          {program.name}
        </span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>{program.source}</span>
      </div>

      {lead && (
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)', marginTop: 6 }}>
          {program.blurb}
        </p>
      )}

      <ul style={{ marginTop: 8 }}>
        {reasons.map(r => (
          <li key={r} className="flex items-start" style={{ gap: 7, marginBottom: 3 }}>
            <Check size={13} style={{ color: 'var(--ok)', flexShrink: 0, marginTop: 3 }} />
            <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>{r}</span>
          </li>
        ))}
        {/* Shown, not hidden — a recommendation that only lists what suits is
            an advert. */}
        {against.map(a => (
          <li key={a} className="flex items-start" style={{ gap: 7, marginBottom: 3 }}>
            <span style={{ color: 'var(--ink-ghost)', flexShrink: 0, fontSize: 'var(--text-md)' }}>—</span>
            <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-faint)' }}>{a}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
