import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { db } from '@/db/dexie'
import { formatDateFull } from '@/lib/utils'

export function WorkoutHistory() {
  const navigate = useNavigate()

  // Read the table the live logging flow writes to (workoutDaySessions),
  // most-recent first.
  const sessions = useLiveQuery(
    () => db.workoutDaySessions.orderBy('date').reverse().limit(60).toArray(),
    []
  )

  if (!sessions) {
    return <div className="text-center py-8 text-[13px] text-noir-muted">Loading…</div>
  }

  // Only surface days that actually have exercises logged.
  const logged = sessions.filter(s => s.exercises.length > 0)

  if (logged.length === 0) {
    return (
      <div className="text-center py-10 text-[13px] text-noir-muted">
        No sessions logged yet. Load a day and log some sets to see your history here.
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {logged.map(session => {
        const total = session.exercises.length
        const complete = session.exercises.filter(e => e.status === 'complete').length
        const setCount = session.exercises.reduce((n, e) => n + e.sets.length, 0)
        return (
          <button
            key={session.id}
            onClick={() => navigate(`/workout/session/${session.id}`)}
            className="w-full text-left rounded-[2px] p-4 flex items-center justify-between gap-3 transition-opacity hover:opacity-80"
            style={{ background: '#161616', border: '1px solid #323232' }}
          >
            <div className="min-w-0">
              <div className="text-[15px]" style={{ color: '#e2e2e2' }}>{formatDateFull(session.date)}</div>
              <div className="text-[13px] mt-1" style={{ color: '#a6a6a6' }}>
                {session.dayLabel}{session.focus ? ` · ${session.focus}` : ''}
              </div>
              <div className="text-[11px] uppercase tracking-widest mt-1.5" style={{ color: '#6f6f6f' }}>
                {complete}/{total} done · {setCount} sets
                {session.completedAt && <span style={{ color: '#86efac' }}> · complete</span>}
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#6f6f6f' }} className="shrink-0" />
          </button>
        )
      })}
    </div>
  )
}
