import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'

interface Props {
  exerciseId: string
  exerciseName: string
}

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatSessionDate(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00')
  return `${DAY_ABBR[d.getDay()]} ${d.getDate()}`
}

export function ExerciseHistory({ exerciseId, exerciseName }: Props) {
  // Query last 5 sessions where this exercise was complete
  const history = useLiveQuery(async () => {
    // Try new-style WorkoutDaySession first
    const daySessions = await db.workoutDaySessions
      .orderBy('date')
      .reverse()
      .filter(session =>
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
  }, [exerciseId, exerciseName])

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
        <div className="space-y-1">
          {history.map((entry, i) => (
            <div key={i} className="flex gap-3 items-baseline text-[11px]">
              <span className="shrink-0 tabular-nums w-12" style={{ color: '#555555' }}>
                {formatSessionDate(entry.date)}
              </span>
              <span className="text-[10px]" style={{ color: '#888888' }}>
                {entry.sets.map(s => (
                  `Set ${s.setNumber}: ${s.weight > 0 ? s.weight : '—'}×${s.reps}`
                )).join('  ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
