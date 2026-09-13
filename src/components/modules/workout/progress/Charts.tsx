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
    <div className="py-8 text-center" style={{ fontSize: 'var(--text-base)', color: 'var(--ink-faint)' }}>
      {text}
    </div>
  )
}

/**
 * Gridlines at numbers a person would actually say.
 *
 * The old version returned the padded minimum, the midpoint and the padded
 * maximum, which on a real range gave 212 / 324 / 436 — three values nobody
 * thinks in, so a point could only be read by doing arithmetic against them.
 * These land on a 1, 2 or 5 step scaled to the range, so the lines fall on 200,
 * 250, 300 and a reader can place anything between them by eye.
 */
export function niceTicks(min: number, max: number, target = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return Number.isFinite(min) ? [min] : []
  }

  const magnitude = 10 ** Math.floor(Math.log10((max - min) / target))
  // 1, 2 and 5 are the steps that read as round at any magnitude, and the
  // neighbouring decades are included so a short range is not forced onto a
  // step too coarse to put more than two lines on the chart.
  //
  // 2.5 is deliberately absent: it is round to look at but its decimals do not
  // survive the magnitude-based rounding below, and a 0-to-10 axis came out as
  // 0, 3, 5, 8, 10.
  const steps = [...new Set(
    [1, 2, 5, 10].flatMap(m => [m * magnitude / 10, m * magnitude, m * magnitude * 10])
  )].sort((a, b) => a - b)

  const build = (step: number): number[] => {
    // Enough decimals to express the step exactly and no more: 3 × 0.2 is
    // 0.6000000000000001 in binary floating point, which would become a label.
    const decimals = Math.max(0, -Math.floor(Math.log10(step)))
    const out: number[] = []
    for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) {
      out.push(Number(t.toFixed(decimals)))
      if (out.length > 40) break          // a step far too small for the range
    }
    return out
  }

  // Pick the step that lands nearest the number of gridlines asked for, with a
  // strong preference for at least three — two lines on a chart is barely a
  // scale, which is what rounding the step alone kept producing.
  let best: number[] | null = null
  let bestScore = Infinity
  for (const step of steps) {
    const ticks = build(step)
    if (ticks.length < 2) continue
    const score = Math.abs(ticks.length - target) + (ticks.length < 3 ? 10 : 0)
    if (score < bestScore) { bestScore = score; best = ticks }
  }
  return best ?? [min]
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
    : <MultiLineChart series={withData} yLabel={yLabel} />
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
          <text x={ML - 4} y={y(t) + 3} textAnchor="end" style={{ fontSize: 'var(--text-lg)' }} fill={TICK}>{fmt(t)}</text>
        </g>
      ))}

      {goal && (
        <g>
          <line
            x1={ML} y1={y(goal.value)} x2={W - MR} y2={y(goal.value)}
            stroke="var(--ok)" strokeWidth="1" strokeDasharray="3 2"
          />
          <text x={W - MR} y={y(goal.value) - 4} textAnchor="end" style={{ fontSize: 'var(--text-lg)' }} fill="var(--ok)">
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

      <text x={ML} y={H - 6} style={{ fontSize: 'var(--text-lg)' }} fill={TICK}>{dates[0]?.slice(5)}</text>
      {n > 1 && (
        <text x={W - MR} y={H - 6} textAnchor="end" style={{ fontSize: 'var(--text-lg)' }} fill={TICK}>
          {dates[n - 1].slice(5)}
        </text>
      )}
    </svg>
  )
}

// ── Lane chart — several lifts, each normalised to its own range ─────────────

/**
 * Every lift on one shared axis, distinguished by colour and dash.
 *
 * This replaced a per-lift lane chart. Lanes let a light movement and a heavy
 * one both fill their own strip, which reads well until you try to compare
 * them — the shapes are drawn to different scales, so a lift that gained ten
 * pounds looks exactly like one that gained a hundred.
 *
 * One axis costs something and it is worth being honest about it: lifts far
 * apart in absolute weight sit far apart vertically, so a light movement's
 * progress is compressed. What you get back is that every line is directly
 * comparable and the y-axis means one thing, which is what a reader assumes a
 * chart does anyway.
 */
function MultiLineChart({ series, yLabel }: { series: LineSeries[]; yLabel?: string }) {
  // Which session is being read, if any. Null means "show me the latest",
  // which is the question the chart answers when nobody has asked another.
  const [picked, setPicked] = useState<number | null>(null)

  const height = 168
  const legendGap = 26              // room under the plot for dates
  const plotBottom = height - legendGap
  // The right margin holds each line's current value, so the number can be
  // read off the line itself rather than matched back to a key.
  const valueGutter = 34

  const dates = [...new Set(series.flatMap(s => s.points.map(p => p.date)))].sort()
  const values = series.flatMap(s => s.points.map(p => p.value))

  // Pad the range so the top and bottom lines are not drawn on the frame.
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const pad = rawMax === rawMin ? Math.max(1, rawMax * 0.1) : (rawMax - rawMin) * 0.12
  const min = Math.max(0, rawMin - pad)
  const max = rawMax + pad

  const plotRight = W - valueGutter
  const xAt = (i: number) => dates.length === 1 ? ML : ML + (i / (dates.length - 1)) * (plotRight - ML)
  const x = (date: string) => xAt(dates.indexOf(date))
  const y = (v: number) => MT + (1 - (v - min) / (max - min)) * (plotBottom - MT)

  const lines = series.map((s, i) => {
    const pts = s.points.map(p => [x(p.date), y(p.value)] as [number, number])
    const vals = s.points.map(p => p.value)
    return {
      label: s.label,
      hue: liftHue(s.label, i),
      dash: SERIES_DASHES[i % SERIES_DASHES.length],
      d: monotoneCubic(pts),
      end: pts[pts.length - 1],
      latest: vals[vals.length - 1],
      /** The value on the session being read, if this lift was trained then. */
      at: (i: number) => s.points.find(p => p.date === dates[i])?.value ?? null,
      single: s.points.length === 1,
      delta: s.points.length > 1 ? vals[vals.length - 1] - vals[0] : null,
    }
  })

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={yLabel ?? 'Estimated 1RM per lift'}>
        {/* Shared gridlines — one scale, so these mean the same for every lift. */}
        {niceTicks(min, max).map(t => (
          <g key={t}>
            <line x1={ML} y1={y(t)} x2={plotRight} y2={y(t)} stroke={GRID} strokeWidth="0.5" />
            <text x={ML - 4} y={y(t) + 3} textAnchor="end" style={{ fontSize: 'var(--text-base)' }} fill={TICK}>{fmt(t)}</text>
          </g>
        ))}

        {/* The session being read, marked down the whole plot so every lift's
            value at that date can be found at a glance. */}
        {picked !== null && (
          <line
            x1={xAt(picked)} y1={MT} x2={xAt(picked)} y2={plotBottom}
            stroke="var(--ink-faint)" strokeWidth="0.75" strokeDasharray="2 2"
          />
        )}

        {lines.map(l => {
          const readAt = picked === null ? null : l.at(picked)
          return (
          <g key={l.label}>
            {/* A lift with one session has no line to draw, only a point. */}
            {!l.single && (
              <path
                d={l.d} fill="none" stroke={l.hue} strokeWidth="1.9"
                strokeDasharray={l.dash} strokeLinecap="round" strokeLinejoin="round"
              />
            )}
            {l.end && <circle cx={l.end[0]} cy={l.end[1]} r="2.8" fill={l.hue} />}
            {/* Its current value, beside the line that reached it. */}
            {l.end && (
              <text
                x={l.end[0] + 5} y={l.end[1] + 4} fill={l.hue}
                style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}
              >
                {fmt(l.latest)}
              </text>
            )}
            {readAt !== null && (
              <circle cx={xAt(picked!)} cy={y(readAt)} r="3.4" fill={l.hue}
                      stroke="var(--bg)" strokeWidth="1.2" />
            )}
          </g>
        )})}

        {/* One tap target per session, the full height of the plot — a data
            point is a few pixels across and a finger is not. */}
        {dates.map((date, i) => {
          const half = dates.length > 1 ? (plotRight - ML) / (dates.length - 1) / 2 : (plotRight - ML) / 2
          return (
            <rect
              key={date}
              x={Math.max(ML, xAt(i) - half)} y={MT}
              width={Math.min(half * 2, plotRight - ML)} height={plotBottom - MT}
              fill="transparent" style={{ cursor: 'pointer' }}
              onClick={() => setPicked(picked === i ? null : i)}
            />
          )
        })}

        <text x={ML} y={height - 8} style={{ fontSize: 'var(--text-base)' }} fill={TICK}>{dates[0]?.slice(5)}</text>
        {dates.length > 1 && (
          <text x={plotRight} y={height - 8} textAnchor="end" style={{ fontSize: 'var(--text-base)' }} fill={TICK}>
            {dates[dates.length - 1].slice(5)}
          </text>
        )}
      </svg>

      {/* Key and readout in one. Colour and dash together, so nothing rests on
          colour alone; and when a session is being read it shows that day's
          numbers rather than the latest, so there is one place to look. */}
      <div style={{ marginTop: 8 }}>
        <div
          className="flex items-baseline justify-between"
          style={{ marginBottom: 6, minHeight: 18 }}
        >
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
            {picked === null ? 'Latest' : dates[picked]}
          </span>
          {picked !== null && (
            <button
              onClick={() => setPicked(null)}
              style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-dim)' }}
            >
              Back to latest
            </button>
          )}
        </div>

        <div className="flex flex-wrap" style={{ gap: '6px 14px' }}>
          {lines.map(l => {
            const readAt = picked === null ? l.latest : l.at(picked)
            return (
              <span key={l.label} className="flex items-baseline" style={{ gap: 6 }}>
                <svg width="16" height="6" aria-hidden="true" style={{ alignSelf: 'center' }}>
                  <line x1="0" y1="3" x2="16" y2="3" stroke={l.hue} strokeWidth="1.9" strokeDasharray={l.dash} />
                </svg>
                <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>{l.label}</span>
                <span
                  style={{
                    fontSize: 'var(--text-md)', fontWeight: 700,
                    color: readAt === null ? 'var(--ink-dim)' : l.hue,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {/* Not trained that day is a real answer, and a different one
                      from a weight of zero. */}
                  {readAt === null ? 'not trained' : fmt(readAt)}
                </span>
                {picked === null && (
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
                    {l.delta === null
                      ? 'one session'
                      : `${l.delta > 0 ? '+' : ''}${fmt(l.delta)}`}
                  </span>
                )}
              </span>
            )
          })}
        </div>

        {dates.length > 1 && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-dim)', marginTop: 6 }}>
            Tap the chart to read a session.
          </p>
        )}
      </div>
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
            fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink)',
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
                      : 'linear-gradient(180deg, rgb(var(--accent-soft-rgb) / 0.33), rgb(var(--accent-deep-rgb) / 0.40))',
                  boxShadow: on ? '0 0 16px rgb(var(--accent-soft-rgb) / 0.44)' : 'none',
                  transition: 'background var(--t-fast) ease',
                }}
              />
              <span
                className="uppercase"
                style={{
                  fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.06em',
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
