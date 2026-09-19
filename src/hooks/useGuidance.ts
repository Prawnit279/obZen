import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import type { WorkoutDaySession } from '@/db/dexie'
import { belongsToProfile, sessionHasActivity } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'
import { useProgressStore } from '@/store/useProgressStore'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import { useBlockStore } from '@/store/useBlockStore'
import { useIntakeStore } from '@/store/useIntakeStore'
import { getScheduledDay } from '@/data/obzen-program'
import { sessionLoads, acwr, adherence } from '@/lib/progressTrends'
import { guidance } from '@/lib/guidance'
import type { Tip } from '@/lib/guidance'
import { todayISO } from '@/lib/utils'

/** Shared so the store selector returns a stable reference when empty. */
const NO_WEIGH_INS: never[] = []

/**
 * The guidance readings, gathered from the stores and the log.
 *
 * Home is the only caller. The assembly lives here rather than in the page
 * because it reaches into five stores and the session log, and a page that
 * does that is a page doing two jobs — but it is a single-consumer hook, not a
 * shared one. (An earlier version of this comment claimed it existed so Home
 * and Progress could not disagree; Progress stopped rendering the card in the
 * same commit that created this file, so that was never true.)
 *
 * Returns an empty list while the log is still loading, so the card is absent
 * rather than briefly wrong: with no sessions yet read, adherence would show a
 * plan kept none of the time.
 */
export function useGuidance(): Tip[] {
  const { activeId } = useProfileStore()
  const trainingDays = useProfileSettingsStore(st => st.trainingDays)
  const weightGoal = useProfileSettingsStore(st => st.weightGoal)
  const block = useBlockStore(st => st.block)
  const answers = useIntakeStore(st => st.answers)
  const weighIns = useProgressStore(s => s.bodyweight[activeId] ?? NO_WEIGH_INS)

  const sessions = useLiveQuery<WorkoutDaySession[]>(
    () => db.workoutDaySessions.orderBy('date').toArray(),
    []
  )

  if (!sessions) return []

  const mine = sessions.filter(s => belongsToProfile(s, activeId) && sessionHasActivity(s))
  const today = todayISO()

  return guidance({
    settings: { trainingDays, weightGoal },
    answers,
    block,
    sessions: mine,
    // Kept sorted oldest first by the store, so the last entry is the latest.
    lastWeighInISO: weighIns.length > 0 ? weighIns[weighIns.length - 1].date : null,
    adherence: adherence(mine, date => getScheduledDay(trainingDays, date).kind === 'train', today),
    load: acwr(sessionLoads(mine), today),
    todayISO: today,
  })
}
