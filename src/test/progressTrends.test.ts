import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import {
  e1rmTrend, weeksToGoal, stallCheck, prFeed, liftSignals,
  STALL_WEEKS, TM_RESET_FRACTION,
} from '@/lib/progressTrends'
import type { E1RMPoint } from '@/lib/progress'

// ── Fixtures ─────────────────────────────────────────────────────────────────

function pt(date: string, e1rm: number): E1RMPoint {
  return { date, e1rm }
}

function set(weight: number, reps: number, unit: LoggedSet['unit'] = 'kg'): LoggedSet {
  return { setNumber: 1, weight, reps, unit, timestamp: '2026-08-01T10:00:00.000Z' }
}

function session(date: string, exerciseId: string, sets: LoggedSet[]): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    exercises: [{ exerciseId, status: 'complete', sets }],
    order: [exerciseId],
  }
}

// ── Trend ────────────────────────────────────────────────────────────────────

describe('e1rmTrend', () => {
  it('measures a steady climb in kg per week', () => {
    // 10 kg over four weeks is 2.5 kg/week.
    const trend = e1rmTrend([
      pt('2026-08-03', 100), pt('2026-08-10', 102.5),
      pt('2026-08-17', 105), pt('2026-08-31', 110),
    ])!
    expect(trend.slopeKgPerWeek).toBeCloseTo(2.5, 4)
    expect(trend.latestKg).toBe(110)
    expect(trend.points).toBe(4)
    expect(trend.weeks).toBeCloseTo(4, 4)
  })

  it('reports a negative gradient when a lift is going backwards', () => {
    const trend = e1rmTrend([pt('2026-08-03', 120), pt('2026-08-17', 110)])!
    expect(trend.slopeKgPerWeek).toBeCloseTo(-5, 4)
  })

  it('is flat when nothing changed', () => {
    const trend = e1rmTrend([pt('2026-08-03', 100), pt('2026-08-17', 100)])!
    expect(trend.slopeKgPerWeek).toBeCloseTo(0, 6)
  })

  it('refuses to draw a direction through one point', () => {
    // A single session is a reading, not a trend.
    expect(e1rmTrend([pt('2026-08-03', 100)])).toBeNull()
    expect(e1rmTrend([])).toBeNull()
  })

  it('refuses when every session is the same day', () => {
    expect(e1rmTrend([pt('2026-08-03', 100), pt('2026-08-03', 110)])).toBeNull()
  })

  it('is not thrown off by an uneven session cadence', () => {
    // Same 2 kg/week line, sampled irregularly.
    const trend = e1rmTrend([
      pt('2026-08-03', 100), pt('2026-08-05', 100 + 2 * (2 / 7)),
      pt('2026-08-24', 106), pt('2026-08-31', 108),
    ])!
    expect(trend.slopeKgPerWeek).toBeCloseTo(2, 2)
  })
})

describe('weeksToGoal', () => {
  const climbing = e1rmTrend([pt('2026-08-03', 100), pt('2026-08-10', 105)])!

  it('divides the gap by the gradient', () => {
    // 105 now, +5/week, goal 120 -> 3 weeks.
    expect(weeksToGoal(climbing, 120)).toBeCloseTo(3, 4)
  })

  it('returns null once the goal is already met', () => {
    expect(weeksToGoal(climbing, 100)).toBeNull()
    expect(weeksToGoal(climbing, 105)).toBeNull()
  })

  it('will not project along a flat or falling line', () => {
    // Otherwise it prints a date the lift never arrives at.
    const falling = e1rmTrend([pt('2026-08-03', 120), pt('2026-08-10', 110)])!
    const flat = e1rmTrend([pt('2026-08-03', 100), pt('2026-08-10', 100)])!
    expect(weeksToGoal(falling, 150)).toBeNull()
    expect(weeksToGoal(flat, 150)).toBeNull()
  })
})

// ── Stall ────────────────────────────────────────────────────────────────────

describe('stallCheck', () => {
  it('flags a lift that has not beaten its best in four weeks', () => {
    const check = stallCheck([
      pt('2026-08-01', 140), pt('2026-08-08', 138),
      pt('2026-08-22', 139), pt('2026-08-29', 137),
    ])!
    expect(check.stalled).toBe(true)
    expect(check.weeksSincePeak).toBeCloseTo(4, 4)
    expect(check.peakKg).toBe(140)
    expect(check.peakDate).toBe('2026-08-01')
  })

  it('does not flag a lift that just set a record', () => {
    const check = stallCheck([
      pt('2026-08-01', 130), pt('2026-08-08', 135), pt('2026-08-29', 140),
    ])!
    expect(check.stalled).toBe(false)
    expect(check.weeksSincePeak).toBe(0)
  })

  it('measures from the peak to the last session, not to today', () => {
    // A long break is not a stall — only training that is not progressing is.
    const check = stallCheck([pt('2020-01-06', 100), pt('2020-01-13', 105)])!
    expect(check.weeksSincePeak).toBeCloseTo(0, 4)
    expect(check.stalled).toBe(false)
  })

  it('offers a training max at 90% of the peak', () => {
    const check = stallCheck([pt('2026-08-01', 200), pt('2026-09-19', 190)])!
    expect(check.stalled).toBe(true)
    expect(check.resetToKg).toBeCloseTo(200 * TM_RESET_FRACTION, 6)
    expect(TM_RESET_FRACTION).toBe(0.9)
  })

  it('needs two sessions before it will judge', () => {
    expect(stallCheck([pt('2026-08-01', 100)])).toBeNull()
    expect(stallCheck([])).toBeNull()
  })

  it('honours a custom window', () => {
    const points = [pt('2026-08-01', 140), pt('2026-08-15', 138)]
    expect(stallCheck(points, 1)!.stalled).toBe(true)
    expect(stallCheck(points, 8)!.stalled).toBe(false)
    expect(STALL_WEEKS).toBe(4)
  })
})

// ── PR feed ──────────────────────────────────────────────────────────────────

describe('prFeed', () => {
  it('reports each break, not each exercise', () => {
    // Three improving sessions is three records, where recentPRs gives one row.
    const feed = prFeed([
      session('2026-08-01', 'deadlift', [set(100, 5)]),
      session('2026-08-08', 'deadlift', [set(110, 5)]),
      session('2026-08-15', 'deadlift', [set(120, 5)]),
    ])
    const weights = feed.filter(e => e.kind === 'weight')
    expect(weights.map(e => e.valueKg)).toEqual([120, 110, 100])
  })

  it('is most recent first', () => {
    const feed = prFeed([
      session('2026-08-01', 'deadlift', [set(100, 5)]),
      session('2026-08-15', 'deadlift', [set(120, 5)]),
    ])
    expect(feed[0].date > feed[feed.length - 1].date).toBe(true)
  })

  it('carries what each record beat', () => {
    const feed = prFeed([
      session('2026-08-01', 'deadlift', [set(100, 5)]),
      session('2026-08-08', 'deadlift', [set(110, 5)]),
    ])
    const weights = feed.filter(e => e.kind === 'weight')
    expect(weights[0]).toMatchObject({ valueKg: 110, previousKg: 100, reps: 5 })
    expect(weights[1]).toMatchObject({ valueKg: 100, previousKg: null })
  })

  it('says nothing about a lift that never improved', () => {
    const feed = prFeed([
      session('2026-08-01', 'deadlift', [set(100, 5)]),
      session('2026-08-08', 'deadlift', [set(90, 5)]),
      session('2026-08-15', 'deadlift', [set(95, 5)]),
    ])
    // Only the first session, which set the opening record.
    expect(feed.filter(e => e.kind === 'weight')).toHaveLength(1)
  })

  it('counts an estimated-1RM break even when the bar was lighter', () => {
    // 100x5 estimates ~116.7; 95x8 estimates ~120.3 — more work, less weight.
    const feed = prFeed([
      session('2026-08-01', 'deadlift', [set(100, 5)]),
      session('2026-08-08', 'deadlift', [set(95, 8)]),
    ])
    const kinds = feed.map(e => e.kind)
    expect(kinds).toContain('e1rm')
    expect(feed.find(e => e.kind === 'e1rm')!.date).toBe('2026-08-08')
    // The lighter bar is not a weight record.
    expect(feed.filter(e => e.kind === 'weight' && e.date === '2026-08-08')).toHaveLength(0)
  })

  it('does not report the opening session twice', () => {
    // The first session sets both records; the weight row already says so.
    const feed = prFeed([session('2026-08-01', 'deadlift', [set(100, 5)])])
    expect(feed).toHaveLength(1)
    expect(feed[0].kind).toBe('weight')
  })

  it('never calls more assistance a weight record', () => {
    // On an assisted lift a bigger number is more help, not more work.
    const feed = prFeed([
      session('2026-08-01', 'assisted-pull-up', [set(20, 6)]),
      session('2026-08-08', 'assisted-pull-up', [set(40, 6)]),
    ], 70)
    expect(feed.filter(e => e.kind === 'weight')).toHaveLength(0)
  })

  it('never calls a longer hold a weight record', () => {
    // For a timed movement the reps field is seconds.
    const feed = prFeed([
      session('2026-08-01', 'plank', [set(0, 30)]),
      session('2026-08-08', 'plank', [set(0, 60)]),
    ])
    expect(feed.filter(e => e.kind === 'weight')).toHaveLength(0)
  })

  it('keeps lifts separate', () => {
    const feed = prFeed([
      session('2026-08-01', 'deadlift', [set(100, 5)]),
      session('2026-08-01', 'bench-press', [set(60, 5)]),
    ])
    expect(new Set(feed.map(e => e.exerciseId))).toEqual(new Set(['deadlift', 'bench-press']))
  })

  it('ignores placeholder rows', () => {
    const placeholder: LoggedSet = { setNumber: 1, weight: 0, reps: 0, unit: 'kg', timestamp: '' }
    expect(prFeed([session('2026-08-01', 'deadlift', [placeholder])])).toEqual([])
  })

  it('names the movement rather than printing its id', () => {
    const feed = prFeed([session('2026-08-01', 'deadlift', [set(100, 5)])])
    expect(feed[0].name).toBe('Deadlift')
  })
})

// ── Per-lift summary ─────────────────────────────────────────────────────────

describe('liftSignals', () => {
  const sessions = [
    session('2026-08-01', 'deadlift', [set(100, 5)]),
    session('2026-08-08', 'deadlift', [set(110, 5)]),
    session('2026-08-15', 'deadlift', [set(120, 5)]),
  ]

  it('returns a row per requested lift, in order', () => {
    const signals = liftSignals(sessions, ['deadlift', 'bench-press'])
    expect(signals.map(s => s.exerciseId)).toEqual(['deadlift', 'bench-press'])
    expect(signals[0].name).toBe('Deadlift')
  })

  it('carries a trend for a lift with history', () => {
    const [deadlift] = liftSignals(sessions, ['deadlift'])
    expect(deadlift.trend!.slopeKgPerWeek).toBeGreaterThan(0)
    expect(deadlift.stall!.stalled).toBe(false)
  })

  it('leaves trend and stall null for a lift never logged', () => {
    const [bench] = liftSignals(sessions, ['bench-press'])
    expect(bench.trend).toBeNull()
    expect(bench.stall).toBeNull()
  })
})
