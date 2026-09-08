import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useProfileStore } from '@/store/useProfileStore'
import { SHOW_ASTROLOGY } from '@/config/features'
import { belongsToProfile, sessionHasActivity } from '@/lib/workoutSession'
import { Card } from '@/components/ui/Card'
import { cn, getMoonPhaseName } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { db } from '@/db/dexie'
import { SegmentedPill } from '@/components/ui/SegmentedPill'
import type { CalendarEvent, WorkoutDaySession } from '@/db/dexie'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

type Category = CalendarEvent['category']
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'personal',  label: 'Personal' },
  { value: 'work',      label: 'Work' },
  { value: 'meeting',   label: 'Meeting' },
  { value: 'workout',   label: 'Workout' },
  { value: 'drum',      label: 'Drum' },
  { value: 'jam',       label: 'Jam' },
  { value: 'ayurveda',  label: 'Ayurveda' },
]

/**
 * One hue per category, drawn from the same five the charts use plus two
 * neutrals, so the app carries a single palette rather than a second one for
 * the calendar. Category is also always named in the label beside the dot, so
 * meaning never rests on colour.
 */
const CATEGORY_COLOR: Record<Category, string> = {
  personal:  'var(--ink-dim)',
  work:      'var(--ink)',
  meeting:   'var(--lift-row)',
  workout:   'var(--ok)',
  drum:      'var(--lift-core)',
  // Not offered when creating an event — Yoga is disabled — but events saved
  // before that still carry it, so the colour has to stay resolvable.
  yoga:      'var(--lift-squat)',
  jam:       'var(--lift-bench)',
  ayurveda:  'var(--lift-deadlift)',
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
    <Sheet title="New Event" onClose={onClose} maxHeight="90vh" noPadding>
      <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>Title *</label>
            <input
              className="input w-full"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>Date</label>
            <input type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>Start</label>
              <input type="time" className="input w-full" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>End</label>
              <input type="time" className="input w-full" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="px-2.5 py-1 rounded-[var(--r-control)] text-[11px] uppercase tracking-widest transition-colors"
                  style={{
                    border: `1px solid ${category === c.value ? CATEGORY_COLOR[c.value] : 'var(--hairline)'}`,
                    color: category === c.value ? CATEGORY_COLOR[c.value] : 'var(--ink-faint)',
                    background: category === c.value ? 'rgba(255,255,255,0.05)' : 'transparent',
                  }}
                >{c.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-faint)' }}>Notes</label>
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
            className="w-full py-2.5 rounded-[var(--r-control)] text-[11px] uppercase tracking-widest disabled:opacity-30 transition-opacity"
            style={{ border: '1px solid var(--accent)', color: 'var(--ink)' }}
          >
            {saving ? 'Saving...' : 'Add Event'}
          </button>
      </div>
    </Sheet>
  )
}

// ── Day Detail Sheet ───────────────────────────────────────────────────────────
interface DaySheetProps {
  date: string
  events: CalendarEvent[]
  /** Set when this day also has a logged workout, so it stays reachable from here. */
  onOpenWorkout?: () => void
  onClose: () => void
  onAdd: () => void
}

function DaySheet({ date, events, onOpenWorkout, onClose, onAdd }: DaySheetProps) {
  const d = new Date(date + 'T12:00:00')
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleDelete = async (id: number) => {
    await db.calendarEvents.delete(id)
  }

  return (
    <Sheet
      title={label}
      onClose={onClose}
      maxHeight="70vh"
      noPadding
      action={
        <button onClick={onAdd} aria-label="Add event">
          <Plus size={16} style={{ color: 'var(--ink-dim)' }} />
        </button>
      }
    >
      <div className="p-4 space-y-2">
          {onOpenWorkout && (
            <button
              onClick={onOpenWorkout}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-[var(--r-control)] transition-opacity hover:opacity-75"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--complete-border)' }}
            >
              <span className="text-[13px]" style={{ color: 'var(--ink)' }}>Workout logged</span>
              <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--complete-text)' }}>
                View session
              </span>
            </button>
          )}
          {events.length === 0 && !onOpenWorkout && (
            <p className="text-[12px] text-center py-6" style={{ color: 'var(--ink-faint)' }}>No events. Tap + to add one.</p>
          )}
          {events.map(ev => (
            <div
              key={ev.id}
              className="flex items-start justify-between gap-3 p-3 rounded-[var(--r-control)]"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="w-2 h-2 rounded-[var(--r-pill)] mt-1.5 shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
                <div className="min-w-0">
                  <p className="text-[13px] truncate" style={{ color: 'var(--ink)' }}>{ev.title}</p>
                  {(ev.startTime || ev.endTime) && (
                    <p className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>
                      {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                    </p>
                  )}
                  {ev.notes && <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-faint)' }}>{ev.notes}</p>}
                  <p className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--ink-faint)' }}>{ev.category}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(ev.id!)} aria-label="Delete event" className="shrink-0 mt-0.5">
                <Trash2 size={13} style={{ color: 'var(--ink-faint)' }} className="hover:text-red-400 transition-colors" />
              </button>
            </div>
          ))}
      </div>
    </Sheet>
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
        <button onClick={() => setSelectedDate(addDays(weekStart, -7))} className="p-1.5 text-[color:var(--ink-faint)] hover:text-[color:var(--ink-dim)] transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[11px] uppercase tracking-widest text-[color:var(--ink-faint)]">
          {days[0].slice(5)} – {days[6].slice(5)}
        </span>
        <button onClick={() => setSelectedDate(addDays(weekStart, 7))} className="p-1.5 text-[color:var(--ink-faint)] hover:text-[color:var(--ink-dim)] transition-colors">
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
                  isSel && !isToday && 'bg-white/[0.05]',
                  !isToday && !isSel && 'hover:bg-white/[0.05]/50'
                )}>
                <span className="text-[11px] uppercase tracking-widest" style={{ color: isSel ? 'var(--ink)' : 'var(--ink-faint)' }}>{label}</span>
                <span className="text-[13px]" style={{ color: isToday ? 'var(--ink)' : isSel ? 'var(--ink)' : 'var(--ink-dim)' }}>{num}</span>
                {dayEvts.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center px-1">
                    {dayEvts.slice(0, 3).map((ev, i) => (
                      <span key={i} className="w-1 h-1 rounded-[var(--r-pill)]" style={{ background: CATEGORY_COLOR[ev.category] }} />
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
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <button onClick={() => onAdd(selectedDate)} aria-label="Add event">
            <Plus size={14} style={{ color: 'var(--ink-faint)' }} />
          </button>
        </div>
        {dayEvents.length === 0
          ? <p className="text-[12px] text-center py-6" style={{ color: 'var(--ink-faint)' }}>No events. Tap + to add.</p>
          : dayEvents.map(ev => (
            <div key={ev.id} className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-control)]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-1.5 h-1.5 rounded-[var(--r-pill)] shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
              <span className="flex-1 text-[12px] truncate" style={{ color: 'var(--ink)' }}>{ev.title}</span>
              {ev.startTime && <span className="text-[11px] shrink-0" style={{ color: 'var(--ink-faint)' }}>{ev.startTime}</span>}
              <button onClick={() => db.calendarEvents.delete(ev.id!)} aria-label="Delete">
                <Trash2 size={12} style={{ color: 'var(--ink-faint)' }} />
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
        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-1.5 text-[color:var(--ink-faint)] hover:text-[color:var(--ink-dim)] transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setSelectedDate(today)} className="text-[11px] uppercase tracking-widest text-[color:var(--ink-faint)] hover:text-[color:var(--ink-2)] transition-colors">
          {label}
        </button>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1.5 text-[color:var(--ink-faint)] hover:text-[color:var(--ink-dim)] transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Events */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>Events</p>
          <button onClick={() => onAdd(selectedDate)} aria-label="Add event">
            <Plus size={14} style={{ color: 'var(--ink-faint)' }} />
          </button>
        </div>
        {sorted.length === 0
          ? <p className="text-[12px] text-center py-8" style={{ color: 'var(--ink-faint)' }}>No events. Tap + to add.</p>
          : sorted.map(ev => (
            <div key={ev.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-[var(--r-control)]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-1.5 h-1.5 rounded-[var(--r-pill)] mt-1.5 shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px]" style={{ color: 'var(--ink)' }}>{ev.title}</p>
                {(ev.startTime || ev.endTime) && (
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-dim)' }}>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</p>
                )}
                {ev.notes && <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-faint)' }}>{ev.notes}</p>}
                <p className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--ink-faint)' }}>{ev.category}</p>
              </div>
              <button onClick={() => db.calendarEvents.delete(ev.id!)} aria-label="Delete event" className="shrink-0 mt-0.5">
                <Trash2 size={13} style={{ color: 'var(--ink-faint)' }} />
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
  const navigate = useNavigate()
  const { activeId } = useProfileStore()
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

  // Workout days for the active profile, marked on the month grid.
  const monthWorkouts = useLiveQuery(
    () => db.workoutDaySessions.where('date').between(monthStart, monthEnd, true, true).toArray(),
    [monthStart, monthEnd]
  ) ?? []
  const workoutByDate = new Map<string, WorkoutDaySession>()
  for (const s of monthWorkouts) {
    if (!belongsToProfile(s, activeId) || !sessionHasActivity(s)) continue
    // A date can (rarely) carry two day-labels for one profile — keep the
    // more complete session so the marker links somewhere meaningful.
    const existing = workoutByDate.get(s.date)
    if (!existing || s.exercises.length > existing.exercises.length) workoutByDate.set(s.date, s)
  }

  const openAdd = (date: string) => { setAddDate(date); setShowAdd(true) }

  return (
    <div className="page-container space-y-4">
      {/* Wraps rather than overlapping: at 375px the 26px title and the three
          range controls do not fit on one line. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
        <div>
          <div
            className="uppercase"
            style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
          >
            Schedule
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
            Calendar
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedPill
            label="Calendar range"
            value={view}
            onChange={setView}
            options={[
              { value: 'month' as const, label: 'Month' },
              { value: 'week' as const, label: 'Week' },
              { value: 'day' as const, label: 'Day' },
            ]}
          />
          <button
            onClick={() => openAdd(today)}
            className="flex items-center gap-1 uppercase transition-colors"
            style={{
              padding: '7px 12px', borderRadius: 'var(--r-control)',
              fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
              border: '1px solid var(--hairline)', color: 'var(--ink-dim)',
            }}
            aria-label="Add event"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <>
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-1.5 text-[color:var(--ink-faint)] hover:text-[color:var(--ink-dim)] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div
              className="uppercase"
              style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--ink)' }}
            >
              {MONTHS[month]} {year}
            </div>
            <button onClick={nextMonth} className="p-1.5 text-[color:var(--ink-faint)] hover:text-[color:var(--ink-dim)] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <Card noPadding>
            <div className="grid grid-cols-7 border-b border-[color:var(--hairline)]">
              {DAYS.map(d => (
                <div
                  key={d}
                  className="py-2 text-center uppercase"
                  style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--ink-faint)' }}
                >
                  {d}
                </div>
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
                const workout = workoutByDate.get(dateStr)
                return (
                  <button
                    key={day}
                    onClick={() => {
                      // A workout-only day goes straight to the session. When the
                      // day also carries events, open the sheet instead — it links
                      // to the session, so neither is unreachable.
                      if (workout && !hasEvt) { navigate(`/workout/session/${workout.id}`); return }
                      setSelectedDate(dateStr)
                      setShowDay(true)
                    }}
                    className={cn(
                      'aspect-square flex flex-col items-center justify-center transition-colors gap-1',
                      !isToday && !isSel && 'hover:bg-white/[0.04]'
                    )}
                    style={{
                      fontSize: 13,
                      borderRadius: 'var(--r-control)',
                      // Today is ringed in the accent; a selected day is a
                      // quiet fill, so the two never compete.
                      border: `1px solid ${isToday ? 'rgba(167,139,250,0.55)' : 'transparent'}`,
                      background: isSel && !isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: isSat ? 'var(--ink-dim)' : 'var(--ink-2)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                    aria-label={
                      workout
                        ? hasEvt
                          ? `${day}, workout logged and events — open day`
                          : `${day}, workout logged — open session`
                        : String(day)
                    }
                  >
                    <span>{day}</span>
                    {(hasEvt || workout) && (
                      <span className="flex" style={{ gap: 3 }}>
                        {hasEvt && (
                          <span
                            style={{
                              width: 4, height: 4, borderRadius: 'var(--r-pill)',
                              background: 'var(--ink-faint)',
                            }}
                          />
                        )}
                        {workout && (
                          <span
                            style={{
                              width: 4, height: 4, borderRadius: 'var(--r-pill)',
                              background: 'var(--ok)',
                            }}
                          />
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>

          {SHOW_ASTROLOGY && (
            <div className="flex items-center gap-2">
              <div className="text-[11px] uppercase tracking-widest text-[color:var(--ink-faint)]">{getMoonPhaseName()}</div>
              <span className="text-[color:var(--ink-faint)]">·</span>
              <div className="text-[11px] uppercase tracking-widest text-[color:var(--ink-faint)]">♄ Saturn = Saturday</div>
            </div>
          )}

          {monthEvents.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>This Month ({monthEvents.length})</p>
              {[...monthEvents].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(ev => (
                <div key={ev.id} className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-control)]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="w-1.5 h-1.5 rounded-[var(--r-pill)] shrink-0" style={{ background: CATEGORY_COLOR[ev.category] }} />
                  <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--ink)' }}>{ev.title}</span>
                  <span className="text-[11px] shrink-0" style={{ color: 'var(--ink-faint)' }}>{ev.date.slice(5)}</span>
                </div>
              ))}
              {monthEvents.length > 5 && (
                <p className="text-[11px] text-center" style={{ color: 'var(--ink-faint)' }}>+{monthEvents.length - 5} more</p>
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
          onOpenWorkout={
            workoutByDate.has(selectedDate)
              ? () => navigate(`/workout/session/${workoutByDate.get(selectedDate)!.id}`)
              : undefined
          }
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
