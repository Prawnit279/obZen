import type { ExerciseSessionState } from '@/db/dexie'

interface Props {
  dayLabel: string
  focus: string
  exercises: ExerciseSessionState[]
}

export function DaySummaryBar({ dayLabel, focus, exercises }: Props) {
  const complete = exercises.filter(e => e.status === 'complete').length
  const skipped = exercises.filter(e => e.status === 'skipped').length
  const pending = exercises.filter(e => e.status === 'pending').length
  const total = exercises.length
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0

  return (
    <div
      className="rounded-[2px] px-4 py-3 space-y-2"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Label row */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            {dayLabel}
          </span>
          <span className="text-[10px] uppercase tracking-widest ml-2" style={{ color: 'var(--dim)' }}>
            · {focus}
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--dim)' }}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] rounded-full" style={{ background: 'var(--elevated)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--complete-border)' }}
        />
      </div>

      {/* Counts */}
      <div className="flex gap-4 text-[10px] uppercase tracking-widest">
        <span style={{ color: 'var(--complete-text)' }}>{complete} complete</span>
        <span style={{ color: 'var(--skip-text)' }}>{skipped} skipped</span>
        <span style={{ color: 'var(--dim)' }}>{pending} pending</span>
      </div>
    </div>
  )
}
