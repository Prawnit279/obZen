import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'

const TARGETS = { protein: 150, carbs: 270, fat: 59 }
const MACRO_COLORS = { protein: '#d4d4d4', carbs: '#888888', fat: '#555555' }
const MACROS = ['protein', 'carbs', 'fat'] as const
type Macro = typeof MACROS[number]

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function MacroComplianceChart() {
  const days = getLast7Days()
  const logs = useLiveQuery(
    () => db.nutritionLogs.where('date').between(days[0], days[6], true, true).toArray(),
    [days[0]]
  )

  if (!logs) return <Empty text="Loading…" />

  const byDay: Record<string, Record<Macro, number>> = {}
  for (const d of days) byDay[d] = { protein: 0, carbs: 0, fat: 0 }
  for (const log of logs) {
    if (!byDay[log.date]) continue
    byDay[log.date].protein = log.totalProtein
    byDay[log.date].carbs = log.totalCarbs
    byDay[log.date].fat = log.totalFat
  }

  const hasData = logs.length > 0
  if (!hasData) return <Empty text="No nutrition data this week" />

  // Layout
  const W = 300; const H = 140
  const ml = 26; const mr = 6; const mt = 10; const mb = 22
  const cw = W - ml - mr; const ch = H - mt - mb
  const colW = cw / 7
  const barW = Math.floor(colW / 4.5)
  const barGap = Math.floor((colW - barW * 3) / 4)

  // Max pct cap for y scale
  const MAX_PCT = 150

  function pctH(actual: number, target: number): number {
    return Math.min((actual / target) * 100, MAX_PCT) / MAX_PCT * ch
  }

  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-2">
        Macro Compliance · % of target
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Grid: 50%, 100% */}
        {[0.5, 1].map(t => {
          const y = mt + ch * (1 - (t * 100 / MAX_PCT))
          return (
            <g key={t}>
              <line x1={ml} y1={y} x2={W - mr} y2={y}
                stroke={t === 1 ? '#555555' : '#2a2a2a'}
                strokeWidth="1"
                strokeDasharray={t === 1 ? '4,3' : undefined}
              />
              <text x={ml - 3} y={y + 3} fontSize="7" fill="#555555" textAnchor="end">
                {t * 100}%
              </text>
            </g>
          )
        })}
        <line x1={ml} y1={mt} x2={ml} y2={mt + ch} stroke="#2a2a2a" strokeWidth="1" />
        <line x1={ml} y1={mt + ch} x2={W - mr} y2={mt + ch} stroke="#2a2a2a" strokeWidth="1" />

        {days.map((d, i) => {
          const cx = ml + i * colW + barGap
          const dayLabel = new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })
          const isLogged = byDay[d].protein > 0 || byDay[d].carbs > 0 || byDay[d].fat > 0

          return (
            <g key={d}>
              {MACROS.map((macro, mi) => {
                const bh = pctH(byDay[d][macro], TARGETS[macro])
                const x = cx + mi * (barW + barGap)
                return (
                  <rect key={macro}
                    x={x}
                    y={mt + ch - bh}
                    width={barW}
                    height={bh}
                    fill={isLogged ? MACRO_COLORS[macro] : '#2a2a2a'}
                  />
                )
              })}
              <text x={ml + i * colW + colW / 2} y={H - mb + 13}
                fontSize="7" fill="#555555" textAnchor="middle">
                {dayLabel}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="flex gap-4 mt-1">
        {MACROS.map(m => (
          <div key={m} className="flex items-center gap-1">
            <div className="w-2 h-2" style={{ background: MACRO_COLORS[m] }} />
            <span className="text-[8px] uppercase tracking-widest text-noir-dim">{m}</span>
          </div>
        ))}
        <span className="text-[8px] text-noir-dim ml-auto">dashed = target</span>
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
