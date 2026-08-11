import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { trainingMax, fiveThreeOneWave, jokerSets, bbbSet } from '@/lib/strengthTools'
import type { WaveWeek, BBBPercent } from '@/lib/strengthTools'
import { ToolCard, NumberField, SegmentedToggle } from './ToolCard'

const WEEK_OPTIONS: { value: WaveWeek; label: string }[] = [
  { value: 1, label: 'Week 1' },
  { value: 2, label: 'Week 2' },
  { value: 3, label: 'Week 3' },
  { value: 'deload', label: 'Deload' },
]

const BBB_OPTIONS: { value: BBBPercent; label: string }[] = [
  { value: 50, label: '50%' },
  { value: 60, label: '60%' },
  { value: 70, label: '70%' },
]

/**
 * Training Max, the 3-week wave, Joker sets and BBB all share one e1RM
 * input — that mirrors how 5/3/1 is actually run (one TM drives everything for
 * a lift), rather than four disconnected forms asking for the same number.
 */
export function FiveThreeOneCard() {
  const navigate = useNavigate()
  const [lift, setLift] = useState('')
  const [e1rm, setE1rm] = useState('')
  const [week, setWeek] = useState<WaveWeek>(1)
  const [bbbPct, setBbbPct] = useState<BBBPercent>(50)
  const [bbbOpposite, setBbbOpposite] = useState(false)

  const value = Number(e1rm)
  const valid = value > 0
  const tm = valid ? trainingMax(value) : 0
  const wave = valid ? fiveThreeOneWave(tm, week) : []
  const topSet = wave[wave.length - 1]
  const jokers = valid && topSet ? jokerSets(topSet.weight) : []
  const bbb = valid ? bbbSet(tm, bbbPct) : null

  return (
    <ToolCard label="5/3/1" sub="Training Max, the 3-week wave, Joker sets and Boring But Big — off one estimated 1RM.">
      <div className="space-y-3">
        <NumberField label="Lift (optional label)" value={lift} onChange={setLift} placeholder="e.g. Squat" />
        <NumberField label="Estimated 1RM" value={e1rm} onChange={setE1rm} placeholder="315" suffix="lb" />
      </div>

      {valid && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-[22px] tabular-nums" style={{ color: '#e2e2e2' }}>{tm}</div>
            <div className="text-[11px] uppercase tracking-widest" style={{ color: '#8a8a8a' }}>
              Training Max{lift.trim() && ` — ${lift.trim()}`}
            </div>
          </div>

          {/* Wave */}
          <div>
            <SegmentedToggle value={week} onChange={setWeek} options={WEEK_OPTIONS} />
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {wave.map((set, i) => (
                <div key={i} className="text-center rounded-[2px] py-2" style={{ background: '#1e1e1e' }}>
                  <div className="text-[15px] tabular-nums" style={{ color: '#e2e2e2' }}>{set.weight}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: set.isAmrap ? '#86efac' : '#8a8a8a' }}>
                    {set.reps} @ {set.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Joker sets */}
          {week !== 'deload' && jokers.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: '#8a8a8a' }}>
                Joker sets — optional, only if the top set felt strong
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {jokers.map(j => (
                  <div key={j.bump} className="text-center rounded-[2px] py-1.5" style={{ background: '#1e1e1e' }}>
                    <div className="text-[13px] tabular-nums" style={{ color: '#e2e2e2' }}>{j.weight}</div>
                    <div className="text-[10px]" style={{ color: '#6f6f6f' }}>+{j.bump}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BBB */}
          {bbb && (
            <div>
              <div className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: '#8a8a8a' }}>
                Boring But Big — 5×10
              </div>
              <SegmentedToggle value={bbbPct} onChange={setBbbPct} options={BBB_OPTIONS} />
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-[18px] tabular-nums" style={{ color: '#e2e2e2' }}>
                  {bbb.weight} lb × {bbb.sets} × {bbb.reps}
                </span>
                <button
                  onClick={() => setBbbOpposite(v => !v)}
                  className="text-[11px] uppercase tracking-widest"
                  style={{ color: '#8a8a8a' }}
                >
                  {bbbOpposite ? 'Opposite lift' : 'Same lift'}
                </button>
              </div>
              <p className="text-[11px] mt-1" style={{ color: '#6f6f6f' }}>
                {bbbOpposite
                  ? 'Note only — pick a movement opposite the main lift (e.g. bench day → back squat BBB).'
                  : 'Note only — same movement as the main lift, lighter and for volume.'}
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => navigate('/workout/tools/guide')}
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest mt-4 pt-3 transition-opacity hover:opacity-70"
        style={{ color: '#8a8a8a', borderTop: '1px solid #252525' }}
      >
        <HelpCircle size={12} /> How 5/3/1 works
      </button>
    </ToolCard>
  )
}
