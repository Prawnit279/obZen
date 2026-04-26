import { useState } from 'react'
import { X, Search, Plus } from 'lucide-react'
import { OBZEN_PROGRAM, SWAP_OPTIONS } from '@/data/obzen-program'
import type { MuscleGroup } from '@/data/obzen-program'
import type { ExerciseSessionState } from '@/db/dexie'
import { cn } from '@/lib/utils'

type Tab = 'other' | 'library' | 'custom'

const MUSCLE_GROUPS: MuscleGroup[] = ['legs', 'back', 'shoulders', 'arms', 'chest', 'core']

interface Props {
  currentDay: 'Day 1' | 'Day 2' | 'Day 3'
  existingIds: string[]
  onAdd: (exercise: ExerciseSessionState) => void
  onClose: () => void
}

function toId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function makeExerciseState(name: string, addedFrom: ExerciseSessionState['addedFrom']): ExerciseSessionState {
  return {
    exerciseId: toId(name),
    status: 'pending',
    sets: [],
    addedFrom,
  }
}

// ---------------------------------------------------------------------------
// Other Days tab
// ---------------------------------------------------------------------------

function OtherDaysTab({
  currentDay,
  existingIds,
  onAdd,
}: { currentDay: 'Day 1' | 'Day 2' | 'Day 3'; existingIds: string[]; onAdd: (ex: ExerciseSessionState) => void }) {
  const otherDays = (['Day 1', 'Day 2', 'Day 3'] as const).filter(d => d !== currentDay)

  return (
    <div className="space-y-4">
      {otherDays.map(day => {
        const program = OBZEN_PROGRAM[day]
        const available = program.exercises.filter(ex => !existingIds.includes(toId(ex.name)))
        return (
          <div key={day}>
            <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: '#3a3a3a' }}>
              {day} — {program.focus}
            </div>
            {available.length === 0 ? (
              <p className="text-[11px]" style={{ color: '#555555' }}>All exercises already added.</p>
            ) : (
              <div className="space-y-1">
                {available.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => onAdd(makeExerciseState(ex.name, day))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[2px] text-left transition-opacity hover:opacity-70"
                    style={{ background: '#181818', border: '1px solid #2a2a2a' }}
                  >
                    <div>
                      <div className="text-[12px]" style={{ color: '#d4d4d4' }}>{ex.name}</div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: '#555555' }}>
                        {ex.muscle} · {ex.working}
                      </div>
                    </div>
                    <Plus size={13} style={{ color: '#555555' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Library tab
// ---------------------------------------------------------------------------

function LibraryTab({
  existingIds,
  onAdd,
}: { existingIds: string[]; onAdd: (ex: ExerciseSessionState) => void }) {
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all')

  const allExercises = Object.entries(SWAP_OPTIONS).flatMap(([group, names]) =>
    names.map(name => ({ name, muscle: group as MuscleGroup }))
  )

  const filtered = allExercises.filter(ex => {
    const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = muscle === 'all' || ex.muscle === muscle
    return matchSearch && matchMuscle && !existingIds.includes(toId(ex.name))
  })

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555555' }} />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-[2px] border pl-8 pr-3 py-2 text-[12px] bg-transparent focus:outline-none"
          style={{ borderColor: '#2a2a2a', color: '#d4d4d4' }}
        />
      </div>

      {/* Muscle filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', ...MUSCLE_GROUPS] as const).map(g => (
          <button
            key={g}
            onClick={() => setMuscle(g)}
            className={cn(
              'px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest transition-colors',
              muscle === g ? 'text-white' : 'hover:opacity-70'
            )}
            style={{
              border: '1px solid ' + (muscle === g ? '#888888' : '#2a2a2a'),
              color: muscle === g ? '#d4d4d4' : '#555555',
              background: muscle === g ? '#181818' : 'transparent',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[11px]" style={{ color: '#555555' }}>No exercises found.</p>
        ) : (
          filtered.slice(0, 40).map(ex => (
            <button
              key={ex.name}
              onClick={() => onAdd(makeExerciseState(ex.name, 'library'))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[2px] text-left transition-opacity hover:opacity-70"
              style={{ background: '#181818', border: '1px solid #2a2a2a' }}
            >
              <div>
                <div className="text-[12px]" style={{ color: '#d4d4d4' }}>{ex.name}</div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: '#555555' }}>
                  {ex.muscle}
                </div>
              </div>
              <Plus size={13} style={{ color: '#555555' }} />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Custom tab
// ---------------------------------------------------------------------------

function CustomTab({ onAdd }: { onAdd: (ex: ExerciseSessionState) => void }) {
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState<MuscleGroup>('legs')

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({ ...makeExerciseState(name.trim(), 'custom') })
    setName('')
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>
          Exercise Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Face Pulls"
          className="w-full rounded-[2px] border px-3 py-2 text-[12px] bg-transparent focus:outline-none"
          style={{ borderColor: '#2a2a2a', color: '#d4d4d4' }}
        />
      </div>

      <div>
        <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>
          Muscle Group
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setMuscle(g)}
              className={cn('px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest transition-colors')}
              style={{
                border: '1px solid ' + (muscle === g ? '#888888' : '#2a2a2a'),
                color: muscle === g ? '#d4d4d4' : '#555555',
                background: muscle === g ? '#181818' : 'transparent',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest transition-opacity disabled:opacity-30"
        style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}
      >
        Add to Today
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main sheet
// ---------------------------------------------------------------------------

export function AddExerciseSheet({ currentDay, existingIds, onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('other')

  const handleAdd = (ex: ExerciseSessionState) => {
    onAdd(ex)
    onClose()
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'other', label: 'Other Days' },
    { key: 'library', label: 'Library' },
    { key: 'custom', label: 'Custom' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-t-[4px] flex flex-col max-h-[80vh]"
        style={{ background: '#111111', border: '1px solid #2a2a2a' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid #2a2a2a' }}
        >
          <span className="text-[12px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>
            Add Exercise
          </span>
          <button
            onClick={onClose}
            className="transition-opacity hover:opacity-60"
            aria-label="Close sheet"
          >
            <X size={16} style={{ color: '#555555' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0" style={{ borderBottom: '1px solid #2a2a2a' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 text-[10px] uppercase tracking-widest transition-colors"
              style={{
                color: tab === t.key ? '#d4d4d4' : '#555555',
                borderBottom: tab === t.key ? '1px solid #d4d4d4' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'other' && (
            <OtherDaysTab currentDay={currentDay} existingIds={existingIds} onAdd={handleAdd} />
          )}
          {tab === 'library' && (
            <LibraryTab existingIds={existingIds} onAdd={handleAdd} />
          )}
          {tab === 'custom' && (
            <CustomTab onAdd={handleAdd} />
          )}
        </div>
      </div>
    </div>
  )
}
