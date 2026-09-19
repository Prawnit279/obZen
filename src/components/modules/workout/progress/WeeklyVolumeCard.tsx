import { useState } from 'react'
import { fillWeeks, kgToLb, isoWeekKey } from '@/lib/progress'
import type { WeeklyVolume } from '@/lib/progress'
import { Card } from '@/components/ui/Card'
import { SegmentedPill } from '@/components/ui/SegmentedPill'
import { BarChart } from './Charts'

/** Weeks of history the chart covers. */
const WEEKS = 8

export type VolumeMetric = 'tonnage' | 'sets'

const OPTIONS = [
  { value: 'tonnage' as const, label: 'Tonnage' },
  { value: 'sets' as const, label: 'Sets' },
]

interface Props {
  volume: WeeklyVolume[]
  /** The same weeks counting main work only, and assistance only. */
  main: WeeklyVolume[]
  supplemental: WeeklyVolume[]
  todayISO: string
}

/**
 * Weekly volume, counted either way.
 *
 * The two disagree often enough to be worth switching between: a week of heavy
 * triples and a week of light tens can land on the same tonnage while being
 * nothing alike, and set count says which one it was. Neither is the true
 * measure, which is why this is a toggle and not a decision made here.
 */
export function WeeklyVolumeCard({ volume, main, supplemental, todayISO }: Props) {
  const [metric, setMetric] = useState<VolumeMetric>('tonnage')
  const weeks = fillWeeks(volume, todayISO, WEEKS)

  /** Tonnage is stored in kilos and shown in pounds, like every other weight in
   *  the app. A set count is a count and converts to nothing. */
  const read = (v: WeeklyVolume) => (metric === 'tonnage' ? kgToLb(v.tonnageKg) : v.sets)

  // Looked up by key rather than by padding the series out to eight weeks and
  // taking the last entry. `weeklyVolume` omits untrained weeks, so the lookup
  // is the documented way to ask about a particular one; filling first built
  // seven rows to throw away.
  const thisWeekKey = isoWeekKey(todayISO)
  const thisWeek = (series: WeeklyVolume[]) => {
    const week = series.find(v => v.week === thisWeekKey)
    return week ? read(week) : 0
  }
  const mainNow = thisWeek(main)
  const suppNow = thisWeek(supplemental)
  const everMarked = supplemental.some(v => v.sets > 0)

  return (
    <Card label="Weekly volume">
      <SegmentedPill
        options={OPTIONS}
        value={metric}
        onChange={setMetric}
        label="Volume measure"
        grow
      />

      <BarChart
        data={weeks.map(v => ({ label: v.week.slice(-3), value: read(v) }))}
        unit={metric === 'tonnage' ? 'lb' : ''}
      />

      {/* The split appears once assistance has *ever* been marked, not once it
          was marked this week. Until the first time, every set is main work by
          definition and a row reading "supplemental 0" would suggest the
          assistance had gone missing rather than never having been
          distinguished — but after it, a quiet week is information rather than
          a reason to hide the breakdown.

          Gating on the current week hid the whole section, the real non-zero
          main-work row included, every time a week carried no assistance. On
          Boring But Big that is every fourth week by design: `weekPrescription`
          drops the five-by-ten on the deload.

          Counted in sets because that is metric-independent. Gating on the
          displayed value would have made the split appear under one toggle and
          vanish under the other. */}
      {everMarked && (
        <div style={{ paddingTop: 10, borderTop: '1px solid var(--hairline-soft)' }}>
          <Split label="Main work" value={mainNow} metric={metric} />
          <Split label="Supplemental" value={suppNow} metric={metric} />
        </div>
      )}
    </Card>
  )
}

function Split({ label, value, metric }: { label: string; value: number; metric: VolumeMetric }) {
  return (
    <div className="flex items-baseline justify-between" style={{ gap: 10, marginTop: 4 }}>
      <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
        {metric === 'tonnage'
          ? `${Math.round(value).toLocaleString()} lb`
          : `${value} ${value === 1 ? 'set' : 'sets'}`}
      </span>
    </div>
  )
}
