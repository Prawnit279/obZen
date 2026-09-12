/**
 * Render smoke tests for the Train views.
 *
 * These exist because `tsc` and the pure-function suite were both green while
 * the Progress page rendered a white screen — a render-loop crash is invisible
 * to type checking and to tests that never mount a component. React surfaces
 * "Maximum update depth exceeded" as a thrown error during render, so simply
 * mounting each view under real data catches that whole class of bug.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { db } from '@/db/dexie'
import type { LoggedSet } from '@/db/dexie'
import { useProfileStore } from '@/store/useProfileStore'
import { useProgressStore } from '@/store/useProgressStore'
import { WorkoutProgress } from '@/components/modules/workout/progress/WorkoutProgress'
import { StrengthTools } from '@/components/modules/workout/tools/StrengthTools'

function renderView(ui: ReactElement) {
  // Future flags opted in only to keep v7 deprecation warnings out of the output.
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {ui}
    </MemoryRouter>
  )
}

function set(weight: number, reps: number): LoggedSet {
  return { setNumber: 1, weight, reps, unit: 'kg', timestamp: '2026-08-10T10:00:00.000Z' }
}

/** A profile's session containing one barbell lift and one bodyweight lift. */
async function seedSession(profileId: string, date: string) {
  await db.workoutDaySessions.add({
    date,
    dayLabel: 'Day 3',
    profileId,
    focus: 'Test',
    exercises: [
      { exerciseId: 'deadlift', name: 'Deadlift', muscle: 'legs', status: 'complete', sets: [set(140, 3)] },
      { exerciseId: 'assisted-pull-up', name: 'Assisted Pull-Up', muscle: 'back', status: 'complete', sets: [set(30, 6)] },
    ],
    order: ['deadlift', 'assisted-pull-up'],
    completedAt: '2026-08-10T11:00:00.000Z',
  })
}

/** useLiveQuery resolves asynchronously — wait for the view to leave "Loading…". */
async function waitForData() {
  await screen.findByText(/estimated 1rm trend|no training logged yet/i, {}, { timeout: 3000 })
}

beforeEach(async () => {
  await db.delete()
  await db.open()
  // Zustand stores are module singletons — reset so state can't leak across tests.
  useProfileStore.setState({ activeId: 'pronit' })
  useProgressStore.setState({ rungs: {}, bodyweight: {} })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('WorkoutProgress — renders without crashing', () => {
  it('shows the empty state when nothing is logged', async () => {
    renderView(<WorkoutProgress />)
    expect(await screen.findByText(/no training logged yet/i)).toBeInTheDocument()
  })

  it('renders powerlifting panels for Pronit', async () => {
    await seedSession('pronit', '2026-08-10')
    renderView(<WorkoutProgress />)
    await waitForData()

    expect(screen.getByText(/sbd total/i)).toBeInTheDocument()
    expect(screen.getByText(/dots \(est\.\)/i)).toBeInTheDocument()
    expect(screen.getByText(/strength standards/i)).toBeInTheDocument()
  })

  it('ignores sessions stamped with a profile that is not the active one', async () => {
    // This is what keeps the retired second profile's history out of the view:
    // her rows are still in the database, and nothing matches them.
    await seedSession('someone-else', '2026-08-10')
    renderView(<WorkoutProgress />)

    expect(await screen.findByText(/no training logged yet/i)).toBeInTheDocument()
  })

  it('renders charts as inline SVG once there is data', async () => {
    await seedSession('pronit', '2026-08-10')
    const { container } = renderView(<WorkoutProgress />)
    await waitForData()

    expect(container.querySelectorAll('svg[viewBox]').length).toBeGreaterThan(0)
  })
})

describe('WorkoutProgress — the three views', () => {
  it('opens on Strength, with the other two closed but still mounted', async () => {
    await seedSession('pronit', '2026-08-10')
    const { container } = renderView(<WorkoutProgress />)
    await waitForData()

    const panels = [...container.querySelectorAll('.progress-panel')]
    expect(panels).toHaveLength(3)
    expect(panels.filter(p => p.getAttribute('data-open') === 'true')).toHaveLength(1)
  })

  it('keeps every closed view in the document, so printing gets the whole screen', async () => {
    // The Print button prints the page. Unmounting the closed views would have
    // quietly reduced a printed sheet to whichever tab happened to be open.
    await seedSession('pronit', '2026-08-10')
    const { container } = renderView(<WorkoutProgress />)
    await waitForData()

    const closed = [...container.querySelectorAll('.progress-panel[data-open="false"]')]
    expect(closed).toHaveLength(2)
    expect(closed.every(p => p.children.length > 0)).toBe(true)
  })

  it('moves the open view when another tab is pressed', async () => {
    const user = userEvent.setup()
    await seedSession('pronit', '2026-08-10')
    const { container } = renderView(<WorkoutProgress />)
    await waitForData()

    await user.click(screen.getByRole('button', { name: 'Workload' }))

    const open = container.querySelector('.progress-panel[data-open="true"]')!
    expect(within(open as HTMLElement).getByText(/plan vs actual/i)).toBeInTheDocument()
    expect(within(open as HTMLElement).queryByText(/personal records/i)).not.toBeInTheDocument()
  })
})

describe('StrengthTools — renders without crashing', () => {
  it('mounts all three calculator cards', () => {
    renderView(<StrengthTools />)
    expect(screen.getByText(/1-rep max & amrap/i)).toBeInTheDocument()
    expect(screen.getByText(/wilks & dots/i)).toBeInTheDocument()
    expect(screen.getByText(/^5\/3\/1$/i)).toBeInTheDocument()
  })

  it('labels the bodyweight-adjusted scores as estimates', () => {
    renderView(<StrengthTools />)
    expect(screen.getByText(/reference coefficients, not independently verified/i)).toBeInTheDocument()
  })
})
