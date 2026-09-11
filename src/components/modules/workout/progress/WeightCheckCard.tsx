import { useMemo, useState } from 'react'
import type { WorkoutDaySession } from '@/db/dexie'
import type { ProfileId } from '@/config/profiles'
import { useProgressStore } from '@/store/useProgressStore'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import {
  weightTrend, weeklyRateKg, readWeight, paceLabel, strengthVsBodyweight, parseWeighInLb,
  MIN_READINGS_FOR_RATE, MIN_SPAN_DAYS_FOR_RATE, WEIGH_IN_LB,
} from '@/lib/bodyweight'
import type { WeightTone, StrengthVsBodyweight } from '@/lib/bodyweight'
import { kgToLb } from '@/lib/progress'
import { todayISO } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { WeightTrendChart } from './WeightTrendChart'
import { WeightGoalPicker } from './WeightGoalPicker'

/** Stable empty reference — a fresh `[]` in a zustand selector loops the render. */
const NO_ENTRIES: never[] = []

const TONE_COLOUR: Record<WeightTone, string> = {
  good: 'var(--ok)',
  caution: 'var(--caution)',
  off: 'var(--red)',
}

const lb1 = (kg: number) => Math.round(kgToLb(kg) * 10) / 10
const signed = (n: number) => `${n > 0 ? '+' : ''}${n}`

interface Props {
  profileId: ProfileId
  /** This profile's sessions, for the strength comparison. May be empty. */
  sessions: WorkoutDaySession[]
  keyLiftIds: string[]
  /** Bodyweight from the profile, used only to size pace ranges before any weigh-in. */
  fallbackKg: number | undefined
}

/**
 * Bodyweight as a trend, read against what the person is aiming for.
 *
 * The goal is asked for before anything is judged: whether a pound gained is
 * progress or drift depends entirely on it. Until it is set, the trend is still
 * drawn and the logger still works — weigh-ins feed DOTS whatever the goal —
 * but no verdict is offered.
 */
export function WeightCheckCard({ profileId, sessions, keyLiftIds, fallbackKg }: Props) {
  const entries = useProgressStore(s => s.bodyweight[profileId] ?? NO_ENTRIES)
  const logBodyweight = useProgressStore(s => s.logBodyweight)
  const goal = useProfileSettingsStore(s => s.weightGoal)
  const setWeightGoal = useProfileSettingsStore(s => s.setWeightGoal)

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const trend = useMemo(() => weightTrend(entries), [entries])
  const rateKg = useMemo(() => weeklyRateKg(entries), [entries])
  const compare = useMemo(
    () => strengthVsBodyweight(sessions, keyLiftIds, trend),
    [sessions, keyLiftIds, trend]
  )

  const latest = trend[trend.length - 1]
  const reading = goal && rateKg !== null && latest ? readWeight(rateKg, latest.trendKg, goal) : null
  const askingForGoal = !goal || editing

  const submit = () => {
    const kg = parseWeighInLb(value)
    if (kg === null) {
      setError(`Enter a weight between ${WEIGH_IN_LB.min} and ${WEIGH_IN_LB.max} lb.`)
      return
    }
    logBodyweight(profileId, todayISO(), kg)
    setValue('')
    setError(null)
  }

  return (
    <Card label="Weight check">
      {askingForGoal ? (
        <WeightGoalPicker
          current={goal}
          bodyweightKg={latest?.trendKg ?? fallbackKg}
          onChoose={g => { setWeightGoal(g); setEditing(false) }}
          onCancel={goal ? () => setEditing(false) : undefined}
        />
      ) : (
        <div className="flex items-center justify-between" style={{ gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
            Goal · <span style={{ color: 'var(--ink-2)' }}>{paceLabel(goal)}</span>
          </span>
          <button
            onClick={() => setEditing(true)}
            className="uppercase"
            style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-faint)' }}
          >
            Change
          </button>
        </div>
      )}

      {/* The trend weight leads, not today's reading: that is the number that means something. */}
      <div className="flex items-baseline flex-wrap" style={{ gap: '4px 10px' }}>
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          {latest ? lb1(latest.trendKg) : '—'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>lb trend</span>
        {rateKg !== null && (
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
            {signed(lb1(rateKg))} lb/week
          </span>
        )}
      </div>
      {latest && (
        <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: -6 }}>
          Last weigh-in {lb1(latest.kg)} lb on {latest.date.slice(5)}
        </p>
      )}

      {trend.length >= 2 ? (
        <WeightTrendChart
          trend={trend}
          ariaLabel={`Bodyweight trend, now ${lb1(latest.trendKg)} lb`}
        />
      ) : (
        <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
          {trend.length === 0 ? 'Log your weight to start a trend.' : 'Log once more to start a trend.'}
        </p>
      )}

      {!askingForGoal && latest && (
        reading ? (
          <p style={{ fontSize: 13.5, color: TONE_COLOUR[reading.tone] }}>{reading.sentence}</p>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
            A rate needs {MIN_READINGS_FOR_RATE} weigh-ins across at least {MIN_SPAN_DAYS_FOR_RATE} days.
          </p>
        )
      )}

      {compare && compare.rows.length > 0 && <StrengthAgainstWeight compare={compare} />}

      <div className="flex flex-col" style={{ gap: 6 }}>
        <div className="flex" style={{ gap: 8 }}>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={value}
            onChange={e => { setValue(e.target.value); setError(null) }}
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
            placeholder="Today's weight (lb)"
            aria-label="Today's bodyweight in pounds"
            aria-invalid={error !== null}
            aria-describedby={error ? 'weigh-in-error' : undefined}
            className="flex-1 bg-transparent focus:outline-none"
            style={{
              padding: '9px 12px', borderRadius: 'var(--r-control)', fontSize: 15,
              color: 'var(--ink)', border: `1px solid ${error ? 'var(--red)' : 'var(--hairline)'}`,
            }}
          />
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="uppercase transition-opacity disabled:opacity-30"
            style={{
              padding: '0 16px', borderRadius: 'var(--r-control)', fontSize: 12,
              letterSpacing: '0.1em', color: 'var(--ink)', border: '1px solid var(--hairline)',
            }}
          >
            Log
          </button>
        </div>
        {error && (
          <p id="weigh-in-error" role="alert" style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-faint)', paddingTop: 12, borderTop: '1px solid var(--hairline-soft)' }}>
        The trend smooths out daily water swings. Pace ranges are reference figures, as a
        share of bodyweight per week, and vary with training age and build.
      </p>
    </Card>
  )
}

/** Each key lift's estimated max against bodyweight across the same weeks. */
function StrengthAgainstWeight({ compare }: { compare: StrengthVsBodyweight }) {
  const bw = lb1(compare.bodyweightChangeKg)
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-baseline justify-between" style={{ gap: 12 }}>
        <span className="uppercase" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
          Strength vs bodyweight
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
          {compare.fromDate.slice(5)} → {compare.toDate.slice(5)}
        </span>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-dim)' }}>
        Bodyweight {signed(bw)} lb over this stretch.
      </p>
      {compare.rows.map(r => {
        const rising = r.toRatio > r.fromRatio + 0.005
        const falling = r.toRatio < r.fromRatio - 0.005
        return (
          <div key={r.exerciseId} className="flex items-baseline justify-between" style={{ gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{r.name}</span>
            <span style={{ fontSize: 12.5, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-dim)' }}>
              {signed(lb1(r.toKg - r.fromKg))} lb
              <span
                style={{
                  marginLeft: 8,
                  // Relative strength rising is good whatever the weight goal is:
                  // it means strength is outpacing bodyweight, or holding as it falls.
                  color: rising ? 'var(--ok)' : falling ? 'var(--caution)' : 'var(--ink-faint)',
                }}
              >
                {r.fromRatio.toFixed(2)}× → {r.toRatio.toFixed(2)}×
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
