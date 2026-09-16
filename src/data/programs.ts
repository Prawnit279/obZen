/**
 * The programmes the app can put you on.
 *
 * Only two are complete. 5/3/1 and Boring But Big are here because their
 * numbers already live in `lib/strengthTools.ts` with tests behind them — this
 * file describes when each one suits, and defers every percentage to that
 * module rather than restating it.
 *
 * The other two are declared but not filled in. Their templates were not
 * available to encode from a source, and a programme whose percentages were
 * guessed would look exactly like one that was not for however many weeks it
 * took to notice. `needs` says what each is waiting for.
 */

export type ProgramId = 'five-three-one' | 'bbb' | 'tactical-barbell' | 'bigger-leaner-stronger'

/** Whether a programme can actually be followed yet. */
export type ProgramStatus = 'available' | 'needs-source'

/**
 * How well a programme suits an answer. Scored rather than filtered, so a
 * questionnaire with gaps still produces a ranking instead of nothing.
 */
export interface ProgramFit {
  /** `primary-goal` values this serves well. */
  goals: string[]
  /** Inclusive range of training days it is written for. */
  daysPerWeek: [number, number]
  /** Below this, the session does not fit in the time available. */
  minSessionMinutes: number
  /** `training-age` values it suits. */
  trainingAge: string[]
  /** `conditioning` values it tolerates. */
  conditioning: string[]
  /** `accessory-appetite` values it matches. */
  accessoryAppetite: string[]
  /** `plan-style` values it matches. */
  planStyle: string[]
}

export interface Program {
  id: ProgramId
  name: string
  /** Who wrote it, so the app is never the apparent author. */
  source: string
  status: ProgramStatus
  /** One line on what it is. */
  blurb: string
  /** Weeks in one mesocycle, deload included. */
  cycleWeeks: number
  /** The week within the cycle that is a deload, 1-based. */
  deloadWeek: number
  fit: ProgramFit
  /** For `needs-source`: exactly what is missing before it can be used. */
  needs?: string
}

export const PROGRAMS: Program[] = [
  {
    id: 'five-three-one',
    name: '5/3/1',
    source: 'Jim Wendler',
    status: 'available',
    blurb:
      'Three working sets off a training max, the last one taken for as many '
      + 'reps as it is good for. Slow, and it does not stall easily.',
    cycleWeeks: 4,
    deloadWeek: 4,
    fit: {
      goals: ['muscle', 'maintain', 'recomp'],
      daysPerWeek: [2, 4],
      minSessionMinutes: 45,
      trainingAge: ['6-18m', '18m-3y', 'over-3y'],
      conditioning: ['none', 'secondary', 'equal'],
      accessoryAppetite: ['minimal', 'moderate'],
      planStyle: ['fixed', 'either'],
    },
  },
  {
    id: 'bbb',
    name: '5/3/1 · Boring But Big',
    source: 'Jim Wendler',
    status: 'available',
    blurb:
      'The 5/3/1 wave with five sets of ten behind it. The volume is the point, '
      + 'and it is what makes this the long session of the four.',
    cycleWeeks: 4,
    deloadWeek: 4,
    fit: {
      goals: ['muscle', 'recomp'],
      daysPerWeek: [3, 4],
      // Five sets of ten on top of the main work does not fit in an hour.
      minSessionMinutes: 75,
      trainingAge: ['18m-3y', 'over-3y'],
      conditioning: ['none', 'secondary'],
      accessoryAppetite: ['high'],
      planStyle: ['fixed', 'either'],
    },
  },
  {
    id: 'tactical-barbell',
    name: 'Tactical Barbell',
    source: 'K. Black',
    status: 'needs-source',
    blurb:
      'Built for lifting and conditioning at once, rather than lifting with '
      + 'conditioning bolted on.',
    cycleWeeks: 3,
    deloadWeek: 0,
    needs:
      'The template you want (Operator, Fighter, Zulu or Gladiator), its '
      + 'percentages and set counts per week, and how the weight progresses '
      + 'between blocks.',
    fit: {
      goals: ['maintain', 'recomp', 'muscle'],
      daysPerWeek: [2, 3],
      minSessionMinutes: 45,
      trainingAge: ['6-18m', '18m-3y', 'over-3y'],
      // The one programme here written for conditioning mattering as much.
      conditioning: ['secondary', 'equal'],
      accessoryAppetite: ['minimal'],
      planStyle: ['fixed', 'either'],
    },
  },
  {
    id: 'bigger-leaner-stronger',
    name: 'Bigger Leaner Stronger',
    source: 'Mike Matthews',
    status: 'needs-source',
    blurb:
      'Heavy sets in a low rep range with a simple rule for adding weight, on '
      + 'a body-part split.',
    cycleWeeks: 4,
    deloadWeek: 0,
    needs:
      'The split and its weekly set allocation, the working percentage, and '
      + 'the progression rule as your edition states it — these changed '
      + 'between editions.',
    fit: {
      goals: ['muscle', 'recomp', 'fat-loss'],
      daysPerWeek: [4, 6],
      minSessionMinutes: 60,
      trainingAge: ['under-6m', '6-18m', '18m-3y'],
      conditioning: ['none', 'secondary'],
      accessoryAppetite: ['moderate', 'high'],
      planStyle: ['fixed', 'either'],
    },
  },
]

export function programById(id: string): Program | undefined {
  return PROGRAMS.find(p => p.id === id)
}

export const AVAILABLE_PROGRAMS = PROGRAMS.filter(p => p.status === 'available')
