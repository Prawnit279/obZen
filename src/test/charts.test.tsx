/**
 * Tests for the Progress chart primitives.
 *
 * The lane chart draws several lifts at once, each on its own vertical scale.
 * That is only honest if the scale is stated, so most of what is asserted here
 * is that the numbers a reader would take off the chart are actually on it.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LineChart, monotoneCubic, liftHue, niceTicks } from '@/components/modules/workout/progress/Charts'

afterEach(cleanup)

// ── Fixtures ─────────────────────────────────────────────────────────────────

const squat = {
  label: 'Barbell Squat',
  points: [
    { date: '2026-05-11', value: 225 }, { date: '2026-05-25', value: 235 },
    { date: '2026-06-08', value: 215 }, { date: '2026-06-22', value: 240 },
    { date: '2026-09-06', value: 250 },
  ],
}
const deadlift = {
  label: 'Deadlift',
  points: [
    { date: '2026-06-22', value: 275 }, { date: '2026-08-17', value: 315 },
    { date: '2026-09-06', value: 320 },
  ],
}
const bench = { label: 'Bench Press', points: [{ date: '2026-08-03', value: 155 }] }

/** Every y in a path's coordinates — control points included. */
function pathYs(d: string): number[] {
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
  return nums.filter((_, i) => i % 2 === 1)
}

// ── monotoneCubic ────────────────────────────────────────────────────────────

describe('monotoneCubic', () => {
  it('never swings outside the values it was given', () => {
    // The point of replacing Catmull–Rom: its control points reached beyond the
    // data, drawing dips that never happened.
    const pts: [number, number][] = [[0, 20], [10, 10], [20, 30], [30, 5], [40, 25]]
    const ys = pathYs(monotoneCubic(pts))

    expect(Math.min(...ys)).toBeGreaterThanOrEqual(5)
    expect(Math.max(...ys)).toBeLessThanOrEqual(30)
  })

  it('holds a flat series flat', () => {
    const ys = pathYs(monotoneCubic([[0, 10], [10, 10], [20, 10], [30, 10]]))
    expect(ys.every(y => Math.abs(y - 10) < 1e-9)).toBe(true)
  })

  it('keeps a rising series rising', () => {
    const ys = pathYs(monotoneCubic([[0, 0], [10, 10], [20, 20], [30, 30]]))
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThanOrEqual(ys[i - 1])
  })

  it('emits a bare move for one point, and nothing for none', () => {
    expect(monotoneCubic([[5, 5]])).toBe('M5.0,5.0')
    expect(monotoneCubic([])).toBe('')
  })

  it('joins two points without inventing a curve between them', () => {
    const ys = pathYs(monotoneCubic([[0, 0], [10, 20]]))
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...ys)).toBeLessThanOrEqual(20)
  })

  it('survives points that share an x without emitting NaN', () => {
    // Two sessions on one date would otherwise divide by a zero run.
    const d = monotoneCubic([[0, 10], [0, 20], [10, 30]])
    expect(d).not.toMatch(/NaN|Infinity/)
  })

  it('emits no NaN for any of these shapes', () => {
    const shapes: [number, number][][] = [
      [[0, 0], [1, 1]],
      [[0, 5], [1, 5], [2, 5]],
      [[0, 0], [1, 100], [2, 0]],
    ]
    for (const s of shapes) expect(monotoneCubic(s)).not.toMatch(/NaN|Infinity/)
  })
})

// ── Lane chart ───────────────────────────────────────────────────────────────

describe('LineChart — several lifts', () => {
  it('names every lift on the chart itself', () => {
    render(<LineChart series={[squat, bench, deadlift]} />)
    for (const name of ['Barbell Squat', 'Bench Press', 'Deadlift']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('draws one axis whose gridlines cover the lifts on it', () => {
    const { container } = render(<LineChart series={[squat, deadlift]} />)
    // Axis labels only. The end-of-line value labels are also numbers, and
    // picking those up made this look like an axis with uneven spacing.
    const ticks = [...container.querySelectorAll('text[text-anchor="end"]')]
      .map(t => Number(t.textContent))
      .filter(n => Number.isFinite(n) && n > 100)
      .sort((a, b) => a - b)

    // Round gridlines sit inside the data rather than bracketing it — the
    // scale still pads, the labels no longer have to. What matters is that
    // they span most of it and read as round numbers.
    // Round gridlines, evenly spaced, covering most of the plotted range.
    // Here that is 220/240/260/280/300/320 — the exact step depends on the
    // data, so what is asserted is the property, not the numbers.
    expect(ticks.length).toBeGreaterThanOrEqual(3)
    expect(ticks.every(t => t % 10 === 0)).toBe(true)
    const gaps = ticks.slice(1).map((t, i) => t - ticks[i])
    expect(new Set(gaps).size).toBe(1)
    expect(Math.min(...ticks)).toBeLessThan(260)    // reaches down toward squat
    expect(Math.max(...ticks)).toBeGreaterThan(300) // and up toward deadlift
  })

  it('puts the same weight at the same height for every lift', () => {
    // The whole point of one axis. Two lifts that reach 300 must sit level;
    // under the old per-lift lanes they did not, which made the shapes
    // impossible to compare.
    const a = { label: 'Barbell Squat', points: [{ date: '2026-05-11', value: 200 }, { date: '2026-09-06', value: 300 }] }
    const b = { label: 'Deadlift', points: [{ date: '2026-05-11', value: 300 }, { date: '2026-09-06', value: 400 }] }
    const { container } = render(<LineChart series={[a, b]} />)

    const [squatPath, deadPath] = [...container.querySelectorAll('path')]
      .map(p => p.getAttribute('d') ?? '')
      .filter(d => d.includes('C'))

    const endY = (d: string) => pathYs(d)[pathYs(d).length - 1]
    const startY = (d: string) => pathYs(d)[0]

    // Squat ends at 300; deadlift starts at 300.
    expect(endY(squatPath)).toBeCloseTo(startY(deadPath), 1)
  })

  it('reports a single session as its value, not as a change of zero', () => {
    render(<LineChart series={[squat, bench, deadlift]} />)

    // The old legend showed "0" for a lift with one point, next to a table
    // saying there was not enough data — two claims, both about nothing.
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    expect(screen.getByText(/one session/i)).toBeInTheDocument()
  })

  it('shows the change for lifts that have one', () => {
    render(<LineChart series={[squat, deadlift]} />)
    expect(screen.getByText('+25')).toBeInTheDocument()  // squat 225 → 250
    expect(screen.getByText('+45')).toBeInTheDocument()  // deadlift 275 → 320
  })

  it('draws a line per lift, and no empty path for the lift that has none', () => {
    const { container } = render(<LineChart series={[squat, bench, deadlift]} />)
    const paths = [...container.querySelectorAll('path')]
      .map(p => p.getAttribute('d') ?? '')

    // Two lifts curve. The one-point lift gets a labelled mark and no path at
    // all — a bare `M` would render nothing while still sitting in the DOM.
    expect(paths.filter(d => d.includes('C'))).toHaveLength(2)
    expect(paths).toHaveLength(2)
    expect(paths.some(d => /^M[\d.,]+$/.test(d))).toBe(false)
  })

  it('emits no NaN geometry', () => {
    const { container } = render(<LineChart series={[squat, bench, deadlift]} />)
    container.querySelectorAll('svg *').forEach(el => {
      for (const attr of Array.from(el.attributes)) {
        expect(attr.value).not.toMatch(/NaN/)
      }
    })
  })

  it('keeps every line inside the plot area', () => {
    const { container } = render(<LineChart series={[squat, deadlift]} />)
    const ys = [...container.querySelectorAll('path')]
      .map(p => p.getAttribute('d') ?? '')
      .filter(d => d.includes('C'))
      .flatMap(pathYs)

    // MT (10) to the plot floor. Overshoot here would draw outside the frame.
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(10)
    expect(Math.max(...ys)).toBeLessThanOrEqual(142)
  })

  it('falls back to an empty state when nothing has points', () => {
    render(<LineChart series={[{ label: 'Squat', points: [] }]} />)
    expect(screen.getByText(/no data logged yet/i)).toBeInTheDocument()
  })
})

// ── Hues ─────────────────────────────────────────────────────────────────────

describe('liftHue', () => {
  it('keeps a lift on one colour wherever it appears', () => {
    expect(liftHue('Barbell Squat')).toBe(liftHue('Barbell Squat', 3))
  })

  it('separates the movement patterns', () => {
    expect(liftHue('Barbell Squat')).not.toBe(liftHue('Deadlift'))
    expect(liftHue('Bench Press')).not.toBe(liftHue('Deadlift'))
  })
})

// ── Area chart — the single-series form ──────────────────────────────────────

describe('LineChart — one lift', () => {
  it('draws an area with a labelled axis', () => {
    const { container } = render(<LineChart series={[squat]} yLabel="Estimated 1RM" />)

    expect(container.querySelector('path[fill="url(#areaFill)"]')).toBeTruthy()
    // Axis ticks are the point of this form: it has room for a real scale.
    expect(container.querySelectorAll('text').length).toBeGreaterThan(2)
  })

  it('keeps the curve inside the plotted range', () => {
    const { container } = render(<LineChart series={[squat]} />)
    const line = [...container.querySelectorAll('path')]
      .map(p => p.getAttribute('d') ?? '')
      .find(d => d.includes('C') && !d.includes('Z'))!

    const ys = pathYs(line)
    // The plot runs from MT (10) to H - MB (118); overshoot would break out.
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(10)
    expect(Math.max(...ys)).toBeLessThanOrEqual(118)
  })

  it('emits no NaN for a single logged session', () => {
    const { container } = render(<LineChart series={[bench]} />)
    container.querySelectorAll('svg *').forEach(el => {
      for (const attr of Array.from(el.attributes)) {
        expect(attr.value).not.toMatch(/NaN/)
      }
    })
  })

  it('renders a goal line when one is given', () => {
    render(<LineChart series={[squat]} goal={{ value: 300, label: 'Target' }} />)
    expect(screen.getByText('Target')).toBeInTheDocument()
  })
})

// ── Axis ticks ───────────────────────────────────────────────────────────────

describe('niceTicks', () => {
  it('lands on numbers a person would say', () => {
    // The complaint this replaced: a real squat range gave 212 / 324 / 436.
    const ticks = niceTicks(212, 436)
    expect(ticks.every(t => t % 50 === 0)).toBe(true)
    expect(ticks).toContain(250)
    expect(ticks).toContain(400)
  })

  it('stays inside the range it was given', () => {
    for (const [lo, hi] of [[212, 436], [0, 7], [95, 105], [1200, 4800]]) {
      for (const t of niceTicks(lo, hi)) {
        expect(t).toBeGreaterThanOrEqual(lo)
        expect(t).toBeLessThanOrEqual(hi)
      }
    }
  })

  it('spaces every tick equally', () => {
    const ticks = niceTicks(212, 436)
    const gaps = ticks.slice(1).map((t, i) => t - ticks[i])
    expect(new Set(gaps.map(g => Math.round(g * 1e6)))).toHaveProperty('size', 1)
  })

  it('gives roughly the number of lines asked for', () => {
    for (const [lo, hi] of [[0, 100], [212, 436], [1.2, 4.8], [990, 1010]]) {
      const n = niceTicks(lo, hi, 4).length
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(7)
    }
  })

  it('scales its step to the size of the numbers', () => {
    expect(niceTicks(0, 10).every(t => t % 2 === 0 || t % 5 === 0)).toBe(true)
    expect(niceTicks(0, 10000).every(t => t % 1000 === 0 || t % 2500 === 0)).toBe(true)
  })

  it('works on a ×BW axis, where the whole range is under three', () => {
    const ticks = niceTicks(0.8, 2.4)
    expect(ticks.length).toBeGreaterThanOrEqual(2)
    expect(ticks.every(t => Number.isFinite(t))).toBe(true)
  })

  it('does not divide by a flat or backwards range', () => {
    expect(niceTicks(5, 5)).toEqual([5])
    expect(niceTicks(10, 2)).toEqual([10])
    expect(niceTicks(NaN, 10)).toEqual([])
  })

  it('emits no floating-point dust', () => {
    for (const t of niceTicks(0.1, 0.9)) {
      expect(String(t)).not.toMatch(/\d{6,}/)
    }
  })
})

// ── Reading a number off the chart ───────────────────────────────────────────

describe('LineChart — reading values', () => {
  it('prints each lift’s current value beside its line', () => {
    render(<LineChart series={[squat, deadlift]} />)
    // 250 and 320 are the last points; they appear on the line and in the key.
    expect(screen.getAllByText('250').length).toBeGreaterThan(0)
    expect(screen.getAllByText('320').length).toBeGreaterThan(0)
  })

  it('shows the latest until a session is picked', () => {
    render(<LineChart series={[squat, deadlift]} />)
    expect(screen.getByText('Latest')).toBeInTheDocument()
    expect(screen.getByText(/tap the chart/i)).toBeInTheDocument()
  })

  it('reads a session when its column is tapped', async () => {
    const user = userEvent.setup()
    const { container } = render(<LineChart series={[squat, deadlift]} />)

    // The first column is 2026-05-11, where squat is 225 and deadlift untrained.
    await user.click(container.querySelectorAll('rect')[0])

    expect(screen.getByText('2026-05-11')).toBeInTheDocument()
    expect(screen.getByText('225')).toBeInTheDocument()
    expect(screen.getByText(/not trained/i)).toBeInTheDocument()
  })

  it('says a lift was not trained rather than showing it as zero', async () => {
    const user = userEvent.setup()
    const { container } = render(<LineChart series={[squat, deadlift]} />)
    await user.click(container.querySelectorAll('rect')[0])

    // Deadlift has no session on that date. Zero would read as a failed lift.
    expect(screen.getByText(/not trained/i)).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('goes back to the latest', async () => {
    const user = userEvent.setup()
    const { container } = render(<LineChart series={[squat, deadlift]} />)
    await user.click(container.querySelectorAll('rect')[0])
    await user.click(screen.getByRole('button', { name: /back to latest/i }))

    expect(screen.getByText('Latest')).toBeInTheDocument()
  })

  it('lets the same column close the reading it opened', async () => {
    const user = userEvent.setup()
    const { container } = render(<LineChart series={[squat, deadlift]} />)
    const column = container.querySelectorAll('rect')[0]

    await user.click(column)
    expect(screen.getByText('2026-05-11')).toBeInTheDocument()
    await user.click(column)
    expect(screen.getByText('Latest')).toBeInTheDocument()
  })

  it('gives every session a tap target', () => {
    const { container } = render(<LineChart series={[squat, deadlift]} />)
    const dates = new Set([...squat.points, ...deadlift.points].map(p => p.date))
    expect(container.querySelectorAll('rect')).toHaveLength(dates.size)
  })
})
