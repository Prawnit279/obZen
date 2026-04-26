import { useState } from 'react'
import { X, Play, Trash2, Plus, ChevronUp, ChevronDown, Check } from 'lucide-react'
import { YOGA_POSES } from '@/data/yoga-poses'
import type { YogaPose } from '@/data/yoga-poses'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & storage
// ---------------------------------------------------------------------------

interface BuildPoseEntry {
  poseId: string
  duration: number
}

interface CustomSequence {
  id: string
  name: string
  poses: BuildPoseEntry[]
  createdAt: string
}

const BUILDER_KEY = 'obzen_custom_sequences'

function loadSequences(): CustomSequence[] {
  const raw = localStorage.getItem(BUILDER_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as CustomSequence[]
  } catch {
    return []
  }
}

function saveSequences(seqs: CustomSequence[]): void {
  localStorage.setItem(BUILDER_KEY, JSON.stringify(seqs))
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  onPlay: (poses: YogaPose[], name: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolvePoses(entries: BuildPoseEntry[]): YogaPose[] {
  return entries.flatMap(e => {
    const found = YOGA_POSES.find(p => p.id === e.poseId)
    return found ? [found] : []
  })
}

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

interface ListViewProps {
  sequences: CustomSequence[]
  onNew: () => void
  onPlay: (seq: CustomSequence) => void
  onDelete: (id: string) => void
}

function ListView({ sequences, onNew, onPlay, onDelete }: ListViewProps) {
  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: '#555555' }}
        >
          Custom Sequences
        </span>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-[10px] uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}
        >
          <Plus size={11} />
          New Sequence
        </button>
      </div>

      {/* Empty state */}
      {sequences.length === 0 && (
        <div
          className="py-10 text-center rounded-[2px]"
          style={{ border: '1px solid #1a1a1a' }}
        >
          <p className="text-[12px]" style={{ color: '#555555' }}>
            No custom sequences yet.
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#3a3a3a' }}>
            Build your first.
          </p>
        </div>
      )}

      {/* Sequence cards */}
      {sequences.map(seq => (
        <div
          key={seq.id}
          className="p-3 rounded-[2px] flex items-center justify-between gap-3"
          style={{ background: '#111111', border: '1px solid #2a2a2a' }}
        >
          <div className="min-w-0">
            <div className="text-[13px] truncate" style={{ color: '#d4d4d4' }}>
              {seq.name}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: '#555555' }}>
              {seq.poses.length} pose{seq.poses.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onPlay(seq)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-[10px] uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ border: '1px solid #888888', color: '#888888' }}
              aria-label={`Play ${seq.name}`}
            >
              <Play size={10} />
              Play
            </button>
            <button
              onClick={() => onDelete(seq.id)}
              className="flex items-center justify-center w-7 h-7 rounded-[2px] transition-opacity hover:opacity-60"
              style={{ border: '1px solid #2a2a2a', color: '#555555' }}
              aria-label={`Delete ${seq.name}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pose picker row
// ---------------------------------------------------------------------------

interface PosePickerRowProps {
  pose: YogaPose
  alreadyAdded: boolean
  onAdd: (poseId: string) => void
}

function PosePickerRow({ pose, alreadyAdded, onAdd }: PosePickerRowProps) {
  return (
    <button
      onClick={() => onAdd(pose.id)}
      className={cn(
        'w-full text-left px-3 py-2 rounded-[2px] flex items-center justify-between gap-3 transition-colors',
        alreadyAdded
          ? 'opacity-40 cursor-default'
          : 'hover:bg-[#181818]',
      )}
      style={{ border: '1px solid #1a1a1a' }}
      disabled={alreadyAdded}
    >
      <div className="min-w-0">
        <div className="text-[12px] truncate" style={{ color: '#d4d4d4' }}>
          {pose.name}
        </div>
        {pose.sanskritName && (
          <div className="text-[10px] italic truncate" style={{ color: '#555555' }}>
            {pose.sanskritName}
          </div>
        )}
        <div className="text-[10px] capitalize mt-0.5" style={{ color: '#3a3a3a' }}>
          {pose.category} · {pose.duration}
        </div>
      </div>
      {alreadyAdded ? (
        <Check size={12} style={{ color: '#555555' }} className="shrink-0" />
      ) : (
        <Plus size={12} style={{ color: '#555555' }} className="shrink-0" />
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Built pose row
// ---------------------------------------------------------------------------

interface BuiltPoseRowProps {
  entry: BuildPoseEntry
  index: number
  total: number
  onDurationChange: (index: number, duration: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onRemove: (index: number) => void
}

function BuiltPoseRow({
  entry,
  index,
  total,
  onDurationChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: BuiltPoseRowProps) {
  const pose = YOGA_POSES.find(p => p.id === entry.poseId)
  if (!pose) return null

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-[2px]"
      style={{ background: '#111111', border: '1px solid #2a2a2a' }}
    >
      {/* Reorder */}
      <div className="flex flex-col gap-0.5">
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="transition-opacity hover:opacity-70 disabled:opacity-20"
          aria-label="Move up"
        >
          <ChevronUp size={12} style={{ color: '#555555' }} />
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
          className="transition-opacity hover:opacity-70 disabled:opacity-20"
          aria-label="Move down"
        >
          <ChevronDown size={12} style={{ color: '#555555' }} />
        </button>
      </div>

      {/* Pose name */}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] truncate" style={{ color: '#d4d4d4' }}>
          {pose.name}
        </div>
        <div className="text-[10px] capitalize" style={{ color: '#555555' }}>
          {pose.category}
        </div>
      </div>

      {/* Duration input */}
      <div className="flex items-center gap-1 shrink-0">
        <input
          type="number"
          min={5}
          max={600}
          value={entry.duration}
          onChange={e => onDurationChange(index, Math.max(5, parseInt(e.target.value) || 5))}
          className="w-12 text-right text-[12px] bg-transparent outline-none tabular-nums"
          style={{ color: '#888888', border: '1px solid #2a2a2a', borderRadius: '2px', padding: '2px 4px' }}
          aria-label={`Duration for ${pose.name}`}
        />
        <span className="text-[10px]" style={{ color: '#3a3a3a' }}>s</span>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(index)}
        className="shrink-0 transition-opacity hover:opacity-60"
        aria-label={`Remove ${pose.name}`}
      >
        <X size={13} style={{ color: '#555555' }} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Build view
// ---------------------------------------------------------------------------

interface BuildViewProps {
  onSave: (name: string, poses: BuildPoseEntry[]) => void
  onCancel: () => void
}

function BuildView({ onSave, onCancel }: BuildViewProps) {
  const [buildName, setBuildName] = useState('')
  const [buildPoses, setBuildPoses] = useState<BuildPoseEntry[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const addedIds = new Set(buildPoses.map(e => e.poseId))

  const filteredPoses = search.trim()
    ? YOGA_POSES.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sanskritName?.toLowerCase().includes(search.toLowerCase()) ?? false),
      )
    : YOGA_POSES

  function handleAdd(poseId: string): void {
    if (addedIds.has(poseId)) return
    setBuildPoses(prev => [...prev, { poseId, duration: 60 }])
  }

  function handleDurationChange(index: number, duration: number): void {
    setBuildPoses(prev =>
      prev.map((e, i) => (i === index ? { ...e, duration } : e)),
    )
  }

  function handleMoveUp(index: number): void {
    if (index === 0) return
    setBuildPoses(prev => {
      const next = [...prev]
      const temp = next[index - 1]
      next[index - 1] = next[index]
      next[index] = temp
      return next
    })
  }

  function handleMoveDown(index: number): void {
    setBuildPoses(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      const temp = next[index + 1]
      next[index + 1] = next[index]
      next[index] = temp
      return next
    })
  }

  function handleRemove(index: number): void {
    setBuildPoses(prev => prev.filter((_, i) => i !== index))
  }

  function handleSave(): void {
    const trimmed = buildName.trim()
    if (!trimmed) {
      setError('Sequence name is required.')
      return
    }
    if (buildPoses.length === 0) {
      setError('Add at least one pose.')
      return
    }
    setError(null)
    onSave(trimmed, buildPoses)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: '#555555' }}
        >
          Build Sequence
        </span>
        <button
          onClick={onCancel}
          className="text-[10px] uppercase tracking-widest transition-opacity hover:opacity-60"
          style={{ color: '#3a3a3a' }}
        >
          Cancel
        </button>
      </div>

      {/* Name input */}
      <input
        type="text"
        placeholder="Sequence name"
        value={buildName}
        onChange={e => setBuildName(e.target.value)}
        className="w-full px-3 py-2 rounded-[2px] text-[13px] bg-transparent outline-none placeholder:text-[#3a3a3a]"
        style={{
          border: '1px solid #2a2a2a',
          color: '#d4d4d4',
        }}
      />

      {/* Built poses list */}
      {buildPoses.length > 0 && (
        <div className="space-y-1.5">
          <div
            className="text-[9px] uppercase tracking-widest"
            style={{ color: '#3a3a3a' }}
          >
            Sequence ({buildPoses.length} pose{buildPoses.length !== 1 ? 's' : ''})
          </div>
          {buildPoses.map((entry, i) => (
            <BuiltPoseRow
              key={`${entry.poseId}-${i}`}
              entry={entry}
              index={i}
              total={buildPoses.length}
              onDurationChange={handleDurationChange}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[11px]" style={{ color: '#cc3333' }}>
          {error}
        </p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest transition-opacity hover:opacity-80"
        style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}
      >
        Save Sequence
      </button>

      {/* Pose picker */}
      <div className="space-y-2">
        <div
          className="text-[9px] uppercase tracking-widest"
          style={{ color: '#3a3a3a' }}
        >
          Add Poses
        </div>
        <input
          type="text"
          placeholder="Search poses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-[2px] text-[12px] bg-transparent outline-none placeholder:text-[#3a3a3a]"
          style={{ border: '1px solid #1a1a1a', color: '#888888' }}
        />
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filteredPoses.map(pose => (
            <PosePickerRow
              key={pose.id}
              pose={pose}
              alreadyAdded={addedIds.has(pose.id)}
              onAdd={handleAdd}
            />
          ))}
          {filteredPoses.length === 0 && (
            <p className="text-[11px] px-3 py-2" style={{ color: '#3a3a3a' }}>
              No poses match "{search}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SequenceBuilder({ onPlay }: Props) {
  const [sequences, setSequences] = useState<CustomSequence[]>(loadSequences)
  const [view, setView] = useState<'list' | 'build'>('list')

  function handleSave(name: string, poses: BuildPoseEntry[]): void {
    const newSeq: CustomSequence = {
      id: generateId(),
      name,
      poses,
      createdAt: new Date().toISOString(),
    }
    const updated = [...sequences, newSeq]
    saveSequences(updated)
    setSequences(updated)
    setView('list')
  }

  function handleDelete(id: string): void {
    const updated = sequences.filter(s => s.id !== id)
    saveSequences(updated)
    setSequences(updated)
  }

  function handlePlay(seq: CustomSequence): void {
    const poses = resolvePoses(seq.poses)
    if (poses.length > 0) {
      onPlay(poses, seq.name)
    }
  }

  if (view === 'build') {
    return (
      <BuildView
        onSave={handleSave}
        onCancel={() => setView('list')}
      />
    )
  }

  return (
    <ListView
      sequences={sequences}
      onNew={() => setView('build')}
      onPlay={handlePlay}
      onDelete={handleDelete}
    />
  )
}
