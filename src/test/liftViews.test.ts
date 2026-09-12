import { describe, it, expect } from 'vitest'
import type { WorkoutDaySession, LoggedSet } from '@/db/dexie'
import { rangeStart, liftPoints, LIFT_MEASURES, LIFT_RANGES, MEASURE_AXIS_LABEL } from '@/lib/liftViews'
import { weightTrend } from '@/lib/bodyweight'
import { lbToKg } from '@/lib/progress'

const TODAY = '2026-09-12'

function set(weightLb: number, reps: number): LoggedSet {
  return { setNumber: 1, weight: weightLb, reps, unit: 'lbs', timestamp: `${TODAY}T10:00:00.000Z` }
}

function session(date: string, exerciseId: string, sets: LoggedSet[]): WorkoutDaySession {
  return {
    date, dayLabel: 'Day 1', profileId: 'pronit',
    exercises: [{ exerciseId, status: 'complete', muscle: 'legs', sets }],
    order: [exerciseId],
  }
}

/** N days before today. */
function ago(days: number): string {
  const d = new Date(`${TODAY}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

const NO_TREND = weightTrend([])

// ── rangeStart ───────────────────────────────────────────────────────────────

describe('rangeStart', () => {
  it('counts back whole weeks and months', () => {
    expect(rangeStart('8w', TODAY)).toBe('2026-07-18')   // 56 days
    expect(rangeStart('6m', TODAY)).toBe('2026-03-13')   // 183 days
  })

  it('has no start at all for the full history', () => {
    expect(rangeStart('all', TODAY)).toBeNull()
  })

  it('crosses a year boundary without drifting', () => {
    expect(rangeStart('8w', '2026-01-10')).toBe('2025-11-15')
  })
})

// ── The measures ─────────────────────────────────────────────────────────────

describe('liftPoints', () => {
  // 225 on the bar plus a 45 lb bar, five reps.
  const sessions = [
    session(ago(60), 'barbell-squat', [set(200, 5)]),
    session(ago(20), 'barbell-squat', [set(225, 5), set(245, 3)]),
    session(ago(2), 'barbell-squat', [set(250, 5)]),
  ]

  it('reads estimated 1RM in pounds by default', () => {
    const pts = liftPoints(sessions, 'barbell-squat', 'e1rm', NO_TREND, 'all', TODAY)
    expect(pts).toHaveLength(3)
    // (250 + 45) × (1 + 5/30) = 344.2
    expect(pts[2].value).toBeCloseTo(344.2, 0)
  })

  it('reads the top set as what went on the bar, not a rep estimate', () => {
    const pts = liftPoints(sessions, 'barbell-squat', 'topSet', NO_TREND, 'all', TODAY)
    // The heaviest single set that day was 245 plates, so 290 on the bar — and
    // no Epley inflation on top of it.
    expect(pts[1].value).toBeCloseTo(290, 0)
  })

  it('reads ×BW against the bodyweight of each session’s own day', () => {
    const trend = weightTrend([
      { date: ago(70), kg: lbToKg(200) },
      { date: ago(1), kg: lbToKg(180) },
    ])
    const pts = liftPoints(sessions, 'barbell-squat', 'perBw', trend, 'all', TODAY)

    expect(pts).toHaveLength(3)
    // Lighter lifter, heavier lift — the ratio has to climb faster than the
    // pounds do, which is the whole reason this view exists.
    expect(pts[2].value).toBeGreaterThan(pts[0].value)
  })

  it('gives no ×BW reading at all when there is no weigh-in', () => {
    // A ratio against a bodyweight of zero is not a small number, it is a lie.
    expect(liftPoints(sessions, 'barbell-squat', 'perBw', NO_TREND, 'all', TODAY)).toEqual([])
  })

  it('re-bases percent change to the start of the window', () => {
    const all = liftPoints(sessions, 'barbell-squat', 'percent', NO_TREND, 'all', TODAY)
    expect(all[0].value).toBe(0)
    expect(all[2].value).toBeGreaterThan(0)

    // Inside 8 weeks the oldest session drops out, so the baseline moves with
    // it — the question is "lately", not "ever".
    const recent = liftPoints(sessions, 'barbell-squat', 'percent', NO_TREND, '8w', TODAY)
    expect(recent).toHaveLength(2)
    expect(recent[0].value).toBe(0)
    expect(recent[0].date).toBe(ago(20))
  })

  it('says nothing rather than dividing by a zero baseline', () => {
    const zero = [session(ago(5), 'plank', [set(0, 60)])]
    expect(liftPoints(zero, 'plank', 'percent', NO_TREND, 'all', TODAY)).toEqual([])
  })
})

// ── Ranges ───────────────────────────────────────────────────────────────────

describe('liftPoints — the window', () => {
  const sessions = [
    session(ago(300), 'deadlift', [set(300, 5)]),
    session(ago(100), 'deadlift', [set(315, 5)]),
    session(ago(10), 'deadlift', [set(330, 5)]),
  ]

  it('narrows to the last eight weeks', () => {
    expect(liftPoints(sessions, 'deadlift', 'e1rm', NO_TREND, '8w', TODAY)).toHaveLength(1)
  })

  it('widens to six months', () => {
    expect(liftPoints(sessions, 'deadlift', 'e1rm', NO_TREND, '6m', TODAY)).toHaveLength(2)
  })

  it('keeps everything on All', () => {
    expect(liftPoints(sessions, 'deadlift', 'e1rm', NO_TREND, 'all', TODAY)).toHaveLength(3)
  })

  it('leaves out sessions dated after today', () => {
    const withFuture = [...sessions, session('2027-01-01', 'deadlift', [set(400, 5)])]
    expect(liftPoints(withFuture, 'deadlift', 'e1rm', NO_TREND, 'all', TODAY)).toHaveLength(3)
  })
})

// ── Edges ────────────────────────────────────────────────────────────────────

describe('liftPoints — nothing to draw', () => {
  it('is empty for a lift never logged', () => {
    expect(liftPoints([], 'barbell-squat', 'e1rm', NO_TREND, 'all', TODAY)).toEqual([])
  })

  it('skips a session whose sets were never completed', () => {
    const placeholder: LoggedSet = { setNumber: 1, weight: 225, reps: 0, unit: 'lbs', timestamp: '' }
    const sessions = [session(ago(3), 'barbell-squat', [placeholder])]
    expect(liftPoints(sessions, 'barbell-squat', 'e1rm', NO_TREND, 'all', TODAY)).toEqual([])
  })

  it('returns points oldest first, whatever order the sessions arrive in', () => {
    const jumbled = [
      session(ago(2), 'barbell-squat', [set(250, 5)]),
      session(ago(40), 'barbell-squat', [set(200, 5)]),
      session(ago(20), 'barbell-squat', [set(225, 5)]),
    ]
    const dates = liftPoints(jumbled, 'barbell-squat', 'e1rm', NO_TREND, 'all', TODAY).map(p => p.date)
    expect(dates).toEqual([...dates].sort())
  })
})

describe('the offered choices', () => {
  it('names four measures and three ranges', () => {
    expect(LIFT_MEASURES.map(m => m.value)).toEqual(['e1rm', 'topSet', 'perBw', 'percent'])
    expect(LIFT_RANGES.map(r => r.value)).toEqual(['8w', '6m', 'all'])
  })

  it('describes every measure without repeating its unit', () => {
    // Composing a name and a unit gave "×BW in ×BW" — the chart's accessible
    // name, so the one place the duplication is least visible and most costly.
    for (const { value, label } of LIFT_MEASURES) {
      const axis = MEASURE_AXIS_LABEL[value]
      expect(axis).toBeTruthy()
      expect(axis).not.toMatch(new RegExp(`${label}\\s+in\\s+${label}`, 'i'))
      expect(axis.length).toBeGreaterThan(label.length)
    }
  })
})
