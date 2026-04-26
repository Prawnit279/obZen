import { useState } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { YOGA_POSES } from '@/data/yoga-poses'
import type { YogaPose } from '@/data/yoga-poses'
import { AnimatedPose, hasPoseAnim } from '@/components/modules/yoga/AnimatedPose'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const CHALLENGE_KEY = 'obzen_yoga_challenge'

interface ChallengeData {
  startDate: string
  completedDays: number[]
}

function loadChallenge(): ChallengeData | null {
  const raw = localStorage.getItem(CHALLENGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ChallengeData
  } catch {
    return null
  }
}

function saveChallenge(data: ChallengeData): void {
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(data))
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const DAY_ABBR: Record<number, string> = {
  1: 'Mtn', 2: 'Bird', 3: 'Horse', 4: 'Cat', 5: 'Fwd', 6: '½Fwd',
  7: 'Cobra', 8: '↓Dog', 9: 'Plank', 10: 'Lunge', 11: 'Split', 12: 'Hi↑',
  13: 'Side', 14: 'Chair', 15: 'Liz', 16: 'W·1', 17: 'W·2', 18: 'W·3',
  19: 'Rev', 20: 'Tri', 21: 'Wide', 22: 'Eagle', 23: 'Quad', 24: 'Child',
  25: 'Boat', 26: 'Sup', 27: 'Brdg', 28: 'Bow', 29: 'Hero', 30: 'Rec',
}

const CHALLENGE_POSES: YogaPose[] = YOGA_POSES
  .filter(p => p.day != null)
  .sort((a, b) => (a.day ?? 0) - (b.day ?? 0))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentDay(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.min(30, Math.max(1, Math.floor((now - start) / 86400000) + 1))
}

function calcStreak(completedDays: number[], currentDay: number): number {
  // Count consecutive completed days ending at currentDay or currentDay-1
  const anchor = completedDays.includes(currentDay) ? currentDay : currentDay - 1
  if (anchor < 1) return 0
  let streak = 0
  for (let d = anchor; d >= 1; d--) {
    if (completedDays.includes(d)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface WeekBarProps {
  weekNum: number
  days: number[]
  completedDays: number[]
  currentDay: number
}

function WeekBar({ weekNum, days, completedDays, currentDay }: WeekBarProps) {
  const done = days.filter(d => completedDays.includes(d)).length
  const total = days.length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[10px] uppercase tracking-widest shrink-0 w-14"
        style={{ color: '#555555' }}
      >
        Week {weekNum}
      </span>
      <div
        className="flex-1 h-[3px] rounded-full"
        style={{ background: '#1a1a1a' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: days.some(d => d <= currentDay) ? '#555555' : '#2a2a2a',
          }}
        />
      </div>
      <span
        className="text-[10px] tabular-nums shrink-0 w-8 text-right"
        style={{ color: '#3a3a3a' }}
      >
        {done}/{total}
      </span>
    </div>
  )
}

interface DayCellProps {
  day: number
  completed: boolean
  isToday: boolean
  isFuture: boolean
  selected: boolean
  onSelect: (day: number) => void
}

function DayCell({ day, completed, isToday, isFuture, selected, onSelect }: DayCellProps) {
  const abbr = DAY_ABBR[day] ?? ''

  const bg = completed
    ? '#181818'
    : isFuture
      ? '#0a0a0a'
      : '#111111'

  const borderColor = selected
    ? '#888888'
    : completed
      ? '#555555'
      : isToday
        ? '#d4d4d4'
        : isFuture
          ? '#1a1a1a'
          : '#2a2a2a'

  const textColor = completed
    ? '#888888'
    : isToday
      ? '#d4d4d4'
      : isFuture
        ? '#2a2a2a'
        : '#555555'

  return (
    <button
      onClick={() => onSelect(day)}
      className="relative aspect-square flex flex-col items-center justify-center rounded-[2px] border transition-colors"
      style={{ background: bg, borderColor }}
      aria-label={`Day ${day}: ${abbr}`}
    >
      <span
        className="absolute top-0.5 left-1 text-[8px] leading-none tabular-nums"
        style={{ color: '#555555' }}
      >
        {day}
      </span>
      <span className="text-[9px] leading-tight" style={{ color: textColor }}>
        {abbr}
      </span>
      {completed && (
        <span
          className="absolute bottom-0.5 right-0.5"
          style={{ color: '#555555' }}
          aria-hidden="true"
        >
          <CheckCircle size={8} strokeWidth={2} />
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Selected day panel
// ---------------------------------------------------------------------------

interface SelectedDayPanelProps {
  day: number
  completed: boolean
  isFuture: boolean
  onMarkComplete: (day: number) => void
  onClose: () => void
}

function SelectedDayPanel({
  day,
  completed,
  isFuture,
  onMarkComplete,
  onClose,
}: SelectedDayPanelProps) {
  const pose = CHALLENGE_POSES.find(p => p.day === day)
  if (!pose) return null

  const canMark = !completed && !isFuture

  return (
    <div
      className="rounded-[2px] p-4 relative"
      style={{ background: '#111111', border: '1px solid #2a2a2a' }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 transition-opacity hover:opacity-60"
        aria-label="Close panel"
      >
        <X size={14} style={{ color: '#555555' }} />
      </button>

      {/* Header */}
      <div className="mb-3 pr-6">
        <div
          className="text-[10px] uppercase tracking-widest mb-1"
          style={{ color: '#555555' }}
        >
          Day {day}
        </div>
        <div className="text-[16px] leading-snug" style={{ color: '#d4d4d4' }}>
          {pose.name}
        </div>
        {pose.sanskritName && (
          <div
            className="text-[11px] italic mt-0.5"
            style={{ color: '#555555' }}
          >
            {pose.sanskritName}
          </div>
        )}
      </div>

      {/* Animated pose illustration */}
      {hasPoseAnim(pose.id) && (
        <div className="flex justify-center mb-3 py-2" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <AnimatedPose poseId={pose.id} size="small" autoPlay={!isFuture} />
        </div>
      )}

      {/* Duration */}
      <div
        className="text-[10px] uppercase tracking-widest mb-3"
        style={{ color: '#555555' }}
      >
        {pose.duration}
      </div>

      {/* Steps — first 3 only */}
      <div className="mb-3">
        <div
          className="text-[9px] uppercase tracking-widest mb-1.5"
          style={{ color: '#3a3a3a' }}
        >
          Steps
        </div>
        <ol className="space-y-1">
          {pose.steps.slice(0, 3).map((step, i) => (
            <li
              key={i}
              className="text-[12px] flex gap-2 leading-snug"
              style={{ color: '#888888' }}
            >
              <span style={{ color: '#555555' }} className="shrink-0">
                {i + 1}.
              </span>
              {step}
            </li>
          ))}
          {pose.steps.length > 3 && (
            <li className="text-[11px]" style={{ color: '#3a3a3a' }}>
              ...
            </li>
          )}
        </ol>
      </div>

      {/* Pitta note */}
      {pose.pittaNote && (
        <div
          className="mb-3 pl-3"
          style={{ borderLeft: '2px solid #2a2a2a' }}
        >
          <div
            className="text-[9px] uppercase tracking-widest mb-0.5"
            style={{ color: '#3a3a3a' }}
          >
            Pitta Note
          </div>
          <p className="text-[11px] leading-snug" style={{ color: '#555555' }}>
            {pose.pittaNote}
          </p>
        </div>
      )}

      {/* Mark complete button */}
      <button
        onClick={() => onMarkComplete(day)}
        disabled={!canMark}
        className={cn(
          'w-full py-2.5 rounded-[2px] text-[11px] uppercase tracking-widest transition-opacity',
          canMark ? 'hover:opacity-80' : 'opacity-30 cursor-not-allowed',
        )}
        style={{
          border: `1px solid ${completed ? '#555555' : '#d4d4d4'}`,
          color: completed ? '#555555' : '#d4d4d4',
        }}
      >
        {completed ? `Day ${day} Complete` : `Mark Day ${day} Complete`}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChallengeTracker() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(loadChallenge)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  function startChallenge(): void {
    const data: ChallengeData = {
      startDate: new Date().toISOString().slice(0, 10),
      completedDays: [],
    }
    saveChallenge(data)
    setChallenge(data)
  }

  function resetChallenge(): void {
    localStorage.removeItem(CHALLENGE_KEY)
    setChallenge(null)
    setSelectedDay(null)
  }

  function markComplete(day: number): void {
    if (!challenge) return
    const updated: ChallengeData = {
      ...challenge,
      completedDays: [...new Set([...challenge.completedDays, day])],
    }
    saveChallenge(updated)
    setChallenge(updated)
  }

  function handleSelectDay(day: number): void {
    setSelectedDay(prev => (prev === day ? null : day))
  }

  // ---------------------------------------------------------------------------
  // No challenge state
  // ---------------------------------------------------------------------------

  if (!challenge) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
        <div>
          <h2
            className="text-[18px] uppercase tracking-wide mb-1"
            style={{ color: '#d4d4d4' }}
          >
            30-Day Yoga Challenge
          </h2>
          <p className="text-[12px]" style={{ color: '#555555' }}>
            Build a daily practice, one pose at a time.
          </p>
        </div>
        <button
          onClick={startChallenge}
          className="px-6 py-2.5 rounded-[2px] text-[12px] uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}
        >
          Start Challenge
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Active challenge
  // ---------------------------------------------------------------------------

  const currentDay = getCurrentDay(challenge.startDate)
  const completed = challenge.completedDays.length
  const streak = calcStreak(challenge.completedDays, currentDay)

  const WEEKS: { num: number; days: number[] }[] = [
    { num: 1, days: [1, 2, 3, 4, 5, 6, 7] },
    { num: 2, days: [8, 9, 10, 11, 12, 13, 14] },
    { num: 3, days: [15, 16, 17, 18, 19, 20, 21] },
    { num: 4, days: [22, 23, 24, 25, 26, 27, 28, 29, 30] },
  ]

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="text-[13px]" style={{ color: '#d4d4d4' }}>
            Day {currentDay} of 30
          </div>
          <div className="text-[11px]" style={{ color: '#555555' }}>
            {completed} completed
            {streak > 0 && (
              <span className="ml-2" style={{ color: '#3a3a3a' }}>
                · {streak}-day streak
              </span>
            )}
          </div>
        </div>
        <button
          onClick={resetChallenge}
          className="text-[10px] uppercase tracking-widest transition-opacity hover:opacity-60"
          style={{ color: '#3a3a3a' }}
        >
          Reset
        </button>
      </div>

      {/* Week progress bars */}
      <div className="space-y-2">
        {WEEKS.map(week => (
          <WeekBar
            key={week.num}
            weekNum={week.num}
            days={week.days}
            completedDays={challenge.completedDays}
            currentDay={currentDay}
          />
        ))}
      </div>

      {/* 30-day grid */}
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
          <DayCell
            key={day}
            day={day}
            completed={challenge.completedDays.includes(day)}
            isToday={day === currentDay}
            isFuture={day > currentDay}
            selected={selectedDay === day}
            onSelect={handleSelectDay}
          />
        ))}
      </div>

      {/* Selected day panel */}
      {selectedDay !== null && (
        <SelectedDayPanel
          day={selectedDay}
          completed={challenge.completedDays.includes(selectedDay)}
          isFuture={selectedDay > currentDay}
          onMarkComplete={markComplete}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
