import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { db } from '@/db/dexie'
import type { WorkoutDaySession } from '@/db/dexie'
import { todayISO } from '@/lib/utils'
import { sessionHasActivity, loggedExercises, totalSets, belongsToProfile } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'
import { Card, CardHeader } from '@/components/ui/Card'

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Monday 00:00 of the week containing `base`. */
function startOfWeekMonday(base = new Date()): Date {
  const date = new Date(base)
  const offset = (date.getDay() + 6) % 7 // 0 = Monday
  date.setDate(date.getDate() - offset)
  date.setHours(0, 0, 0, 0)
  return date
}

export function WeekStrip() {
  const navigate = useNavigate()
  const activeId = useProfileStore(s => s.activeId)

  const monday = startOfWeekMonday()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
  const isoList = weekDates.map(isoDate)
  const today = todayISO()

  const sessions = useLiveQuery(
    () => db.workoutDaySessions.where('date').anyOf(isoList).toArray(),
    [isoList.join(',')]
  )

  // One entry per date — the session actually trained that day. Ignore empty
  // placeholders; prefer a completed session, then the one with the most sets.
  const rank = (s: WorkoutDaySession) => (s.completedAt ? 1_000_000 : 0) + totalSets(s)
  const byDate = new Map<string, WorkoutDaySession>()
  for (const s of sessions ?? []) {
    if (!belongsToProfile(s, activeId) || !sessionHasActivity(s)) continue
    const cur = byDate.get(s.date)
    if (!cur || rank(s) > rank(cur)) byDate.set(s.date, s)
  }

  return (
    <Card>
      <CardHeader label="This Week" />
      <div className="space-y-1">
        {weekDates.map((d, i) => {
          const iso = isoList[i]
          const session = byDate.get(iso)
          const isToday = iso === today
          const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
          const doneCount = session ? loggedExercises(session).length : 0

          const dayCol = (
            <div className="flex items-center gap-3 shrink-0 w-20">
              <span
                className="text-[11px] uppercase tracking-widest"
                style={{ color: isToday ? '#e2e2e2' : '#8a8a8a' }}
              >
                {weekday}
              </span>
              <span className="text-[13px] tabular-nums" style={{ color: isToday ? '#e2e2e2' : '#6f6f6f' }}>
                {d.getDate()}
              </span>
            </div>
          )

          if (!session) {
            return (
              <div
                key={iso}
                className="flex items-center justify-between py-2 px-2 rounded-[2px]"
                style={{ background: isToday ? '#1e1e1e' : 'transparent' }}
              >
                {dayCol}
                <span className="text-[12px]" style={{ color: '#555555' }}>—</span>
              </div>
            )
          }

          return (
            <button
              key={iso}
              onClick={() => navigate(`/workout/session/${session.id}`)}
              className="w-full flex items-center justify-between py-2 px-2 rounded-[2px] text-left transition-opacity hover:opacity-80"
              style={{ background: isToday ? '#1e1e1e' : 'transparent', border: '1px solid #323232' }}
            >
              {dayCol}
              <div className="flex-1 min-w-0 px-2">
                <div className="text-[13px] truncate" style={{ color: '#e2e2e2' }}>
                  {session.dayLabel}{session.focus ? ` · ${session.focus}` : ''}
                </div>
                <div className="text-[11px] uppercase tracking-widest" style={{ color: '#6f6f6f' }}>
                  {doneCount} exercise{doneCount === 1 ? '' : 's'}
                  {session.completedAt && <span style={{ color: '#86efac' }}> · complete</span>}
                </div>
              </div>
              <ChevronRight size={15} style={{ color: '#6f6f6f' }} className="shrink-0" />
            </button>
          )
        })}
      </div>
    </Card>
  )
}
