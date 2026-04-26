import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export function WorkoutHistory() {
  const sessions = useLiveQuery(
    () => db.workoutSessions
      .orderBy('date')
      .reverse()
      .limit(20)
      .toArray(),
    []
  )

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-[12px] text-noir-muted">
        No sessions logged yet. Complete your first workout to see history.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map(session => (
        <Card key={session.id} className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-noir-accent">{session.dayLabel}</div>
            <div className="text-[11px] text-noir-dim mt-0.5">{formatDate(session.date)}</div>
          </div>
          <Badge variant={session.completedAt ? 'accent' : 'dim'}>
            {session.completedAt ? 'Done' : 'Incomplete'}
          </Badge>
        </Card>
      ))}
    </div>
  )
}
