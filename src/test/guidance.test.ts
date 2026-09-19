/**
 * The guidance readings.
 *
 * Every tip here is arithmetic over things the app already records — sessions
 * logged, days planned, questions answered, flags set. None of them prescribes
 * training, and that is the line this file exists to hold: a tip may say a
 * number is missing or stale, and may point at a feature that cannot work
 * without it, but it must never supply a percentage, a set count or a weight.
 *
 * The second rule is silence. A reading with nothing behind it produces no tip
 * rather than a cautious one — the whole point of the hedging convention is
 * that an absent number stays absent instead of becoming a default the reader
 * cannot see.
 */
import { describe, it, expect } from 'vitest'
import { guidance, MIN_PLANNED_FOR_ADHERENCE, STALE_WEIGH_IN_WEEKS } from '@/lib/guidance'
import type { GuidanceReading } from '@/lib/guidance'
import type { WorkoutDaySession } from '@/db/dexie'
import type { IntakeAnswers } from '@/lib/intake'
import type { ActiveBlock } from '@/store/useBlockStore'

const TODAY = '2026-09-18'

/** Nothing logged, nothing answered, no block — the silent base case. */
function reading(over: Partial<GuidanceReading> = {}): GuidanceReading {
  return {
    settings: { trainingDays: 4, weightGoal: null },
    answers: {},
    block: null,
    sessions: [],
    lastWeighInISO: null,
    adherence: { weeks: [], trained: 0, planned: 0, extra: 0 },
    load: { acute: 0, chronic: 0, ratio: null, verdict: 'unknown', ratedSessions: 0 },
    todayISO: TODAY,
    ...over,
  }
}

const ids = (r: GuidanceReading) => guidance(r).map(t => t.id)

/** A session with one squat set, optionally flagged. */
function squatDay(date: string, flags: Partial<{ isAmrap: boolean }> = {}): WorkoutDaySession {
  return {
    date,
    dayLabel: 'Day 1',
    profileId: 'pronit',
    order: ['barbell-squat'],
    exercises: [{
      exerciseId: 'barbell-squat',
      status: 'complete',
      sets: [{
        setNumber: 1, weight: 225, reps: 5,
        unit: 'lbs', timestamp: `${date}T10:00:00.000Z`, ...flags,
      }],
    }],
  } as WorkoutDaySession
}

const block: ActiveBlock = {
  programId: 'five-three-one',
  templateId: null,
  startedOn: '2026-09-07',
  trainingMaxLb: { 'barbell-squat': 315 },
}

// ── Silence ──────────────────────────────────────────────────────────────────

describe('a reading with nothing behind it', () => {
  it('produces no tips at all rather than cautious ones', () => {
    expect(guidance(reading())).toEqual([])
  })

  it('stays silent on adherence until enough days have been planned', () => {
    // One missed week is not a pattern, and calling it one would train the
    // reader to ignore the card.
    const barely = reading({
      adherence: { weeks: [], trained: 1, planned: MIN_PLANNED_FOR_ADHERENCE - 1, extra: 0 },
    })
    expect(ids(barely)).not.toContain('under-plan')
  })

  it('says nothing about a stale weigh-in when no goal is set', () => {
    // Without a goal there is nothing the old weight is making wrong.
    const noGoal = reading({ lastWeighInISO: '2026-01-01' })
    expect(ids(noGoal)).not.toContain('stale-weigh-in')
  })
})

// ── Training against the plan ────────────────────────────────────────────────

describe('plan against actual', () => {
  const missing = reading({
    adherence: { weeks: [], trained: 9, planned: 24, extra: 0 },
  })

  it('names the gap once there is enough of a window to mean something', () => {
    const tip = guidance(missing).find(t => t.id === 'under-plan')!
    expect(tip).toBeDefined()
    expect(tip.basis).toMatch(/9 of 24/)
  })

  it('offers both ways out, not just training more', () => {
    // Lowering the setting is a real answer — a plan nobody follows is worse
    // than a smaller plan that gets done.
    const tip = guidance(missing).find(t => t.id === 'under-plan')!
    expect(tip.action).toMatch(/fewer days|lower/i)
  })

  it('reports the figure it actually judged on', () => {
    // The threshold counts trained + extra; printing `trained` alone meant the
    // tip could fire on eleven sessions and report eight, so the reader could
    // not reproduce the decision from the line meant to justify it.
    const withExtra = reading({
      adherence: { weeks: [], trained: 8, planned: 24, extra: 3 },
    })
    const tip = guidance(withExtra).find(t => t.id === 'under-plan')!
    expect(tip).toBeDefined()
    expect(tip.basis).toMatch(/11 in all/)
    expect(tip.basis).toMatch(/3 unplanned/)
  })

  it('leaves the basis plain when nothing was unplanned', () => {
    const tip = guidance(missing).find(t => t.id === 'under-plan')!
    expect(tip.basis).toMatch(/^9 of 24 planned sessions over the window/)
    expect(tip.basis).not.toMatch(/unplanned|in all/)
  })

  it('says nothing when the plan is being kept', () => {
    const kept = reading({ adherence: { weeks: [], trained: 22, planned: 24, extra: 0 } })
    expect(ids(kept)).not.toContain('under-plan')
  })

  it('counts unplanned sessions as credit, never against', () => {
    // Training more than planned must not read as being off-plan.
    const extra = reading({ adherence: { weeks: [], trained: 12, planned: 24, extra: 10 } })
    expect(ids(extra)).not.toContain('under-plan')
  })
})

// ── Features that need a flag ────────────────────────────────────────────────

describe('flags the block depends on', () => {
  const trainedUnflagged = reading({
    block,
    sessions: [squatDay('2026-09-08'), squatDay('2026-09-15')],
  })

  it('points out that no top set has been flagged', () => {
    const tip = guidance(trainedUnflagged).find(t => t.id === 'no-amrap-flagged')!
    expect(tip).toBeDefined()
    expect(tip.action).toMatch(/reps/i)     // names the control that sets it
  })

  it('goes quiet as soon as one is flagged', () => {
    const flagged = reading({
      block,
      sessions: [squatDay('2026-09-08'), squatDay('2026-09-15', { isAmrap: true })],
    })
    expect(ids(flagged)).not.toContain('no-amrap-flagged')
  })

  it('says nothing without a block, since there is no week to compare against', () => {
    const noBlock = reading({ sessions: [squatDay('2026-09-08')] })
    expect(ids(noBlock)).not.toContain('no-amrap-flagged')
  })

  it('says nothing before anything has been logged under the block', () => {
    // Nothing to have flagged yet is not a mistake.
    expect(ids(reading({ block }))).not.toContain('no-amrap-flagged')
  })

  it('does not count training that predates the block', () => {
    // A block started on Monday cannot be judged by the sessions before it.
    // Without this the tip fires on history that was never under the block at
    // all, and its count is wrong even when the tip is right.
    const onlyBefore = reading({ block, sessions: [squatDay('2026-09-01')] })
    expect(ids(onlyBefore)).not.toContain('no-amrap-flagged')
  })

  it('counts only the sessions since the block began', () => {
    const mixed = reading({
      block,
      sessions: [squatDay('2026-09-01'), squatDay('2026-09-02'), squatDay('2026-09-08')],
    })
    const tip = guidance(mixed).find(t => t.id === 'no-amrap-flagged')!
    expect(tip.basis).toMatch(/^1 session logged/)
  })

  it('ignores a flag set before the block began', () => {
    // Flagged history from a previous block does not make this one readable.
    const oldFlag = reading({
      block,
      sessions: [squatDay('2026-09-01', { isAmrap: true }), squatDay('2026-09-08')],
    })
    expect(ids(oldFlag)).toContain('no-amrap-flagged')
  })
})

// ── A lift the block cannot prescribe ────────────────────────────────────────

describe('a trained lift with no training max', () => {
  it('names the lift the block is silent about', () => {
    const benched = reading({
      block,
      sessions: [{
        ...squatDay('2026-09-08'),
        order: ['bench-press'],
        exercises: [{
          exerciseId: 'bench-press',
          status: 'complete',
          sets: [{ setNumber: 1, weight: 185, reps: 5, unit: 'lbs', timestamp: '2026-09-08T10:00:00.000Z' }],
        }],
      } as WorkoutDaySession],
    })
    const tip = guidance(benched).find(t => t.id === 'block-lift-missing-tm')!
    expect(tip).toBeDefined()
    expect(tip.headline).toMatch(/bench/i)
  })

  it('does not name a lift that already has one', () => {
    const squatted = reading({ block, sessions: [squatDay('2026-09-08')] })
    expect(ids(squatted)).not.toContain('block-lift-missing-tm')
  })

  it('does not name a lift that has never been trained', () => {
    // Suggesting a training max for a lift nobody does would be noise.
    const tips = guidance(reading({ block, sessions: [squatDay('2026-09-08')] }))
    expect(tips.some(t => /deadlift/i.test(t.headline))).toBe(false)
  })
})

// ── The questionnaire ────────────────────────────────────────────────────────

describe('an unfinished questionnaire', () => {
  it('calls the match provisional and says how far through it is', () => {
    const answers: IntakeAnswers = { 'primary-goal': { kind: 'single', value: 'strength' } }
    const tip = guidance(reading({ answers })).find(t => t.id === 'intake-incomplete')!
    expect(tip).toBeDefined()
    expect(tip.basis).toMatch(/1 of 20/)
  })

  it('says nothing when none of it has been started', () => {
    // An untouched questionnaire is not an unfinished one, and the app worked
    // without it before.
    expect(ids(reading())).not.toContain('intake-incomplete')
  })
})

// ── Recovery against load ────────────────────────────────────────────────────

describe('recovery against this week’s load', () => {
  const lowRecovery: IntakeAnswers = {
    sleep: { kind: 'single', value: 'under-5' },
    'life-stress': { kind: 'single', value: 'high' },
    soreness: { kind: 'scale', value: 5 },
  }

  it('speaks only when both halves agree', () => {
    const both = reading({
      answers: lowRecovery,
      load: { acute: 9, chronic: 4, ratio: 2.1, verdict: 'spike', ratedSessions: 6 },
    })
    const tip = guidance(both).find(t => t.id === 'recovery-vs-load')!
    expect(tip).toBeDefined()
    expect(tip.basis).toMatch(/sleep|stress|recovery/i)
  })

  it('stays quiet on low recovery alone', () => {
    const recoveryOnly = reading({ answers: lowRecovery })
    expect(ids(recoveryOnly)).not.toContain('recovery-vs-load')
  })

  it('stays quiet on a load spike alone', () => {
    const loadOnly = reading({
      load: { acute: 9, chronic: 4, ratio: 2.1, verdict: 'spike', ratedSessions: 6 },
    })
    expect(ids(loadOnly)).not.toContain('recovery-vs-load')
  })

  it('never prescribes a number, only points at the lighter option', () => {
    const both = reading({
      answers: lowRecovery,
      load: { acute: 9, chronic: 4, ratio: 2.1, verdict: 'spike', ratedSessions: 6 },
    })
    const tip = guidance(both).find(t => t.id === 'recovery-vs-load')!
    expect(`${tip.headline} ${tip.action}`).not.toMatch(/\d+\s*%|\d+\s*lb|\d+×\d+/)
  })
})

// ── Bodyweight going stale ───────────────────────────────────────────────────

describe('a stale weigh-in', () => {
  const goal = { direction: 'lose' as const, pace: 'steady' as const }

  it('speaks once the weight behind the goal is old enough to mislead', () => {
    const stale = reading({
      settings: { trainingDays: 4, weightGoal: goal },
      lastWeighInISO: '2026-07-01',
    })
    const tip = guidance(stale).find(t => t.id === 'stale-weigh-in')!
    expect(tip).toBeDefined()
    expect(tip.basis).toMatch(/weeks/)
  })

  it('stays quiet while the weight is current', () => {
    const fresh = reading({
      settings: { trainingDays: 4, weightGoal: goal },
      lastWeighInISO: '2026-09-15',
    })
    expect(ids(fresh)).not.toContain('stale-weigh-in')
  })

  it('asks for a first weigh-in rather than calling nothing stale', () => {
    const never = reading({ settings: { trainingDays: 4, weightGoal: goal }, lastWeighInISO: null })
    expect(ids(never)).toContain('no-weigh-in')
    expect(ids(never)).not.toContain('stale-weigh-in')
  })

  it('uses the threshold it documents', () => {
    const justInside = new Date(Date.UTC(2026, 8, 18) - (STALE_WEIGH_IN_WEEKS - 1) * 7 * 86_400_000)
    const fresh = reading({
      settings: { trainingDays: 4, weightGoal: goal },
      lastWeighInISO: justInside.toISOString().slice(0, 10),
    })
    expect(ids(fresh)).not.toContain('stale-weigh-in')
  })
})

// ── The shape of every tip ───────────────────────────────────────────────────

describe('every tip, whatever it says', () => {
  const everything = reading({
    settings: { trainingDays: 4, weightGoal: { direction: 'lose', pace: 'steady' } },
    answers: {
      'primary-goal': { kind: 'single', value: 'strength' },
      sleep: { kind: 'single', value: 'under-5' },
      'life-stress': { kind: 'single', value: 'high' },
    },
    block,
    sessions: [squatDay('2026-09-08'), squatDay('2026-09-15')],
    lastWeighInISO: '2026-06-01',
    adherence: { weeks: [], trained: 9, planned: 24, extra: 0 },
    load: { acute: 9, chronic: 4, ratio: 2.1, verdict: 'spike', ratedSessions: 6 },
  })

  it('finds several at once without repeating itself', () => {
    const found = guidance(everything)
    expect(found.length).toBeGreaterThan(2)
    expect(new Set(found.map(t => t.id)).size).toBe(found.length)
  })

  it('says what it read, never asserting bare', () => {
    for (const tip of guidance(everything)) {
      expect(tip.basis.length, tip.id).toBeGreaterThan(0)
      expect(tip.headline.length, tip.id).toBeGreaterThan(0)
      expect(tip.action.length, tip.id).toBeGreaterThan(0)
    }
  })

  it('prescribes no training numbers anywhere', () => {
    // The line this module must not cross. Percentages, weights and set×rep
    // schemes come from the programme, which has its own sources.
    for (const tip of guidance(everything)) {
      const text = `${tip.headline} ${tip.action}`
      expect(text, tip.id).not.toMatch(/\d+\s*%/)
      expect(text, tip.id).not.toMatch(/\d+\s*(lb|kg)\b/)
      expect(text, tip.id).not.toMatch(/\d+\s*×\s*\d+/)
    }
  })

  it('is stable — the same reading gives the same tips in the same order', () => {
    expect(guidance(everything)).toEqual(guidance(everything))
  })

  it('puts what is going wrong above what is merely unset', () => {
    // Order is sorted rather than left to the order the checks run in, so a
    // tip added at the bottom of the function cannot outrank a warning.
    const order = { watch: 0, suggest: 1, note: 2 }
    const tones = guidance(everything).map(t => order[t.tone])
    expect(tones).toEqual([...tones].sort((a, b) => a - b))
  })

  it('keeps a warning first even when it is found last', () => {
    // The stale weigh-in is checked last and is a note; the unkept plan is
    // checked first and is a watch. Reversing the sort would show it.
    const found = guidance(everything)
    expect(found[0].tone).toBe('watch')
    expect(found[found.length - 1].tone).toBe('note')
  })

  it('sorts rather than relying on the order the checks happen to run in', () => {
    // The case the sort exists for, and the only one that can prove it is
    // there: `no-amrap-flagged` is a note found fourth, `no-weigh-in` is a
    // suggestion found last. In the order they are appended the note comes
    // first. Every other combination is already in tone order by accident, so
    // deleting the sort passes all of them.
    const noteBeforeSuggest = reading({
      block,
      sessions: [squatDay('2026-09-08')],
      settings: { trainingDays: 4, weightGoal: { direction: 'lose', pace: 'steady' } },
      lastWeighInISO: null,
    })
    const found = guidance(noteBeforeSuggest).map(t => t.id)
    expect(found).toEqual(['no-weigh-in', 'no-amrap-flagged'])
  })
})
