import { monotoneCubic } from './Charts'
import { kgToLb } from '@/lib/progress'
import type { TrendPoint } from '@/lib/bodyweight'

const W = 300
const H = 140
const ML = 34
const MR = 10
const MT = 12
const MB = 22

interface Props {
  /** Trend points in kilos, oldest first. Two or more. */
  trend: TrendPoint[]
  ariaLabel: string
}

const DAY_MS = 86_400_000
const dayOf = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / DAY_MS

/** Integer pounds are fine resolution for an axis on a bodyweight chart. */
const tick = (lb: number) => String(Math.round(lb))

/**
 * Daily weigh-ins as faint dots, with the smoothed trend drawn through them.
 *
 * The dots stay visible on purpose. Hiding the raw readings behind a clean
 * line would ask the reader to take the smoothing on trust; showing both lets
 * them see the trend is a fair summary of the scatter rather than a flattering
 * one.
 *
 * Positions are by date, not by reading number, so a week without weighing
 * reads as a week — the gap is part of the record.
 */
export function WeightTrendChart({ trend, ariaLabel }: Props) {
  const raw = trend.map(p => kgToLb(p.kg))
  const smooth = trend.map(p => kgToLb(p.trendKg))
  const all = [...raw, ...smooth]

  const lo = Math.min(...all)
  const hi = Math.max(...all)
  // A flat stretch still needs a visible range, or every point sits on one line.
  const pad = hi - lo < 2 ? 1 : (hi - lo) * 0.15
  const min = lo - pad
  const max = hi + pad

  const d0 = dayOf(trend[0].date)
  const span = Math.max(1, dayOf(trend[trend.length - 1].date) - d0)
  const x = (iso: string) => ML + ((dayOf(iso) - d0) / span) * (W - ML - MR)
  const y = (lb: number) => MT + (1 - (lb - min) / (max - min)) * (H - MT - MB)

  const line = monotoneCubic(trend.map((p, i) => [x(p.date), y(smooth[i])]))
  const end = trend[trend.length - 1]
  const endY = y(smooth[smooth.length - 1])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
      {[min, (min + max) / 2, max].map(t => (
        <g key={t}>
          <line x1={ML} y1={y(t)} x2={W - MR} y2={y(t)} stroke="var(--hairline-soft)" strokeWidth="0.5" />
          <text x={ML - 5} y={y(t) + 3} textAnchor="end" fontSize="9.5" fill="var(--ink-faint)">
            {tick(t)}
          </text>
        </g>
      ))}

      {trend.map((p, i) => (
        <circle
          key={p.date} cx={x(p.date)} cy={y(raw[i])} r="2.1"
          fill="var(--ink-faint)" opacity="0.55"
        />
      ))}

      <path
        d={line} fill="none" stroke="var(--violet-200)" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx={x(end.date)} cy={endY} r="3.8" fill="var(--surface)" stroke="var(--violet-100)" strokeWidth="2" />

      <text x={ML} y={H - 6} fontSize="9.5" fill="var(--ink-faint)">{trend[0].date.slice(5)}</text>
      <text x={W - MR} y={H - 6} textAnchor="end" fontSize="9.5" fill="var(--ink-faint)">
        {end.date.slice(5)}
      </text>
    </svg>
  )
}
