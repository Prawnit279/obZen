/**
 * Tests for the Progress chart primitives.
 *
 * The lane chart draws several lifts at once, each on its own vertical scale.
 * That is only honest if the scale is stated, so most of what is asserted here
 * is that the numbers a reader would take off the chart are actually on it.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { LineChart, monotoneCubic, liftHue } from '@/components/modules/workout/progress/Charts'

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

  it('states each lane’s range, so the vertical scale can be read', () => {
    // Without this the lanes are unlabelled and self-normalised: a lift that
    // moved 10 lb draws the same shape as one that moved 100.
    render(<LineChart series={[squat, deadlift]} />)

    expect(screen.getByText('250')).toBeInTheDocument()  // squat max
    expect(screen.getByText('215')).toBeInTheDocument()  // squat min
    expect(screen.getByText('320')).toBeInTheDocument()  // deadlift max
    expect(screen.getByText('275')).toBeInTheDocument()  // deadlift min
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
    expect(screen.getByText('+25 lb')).toBeInTheDocument()  // squat 225 → 250
    expect(screen.getByText('+45 lb')).toBeInTheDocument()  // deadlift 275 → 320
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

  it('keeps every lane’s drawing inside its own lane', () => {
    // Overshoot used to let one lift's curve bleed into the lane below it.
    const { container } = render(<LineChart series={[squat, deadlift]} />)
    const paths = [...container.querySelectorAll('path')]
      .map(p => p.getAttribute('d') ?? '')
      .filter(d => d.includes('C'))

    const bands = paths.map(d => {
      const ys = pathYs(d)
      return { lo: Math.min(...ys), hi: Math.max(...ys) }
    }).sort((a, b) => a.lo - b.lo)

    expect(bands).toHaveLength(2)
    expect(bands[0].hi).toBeLessThan(bands[1].lo) // no overlap between lanes
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
