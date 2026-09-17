/**
 * The top-set history card.
 *
 * `amrapHistory` has its own tests in `block.test.ts` — what is pinned here is
 * only what the card decides for itself: that meeting the prescription exactly
 * reads as a pass rather than as a nought, that a lift with nothing logged
 * under the block is absent rather than shown empty, and that the card stays
 * away entirely when there is nothing to say.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AmrapHistoryCard } from '@/components/modules/workout/progress/AmrapHistoryCard'
import type { ActiveBlock } from '@/store/useBlockStore'
import type { WorkoutDaySession } from '@/db/dexie'

afterEach(cleanup)

const START = '2026-09-07'
const wk = (n: number) =>
  new Date(Date.UTC(2026, 8, 7 + (n - 1) * 7)).toISOString().slice(0, 10)

const block: ActiveBlock = {
  programId: 'five-three-one',
  templateId: null,
  startedOn: START,
  trainingMaxLb: { 'barbell-squat': 315, 'bench-press': 225 },
}

/**
 * One squat session whose top set is `reps` at `plates` pounds of plate, plus
 * the bar. The default happens to land exactly on week one's prescription,
 * which is why the test below overrides it.
 */
function squatDay(date: string, reps: number, plates = 225): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    order: ['barbell-squat'],
    exercises: [{
      exerciseId: 'barbell-squat',
      status: 'complete',
      // Flagged, because `amrapHistory` reads only sets the lifter marked.
      sets: [{
        setNumber: 1, weight: plates, reps,
        unit: 'lbs', timestamp: `${date}T10:00:00.000Z`, isAmrap: true,
      }],
    }],
  } as WorkoutDaySession
}

describe('AmrapHistoryCard', () => {
  it('shows nothing at all when no top set has been logged under the block', () => {
    const { container } = render(<AmrapHistoryCard block={block} sessions={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('reads an exact hit as met, not as zero', () => {
    // Week one asks for five-plus. Five is a pass, and "0" next to it would
    // look like a failure.
    render(<AmrapHistoryCard block={block} sessions={[squatDay(wk(1), 5)]} />)
    expect(screen.getByText('met')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('signs the surplus and the shortfall', () => {
    render(<AmrapHistoryCard block={block} sessions={[squatDay(wk(1), 8), squatDay(wk(2), 1)]} />)
    expect(screen.getByText('+3')).toBeInTheDocument()   // 8 against 5+
    expect(screen.getByText('-2')).toBeInTheDocument()   // 1 against 3+
  })

  it('prints the weight beside the reps, since reps alone say nothing', () => {
    render(<AmrapHistoryCard block={block} sessions={[squatDay(wk(1), 8)]} />)
    // 225 on the bar plus the 45 lb bar itself.
    expect(screen.getByText(/270 lb × 8/)).toBeInTheDocument()
  })

  it('prints what was lifted, not what the week called for', () => {
    // Week one off a 315 training max prescribes 270. Lifting 280 has to read
    // as 280 — showing the prescription back would make every row agree with
    // the plan whether or not the session did, which is the one thing this
    // card exists to reveal. The default fixture cannot catch it: 225 plates
    // plus the bar lands exactly on the prescribed 270.
    render(<AmrapHistoryCard block={block} sessions={[squatDay(wk(1), 6, 235)]} />)
    expect(screen.getByText(/280 lb × 6/)).toBeInTheDocument()
    expect(screen.queryByText(/270 lb/)).not.toBeInTheDocument()
  })

  it('counts how many met the target', () => {
    render(<AmrapHistoryCard block={block} sessions={[
      squatDay(wk(1), 8), squatDay(wk(2), 3), squatDay(wk(3), 0),
    ]} />)
    // The third logs no reps at all, which is not a set — so two attempts, both met.
    expect(screen.getByText('2 of 2 on target')).toBeInTheDocument()
  })

  it('leaves out a lift with a training max but nothing logged', () => {
    render(<AmrapHistoryCard block={block} sessions={[squatDay(wk(1), 5)]} />)
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument()
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument()
  })
})
