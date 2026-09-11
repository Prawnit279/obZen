/**
 * The weight check, as the person meets it: asked for a goal first, then shown
 * a trend, a reading against that goal, and strength against bodyweight.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '@/db/dexie'
import type { WorkoutDaySession } from '@/db/dexie'
import { WeightCheckCard } from '@/components/modules/workout/progress/WeightCheckCard'
import { WeightGoalPicker } from '@/components/modules/workout/progress/WeightGoalPicker'
import { CheckInModal } from '@/components/modules/dashboard/CheckInModal'
import { useProgressStore } from '@/store/useProgressStore'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import { PROFILE_ID } from '@/config/profiles'
import { lbToKg, kgToLb } from '@/lib/progress'
import { todayISO } from '@/lib/utils'
import type { WeightGoal } from '@/lib/bodyweight'

beforeEach(async () => {
  localStorage.clear()
  useProgressStore.setState({ rungs: {}, bodyweight: {} })
  useProfileSettingsStore.getState().reset()
  await db.delete()
  await db.open()
})
afterEach(cleanup)

// ── Fixtures ─────────────────────────────────────────────────────────────────

const day = (n: number) => new Date(Date.UTC(2026, 7, 1 + n)).toISOString().slice(0, 10)

/** Daily weigh-ins in pounds, one per day from 2026-08-01. */
function weighIns(lbs: number[]) {
  useProgressStore.setState({
    bodyweight: { [PROFILE_ID]: lbs.map((lb, i) => ({ date: day(i), kg: lbToKg(lb) })) },
  })
}

function setGoal(goal: WeightGoal) {
  useProfileSettingsStore.setState({ weightGoal: goal })
}

function lift(date: string, exerciseId: string, weightLb: number): WorkoutDaySession {
  return {
    date, dayLabel: 'Day 1', profileId: PROFILE_ID,
    exercises: [{
      exerciseId, status: 'complete',
      sets: [{ setNumber: 1, weight: weightLb, reps: 1, unit: 'lbs', timestamp: `${date}T10:00:00.000Z` }],
    }],
    order: [exerciseId],
  }
}

function card(sessions: WorkoutDaySession[] = []) {
  return render(
    <WeightCheckCard
      profileId={PROFILE_ID}
      sessions={sessions}
      keyLiftIds={['barbell-squat', 'bench-press', 'deadlift']}
      fallbackKg={lbToKg(165)}
    />
  )
}

/** Three weeks gaining a steady 0.3 lb a week at ~165 lb: a lean gain. */
const leanGainWeeks = Array.from({ length: 22 }, (_, i) => 165 + (0.3 / 7) * i)

// ── The goal question ────────────────────────────────────────────────────────

describe('WeightGoalPicker', () => {
  it('asks for the goal before anything can be set', () => {
    render(<WeightGoalPicker current={null} bodyweightKg={lbToKg(165)} onChoose={vi.fn()} />)
    expect(screen.getByText(/what are you aiming for/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /set goal/i })).toBeDisabled()
  })

  it('asks how fast once building or cutting is chosen, in pounds at your weight', async () => {
    const user = userEvent.setup()
    render(<WeightGoalPicker current={null} bodyweightKg={lbToKg(165)} onChoose={vi.fn()} />)

    expect(screen.queryByRole('radiogroup', { name: /pace/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /build/i }))

    const pace = screen.getByRole('radiogroup', { name: /pace/i })
    // 0.1–0.25 % of 165 lb a week is 0.2–0.4 lb.
    expect(within(pace).getByRole('radio', { name: /lean · 0\.2–0\.4 lb a week/i })).toBeInTheDocument()
  })

  it('needs no pace for maintenance', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    render(<WeightGoalPicker current={null} bodyweightKg={lbToKg(165)} onChoose={onChoose} />)

    await user.click(screen.getByRole('radio', { name: /maintain/i }))
    await user.click(screen.getByRole('button', { name: /set goal/i }))
    expect(onChoose).toHaveBeenCalledWith({ direction: 'maintain' })
  })

  it('waits for a pace before a gain can be set, then reports both', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    render(<WeightGoalPicker current={null} bodyweightKg={lbToKg(165)} onChoose={onChoose} />)

    await user.click(screen.getByRole('radio', { name: /cut/i }))
    expect(screen.getByRole('button', { name: /set goal/i })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: /^steady/i }))
    await user.click(screen.getByRole('button', { name: /set goal/i }))
    expect(onChoose).toHaveBeenCalledWith({ direction: 'lose', pace: 'steady' })
  })

  it('marks the chosen options for assistive tech', async () => {
    const user = userEvent.setup()
    render(<WeightGoalPicker current={null} bodyweightKg={lbToKg(165)} onChoose={vi.fn()} />)
    const build = screen.getByRole('radio', { name: /build/i })

    expect(build).toHaveAttribute('aria-checked', 'false')
    await user.click(build)
    expect(build).toHaveAttribute('aria-checked', 'true')
  })

  it('offers cancel only when changing a goal that exists', () => {
    const { unmount } = render(<WeightGoalPicker current={null} bodyweightKg={undefined} onChoose={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    unmount()

    render(
      <WeightGoalPicker
        current={{ direction: 'maintain' }} bodyweightKg={undefined}
        onChoose={vi.fn()} onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update goal/i })).toBeEnabled()
  })

  it('falls back to a percentage when there is no weight to size it with', async () => {
    const user = userEvent.setup()
    render(<WeightGoalPicker current={null} bodyweightKg={undefined} onChoose={vi.fn()} />)
    await user.click(screen.getByRole('radio', { name: /build/i }))
    expect(screen.getAllByRole('radio', { name: /% of bodyweight a week/i })).toHaveLength(2)
  })
})

// ── The card ─────────────────────────────────────────────────────────────────

describe('WeightCheckCard', () => {
  it('asks for a goal first, and offers no verdict until it has one', () => {
    weighIns(leanGainWeeks)
    card()

    expect(screen.getByText(/what are you aiming for/i)).toBeInTheDocument()
    expect(screen.queryByText(/inside your|faster than|short of|opposite of/i)).not.toBeInTheDocument()
    // The trend is still drawn: weigh-ins count for DOTS whatever the goal.
    expect(screen.getByRole('img', { name: /bodyweight trend/i })).toBeInTheDocument()
  })

  it('stores the goal once chosen and swaps the question for it', async () => {
    const user = userEvent.setup()
    card()
    await user.click(screen.getByRole('radio', { name: /maintain/i }))
    await user.click(screen.getByRole('button', { name: /set goal/i }))

    expect(useProfileSettingsStore.getState().weightGoal).toEqual({ direction: 'maintain' })
    expect(screen.queryByText(/what are you aiming for/i)).not.toBeInTheDocument()
    expect(screen.getByText('Maintain')).toBeInTheDocument()
  })

  it('invites a first weigh-in rather than drawing an empty chart', () => {
    card()
    expect(screen.getByText(/log your weight to start a trend/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /bodyweight trend/i })).not.toBeInTheDocument()
  })

  it('leads with the trend weight, not the last reading', () => {
    // Flat at 165, then one heavy morning: the headline should barely move.
    weighIns([...Array(14).fill(165), 168])
    card()
    expect(screen.getByText(/^165\.\d$/)).toBeInTheDocument()
    expect(screen.getByText(/last weigh-in 168 lb/i)).toBeInTheDocument()
  })

  it('reads the trend against the goal once there is enough of it', () => {
    weighIns(leanGainWeeks)
    setGoal({ direction: 'gain', pace: 'gentle' })
    card()

    const reading = screen.getByText(/inside your lean gain pace/i)
    expect(reading).toHaveStyle({ color: 'var(--ok)' })
  })

  it('colours a reading that runs against the goal', () => {
    // A full pound a week up, on a cut: well outside the band that counts as
    // standing still, so it is the wrong way rather than merely slow.
    weighIns(Array.from({ length: 22 }, (_, i) => 165 + i / 7))
    setGoal({ direction: 'lose', pace: 'gentle' })
    card()
    expect(screen.getByText(/opposite of your goal/i)).toHaveStyle({ color: 'var(--red)' })
  })

  it('calls a small drift against the goal short of pace, not the opposite', () => {
    // 0.3 lb a week up on a cut is inside the standing-still band.
    weighIns(leanGainWeeks)
    setGoal({ direction: 'lose', pace: 'gentle' })
    card()
    const reading = screen.getByText(/short of your gentle cut pace/i)
    expect(reading).toHaveTextContent(/^gaining/i)
    expect(reading).toHaveStyle({ color: 'var(--caution)' })
  })

  it('says what a rate still needs instead of guessing one', () => {
    weighIns([165, 165.2])
    setGoal({ direction: 'maintain' })
    card()
    expect(screen.getByText(/a rate needs 4 weigh-ins across at least 10 days/i)).toBeInTheDocument()
  })

  it('logs a weigh-in for today, in kilos', async () => {
    const user = userEvent.setup()
    card()
    await user.type(screen.getByLabelText(/today's bodyweight in pounds/i), '166.4')
    await user.click(screen.getByRole('button', { name: /^log$/i }))

    const [entry] = useProgressStore.getState().getBodyweight(PROFILE_ID)
    expect(entry.date).toBe(todayISO())
    expect(kgToLb(entry.kg)).toBeCloseTo(166.4, 1)
  })

  it('refuses a slipped key and says why', async () => {
    const user = userEvent.setup()
    card()
    const input = screen.getByLabelText(/today's bodyweight in pounds/i)
    await user.type(input, '1664')
    await user.click(screen.getByRole('button', { name: /^log$/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/between 50 and 700 lb/i)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(useProgressStore.getState().getBodyweight(PROFILE_ID)).toEqual([])
  })

  it('compares the key lifts against bodyweight over the same weeks', () => {
    weighIns(leanGainWeeks)
    setGoal({ direction: 'gain', pace: 'gentle' })
    card([lift(day(0), 'deadlift', 300), lift(day(21), 'deadlift', 330)])

    expect(screen.getByText(/strength vs bodyweight/i)).toBeInTheDocument()
    expect(screen.getByText('Deadlift')).toBeInTheDocument()
    expect(screen.getByText(/\+30 lb/)).toBeInTheDocument()
  })

  it('leaves the comparison out until a lift has two sessions', () => {
    weighIns(leanGainWeeks)
    card([lift(day(21), 'deadlift', 330)])
    expect(screen.queryByText(/strength vs bodyweight/i)).not.toBeInTheDocument()
  })

  it('hides the old verdict while a new goal is being chosen', async () => {
    // A reading judged against the goal you are replacing would sit under the
    // question contradicting whatever you are about to pick.
    const user = userEvent.setup()
    weighIns(leanGainWeeks)
    setGoal({ direction: 'gain', pace: 'gentle' })
    card()
    expect(screen.getByText(/inside your lean gain pace/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /change/i }))
    expect(screen.queryByText(/inside your lean gain pace/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByText(/inside your lean gain pace/i)).toBeInTheDocument()
  })

  it('reopens the question to change the goal, and can back out of it', async () => {
    const user = userEvent.setup()
    setGoal({ direction: 'maintain' })
    card()

    await user.click(screen.getByRole('button', { name: /change/i }))
    expect(screen.getByText(/what are you aiming for/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText(/what are you aiming for/i)).not.toBeInTheDocument()
    expect(useProfileSettingsStore.getState().weightGoal).toEqual({ direction: 'maintain' })
  })
})

// ── Weighing in from the morning check-in ────────────────────────────────────

describe('check-in weight', () => {
  /** Returns `onClose`, which fires last — once the whole save has landed. */
  function checkIn() {
    const onClose = vi.fn()
    render(<CheckInModal open onClose={onClose} onSaved={vi.fn()} />)
    return onClose
  }

  it('logs the weight alongside the check-in', async () => {
    const user = userEvent.setup()
    const saved = checkIn()
    await user.type(screen.getByLabelText(/this morning's bodyweight/i), '165.8')
    await user.click(screen.getByRole('button', { name: /save check-in/i }))
    await waitFor(() => expect(saved).toHaveBeenCalled())

    const [entry] = useProgressStore.getState().getBodyweight(PROFILE_ID)
    expect(kgToLb(entry.kg)).toBeCloseTo(165.8, 1)
    expect(await db.checkIns.count()).toBe(1)
  })

  it('saves a check-in with no weight without inventing one', async () => {
    const user = userEvent.setup()
    const saved = checkIn()
    await user.click(screen.getByRole('button', { name: /save check-in/i }))
    await waitFor(() => expect(saved).toHaveBeenCalled())

    expect(await db.checkIns.count()).toBe(1)
    expect(useProgressStore.getState().getBodyweight(PROFILE_ID)).toEqual([])
  })

  it('stops the save on an unreadable weight rather than dropping it quietly', async () => {
    const user = userEvent.setup()
    checkIn()
    await user.type(screen.getByLabelText(/this morning's bodyweight/i), '16')
    await user.click(screen.getByRole('button', { name: /save check-in/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/between 50 and 700 lb/i)
    expect(await db.checkIns.count()).toBe(0)
  })

  it('shows today’s weigh-in if one is already logged', () => {
    useProgressStore.setState({ bodyweight: { [PROFILE_ID]: [{ date: todayISO(), kg: lbToKg(164.2) }] } })
    checkIn()
    expect(screen.getByLabelText(/this morning's bodyweight/i)).toHaveValue(164.2)
  })
})

// ── Where it lives ───────────────────────────────────────────────────────────

describe('on the Progress screen', () => {
  it('is there before a single workout has been logged', async () => {
    // Progress used to return early on an empty history. A weight-only user —
    // or anyone on day one — would never have seen the card.
    const { WorkoutProgress } = await import('@/components/modules/workout/progress/WorkoutProgress')
    render(<WorkoutProgress />)

    expect(await screen.findByText(/no training logged yet/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /weight check/i })).toBeInTheDocument()
  })
})
