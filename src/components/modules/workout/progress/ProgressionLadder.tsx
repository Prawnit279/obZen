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
    <section className="rounded-[2px] p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          {name} — progression
        </h3>
        <span className="text-[11px]" style={{ color: 'var(--dim)' }}>{milestone}</span>
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
                  background: isCurrent ? 'var(--elevated)' : 'transparent',
                  border: `1px solid ${isCurrent ? '#a6a6a6' : done ? '#3a5a3a' : 'var(--border)'}`,
                }}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Set current rung to ${rung}`}
              >
                <span className="flex items-center gap-1">
                  {done && <Check size={10} style={{ color: 'var(--complete-text)' }} aria-hidden="true" />}
                  <span
                    className="text-[10px] uppercase tracking-widest truncate"
                    style={{ color: isCurrent ? 'var(--accent)' : done ? 'var(--complete-text)' : 'var(--dim)' }}
                  >
                    {rung}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <p className="text-[11px] mt-2" style={{ color: 'var(--dim)' }}>
        Tap a rung to set where you are now.
      </p>
    </section>
  )
}
