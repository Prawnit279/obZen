import { Check } from 'lucide-react'
import type { ProfileId } from '@/config/profiles'
import { useProgressStore } from '@/store/useProgressStore'

interface Props {
  profileId: ProfileId
  exerciseId: string
  name: string
  /** Ordered rung labels, e.g. Negatives → Band-assisted → … → Weighted. */
  path: string[]
  /** Latest assistance in kg, when the movement is assistance-tracked. */
  assistanceKg?: number
}

/**
 * Horizontal rungs for a bodyweight movement. The current rung is user-set —
 * the app can't infer it reliably from logged sets — and is stored per profile.
 */
export function ProgressionLadder({ profileId, exerciseId, name, path, assistanceKg }: Props) {
  const getRung = useProgressStore(s => s.getRung)
  const setRung = useProgressStore(s => s.setRung)
  const current = Math.min(getRung(profileId, exerciseId), path.length - 1)

  const nextLabel = current < path.length - 1 ? path[current + 1] : null
  const milestone = nextLabel
    ? assistanceKg !== undefined && assistanceKg > 0
      ? `${Math.round(assistanceKg * 10) / 10} kg assist to ${nextLabel.toLowerCase()}`
      : `Next: ${nextLabel}`
    : 'Top rung reached'

  return (
    <section className="rounded-[2px] p-4" style={{ background: '#161616', border: '1px solid #323232' }}>
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[11px] uppercase tracking-widest" style={{ color: '#a6a6a6' }}>
          {name} — progression
        </h3>
        <span className="text-[11px]" style={{ color: '#6f6f6f' }}>{milestone}</span>
      </div>

      <ol className="flex items-stretch gap-1" role="list">
        {path.map((rung, i) => {
          const done = i < current
          const isCurrent = i === current
          return (
            <li key={rung} className="flex-1 min-w-0">
              <button
                onClick={() => setRung(profileId, exerciseId, i)}
                className="w-full text-left rounded-[2px] px-2 py-2 transition-colors"
                style={{
                  background: isCurrent ? '#252525' : 'transparent',
                  border: `1px solid ${isCurrent ? '#a6a6a6' : done ? '#3a5a3a' : '#323232'}`,
                }}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Set current rung to ${rung}`}
              >
                <span className="flex items-center gap-1">
                  {done && <Check size={10} style={{ color: '#86efac' }} aria-hidden="true" />}
                  <span
                    className="text-[10px] uppercase tracking-widest truncate"
                    style={{ color: isCurrent ? '#e2e2e2' : done ? '#86efac' : '#6f6f6f' }}
                  >
                    {rung}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <p className="text-[11px] mt-2" style={{ color: '#6f6f6f' }}>
        Tap a rung to set where you are now.
      </p>
    </section>
  )
}
