import { useState, useMemo } from 'react'
import { dotsScore, wilksScore } from '@/lib/progress'
import { PROFILES } from '@/config/profiles'
import { useProfileStore } from '@/store/useProfileStore'
import { ToolCard, NumberField, SegmentedToggle } from './ToolCard'

/** Bodyweight + sex + total → Wilks and DOTS side by side, both "(est.)". */
export function WilksDotsCard() {
  const { activeId } = useProfileStore()
  const profile = PROFILES[activeId]

  const [bodyweight, setBodyweight] = useState(profile.body.bodyweightKg ? String(profile.body.bodyweightKg) : '')
  const [total, setTotal] = useState('')
  const [sex, setSex] = useState<'male' | 'female'>(profile.sex ?? 'male')

  const bw = Number(bodyweight)
  const t = Number(total)
  const valid = bw > 0 && t > 0

  const scores = useMemo(
    () => (valid ? { wilks: wilksScore(t, bw, sex), dots: dotsScore(t, bw, sex) } : null),
    [valid, t, bw, sex]
  )

  return (
    <ToolCard label="Wilks & DOTS" sub="Bodyweight-adjusted score for a total or a single lift, in kilograms.">
      <div className="space-y-3">
        <SegmentedToggle
          value={sex}
          onChange={setSex}
          options={[{ value: 'male', label: 'Male coefficients' }, { value: 'female', label: 'Female coefficients' }]}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Bodyweight" value={bodyweight} onChange={setBodyweight} placeholder="75" suffix="kg" />
          <NumberField label="Total (or single lift)" value={total} onChange={setTotal} placeholder="400" suffix="kg" />
        </div>
      </div>

      {scores && (
        <div className="flex gap-6 mt-4">
          <div>
            <div className="text-[22px] tabular-nums" style={{ color: '#e2e2e2' }}>
              {Math.round(scores.wilks * 10) / 10}
            </div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: '#8a8a8a' }}>Wilks (est.)</div>
          </div>
          <div>
            <div className="text-[22px] tabular-nums" style={{ color: '#e2e2e2' }}>
              {Math.round(scores.dots * 10) / 10}
            </div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: '#8a8a8a' }}>DOTS (est.)</div>
          </div>
        </div>
      )}

      <p className="text-[11px] mt-3 pt-3" style={{ color: '#6f6f6f', borderTop: '1px solid #252525' }}>
        Reference coefficients, not independently verified — worth checking against a
        source you trust before relying on them.
      </p>
    </ToolCard>
  )
}
