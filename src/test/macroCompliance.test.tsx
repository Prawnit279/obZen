/**
 * Seven days of macros, each against the targets that applied to it.
 *
 * The chart used to score every day in its window against *today's* targets,
 * because the training-day flag it needed was read from a store holding one
 * value rather than from each day's own record. Every `nutritionLog` has
 * carried `isTrainingDay` since the table was written — it is a required field
 * — so the information was there and simply unread. A rest day sitting beside
 * a training day was measured against training-day numbers and read as a
 * shortfall it never was.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { MacroComplianceChart } from '@/components/modules/nutrition/MacroComplianceChart'
import { db } from '@/db/dexie'
import { PITTA_NUTRITION } from '@/data/ayurveda'

const COLORS = { protein: 'var(--ok)', carbs: 'var(--ink-2)', fat: 'var(--ink-dim)' }

/** A day's log, with the flag it was recorded under. */
async function logDay(daysAgo: number, isTrainingDay: boolean, carbs: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  await db.nutritionLogs.add({
    date: d.toISOString().slice(0, 10),
    isTrainingDay,
    meals: [],
    totalProtein: 140,
    totalCarbs: carbs,
    totalFat: 55,
    totalCalories: 2400,
  })
}

function show() {
  render(
    <MacroComplianceChart
      trainingTargets={PITTA_NUTRITION.trainingDay}
      restTargets={PITTA_NUTRITION.restDay}
      colors={COLORS}
    />
  )
}

/**
 * The heights of the carbs bars only, left to right.
 *
 * Filtered by fill, because every day draws three bars and the natural spread
 * between protein, carbs and fat is enough variety to make a test that looks
 * at all of them pass no matter which targets were used. That is what the
 * first version of this helper did, and all four mutations survived it.
 */
function carbBarHeights(): number[] {
  return [...document.querySelectorAll('rect')]
    .filter(r => r.getAttribute('fill') === COLORS.carbs)
    .map(r => Number(r.getAttribute('height')))
}

beforeEach(async () => {
  await db.delete()
  await db.open()
})
afterEach(cleanup)

describe('MacroComplianceChart', () => {
  it('says so when the week holds nothing', async () => {
    show()
    expect(await screen.findByText(/no nutrition data this week/i)).toBeInTheDocument()
  })

  it('scores a rest day against rest-day targets, not today’s', async () => {
    // The same 240 g of carbs is most of a rest day's 240 ceiling and well
    // short of a training day's 320. Logged twice, one under each flag, the
    // two bars must differ — reading both against one set would make them
    // identical, which is exactly the bug.
    await logDay(3, false, 240)
    await logDay(1, true, 240)
    show()

    await waitFor(() => expect(carbBarHeights()).toHaveLength(2))
    const [rest, training] = carbBarHeights()
    expect(rest).not.toBe(training)
  })

  it('reads a rest day as nearer its target than a training day on the same food', async () => {
    await logDay(3, false, 240)   // 240 of 240 — at the ceiling
    await logDay(1, true, 240)    // 240 of 320 — three quarters
    show()

    // Left to right is oldest to newest: the rest day is first.
    await waitFor(() => expect(carbBarHeights()).toHaveLength(2))
    const [rest, training] = carbBarHeights()
    expect(rest).toBeGreaterThan(training)
  })

  it('draws nothing for a day with no log', async () => {
    await logDay(1, true, 240)
    show()
    // One logged day draws one carbs bar; the other six days draw none.
    await waitFor(() => expect(carbBarHeights()).toHaveLength(1))
  })
})
