import { useState } from 'react'
import type { CheckIn } from '@/db/dexie'
import { saveCheckIn } from '@/lib/checkin'
import { todayISO } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  existing?: CheckIn
  onClose: () => void
  onSaved: (checkIn: CheckIn) => void
}

type Soreness = 'none' | 'mild' | 'moderate' | 'high'

export function CheckInModal({ open, existing, onClose, onSaved }: Props) {
  const [mood, setMood] = useState<1|2|3|4|5>(existing?.mood ?? 3)
  const [energy, setEnergy] = useState<1|2|3|4|5>(existing?.energy ?? 3)
  const [soreness, setSoreness] = useState<Soreness>(existing?.soreness ?? 'none')
  const [forearmFatigue, setForearmFatigue] = useState(existing?.forearmFatigue ?? false)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const data: Omit<CheckIn, 'id'> = {
      date: todayISO(),
      mood,
      energy,
      soreness,
      forearmFatigue,
      notes: notes || undefined,
    }
    await saveCheckIn(data)
    onSaved(data as CheckIn)
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Daily Check-in">
      <div className="space-y-6">

        {/* Mood */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-3">
            Mood <span className="text-noir-dim">— how do you feel mentally?</span>
          </div>
          <RatingRow value={mood} onChange={v => setMood(v as 1|2|3|4|5)} labels={['Low', '', 'Neutral', '', 'High']} />
        </div>

        {/* Energy */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-3">
            Energy <span className="text-noir-dim">— physical readiness</span>
          </div>
          <RatingRow value={energy} onChange={v => setEnergy(v as 1|2|3|4|5)} labels={['Drained', '', 'OK', '', 'Fired up']} />
        </div>

        {/* Soreness */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-3">Soreness</div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['none', 'mild', 'moderate', 'high'] as Soreness[]).map(level => (
              <button
                key={level}
                onClick={() => setSoreness(level)}
                className={cn(
                  'py-2 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
                  soreness === level
                    ? level === 'high'
                      ? 'border-noir-red text-noir-red bg-noir-red/5'
                      : 'border-noir-accent text-noir-white bg-noir-elevated'
                    : 'border-noir-border text-noir-dim hover:border-noir-strong'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Forearm fatigue */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">
            Forearm / Wrist Fatigue
            <span className="text-noir-dim ml-1">— drumming strain?</span>
          </div>
          <div className="flex gap-2">
            {[false, true].map(val => (
              <button
                key={String(val)}
                onClick={() => setForearmFatigue(val)}
                className={cn(
                  'flex-1 py-2 border rounded-[2px] text-[11px] uppercase tracking-widest transition-colors',
                  forearmFatigue === val
                    ? val
                      ? 'border-yellow-700 text-yellow-600 bg-yellow-900/10'
                      : 'border-noir-accent text-noir-white bg-noir-elevated'
                    : 'border-noir-border text-noir-dim hover:border-noir-strong'
                )}
              >
                {val ? 'Yes — flagged' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">Notes (optional)</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything to note..."
            rows={2}
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong resize-none"
          />
        </div>

        <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Check-in'}
        </Button>
      </div>
    </Modal>
  )
}

interface RatingRowProps {
  value: number
  onChange: (v: number) => void
  labels: string[]
}

function RatingRow({ value, onChange, labels }: RatingRowProps) {
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              'flex-1 py-3 border rounded-[2px] text-[14px] transition-colors',
              value === n
                ? 'border-noir-accent bg-noir-elevated text-noir-white'
                : 'border-noir-border text-noir-dim hover:border-noir-strong hover:text-noir-muted'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] uppercase tracking-widest text-noir-dim">{labels[0]}</span>
        <span className="text-[9px] uppercase tracking-widest text-noir-dim">{labels[4]}</span>
      </div>
    </div>
  )
}
