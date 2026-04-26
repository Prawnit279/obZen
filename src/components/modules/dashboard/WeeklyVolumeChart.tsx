import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import { OBZEN_PROGRAM } from '@/data/obzen-program'
import type { MuscleGroup } from '@/data/obzen-program'

const EXERCISE_MUSCLE: Record<string, MuscleGroup> = {}
for (const day of Object.values(OBZEN_PROGRAM)) {
  for (const ex of day.exercises) {
    EXERCISE_MUSCLE[ex.name] = ex.muscle
  }
}

function parseWeight(w: string): number {
  if (!w || w === '—' || w.toLowerCase() === 'bw') return 0
  const m = w.match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : 0
}

const MUSCLES: MuscleGroup[] = ['legs', 'back', 'shoulders', 'arms', 'chest', 'core']
const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  legs: '#d4d4d4',
  back: '#a0a0a0',
  shoulders: '#888888',
  arms: '#707070',
  chest: '#555555',
  core: '#3a3a3a',
}

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function fmtVol(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))
}

export function WeeklyVolumeChart() {
  const days = getLast7Days()
  const logs = useLiveQuery(
    () => db.exerciseLogs.where('date').between(days[0], days[6], true, true).toArray(),
    [days[0]]
  )

  if (!logs) return <Empty text="Loading…" />

  const byDay: Record<string, Record<MuscleGroup, number>> = {}
  for (const d of days) {
    byDay[d] = { legs: 0, back: 0, shoulders: 0, arms: 0, chest: 0, core: 0 }
  }
  for (const log of logs) {
    if (!byDay[log.date]) continue
    const muscle: MuscleGroup = EXERCISE_MUSCLE[log.exerciseName] ?? 'core'
    const vol = log.sets
      .filter(s => s.completed && !s.isWarmup)
      .reduce((acc, s) => acc + parseWeight(s.weight) * s.reps, 0)
    byDay[log.date][muscle] += vol
  }

  const dayTotals = days.map(d => MUSCLES.reduce((a, m) => a + byDay[d][m], 0))
  const maxVol = Math.max(...dayTotals, 1)

  if (dayTotals.every(t => t === 0)) return <Empty text="No workout data this week" />

  const W = 300; const H = 140
  const ml = 28; const mr = 6; const mt = 10; const mb = 22
  const cw = W - ml - mr; const ch = H - mt - mb
  const colW = Math.floor(cw / 7)
  const barW = Math.max(colW - 6, 8)

  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-noir-dim mb-2">Weekly Volume · lbs lifted</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {[0, 0.5, 1].map(t => {
          const y = mt + ch * (1 - t)
          return (
            <g key={t}>
              <line x1={ml} y1={y} x2={W - mr} y2={y} stroke="#2a2a2a" strokeWidth="1" />
              {t > 0 && (
                <text x={ml - 3} y={y + 3} fontSize="7" fill="#555555" textAnchor="end">
                  {fmtVol(maxVol * t)}
                </text>
              )}
            </g>
          )
        })}
        <line x1={ml} y1={mt} x2={ml} y2={mt + ch} stroke="#2a2a2a" strokeWidth="1" />

        {days.map((d, i) => {
          const x = ml + i * colW + Math.floor((colW - barW) / 2)
          const total = dayTotals[i]
          const totalH = (total / maxVol) * ch
          let yOff = 0
          const segs = MUSCLES.map(muscle => {
            const vol = byDay[d][muscle]
            if (vol === 0) return null
            const bh = (vol / maxVol) * ch
            const seg = { muscle, y: mt + ch - yOff - bh, bh }
            yOff += bh
            return seg
          })
          const dayLabel = new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })
          return (
            <g key={d}>
              {segs.map(s => s && (
                <rect key={s.muscle} x={x} y={s.y} width={barW} height={s.bh}
                  fill={MUSCLE_COLORS[s.muscle]} />
              ))}
              {total > 0 && (
                <text x={x + barW / 2} y={mt + ch - totalH - 3}
                  fontSize="6" fill="#888888" textAnchor="middle">
                  {fmtVol(total)}
                </text>
              )}
              <text x={x + barW / 2} y={H - mb + 13} fontSize="7" fill="#555555" textAnchor="middle">
                {dayLabel}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex gap-3 flex-wrap mt-1">
        {MUSCLES.map(m => (
          <div key={m} className="flex items-center gap-1">
            <div className="w-2 h-2" style={{ background: MUSCLE_COLORS[m] }} />
            <span className="text-[8px] uppercase tracking-widest text-noir-dim">{m}</span>
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
