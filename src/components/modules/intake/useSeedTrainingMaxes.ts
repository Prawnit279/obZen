import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import type { WorkoutDaySession } from '@/db/dexie'
import { belongsToProfile } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'
import { bestCurrentE1RM, kgToLb } from '@/lib/progress'
import { trainingMax } from '@/lib/strengthTools'
import { COMPETITION_LIFT_IDS } from '@/data/obzen-program'

/**
 * Training maxes to start a block with, from what has actually been lifted.
 *
 * A lift with nothing logged gets no entry at all rather than a guessed one —
 * the block card then shows it as missing, which is true and fixable, instead
 * of prescribing percentages of a number nobody ever lifted.
 */
export function useSeedTrainingMaxes(): () => Record<string, number> {
  const { activeId } = useProfileStore()
  const sessions = useLiveQuery<WorkoutDaySession[]>(() => db.workoutDaySessions.toArray(), [])
  const mine = (sessions ?? []).filter(s => belongsToProfile(s, activeId))

  return () => {
    const out: Record<string, number> = {}
    for (const id of COMPETITION_LIFT_IDS) {
      const e1rmKg = bestCurrentE1RM(mine, id)
      if (e1rmKg > 0) out[id] = trainingMax(kgToLb(e1rmKg))
    }
    return out
  }
}
