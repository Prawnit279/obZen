import { useState } from 'react'
import type { WorkoutDaySession } from '@/db/dexie'
import type { TrendPoint } from '@/lib/bodyweight'
import type { LiftSignal } from '@/lib/progressTrends'
import {
  liftPoints, LIFT_MEASURES, LIFT_RANGES, MEASURE_AXIS_LABEL,
} from '@/lib/liftViews'
import type { LiftMeasure, LiftRange } from '@/lib/liftViews'
import type { BarMode } from '@/lib/barWeight'
import { Card } from '@/components/ui/Card'
import { SegmentedPill } from '@/components/ui/SegmentedPill'
import { LineChart, ChartEmpty } from './Charts'
import { TrendRates } from './TrendCards'

export interface TrackedLift {
  id: string
  name: string
}

interface Props {
  sessions: WorkoutDaySession[]
  lifts: TrackedLift[]
  /** Weigh-ins, for the ×BW reading. Empty is fine — that view simply says so. */
  trend: TrendPoint[]
  signals: LiftSignal[]
  todayISO: string
  /** Whether plotted weights count the bar. Follows the SBD toggle. */
  barMode?: BarMode
}

const ALL = '__all__'

/**
 * The lift trend, with the question it answers left to the reader.
 *
 * Pounds of estimated max is the right default and was a poor only option: a
 * full history squeezes recent weeks into nothing, a shared axis flattens a
 * light lift against a heavy one, and none of it separates getting stronger
 * from getting heavier. Each control changes what is plotted, not how it looks.
 */
export function LiftTrendCard({ sessions, lifts, trend, signals, todayISO, barMode = 'with-bar' }: Props) {
  const [measure, setMeasure] = useState<LiftMeasure>('e1rm')
  const [range, setRange] = useState<LiftRange>('all')
  const [focus, setFocus] = useState<string>(ALL)

  const shown = focus === ALL ? lifts : lifts.filter(l => l.id === focus)

  const series = shown
    .map(l => ({
      label: l.name,
      points: liftPoints(sessions, l.id, measure, trend, range, todayISO, barMode),
    }))
    .filter(s => s.points.length > 0)


  return (
    <Card label="Lift trend">
      <div className="space-y-2">
        <SegmentedPill
          label="What the chart shows"
          value={measure} onChange={setMeasure}
          options={LIFT_MEASURES} scrollable
        />
        <SegmentedPill
          label="How far back"
          value={range} onChange={setRange}
          options={LIFT_RANGES} grow
        />
        {lifts.length > 1 && (
          <SegmentedPill
            label="Which lift"
            value={focus} onChange={setFocus}
            options={[{ value: ALL, label: 'All lifts' }, ...lifts.map(l => ({ value: l.id, label: l.name }))]}
            scrollable
          />
        )}
      </div>

      <div className="mt-3">
        {series.length === 0 ? (
          <ChartEmpty
            text={measure === 'perBw'
              // The one measure that can go quiet for a reason worth naming.
              ? 'Log a weigh-in to see strength per pound of bodyweight.'
              : 'Nothing logged in this window.'}
          />
        ) : (
          <LineChart series={series} yLabel={MEASURE_AXIS_LABEL[measure]} />
        )}
      </div>

      {/* Rate of change is about pounds moved per week, so it belongs to the
          default reading rather than to a ratio or a percentage. */}
      {measure === 'e1rm' && focus === ALL && <TrendRates signals={signals} />}
    </Card>
  )
}
