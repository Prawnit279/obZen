import { useState, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchParams } from 'react-router-dom'
import { Plus, AlertTriangle, Zap } from 'lucide-react'
import { getProgram, EXERCISE_LIBRARY, toExerciseId, PULL_HEAVY_EXERCISES, FOREARM_LOAD_EXERCISES } from '@/data/obzen-program'
import type { ProgramExercise } from '@/data/obzen-program'
import { useProfileStore } from '@/store/useProfileStore'
import { belongsToProfile } from '@/lib/workoutSession'
import { suggestProgression } from '@/lib/progress'
import type { ProgressionSuggestion } from '@/lib/progress'
import { db } from '@/db/dexie'
import { isoWeekKey } from '@/lib/progress'
import { weekSlots } from '@/lib/trainingWeek'
import type { DaySlot } from '@/lib/trainingWeek'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import type { DayLabel } from '@/db/dexie'
import { todayISO } from '@/lib/utils'
import { useWorkoutDayStore, selectDaySession, selectOrderedExercises } from '@/store/useWorkoutDayStore'
import type { ExerciseSessionState } from '@/db/dexie'
import { DaySummaryBar } from '@/components/modules/workout/DaySummaryBar'
import { SortableExerciseList } from '@/components/modules/workout/SortableExerciseList'
import { AddExerciseSheet } from '@/components/modules/workout/AddExerciseSheet'
import { WorkoutHistory } from '@/components/modules/workout/WorkoutHistory'
import { SegmentedPill } from '@/components/ui/SegmentedPill'
import { StrengthTools } from '@/components/modules/workout/tools/StrengthTools'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


/** Progress is its own top-level section, so Train does not repeat it here. */
type Tab = 'program' | 'history' | 'tools'

const ALL_DAYS: DayLabel[] = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6']
const TODAY = todayISO()

/**
 * exerciseId → ProgramExercise for the active profile's days, with the shared
 * library as a fallback so exercises added from the library or the other
 * profile's program still resolve a name/prescription.
 */
function buildProgramMap(profileId: string): Record<string, ProgramExercise> {
  const map: Record<string, ProgramExercise> = {}
  for (const ex of EXERCISE_LIBRARY) {
    map[toExerciseId(ex.name)] = ex
  }
  const program = getProgram(profileId)
  for (const day of Object.keys(program)) {
    for (const ex of program[day]?.exercises ?? []) {
      map[toExerciseId(ex.name)] = ex
    }
  }
  return map
}

// ---------------------------------------------------------------------------
// Rest day card
// ---------------------------------------------------------------------------

function RestDayCard() {
  return (
    <div
      className="rounded-[var(--r-control)] p-6 text-center space-y-2"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="text-[length:var(--text-lg)]" style={{ color: 'var(--ink)' }}>Rest Day</div>
      <div className="text-[length:var(--text-md)]" style={{ color: 'var(--ink-dim)' }}>Light recovery only.</div>
      <div
        className="text-[length:var(--text-sm)] pl-3 text-left max-w-xs mx-auto mt-3"
        style={{ color: 'var(--ink-faint)', borderLeft: '1px solid var(--border-strong)' }}
      >
        Pitta: recovery is productive. Avoid the urge to overtrain.
      </div>
    </div>
  )
}

/**
 * Session RPE, 1–10 — how hard the whole session felt.
 *
 * Unrated is a real state and stays available: an unrated session contributes
 * no load rather than an assumed one, so there is nothing to gain by guessing.
 */
function RpeScale({ value, onChange }: { value?: number; onChange: (rpe: number) => void }) {
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <div className="flex items-baseline justify-between">
        <span
          className="uppercase"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
        >
          How hard was it?
        </span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
          {value === undefined ? 'Not rated' : `RPE ${value}`}
        </span>
      </div>
      <div role="group" aria-label="Session RPE" className="flex" style={{ gap: 3 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const on = value === n
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              aria-pressed={on}
              aria-label={`RPE ${n} of 10`}
              className="flex-1 transition-colors"
              style={{
                padding: '7px 0',
                borderRadius: 'var(--r-control)',
                fontSize: 'var(--text-sm)', fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                border: `1px solid ${on ? 'rgb(var(--accent-soft-rgb) / 0.45)' : 'var(--hairline)'}`,
                background: on ? 'rgb(var(--accent-rgb) / 0.16)' : 'transparent',
                color: on ? 'var(--ink)' : 'var(--ink-faint)',
                cursor: 'pointer',
              }}
            >
              {n}
            </button>
          )
        })}
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
  /** The date being logged — today unless the user picked a past one. */
  sessionDate: string
}

function DayView({ dayLabel, forearmFatigue, lowReadiness, sessionDate }: DayViewProps) {
  const store = useWorkoutDayStore()
  const activeId = useProfileStore(s => s.activeId)
  const session = selectDaySession(store.sessions, dayLabel, sessionDate, activeId)
  const [showAddSheet, setShowAddSheet] = useState(false)
  // Held until Complete is pressed, so rating and completing are one action.
  const [pendingRpe, setPendingRpe] = useState<number | undefined>()

  // Load this profile's session for this day+date (reloads when any changes)
  useEffect(() => {
    store.loadSession(dayLabel, sessionDate)
  }, [dayLabel, activeId, sessionDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const program = getProgram(activeId)[dayLabel]
  const programMap = useMemo(() => buildProgramMap(activeId), [activeId])

  // Add-load suggestions come from this profile's own logged history.
  const allSessions = useLiveQuery(() => db.workoutDaySessions.toArray(), []) ?? []
  const progressions = useMemo(() => {
    const mine = allSessions.filter(s => belongsToProfile(s, activeId) && s.date < sessionDate)
    const out: Record<string, ProgressionSuggestion> = {}
    for (const ex of session?.exercises ?? []) {
      const prog = programMap[ex.exerciseId]
      const s = suggestProgression(mine, ex.exerciseId, prog?.reps, prog?.muscle)
      if (s) out[ex.exerciseId] = s
    }
    return out
  }, [allSessions, activeId, sessionDate, session, programMap])

  // Derive ordered exercises
  const orderedExercises = useMemo(() => {
    if (!session) return []
    return selectOrderedExercises(session)
  }, [session])

  // Forearm/pull warning for the day
  const hasFlaggedExercises = forearmFatigue && orderedExercises.some(ex => {
    const prog = programMap[ex.exerciseId]
    return prog && (PULL_HEAVY_EXERCISES.includes(prog.name) || FOREARM_LOAD_EXERCISES.includes(prog.name))
  })

  if (!session) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-[length:var(--text-sm)] uppercase tracking-widest" style={{ color: 'var(--ink-faint)' }}>
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
        focus={session.focus ?? program.focus}
        exercises={session.exercises}
      />

      {/* Readiness warnings */}
      {lowReadiness && (
        <div
          className="flex items-start gap-2 p-3 rounded-[var(--r-control)]"
          style={{ border: '1px solid rgba(127,29,29,0.4)' }}
        >
          <AlertTriangle size={14} style={{ color: 'var(--red)', marginTop: 1 }} className="shrink-0" />
          <span className="text-[length:var(--text-sm)]" style={{ color: 'var(--ink-dim)' }}>
            Low readiness — consider reducing volume or choosing a rest day.
          </span>
        </div>
      )}
      {hasFlaggedExercises && (
        <div
          className="flex items-start gap-2 p-3 rounded-[var(--r-control)]"
          style={{ border: '1px solid rgba(161,98,7,0.4)' }}
        >
          <Zap size={14} style={{ color: '#ca8a04', marginTop: 1 }} className="shrink-0" />
          <span className="text-[length:var(--text-sm)]" style={{ color: 'var(--ink-dim)' }}>
            Forearm fatigue active — pull-heavy exercises flagged.
          </span>
        </div>
      )}

      {/* Empty state — load a template or build the day manually */}
      {orderedExercises.length === 0 && (
        <div
          className="text-center space-y-3"
          style={{
            padding: 20, borderRadius: 'var(--r-card)',
            background: 'var(--card)', border: '1px dashed var(--hairline)',
          }}
        >
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-dim)' }}>
            No exercises yet — load the {dayLabel} template as a starting point, or add your own below.
          </p>
          {/* The one primary action on this screen, so it takes the gradient. */}
          <button
            onClick={() => store.loadTemplate(dayLabel, sessionDate)}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              padding: '15px 0', border: 'none', cursor: 'pointer', borderRadius: 16,
              background: 'linear-gradient(145deg, var(--violet-200), var(--violet-700))',
              boxShadow: '0 8px 26px rgb(var(--accent-rgb) / 0.42)',
              fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '0.02em', color: '#0A0810',
            }}
          >
            Load {dayLabel} · {program.focus}
          </button>
        </div>
      )}

      {/* Sortable exercise list */}
      {orderedExercises.length > 0 && (
        <SortableExerciseList
          exercises={orderedExercises}
          programMap={programMap}
          forearmFatigue={forearmFatigue}
          dayLabel={dayLabel}
          onReorder={newOrder => store.reorderExercises(dayLabel, newOrder, sessionDate)}
          onStatusChange={(exerciseId, status) => store.updateExerciseStatus(dayLabel, exerciseId, status, sessionDate)}
          onAddSet={(exerciseId, set) => store.addLoggedSet(dayLabel, exerciseId, set, sessionDate)}
          onUpdateSet={(exerciseId, index, set) => store.updateLoggedSet(dayLabel, exerciseId, index, set, sessionDate)}
          onRemoveSet={(exerciseId, index) => store.removeLoggedSet(dayLabel, exerciseId, index, sessionDate)}
          onRemoveExercise={exerciseId => store.removeExercise(dayLabel, exerciseId, sessionDate)}
          onSwapExercise={(exerciseId, toName) => store.swapExercise(dayLabel, exerciseId, toName, sessionDate)}
          progressions={progressions}
        />
      )}

      {/* Add Exercise button */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[var(--r-control)] text-[length:var(--text-md)] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ border: '1px dashed var(--border)', color: 'var(--ink-dim)' }}
      >
        <Plus size={14} />
        Add Exercise
      </button>

      {/* Complete workout */}
      {orderedExercises.length > 0 && (
        session.completedAt ? (
          <div className="flex flex-col" style={{ gap: 10 }}>
            <div
              className="text-center text-[length:var(--text-base)] uppercase tracking-widest py-2.5 rounded-[var(--r-control)]"
              style={{ color: 'var(--complete-text)', border: '1px solid var(--complete-border)', background: 'var(--complete-bg)' }}
            >
              ✓ Workout Complete
            </div>
            {/* Rating stays editable afterwards — it is a judgement made at the
                end of a session and often revised a minute later. */}
            <RpeScale
              value={session.rpe}
              onChange={rpe => store.setSessionRpe(dayLabel, rpe, sessionDate)}
            />
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {/* The pending choice has to be what renders, or tapping a number
                selects nothing until the session is completed. */}
            <RpeScale value={pendingRpe ?? session.rpe} onChange={setPendingRpe} />
            <button
              onClick={() => store.completeSession(dayLabel, sessionDate, pendingRpe)}
              className="w-full py-3 rounded-[var(--r-control)] text-[length:var(--text-base)] uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ border: '1px solid var(--complete-border)', color: 'var(--complete-text)' }}
            >
              Complete Workout
            </button>
          </div>
        )
      )}

      {/* Add exercise sheet */}
      {showAddSheet && (
        <AddExerciseSheet
          currentDay={dayLabel}
          existingIds={session.exercises.map(e => e.exerciseId)}
          onAdd={(ex: ExerciseSessionState) => store.addExercise(dayLabel, ex, sessionDate)}
          onClose={() => setShowAddSheet(false)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const TABS: Tab[] = ['program', 'history', 'tools']

export default function Workout() {
  // "Edit sets for this day" in a past session links here with the date and day,
  // so editing a finished workout lands on the right session.
  const [searchParams, setSearchParams] = useSearchParams()
  const linkedDate = searchParams.get('date')
  const linkedDay = searchParams.get('day') as DayLabel | null

  /**
   * The open tab lives in the URL, not in component state.
   *
   * Opening a logged day pushes /workout/session/:id, and coming back from it
   * returns to /workout. When the tab was local state that meant landing on
   * Program every time, however you got here — the back button looked broken
   * while doing exactly what it was asked. In the URL, the tab comes back with
   * the history entry, and a particular tab can be linked to.
   */
  const tabParam = searchParams.get('tab') as Tab | null
  const tab: Tab = tabParam && TABS.includes(tabParam) ? tabParam : 'program'

  const setTab = (next: Tab) => {
    const params = new URLSearchParams(searchParams)
    // Program is the default, so it stays out of the URL rather than making
    // every visit to Train carry a query string.
    if (next === 'program') params.delete('tab')
    else params.set('tab', next)
    setSearchParams(params, { replace: true })
  }

  const [selectedDay, setSelectedDay] = useState<DayLabel | 'Rest'>(
    linkedDay && ALL_DAYS.includes(linkedDay) ? linkedDay : 'Day 1'
  )
  // Which date is being logged — today unless the user backdates a session.
  const [sessionDate, setSessionDate] = useState<string>(linkedDate ?? TODAY)
  const activeProfileId = useProfileStore(s => s.activeId)
  const trainingDays = useProfileSettingsStore(s => s.trainingDays)

  // This week's sessions, so the day slots can never be fewer than the days
  // actually trained.
  const thisWeek = useLiveQuery(
    () => db.workoutDaySessions
      .filter(s => belongsToProfile(s, activeProfileId) && isoWeekKey(s.date) === isoWeekKey(TODAY))
      .toArray(),
    [activeProfileId]
  )
  const slots = weekSlots(thisWeek ?? [], isoWeekKey(TODAY), trainingDays, TODAY)

  /**
   * The session a slot opens.
   *
   * A slot that has been trained opens that session by the key it was already
   * stored under — the stored label is an identity, not the number on screen,
   * so nothing has to be rewritten for the numbering to change. An untrained
   * slot opens today, and every untrained slot opens the *same* today, because
   * today can only be one training day however far down the list it is tapped.
   */
  const openSlot = (slot: DaySlot) => {
    if (slot.session) {
      setSelectedDay(slot.session.dayLabel)
      setSessionDate(slot.session.date)
      return
    }
    const next = Math.min(slots.filter(x => x.session).length + 1, ALL_DAYS.length)
    setSelectedDay(`Day ${next}` as DayLabel)
    setSessionDate(TODAY)
  }

  const isOpen = (slot: DaySlot) =>
    slot.session
      ? selectedDay === slot.session.dayLabel && sessionDate === slot.session.date
      : slot.isToday && sessionDate === TODAY
        && !slots.some(x => x.session?.dayLabel === selectedDay && x.session?.date === TODAY)

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
      const cutoffISO = cutoff.toISOString().split('T')[0]
      // Read the table the live logging flow actually writes to, counting only
      // the active profile's sessions.
      return db.workoutDaySessions
        .where('date').aboveOrEqual(cutoffISO)
        .filter(s => !!s.completedAt && belongsToProfile(s, activeProfileId))
        .count()
    },
    [activeProfileId]
  )

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 gap-2">
        <div className="min-w-0">
          <div
            className="uppercase"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
          >
            Obzen Program
          </div>
          <h1 style={{ fontSize: 'var(--text-6xl)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
            Workout
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
            {weekSessions ?? 0}/{trainingDays} this week
          </div>
        </div>
      </div>

      {/* Tabs */}
      <SegmentedPill
        label="Train section"
        value={tab}
        onChange={setTab}
        grow
        options={[
          { value: 'program' as Tab, label: 'Program' },
          { value: 'history' as Tab, label: 'History' },
          { value: 'tools' as Tab, label: 'Tools' },
        ]}
      />

      {tab === 'history' && <WorkoutHistory />}

      {tab === 'tools' && <StrengthTools />}

      {tab === 'program' && (
        <>
          {/* Day selector */}
          <div className="flex gap-2">
            {slots.map(slot => {
              const open = isOpen(slot)
              return (
              <button
                key={slot.day}
                onClick={() => openSlot(slot)}
                aria-pressed={open}
                aria-label={`Day ${slot.day}${slot.session ? ', trained' : ', not yet trained'}`}
                className="flex-1 uppercase transition-colors"
                style={{
                  padding: '10px 0',
                  borderRadius: 'var(--r-control)',
                  fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.08em',
                  border: `1px solid ${open ? 'rgb(var(--accent-soft-rgb) / 0.45)' : 'var(--hairline)'}`,
                  background: open ? 'rgb(var(--accent-rgb) / 0.14)' : 'transparent',
                  // A trained slot reads at full strength; one still to come is
                  // dimmed, so the week's shape is legible without tapping it.
                  color: open ? 'var(--ink)' : slot.session ? 'var(--ink-dim)' : 'var(--ink-ghost)',
                }}
              >
                Day {slot.day}
              </button>
              )
            })}
            <button
              onClick={() => setSelectedDay('Rest')}
              aria-pressed={selectedDay === 'Rest'}
              className="uppercase transition-colors"
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--r-control)',
                fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.08em',
                border: `1px solid ${selectedDay === 'Rest' ? 'rgb(var(--accent-soft-rgb) / 0.45)' : 'var(--hairline)'}`,
                background: selectedDay === 'Rest' ? 'rgb(var(--accent-rgb) / 0.14)' : 'transparent',
                color: selectedDay === 'Rest' ? 'var(--ink)' : 'var(--ink-faint)',
              }}
            >
              Rest
            </button>
          </div>

          {/* Session date — defaults to today; pick a past date to log a
              workout you forgot to enter at the gym. */}
          {selectedDay !== 'Rest' && (
            <div
              className="flex items-center justify-between gap-3"
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--r-inset)',
                background: 'var(--card)',
                // A past date is a deliberate, easy-to-miss state — the accent
                // border is what makes it obvious the log is not for today.
                border: `1px solid ${sessionDate === TODAY ? 'var(--hairline)' : 'rgb(var(--accent-soft-rgb) / 0.45)'}`,
              }}
            >
              <label
                htmlFor="session-date"
                className="uppercase shrink-0"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
              >
                {sessionDate === TODAY ? 'Logging today' : 'Logging past date'}
              </label>
              <div className="flex items-center gap-2">
                {sessionDate !== TODAY && (
                  <button
                    onClick={() => setSessionDate(TODAY)}
                    className="uppercase transition-opacity hover:opacity-70"
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--violet-100)' }}
                  >
                    Today
                  </button>
                )}
                <input
                  id="session-date"
                  type="date"
                  value={sessionDate}
                  max={TODAY}
                  onChange={e => setSessionDate(e.target.value || TODAY)}
                  className="bg-transparent focus:outline-none"
                  style={{
                    padding: '5px 8px', borderRadius: 'var(--r-control)',
                    fontSize: 'var(--text-base)', border: '1px solid var(--hairline)', color: 'var(--ink-2)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Day content */}
          {selectedDay === 'Rest' ? (
            <RestDayCard />
          ) : (
            <DayView
              dayLabel={selectedDay}
              forearmFatigue={forearmFatigue}
              lowReadiness={lowReadiness}
              sessionDate={sessionDate}
            />
          )}
        </>
      )}
    </div>
  )
}
