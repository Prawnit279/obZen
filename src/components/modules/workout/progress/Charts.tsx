/**
 * Hand-rolled SVG chart primitives for the Progress view.
 *
 * Follows the 300×140 viewBox convention already used by the dashboard charts
 * so everything in the app shares one visual language. Series are distinguished
 * by dash pattern as well as colour, so the charts stay readable without relying
 * on colour alone.
 */

const W = 300
const H = 140
const ML = 30
const MR = 8
const MT = 10
const MB = 22

const AXIS = 'var(--border-strong)'
const TICK = 'var(--dim)'

/** Dash patterns cycle so overlaid series stay distinguishable without colour. */
export const SERIES_DASHES = ['none', '5 3', '2 3', '8 3 2 3']
/** Theme-aware so lines stay visible on both a dark and a light surface.
 *  Paired with SERIES_DASHES, so series are never distinguished by colour alone. */
export const SERIES_COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)']

export function ChartEmpty({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-[13px]" style={{ color: 'var(--dim)' }}>
      {text}
    </div>
  )
}

function niceTicks(min: number, max: number): number[] {
  if (max === min) return [min]
  return [min, min + (max - min) / 2, max]
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return `${Math.round(n / 100) / 10}k`
  return Math.abs(n) >= 100 ? String(Math.round(n)) : String(Math.round(n * 10) / 10)
}

// ── Line chart ───────────────────────────────────────────────────────────────

export interface LineSeries {
  label: string
  points: { date: string; value: number }[]
}

interface LineChartProps {
  series: LineSeries[]
  /** Optional horizontal goal line, e.g. 0 kg assistance. */
  goal?: { value: number; label: string }
  yLabel?: string
}

export function LineChart({ series, goal, yLabel }: LineChartProps) {
  const withData = series.filter(s => s.points.length > 0)
  if (withData.length === 0) return <ChartEmpty text="No data logged yet." />

  const allValues = withData.flatMap(s => s.points.map(p => p.value))
  if (goal) allValues.push(goal.value)
  const rawMin = Math.min(...allValues)
  const rawMax = Math.max(...allValues)
  const pad = rawMax === rawMin ? Math.max(1, rawMax * 0.1) : (rawMax - rawMin) * 0.15
  const min = Math.max(0, rawMin - pad)
  const max = rawMax + pad

  // Every series shares one x-axis of the union of dates, oldest first.
  const dates = [...new Set(withData.flatMap(s => s.points.map(p => p.date)))].sort()
  const x = (date: string) =>
    dates.length === 1 ? ML : ML + (dates.indexOf(date) / (dates.length - 1)) * (W - ML - MR)
  const y = (value: number) => MT + (1 - (value - min) / (max - min)) * (H - MT - MB)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={yLabel ?? 'Trend'}>
        {/* y axis ticks */}
        {niceTicks(min, max).map(t => (
          <g key={t}>
            <line x1={ML} y1={y(t)} x2={W - MR} y2={y(t)} stroke={AXIS} strokeWidth="0.5" />
            <text x={ML - 4} y={y(t) + 3} textAnchor="end" fontSize="8" fill={TICK}>{fmt(t)}</text>
          </g>
        ))}

        {goal && (
          <g>
            <line
              x1={ML} y1={y(goal.value)} x2={W - MR} y2={y(goal.value)}
              stroke="var(--complete-text)" strokeWidth="1" strokeDasharray="3 2"
            />
            <text x={W - MR} y={y(goal.value) - 3} textAnchor="end" fontSize="8" fill="var(--complete-text)">
              {goal.label}
            </text>
          </g>
        )}

        {withData.map((s, i) => {
          const path = s.points
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.date)} ${y(p.value)}`)
            .join(' ')
          return (
            <g key={s.label}>
              <path
                d={path}
                fill="none"
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth="1.5"
                strokeDasharray={SERIES_DASHES[i % SERIES_DASHES.length]}
              />
              {s.points.map(p => (
                <circle
                  key={p.date}
                  cx={x(p.date)} cy={y(p.value)} r="2"
                  fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                />
              ))}
            </g>
          )
        })}

        {/* first / last date labels */}
        <text x={ML} y={H - 6} fontSize="8" fill={TICK}>{dates[0]?.slice(5)}</text>
        {dates.length > 1 && (
          <text x={W - MR} y={H - 6} textAnchor="end" fontSize="8" fill={TICK}>
            {dates[dates.length - 1].slice(5)}
          </text>
        )}
      </svg>

      {withData.length > 1 && (
        <div className="flex flex-wrap gap-3 mt-1">
          {withData.map((s, i) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
              <svg width="18" height="6" aria-hidden="true">
                <line
                  x1="0" y1="3" x2="18" y2="3"
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth="1.5"
                  strokeDasharray={SERIES_DASHES[i % SERIES_DASHES.length]}
                />
              </svg>
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Bar chart ────────────────────────────────────────────────────────────────

export interface BarDatum {
  label: string
  value: number
}

export function BarChart({ data, unit = '' }: { data: BarDatum[]; unit?: string }) {
  if (data.length === 0) return <ChartEmpty text="No volume logged yet." />

  const max = Math.max(...data.map(d => d.value), 1)
  const slot = (W - ML - MR) / data.length
  const barW = Math.min(slot * 0.6, 28)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Volume ${unit}`}>
      {niceTicks(0, max).map(t => (
        <g key={t}>
          <line
            x1={ML} y1={MT + (1 - t / max) * (H - MT - MB)}
            x2={W - MR} y2={MT + (1 - t / max) * (H - MT - MB)}
            stroke={AXIS} strokeWidth="0.5"
          />
          <text
            x={ML - 4} y={MT + (1 - t / max) * (H - MT - MB) + 3}
            textAnchor="end" fontSize="8" fill={TICK}
          >
            {fmt(t)}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const h = (d.value / max) * (H - MT - MB)
        const cx = ML + slot * i + slot / 2
        return (
          <g key={d.label}>
            <rect
              x={cx - barW / 2} y={MT + (H - MT - MB) - h}
              width={barW} height={Math.max(h, d.value > 0 ? 1 : 0)}
              fill="var(--muted)"
            />
            <text x={cx} y={H - 6} textAnchor="middle" fontSize="8" fill={TICK}>
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
