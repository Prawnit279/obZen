/**
 * Choosing a programme.
 *
 * Two rules run through all of this. An unanswered question argues neither for
 * nor against — silence must not be read as a mismatch, which would be
 * inventing an answer. And a programme whose numbers are not encoded can rank
 * well and still must never lead, because it cannot be followed.
 */
import { describe, it, expect } from 'vitest'
import {
  recommendProgram, cyclePosition, recoveryHeadroom, SELECTION_QUESTIONS,
} from '@/lib/programs'
import { PROGRAMS, programById, AVAILABLE_PROGRAMS, templatesFor, isTemplateReady } from '@/data/programs'
import type { IntakeAnswers } from '@/lib/intake'

const single = (value: string) => ({ kind: 'single' as const, value })

/** Someone who should land on Boring But Big: time, appetite, experience. */
const bbbProfile: IntakeAnswers = {
  'primary-goal':       single('muscle'),
  'training-age':       single('over-3y'),
  'days-per-week':      single('4'),
  'session-length':     single('90'),
  'conditioning':       single('none'),
  'accessory-appetite': single('high'),
  'plan-style':         single('fixed'),
}

/** A beginner cutting on five days — fits only the unencoded programme. */
const beginnerCut: IntakeAnswers = {
  'primary-goal':       single('fat-loss'),
  'training-age':       single('under-6m'),
  'days-per-week':      single('5'),
  'session-length':     single('60'),
  'conditioning':       single('none'),
  'accessory-appetite': single('moderate'),
  'plan-style':         single('fixed'),
}

/** Someone the conditioning answer should point at a concurrent template. */
const concurrentProfile: IntakeAnswers = {
  ...bbbProfile,
  'days-per-week':      single('3'),
  'session-length':     single('45'),
  'conditioning':       single('equal'),
  'accessory-appetite': single('minimal'),
}

// ── The catalogue ────────────────────────────────────────────────────────────

describe('the programme list', () => {
  it('names a source for every programme', () => {
    // The app is never the apparent author of someone else's programme.
    for (const p of PROGRAMS) expect(p.source.length, p.id).toBeGreaterThan(2)
  })

  it('says what an incomplete programme is waiting for', () => {
    for (const p of PROGRAMS) {
      if (p.status === 'needs-source') {
        expect(p.needs, p.id).toBeDefined()
        expect(p.needs!.length, p.id).toBeGreaterThan(30)
      }
    }
  })

  it('claims no deload week it cannot place', () => {
    for (const p of PROGRAMS) {
      if (p.deloadWeek > 0) expect(p.deloadWeek, p.id).toBeLessThanOrEqual(p.cycleWeeks)
    }
  })

  it('offers the two whose numbers are already encoded', () => {
    expect(AVAILABLE_PROGRAMS.map(p => p.id).sort())
      .toEqual(['bbb', 'five-three-one'])
  })

  it('looks one up by id', () => {
    expect(programById('bbb')?.name).toMatch(/boring but big/i)
    expect(programById('nope')).toBeUndefined()
  })
})

// ── Ranking ──────────────────────────────────────────────────────────────────

describe('recommendProgram', () => {
  it('leads with a programme that can actually be followed', () => {
    // A beginner cutting on five days: the unencoded hypertrophy programme is
    // a perfect fit and every encoded one is a poor one. The recommendation
    // still has to be something that can be followed today.
    const { matches } = recommendProgram(beginnerCut)
    const best = matches.find(m => m.program.status === 'needs-source')!
    expect(best.score).toBe(1)
    expect(matches[0].program.status).toBe('available')
    expect(matches[0].score).toBeLessThan(best.score)
  })

  it('still ranks an unfinished programme where it belongs', () => {
    const { matches } = recommendProgram(concurrentProfile)
    const tb = matches.find(m => m.program.id === 'tactical-barbell')!
    const bbb = matches.find(m => m.program.id === 'bbb')!
    expect(tb.score).toBeGreaterThan(bbb.score)
  })

  it('picks the volume programme for someone with the time and the appetite', () => {
    const { matches } = recommendProgram(bbbProfile)
    expect(matches[0].program.id).toBe('bbb')
    expect(matches[0].score).toBe(1)
  })

  it('turns away from the volume programme when the session is short', () => {
    const rushed = { ...bbbProfile, 'session-length': single('45') }
    const { matches } = recommendProgram(rushed)
    const bbb = matches.find(m => m.program.id === 'bbb')!
    expect(bbb.against.join(' ')).toMatch(/75 minutes/)
    expect(matches[0].program.id).not.toBe('bbb')
  })

  it('gives reasons in words, not just a number', () => {
    const { matches } = recommendProgram(bbbProfile)
    expect(matches[0].reasons.length).toBeGreaterThan(3)
    for (const r of matches[0].reasons) expect(r).toMatch(/[a-z]{4}/)
  })
})

// ── Silence is not a mismatch ────────────────────────────────────────────────

describe('unanswered questions', () => {
  it('scores only what was answered', () => {
    // One answer, and it matches — a perfect score over what is known, not a
    // low one for the six questions nobody was asked.
    const { matches } = recommendProgram({ 'primary-goal': single('muscle') })
    const bbb = matches.find(m => m.program.id === 'bbb')!
    expect(bbb.score).toBe(1)
    expect(bbb.against).toEqual([])
  })

  it('reports what is missing rather than guessing at it', () => {
    const { missing, undecidable } = recommendProgram({ 'primary-goal': single('muscle') })
    expect(missing.map(q => q.id)).not.toContain('primary-goal')
    expect(missing).toHaveLength(SELECTION_QUESTIONS.length - 1)
    expect(undecidable).toBe(false)
  })

  it('says so when nothing that decides the choice has been answered', () => {
    const { undecidable, missing } = recommendProgram({})
    expect(undecidable).toBe(true)
    expect(missing).toHaveLength(SELECTION_QUESTIONS.length)
  })

  it('gives every programme a zero when there is nothing to go on', () => {
    // Not a ranking dressed up as one.
    for (const m of recommendProgram({}).matches) expect(m.score).toBe(0)
  })
})

// ── Where you are in the cycle ───────────────────────────────────────────────

describe('cyclePosition', () => {
  const p531 = programById('five-three-one')!

  it('counts weeks from the start of the block', () => {
    expect(cyclePosition(p531, '2026-09-07', '2026-09-07')).toMatchObject({ week: 1, cycle: 1 })
    expect(cyclePosition(p531, '2026-09-07', '2026-09-14')).toMatchObject({ week: 2, cycle: 1 })
    expect(cyclePosition(p531, '2026-09-07', '2026-09-21')).toMatchObject({ week: 3, cycle: 1 })
  })

  it('wraps into the next cycle', () => {
    expect(cyclePosition(p531, '2026-09-07', '2026-10-05')).toMatchObject({ week: 1, cycle: 2 })
  })

  it('marks the deload week', () => {
    expect(cyclePosition(p531, '2026-09-07', '2026-09-28')?.isDeload).toBe(true)
    expect(cyclePosition(p531, '2026-09-07', '2026-09-21')?.isDeload).toBe(false)
  })

  it('never reports a deload for a programme that schedules none', () => {
    const tb = programById('tactical-barbell')!
    for (const d of ['2026-09-07', '2026-09-14', '2026-09-21']) {
      expect(cyclePosition(tb, '2026-09-07', d)?.isDeload).toBe(false)
    }
  })

  it('returns nothing before the block starts', () => {
    expect(cyclePosition(p531, '2026-09-07', '2026-09-01')).toBeNull()
  })

  it('holds the week through the days within it', () => {
    for (const d of ['2026-09-07', '2026-09-09', '2026-09-13']) {
      expect(cyclePosition(p531, '2026-09-07', d)?.week).toBe(1)
    }
  })
})

// ── Recovery ─────────────────────────────────────────────────────────────────

describe('recoveryHeadroom', () => {
  it('says nothing when it knows nothing', () => {
    expect(recoveryHeadroom({})).toBeNull()
    expect(recoveryHeadroom({ 'primary-goal': single('muscle') })).toBeNull()
  })

  it('reads a rested week as room to work', () => {
    expect(recoveryHeadroom({
      sleep: single('7-8'), 'life-stress': single('low'),
      soreness: { kind: 'scale', value: 2 },
    })).toBe('good')
  })

  it('reads a hard week as little room', () => {
    expect(recoveryHeadroom({
      sleep: single('under-5'), 'life-stress': single('high'),
      soreness: { kind: 'scale', value: 5 },
    })).toBe('low')
  })

  it('will judge on one answer rather than refusing', () => {
    expect(recoveryHeadroom({ sleep: single('under-5') })).toBe('low')
  })
})

// ── Templates ────────────────────────────────────────────────────────────────

describe('programme templates', () => {
  it('offers four templates to choose between for the concurrent programme', () => {
    const tb = programById('tactical-barbell')!
    expect(tb.templates?.map(t => t.id)).toEqual(['operator', 'fighter', 'zulu', 'gladiator'])
    expect(templatesFor('tactical-barbell')).toHaveLength(4)
  })

  it('leaves programmes with one shape without templates', () => {
    expect(programById('five-three-one')?.templates).toBeUndefined()
    expect(templatesFor('five-three-one')).toEqual([])
  })

  it('holds no template numbers that were not supplied', () => {
    // The guard this whole structure exists for. A percentage invented here
    // would read exactly like one from the book.
    for (const t of templatesFor('tactical-barbell')) {
      expect(t.weeks, t.id).toBeNull()
      expect(t.daysPerWeek, t.id).toBeNull()
      expect(t.worksFrom, t.id).toBeNull()
      expect(t.progression, t.id).toBeNull()
    }
  })

  it('reports every template as not yet followable', () => {
    for (const t of templatesFor('tactical-barbell')) {
      expect(isTemplateReady(t), t.id).toBe(false)
    }
  })

  it('recognises a template as ready once its numbers are there', () => {
    // What supplying them looks like, and the check that will flip.
    const filled = {
      id: 'operator', name: 'Operator', blurb: '',
      daysPerWeek: 3, liftCount: 3, worksFrom: 'training max',
      progression: 'add weight each block',
      weeks: [
        { week: 1, sets: 5, reps: '5', percentOfMax: 70 },
        { week: 2, sets: 5, reps: '5', percentOfMax: 80 },
        { week: 3, sets: 5, reps: '5', percentOfMax: 90 },
      ],
    }
    expect(isTemplateReady(filled)).toBe(true)
  })

  it('names each template and says who it is for', () => {
    for (const t of templatesFor('tactical-barbell')) {
      expect(t.name.length, t.id).toBeGreaterThan(2)
      expect(t.blurb.length, t.id).toBeGreaterThan(20)
    }
  })
})
