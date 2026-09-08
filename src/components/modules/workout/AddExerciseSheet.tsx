import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Search, Plus } from 'lucide-react'
import { getProgram, EXERCISE_LIBRARY, formatTarget, toExerciseId } from '@/data/obzen-program'
import { useProfileStore } from '@/store/useProfileStore'
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

function makeExerciseState(
  name: string,
  addedFrom: ExerciseSessionState['addedFrom'],
  opts?: { muscle?: string; target?: string }
): ExerciseSessionState {
  return {
    exerciseId: toExerciseId(name),
    name,
    muscle: opts?.muscle,
    target: opts?.target,
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
  const activeId = useProfileStore(s => s.activeId)
  const otherDays = (['Day 1', 'Day 2', 'Day 3'] as const).filter(d => d !== currentDay)

  return (
    <div className="space-y-4">
      {otherDays.map(day => {
        const program = getProgram(activeId)[day]
        const available = program.exercises.filter(ex => !existingIds.includes(toExerciseId(ex.name)))
        return (
          <div key={day}>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--ink-faint)' }}>
              {day} — {program.focus}
            </div>
            {available.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--ink-faint)' }}>All exercises already added.</p>
            ) : (
              <div className="space-y-1">
                {available.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => onAdd(makeExerciseState(ex.name, day, {
                      muscle: ex.muscle,
                      target: formatTarget(ex),
                    }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--r-control)] text-left transition-opacity hover:opacity-70"
                    style={{ background: 'var(--elevated)', border: '1px solid var(--hairline)' }}
                  >
                    <div>
                      <div className="text-[14px]" style={{ color: 'var(--ink)' }}>{ex.name}</div>
                      <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>
                        {ex.muscle} · {ex.sets}×{ex.reps}
                      </div>
                    </div>
                    <Plus size={14} style={{ color: 'var(--ink-dim)' }} />
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

  const filtered = EXERCISE_LIBRARY.filter(ex => {
    const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase())
    const matchMuscle = muscle === 'all' || ex.muscle === muscle
    return matchSearch && matchMuscle && !existingIds.includes(toExerciseId(ex.name))
  })

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-faint)' }} />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-[var(--r-control)] border pl-8 pr-3 py-2 text-[12px] bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--hairline)', color: 'var(--ink)' }}
        />
      </div>

      {/* Muscle filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', ...MUSCLE_GROUPS] as const).map(g => (
          <button
            key={g}
            onClick={() => setMuscle(g)}
            className={cn(
              'px-2.5 py-1 rounded-[var(--r-control)] text-[9px] uppercase tracking-widest transition-colors',
              muscle === g ? 'text-white' : 'hover:opacity-70'
            )}
            style={{
              border: '1px solid ' + (muscle === g ? '#888888' : 'var(--hairline)'),
              color: muscle === g ? 'var(--ink)' : 'var(--ink-faint)',
              background: muscle === g ? 'var(--elevated)' : 'transparent',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>No exercises found.</p>
        ) : (
          filtered.slice(0, 50).map(ex => (
            <button
              key={ex.name}
              onClick={() => onAdd(makeExerciseState(ex.name, 'library', {
                muscle: ex.muscle,
                target: formatTarget(ex),
              }))}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--r-control)] text-left transition-opacity hover:opacity-70"
              style={{ background: 'var(--elevated)', border: '1px solid var(--hairline)' }}
            >
              <div>
                <div className="text-[14px] flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                  {ex.name}
                  {ex.isCore && (
                    <span className="text-[9px] uppercase tracking-widest px-1 py-0.5 rounded-[var(--r-control)]" style={{ color: 'var(--ink-dim)', border: '1px solid var(--border-strong)' }}>Core</span>
                  )}
                </div>
                <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>
                  {ex.muscle} · {ex.sets}×{ex.reps}
                </div>
              </div>
              <Plus size={14} style={{ color: 'var(--ink-dim)' }} />
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
    onAdd(makeExerciseState(name.trim(), 'custom', { muscle }))
    setName('')
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>
          Exercise Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Face Pulls"
          className="w-full rounded-[var(--r-control)] border px-3 py-2 text-[12px] bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--hairline)', color: 'var(--ink)' }}
        />
      </div>

      <div>
        <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>
          Muscle Group
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setMuscle(g)}
              className={cn('px-2.5 py-1 rounded-[var(--r-control)] text-[9px] uppercase tracking-widest transition-colors')}
              style={{
                border: '1px solid ' + (muscle === g ? '#888888' : 'var(--hairline)'),
                color: muscle === g ? 'var(--ink)' : 'var(--ink-faint)',
                background: muscle === g ? 'var(--elevated)' : 'transparent',
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
        className="w-full py-2.5 rounded-[var(--r-control)] text-[11px] uppercase tracking-widest transition-opacity disabled:opacity-30"
        style={{ border: '1px solid var(--accent)', color: 'var(--ink)' }}
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

  const tabStrip = (
  <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--hairline)' }}>
    {TABS.map(t => (
      <button
        key={t.key}
        onClick={() => setTab(t.key)}
        className="flex-1 py-2.5 text-[11px] uppercase tracking-widest transition-colors"
        style={{
          color: tab === t.key ? 'var(--ink)' : 'var(--ink-faint)',
          borderBottom: tab === t.key ? '2px solid var(--violet-400)' : '2px solid transparent',
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
  )

  return (
    <Sheet title="Add Exercise" onClose={onClose} maxHeight="80vh" pinned={tabStrip}>
          {tab === 'other' && (
            <OtherDaysTab currentDay={currentDay} existingIds={existingIds} onAdd={handleAdd} />
          )}
          {tab === 'library' && (
            <LibraryTab existingIds={existingIds} onAdd={handleAdd} />
          )}
          {tab === 'custom' && (
            <CustomTab onAdd={handleAdd} />
          )}
    </Sheet>
  )
}
