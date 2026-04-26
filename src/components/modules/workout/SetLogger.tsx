import { useState, useRef } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import type { LoggedSet } from '@/db/dexie'
import { cn } from '@/lib/utils'

const MAX_SETS = 10

interface SetRowProps {
  set: LoggedSet
  onSave: (set: LoggedSet) => void
  onDelete: () => void
  saved: boolean
}

function SetRow({ set, onSave, onDelete, saved }: SetRowProps) {
  const [weight, setWeight] = useState(set.weight > 0 ? String(set.weight) : '')
  const [reps, setReps] = useState(set.reps > 0 ? String(set.reps) : '')
  const [unit, setUnit] = useState<'lbs' | 'kg'>(set.unit)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  const handleSave = () => {
    const w = parseFloat(weight)
    const r = parseInt(reps, 10)
    if (isNaN(w) || isNaN(r) || r <= 0) return
    onSave({ ...set, weight: w, reps: r, unit, timestamp: new Date().toISOString() })
  }

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setShowDelete(true), 600)
  }
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-1 rounded-[2px] transition-colors"
      style={{ background: saved ? 'rgba(20, 83, 45, 0.15)' : '#111111' }}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
    >
      {/* Set number */}
      <span
        className="text-[10px] uppercase tracking-widest shrink-0 w-8"
        style={{ color: '#555555' }}
      >
        Set {set.setNumber}
      </span>

      {/* Weight input */}
      <input
        type="number"
        inputMode="decimal"
        value={weight}
        onChange={e => setWeight(e.target.value)}
        placeholder="—"
        className="w-16 text-center rounded-[2px] border text-[13px] bg-transparent focus:outline-none transition-colors"
        style={{
          color: '#d4d4d4',
          borderColor: '#2a2a2a',
          padding: '2px 4px',
        }}
      />

      {/* Unit toggle */}
      <button
        onClick={() => setUnit(u => u === 'lbs' ? 'kg' : 'lbs')}
        className="text-[9px] uppercase tracking-widest shrink-0 w-6"
        style={{ color: '#555555' }}
      >
        {unit}
      </button>

      {/* Reps input */}
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={e => setReps(e.target.value)}
        placeholder="—"
        className="w-12 text-center rounded-[2px] border text-[13px] bg-transparent focus:outline-none transition-colors"
        style={{
          color: '#d4d4d4',
          borderColor: '#2a2a2a',
          padding: '2px 4px',
        }}
      />

      <span className="text-[10px] shrink-0" style={{ color: '#555555' }}>reps</span>

      {/* Save or delete */}
      {showDelete ? (
        <button
          onClick={() => { onDelete(); setShowDelete(false) }}
          className="ml-auto p-1 rounded-[2px] transition-colors"
          style={{ color: '#fca5a5' }}
          aria-label="Delete set"
        >
          <Trash2 size={13} />
        </button>
      ) : (
        <button
          onClick={handleSave}
          className={cn(
            'ml-auto p-1 rounded-[2px] transition-colors',
            saved ? 'opacity-40' : 'hover:opacity-70'
          )}
          style={{ color: saved ? '#86efac' : '#888888' }}
          aria-label={saved ? 'Set saved' : 'Save set'}
        >
          {saved ? <Check size={13} /> : <Plus size={13} />}
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

interface Props {
  exerciseId: string
  sets: LoggedSet[]
  onAddSet: (set: LoggedSet) => void
  onUpdateSet: (index: number, set: LoggedSet) => void
  onRemoveSet: (index: number) => void
}

export function SetLogger({ exerciseId: _exerciseId, sets, onAddSet, onUpdateSet, onRemoveSet }: Props) {
  const handleSave = (index: number, set: LoggedSet) => {
    if (index < sets.length) {
      onUpdateSet(index, set)
    } else {
      onAddSet(set)
    }
  }

  const handleAddRow = () => {
    if (sets.length >= MAX_SETS) return
    const newSet: LoggedSet = {
      setNumber: sets.length + 1,
      weight: 0,
      reps: 0,
      unit: sets.length > 0 ? sets[sets.length - 1].unit : 'lbs',
      timestamp: '',
    }
    onAddSet(newSet)
  }

  const rows = sets.length > 0 ? sets : [{
    setNumber: 1, weight: 0, reps: 0, unit: 'lbs' as const, timestamp: ''
  }]

  return (
    <div
      className="px-4 pb-3 pt-2"
      style={{ borderTop: '1px solid #2a2a2a' }}
    >
      <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: '#3a3a3a' }}>
        Log Today
      </div>

      <div className="space-y-1">
        {rows.map((s, i) => (
          <SetRow
            key={i}
            set={s}
            saved={!!s.timestamp}
            onSave={updated => handleSave(i, updated)}
            onDelete={() => onRemoveSet(i)}
          />
        ))}
      </div>

      {sets.length < MAX_SETS && (
        <button
          onClick={handleAddRow}
          className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: '#555555' }}
        >
          <Plus size={11} />
          Add Set
        </button>
      )}
    </div>
  )
}
