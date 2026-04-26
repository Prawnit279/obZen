import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'

const KEY_EXERCISES = ['Barbell Squat', 'Weighted Pull-ups', 'Deadlift']
const LINE_COLORS = ['#d4d4d4', '#888888', '#555555']

function parseWeight(w: string): number {
  if (!w || w === '—' || w.toLowerCase() === 'bw') return 0
  const m = w.match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : 0
}

function dateToMs(iso: string): number {
  return new Date(iso + 'T12:00:00').getTime()
}

export function ProgressOverloadChart() {
  const logs = useLiveQuery(
    () => db.exerciseLogs.toArray(),
    []
  )

  if (!logs) return <Empty text="Loading…" />

  // Filter to key exercises, compute max working weight per date
  const seriesMap: Record<string, Record<string, number>> = {}
  for (const ex of KEY_EXERCISES) seriesMap[ex] = {}

  for (const log of logs) {
    if (!KEY_EXERCISES.includes(log.exerciseName)) continue
    const maxW = log.sets
      .filter(s => s.completed && !s.isWarmup)
      .reduce((acc, s) => Math.max(acc, parseWeight(s.weight)), 0)
    if (maxW === 0) continue
    const prev = seriesMap[log.exerciseName][log.date] ?? 0
    seriesMap[log.exerciseName][log.date] = Math.max(prev, maxW)
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

  const activeSeries = KEY_EXERCISES.filter(ex => Object.keys(seriesMap[ex]).length > 0)

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
              <line x1={ml} y1={y} x2={W - mr} y2={y} stroke="#2a2a2a" strokeWidth="1" />
              <text x={ml - 3} y={y + 3} fontSize="7" fill="#555555" textAnchor="end">
                {Math.round(val)}
              </text>
            </g>
          )
        })}
        <line x1={ml} y1={mt} x2={ml} y2={mt + ch} stroke="#2a2a2a" strokeWidth="1" />

        {/* Lines + dots */}
        {KEY_EXERCISES.map((ex, li) => {
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
            <text x={toX(allDates[0])} y={H - mb + 12} fontSize="7" fill="#555555" textAnchor="start">
              {new Date(allDates[0] + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </text>
            <text x={toX(allDates[allDates.length - 1])} y={H - mb + 12}
              fontSize="7" fill="#555555" textAnchor="end">
              {new Date(allDates[allDates.length - 1] + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </text>
          </>
        )}
      </svg>

      <div className="flex gap-4 flex-wrap mt-1">
        {activeSeries.map(ex => (
          <div key={ex} className="flex items-center gap-1">
            <div className="w-4 h-[2px]" style={{ background: LINE_COLORS[KEY_EXERCISES.indexOf(ex)] }} />
            <span className="text-[8px] uppercase tracking-widest text-noir-dim">
              {ex === 'Weighted Pull-ups' ? 'Pull-ups (+lbs)' : ex}
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
