import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import type { Meeting } from '@/db/dexie'
import { Plus, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function AddMeetingSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle]          = useState('')
  const [date, setDate]            = useState(new Date().toISOString().split('T')[0])
  const [time, setTime]            = useState('')
  const [notes, setNotes]          = useState('')
  const [agendaInput, setAgendaInput] = useState('')
  const [agenda, setAgenda]        = useState<string[]>([])
  const [saving, setSaving]        = useState(false)

  const addItem = () => {
    const t = agendaInput.trim()
    if (!t) return
    setAgenda(a => [...a, t])
    setAgendaInput('')
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    await db.meetings.add({
      title: title.trim(), date, time: time || '',
      notes: notes.trim() || undefined,
      agenda: agenda.length > 0 ? agenda : undefined,
      status: 'open',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-t-[4px] flex flex-col max-h-[90vh]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <span className="text-[12px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>New Meeting</span>
          <button onClick={onClose} aria-label="Close"><X size={16} style={{ color: '#555555' }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Title *</label>
            <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Meeting title" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Date</label>
              <input type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Time</label>
              <input type="time" className="input w-full" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Agenda</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={agendaInput} onChange={e => setAgendaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()} placeholder="Add item, press Enter" />
              <button onClick={addItem} className="px-3 py-1.5 rounded-[2px] text-[10px]" style={{ border: '1px solid #2a2a2a', color: '#888888' }}>+</button>
            </div>
            {agenda.length > 0 && (
              <ul className="mt-2 space-y-1">
                {agenda.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-[11px]" style={{ color: '#888888' }}>
                    <span>· {item}</span>
                    <button onClick={() => setAgenda(a => a.filter((_, j) => j !== i))}><X size={10} style={{ color: '#555555' }} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Notes</label>
            <textarea className="input w-full resize-none" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes, outcomes, decisions..." />
          </div>
          <button onClick={handleSave} disabled={!title.trim() || saving}
            className="w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest disabled:opacity-30"
            style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}>
            {saving ? 'Saving...' : 'Save Meeting'}
          </button>
        </div>
      </div>
    </div>
  )
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const [expanded, setExpanded] = useState(false)
  const STATUS_COLOR: Record<Meeting['status'], string> = { open: '#555555', 'in-progress': '#fbbf24', done: '#34d399' }

  const cycleStatus = () => {
    const next: Meeting['status'] = meeting.status === 'open' ? 'in-progress' : meeting.status === 'in-progress' ? 'done' : 'open'
    db.meetings.update(meeting.id!, { status: next })
  }

  return (
    <div className="rounded-[2px]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
      <div className="flex items-start gap-3 p-3">
        <button onClick={cycleStatus} className="shrink-0 w-2 h-2 rounded-full mt-[6px]"
          style={{ background: STATUS_COLOR[meeting.status] }} aria-label={`Status: ${meeting.status}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px]" style={{ color: '#d4d4d4' }}>{meeting.title}</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#555555' }}>
            {meeting.date}{meeting.time ? ` · ${meeting.time}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setExpanded(e => !e)}>
            {expanded ? <ChevronUp size={14} style={{ color: '#555555' }} /> : <ChevronDown size={14} style={{ color: '#555555' }} />}
          </button>
          <button onClick={() => db.meetings.delete(meeting.id!)} aria-label="Delete">
            <Trash2 size={13} style={{ color: '#3a3a3a' }} />
          </button>
        </div>
      </div>
      {expanded && (meeting.agenda?.length || meeting.notes) && (
        <div className="px-4 pb-3 space-y-2" style={{ borderTop: '1px solid #1a1a1a' }}>
          {meeting.agenda && meeting.agenda.length > 0 && (
            <div className="pt-2">
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#3a3a3a' }}>Agenda</p>
              {meeting.agenda.map((item, i) => <p key={i} className="text-[11px]" style={{ color: '#888888' }}>· {item}</p>)}
            </div>
          )}
          {meeting.notes && (
            <div className="pt-2">
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#3a3a3a' }}>Notes</p>
              <p className="text-[11px] whitespace-pre-wrap" style={{ color: '#888888' }}>{meeting.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Meetings() {
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter]   = useState<'all' | Meeting['status']>('all')

  const meetings = useLiveQuery(() => db.meetings.orderBy('date').reverse().toArray(), []) ?? []
  const filtered = filter === 'all' ? meetings : meetings.filter(m => m.status === filter)

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Log</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Meetings</div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-muted hover:text-noir-white hover:border-noir-strong transition-colors">
          <Plus size={12} /> New
        </button>
      </div>

      <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
        {(['all', 'open', 'in-progress', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('flex-1 py-1.5 text-[9px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0',
              filter === f ? 'bg-noir-elevated text-noir-white' : 'text-noir-dim hover:text-noir-accent')}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <p className="text-[12px] text-center py-10" style={{ color: '#555555' }}>{filter === 'all' ? 'No meetings yet.' : `No ${filter} meetings.`}</p>
        : <div className="space-y-2">{filtered.map(m => <MeetingCard key={m.id} meeting={m} />)}</div>
      }

      {showAdd && <AddMeetingSheet onClose={() => setShowAdd(false)} />}
    </div>
  )
}
