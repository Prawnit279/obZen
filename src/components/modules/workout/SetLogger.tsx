import { useState, useRef } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import type { LoggedSet } from '@/db/dexie'
import { cn } from '@/lib/utils'
import { setUnitsFor } from '@/lib/setUnits'
import type { SetUnits } from '@/lib/setUnits'

const MAX_SETS = 10

interface SetRowProps {
  set: LoggedSet
  /** What this movement's two numbers mean — reps or seconds, load or assistance. */
  units: SetUnits
  onSave: (set: LoggedSet) => void
  onDelete: () => void
  saved: boolean
}

/**
 * Carry the AMRAP flag onto a set, leaving the key off entirely when it is not
 * one — every stored row and every backup would otherwise gain a `false` that
 * says nothing.
 */
function withAmrap(base: LoggedSet, isAmrap: boolean): LoggedSet {
  if (isAmrap) return { ...base, isAmrap: true }
  const next = { ...base }
  delete next.isAmrap
  return next
}

function SetRow({ set, units, onSave, onDelete, saved }: SetRowProps) {
  const [weight, setWeight] = useState(set.weight > 0 ? String(set.weight) : '')
  const [reps, setReps] = useState(set.reps > 0 ? String(set.reps) : '')
  const [unit, setUnit] = useState<'lbs' | 'kg'>(set.unit)
  const [isAmrap, setIsAmrap] = useState(set.isAmrap === true)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  const handleSave = () => {
    const w = parseFloat(weight)
    const r = parseInt(reps, 10)
    if (isNaN(w) || isNaN(r) || r <= 0) return
    const saved: LoggedSet = { ...set, weight: w, reps: r, unit, timestamp: new Date().toISOString() }
    onSave(withAmrap(saved, isAmrap))
  }

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setShowDelete(true), 600)
  }
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-1 rounded-[var(--r-control)] transition-colors"
      style={{ background: saved ? 'rgba(20, 83, 45, 0.15)' : 'var(--card)' }}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
    >
      {/* Set number */}
      <span
        className="uppercase shrink-0 w-9"
        style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-faint)' }}
      >
        Set {set.setNumber}
      </span>

      {/* Weight input */}
      <input
        type="number"
        inputMode="decimal"
        value={weight}
        onChange={e => setWeight(e.target.value)}
        aria-label={`${units.weightAria}, set ${set.setNumber}`}
        placeholder="—"
        className="w-16 text-center rounded-[var(--r-control)] border text-[13px] bg-transparent focus:outline-none transition-colors"
        style={{
          color: 'var(--ink)',
          borderColor: 'var(--hairline)',
          padding: '2px 4px',
        }}
      />

      {/* Unit toggle */}
      <button
        onClick={() => setUnit(u => u === 'lbs' ? 'kg' : 'lbs')}
        className="uppercase shrink-0 w-7"
        style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-faint)' }}
        aria-label={`Unit: ${unit}. Tap to switch.`}
      >
        {unit}
      </button>

      {/* Reps input */}
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={e => setReps(e.target.value)}
        aria-label={`${units.countAria}, set ${set.setNumber}`}
        placeholder="—"
        className="w-12 text-center rounded-[var(--r-control)] border text-[13px] bg-transparent focus:outline-none transition-colors"
        style={{
          color: 'var(--ink)',
          borderColor: 'var(--hairline)',
          padding: '2px 4px',
        }}
      />

      {/* The count label doubles as the AMRAP toggle: 5/3/1 writes an
          as-many-reps-as-possible set as '5+', so the '+' is the notation
          itself rather than another control competing for width. A timed hold
          has no rep ceiling to probe, so it stays a plain label. */}
      {units.isDuration ? (
        <span className="shrink-0" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
          {units.countLabel}
        </span>
      ) : (
        <button
          onClick={() => setIsAmrap(v => !v)}
          aria-pressed={isAmrap}
          aria-label={`Mark set ${set.setNumber} as AMRAP — as many reps as possible`}
          className="shrink-0 transition-colors"
          style={{ fontSize: 11, color: isAmrap ? 'var(--complete-text)' : 'var(--ink-faint)' }}
        >
          {units.countLabel}{isAmrap ? '+' : ''}
        </button>
      )}

      {/* Save or delete */}
      {showDelete ? (
        <button
          onClick={() => { onDelete(); setShowDelete(false) }}
          className="ml-auto p-1 rounded-[var(--r-control)] transition-colors"
          style={{ color: 'var(--skip-text)' }}
          aria-label="Delete set"
        >
          <Trash2 size={14} />
        </button>
      ) : (
        <button
          onClick={handleSave}
          className={cn(
            'ml-auto p-1 rounded-[var(--r-control)] transition-colors',
            saved ? 'opacity-40' : 'hover:opacity-70'
          )}
          style={{ color: saved ? 'var(--complete-text)' : 'var(--ink-dim)' }}
          aria-label={saved ? 'Set saved' : 'Save set'}
        >
          {saved ? <Check size={14} /> : <Plus size={14} />}
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

export function SetLogger({ exerciseId, sets, onAddSet, onUpdateSet, onRemoveSet }: Props) {
  // A plank logs seconds and an assisted pull-up logs assistance; the inputs
  // say so, because `lib/progress.ts` reads them that way.
  const units = setUnitsFor(exerciseId)

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
      style={{ borderTop: '1px solid var(--hairline)' }}
    >
      <div
        className="uppercase"
        style={{
          fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
          color: 'var(--ink-dim)', marginBottom: 8,
        }}
      >
        Log Today
        {units.isDuration && <span style={{ color: 'var(--ink-dim)' }}> · hold in seconds</span>}
        {units.isAssistance && <span style={{ color: 'var(--ink-dim)' }}> · assistance weight</span>}
        {!units.isDuration && (
          <span style={{ color: 'var(--ink-faint)' }}> · tap “{units.countLabel}” for an AMRAP</span>
        )}
      </div>

      <div className="space-y-1">
        {rows.map((s, i) => (
          <SetRow
            key={i}
            set={s}
            units={units}
            saved={!!s.timestamp}
            onSave={updated => handleSave(i, updated)}
            onDelete={() => onRemoveSet(i)}
          />
        ))}
      </div>

      {sets.length < MAX_SETS && (
        <button
          onClick={handleAddRow}
          className="mt-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: 'var(--ink-faint)' }}
        >
          <Plus size={12} />
          Add Set
        </button>
      )}
    </div>
  )
}
