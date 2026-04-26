import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import { RUDIMENTS } from '@/data/rudiments'

const RUDIMENT_NAMES = new Set(RUDIMENTS.map(r => r.name))

function categorize(focusArea: string): string {
  if (RUDIMENT_NAMES.has(focusArea)) return 'Rudiment'
  if (focusArea.includes('·')) return 'Lesson'
  const lower = focusArea.toLowerCase()
  if (lower.includes('song') || lower.includes('play-along')) return 'Song'
  return 'Groove / Free'
}

const SLICE_COLORS = ['#d4d4d4', '#a0a0a0', '#777777', '#444444']
const CATEGORIES = ['Rudiment', 'Lesson', 'Song', 'Groove / Free']

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutArc(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number): string {
  const span = a1 - a0
  if (span >= 359.99) {
    const p1 = polar(cx, cy, ro, 0); const p2 = polar(cx, cy, ro, 180)
    const p3 = polar(cx, cy, ri, 180); const p4 = polar(cx, cy, ri, 0)
    return [
      `M ${p1.x} ${p1.y} A ${ro} ${ro} 0 1 1 ${p2.x} ${p2.y}`,
      `A ${ro} ${ro} 0 1 1 ${p1.x} ${p1.y}`,
      `M ${p3.x} ${p3.y} A ${ri} ${ri} 0 1 0 ${p4.x} ${p4.y}`,
      `A ${ri} ${ri} 0 1 0 ${p3.x} ${p3.y} Z`,
    ].join(' ')
  }
  const large = span > 180 ? 1 : 0
  const p1 = polar(cx, cy, ro, a0); const p2 = polar(cx, cy, ro, a1)
  const p3 = polar(cx, cy, ri, a1); const p4 = polar(cx, cy, ri, a0)
  return `M ${p1.x} ${p1.y} A ${ro} ${ro} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${ri} ${ri} 0 ${large} 0 ${p4.x} ${p4.y} Z`
}

function fmtMin(min: number): string {
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

export function DrumPieChart() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const startDate = cutoff.toISOString().slice(0, 10)

  const sessions = useLiveQuery(
    () => db.drumSessions.where('date').aboveOrEqual(startDate).toArray(),
    [startDate]
  )

  if (!sessions) return <Empty text="Loading…" />
  if (sessions.length === 0) return <Empty text="No drum sessions in 30 days" />

  const totals: Record<string, number> = {}
  for (const cat of CATEGORIES) totals[cat] = 0
  for (const s of sessions) {
    const cat = categorize(s.focusArea)
    totals[cat] = (totals[cat] ?? 0) + s.duration
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)
  if (grandTotal === 0) return <Empty text="No drum data" />

  const cx = 65; const cy = 62; const ro = 50; const ri = 28
  const W = 220; const H = 130

  let startDeg = 0
  const slices = CATEGORIES.map((cat, i) => {
    const span = (totals[cat] / grandTotal) * 360
    const slice = { cat, span, startDeg, color: SLICE_COLORS[i] }
    startDeg += span
    return slice
  }).filter(s => s.span > 0)

  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-2">
        Practice Breakdown · last 30 days · {fmtMin(grandTotal)} total
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {slices.map(s => (
          <path key={s.cat}
            d={donutArc(cx, cy, ro, ri, s.startDeg, s.startDeg + s.span)}
            fill={s.color}
          />
        ))}
        <text x={cx} y={cy + 4} fontSize="9" fill="#888888" textAnchor="middle">
          {sessions.length} sess.
        </text>

        {/* Legend */}
        {CATEGORIES.map((cat, i) => {
          const min = totals[cat]
          if (min === 0) return null
          const pct = Math.round((min / grandTotal) * 100)
          return (
            <g key={cat} transform={`translate(128, ${16 + i * 26})`}>
              <rect width="8" height="8" rx="1" fill={SLICE_COLORS[i]} />
              <text x="12" y="8" fontSize="8" fill="#d4d4d4">{cat}</text>
              <text x="12" y="18" fontSize="7" fill="#555555">{pct}% · {fmtMin(min)}</text>
            </g>
          )
        })}
      </svg>
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
