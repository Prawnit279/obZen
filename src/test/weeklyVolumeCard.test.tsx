/**
 * The volume tracker.
 *
 * `volumeWeeks` has its own tests, and `weeklyVolume` is covered in
 * `progress.test.ts`. What is pinned here is what the card decides: that
 * tonnage is converted to pounds while a set count is not — a bug that would
 * read as plausible numbers rather than as an obvious fault — and that the
 * figures under the chart describe the week whose bar is lit rather than
 * always describing today.
 *
 * Sessions are built here rather than volume rows, because the card now derives
 * its own weeks. A fixture of pre-computed rows could disagree with what the
 * real pipeline produces and the test would never notice.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeeklyVolumeCard } from '@/components/modules/workout/progress/WeeklyVolumeCard'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'

afterEach(cleanup)

const TODAY = '2026-09-17'          // a Thursday
const LAST_WEEK = '2026-09-10'

/**
 * A set on a machine, so no bar weight is added and the arithmetic in these
 * tests stays the number written here.
 */
function set(weightLb: number, reps: number, supplemental = false): LoggedSet {
  return {
    setNumber: 1, weight: weightLb, reps, unit: 'lbs',
    timestamp: `${TODAY}T10:00:00.000Z`,
    ...(supplemental ? { isSupplemental: true } : {}),
  }
}

function session(date: string, sets: LoggedSet[]): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    exercises: [{ exerciseId: 'leg-press', status: 'complete', sets }],
    order: ['leg-press'],
  } as WorkoutDaySession
}

/** 1,000 lb of main work over 2 sets, plus 500 lb of assistance over 5. */
const thisWeek = session(TODAY, [
  set(250, 2), set(250, 2),
  ...Array.from({ length: 5 }, () => set(20, 5, true)),
])

function show(sessions: WorkoutDaySession[] = [thisWeek]) {
  render(<WeeklyVolumeCard sessions={sessions} bodyweightKg={0} todayISO={TODAY} />)
  return {
    tonnage: screen.getByRole('button', { name: 'Tonnage' }),
    sets: screen.getByRole('button', { name: 'Sets' }),
    eightWeeks: screen.getByRole('button', { name: '8 weeks' }),
    sixMonths: screen.getByRole('button', { name: '6 months' }),
  }
}

describe('reading a week', () => {
  it('opens on tonnage, in pounds, and names the week it is showing', () => {
    show()
    expect(screen.getByText(/Week of 14 Sep/)).toBeInTheDocument()
    expect(screen.getByText('1,500 lb')).toBeInTheDocument()   // 1,000 main + 500 assistance
  })

  it('switches to a plain set count with no unit on it', async () => {
    const { sets } = show()
    await userEvent.click(sets)
    expect(screen.getByText('7 sets')).toBeInTheDocument()
  })

  it('does not run the set count through the weight conversion', async () => {
    // Seven sets is seven, not the number a kilos-to-pounds pass would give.
    const { sets } = show()
    await userEvent.click(sets)
    expect(screen.queryByText(/15 sets|1,500 sets/)).not.toBeInTheDocument()
  })

  it('goes back to tonnage', async () => {
    const { tonnage, sets } = show()
    await userEvent.click(sets)
    await userEvent.click(tonnage)
    expect(screen.getByText('1,500 lb')).toBeInTheDocument()
  })

  it('says nothing at all before anything has been logged', () => {
    // Rendered directly: the empty card carries no toggles, so the helper's
    // lookups would fail before the assertion did.
    render(<WeeklyVolumeCard sessions={[]} bodyweightKg={0} todayISO={TODAY} />)
    expect(screen.getByText(/nothing logged yet/i)).toBeInTheDocument()
    expect(screen.queryByText(/Week of/)).not.toBeInTheDocument()
  })
})

describe('previous weeks', () => {
  const twoWeeks = [session(LAST_WEEK, [set(100, 2)]), thisWeek]

  it('opens on the most recent week that was actually trained', () => {
    show(twoWeeks)
    expect(screen.getByText(/Week of 14 Sep/)).toBeInTheDocument()
  })

  it('moves the whole readout to a week whose bar is tapped', async () => {
    // The point of the change: the figures used to be pinned to today no
    // matter which bar was lit, so the history had no numbers attached to it.
    show(twoWeeks)
    const bar = screen.getByRole('button', { name: /^W37: 200 lb$/ })
    await userEvent.click(bar)

    expect(screen.getByText(/Week of 7 Sep/)).toBeInTheDocument()
    expect(screen.queryByText(/Week of 14 Sep/)).not.toBeInTheDocument()
    // The figure moves with the label. It appears twice — once as the bar's
    // own accessible name, once in the readout — so both are expected.
    expect(screen.getAllByText(/200 lb/).length).toBeGreaterThan(0)
  })

  it('compares a week against the one before it', async () => {
    show(twoWeeks)
    // 1,500 this week against 200 last week.
    expect(screen.getByText('+1,300 lb')).toBeInTheDocument()
  })

  it('offers no comparison for the first week in view', async () => {
    // Nothing behind it to compare against, so the row is absent rather than
    // reading as a gain from zero.
    show(twoWeeks)
    const first = screen.getByRole('button', { name: /^W31: 0 lb$/ })
    await userEvent.click(first)
    expect(screen.queryByText(/vs the week before/)).not.toBeInTheDocument()
  })

  it('reaches further back when asked to', async () => {
    const old = session('2026-06-11', [set(300, 3)])
    const { sixMonths } = show([old, thisWeek])

    // Outside the eight-week window, so its bar is not drawn at first.
    expect(screen.queryByRole('button', { name: /900 lb/ })).not.toBeInTheDocument()
    await userEvent.click(sixMonths)
    expect(screen.getByRole('button', { name: /900 lb/ })).toBeInTheDocument()
  })

  it('drops a selection when the range changes under it', async () => {
    // Index three of eight weeks and index three of six months are different
    // weeks; carrying the selection over would move the reader silently.
    const { sixMonths } = show(twoWeeks)
    await userEvent.click(screen.getByRole('button', { name: /^W37: 200 lb$/ }))
    expect(screen.getByText(/Week of 7 Sep/)).toBeInTheDocument()

    await userEvent.click(sixMonths)
    expect(screen.getByText(/Week of 14 Sep/)).toBeInTheDocument()
  })
})

describe('the main/supplemental split', () => {
  it('breaks the shown week down once assistance has been marked', () => {
    show()
    expect(screen.getByText('Main work')).toBeInTheDocument()
    expect(screen.getByText('1,000 lb')).toBeInTheDocument()
    expect(screen.getByText('500 lb')).toBeInTheDocument()
  })

  it('follows the toggle into set counts', async () => {
    const { sets } = show()
    await userEvent.click(sets)
    expect(screen.getByText('2 sets')).toBeInTheDocument()
    expect(screen.getByText('5 sets')).toBeInTheDocument()
  })

  it('stays away entirely when nothing has been marked supplemental', () => {
    // Every set is main work by definition until something is marked, and a
    // row reading "supplemental 0" would suggest the assistance had gone
    // missing rather than never having been distinguished.
    show([session(TODAY, [set(250, 2)])])
    expect(screen.queryByText('Main work')).not.toBeInTheDocument()
    expect(screen.queryByText('Supplemental')).not.toBeInTheDocument()
  })

  it('keeps the breakdown through a week that carried no assistance', () => {
    // Assistance marked in an earlier week and none in this one. Gating on the
    // shown week would hide the whole section — taking the real, non-zero
    // main-work row with it — which on Boring But Big happens every fourth
    // week, since the deload drops the five-by-ten by design.
    show([
      session(LAST_WEEK, [set(100, 2), set(20, 5, true)]),
      session(TODAY, [set(250, 2)]),
    ])
    expect(screen.getByText('Main work')).toBeInTheDocument()
    expect(screen.getByText('Supplemental')).toBeInTheDocument()
    expect(screen.getByText('0 lb')).toBeInTheDocument()
  })
})
