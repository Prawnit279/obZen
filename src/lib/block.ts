/**
 * What the current block prescribes this week.
 *
 * Turns an active block — a programme, a start date, a set of training maxes —
 * into the sets to actually do, by asking `strengthTools` rather than restating
 * a single percentage. Nothing here invents a number: a programme whose
 * template is not encoded returns `unavailable` saying so, and a lift with no
 * training max is simply absent rather than given a guessed one.
 */

import { programById, isTemplateReady } from '@/data/programs'
import type { Program, ProgramTemplate } from '@/data/programs'
import { cyclePosition } from '@/lib/programs'
import { fiveThreeOneWave, bbbSet } from '@/lib/strengthTools'
import type { WaveSet, WaveWeek, BBBPercent } from '@/lib/strengthTools'
import { exerciseNameFor } from '@/data/obzen-program'
import type { ActiveBlock } from '@/store/useBlockStore'

export interface LiftPrescription {
  exerciseId: string
  name: string
  trainingMaxLb: number
  sets: WaveSet[]
}

export interface SupplementalPrescription {
  label: string
  percentOfTm: number
  sets: number
  reps: number
  weightLb: number
}

export interface WeekPrescription {
  program: Program
  template: ProgramTemplate | null
  /** 1-based week within the cycle, and which cycle. */
  week: number
  cycle: number
  isDeload: boolean
  lifts: LiftPrescription[]
  /** Null when the programme carries no supplemental work. */
  supplemental: SupplementalPrescription[] | null
  /**
   * Set when the block cannot be turned into sets, saying why. A block on a
   * programme whose numbers were never supplied is a real state, and reporting
   * it beats filling the gap in.
   */
  unavailable: string | null
}

/** The 5/3/1 wave week for a position in a four-week cycle. */
function waveWeekFor(week: number, deloadWeek: number): WaveWeek {
  if (week === deloadWeek) return 'deload'
  return Math.min(3, Math.max(1, week)) as WaveWeek
}

/** Programmes built on the 5/3/1 wave, which is the one encoded here. */
const WAVE_PROGRAMS = new Set(['five-three-one', 'bbb'])

/** Boring But Big's supplemental percentage, of the training max. */
const BBB_DEFAULT_PERCENT: BBBPercent = 50

export function weekPrescription(
  block: ActiveBlock,
  todayISO: string
): WeekPrescription | null {
  const program = programById(block.programId)
  if (!program) return null

  const position = cyclePosition(program, block.startedOn, todayISO)
  if (!position) return null

  const template = program.templates?.find(t => t.id === block.templateId) ?? null

  const base = {
    program,
    template,
    week: position.week,
    cycle: position.cycle,
    isDeload: position.isDeload,
    lifts: [] as LiftPrescription[],
    supplemental: null as SupplementalPrescription[] | null,
  }

  // A programme whose template numbers were never supplied cannot prescribe.
  if (program.status === 'needs-source' || (template !== null && !isTemplateReady(template))) {
    return {
      ...base,
      unavailable: program.needs
        ?? 'This template is still waiting for its numbers.',
    }
  }

  if (!WAVE_PROGRAMS.has(program.id)) {
    return { ...base, unavailable: 'No week-by-week prescription is encoded for this programme.' }
  }

  const waveWeek = waveWeekFor(position.week, program.deloadWeek)

  const lifts: LiftPrescription[] = Object.entries(block.trainingMaxLb)
    // A lift with no training max is left out rather than given a guessed one.
    .filter(([, tm]) => tm > 0)
    .map(([exerciseId, tm]) => ({
      exerciseId,
      name: exerciseNameFor(exerciseId),
      trainingMaxLb: tm,
      sets: fiveThreeOneWave(tm, waveWeek),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Boring But Big adds five sets of ten; the deload week does not carry it.
  const supplemental = program.id === 'bbb' && !position.isDeload
    ? lifts.map(l => {
        const bbb = bbbSet(l.trainingMaxLb, BBB_DEFAULT_PERCENT)
        return {
          label: l.name,
          percentOfTm: bbb.pct,
          sets: bbb.sets,
          reps: bbb.reps,
          weightLb: bbb.weight,
        }
      })
    : null

  return { ...base, lifts, supplemental, unavailable: null }
}

/**
 * How far through the block, as a fraction.
 *
 * For a progress bar, and null when the block has not started or the programme
 * declares no cycle length to be a fraction of.
 */
export function blockProgress(block: ActiveBlock, todayISO: string): number | null {
  const program = programById(block.programId)
  if (!program || program.cycleWeeks <= 0) return null
  const position = cyclePosition(program, block.startedOn, todayISO)
  if (!position) return null
  return position.week / program.cycleWeeks
}
