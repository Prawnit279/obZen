import { useNavigate } from 'react-router-dom'
import { Check, RotateCcw } from 'lucide-react'
import { IntakeWizard } from '@/components/modules/intake/IntakeWizard'
import { useIntakePrefills } from '@/components/modules/intake/usePrefills'
import { useIntakeStore } from '@/store/useIntakeStore'
import { answeredCount } from '@/lib/intake'
import { INTAKE_QUESTIONS } from '@/data/intake-questions'
import { Card } from '@/components/ui/Card'
import { ProgramMatchCard } from '@/components/modules/intake/ProgramMatchCard'
import { Button } from '@/components/ui/Button'

/**
 * The goal questionnaire.
 *
 * Shows the wizard until it has been finished once, then a summary with a way
 * back in — the answers change as training and circumstances do, so this is
 * something to revisit rather than a one-off gate.
 */
export default function Intake() {
  const navigate = useNavigate()
  const { answers, completedAt, setAnswer, markSeen, markComplete, reset } = useIntakeStore()
  const prefills = useIntakePrefills()

  const done = answeredCount(answers)
  const total = INTAKE_QUESTIONS.length

  if (completedAt) {
    return (
      <div className="page-container space-y-4">
        <div className="pt-2">
          <div
            className="uppercase text-[length:var(--text-sm)] tracking-widest"
            style={{ color: 'var(--ink-dim)' }}
          >
            Your goal
          </div>
          <h1 style={{ fontSize: 'var(--text-6xl)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
            Questionnaire
          </h1>
        </div>

        <Card>
          <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
            <Check size={18} style={{ color: 'var(--ok)' }} />
            <span style={{ fontSize: 'var(--text-xl)', color: 'var(--ink)' }}>
              {done} of {total} answered
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>
            {done === total
              ? 'Every question has an answer.'
              : `${total - done} skipped. Anything that needed them will say so rather than guessing.`}
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: 8 }}>
            Last completed {new Date(completedAt).toLocaleDateString()}.
          </p>

          <div className="flex" style={{ gap: 10, marginTop: 14 }}>
            <Button variant="primary" onClick={() => reset()}>
              <RotateCcw size={14} style={{ marginRight: 6, display: 'inline' }} />
              Take it again
            </Button>
            <Button variant="ghost" onClick={() => navigate('/settings')}>Done</Button>
          </div>
        </Card>

        <ProgramMatchCard answers={answers} />
      </div>
    )
  }

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <IntakeWizard
          answers={answers}
          onAnswer={setAnswer}
          onSeen={markSeen}
          onFinish={markComplete}
          onClose={() => navigate('/settings')}
          prefills={prefills}
        />
      </div>
    </div>
  )
}
