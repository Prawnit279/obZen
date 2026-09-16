import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import type { WorkoutDaySession } from '@/db/dexie'
import { belongsToProfile } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import { useProgressStore } from '@/store/useProgressStore'
import { realSets, loadedWeightLb, kgToLb } from '@/lib/progress'
import { COMPETITION_LIFT_IDS } from '@/data/obzen-program'
import type { IntakeAnswer, TopSet } from '@/lib/intake'

export interface Prefill { answer: IntakeAnswer; source: string }

const GOAL_FROM_DIRECTION: Record<string, string> = {
  lose: 'fat-loss',
  gain: 'muscle',
  maintain: 'maintain',
}

/**
 * Answers the app can already supply.
 *
 * Offered for confirmation, never applied on their own — asking again for a
 * number shown elsewhere reads as the app not paying attention, but filling one
 * in silently would put an answer nobody gave into the record the programme
 * is chosen from.
 */
export function useIntakePrefills(): Partial<Record<string, Prefill>> {
  const { activeId } = useProfileStore()
  const trainingDays = useProfileSettingsStore(s => s.trainingDays)
  const weightGoal = useProfileSettingsStore(s => s.weightGoal)
  const latestBodyweight = useProgressStore(s => s.latestBodyweight)

  const sessions = useLiveQuery<WorkoutDaySession[]>(
    () => db.workoutDaySessions.toArray(),
    []
  )
  const mine = (sessions ?? []).filter(s => belongsToProfile(s, activeId))

  const out: Partial<Record<string, Prefill>> = {
    'days-per-week': {
      answer: { kind: 'single', value: String(trainingDays) },
      source: `${trainingDays} days a week`,
    },
  }

  const direction = weightGoal?.direction
  if (direction && GOAL_FROM_DIRECTION[direction]) {
    out['primary-goal'] = {
      answer: { kind: 'single', value: GOAL_FROM_DIRECTION[direction] },
      source: `your weight goal — ${direction}`,
    }
  }

  const bwKg = latestBodyweight(activeId)
  if (bwKg != null && bwKg > 0) {
    const lb = Math.round(kgToLb(bwKg))
    out['bodyweight'] = { answer: { kind: 'number', value: lb }, source: `${lb} lb, last weigh-in` }
  }

  // Heaviest logged set per competition lift, as what would seed a training max.
  const best: TopSet[] = COMPETITION_LIFT_IDS.flatMap(id => {
    let top: TopSet | null = null
    for (const session of mine) {
      const ex = session.exercises.find(e => e.exerciseId === id)
      if (!ex) continue
      for (const set of realSets(ex)) {
        const weightLb = Math.round(loadedWeightLb(id, set))
        if (weightLb > 0 && (top === null || weightLb > top.weightLb)) {
          top = { exerciseId: id, weightLb, reps: set.reps }
        }
      }
    }
    return top ? [top] : []
  })
  if (best.length > 0) {
    out['top-sets'] = {
      answer: { kind: 'lifts', sets: best },
      source: `${best.length} lift${best.length === 1 ? '' : 's'} from your log`,
    }
  }

  return out
}
