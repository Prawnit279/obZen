import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/db/dexie'
import type { ExerciseSessionState } from '@/db/dexie'
import { formatDateFull } from '@/lib/utils'
import { setWeightLb } from '@/lib/progress'
import { setUnitsFor, formatSet } from '@/lib/setUnits'
import { isExerciseLogged } from '@/lib/workoutSession'

const STATUS_LABEL: Record<ExerciseSessionState['status'], { text: string; color: string }> = {
  complete: { text: 'Complete', color: 'var(--complete-text)' },
  skipped:  { text: 'Skipped',  color: 'var(--skip-text)' },
  pending:  { text: 'Pending',  color: 'var(--ink-faint)' },
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
      style={{ color: 'var(--ink-dim)' }}
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
        <div className="text-center py-10 text-[13px]" style={{ color: 'var(--ink-faint)' }}>Loading session…</div>
      </div>
    )
  }
  if (!session) {
    return (
      <div className="page-container space-y-4">
        {back}
        <div className="text-center py-10 text-[13px]" style={{ color: 'var(--ink-faint)' }}>Session not found.</div>
      </div>
    )
  }

  // A workout can be finished after the fact — mark a past session complete
  // (or reopen it) without having to hunt for the right date in Train.
  const toggleComplete = async () => {
    if (session.id == null) return
    await db.workoutDaySessions.update(session.id, {
      completedAt: session.completedAt ? undefined : new Date(`${session.date}T12:00:00`).toISOString(),
    })
  }

  const map = Object.fromEntries(session.exercises.map(e => [e.exerciseId, e]))
  const ordered = session.order.map(eid => map[eid]).filter(Boolean) as ExerciseSessionState[]
  const allOrdered = ordered.length > 0 ? ordered : session.exercises
  // Only what was actually done — completed or with logged sets. Skipped and
  // untouched exercises are noise in a past session's detail.
  const exercises = allOrdered.filter(isExerciseLogged)
  const setCount = exercises.reduce((n, e) => n + e.sets.length, 0)

  return (
    <div className="page-container space-y-4">
      {back}

      {/* Header */}
      <div className="pt-1">
        <div
          className="uppercase"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
        >
          {session.dayLabel}{session.focus ? ` · ${session.focus}` : ''}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--ink)' }}>
          {formatDateFull(session.date)}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[12px]" style={{ color: 'var(--ink-faint)' }}>
            {exercises.length} exercise{exercises.length === 1 ? '' : 's'} · {setCount} set{setCount === 1 ? '' : 's'}
          </span>
          {session.completedAt && (
            <span
              className="text-[11px] uppercase tracking-widest px-2.5 py-0.5 rounded-[var(--r-pill)]"
              style={{ color: 'var(--complete-text)', border: '1px solid var(--complete-border)' }}
            >
              Workout Complete
            </span>
          )}
        </div>

        {/* Finish (or reopen) a workout after the day it was trained. */}
        <button
          onClick={toggleComplete}
          className="mt-3 w-full py-2.5 rounded-[var(--r-control)] text-[12px] uppercase tracking-widest transition-opacity hover:opacity-80"
          style={session.completedAt
            ? { border: '1px solid var(--border)', color: 'var(--ink-dim)' }
            : { border: '1px solid var(--complete-border)', color: 'var(--complete-text)' }}
        >
          {session.completedAt ? 'Reopen workout' : 'Mark workout complete'}
        </button>

        {/* Editing sets happens in Train, on this session's own date. */}
        <button
          onClick={() => navigate(`/workout?date=${session.date}&day=${encodeURIComponent(session.dayLabel)}`)}
          className="mt-2 w-full py-2.5 rounded-[var(--r-control)] text-[12px] uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ border: '1px solid var(--border)', color: 'var(--ink-dim)' }}
        >
          Edit sets for this day
        </button>
      </div>

      {/* Exercises */}
      {exercises.length === 0 ? (
        <div className="text-center py-10 text-[13px]" style={{ color: 'var(--ink-faint)' }}>
          No exercises were logged for this day.
        </div>
      ) : (
        <div className="space-y-2.5">
          {exercises.map(ex => {
            const status = STATUS_LABEL[ex.status]
            return (
              <div
                key={ex.exerciseId}
                className="rounded-[var(--r-card)] p-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px]" style={{ color: 'var(--ink)' }}>{displayName(ex)}</div>
                    {(ex.target || ex.muscle) && (
                      <div className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--ink-dim)' }}>
                        {ex.target}
                        {ex.muscle && <span className="ml-2 normal-case capitalize">{ex.muscle}</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] uppercase tracking-widest shrink-0" style={{ color: status.color }}>
                    {status.text}
                  </span>
                </div>

                {/* Logged sets */}
                {ex.sets.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {ex.sets.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[13px] py-1.5 px-2 rounded-[var(--r-control)]"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <span style={{ color: 'var(--ink-faint)' }} className="uppercase tracking-widest text-[11px]">
                          Set {s.setNumber}
                        </span>
                        <span className="font-mono tabular-nums" style={{ color: 'var(--ink)' }}>
                          {formatSet(setUnitsFor(ex.exerciseId), setWeightLb(s), s.reps)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  ex.status !== 'skipped' && (
                    <div className="mt-2 text-[12px]" style={{ color: 'var(--ink-faint)' }}>No sets logged for this exercise.</div>
                  )
                )}

                {ex.note && (
                  <div className="mt-2 text-[12px] italic" style={{ color: 'var(--ink-dim)' }}>{ex.note}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
