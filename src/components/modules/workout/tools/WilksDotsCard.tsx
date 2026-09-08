import { useState, useMemo } from 'react'
import { dotsScore, wilksScore, kgToLb, lbToKg } from '@/lib/progress'
import { PROFILES } from '@/config/profiles'
import { useProfileStore } from '@/store/useProfileStore'
import { ToolCard, NumberField, AwaitingInput } from './ToolCard'
import { SegmentedPill } from '@/components/ui/SegmentedPill'


/** Bodyweight + sex + total → Wilks and DOTS side by side, both "(est.)". */
export function WilksDotsCard() {
  const { activeId } = useProfileStore()
  const profile = PROFILES[activeId]

  // Entered in pounds; the coefficients are kg-calibrated, so convert to kg
  // before scoring rather than displaying kg to the user.
  const [bodyweight, setBodyweight] = useState(
    profile.body.bodyweightKg ? String(Math.round(kgToLb(profile.body.bodyweightKg))) : ''
  )
  const [total, setTotal] = useState('')
  const [sex, setSex] = useState<'male' | 'female'>(profile.sex ?? 'male')

  const bw = Number(bodyweight)
  const t = Number(total)
  const valid = bw > 0 && t > 0

  const scores = useMemo(() => {
    if (!valid) return null
    const bwKg = lbToKg(bw)
    const totalKg = lbToKg(t)
    return { wilks: wilksScore(totalKg, bwKg, sex), dots: dotsScore(totalKg, bwKg, sex) }
  }, [valid, t, bw, sex])

  return (
    <ToolCard label="Wilks & DOTS" sub="Bodyweight-adjusted score for a total or a single lift.">
      <div className="space-y-3">
        <SegmentedPill
          label="Coefficient set"
          value={sex}
          onChange={setSex}
          options={[{ value: 'male', label: 'Male coefficients' }, { value: 'female', label: 'Female coefficients' }]}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Bodyweight" value={bodyweight} onChange={setBodyweight} placeholder="165" suffix="lb" />
          <NumberField label="Total (or single lift)" value={total} onChange={setTotal} placeholder="900" suffix="lb" />
        </div>
      </div>

      {!valid && (
        <AwaitingInput need={bw > 0 ? 'a total (or single lift)' : 'a bodyweight and total'} />
      )}

      {scores && (
        <div className="flex gap-6 mt-4">
          <div>
            <div className="text-[22px] tabular-nums" style={{ color: 'var(--accent)' }}>
              {Math.round(scores.wilks * 10) / 10}
            </div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Wilks (est.)</div>
          </div>
          <div>
            <div className="text-[22px] tabular-nums" style={{ color: 'var(--accent)' }}>
              {Math.round(scores.dots * 10) / 10}
            </div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>DOTS (est.)</div>
          </div>
        </div>
      )}

      <p className="text-[11px] mt-3 pt-3" style={{ color: 'var(--dim)', borderTop: '1px solid var(--border)' }}>
        Reference coefficients, not independently verified — worth checking against a
        source you trust before relying on them.
      </p>
    </ToolCard>
  )
}
