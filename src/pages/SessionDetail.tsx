import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/db/dexie'
import type { ExerciseSessionState } from '@/db/dexie'
import { formatDateFull } from '@/lib/utils'

const STATUS_LABEL: Record<ExerciseSessionState['status'], { text: string; color: string }> = {
  complete: { text: 'Complete', color: '#86efac' },
  skipped:  { text: 'Skipped',  color: '#fca5a5' },
  pending:  { text: 'Pending',  color: '#6f6f6f' },
}

function displayName(ex: ExerciseSessionState): string {
  return ex.name ?? ex.exerciseId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessionId = Number(id)

  const session = useLiveQuery(
    () => (Number.isFinite(sessionId) ? db.workoutDaySessions.get(sessionId) : undefined),
    [sessionId]
  )

  const back = (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-1.5 text-[12px] uppercase tracking-widest transition-opacity hover:opacity-70"
      style={{ color: '#a6a6a6' }}
    >
      <ArrowLeft size={14} /> Back
    </button>
  )

  // useLiveQuery returns undefined while loading and for a missing row alike;
  // distinguish by whether the query has resolved at least once.
  if (session === undefined) {
    return (
      <div className="page-container space-y-4">
        {back}
        <div className="text-center py-10 text-[13px]" style={{ color: '#6f6f6f' }}>Loading session…</div>
      </div>
    )
  }
  if (!session) {
    return (
      <div className="page-container space-y-4">
        {back}
        <div className="text-center py-10 text-[13px]" style={{ color: '#6f6f6f' }}>Session not found.</div>
      </div>
    )
  }

  const map = Object.fromEntries(session.exercises.map(e => [e.exerciseId, e]))
  const ordered = session.order.map(eid => map[eid]).filter(Boolean) as ExerciseSessionState[]
  const exercises = ordered.length > 0 ? ordered : session.exercises
  const completeCount = exercises.filter(e => e.status === 'complete').length

  return (
    <div className="page-container space-y-4">
      {back}

      {/* Header */}
      <div className="pt-1">
        <div className="text-[11px] uppercase tracking-widest" style={{ color: '#a6a6a6' }}>
          {session.dayLabel}{session.focus ? ` · ${session.focus}` : ''}
        </div>
        <div className="text-[18px] leading-tight" style={{ color: '#e2e2e2' }}>
          {formatDateFull(session.date)}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[12px]" style={{ color: '#6f6f6f' }}>
            {completeCount}/{exercises.length} exercises complete
          </span>
          {session.completedAt && (
            <span
              className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-[2px]"
              style={{ color: '#86efac', border: '1px solid #166534' }}
            >
              Workout Complete
            </span>
          )}
        </div>
      </div>

      {/* Exercises */}
      {exercises.length === 0 ? (
        <div className="text-center py-10 text-[13px]" style={{ color: '#6f6f6f' }}>
          No exercises were logged for this day.
        </div>
      ) : (
        <div className="space-y-2.5">
          {exercises.map(ex => {
            const status = STATUS_LABEL[ex.status]
            return (
              <div
                key={ex.exerciseId}
                className="rounded-[2px] p-3.5"
                style={{ background: '#161616', border: '1px solid #323232' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px]" style={{ color: '#e2e2e2' }}>{displayName(ex)}</div>
                    {(ex.target || ex.muscle) && (
                      <div className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: '#8a8a8a' }}>
                        {ex.target}
                        {ex.muscle && <span className="ml-2 normal-case capitalize">{ex.muscle}</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest shrink-0" style={{ color: status.color }}>
                    {status.text}
                  </span>
                </div>

                {/* Logged sets */}
                {ex.sets.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {ex.sets.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[13px] py-1.5 px-2 rounded-[2px]"
                        style={{ background: '#1e1e1e' }}
                      >
                        <span style={{ color: '#6f6f6f' }} className="uppercase tracking-widest text-[11px]">
                          Set {s.setNumber}
                        </span>
                        <span className="font-mono tabular-nums" style={{ color: '#e2e2e2' }}>
                          {s.weight}{s.unit} × {s.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  ex.status !== 'skipped' && (
                    <div className="mt-2 text-[12px]" style={{ color: '#555555' }}>No sets logged.</div>
                  )
                )}

                {ex.note && (
                  <div className="mt-2 text-[12px] italic" style={{ color: '#8a8a8a' }}>{ex.note}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
