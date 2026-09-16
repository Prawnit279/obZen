/**
 * The goal questionnaire's answers.
 *
 * The rule under test throughout: a skipped question is absent, and absence is
 * reported rather than filled in. Everything downstream — programme choice,
 * guidance — reads these, so a substituted default here becomes a confident
 * recommendation built on something nobody said.
 */
import { describe, it, expect } from 'vitest'
import {
  isAnswered, answeredCount, isComplete, missingFor, questionsIn, questionById,
  choice, choices, numeric, SCALE_MIN, SCALE_MAX,
} from '@/lib/intake'
import type { IntakeAnswers } from '@/lib/intake'
import { INTAKE_QUESTIONS, SECTIONS } from '@/data/intake-questions'

const answers: IntakeAnswers = {
  'primary-goal':  { kind: 'single', value: 'recomp' },
  'equipment':     { kind: 'multi', values: ['rack', 'bench'] },
  'soreness':      { kind: 'scale', value: 3 },
  'bodyweight':    { kind: 'number', value: 165 },
  'target-date':   { kind: 'date', value: '2026-12-01' },
  'top-sets':      { kind: 'lifts', sets: [{ exerciseId: 'barbell-squat', weightLb: 225, reps: 5 }] },
}

// ── The question set itself ──────────────────────────────────────────────────

describe('the question set', () => {
  it('asks twenty questions', () => {
    expect(INTAKE_QUESTIONS).toHaveLength(20)
  })

  it('gives every question a distinct id', () => {
    const ids = INTAKE_QUESTIONS.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('files every question under a section that exists', () => {
    const known = SECTIONS.map(s => s.id)
    for (const q of INTAKE_QUESTIONS) expect(known).toContain(q.section)
  })

  it('leaves no section empty', () => {
    for (const s of SECTIONS) expect(questionsIn(s.id).length).toBeGreaterThan(0)
  })

  it('gives every choice question options to choose from', () => {
    for (const q of INTAKE_QUESTIONS) {
      if (q.type === 'single' || q.type === 'multi') {
        expect(q.options, q.id).toBeDefined()
        expect(q.options!.length, q.id).toBeGreaterThan(1)
      }
    }
  })

  it('gives every option within a question a distinct value', () => {
    for (const q of INTAKE_QUESTIONS) {
      if (!q.options) continue
      const values = q.options.map(o => o.value)
      expect(new Set(values).size, q.id).toBe(values.length)
    }
  })

  it('gives every scale question both ends', () => {
    for (const q of INTAKE_QUESTIONS) {
      if (q.type === 'scale') expect(q.scaleLabels, q.id).toHaveLength(2)
    }
  })

  it('records why every question exists', () => {
    // A question with no stated purpose is one nobody can justify removing.
    for (const q of INTAKE_QUESTIONS) {
      expect(q.drives.length, q.id).toBeGreaterThan(20)
    }
  })

  it('looks a question up by id', () => {
    expect(questionById('primary-goal')?.section).toBe('goal')
    expect(questionById('nonexistent')).toBeUndefined()
  })
})

// ── Answered, skipped, and the difference ────────────────────────────────────

describe('isAnswered', () => {
  it('recognises each kind of answer', () => {
    for (const id of Object.keys(answers)) expect(isAnswered(answers, id), id).toBe(true)
  })

  it('treats a question never reached as unanswered', () => {
    expect(isAnswered(answers, 'sleep')).toBe(false)
  })

  it('treats present-but-empty as unanswered', () => {
    // An empty multi-select carries no more than a skip, and calling it
    // answered would let a caller act on nothing.
    const empty: IntakeAnswers = {
      a: { kind: 'multi', values: [] },
      b: { kind: 'single', value: '' },
      c: { kind: 'lifts', sets: [] },
      d: { kind: 'date', value: null },
    }
    for (const id of ['a', 'b', 'c', 'd']) expect(isAnswered(empty, id), id).toBe(false)
  })

  it('treats a nonsense number as unanswered', () => {
    const bad: IntakeAnswers = {
      a: { kind: 'number', value: NaN },
      b: { kind: 'number', value: 0 },
    }
    expect(isAnswered(bad, 'a')).toBe(false)
    expect(isAnswered(bad, 'b')).toBe(false)
  })
})

describe('answeredCount', () => {
  it('counts only real answers', () => {
    expect(answeredCount(answers)).toBe(6)
    expect(answeredCount({})).toBe(0)
  })
})

describe('isComplete', () => {
  it('is satisfied by answering or deliberately passing every question', () => {
    const seen = INTAKE_QUESTIONS.map(q => q.id)
    expect(isComplete({}, seen)).toBe(true)
    expect(isComplete({}, [])).toBe(false)
  })

  it('is not satisfied while a question has been neither answered nor seen', () => {
    const seen = INTAKE_QUESTIONS.slice(1).map(q => q.id)
    expect(isComplete({}, seen)).toBe(false)
  })
})

// ── Naming what is missing ───────────────────────────────────────────────────

describe('missingFor', () => {
  it('names the questions a feature needs and does not have', () => {
    const missing = missingFor(answers, ['primary-goal', 'training-age', 'sleep'])
    expect(missing.map(q => q.id)).toEqual(['training-age', 'sleep'])
  })

  it('returns the whole question, so a caller can say what it was', () => {
    // "No training age on record" beats "questionnaire 70% complete".
    const [q] = missingFor({}, ['training-age'])
    expect(q.prompt).toMatch(/how long/i)
  })

  it('is empty when everything asked for is present', () => {
    expect(missingFor(answers, ['primary-goal', 'equipment'])).toEqual([])
  })
})

// ── Reading answers back ─────────────────────────────────────────────────────

describe('reading answers', () => {
  it('reads a choice, and null when skipped', () => {
    expect(choice(answers, 'primary-goal')).toBe('recomp')
    expect(choice(answers, 'sleep')).toBeNull()
  })

  it('will not read a choice out of the wrong kind of answer', () => {
    expect(choice(answers, 'equipment')).toBeNull()
  })

  it('reads a multi-choice as a list, empty when skipped', () => {
    expect(choices(answers, 'equipment')).toEqual(['rack', 'bench'])
    expect(choices(answers, 'sleep')).toEqual([])
  })

  it('reads numbers and scales, and null when skipped', () => {
    expect(numeric(answers, 'bodyweight')).toBe(165)
    expect(numeric(answers, 'soreness')).toBe(3)
    expect(numeric(answers, 'sleep')).toBeNull()
  })

  it('offers a five-point scale', () => {
    expect(SCALE_MIN).toBe(1)
    expect(SCALE_MAX).toBe(5)
  })
})
