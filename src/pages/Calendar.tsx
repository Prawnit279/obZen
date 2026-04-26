import { useState } from 'react'
import { useCalendarStore } from '@/store/useCalendarStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, getMoonPhaseName } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Calendar() {
  const { view, setView, selectedDate, setSelectedDate } = useCalendarStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date().toISOString().split('T')[0]
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const isSaturday = (day: number) => new Date(year, month, day).getDay() === 6

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Schedule</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Calendar</div>
        </div>
        <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
          {(['month', 'week', 'day'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0',
                view === v ? 'bg-noir-elevated text-noir-white' : 'text-noir-dim hover:text-noir-accent'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

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
            <div key={d} className={cn(
              'py-2 text-center text-[9px] uppercase tracking-widest',
              d === 'Sat' ? 'text-noir-dim' : 'text-noir-dim'
            )}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="aspect-square" />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isSel = dateStr === selectedDate
            const isSat = isSaturday(day)

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center text-[12px] transition-colors border border-transparent',
                  isToday && 'border-noir-accent',
                  isSel && !isToday && 'bg-noir-elevated',
                  isSat ? 'text-noir-muted' : 'text-noir-accent',
                  !isToday && !isSel && 'hover:bg-noir-elevated/50'
                )}
              >
                <span>{day}</span>
                {isSat && <span className="text-[7px] text-noir-dim">♄</span>}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <div className="text-[10px] uppercase tracking-widest text-noir-dim">
          {getMoonPhaseName()}
        </div>
        <span className="text-noir-dim">·</span>
        <div className="text-[10px] uppercase tracking-widest text-noir-dim">♄ Saturn Day = Saturday</div>
      </div>

      <Button variant="primary" fullWidth>
        Add Event
      </Button>

      <div className="text-[10px] uppercase tracking-widest text-noir-muted text-center py-4">
        No events yet. Add your first event.
      </div>
    </div>
  )
}
