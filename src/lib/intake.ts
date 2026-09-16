/**
 * Answers to the goal questionnaire.
 *
 * Every question can be skipped. A skipped question is absent, never a
 * substituted default — the app already refuses to invent a ×BW figure without
 * a weigh-in or an acute:chronic ratio under three rated sessions, and an
 * invented training age would be the same kind of lie with more riding on it.
 *
 * Anything reading these must therefore handle absence, which is what
 * `isAnswered` and `missingFor` exist to make easy.
 */

import { INTAKE_QUESTIONS } from '@/data/intake-questions'
import type { IntakeQuestion, QuestionSection } from '@/data/intake-questions'

/** One lift's best recent set, as the training max is seeded from. */
export interface TopSet {
  exerciseId: string
  weightLb: number
  reps: number
}

export type IntakeAnswer =
  | { kind: 'single'; value: string }
  | { kind: 'multi'; values: string[]; note?: string }
  | { kind: 'scale'; value: number }
  | { kind: 'number'; value: number }
  | { kind: 'date'; value: string | null }
  | { kind: 'lifts'; sets: TopSet[] }

export type IntakeAnswers = Record<string, IntakeAnswer>

/** 1 to 5, both inclusive — the range every scale question offers. */
export const SCALE_MIN = 1
export const SCALE_MAX = 5

/**
 * Whether a question has a usable answer.
 *
 * Present but empty counts as unanswered: an empty multi-select or a lifts
 * question with no lifts filled carries no more information than skipping it,
 * and treating it as answered would let a caller act on nothing.
 */
export function isAnswered(answers: IntakeAnswers, id: string): boolean {
  const a = answers[id]
  if (!a) return false
  switch (a.kind) {
    case 'single': return a.value.trim().length > 0
    case 'multi':  return a.values.length > 0
    case 'scale':  return Number.isFinite(a.value)
    case 'number': return Number.isFinite(a.value) && a.value > 0
    case 'date':   return a.value !== null && a.value.length > 0
    case 'lifts':  return a.sets.length > 0
  }
}

/** How many of the questions have been answered. */
export function answeredCount(answers: IntakeAnswers): number {
  return INTAKE_QUESTIONS.filter(q => isAnswered(answers, q.id)).length
}

/** Whether every question has been either answered or deliberately passed. */
export function isComplete(answers: IntakeAnswers, seen: string[]): boolean {
  return INTAKE_QUESTIONS.every(q => isAnswered(answers, q.id) || seen.includes(q.id))
}

/**
 * The questions a given capability needs but does not have.
 *
 * Callers name what they need rather than asking for a completeness score, so
 * a feature can say exactly what is missing — "no training age on record"
 * beats "questionnaire 70% complete", which tells the reader nothing about
 * whether the thing they wanted will work.
 */
export function missingFor(answers: IntakeAnswers, ids: string[]): IntakeQuestion[] {
  return INTAKE_QUESTIONS.filter(q => ids.includes(q.id) && !isAnswered(answers, q.id))
}

export function questionsIn(section: QuestionSection): IntakeQuestion[] {
  return INTAKE_QUESTIONS.filter(q => q.section === section)
}

export function questionById(id: string): IntakeQuestion | undefined {
  return INTAKE_QUESTIONS.find(q => q.id === id)
}

/** Reads a single-choice answer, or null when it was skipped. */
export function choice(answers: IntakeAnswers, id: string): string | null {
  const a = answers[id]
  return a?.kind === 'single' && a.value ? a.value : null
}

/** Reads a multi-choice answer as a list — empty when skipped. */
export function choices(answers: IntakeAnswers, id: string): string[] {
  const a = answers[id]
  return a?.kind === 'multi' ? a.values : []
}

/** Reads a numeric or scale answer, or null when it was skipped. */
export function numeric(answers: IntakeAnswers, id: string): number | null {
  const a = answers[id]
  if (a?.kind === 'number' || a?.kind === 'scale') {
    return Number.isFinite(a.value) ? a.value : null
  }
  return null
}
