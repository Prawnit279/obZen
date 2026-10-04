import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { WorkoutDaySession } from '@/db/dexie'
import { kgToLb } from '@/lib/progress'
import type { WeeklyVolume } from '@/lib/progress'
import { volumeWeeks, weekByExercise } from '@/lib/volumeWeeks'
import type { VolumeWeek, ExerciseVolume } from '@/lib/volumeWeeks'
import type { LiftRange } from '@/lib/liftViews'
import { LIFT_RANGES } from '@/lib/liftViews'
import { Card } from '@/components/ui/Card'
import { SegmentedPill } from '@/components/ui/SegmentedPill'
import { BarChart } from './Charts'

export type VolumeMetric = 'tonnage' | 'sets'

const METRICS: { value: VolumeMetric; label: string }[] = [
  { value: 'tonnage', label: 'Tonnage' },
  { value: 'sets', label: 'Sets' },
]

interface Props {
  /** This profile's sessions, already filtered. */
  sessions: WorkoutDaySession[]
  bodyweightKg: number
  todayISO: string
}

/**
 * Volume, week by week, as far back as you care to look.
 *
 * Counted either way, because the two disagree often enough to be worth
 * switching between: a week of heavy triples and a week of light tens can land
 * on the same tonnage while being nothing alike, and set count says which one
 * it was. Neither is the truer measure, which is why this is a toggle and not a
 * decision made here.
 *
 * Any week can be read, not only this one. Tapping a bar moves the whole
 * breakdown to that week — the figures under the chart used to be pinned to
 * today whichever bar was lit, which left the history a shape with no numbers
 * attached to it.
 *
 * The chart and the figures come from one `volumeWeeks` call, so the bar you
 * tapped and the numbers you read cannot describe different weeks.
 */
export function WeeklyVolumeCard({ sessions, bodyweightKg, todayISO }: Props) {
  const [metric, setMetric] = useState<VolumeMetric>('tonnage')
  const [range, setRange] = useState<LiftRange>('8w')
  const [picked, setPicked] = useState<number | null>(null)

  const weeks = volumeWeeks(sessions, bodyweightKg, range, todayISO)

  /** Tonnage is stored in kilos and shown in pounds, like every other weight in
   *  the app. A set count is a count and converts to nothing. */
  const read = (v: WeeklyVolume) => (metric === 'tonnage' ? kgToLb(v.tonnageKg) : v.sets)

  // Nothing ever logged. Deliberately not "no training inside this range": a
  // genuine eight-week layoff is a real and interesting answer, and a row of
  // empty bars tells it honestly — whereas eight empty bars for someone who has
  // never trained is a chart of nothing at all.
  if (sessions.length === 0 || weeks.length === 0) {
    return (
      <Card label="Volume">
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>
          Nothing logged yet. Volume appears here from the first session.
        </p>
      </Card>
    )
  }

  // Opens on the latest week that was actually trained, so a quiet fortnight at
  // the end does not leave the card reading zero.
  const lastWithData = weeks.reduce((acc, w, i) => (w.total.sets > 0 ? i : acc), -1)
  const fallback = lastWithData >= 0 ? lastWithData : weeks.length - 1
  // Clamped at both ends. The upper bound is for a range shrinking under a
  // selection made in a longer one; the lower is because the index arrives
  // from the chart, and an index out of range here renders `undefined` and
  // throws on the first field read rather than failing anywhere visible.
  const index = Math.max(0, Math.min(picked ?? fallback, weeks.length - 1))
  const week = weeks[index]
  const previous = index > 0 ? weeks[index - 1] : null

  const everMarked = weeks.some(w => w.supplemental.sets > 0)

  return (
    <Card label="Volume">
      <SegmentedPill
        options={METRICS}
        value={metric}
        onChange={setMetric}
        label="Volume measure"
        grow
      />
      <SegmentedPill
        options={LIFT_RANGES}
        value={range}
        // The selection is dropped with the range: index 3 of eight weeks and
        // index 3 of six months are different weeks, and silently carrying it
        // over would move the reader without telling them.
        onChange={(r: LiftRange) => { setRange(r); setPicked(null) }}
        label="How far back"
        grow
      />

      <BarChart
        // Keyed by range so a range change remounts it. The card resets its
        // own selection there, but the chart keeps a separate one, and a stale
        // index into a longer list left its floating readout naming a week
        // months back while the figures below described this one.
        //
        // Not keyed by metric: switching tonnage and sets describes the same
        // weeks, and losing the selection there would be a different bug.
        key={range}
        data={weeks.map(w => ({ label: w.week.slice(-3), value: read(w.total) }))}
        unit={metric === 'tonnage' ? 'lb' : ''}
        onSelect={setPicked}
      />

      {/* The lift trend has always said this about its own chart; this one
          never did, so the per-week reading sat there unused and unfindable. */}
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: -4 }}>
        Tap a week to read it.
      </p>

      <WeekReadout
        week={week}
        change={previous ? read(week.total) - read(previous.total) : null}
        metric={metric}
        read={read}
        showSplit={everMarked}
        exercises={weekByExercise(sessions, bodyweightKg, week.week)}
      />
    </Card>
  )
}

/** Everything about the week whose bar is lit. */
function WeekReadout({ week, change, metric, read, showSplit, exercises }: {
  week: VolumeWeek
  change: number | null
  metric: VolumeMetric
  read: (v: WeeklyVolume) => number
  showSplit: boolean
  exercises: ExerciseVolume[]
}) {
  return (
    <div style={{ paddingTop: 10, borderTop: '1px solid var(--hairline-soft)' }}>
      <div className="flex items-baseline justify-between" style={{ gap: 10 }}>
        <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>
          Week of {monthDay(week.startISO)}
        </span>
        <span style={{ fontSize: 'var(--text-xl)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(read(week.total), metric)}
        </span>
      </div>

      {/* Against the week before — the comparison a tracker exists for. Absent
          on the first week in view, which has nothing behind it to compare
          against. */}
      {change !== null && (
        <div className="flex items-baseline justify-between" style={{ gap: 10, marginTop: 2 }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
            vs the week before
          </span>
          <span
            style={{
              fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums',
              color: change === 0 ? 'var(--ink-faint)' : change > 0 ? 'var(--ok)' : 'var(--ink-dim)',
            }}
          >
            {change === 0 ? 'level' : `${change > 0 ? '+' : '−'}${fmt(Math.abs(change), metric)}`}
          </span>
        </div>
      )}

      {/* Only once assistance has been marked at all, anywhere in view. Until
          the first time, every set is main work by definition and a
          "supplemental 0" row would suggest the assistance had gone missing
          rather than never having been distinguished. Counted in sets because
          that is metric-independent: gating on the displayed value would make
          the split appear under one toggle and vanish under the other. */}
      {showSplit && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--hairline-soft)' }}>
          <Split label="Main work" value={read(week.main)} metric={metric} />
          <Split label="Supplemental" value={read(week.supplemental)} metric={metric} />
        </div>
      )}

      <ExerciseBreakdown rows={exercises} metric={metric} />
    </div>
  )
}

/**
 * What the week was actually made of, heaviest lift first.
 *
 * Folded away by default. The summary above answers most visits and the list
 * can run to a dozen rows on a full week, which would push every card below it
 * off the screen for a detail most readings do not need.
 *
 * Absent rather than empty for an untrained week: there are no parts to show,
 * and a disclosure promising a breakdown that turns out to be blank is worse
 * than no disclosure.
 */
function ExerciseBreakdown({ rows, metric }: { rows: ExerciseVolume[]; metric: VolumeMetric }) {
  const [open, setOpen] = useState(false)
  if (rows.length === 0) return null

  return (
    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--hairline-soft)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between transition-opacity hover:opacity-80"
        style={{ gap: 10, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>
          {rows.length} {rows.length === 1 ? 'exercise' : 'exercises'}
        </span>
        <span className="flex items-center" style={{ gap: 4, fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
          {open ? 'Hide' : 'Show'}
          <ChevronDown
            size={13}
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--t-fast) var(--ease-out)',
            }}
          />
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 8 }}>
          {rows.map(row => (
            <div
              key={row.exerciseId}
              className="flex items-baseline justify-between"
              style={{ gap: 10, marginTop: 5 }}
            >
              <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-2)', minWidth: 0 }}>
                {row.name}
                {/* Only when some of it was assistance, and only the share —
                    "3 of 8" says more than a flag, and a lift that was all main
                    work needs no annotation at all. */}
                {row.supplementalSets > 0 && (
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
                    {' '}· {row.supplementalSets} of {row.sets} assistance
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-md)', color: 'var(--ink-dim)', flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {metric === 'tonnage'
                  ? fmt(kgToLb(row.tonnageKg), 'tonnage')
                  : fmt(row.sets, 'sets')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Split({ label, value, metric }: { label: string; value: number; metric: VolumeMetric }) {
  return (
    <div className="flex items-baseline justify-between" style={{ gap: 10, marginTop: 4 }}>
      <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
        {fmt(value, metric)}
      </span>
    </div>
  )
}

function fmt(value: number, metric: VolumeMetric): string {
  return metric === 'tonnage'
    ? `${Math.round(value).toLocaleString()} lb`
    : `${value} ${value === 1 ? 'set' : 'sets'}`
}

/** `2026-09-21` → `21 Sep`. */
function monthDay(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
