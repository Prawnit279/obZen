import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import { belongsToProfile } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'

interface Props {
  exerciseId: string
  exerciseName: string
}

function formatSessionDate(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00')
  // Full date so recency is unambiguous, e.g. "Wed, 10 Aug 2026".
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function ExerciseHistory({ exerciseId, exerciseName }: Props) {
  const activeId = useProfileStore(s => s.activeId)

  // Last 5 of the active profile's sessions where this exercise was completed
  const history = useLiveQuery(async () => {
    const daySessions = await db.workoutDaySessions
      .orderBy('date')
      .reverse()
      .filter(session =>
        belongsToProfile(session, activeId) &&
        session.exercises.some(
          e => (e.exerciseId === exerciseId || e.exerciseId === exerciseName.toLowerCase().replace(/\s+/g, '-'))
            && e.status === 'complete'
            && e.sets.length > 0
        )
      )
      .limit(5)
      .toArray()

    return daySessions.map(session => {
      const ex = session.exercises.find(
        e => e.exerciseId === exerciseId || e.exerciseId === exerciseName.toLowerCase().replace(/\s+/g, '-')
      )!
      return { date: session.date, sets: ex.sets }
    })
  }, [exerciseId, exerciseName, activeId])

  return (
    <div
      className="px-4 pb-3 pt-2 space-y-2"
      style={{ background: '#0d0d0d', borderTop: '1px solid #2a2a2a' }}
    >
      <div className="text-[9px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>
        Previous Sessions
      </div>

      {!history || history.length === 0 ? (
        <p className="text-[11px]" style={{ color: '#555555' }}>
          No previous logs
        </p>
      ) : (
        <div className="space-y-1.5">
          {history.map((entry, i) => (
            <div key={i} className="space-y-0.5">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: '#6f6f6f' }}>
                {formatSessionDate(entry.date)}
              </div>
              <div className="text-[11px]" style={{ color: '#a6a6a6' }}>
                {entry.sets.map(s => (
                  `Set ${s.setNumber}: ${s.weight > 0 ? s.weight : '—'}×${s.reps}`
                )).join('  ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
