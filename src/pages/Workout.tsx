import { useState, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, AlertTriangle, Zap } from 'lucide-react'
import { OBZEN_PROGRAM, PULL_HEAVY_EXERCISES, FOREARM_LOAD_EXERCISES } from '@/data/obzen-program'
import type { ProgramExercise } from '@/data/obzen-program'
import { db } from '@/db/dexie'
import { todayISO } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useWorkoutDayStore, selectDaySession, selectOrderedExercises } from '@/store/useWorkoutDayStore'
import type { ExerciseSessionState } from '@/db/dexie'
import { DaySummaryBar } from '@/components/modules/workout/DaySummaryBar'
import { SortableExerciseList } from '@/components/modules/workout/SortableExerciseList'
import { AddExerciseSheet } from '@/components/modules/workout/AddExerciseSheet'
import { WorkoutHistory } from '@/components/modules/workout/WorkoutHistory'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type DayLabel = 'Day 1' | 'Day 2' | 'Day 3'
type Tab = 'program' | 'history'

const DAYS: DayLabel[] = ['Day 1', 'Day 2', 'Day 3']
const TODAY = todayISO()

// Build a map of exerciseId → ProgramExercise for all days
function buildProgramMap(): Record<string, ProgramExercise> {
  const map: Record<string, ProgramExercise> = {}
  for (const day of DAYS) {
    const program = OBZEN_PROGRAM[day]
    for (const ex of program.exercises) {
      const id = ex.name.toLowerCase().replace(/\s+/g, '-')
      map[id] = ex
    }
  }
  return map
}

const PROGRAM_MAP = buildProgramMap()

// ---------------------------------------------------------------------------
// Rest day card
// ---------------------------------------------------------------------------

function RestDayCard() {
  return (
    <div
      className="rounded-[2px] p-6 text-center space-y-2"
      style={{ background: '#111111', border: '1px solid #2a2a2a' }}
    >
      <div className="text-[14px]" style={{ color: '#d4d4d4' }}>Rest Day</div>
      <div className="text-[12px]" style={{ color: '#888888' }}>Yoga or light recovery only.</div>
      <div
        className="text-[11px] pl-3 text-left max-w-xs mx-auto mt-3"
        style={{ color: '#555555', borderLeft: '1px solid #3a3a3a' }}
      >
        Pitta: recovery is productive. Avoid overtraining urge.
        Cool yoga session favored.
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Day view component
// ---------------------------------------------------------------------------

interface DayViewProps {
  dayLabel: DayLabel
  forearmFatigue: boolean
  lowReadiness: boolean
}

function DayView({ dayLabel, forearmFatigue, lowReadiness }: DayViewProps) {
  const store = useWorkoutDayStore()
  const session = selectDaySession(store.sessions, dayLabel)
  const [showAddSheet, setShowAddSheet] = useState(false)

  // Load session on mount
  useEffect(() => {
    store.loadSession(dayLabel)
  }, [dayLabel]) // eslint-disable-line react-hooks/exhaustive-deps

  const program = OBZEN_PROGRAM[dayLabel]

  // Derive ordered exercises
  const orderedExercises = useMemo(() => {
    if (!session) return []
    return selectOrderedExercises(session)
  }, [session])

  // Forearm/pull warning for the day
  const hasFlaggedExercises = forearmFatigue && orderedExercises.some(ex => {
    const prog = PROGRAM_MAP[ex.exerciseId]
    return prog && (PULL_HEAVY_EXERCISES.includes(prog.name) || FOREARM_LOAD_EXERCISES.includes(prog.name))
  })

  if (!session) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-[11px] uppercase tracking-widest" style={{ color: '#555555' }}>
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Day summary bar */}
      <DaySummaryBar
        dayLabel={dayLabel}
        focus={program.focus}
        exercises={session.exercises}
      />

      {/* Readiness warnings */}
      {lowReadiness && (
        <div
          className="flex items-start gap-2 p-3 rounded-[2px]"
          style={{ border: '1px solid rgba(127,29,29,0.4)' }}
        >
          <AlertTriangle size={13} style={{ color: '#cc3333', marginTop: 1 }} className="shrink-0" />
          <span className="text-[11px]" style={{ color: '#888888' }}>
            Low readiness — consider reducing volume or choosing a rest day.
          </span>
        </div>
      )}
      {hasFlaggedExercises && (
        <div
          className="flex items-start gap-2 p-3 rounded-[2px]"
          style={{ border: '1px solid rgba(161,98,7,0.4)' }}
        >
          <Zap size={13} style={{ color: '#ca8a04', marginTop: 1 }} className="shrink-0" />
          <span className="text-[11px]" style={{ color: '#888888' }}>
            Forearm fatigue active — pull-heavy exercises flagged.
          </span>
        </div>
      )}

      {/* Sortable exercise list */}
      <SortableExerciseList
        exercises={orderedExercises}
        programMap={PROGRAM_MAP}
        forearmFatigue={forearmFatigue}
        dayLabel={dayLabel}
        onReorder={newOrder => store.reorderExercises(dayLabel, newOrder)}
        onStatusChange={(exerciseId, status) => store.updateExerciseStatus(dayLabel, exerciseId, status)}
        onAddSet={(exerciseId, set) => store.addLoggedSet(dayLabel, exerciseId, set)}
        onUpdateSet={(exerciseId, index, set) => store.updateLoggedSet(dayLabel, exerciseId, index, set)}
        onRemoveSet={(exerciseId, index) => store.removeLoggedSet(dayLabel, exerciseId, index)}
      />

      {/* Add Exercise button */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[2px] text-[10px] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ border: '1px dashed #2a2a2a', color: '#555555' }}
      >
        <Plus size={12} />
        Add Exercise
      </button>

      {/* Add exercise sheet */}
      {showAddSheet && (
        <AddExerciseSheet
          currentDay={dayLabel}
          existingIds={session.exercises.map(e => e.exerciseId)}
          onAdd={(ex: ExerciseSessionState) => store.addExercise(dayLabel, ex)}
          onClose={() => setShowAddSheet(false)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Workout() {
  const [tab, setTab] = useState<Tab>('program')
  const [selectedDay, setSelectedDay] = useState<DayLabel | 'Rest'>('Day 1')

  const todayCheckIn = useLiveQuery(
    () => db.checkIns.where('date').equals(TODAY).first(),
    []
  )
  const forearmFatigue = todayCheckIn?.forearmFatigue ?? false
  const lowEnergy = (todayCheckIn?.energy ?? 5) <= 2
  const highSoreness = todayCheckIn?.soreness === 'high'
  const lowReadiness = lowEnergy || highSoreness

  const weekSessions = useLiveQuery(
    () => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      return db.workoutSessions
        .where('date').aboveOrEqual(cutoff.toISOString().split('T')[0])
        .filter(s => !!s.completedAt)
        .count()
    },
    []
  )

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Obzen Program</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Workout</div>
        </div>
        <div className="text-[11px] uppercase tracking-widest text-noir-dim">
          {weekSessions ?? 0}/3 this week
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
        {(['program', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-[10px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0',
              tab === t
                ? 'bg-noir-elevated text-noir-white'
                : 'text-noir-dim hover:text-noir-muted hover:bg-noir-elevated/30'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'history' && <WorkoutHistory />}

      {tab === 'program' && (
        <>
          {/* Day selector */}
          <div className="flex gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'flex-1 py-2.5 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
                  selectedDay === day
                    ? 'border-noir-accent text-noir-white bg-noir-elevated'
                    : 'border-noir-border text-noir-dim hover:border-noir-strong hover:text-noir-muted'
                )}
              >
                {day}
              </button>
            ))}
            <button
              onClick={() => setSelectedDay('Rest')}
              className={cn(
                'px-3 py-2.5 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
                selectedDay === 'Rest'
                  ? 'border-noir-accent text-noir-white bg-noir-elevated'
                  : 'border-noir-border text-noir-dim hover:border-noir-strong hover:text-noir-muted'
              )}
            >
              Rest
            </button>
          </div>

          {/* Day content */}
          {selectedDay === 'Rest' ? (
            <RestDayCard />
          ) : (
            <DayView
              dayLabel={selectedDay}
              forearmFatigue={forearmFatigue}
              lowReadiness={lowReadiness}
            />
          )}
        </>
      )}
    </div>
  )
}
