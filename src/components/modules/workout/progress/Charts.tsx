import { useState } from 'react'

/**
 * SVG chart primitives for the Progress view.
 *
 * Three forms, chosen by what the data is rather than by caller preference:
 *
 *  - One series gets an area chart with a glowing line and an emphasised end
 *    point. At most one of these per screen — glow is how the eye finds the
 *    live value, and used twice it stops meaning anything.
 *  - Several lifts get stacked lanes, each normalised to its own range. On one
 *    shared axis the heavy lifts compress the light ones into overlapping flat
 *    lines at the top, which hides exactly the per-lift progress the colours
 *    exist to show.
 *  - Totals over time get bars, with the readout in a fixed slot.
 *
 * A lift keeps one hue everywhere it appears — lane, end dot, legend chip — and
 * every series also carries a dash pattern, so nothing is distinguished by
 * colour alone.
 */

const W = 300
const H = 140
const ML = 30
const MR = 8
const MT = 10
const MB = 22

const GRID = 'var(--hairline-soft)'
const TICK = 'var(--ink-faint)'
const LANE_DIVIDER = 'rgba(255,255,255,0.04)'

/** Dash patterns cycle so overlaid series stay distinguishable without colour. */
export const SERIES_DASHES = ['none', '5 3', '2 3', '8 3 2 3']

/**
 * Fixed hue per movement pattern, so a lift does not change colour when another
 * one joins the chart. Matched on the movement's name; anything unrecognised
 * falls back to cycling the same five.
 */
const LIFT_HUES: [RegExp, string][] = [
  [/squat|leg press|lunge|step.?up|hack/, 'var(--lift-squat)'],
  [/deadlift|rdl|good morning|hip thrust|glute|leg curl/, 'var(--lift-deadlift)'],
  [/bench|press|dip|push.?up|chest|fly/, 'var(--lift-bench)'],
  [/row|pull|lat |curl|face pull|raise|shrug/, 'var(--lift-row)'],
  [/plank|crunch|ab |dead bug|hollow|pallof|carry|twist|knee raise/, 'var(--lift-core)'],
]
const HUE_CYCLE = [
  'var(--lift-squat)', 'var(--lift-deadlift)', 'var(--lift-bench)',
  'var(--lift-row)', 'var(--lift-core)',
]

export function liftHue(name: string, fallbackIndex = 0): string {
  const k = name.toLowerCase()
  for (const [pattern, hue] of LIFT_HUES) if (pattern.test(k)) return hue
  return HUE_CYCLE[fallbackIndex % HUE_CYCLE.length]
}

export function ChartEmpty({ text }: { text: string }) {
  return (
    <div className="py-8 text-center" style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
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

/**
 * Monotone cubic (Fritsch–Carlson) through the points, as béziers.
 *
 * Catmull–Rom was here first and overshot: its control points reach past the
 * values either side of a turn, so a squat that went 235 → 215 → 240 was drawn
 * dipping below 215 and cresting above 240. On a lane normalised to its own
 * range that invented visible troughs which never happened.
 *
 * This interpolation cannot do that. Tangents are flattened to zero at every
 * local extreme, so the curve stays within the data it was given — the line is
 * still smooth, but every bend in it corresponds to a session.
 */
export function monotoneCubic(pts: [number, number][]): string {
  // Points sharing an x would divide by a zero-length run; the first wins.
  const p = pts.filter((pt, i) => i === 0 || pt[0] !== pts[i - 1][0])

  if (p.length === 0) return ''
  const at = (i: number) => `${p[i][0].toFixed(1)},${p[i][1].toFixed(1)}`
  if (p.length === 1) return `M${at(0)}`

  const n = p.length
  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = p[i + 1][0] - p[i][0]
    slope[i] = (p[i + 1][1] - p[i][1]) / dx[i]
  }

  // Tangent at each point: zero wherever the direction turns, so the curve
  // cannot overshoot; the weighted harmonic mean of the neighbours otherwise.
  const t: number[] = [slope[0]]
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) {
      t[i] = 0
    } else {
      const w1 = 2 * dx[i] + dx[i - 1]
      const w2 = dx[i] + 2 * dx[i - 1]
      t[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i])
    }
  }
  t[n - 1] = slope[n - 2]

  let d = `M${at(0)}`
  for (let i = 0; i < n - 1; i++) {
    const c1y = p[i][1] + (t[i] * dx[i]) / 3
    const c2y = p[i + 1][1] - (t[i + 1] * dx[i]) / 3
    d += ` C${(p[i][0] + dx[i] / 3).toFixed(1)},${c1y.toFixed(1)}`
       + ` ${(p[i + 1][0] - dx[i] / 3).toFixed(1)},${c2y.toFixed(1)}`
       + ` ${at(i + 1)}`
  }
  return d
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

/** Picks the form the data calls for: one series reads as an area, several as lanes. */
export function LineChart({ series, goal, yLabel }: LineChartProps) {
  const withData = series.filter(s => s.points.length > 0)
  if (withData.length === 0) return <ChartEmpty text="No data logged yet." />
  return withData.length === 1
    ? <AreaChart series={withData[0]} goal={goal} yLabel={yLabel} />
    : <LaneChart series={withData} yLabel={yLabel} />
}

// ── Area chart — one series, the form that carries a screen ──────────────────

function AreaChart({
  series, goal, yLabel,
}: { series: LineSeries; goal?: LineChartProps['goal']; yLabel?: string }) {
  const values = series.points.map(p => p.value)
  if (goal) values.push(goal.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const pad = rawMax === rawMin ? Math.max(1, rawMax * 0.1) : (rawMax - rawMin) * 0.15
  const min = Math.max(0, rawMin - pad)
  const max = rawMax + pad

  const n = series.points.length
  const x = (i: number) => (n === 1 ? ML : ML + (i / (n - 1)) * (W - ML - MR))
  const y = (v: number) => MT + (1 - (v - min) / (max - min)) * (H - MT - MB)

  const pts = series.points.map((p, i) => [x(i), y(p.value)] as [number, number])
  const line = monotoneCubic(pts)
  const baseline = MT + (H - MT - MB)
  const fill = `${line} L${x(n - 1).toFixed(1)},${baseline} L${x(0).toFixed(1)},${baseline} Z`
  const last = pts[pts.length - 1]
  const dates = series.points.map(p => p.date)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={yLabel ?? series.label}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
        <filter id="lineGlow" x="-25%" y="-60%" width="150%" height="240%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {niceTicks(min, max).map(t => (
        <g key={t}>
          <line x1={ML} y1={y(t)} x2={W - MR} y2={y(t)} stroke={GRID} strokeWidth="0.5" />
          <text x={ML - 4} y={y(t) + 3} textAnchor="end" fontSize="10" fill={TICK}>{fmt(t)}</text>
        </g>
      ))}

      {goal && (
        <g>
          <line
            x1={ML} y1={y(goal.value)} x2={W - MR} y2={y(goal.value)}
            stroke="var(--ok)" strokeWidth="1" strokeDasharray="3 2"
          />
          <text x={W - MR} y={y(goal.value) - 4} textAnchor="end" fontSize="10" fill="var(--ok)">
            {goal.label}
          </text>
        </g>
      )}

      {n > 1 && <path d={fill} fill="url(#areaFill)" />}
      <path
        d={line} fill="none" stroke="var(--violet-200)" strokeWidth="2.25"
        strokeLinecap="round" filter="url(#lineGlow)"
      />
      {/* The live value — where the eye should land. */}
      <circle cx={last[0]} cy={last[1]} r="4" fill="var(--surface)" stroke="var(--violet-100)" strokeWidth="2.25" />

      <text x={ML} y={H - 6} fontSize="10" fill={TICK}>{dates[0]?.slice(5)}</text>
      {n > 1 && (
        <text x={W - MR} y={H - 6} textAnchor="end" fontSize="10" fill={TICK}>
          {dates[n - 1].slice(5)}
        </text>
      )}
    </svg>
  )
}

// ── Lane chart — several lifts, each normalised to its own range ─────────────

function LaneChart({ series, yLabel }: { series: LineSeries[]; yLabel?: string }) {
  const nameH = 13          // the row carrying the lift's name and its change
  const plotH = 30          // the drawing itself
  const laneH = nameH + plotH + 7
  const height = laneH * series.length + MB

  const dates = [...new Set(series.flatMap(s => s.points.map(p => p.date)))].sort()
  const x = (date: string) =>
    dates.length === 1 ? ML : ML + (dates.indexOf(date) / (dates.length - 1)) * (W - ML - MR)

  const lanes = series.map((s, i) => {
    const vals = s.points.map(p => p.value)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const span = max - min || 1
    const top = i * laneH
    const plotTop = top + nameH
    const plotBot = plotTop + plotH

    // A single session has no range to scale against, so it sits mid-lane
    // rather than being pinned to a floor that means nothing.
    const single = s.points.length === 1
    const pts = s.points.map(p => [
      x(p.date),
      single ? plotTop + plotH / 2 : plotBot - ((p.value - min) / span) * plotH,
    ] as [number, number])

    return {
      label: s.label,
      hue: liftHue(s.label, i),
      dash: SERIES_DASHES[i % SERIES_DASHES.length],
      d: single ? '' : monotoneCubic(pts),
      end: pts[pts.length - 1],
      single,
      min, max,
      plotTop, plotBot,
      divider: top + laneH,
      nameY: top + 9,
      /** Only meaningful once there are two sessions to compare. */
      delta: single ? null : vals[vals.length - 1] - vals[0],
    }
  })

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={yLabel ?? 'Trend per lift'}>
        {lanes.map((l, i) => (
          <g key={l.label}>
            {i > 0 && (
              <line x1={0} y1={l.nameY - 9} x2={W - MR} y2={l.nameY - 9}
                    stroke={LANE_DIVIDER} strokeWidth="1" />
            )}

            {/* Name and change, so a lane says what it is without a legend. */}
            <text x={0} y={l.nameY} fontSize="9.5" fill={l.hue}>{l.label}</text>
            <text x={W - MR} y={l.nameY} textAnchor="end" fontSize="9.5" fill={TICK}>
              {l.delta === null
                ? 'one session'
                : `${l.delta > 0 ? '+' : ''}${fmt(l.delta)} lb`}
            </text>

            {/* The lane's own scale. Each lane is normalised to its own range,
                which is only honest if the range is written down. */}
            <text x={ML - 4} y={l.plotTop + 4} textAnchor="end" fontSize="8.5" fill={TICK}>
              {fmt(l.max)}
            </text>
            {!l.single && l.max !== l.min && (
              <text x={ML - 4} y={l.plotBot} textAnchor="end" fontSize="8.5" fill={TICK}>
                {fmt(l.min)}
              </text>
            )}

            {l.d && (
              <path
                d={l.d} fill="none" stroke={l.hue} strokeWidth="1.9"
                strokeDasharray={l.dash} strokeLinecap="round" strokeLinejoin="round"
              />
            )}
            {l.end && <circle cx={l.end[0]} cy={l.end[1]} r="2.8" fill={l.hue} />}
          </g>
        ))}

        <text x={0} y={height - 6} fontSize="9.5" fill={TICK}>{dates[0]?.slice(5)}</text>
        {dates.length > 1 && (
          <text x={W - MR} y={height - 6} textAnchor="end" fontSize="9.5" fill={TICK}>
            {dates[dates.length - 1].slice(5)}
          </text>
        )}
      </svg>
    </div>
  )
}

// ── Bar chart ────────────────────────────────────────────────────────────────

export interface BarDatum {
  label: string
  value: number
}

export function BarChart({ data, unit = '' }: { data: BarDatum[]; unit?: string }) {
  const [selected, setSelected] = useState<number | null>(null)
  if (data.length === 0) return <ChartEmpty text="No volume logged yet." />

  const max = Math.max(...data.map(d => d.value), 1)
  // Nothing selected falls back to the most recent period that has data.
  const lastWithValue = data.reduce((acc, d, i) => (d.value > 0 ? i : acc), -1)
  const lit = selected ?? lastWithValue
  const pill = lit >= 0 ? data[lit] : null

  return (
    <div style={{ position: 'relative' }}>
      {/* The readout lives in a fixed slot. Anchoring it to the bar would push
          it out of the card as soon as a bar is tall, since the bar's own
          height scales with the value. */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 9px', borderRadius: 'var(--r-pill)',
          background: 'rgba(10,8,16,0.92)', border: '1px solid rgba(255,255,255,0.12)',
          opacity: pill ? 1 : 0,
          transition: 'opacity var(--t-fast) ease',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--violet-200)' }} />
        <span
          style={{
            fontSize: 11, fontWeight: 700, color: 'var(--ink)',
            whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pill ? `${pill.label} · ${fmt(pill.value)}${unit ? ` ${unit}` : ''}` : ''}
        </span>
      </div>

      <div className="flex items-end" style={{ gap: 7, height: 104, paddingTop: 26 }}>
        {data.map((d, i) => {
          const on = i === lit && d.value > 0
          const pct = Math.max(3, Math.round((d.value / max) * 100))
          return (
            <button
              key={d.label}
              onClick={() => setSelected(selected === i ? null : i)}
              aria-pressed={on}
              aria-label={`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ''}`}
              className="flex-1 flex flex-col items-center justify-end"
              style={{
                gap: 8, height: '100%', border: 'none', background: 'transparent',
                cursor: 'pointer', padding: 0,
              }}
            >
              <span
                style={{
                  width: '100%', minHeight: 3,
                  height: d.value > 0 ? `${pct}%` : 3,
                  borderRadius: 'var(--r-bar)',
                  // An empty period is neutral, never a faint accent — absence
                  // should not read as a small amount of something.
                  background: d.value === 0
                    ? 'rgba(255,255,255,0.06)'
                    : on
                      ? 'linear-gradient(180deg, var(--violet-200), var(--violet-700))'
                      : 'linear-gradient(180deg, rgba(167,139,250,0.33), rgba(91,33,182,0.40))',
                  boxShadow: on ? '0 0 16px rgba(167,139,250,0.44)' : 'none',
                  transition: 'background var(--t-fast) ease',
                }}
              />
              <span
                className="uppercase"
                style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.06em',
                  color: on ? 'var(--ink)' : 'var(--ink-faint)',
                }}
              >
                {d.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
