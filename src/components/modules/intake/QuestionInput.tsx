import { useState } from 'react'
import type { IntakeQuestion } from '@/data/intake-questions'
import type { IntakeAnswer, TopSet } from '@/lib/intake'
import { SCALE_MIN, SCALE_MAX } from '@/lib/intake'
import { SegmentedPill } from '@/components/ui/SegmentedPill'

const LIFTS: { id: string; label: string }[] = [
  { id: 'barbell-squat', label: 'Squat' },
  { id: 'bench-press',   label: 'Bench' },
  { id: 'deadlift',      label: 'Deadlift' },
]

interface Props {
  question: IntakeQuestion
  answer: IntakeAnswer | undefined
  onChange: (answer: IntakeAnswer) => void
}

const fieldStyle = {
  color: 'var(--ink)',
  borderColor: 'var(--hairline)',
  padding: '10px 12px',
} as const

/** Renders whichever control the question's answer type calls for. */
export function QuestionInput({ question, answer, onChange }: Props) {
  if (question.type === 'single') {
    const current = answer?.kind === 'single' ? answer.value : null
    return (
      <div className="flex flex-col" style={{ gap: 8 }}>
        {question.options!.map(opt => (
          <Choice
            key={opt.value}
            label={opt.label}
            selected={current === opt.value}
            onClick={() => onChange({ kind: 'single', value: opt.value })}
          />
        ))}
      </div>
    )
  }

  if (question.type === 'multi') {
    return <MultiChoice question={question} answer={answer} onChange={onChange} />
  }

  if (question.type === 'scale') {
    const current = answer?.kind === 'scale' ? answer.value : null
    const [low, high] = question.scaleLabels ?? ['Low', 'High']
    return (
      <div>
        <SegmentedPill
          label={question.prompt}
          grow
          value={current ?? -1}
          onChange={(v: number) => onChange({ kind: 'scale', value: v })}
          options={Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => ({
            value: SCALE_MIN + i,
            label: String(SCALE_MIN + i),
          }))}
        />
        <div
          className="flex justify-between"
          style={{ marginTop: 6, fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}
        >
          <span>{low}</span><span>{high}</span>
        </div>
      </div>
    )
  }

  if (question.type === 'number') {
    const current = answer?.kind === 'number' && Number.isFinite(answer.value) ? String(answer.value) : ''
    return (
      <div className="flex items-center" style={{ gap: 10 }}>
        <input
          type="number" inputMode="decimal" value={current}
          onChange={e => {
            const n = Number(e.target.value)
            onChange({ kind: 'number', value: e.target.value === '' ? NaN : n })
          }}
          aria-label={question.prompt}
          className="rounded-[var(--r-control)] border bg-transparent text-[length:var(--text-xl)] focus:outline-none"
          style={{ ...fieldStyle, width: 130 }}
        />
        {question.unit && (
          <span style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-faint)' }}>{question.unit}</span>
        )}
      </div>
    )
  }

  if (question.type === 'date') {
    const current = answer?.kind === 'date' ? (answer.value ?? '') : ''
    return (
      <input
        type="date" value={current}
        onChange={e => onChange({ kind: 'date', value: e.target.value || null })}
        aria-label={question.prompt}
        className="rounded-[var(--r-control)] border bg-transparent text-[length:var(--text-lg)] focus:outline-none"
        style={fieldStyle}
      />
    )
  }

  return <LiftsInput answer={answer} onChange={onChange} />
}

function Choice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className="text-left transition-colors"
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--r-control)',
        fontSize: 'var(--text-lg)',
        border: `1px solid ${selected ? 'rgb(var(--accent-soft-rgb) / 0.55)' : 'var(--hairline)'}`,
        background: selected ? 'rgb(var(--accent-soft-rgb) / 0.14)' : 'transparent',
        color: selected ? 'var(--ink)' : 'var(--ink-dim)',
      }}
    >
      {label}
    </button>
  )
}

function MultiChoice({ question, answer, onChange }: Props) {
  const values = answer?.kind === 'multi' ? answer.values : []
  const note = answer?.kind === 'multi' ? (answer.note ?? '') : ''

  const toggle = (value: string) => {
    // "Nothing right now" and a list of complaints cannot both be true.
    const next = value === 'none'
      ? (values.includes('none') ? [] : ['none'])
      : values.includes(value)
        ? values.filter(v => v !== value)
        : [...values.filter(v => v !== 'none'), value]
    onChange({ kind: 'multi', values: next, note: note || undefined })
  }

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {question.options!.map(opt => (
        <Choice
          key={opt.value}
          label={opt.label}
          selected={values.includes(opt.value)}
          onClick={() => toggle(opt.value)}
        />
      ))}
      {question.allowNote && (
        <input
          value={note}
          onChange={e => onChange({ kind: 'multi', values, note: e.target.value || undefined })}
          placeholder="Anything worth adding"
          aria-label="Extra detail"
          className="rounded-[var(--r-control)] border bg-transparent text-[length:var(--text-md)] focus:outline-none"
          style={{ ...fieldStyle, marginTop: 2 }}
        />
      )}
    </div>
  )
}

function LiftsInput({ answer, onChange }: { answer: IntakeAnswer | undefined; onChange: (a: IntakeAnswer) => void }) {
  const sets: TopSet[] = answer?.kind === 'lifts' ? answer.sets : []
  const [draft, setDraft] = useState<Record<string, { weight: string; reps: string }>>(() => {
    const seed: Record<string, { weight: string; reps: string }> = {}
    for (const l of LIFTS) {
      const found = sets.find(s => s.exerciseId === l.id)
      seed[l.id] = { weight: found ? String(found.weightLb) : '', reps: found ? String(found.reps) : '' }
    }
    return seed
  })

  const commit = (next: Record<string, { weight: string; reps: string }>) => {
    // Only lifts with both numbers count. A weight with no rep count cannot
    // seed a training max, and guessing the reps would invent the number.
    const built: TopSet[] = LIFTS.flatMap(l => {
      const w = Number(next[l.id].weight)
      const r = Number(next[l.id].reps)
      return w > 0 && r > 0
        ? [{ exerciseId: l.id, weightLb: w, reps: Math.round(r) }]
        : []
    })
    onChange({ kind: 'lifts', sets: built })
  }

  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      {LIFTS.map(lift => (
        <div key={lift.id} className="flex items-center" style={{ gap: 10 }}>
          <span className="shrink-0" style={{ width: 78, fontSize: 'var(--text-lg)', color: 'var(--ink-2)' }}>
            {lift.label}
          </span>
          <input
            type="number" inputMode="decimal" placeholder="lb"
            value={draft[lift.id].weight}
            onChange={e => {
              const next = { ...draft, [lift.id]: { ...draft[lift.id], weight: e.target.value } }
              setDraft(next); commit(next)
            }}
            aria-label={`${lift.label} weight in pounds`}
            className="rounded-[var(--r-control)] border bg-transparent text-[length:var(--text-lg)] focus:outline-none"
            style={{ ...fieldStyle, width: 92 }}
          />
          <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-faint)' }}>×</span>
          <input
            type="number" inputMode="numeric" placeholder="reps"
            value={draft[lift.id].reps}
            onChange={e => {
              const next = { ...draft, [lift.id]: { ...draft[lift.id], reps: e.target.value } }
              setDraft(next); commit(next)
            }}
            aria-label={`${lift.label} reps`}
            className="rounded-[var(--r-control)] border bg-transparent text-[length:var(--text-lg)] focus:outline-none"
            style={{ ...fieldStyle, width: 78 }}
          />
        </div>
      ))}
    </div>
  )
}
