import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useCalendarStore } from '@/store/useCalendarStore'
import { Card } from '@/components/ui/Card'
import { cn, getMoonPhaseName } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import { db } from '@/db/dexie'
import type { CalendarEvent } from '@/db/dexie'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

type Category = CalendarEvent['category']
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'personal',  label: 'Personal' },
  { value: 'work',      label: 'Work' },
  { value: 'meeting',   label: 'Meeting' },
  { value: 'workout',   label: 'Workout' },
  { value: 'drum',      label: 'Drum' },
  { value: 'yoga',      label: 'Yoga' },
  { value: 'jam',       label: 'Jam' },
  { value: 'ayurveda',  label: 'Ayurveda' },
]

const CATEGORY_COLOR: Record<Category, string> = {
  personal:  '#888888',
  work:      '#d4d4d4',
  meeting:   '#fbbf24',
  workout:   '#34d399',
  drum:      '#f97316',
  yoga:      '#a78bfa',
  jam:       '#fb7185',
  ayurveda:  '#6ee7b7',
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return isoDate(d)
}
function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() // 0=Sun
  d.setDate(d.getDate() - day)
  return isoDate(d)
}

// ── Add Event Sheet ────────────────────────────────────────────────────────────
interface AddEventSheetProps {
  initialDate: string
  onClose: () => void
}

function AddEventSheet({ initialDate, onClose }: AddEventSheetProps) {
  const [title, setTitle]         = useState('')
  const [date, setDate]           = useState(initialDate)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime]     = useState('')
  const [category, setCategory]   = useState<Category>('personal')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    await db.calendarEvents.add({
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category,
      notes: notes.trim() || undefined,
      recurring: 'none',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-t-[4px] flex flex-col max-h-[90vh]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <span className="text-[12px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>New Event</span>
          <button onClick={onClose} aria-label="Close"><X size={16} style={{ color: '#555555' }} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Title *</label>
            <input
              className="input w-full"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Date</label>
            <input type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Start</label>
              <input type="time" className="input w-full" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>End</label>
              <input type="time" className="input w-full" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest transition-colors"
                  style={{
                    border: `1px solid ${category === c.value ? CATEGORY_COLOR[c.value] : '#2a2a2a'}`,
                    color: category === c.value ? CATEGORY_COLOR[c.value] : '#555555',
                    background: category === c.value ? '#181818' : 'transparent',
                  }}
                >{c.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#555555' }}>Notes</label>
            <textarea
              className="input w-full resize-none"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest disabled:opacity-30 transition-opacity"
            style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}
          >
            {saving ? 'Saving...' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Day Detail Sheet ───────────────────────────────────────────────────────────
interface DaySheetProps {
  date: string
  events: CalendarEvent[]
  onClose: () => void
  onAdd: () => void
}

function DaySheet({ date, events, onClose, onAdd }: DaySheetProps) {
  const d = new Date(date + 'T12:00:00')
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleDelete = async (id: number) => {
    await db.calendarEvents.delete(id)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-t-[4px] flex flex-col max-h-[70vh]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <span className="text-[12px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>{label}</span>
          <div className="flex items-center gap-2">
            <button onClick={onAdd} aria-label="Add event"><Plus size={16} style={{ color: '#888888' }} /></button>
            <button onClick={onClose} aria-label="Close"><X size={16} style={{ color: '#555555' }} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {events.length === 0 && (
            <p className="text-[12px] text-center py-6" style={{ color: '#555555' }}>No events. Tap + to add one.</p>
          )}
          {events.map(ev => (
            <div
              key={ev.id}
              className="flex items-start justify-between gap-3 p-3 rounded-[2px]"
              style={{ background: '#0d0d0d', border: '1px solid #2a2a2a' }}
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
                <div className="min-w-0">
                  <p className="text-[13px] truncate" style={{ color: '#d4d4d4' }}>{ev.title}</p>
                  {(ev.startTime || ev.endTime) && (
                    <p className="text-[10px]" style={{ color: '#888888' }}>
                      {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                    </p>
                  )}
                  {ev.notes && <p className="text-[10px] mt-0.5" style={{ color: '#555555' }}>{ev.notes}</p>}
                  <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: '#3a3a3a' }}>{ev.category}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(ev.id!)} aria-label="Delete event" className="shrink-0 mt-0.5">
                <Trash2 size={13} style={{ color: '#3a3a3a' }} className="hover:text-red-400 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Week View ─────────────────────────────────────────────────────────────────
interface WeekViewProps {
  selectedDate: string
  setSelectedDate: (d: string) => void
  onAdd: (date: string) => void
}

function WeekView({ selectedDate, setSelectedDate, onAdd }: WeekViewProps) {
  const today = new Date().toISOString().split('T')[0]
  const weekStart = getWeekStart(selectedDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = days[6]

  const events = useLiveQuery(
    () => db.calendarEvents.where('date').between(weekStart, weekEnd, true, true).toArray(),
    [weekStart]
  ) ?? []

  const dayEvents = events.filter(e => e.date === selectedDate)
    .sort((a, b) => (a.startTime ?? '') < (b.startTime ?? '') ? -1 : 1)

  return (
    <div className="space-y-3">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedDate(addDays(weekStart, -7))} className="p-1.5 text-noir-dim hover:text-noir-muted transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[11px] uppercase tracking-widest text-noir-dim">
          {days[0].slice(5)} – {days[6].slice(5)}
        </span>
        <button onClick={() => setSelectedDate(addDays(weekStart, 7))} className="p-1.5 text-noir-dim hover:text-noir-muted transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 7-column strip */}
      <Card noPadding>
        <div className="grid grid-cols-7">
          {days.map(d => {
            const isToday = d === today
            const isSel   = d === selectedDate
            const dayEvts = events.filter(e => e.date === d)
            const label   = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
            const num     = parseInt(d.slice(8), 10)
            return (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={cn(
                  'flex flex-col items-center py-2 gap-0.5 transition-colors border border-transparent',
                  isToday && 'border-noir-accent',
                  isSel && !isToday && 'bg-noir-elevated',
                  !isToday && !isSel && 'hover:bg-noir-elevated/50'
                )}>
                <span className="text-[9px] uppercase tracking-widest" style={{ color: isSel ? '#d4d4d4' : '#555555' }}>{label}</span>
                <span className="text-[13px]" style={{ color: isToday ? '#d4d4d4' : isSel ? '#d4d4d4' : '#888888' }}>{num}</span>
                {dayEvts.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center px-1">
                    {dayEvts.slice(0, 3).map((ev, i) => (
                      <span key={i} className="w-1 h-1 rounded-full" style={{ background: CATEGORY_COLOR[ev.category] }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Selected day events */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <button onClick={() => onAdd(selectedDate)} aria-label="Add event">
            <Plus size={14} style={{ color: '#555555' }} />
          </button>
        </div>
        {dayEvents.length === 0
          ? <p className="text-[12px] text-center py-6" style={{ color: '#555555' }}>No events. Tap + to add.</p>
          : dayEvents.map(ev => (
            <div key={ev.id} className="flex items-center gap-2.5 px-3 py-2 rounded-[2px]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
              <span className="flex-1 text-[12px] truncate" style={{ color: '#d4d4d4' }}>{ev.title}</span>
              {ev.startTime && <span className="text-[10px] shrink-0" style={{ color: '#555555' }}>{ev.startTime}</span>}
              <button onClick={() => db.calendarEvents.delete(ev.id!)} aria-label="Delete">
                <Trash2 size={12} style={{ color: '#3a3a3a' }} />
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Day View ───────────────────────────────────────────────────────────────────
interface DayViewProps {
  selectedDate: string
  setSelectedDate: (d: string) => void
  onAdd: (date: string) => void
}

function DayView({ selectedDate, setSelectedDate, onAdd }: DayViewProps) {
  const today = new Date().toISOString().split('T')[0]

  const events = useLiveQuery(
    () => db.calendarEvents.where('date').equals(selectedDate).toArray(),
    [selectedDate]
  ) ?? []

  const sorted = [...events].sort((a, b) => (a.startTime ?? '') < (b.startTime ?? '') ? -1 : 1)

  const label = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-3">
      {/* Day nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-1.5 text-noir-dim hover:text-noir-muted transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setSelectedDate(today)} className="text-[11px] uppercase tracking-widest text-noir-dim hover:text-noir-accent transition-colors">
          {label}
        </button>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1.5 text-noir-dim hover:text-noir-muted transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Events */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>Events</p>
          <button onClick={() => onAdd(selectedDate)} aria-label="Add event">
            <Plus size={14} style={{ color: '#555555' }} />
          </button>
        </div>
        {sorted.length === 0
          ? <p className="text-[12px] text-center py-8" style={{ color: '#555555' }}>No events. Tap + to add.</p>
          : sorted.map(ev => (
            <div key={ev.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-[2px]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px]" style={{ color: '#d4d4d4' }}>{ev.title}</p>
                {(ev.startTime || ev.endTime) && (
                  <p className="text-[10px] mt-0.5" style={{ color: '#888888' }}>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</p>
                )}
                {ev.notes && <p className="text-[10px] mt-0.5" style={{ color: '#555555' }}>{ev.notes}</p>}
                <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: '#3a3a3a' }}>{ev.category}</p>
              </div>
              <button onClick={() => db.calendarEvents.delete(ev.id!)} aria-label="Delete event" className="shrink-0 mt-0.5">
                <Trash2 size={13} style={{ color: '#3a3a3a' }} />
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Calendar Page ─────────────────────────────────────────────────────────────
export default function Calendar() {
  const { view, setView, selectedDate, setSelectedDate } = useCalendarStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAdd, setShowAdd]   = useState(false)
  const [addDate, setAddDate]   = useState(new Date().toISOString().split('T')[0])
  const [showDay, setShowDay]   = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // Fetch events for current month (month view)
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const monthEnd   = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
  const monthEvents = useLiveQuery(
    () => db.calendarEvents.where('date').between(monthStart, monthEnd, true, true).toArray(),
    [monthStart, monthEnd]
  ) ?? []

  const dayEvents = monthEvents.filter(e => e.date === selectedDate)
  const datesWithEvents = new Set(monthEvents.map(e => e.date))
  const isSaturday = (day: number) => new Date(year, month, day).getDay() === 6

  const openAdd = (date: string) => { setAddDate(date); setShowAdd(true) }

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Schedule</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Calendar</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
            {(['month', 'week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0',
                  view === v ? 'bg-noir-elevated text-noir-white' : 'text-noir-dim hover:text-noir-accent'
                )}>{v}</button>
            ))}
          </div>
          <button onClick={() => openAdd(today)}
            className="flex items-center gap-1 px-3 py-1.5 border border-noir-border rounded-[2px] text-[10px] uppercase tracking-widest text-noir-muted hover:text-noir-white hover:border-noir-strong transition-colors"
            aria-label="Add event">
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <>
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-1.5 text-noir-dim hover:text-noir-muted transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="text-[13px] uppercase tracking-widest text-noir-accent">
              {MONTHS[month]} {year}
            </div>
            <button onClick={nextMonth} className="p-1.5 text-noir-dim hover:text-noir-muted transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <Card noPadding>
            <div className="grid grid-cols-7 border-b border-noir-border">
              {DAYS.map(d => (
                <div key={d} className="py-2 text-center text-[9px] uppercase tracking-widest text-noir-dim">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="aspect-square" />
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isToday = dateStr === today
                const isSel   = dateStr === selectedDate
                const isSat   = isSaturday(day)
                const hasEvt  = datesWithEvents.has(dateStr)
                return (
                  <button key={day} onClick={() => { setSelectedDate(dateStr); setShowDay(true) }}
                    className={cn(
                      'aspect-square flex flex-col items-center justify-center text-[12px] transition-colors border border-transparent gap-0.5',
                      isToday && 'border-noir-accent',
                      isSel && !isToday && 'bg-noir-elevated',
                      isSat ? 'text-noir-muted' : 'text-noir-accent',
                      !isToday && !isSel && 'hover:bg-noir-elevated/50'
                    )}>
                    <span>{day}</span>
                    {hasEvt && <span className="w-1 h-1 rounded-full" style={{ background: '#888888' }} />}
                  </button>
                )
              })}
            </div>
          </Card>

          <div className="flex items-center gap-2">
            <div className="text-[10px] uppercase tracking-widest text-noir-dim">{getMoonPhaseName()}</div>
            <span className="text-noir-dim">·</span>
            <div className="text-[10px] uppercase tracking-widest text-noir-dim">♄ Saturn = Saturday</div>
          </div>

          {monthEvents.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>This Month ({monthEvents.length})</p>
              {[...monthEvents].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(ev => (
                <div key={ev.id} className="flex items-center gap-2.5 px-3 py-2 rounded-[2px]" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
                  <span className="text-[11px] flex-1 truncate" style={{ color: '#d4d4d4' }}>{ev.title}</span>
                  <span className="text-[10px] shrink-0" style={{ color: '#555555' }}>{ev.date.slice(5)}</span>
                </div>
              ))}
              {monthEvents.length > 5 && (
                <p className="text-[10px] text-center" style={{ color: '#555555' }}>+{monthEvents.length - 5} more</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Week view */}
      {view === 'week' && (
        <WeekView selectedDate={selectedDate} setSelectedDate={setSelectedDate} onAdd={openAdd} />
      )}

      {/* Day view */}
      {view === 'day' && (
        <DayView selectedDate={selectedDate} setSelectedDate={setSelectedDate} onAdd={openAdd} />
      )}

      {/* Month view overlays */}
      {showDay && view === 'month' && (
        <DaySheet
          date={selectedDate}
          events={dayEvents}
          onClose={() => setShowDay(false)}
          onAdd={() => { setShowDay(false); openAdd(selectedDate) }}
        />
      )}
      {showAdd && (
        <AddEventSheet initialDate={addDate} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}
