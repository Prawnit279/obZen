import { useNavigate } from 'react-router-dom'
import { ClipboardList, ChevronRight } from 'lucide-react'
import { useBlockStore } from '@/store/useBlockStore'
import { useIntakeStore } from '@/store/useIntakeStore'
import { answeredCount } from '@/lib/intake'
import { INTAKE_QUESTIONS } from '@/data/intake-questions'
import { todayISO } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { BlockCard } from '@/components/modules/workout/progress/BlockCard'
import { ProgramMatchCard } from '@/components/modules/intake/ProgramMatchCard'

/**
 * What the training is meant to be, as opposed to what it has been.
 *
 * These cards lived in Progress, which was the wrong shelf for them: Progress
 * answers "how is it going" from what was logged, and a block answers "what do
 * I do this week" from what was chosen. Reading the week's prescription meant
 * opening a screen built to report the past, scrolling past the analysis to
 * reach the instruction.
 *
 * Nothing here is derived from history except the training maxes the block was
 * seeded with. That is the dividing line, and the reason the top-set history
 * stayed behind in Progress — it is a record of how the prescription went, not
 * part of the prescription.
 */
export default function Plan() {
  const navigate = useNavigate()
  const block = useBlockStore(st => st.block)
  const endBlock = useBlockStore(st => st.end)
  const answers = useIntakeStore(st => st.answers)

  const answered = answeredCount(answers)
  const total = INTAKE_QUESTIONS.length

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <div
          className="uppercase text-[length:var(--text-sm)] tracking-widest"
          style={{ color: 'var(--ink-dim)' }}
        >
          This block
        </div>
        <h1 style={{ fontSize: 'var(--text-6xl)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          Plan
        </h1>
      </div>

      {block ? (
        <BlockCard block={block} todayISO={todayISO()} onEnd={endBlock} />
      ) : (
        // No block is a real state, not an empty one — the app trained fine
        // without a programme before and still does. So this says what a block
        // would add rather than reading as something missing.
        <Card label="No block running">
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>
            Training is being logged, just not against a programme. Starting a
            block gives the week a prescription and the top sets something to be
            measured against.
          </p>
        </Card>
      )}

      {/* The recommendation, and the way to start or switch a block. Absent
          until the questionnaire has been started, since it has nothing to go
          on before that. */}
      {answered > 0 && <ProgramMatchCard answers={answers} />}

      <button
        onClick={() => navigate('/intake')}
        className="w-full text-left transition-opacity hover:opacity-80"
      >
        <Card>
          <div className="flex items-center" style={{ gap: 12 }}>
            <ClipboardList size={18} style={{ flexShrink: 0, color: 'var(--accent)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--ink)' }}>
                Questionnaire
              </div>
              <div style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>
                {answered === 0
                  ? `${total} questions — what you are training for, and what you have to train with`
                  : answered < total
                    ? `${answered} of ${total} answered`
                    : 'All answered — revisit when things change'}
              </div>
            </div>
            <ChevronRight size={16} style={{ flexShrink: 0, color: 'var(--ink-faint)' }} />
          </div>
        </Card>
      </button>
    </div>
  )
}
