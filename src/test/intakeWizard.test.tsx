/**
 * The questionnaire as it is actually used.
 *
 * The behaviour that matters most here is skipping: it has to be a real answer,
 * not a way out of a form. A skipped question must leave no value behind, and
 * must still let the questionnaire be finished.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntakeWizard } from '@/components/modules/intake/IntakeWizard'
import { useIntakeStore } from '@/store/useIntakeStore'
import { INTAKE_QUESTIONS } from '@/data/intake-questions'
import { isAnswered, answeredCount } from '@/lib/intake'
import type { IntakeAnswer } from '@/lib/intake'

beforeEach(() => {
  localStorage.clear()
  useIntakeStore.setState({ answers: {}, seen: [], completedAt: null })
})
afterEach(cleanup)

/** Renders the wizard wired to the real store, as the page does. */
function openWizard(prefills = {}) {
  const onFinish = vi.fn()
  function Harness() {
    const { answers, setAnswer, markSeen } = useIntakeStore()
    return (
      <IntakeWizard
        answers={answers}
        onAnswer={setAnswer}
        onSeen={markSeen}
        onFinish={onFinish}
        onClose={vi.fn()}
        prefills={prefills}
      />
    )
  }
  render(<Harness />)
  return { onFinish }
}

const store = () => useIntakeStore.getState()

describe('moving through the questionnaire', () => {
  it('opens on the first question, and counts them', () => {
    openWizard()
    expect(screen.getByText(INTAKE_QUESTIONS[0].prompt)).toBeInTheDocument()
    expect(screen.getByText(`1 of ${INTAKE_QUESTIONS.length}`)).toBeInTheDocument()
  })

  it('records an answer and moves on', async () => {
    const user = userEvent.setup()
    openWizard()
    await user.click(screen.getByRole('button', { name: 'Gain muscle' }))
    await user.click(screen.getByRole('button', { name: /^next$/i }))

    expect(store().answers['primary-goal']).toEqual({ kind: 'single', value: 'muscle' })
    expect(screen.getByText(INTAKE_QUESTIONS[1].prompt)).toBeInTheDocument()
  })

  it('offers Skip until something is answered, then Next', async () => {
    const user = userEvent.setup()
    openWizard()
    expect(screen.getByRole('button', { name: /^skip$/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Gain muscle' }))
    expect(screen.getByRole('button', { name: /^next$/i })).toBeInTheDocument()
  })

  it('leaves no value behind when a question is skipped', async () => {
    const user = userEvent.setup()
    openWizard()
    await user.click(screen.getByRole('button', { name: /^skip$/i }))

    // Absent, not defaulted — a substituted answer here becomes a confident
    // recommendation built on something nobody said.
    expect(store().answers['primary-goal']).toBeUndefined()
    expect(isAnswered(store().answers, 'primary-goal')).toBe(false)
    // But it counts as reached, so the questionnaire can still be finished.
    expect(store().seen).toContain('primary-goal')
  })

  it('goes back without losing the answer', async () => {
    const user = userEvent.setup()
    openWizard()
    await user.click(screen.getByRole('button', { name: 'Gain muscle' }))
    await user.click(screen.getByRole('button', { name: /^next$/i }))
    await user.click(screen.getByRole('button', { name: /^back$/i }))

    expect(screen.getByText(INTAKE_QUESTIONS[0].prompt)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gain muscle' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('can be finished having skipped every question', async () => {
    const user = userEvent.setup()
    const { onFinish } = openWizard()
    for (let i = 0; i < INTAKE_QUESTIONS.length; i++) {
      await user.click(screen.getByRole('button', { name: /^(skip|finish)$/i }))
    }
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(answeredCount(store().answers)).toBe(0)
    expect(store().seen).toHaveLength(INTAKE_QUESTIONS.length)
  })
})

describe('pre-filled answers', () => {
  const prefill: Record<string, { answer: IntakeAnswer; source: string }> = {
    'primary-goal': { answer: { kind: 'single', value: 'fat-loss' }, source: 'your weight goal' },
  }

  it('offers what the app knows rather than applying it', () => {
    openWizard(prefill)
    expect(screen.getByText(/your weight goal/i)).toBeInTheDocument()
    // Offered only — nothing is recorded until it is accepted.
    expect(store().answers['primary-goal']).toBeUndefined()
  })

  it('takes the offer when it is accepted', async () => {
    const user = userEvent.setup()
    openWizard(prefill)
    await user.click(screen.getByText(/your weight goal/i))
    expect(store().answers['primary-goal']).toEqual({ kind: 'single', value: 'fat-loss' })
  })

  it('stops offering once the question is answered', async () => {
    const user = userEvent.setup()
    openWizard(prefill)
    await user.click(screen.getByRole('button', { name: 'Gain muscle' }))
    expect(screen.queryByText(/your weight goal/i)).not.toBeInTheDocument()
  })
})

describe('multi-select answers', () => {
  it('will not hold "nothing" and a complaint at once', async () => {
    const user = userEvent.setup()
    useIntakeStore.setState({
      answers: { injuries: { kind: 'multi', values: ['knee'] } }, seen: [], completedAt: null,
    })
    const injuriesIndex = INTAKE_QUESTIONS.findIndex(q => q.id === 'injuries')
    openWizard()
    for (let i = 0; i < injuriesIndex; i++) {
      await user.click(screen.getByRole('button', { name: /^(skip|next)$/i }))
    }
    await user.click(screen.getByRole('button', { name: /nothing right now/i }))

    const a = store().answers['injuries']
    expect(a?.kind === 'multi' && a.values).toEqual(['none'])
  })
})
