import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import { LIBRARY_BY_ID } from '@/data/obzen-program'
import { belongsToProfile } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'
import { PROFILES } from '@/config/profiles'
import { realSets, setWeightLb } from '@/lib/progress'

const LINE_COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)']

function dateToMs(iso: string): number {
  return new Date(iso + 'T12:00:00').getTime()
}

export function ProgressOverloadChart() {
  const { activeId } = useProfileStore()
  const keyLiftIds = PROFILES[activeId].progress.keyLiftIds
  const sessions = useLiveQuery(() => db.workoutDaySessions.toArray(), [])

  if (!sessions) return <Empty text="Loading…" />

  // Heaviest working weight per key lift per date, for the active profile.
  const seriesMap: Record<string, Record<string, number>> = {}
  for (const id of keyLiftIds) seriesMap[id] = {}

  for (const session of sessions) {
    if (!belongsToProfile(session, activeId)) continue
    for (const ex of session.exercises) {
      if (!keyLiftIds.includes(ex.exerciseId)) continue
      const maxW = realSets(ex).reduce((acc, s) => Math.max(acc, setWeightLb(s)), 0)
      if (maxW === 0) continue
      const prev = seriesMap[ex.exerciseId][session.date] ?? 0
      seriesMap[ex.exerciseId][session.date] = Math.max(prev, maxW)
    }
  }

  // Collect all dates
  const allDates = Array.from(
    new Set(Object.values(seriesMap).flatMap(m => Object.keys(m)))
  ).sort()

  if (allDates.length === 0) return <Empty text="Log workouts to see overload progress" />

  const minMs = dateToMs(allDates[0])
  const maxMs = dateToMs(allDates[allDates.length - 1])
  const msRange = Math.max(maxMs - minMs, 1)

  // Max weight across all series
  const allWeights = Object.values(seriesMap).flatMap(m => Object.values(m))
  const maxW = Math.max(...allWeights, 1)
  const minW = Math.max(Math.min(...allWeights) - 5, 0)
  const wRange = Math.max(maxW - minW, 1)

  const W = 300; const H = 140
  const ml = 30; const mr = 6; const mt = 10; const mb = 28
  const cw = W - ml - mr; const ch = H - mt - mb

  function toX(iso: string): number {
    return ml + ((dateToMs(iso) - minMs) / msRange) * cw
  }

  function toY(w: number): number {
    return mt + ch - ((w - minW) / wRange) * ch
  }

  const activeSeries = keyLiftIds.filter(ex => Object.keys(seriesMap[ex]).length > 0)

  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-2">
        Progressive Overload · working weight · lbs
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Grid */}
        {[0, 0.5, 1].map(t => {
          const y = mt + ch * (1 - t)
          const val = minW + wRange * t
          return (
            <g key={t}>
              <line x1={ml} y1={y} x2={W - mr} y2={y} stroke="var(--dim)" strokeWidth="1" />
              <text x={ml - 3} y={y + 3} fontSize="7" fill="var(--dim)" textAnchor="end">
                {Math.round(val)}
              </text>
            </g>
          )
        })}
        <line x1={ml} y1={mt} x2={ml} y2={mt + ch} stroke="var(--dim)" strokeWidth="1" />

        {/* Lines + dots */}
        {keyLiftIds.map((ex, li) => {
          const pts = Object.entries(seriesMap[ex])
            .sort((a, b) => a[0].localeCompare(b[0]))
          if (pts.length === 0) return null
          const color = LINE_COLORS[li]
          const pathD = pts.map(([date, w], pi) =>
            `${pi === 0 ? 'M' : 'L'} ${toX(date).toFixed(1)} ${toY(w).toFixed(1)}`
          ).join(' ')
          return (
            <g key={ex}>
              <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" />
              {pts.map(([date, w]) => (
                <circle key={date} cx={toX(date)} cy={toY(w)} r="3" fill={color} />
              ))}
            </g>
          )
        })}

        {/* X axis date labels */}
        {allDates.length >= 2 && (
          <>
            <text x={toX(allDates[0])} y={H - mb + 12} fontSize="7" fill="var(--dim)" textAnchor="start">
              {new Date(allDates[0] + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </text>
            <text x={toX(allDates[allDates.length - 1])} y={H - mb + 12}
              fontSize="7" fill="var(--dim)" textAnchor="end">
              {new Date(allDates[allDates.length - 1] + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </text>
          </>
        )}
      </svg>

      <div className="flex gap-4 flex-wrap mt-1">
        {activeSeries.map(ex => (
          <div key={ex} className="flex items-center gap-1">
            <div className="w-4 h-[2px]" style={{ background: LINE_COLORS[keyLiftIds.indexOf(ex)] }} />
            <span className="text-[8px] uppercase tracking-widest text-noir-dim">
              {LIBRARY_BY_ID[ex]?.name ?? ex}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="h-36 flex items-center justify-center text-[10px] uppercase tracking-widest text-noir-dim">
      {text}
    </div>
  )
}
