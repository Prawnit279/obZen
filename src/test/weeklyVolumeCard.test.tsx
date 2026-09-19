/**
 * The weekly volume toggle.
 *
 * `weeklyVolume` and `fillWeeks` are tested in `progress.test.ts`. What is
 * pinned here is the thing the card decides: tonnage is stored in kilos and has
 * to be shown in pounds, while a set count is a count and must not be put
 * through the same conversion — a bug that would read as plausible numbers
 * rather than as an obvious fault.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeeklyVolumeCard } from '@/components/modules/workout/progress/WeeklyVolumeCard'
import { isoWeekKey, lbToKg } from '@/lib/progress'

afterEach(cleanup)

const TODAY = '2026-09-17'

const WEEK = isoWeekKey(TODAY)

/** 10,000 lb across 8 sets, in the week containing today. */
const volume = [{ week: WEEK, tonnageKg: lbToKg(10_000), sets: 8 }]
/** Of which 6,000 lb over 3 sets is main work and 4,000 lb over 5 is assistance. */
const main = [{ week: WEEK, tonnageKg: lbToKg(6_000), sets: 3 }]
const supplemental = [{ week: WEEK, tonnageKg: lbToKg(4_000), sets: 5 }]

function show(split = { main, supplemental }) {
  render(
    <WeeklyVolumeCard
      volume={volume}
      main={split.main}
      supplemental={split.supplemental}
      todayISO={TODAY}
    />
  )
  return {
    tonnage: screen.getByRole('button', { name: 'Tonnage' }),
    sets: screen.getByRole('button', { name: 'Sets' }),
  }
}

describe('WeeklyVolumeCard', () => {
  it('opens on tonnage, in pounds', () => {
    show()
    expect(screen.getByText(/10k lb/)).toBeInTheDocument()
  })

  it('switches to a plain set count with no unit', async () => {
    const { sets } = show()
    await userEvent.click(sets)
    expect(screen.getByText(/· 8$/)).toBeInTheDocument()
    expect(screen.queryByText(/lb/)).not.toBeInTheDocument()
  })

  it('does not run the set count through the weight conversion', async () => {
    // Eight sets is eight, not 17.6 — the number kilos-to-pounds would give.
    const { sets } = show()
    await userEvent.click(sets)
    expect(screen.queryByText(/17/)).not.toBeInTheDocument()
  })

  it('goes back to tonnage', async () => {
    const { tonnage, sets } = show()
    await userEvent.click(sets)
    await userEvent.click(tonnage)
    expect(screen.getByText(/10k lb/)).toBeInTheDocument()
  })
})

describe('the main/supplemental split', () => {
  it('breaks this week down once assistance has been marked', () => {
    show()
    expect(screen.getByText('6,000 lb')).toBeInTheDocument()
    expect(screen.getByText('4,000 lb')).toBeInTheDocument()
  })

  it('follows the toggle into set counts', async () => {
    const { sets } = show()
    await userEvent.click(sets)
    expect(screen.getByText('3 sets')).toBeInTheDocument()
    expect(screen.getByText('5 sets')).toBeInTheDocument()
  })

  it('stays away entirely when nothing has been marked supplemental', () => {
    // Every set is main work by definition until something is marked, and a
    // row reading "supplemental 0" would suggest the assistance had gone
    // missing rather than never having been distinguished.
    show({ main: volume, supplemental: [{ week: WEEK, tonnageKg: 0, sets: 0 }] })
    expect(screen.queryByText('Main work')).not.toBeInTheDocument()
    expect(screen.queryByText('Supplemental')).not.toBeInTheDocument()
  })

  it('keeps the breakdown through a week that carried no assistance', () => {
    // The case the test above cannot reach: assistance was marked in an
    // earlier week and none this one. Gating on the current week hid the whole
    // section — taking the real, non-zero main-work row with it — which on
    // Boring But Big happened every fourth week, since the deload drops the
    // five-by-ten by design.
    const PRIOR = isoWeekKey('2026-09-07')
    show({
      main: [
        { week: PRIOR, tonnageKg: lbToKg(5_000), sets: 4 },
        { week: WEEK, tonnageKg: lbToKg(6_000), sets: 3 },
      ],
      supplemental: [
        { week: PRIOR, tonnageKg: lbToKg(8_000), sets: 10 },
        { week: WEEK, tonnageKg: 0, sets: 0 },
      ],
    })
    expect(screen.getByText('Main work')).toBeInTheDocument()
    expect(screen.getByText('6,000 lb')).toBeInTheDocument()
    expect(screen.getByText('0 lb')).toBeInTheDocument()
  })

  it('shows the split under both toggles or neither, never one', async () => {
    // `everMarked` counts sets, which is metric-independent. Gating on the
    // displayed value would let the breakdown appear under Sets and vanish
    // under Tonnage for assistance that moved no measurable load.
    const { sets } = show({
      main,
      supplemental: [{ week: WEEK, tonnageKg: 0, sets: 5 }],
    })
    expect(screen.getByText('Supplemental')).toBeInTheDocument()
    await userEvent.click(sets)
    expect(screen.getByText('Supplemental')).toBeInTheDocument()
    expect(screen.getByText('5 sets')).toBeInTheDocument()
  })
})
