import { Card } from '@/components/ui/Card'
import type { MuscleReading, VolumeBand } from '@/lib/muscleVolume'

const BAND_LABEL: Record<VolumeBand, string> = {
  below: 'under the reference',
  productive: 'in range',
  high: 'toward the ceiling',
  over: 'above the ceiling',
}

/** Only the two edges of the range are worth colouring; the middle is normal. */
function bandColor(band: VolumeBand): string {
  return band === 'below' || band === 'over' ? 'var(--violet-100)' : 'var(--ink-dim)'
}

interface RowProps {
  reading: MuscleReading
}

/**
 * One group's week: the count, then a bar placing it against the landmarks.
 *
 * The bar's scale runs to the recoverable ceiling, or to the count itself when
 * that is higher, so an over-volume week stays on the chart instead of pinning
 * silently at full width.
 */
function MuscleRow({ reading }: RowProps) {
  const { landmark, sets, band } = reading
  const scale = Math.max(landmark.mrv, sets, 1)
  const pct = (n: number) => `${Math.min(100, (n / scale) * 100)}%`

  return (
    <div className="flex flex-col" style={{ gap: 5 }}>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="capitalize"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}
        >
          {reading.muscle}
        </span>
        <span className="flex items-baseline shrink-0" style={{ gap: 6 }}>
          <span
            style={{
              fontSize: 15, fontWeight: 700, color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {sets}
          </span>
          <span style={{ fontSize: 11, color: bandColor(band) }}>
            {sets === 0 ? 'none logged' : BAND_LABEL[band]}
          </span>
        </span>
      </div>

      {/* Track, fill, and the two landmark ticks. */}
      <div
        className="relative w-full"
        style={{ height: 8, borderRadius: 'var(--r-bar)', background: 'rgba(255,255,255,0.06)' }}
        role="img"
        aria-label={
          `${reading.muscle}: ${sets} sets this week. ` +
          `Reference range ${landmark.mev} to ${landmark.mav}, ceiling ${landmark.mrv}.`
        }
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: pct(sets),
            borderRadius: 'var(--r-bar)',
            background: 'linear-gradient(90deg, var(--violet-400), var(--violet-200))',
          }}
        />
        {[landmark.mev, landmark.mav].map(mark => mark > 0 && (
          <span
            key={mark}
            aria-hidden="true"
            className="absolute inset-y-0"
            style={{ left: pct(mark), width: 1, background: 'var(--ink-off)' }}
          />
        ))}
      </div>

      <span style={{ fontSize: 11, color: 'var(--ink-ghost)' }}>
        {landmark.mev}–{landmark.mav} reference, {landmark.mrv} ceiling
        {landmark.covers.length > 1 && ` · covers ${landmark.covers.join(', ')}`}
      </span>
    </div>
  )
}

/**
 * Weekly hard sets per muscle group.
 *
 * The counts are the measurement. The reference range behind them is a
 * heuristic — see `lib/muscleVolume.ts` for where the numbers come from and
 * what they cannot tell you — so the card names it as one rather than drawing
 * a target the app pretends to hold you to.
 */
export function MuscleVolumeCard({ readings }: { readings: MuscleReading[] }) {
  // No guard on an empty week: `WorkoutProgress` already shows its own empty
  // state until there is history, so by here the zeros are real — and early in
  // a week they are the most useful thing on the card, not a reason to hide it.
  return (
    <Card label="Sets per muscle, this week">
      <div className="flex flex-col" style={{ gap: 14 }}>
        {readings.map(r => <MuscleRow key={r.muscle} reading={r} />)}
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-ghost)' }}>
        Counts come from your logged sets. The reference ranges are coaching
        heuristics rather than measured thresholds, they vary between people,
        and this app records six coarse groups where the published landmarks are
        per muscle — so “legs” sums three. Read the numbers, treat the ranges as
        a rough sanity check.
      </p>
    </Card>
  )
}
