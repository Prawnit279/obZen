/**
 * Readings worth acting on, drawn from what the app already knows.
 *
 * Two rules hold this module together.
 *
 * The first is that it never prescribes training. It may say a number is
 * missing, stale, or that a feature cannot work without one, and it may point
 * at a lighter option the programme itself offers — but percentages, weights
 * and set-by-rep schemes come from `data/programs.ts` and `strengthTools`,
 * which have sources behind them. A tip inventing one would be indistinguisha-
 * ble from a real prescription. `guidance.test.ts` asserts the absence
 * directly, so the rule survives an edit that forgets it.
 *
 * The second is silence. A reading with nothing behind it produces no tip at
 * all rather than a cautious one, and a threshold is crossed before anything is
 * named — one missed week is not a pattern, and a card that speaks constantly
 * teaches the reader to stop looking at it. This is the same convention the
 * rest of Progress follows: `acwr` returns `unknown` rather than a ratio built
 * on one session, `liftBalance` stays quiet until all three lifts are logged,
 * and `deloadAdvice` wants two signals before it recommends anything.
 */

import type { WorkoutDaySession } from '@/db/dexie'
import type { ActiveBlock } from '@/store/useBlockStore'
import type { IntakeAnswers } from '@/lib/intake'
import type { WeightGoal } from '@/lib/bodyweight'
import type { Acwr } from '@/lib/progressTrends'
import type { Adherence } from '@/lib/progressTrends'
import { INTAKE_QUESTIONS } from '@/data/intake-questions'
import { answeredCount } from '@/lib/intake'
import { recoveryHeadroom } from '@/lib/programs'
import { realSets } from '@/lib/progress'
import { exerciseNameFor, COMPETITION_LIFT_IDS } from '@/data/obzen-program'

/**
 * How loudly a tip asks to be read. `watch` is something going wrong, `suggest`
 * is a choice worth making, `note` is a feature sitting idle for want of a
 * flag. Nothing here is an error — every one of them is a reasonable state to
 * be in.
 */
export type TipTone = 'watch' | 'suggest' | 'note'

export interface Tip {
  id: string
  /** The finding itself, in one line. */
  headline: string
  /** What can be done about it. */
  action: string
  /** What it was read from. Never empty — a tip without one is an assertion. */
  basis: string
  tone: TipTone
}

/**
 * Everything the readings are drawn from, already derived.
 *
 * Passed in rather than computed here so this module stays a pure combiner:
 * `WorkoutProgress` has these values anyway, and recomputing them would risk
 * this card disagreeing with the cards beside it about the same week.
 */
export interface GuidanceReading {
  settings: { trainingDays: number; weightGoal: WeightGoal | null }
  answers: IntakeAnswers
  block: ActiveBlock | null
  /** This profile's sessions, already filtered. */
  sessions: WorkoutDaySession[]
  /** Date of the most recent weigh-in, or null when none has been logged. */
  lastWeighInISO: string | null
  adherence: Adherence
  load: Acwr
  todayISO: string
}

/**
 * Planned sessions needed before adherence is worth mentioning.
 *
 * A reporting threshold, not a training rule: two weeks of a four-day plan is
 * eight sessions, and below that a single illness reads as a collapse.
 */
export const MIN_PLANNED_FOR_ADHERENCE = 8

/**
 * The share of planned sessions below which the gap is named. Chosen so that
 * missing roughly one session in four passes without comment and missing
 * closer to one in three does not.
 */
export const UNDER_PLAN_RATIO = 0.7

/**
 * How old a weigh-in gets before the numbers resting on it are worth
 * questioning. Four weeks is long enough that a deliberate gain or cut has
 * moved the figure, and short enough that the goal is still the current one.
 */
export const STALE_WEIGH_IN_WEEKS = 4

/** Loudest first. `watch` is something going wrong; `note` is a flag unset. */
const TONE_ORDER: Record<TipTone, number> = { watch: 0, suggest: 1, note: 2 }

const WEEK_MS = 7 * 86_400_000

/** Whole weeks between two ISO dates, or null when either will not parse. */
function weeksBetween(fromISO: string, toISO: string): number | null {
  const from = Date.parse(`${fromISO}T00:00:00Z`)
  const to = Date.parse(`${toISO}T00:00:00Z`)
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null
  return Math.floor((to - from) / WEEK_MS)
}

export function guidance(r: GuidanceReading): Tip[] {
  const tips: Tip[] = []

  // ── The plan against what happened ─────────────────────────────────────────
  // `extra` is credit: training off-plan counts as kept, never as missed, which
  // is the same rule `adherence` itself applies.
  const kept = r.adherence.trained + r.adherence.extra
  if (
    r.adherence.planned >= MIN_PLANNED_FOR_ADHERENCE
    && kept < r.adherence.planned * UNDER_PLAN_RATIO
  ) {
    tips.push({
      id: 'under-plan',
      tone: 'watch',
      headline: `You are training fewer days than the plan asks for.`,
      action: 'Either add a session back, or set the plan to fewer days so it '
        + 'matches what you actually do — a plan nobody keeps is worse than a '
        + 'smaller one that gets done.',
      basis: `${r.adherence.trained} of ${r.adherence.planned} planned sessions `
        + `over the window, on a ${r.settings.trainingDays}-day plan.`,
    })
  }

  // ── Recovery against load ──────────────────────────────────────────────────
  // Both halves must agree. Either alone is a week to watch, not a case — the
  // same bar `deloadAdvice` sets, and for the same reason.
  const headroom = recoveryHeadroom(r.answers)
  const loadHigh = r.load.verdict === 'spike' || r.load.verdict === 'elevated'
  if (headroom === 'low' && loadHigh) {
    tips.push({
      id: 'recovery-vs-load',
      tone: 'watch',
      headline: 'Your answers point to low recovery, and this week is running heavy.',
      action: 'Consider taking the lighter option your programme already offers '
        + 'this week rather than pushing the top sets.',
      basis: 'Sleep, stress and soreness from the questionnaire, against this '
        + `week's load being ${r.load.verdict === 'spike' ? 'well above' : 'above'} `
        + 'your recent average.',
    })
  }

  // ── A lift the block has nothing to say about ──────────────────────────────
  if (r.block) {
    const trained = new Set(
      r.sessions.flatMap(s => s.exercises.filter(e => realSets(e).length > 0).map(e => e.exerciseId))
    )
    // Only lifts actually trained: proposing a training max for a lift nobody
    // does would be noise, and the block is entitled to leave one out.
    const missing = COMPETITION_LIFT_IDS
      .filter(id => trained.has(id) && !(r.block!.trainingMaxLb[id] > 0))
      .map(exerciseNameFor)

    if (missing.length > 0) {
      tips.push({
        id: 'block-lift-missing-tm',
        tone: 'suggest',
        headline: missing.length === 1
          ? `${missing[0]} has no training max, so the block prescribes nothing for it.`
          : `${missing.join(' and ')} have no training max, so the block prescribes nothing for them.`,
        action: 'Log a top set for it and start the block again, or set the '
          + 'training max by hand.',
        basis: `Trained in this window, but absent from the block's training maxes.`,
      })
    }

    // ── A flag the block's own cards depend on ───────────────────────────────
    // Only once something has been logged under the block: nothing to have
    // flagged yet is not a mistake.
    const sinceStart = r.sessions.filter(s => s.date >= r.block!.startedOn)
    const anyFlagged = sinceStart.some(s =>
      s.exercises.some(e => realSets(e).some(set => set.isAmrap === true))
    )
    if (sinceStart.length > 0 && !anyFlagged) {
      tips.push({
        id: 'no-amrap-flagged',
        tone: 'note',
        headline: 'No top set has been marked since the block began.',
        action: 'Tap “reps” on the last working set to mark it. Until then the '
          + 'top-set history and the training-max advice have nothing to read.',
        basis: `${sinceStart.length} session${sinceStart.length === 1 ? '' : 's'} `
          + 'logged under the block, none with a marked set.',
      })
    }
  }

  // ── The questionnaire ──────────────────────────────────────────────────────
  // Started but unfinished. Untouched is not unfinished — the app worked
  // without it before and still does.
  const answered = answeredCount(r.answers)
  if (answered > 0 && answered < INTAKE_QUESTIONS.length) {
    tips.push({
      id: 'intake-incomplete',
      tone: 'note',
      headline: 'The programme match is provisional.',
      action: 'Finishing the questionnaire lets the match weigh what it is '
        + 'currently silent about.',
      basis: `${answered} of ${INTAKE_QUESTIONS.length} questions answered.`,
    })
  }

  // ── Bodyweight behind a goal ───────────────────────────────────────────────
  // Only when a goal is set: without one there is nothing an old weight makes
  // wrong.
  if (r.settings.weightGoal) {
    if (r.lastWeighInISO === null) {
      tips.push({
        id: 'no-weigh-in',
        tone: 'suggest',
        headline: 'There is a weight goal but no weight behind it.',
        action: 'Log a weigh-in so the goal and the per-pound readings have '
          + 'something to work from.',
        basis: 'A goal is set and the weigh-in log is empty.',
      })
    } else {
      const weeks = weeksBetween(r.lastWeighInISO, r.todayISO)
      if (weeks !== null && weeks >= STALE_WEIGH_IN_WEEKS) {
        tips.push({
          id: 'stale-weigh-in',
          tone: 'note',
          headline: 'The weight behind your goal is getting old.',
          action: 'Log a weigh-in — strength per pound and the goal both rest on it.',
          basis: `Last weigh-in was ${weeks} weeks ago.`,
        })
      }
    }
  }

  // Loudest first, and stably within a tone so the order does not shuffle
  // between renders. Sorted rather than left to the order the checks happen to
  // run in: that order is correct today by coincidence, and a tip added at the
  // bottom of this function would otherwise outrank a warning.
  return [...tips].sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone])
}
