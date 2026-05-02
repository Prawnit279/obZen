import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { db } from '@/db/dexie'
import type { Board, Task } from '@/db/dexie'
import { Plus, X, ChevronLeft, GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = Task['status']
type Priority = Task['priority']
type BoardCategory = Board['category']

const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo',        label: 'Todo' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done',        label: 'Done' },
]
const PRIORITIES: Priority[] = ['low', 'medium', 'high']
const PRIORITY_COLOR: Record<Priority, string> = { low: '#555555', medium: '#fbbf24', high: '#fb7185' }
const CATEGORIES: BoardCategory[] = ['work', 'creative', 'personal', 'courses']

// ── New Board Sheet ────────────────────────────────────────────────────────────
function NewBoardSheet({ onClose }: { onClose: () => void }) {
  const [name, setName]         = useState('')
  const [category, setCategory] = useState<BoardCategory>('personal')
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await db.boards.add({ name: name.trim(), category })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-t-[4px]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <span className="text-[12px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>New Board</span>
          <button onClick={onClose} aria-label="Close"><X size={16} style={{ color: '#555555' }} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Board Name *</label>
            <input className="input w-full" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q2 Work, Album Project..." autoFocus />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Category</label>
            <div className="flex gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className="flex-1 py-1.5 rounded-[2px] text-[9px] uppercase tracking-widest capitalize transition-colors"
                  style={{ border: `1px solid ${category === c ? '#888888' : '#2a2a2a'}`, color: category === c ? '#d4d4d4' : '#555555', background: category === c ? '#181818' : 'transparent' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} disabled={!name.trim() || saving}
            className="w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest disabled:opacity-30"
            style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}>
            {saving ? 'Creating...' : 'Create Board'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── New Task Sheet ─────────────────────────────────────────────────────────────
function NewTaskSheet({ boardId, onClose }: { boardId: number; onClose: () => void }) {
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate]   = useState('')
  const [notes, setNotes]       = useState('')
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    await db.tasks.add({
      boardId, title: title.trim(), status: 'todo', priority,
      dueDate: dueDate || undefined, notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-t-[4px]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <span className="text-[12px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>New Task</span>
          <button onClick={onClose} aria-label="Close"><X size={16} style={{ color: '#555555' }} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Task *</label>
            <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className="flex-1 py-1 rounded-[2px] text-[9px] uppercase tracking-widest capitalize"
                    style={{ border: `1px solid ${priority === p ? PRIORITY_COLOR[p] : '#2a2a2a'}`, color: priority === p ? PRIORITY_COLOR[p] : '#555555' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Due</label>
              <input type="date" className="input w-full" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Notes</label>
            <textarea className="input w-full resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional..." />
          </div>
          <button onClick={handleSave} disabled={!title.trim() || saving}
            className="w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest disabled:opacity-30"
            style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}>
            {saving ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sortable Task Card ─────────────────────────────────────────────────────────
function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const cycleStatus = () => {
    const next: Status = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo'
    db.tasks.update(task.id!, { status: next, completedAt: next === 'done' ? new Date().toISOString() : undefined })
  }

  return (
    <div ref={setNodeRef} style={{ ...style, background: '#111111', border: '1px solid #2a2a2a' }}
      className="flex items-start gap-2 p-2.5 rounded-[2px]">
      <div {...attributes} {...listeners} className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing">
        <GripVertical size={12} style={{ color: '#3a3a3a' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[12px]', task.status === 'done' && 'line-through opacity-50')} style={{ color: '#d4d4d4' }}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] uppercase" style={{ color: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
          {task.dueDate && <span className="text-[9px]" style={{ color: '#555555' }}>Due {task.dueDate.slice(5)}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={cycleStatus} className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-[2px] transition-colors"
          style={{ border: '1px solid #2a2a2a', color: '#555555' }}>
          →
        </button>
        <button onClick={() => db.tasks.delete(task.id!)} aria-label="Delete task">
          <Trash2 size={11} style={{ color: '#3a3a3a' }} />
        </button>
      </div>
    </div>
  )
}

// ── Board View (Kanban) ────────────────────────────────────────────────────────
function BoardView({ board, onBack }: { board: Board; onBack: () => void }) {
  const [showNewTask, setShowNewTask] = useState(false)

  const tasks = useLiveQuery(
    () => db.tasks.where('boardId').equals(board.id!).toArray(),
    [board.id]
  ) ?? []

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return
    // If dropped onto a column header, move to that status
    const col = COLUMNS.find(c => c.status === over.id)
    if (col) {
      await db.tasks.update(activeTask.id!, { status: col.status })
    }
  }

  const todoTasks   = tasks.filter(t => t.status === 'todo')
  const inProgTasks = tasks.filter(t => t.status === 'in-progress')
  const doneTasks   = tasks.filter(t => t.status === 'done')
  const byStatus: Record<Status, Task[]> = { 'todo': todoTasks, 'in-progress': inProgTasks, 'done': doneTasks }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack} className="text-noir-dim hover:text-noir-muted transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-widest text-noir-muted capitalize">{board.category}</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">{board.name}</div>
        </div>
        <button onClick={() => setShowNewTask(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-muted hover:text-noir-white hover:border-noir-strong transition-colors">
          <Plus size={12} /> Task
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-2">
          {COLUMNS.map(col => {
            const colTasks = byStatus[col.status]
            return (
              <div key={col.status} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: '#555555' }}>{col.label}</p>
                  <span className="text-[9px]" style={{ color: '#3a3a3a' }}>{colTasks.length}</span>
                </div>
                <div className="min-h-[60px] space-y-1.5 rounded-[2px] p-1.5" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                  <SortableContext items={colTasks.map(t => t.id!)} strategy={verticalListSortingStrategy}>
                    {colTasks.map(task => (
                      <div key={task.id} className="rounded-[2px]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
                        <SortableTask task={task} />
                      </div>
                    ))}
                  </SortableContext>
                  {colTasks.length === 0 && (
                    <p className="text-[9px] text-center py-3" style={{ color: '#2a2a2a' }}>Empty</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DndContext>

      {showNewTask && <NewTaskSheet boardId={board.id!} onClose={() => setShowNewTask(false)} />}
    </div>
  )
}

// ── Boards List ────────────────────────────────────────────────────────────────
export default function Projects() {
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [activeBoard, setActiveBoard]  = useState<Board | null>(null)

  const boards = useLiveQuery(() => db.boards.toArray(), []) ?? []

  if (activeBoard) {
    return (
      <div className="page-container">
        <BoardView board={activeBoard} onBack={() => setActiveBoard(null)} />
      </div>
    )
  }

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Kanban</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Projects</div>
        </div>
        <button onClick={() => setShowNewBoard(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-muted hover:text-noir-white hover:border-noir-strong transition-colors">
          <Plus size={12} /> Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <p className="text-[13px]" style={{ color: '#555555' }}>No boards yet.</p>
          <p className="text-[11px]" style={{ color: '#3a3a3a' }}>Create boards for Work, Creative, Personal, or Courses.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {boards.map(board => {
            const taskCount = 0 // Will be live once opened
            return (
              <button key={board.id} onClick={() => setActiveBoard(board)}
                className="w-full flex items-center justify-between p-4 rounded-[2px] text-left transition-colors hover:bg-noir-elevated"
                style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
                <div>
                  <p className="text-[13px]" style={{ color: '#d4d4d4' }}>{board.name}</p>
                  <p className="text-[10px] mt-0.5 capitalize" style={{ color: '#555555' }}>{board.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px]" style={{ color: '#3a3a3a' }}>{taskCount} tasks</span>
                  <button onClick={e => { e.stopPropagation(); db.boards.delete(board.id!) }}
                    aria-label="Delete board" className="p-1">
                    <Trash2 size={13} style={{ color: '#3a3a3a' }} />
                  </button>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {showNewBoard && <NewBoardSheet onClose={() => setShowNewBoard(false)} />}
    </div>
  )
}
