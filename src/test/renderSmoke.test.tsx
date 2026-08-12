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
import { render, screen, cleanup } from '@testing-library/react'
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

  it('hides powerlifting panels for Aishwarya and shows her bodyweight trend', async () => {
    useProfileStore.setState({ activeId: 'aishwarya' })
    await seedSession('aishwarya', '2026-08-10')
    renderView(<WorkoutProgress />)
    await waitForData()

    expect(screen.queryByText(/sbd total/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/dots \(est\.\)/i)).not.toBeInTheDocument()
    // Her panel set leads with bodyweight tracking instead.
    expect(screen.getByLabelText(/today's bodyweight/i)).toBeInTheDocument()
  })

  it('shows only the active profile\'s training', async () => {
    await seedSession('pronit', '2026-08-10')
    // Aishwarya has nothing logged, so her view must stay empty.
    useProfileStore.setState({ activeId: 'aishwarya' })
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
