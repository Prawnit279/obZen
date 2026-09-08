import { Card } from '@/components/ui/Card'
import type { Adherence } from '@/lib/progressTrends'

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** Each cell states its own meaning; colour alone never carries it. */
const DAY_FILL: Record<string, string> = {
  trained: 'var(--violet-400)',
  missed:  'rgba(248,113,113,0.30)',
  rest:    'rgba(255,255,255,0.05)',
  future:  'transparent',
}

/**
 * Planned training against what happened, eight weeks at a glance.
 *
 * A missed day is only a miss once it is in the past, and a session on a rest
 * day is counted as extra rather than as being off-plan — doing more than
 * planned should not read as a failure.
 */
export function AdherenceCard({ data }: { data: Adherence }) {
  const rate = data.planned > 0 ? Math.round((data.trained / data.planned) * 100) : null
  return (
    <Card label="Plan vs actual">
      <div className="flex items-baseline" style={{ gap: 8 }}>
        <span
          style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {rate === null ? '—' : `${rate}%`}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          {rate === null
            ? 'nothing scheduled yet'
            : `${data.trained} of ${data.planned} planned sessions`}
        </span>
      </div>

      <div className="flex flex-col" style={{ gap: 3 }}>
        <div className="flex" style={{ gap: 3 }}>
          {WEEKDAY_INITIALS.map((d, i) => (
            <span
              key={i}
              className="flex-1 text-center uppercase"
              style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--ink-faint)' }}
            >
              {d}
            </span>
          ))}
        </div>
        {data.weeks.map((week, w) => (
          <div key={w} className="flex" style={{ gap: 3 }}>
            {week.map(day => (
              <span
                key={day.date}
                title={`${day.date} — ${day.state}`}
                aria-label={`${day.date}, ${day.state}`}
                className="flex-1"
                style={{
                  height: 14,
                  borderRadius: 4,
                  background: DAY_FILL[day.state],
                  border: day.state === 'future' ? '1px solid var(--hairline-soft)' : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap" style={{ gap: '6px 14px' }}>
        {(['trained', 'missed', 'rest'] as const).map(k => (
          <span key={k} className="flex items-center" style={{ gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: DAY_FILL[k] }} />
            <span className="capitalize" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{k}</span>
          </span>
        ))}
        {data.extra > 0 && (
          <span style={{ fontSize: 11, color: 'var(--ok)' }}>
            +{data.extra} unplanned {data.extra === 1 ? 'session' : 'sessions'}
          </span>
        )}
      </div>
    </Card>
  )
}
