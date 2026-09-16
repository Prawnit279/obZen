import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { INTAKE_QUESTIONS, SECTIONS } from '@/data/intake-questions'
import type { IntakeQuestion } from '@/data/intake-questions'
import { isAnswered } from '@/lib/intake'
import type { IntakeAnswer, IntakeAnswers } from '@/lib/intake'
import { QuestionInput } from './QuestionInput'
import { Button } from '@/components/ui/Button'

interface Props {
  answers: IntakeAnswers
  onAnswer: (id: string, answer: IntakeAnswer) => void
  onSeen: (id: string) => void
  onFinish: () => void
  onClose: () => void
  /** Values the app already holds, offered as a starting point per question. */
  prefills: Partial<Record<string, { answer: IntakeAnswer; source: string }>>
}

/**
 * The questionnaire, one question at a time.
 *
 * Every question can be passed. Skipping is a first-class answer here rather
 * than a way out of a form: the alternative is a forced choice, which is worse
 * data than none, and everything downstream already has to handle absence.
 */
export function IntakeWizard({ answers, onAnswer, onSeen, onFinish, onClose, prefills }: Props) {
  const [index, setIndex] = useState(0)
  const question: IntakeQuestion = INTAKE_QUESTIONS[index]
  const total = INTAKE_QUESTIONS.length
  const isLast = index === total - 1
  const section = SECTIONS.find(s => s.id === question.section)
  const prefill = prefills[question.id]
  const answered = isAnswered(answers, question.id)

  const advance = () => {
    onSeen(question.id)
    if (isLast) onFinish()
    else setIndex(i => i + 1)
  }

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      {/* Where you are, and a way out that keeps what you have answered. */}
      <div className="flex items-center justify-between" style={{ gap: 12 }}>
        <button
          onClick={() => (index === 0 ? onClose() : setIndex(i => i - 1))}
          className="flex items-center transition-opacity hover:opacity-70"
          style={{ gap: 6, fontSize: 'var(--text-sm)', color: 'var(--ink-dim)' }}
        >
          <ArrowLeft size={14} /> {index === 0 ? 'Close' : 'Back'}
        </button>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
          {index + 1} of {total}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Questionnaire progress"
        style={{ height: 4, borderRadius: 'var(--r-bar)', background: 'rgb(255 255 255 / 0.07)' }}
      >
        <div
          style={{
            width: `${((index + 1) / total) * 100}%`, height: '100%',
            borderRadius: 'var(--r-bar)', background: 'var(--accent)',
            transition: 'width var(--t-base) var(--ease-out)',
          }}
        />
      </div>

      <div>
        <div
          className="uppercase"
          style={{ fontSize: 'var(--text-sm)', letterSpacing: '0.12em', color: 'var(--ink-faint)', marginBottom: 6 }}
        >
          {section?.label}
        </div>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          {question.prompt}
        </h2>
        {question.hint && (
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)', marginTop: 6 }}>{question.hint}</p>
        )}
      </div>

      {/* Offered, never applied silently — an answer nobody gave should not
          look like one they did. */}
      {prefill && !answered && (
        <button
          onClick={() => onAnswer(question.id, prefill.answer)}
          className="text-left transition-opacity hover:opacity-80"
          style={{
            padding: '10px 12px', borderRadius: 'var(--r-control)',
            border: '1px dashed var(--hairline)', fontSize: 'var(--text-md)', color: 'var(--ink-dim)',
          }}
        >
          Use what the app already has — <span style={{ color: 'var(--ink-2)' }}>{prefill.source}</span>
        </button>
      )}

      <QuestionInput
        question={question}
        answer={answers[question.id]}
        onChange={a => onAnswer(question.id, a)}
      />

      <div className="flex items-center" style={{ gap: 10 }}>
        <Button variant="primary" fullWidth onClick={advance}>
          {isLast ? 'Finish' : answered ? 'Next' : 'Skip'}
          {isLast && <Check size={15} style={{ marginLeft: 6, display: 'inline' }} />}
        </Button>
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-ghost)' }}>
        Every question can be skipped. Anything that needed the answer will say
        so rather than guessing.
      </p>
    </div>
  )
}
