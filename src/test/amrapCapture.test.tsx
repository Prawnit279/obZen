/**
 * The AMRAP chain, from the toggle to the advice.
 *
 * `amrap.test.ts` covers the maths at 100%, but every fixture there hands the
 * library a set that already carries `isAmrap: true`. Nothing checked that the
 * app can actually produce one — the toggle could stop writing the flag and the
 * whole feature would go quiet without a single test failing, because "no
 * advice" is exactly what an unflagged history looks like.
 *
 * These tests run the real logger and feed what it produces into the real
 * library, so the two halves cannot drift apart.
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LoggedSet, WorkoutDaySession } from '@/db/dexie'
import { SetLogger } from '@/components/modules/workout/SetLogger'
import { tmAdvice } from '@/lib/amrap'

afterEach(cleanup)

/** Render the logger on an empty exercise and capture what it saves. */
function logger(exerciseId: string) {
  const onAddSet = vi.fn()
  render(
    <SetLogger
      exerciseId={exerciseId}
      sets={[]}
      onAddSet={onAddSet}
      onUpdateSet={vi.fn()}
      onRemoveSet={vi.fn()}
    />
  )
  return { onAddSet }
}

async function fill(user: ReturnType<typeof userEvent.setup>, weight: string, reps: string) {
  await user.type(screen.getByLabelText(/^Weight, set 1$/i), weight)
  await user.type(screen.getByLabelText(/^Reps, set 1$/i), reps)
}

// ── The toggle actually writes the flag ──────────────────────────────────────

describe('flagging a set as an AMRAP', () => {
  it('persists isAmrap when the rep label is tapped', async () => {
    const user = userEvent.setup()
    const { onAddSet } = logger('barbell-squat')

    await fill(user, '300', '5')
    await user.click(screen.getByLabelText(/mark set 1 as AMRAP/i))
    await user.click(screen.getByLabelText(/save set/i))

    expect(onAddSet).toHaveBeenCalledTimes(1)
    expect(onAddSet.mock.calls[0][0]).toMatchObject({ weight: 300, reps: 5, isAmrap: true })
  })

  it('leaves the key off entirely when the set is not an AMRAP', async () => {
    const user = userEvent.setup()
    const { onAddSet } = logger('barbell-squat')

    await fill(user, '300', '5')
    await user.click(screen.getByLabelText(/save set/i))

    const saved: LoggedSet = onAddSet.mock.calls[0][0]
    expect(Object.prototype.hasOwnProperty.call(saved, 'isAmrap')).toBe(false)
  })

  it('shows the 5/3/1 notation while the set is flagged', async () => {
    const user = userEvent.setup()
    logger('barbell-squat')
    const toggle = screen.getByLabelText(/mark set 1 as AMRAP/i)

    expect(toggle).toHaveTextContent(/^reps$/)
    await user.click(toggle)
    expect(toggle).toHaveTextContent(/^reps\+$/)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('can be turned back off before saving', async () => {
    const user = userEvent.setup()
    const { onAddSet } = logger('barbell-squat')

    await fill(user, '300', '5')
    const toggle = screen.getByLabelText(/mark set 1 as AMRAP/i)
    await user.click(toggle)
    await user.click(toggle)
    await user.click(screen.getByLabelText(/save set/i))

    expect(Object.prototype.hasOwnProperty.call(onAddSet.mock.calls[0][0], 'isAmrap')).toBe(false)
  })

  it('offers no AMRAP toggle on a timed hold', () => {
    // A plank has no rep ceiling to probe, so there is nothing to flag.
    logger('plank')
    expect(screen.queryByLabelText(/mark set 1 as AMRAP/i)).not.toBeInTheDocument()
  })

  it('tells the lifter the bar is added, on bar-loaded lifts only', () => {
    logger('barbell-squat')
    expect(screen.getByText(/plates only, 45 lb bar added/i)).toBeInTheDocument()
    cleanup()

    logger('leg-press')
    expect(screen.queryByText(/plates only/i)).not.toBeInTheDocument()
  })
})

// ── What the logger writes is what the library reads ─────────────────────────

describe('the captured set reaches the training-max advice', () => {
  async function captureSet(exerciseId: string, weight: string, reps: string): Promise<LoggedSet> {
    const user = userEvent.setup()
    const { onAddSet } = logger(exerciseId)
    await fill(user, weight, reps)
    await user.click(screen.getByLabelText(/mark set 1 as AMRAP/i))
    await user.click(screen.getByLabelText(/save set/i))
    return onAddSet.mock.calls[0][0]
  }

  function sessionWith(set: LoggedSet, exerciseId: string): WorkoutDaySession {
    return {
      date: '2026-09-07', dayLabel: 'Day 1', profileId: 'pronit',
      exercises: [{ exerciseId, status: 'complete', muscle: 'legs', sets: [set] }],
      order: [exerciseId],
    }
  }

  it('turns a freshly logged AMRAP into a next training max', async () => {
    const set = await captureSet('barbell-squat', '300', '5')
    const [advice] = tmAdvice([sessionWith(set, 'barbell-squat')], ['barbell-squat'])

    // 300 plates + the 45 lb bar = 345, Epley over 5 reps = 402.5, TM 360,
    // plus the 10 lb lower-body jump.
    expect(advice).toBeDefined()
    expect(advice.impliedTmLb).toBe(360)
    expect(advice.nextTmLb).toBe(370)
  })

  it('produces no advice at all when the toggle is never tapped', async () => {
    // The silent failure this file exists to catch: if the flag stopped being
    // written, this is what every case would look like.
    const user = userEvent.setup()
    const { onAddSet } = logger('barbell-squat')
    await fill(user, '300', '5')
    await user.click(screen.getByLabelText(/save set/i))

    const set: LoggedSet = onAddSet.mock.calls[0][0]
    expect(tmAdvice([sessionWith(set, 'barbell-squat')], ['barbell-squat'])).toEqual([])
  })
})
