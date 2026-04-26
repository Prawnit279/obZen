import { useState } from 'react'
import type { SetLog } from '@/db/dexie'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Props {
  set: SetLog
  onChange: (updated: SetLog) => void
  disabled?: boolean
}

export function SetRow({ set, onChange, disabled }: Props) {
  const [editing, setEditing] = useState(false)

  const toggle = () => {
    if (disabled) return
    onChange({ ...set, completed: !set.completed })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2 border-b border-noir-border last:border-0',
        set.completed && 'opacity-60'
      )}
    >
      <span
        className={cn(
          'text-[9px] uppercase tracking-widest w-10 shrink-0',
          set.isWarmup ? 'text-noir-dim' : 'text-noir-muted'
        )}
      >
        {set.isWarmup ? 'Warm' : `W${set.setNumber}`}
      </span>

      <input
        type="text"
        value={set.weight}
        onChange={e => onChange({ ...set, weight: e.target.value })}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
        className={cn(
          'w-16 bg-transparent border-b text-[13px] text-center focus:outline-none transition-colors',
          editing ? 'border-noir-accent text-noir-white' : 'border-noir-strong text-noir-accent'
        )}
        placeholder="wt"
        disabled={disabled}
      />

      <span className="text-[10px] text-noir-dim">×</span>

      <input
        type="number"
        value={set.reps || ''}
        onChange={e => onChange({ ...set, reps: parseInt(e.target.value, 10) || 0 })}
        className={cn(
          'w-10 bg-transparent border-b text-[13px] text-center focus:outline-none transition-colors',
          'border-noir-strong text-noir-accent focus:border-noir-accent focus:text-noir-white'
        )}
        placeholder="reps"
        min={0}
        disabled={disabled}
      />

      <button
        onClick={toggle}
        disabled={disabled}
        className={cn(
          'ml-auto w-7 h-7 border rounded-[2px] flex items-center justify-center transition-colors shrink-0',
          set.completed
            ? 'border-noir-accent bg-noir-accent text-noir-bg'
            : 'border-noir-strong text-noir-dim hover:border-noir-muted'
        )}
        aria-label={set.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {set.completed && <Check size={12} strokeWidth={2.5} />}
      </button>
    </div>
  )
}
