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
export function WeeklyVolumeCard({ volume, todayISO }: Props) {
  const [metric, setMetric] = useState<VolumeMetric>('tonnage')
  const weeks = fillWeeks(volume, todayISO, WEEKS)

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
        data={weeks.map(v => ({
          label: v.week.slice(-3),
          // Tonnage is stored in kilos and shown in pounds, like every other
          // weight in the app. A set count is a count and converts to nothing.
          value: metric === 'tonnage' ? kgToLb(v.tonnageKg) : v.sets,
        }))}
        unit={metric === 'tonnage' ? 'lb' : ''}
      />
    </Card>
  )
}
