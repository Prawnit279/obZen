import { useState } from 'react'
import { fillWeeks, kgToLb } from '@/lib/progress'
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

  const thisWeek = (series: WeeklyVolume[]) => {
    const filled = fillWeeks(series, todayISO, WEEKS)
    return read(filled[filled.length - 1])
  }
  const mainNow = thisWeek(main)
  const suppNow = thisWeek(supplemental)

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

      {/* The split only appears once something has been marked supplemental.
          Until then every set is main work by definition, and a row reading
          "supplemental 0" would suggest the assistance had gone missing rather
          than never having been distinguished. */}
      {suppNow > 0 && (
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
