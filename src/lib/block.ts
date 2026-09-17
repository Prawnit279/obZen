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
import { realSets, loadedWeightKg, epley1RM, kgToLb } from '@/lib/progress'
import type { WorkoutDaySession } from '@/db/dexie'
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

// ── What actually happened on the top set ────────────────────────────────────

export interface AmrapAttempt {
  date: string
  exerciseId: string
  name: string
  /** 1-based week within the cycle, and which cycle. */
  week: number
  cycle: number
  /** Reps the wave asked for — 5, 3 or 1 — read from the wave, not restated. */
  targetReps: number
  reps: number
  /** Positive when more reps were done than prescribed, negative when fewer. */
  repsVsTarget: number
  /** What was lifted, bar included. */
  weightLb: number
  /**
   * What the week called for at the block's current training max. Shown so a
   * row lifted at some other weight is visible as one rather than silently
   * counted as a hit or a miss — and note "current": raising the training max
   * mid-block re-bases this for earlier rows, while `reps`, `targetReps` and
   * the comparison between them stand on their own.
   */
  prescribedWeightLb: number
  e1rmLb: number
}

/**
 * Every top set logged under this block for one lift, against what was asked.
 *
 * The AMRAP set is read as the heaviest set of that lift on the day, which is
 * what the wave makes it — the third set is the heaviest of the three, and
 * Boring But Big's supplemental sits well below all of them. Joker sets are the
 * exception: taken and logged, they would outweigh the top set and be reported
 * in its place. The weight is returned alongside the reps so such a row reads
 * as the heavier set it was.
 *
 * Deload weeks are absent because the deload prescribes no AMRAP, and so is a
 * lift the block carries no training max for — without one there is no wave and
 * so no target to have hit or missed.
 */
export function amrapHistory(
  block: ActiveBlock,
  sessions: WorkoutDaySession[],
  exerciseId: string
): AmrapAttempt[] {
  const program = programById(block.programId)
  if (!program || !WAVE_PROGRAMS.has(program.id)) return []

  const tm = block.trainingMaxLb[exerciseId]
  if (!(tm > 0)) return []

  const attempts: AmrapAttempt[] = []

  for (const s of sessions) {
    const position = cyclePosition(program, block.startedOn, s.date)
    if (!position) continue

    const ex = s.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    const sets = realSets(ex)
    if (sets.length === 0) continue

    const waveWeek = waveWeekFor(position.week, program.deloadWeek)
    const prescribed = fiveThreeOneWave(tm, waveWeek).find(w => w.isAmrap)
    // This is also what drops the deload, and deliberately the only thing that
    // does: the deload is skipped because its week prescribes no AMRAP set, a
    // fact read off the wave rather than asserted a second time here. A guard
    // on `isDeload` alongside this one passed every test with either half
    // removed, which is the signature of a duplicated rule.
    if (!prescribed) continue

    const top = sets.reduce((best, set) =>
      loadedWeightKg(exerciseId, set) > loadedWeightKg(exerciseId, best) ? set : best)

    attempts.push({
      date: s.date,
      exerciseId,
      name: exerciseNameFor(exerciseId),
      week: position.week,
      cycle: position.cycle,
      targetReps: Number(prescribed.reps.replace('+', '')),
      reps: top.reps,
      repsVsTarget: top.reps - Number(prescribed.reps.replace('+', '')),
      weightLb: kgToLb(loadedWeightKg(exerciseId, top)),
      prescribedWeightLb: prescribed.weight,
      e1rmLb: kgToLb(epley1RM(loadedWeightKg(exerciseId, top), top.reps)),
    })
  }

  return attempts.sort((a, b) => a.date.localeCompare(b.date))
}
