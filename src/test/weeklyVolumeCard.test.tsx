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

/** 10,000 lb across 8 sets, in the week containing today. */
const volume = [{ week: isoWeekKey(TODAY), tonnageKg: lbToKg(10_000), sets: 8 }]

function show() {
  render(<WeeklyVolumeCard volume={volume} todayISO={TODAY} />)
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
