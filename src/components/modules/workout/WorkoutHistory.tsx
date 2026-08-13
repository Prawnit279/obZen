import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { db } from '@/db/dexie'
import { formatDateFull } from '@/lib/utils'
import { sessionHasActivity, loggedExercises, totalSets, belongsToProfile } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'

export function WorkoutHistory() {
  const navigate = useNavigate()
  const activeId = useProfileStore(s => s.activeId)

  // Read the table the live logging flow writes to (workoutDaySessions),
  // most-recent first.
  const sessions = useLiveQuery(
    () => db.workoutDaySessions.orderBy('date').reverse().limit(60).toArray(),
    []
  )

  if (!sessions) {
    return <div className="text-center py-8 text-[13px] text-noir-muted">Loading…</div>
  }

  // Only the active profile's days, and only ones with real training —
  // completed or with logged sets. Empty placeholder days stay hidden.
  const logged = sessions.filter(s => belongsToProfile(s, activeId) && sessionHasActivity(s))

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
        const doneCount = loggedExercises(session).length
        const setCount = totalSets(session)
        return (
          <button
            key={session.id}
            onClick={() => navigate(`/workout/session/${session.id}`)}
            className="w-full text-left rounded-[2px] p-4 flex items-center justify-between gap-3 transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="min-w-0">
              <div className="text-[15px]" style={{ color: 'var(--accent)' }}>{formatDateFull(session.date)}</div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
                {session.dayLabel}{session.focus ? ` · ${session.focus}` : ''}
              </div>
              <div className="text-[11px] uppercase tracking-widest mt-1.5" style={{ color: 'var(--dim)' }}>
                {doneCount} exercise{doneCount === 1 ? '' : 's'} · {setCount} set{setCount === 1 ? '' : 's'}
                {session.completedAt && <span style={{ color: 'var(--complete-text)' }}> · complete</span>}
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--dim)' }} className="shrink-0" />
          </button>
        )
      })}
    </div>
  )
}
