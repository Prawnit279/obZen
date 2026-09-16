/**
 * Choosing a programme from the questionnaire.
 *
 * Scored, not filtered. Filtering on a questionnaire with gaps returns nothing
 * and explains nothing; scoring ranks what is known and reports what is not, so
 * a half-answered questionnaire still produces a shortlist with its reasoning
 * attached.
 *
 * An unanswered question contributes neither for nor against. It never counts
 * as a mismatch — that would let silence argue against a programme, which is
 * the same as inventing an answer.
 */

import { PROGRAMS } from '@/data/programs'
import type { Program, ProgramFit } from '@/data/programs'
import { INTAKE_QUESTIONS } from '@/data/intake-questions'
import type { IntakeQuestion } from '@/data/intake-questions'
import { choice, numeric, isAnswered } from '@/lib/intake'
import type { IntakeAnswers } from '@/lib/intake'

/** Questions that move the ranking. Anything else is for guidance, not choice. */
export const SELECTION_QUESTIONS = [
  'primary-goal', 'training-age', 'days-per-week',
  'session-length', 'conditioning', 'accessory-appetite', 'plan-style',
] as const

export interface ProgramMatch {
  program: Program
  /** 0–1, over the questions that were actually answered. */
  score: number
  /** Plain reasons it fits, for showing beside the recommendation. */
  reasons: string[]
  /** Plain reasons it does not, which are worth seeing before choosing. */
  against: string[]
}

export interface Recommendation {
  /** Best first. Programmes needing a source are ranked but never lead. */
  matches: ProgramMatch[]
  /** Selection questions with no answer yet. */
  missing: IntakeQuestion[]
  /** True when nothing that decides the choice has been answered. */
  undecidable: boolean
}

function matchFit(program: Program, answers: IntakeAnswers): ProgramMatch {
  const fit: ProgramFit = program.fit
  const reasons: string[] = []
  const against: string[] = []
  let hits = 0
  let asked = 0

  const check = (
    answered: boolean,
    ok: boolean,
    forReason: string,
    againstReason: string
  ) => {
    if (!answered) return          // silence argues neither way
    asked++
    if (ok) { hits++; reasons.push(forReason) }
    else against.push(againstReason)
  }

  const goal = choice(answers, 'primary-goal')
  check(goal !== null, goal !== null && fit.goals.includes(goal),
    'suits what you are training for',
    'is not written for that goal')

  const age = choice(answers, 'training-age')
  check(age !== null, age !== null && fit.trainingAge.includes(age),
    'written for your experience',
    'aimed at a different amount of training behind you')

  const days = choice(answers, 'days-per-week')
  const dayCount = days === null ? null : Number(days)
  check(dayCount !== null,
    dayCount !== null && dayCount >= fit.daysPerWeek[0] && dayCount <= fit.daysPerWeek[1],
    `fits ${dayCount} days a week`,
    `wants ${fit.daysPerWeek[0]}–${fit.daysPerWeek[1]} days a week`)

  const minutes = choice(answers, 'session-length')
  const mins = minutes === null ? null : Number(minutes)
  check(mins !== null, mins !== null && mins >= fit.minSessionMinutes,
    'fits the time you have',
    `needs about ${fit.minSessionMinutes} minutes a session`)

  const cond = choice(answers, 'conditioning')
  check(cond !== null, cond !== null && fit.conditioning.includes(cond),
    'works alongside your conditioning',
    'does not leave much room for conditioning')

  const accessory = choice(answers, 'accessory-appetite')
  check(accessory !== null, accessory !== null && fit.accessoryAppetite.includes(accessory),
    'matches how much accessory work you want',
    'carries more or less accessory work than you said you want')

  const style = choice(answers, 'plan-style')
  check(style !== null, style !== null && fit.planStyle.includes(style),
    'matches how you like to train',
    'is more rigid than you said you want')

  return {
    program,
    // No answers means no opinion, not a zero — a zero would rank a programme
    // last for a question nobody was asked.
    score: asked === 0 ? 0 : hits / asked,
    reasons,
    against,
  }
}

export function recommendProgram(answers: IntakeAnswers): Recommendation {
  const matches = PROGRAMS.map(p => matchFit(p, answers)).sort((a, b) => {
    // An incomplete programme can be a good fit and still must not lead —
    // it cannot be followed yet.
    const usable = (m: ProgramMatch) => (m.program.status === 'available' ? 1 : 0)
    return usable(b) - usable(a) || b.score - a.score || a.program.name.localeCompare(b.program.name)
  })

  const missing = INTAKE_QUESTIONS.filter(
    q => (SELECTION_QUESTIONS as readonly string[]).includes(q.id) && !isAnswered(answers, q.id)
  )

  return {
    matches,
    missing,
    undecidable: missing.length === SELECTION_QUESTIONS.length,
  }
}

/**
 * Where a lifter is in a cycle, given when the block started.
 *
 * Weeks are 1-based and wrap: week 5 of a four-week programme is week 1 of the
 * next cycle. Returns null before the start date rather than a negative week.
 */
export function cyclePosition(
  program: Program,
  startDateISO: string,
  todayISO: string
): { week: number; cycle: number; isDeload: boolean } | null {
  const start = Date.parse(`${startDateISO}T00:00:00Z`)
  const today = Date.parse(`${todayISO}T00:00:00Z`)
  if (!Number.isFinite(start) || !Number.isFinite(today) || today < start) return null

  const weeksIn = Math.floor((today - start) / (7 * 86_400_000))
  const week = (weeksIn % program.cycleWeeks) + 1
  return {
    week,
    cycle: Math.floor(weeksIn / program.cycleWeeks) + 1,
    // `week` is 1-based, so a `deloadWeek` of 0 means "none scheduled" and
    // simply never matches. No separate guard is needed, and one that was here
    // could not be reached.
    isDeload: week === program.deloadWeek,
  }
}

/**
 * How much recovery headroom the answers suggest.
 *
 * Only advisory — it nudges deload timing rather than rewriting a programme.
 * Null when neither sleep nor stress was answered, because a recovery estimate
 * from no recovery information would be a number with nothing behind it.
 */
export function recoveryHeadroom(answers: IntakeAnswers): 'low' | 'moderate' | 'good' | null {
  const sleep = choice(answers, 'sleep')
  const stress = choice(answers, 'life-stress')
  const soreness = numeric(answers, 'soreness')
  if (sleep === null && stress === null && soreness === null) return null

  let score = 0
  let counted = 0
  if (sleep !== null) {
    counted++
    score += sleep === 'under-5' ? 0 : sleep === '5-6' ? 1 : sleep === '6-7' ? 2 : 3
  }
  if (stress !== null) {
    counted++
    score += stress === 'high' ? 0 : stress === 'moderate' ? 2 : 3
  }
  if (soreness !== null) {
    counted++
    score += soreness >= 4 ? 0 : soreness === 3 ? 2 : 3
  }

  const avg = score / counted
  return avg < 1 ? 'low' : avg < 2.2 ? 'moderate' : 'good'
}
