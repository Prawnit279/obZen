import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import type { CheckIn } from '@/db/dexie'
import { useAyurvedaStore } from '@/store/useAyurvedaStore'
import { useNutritionStore } from '@/store/useNutritionStore'
import { useAppStore } from '@/store/useAppStore'
import { calcWorkoutStreak } from '@/lib/checkin'
import {
  todayISO, formatDateLong, dayOfWeek, getPlanetaryDay,
  getMoonPhaseName, isPittaSeasonPeak, isSaturday,
} from '@/lib/utils'
import { DAILY_AYURVEDA_TIPS } from '@/data/ayurveda'
import { VEDIC_REMEDIES } from '@/data/vedic-remedies'
import { OBZEN_PROGRAM } from '@/data/obzen-program'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { CheckInModal } from '@/components/modules/dashboard/CheckInModal'
import { WeeklyVolumeChart } from '@/components/modules/dashboard/WeeklyVolumeChart'
import { DrumPieChart } from '@/components/modules/dashboard/DrumPieChart'
import { MacroComplianceChart } from '@/components/modules/dashboard/MacroComplianceChart'
import { ProgressOverloadChart } from '@/components/modules/dashboard/ProgressOverloadChart'
import { useNavigate } from 'react-router-dom'
import { Zap, AlertTriangle, Flame, Plus, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type DashTab = 'today' | 'weekly'

function getDailyTip(): string {
  const day = new Date().getDate()
  return DAILY_AYURVEDA_TIPS[day % DAILY_AYURVEDA_TIPS.length]
}

function getDailyRemedy() {
  const day = new Date().getDate()
  return VEDIC_REMEDIES[day % VEDIC_REMEDIES.length]
}

function getProgramDay(): { label: string; isRest: boolean } {
  const dayIdx = new Date().getDay()
  if (dayIdx === 0 || dayIdx === 4) return { label: 'Rest Day', isRest: true }
  const days = Object.keys(OBZEN_PROGRAM)
  return { label: days[dayIdx % days.length], isRest: false }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const today = todayISO()
  const { checkAndReset, todayCompleted } = useAyurvedaStore()
  const { streaks, updateStreak } = useAppStore()
  const { isTrainingDay } = useNutritionStore()
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [dashTab, setDashTab] = useState<DashTab>('today')

  useEffect(() => { checkAndReset(today) }, [checkAndReset, today])

  const checkIn = useLiveQuery<CheckIn | undefined>(
    () => db.checkIns.where('date').equals(today).first(),
    [today]
  )
  const nutritionLog = useLiveQuery(
    () => db.nutritionLogs.where('date').equals(today).first(),
    [today]
  )
  const upcomingEvents = useLiveQuery(
    () => db.calendarEvents.where('date').aboveOrEqual(today).limit(3).toArray(),
    [today]
  )
  const allSessions = useLiveQuery(
    () => db.workoutSessions.toArray(),
    []
  )

  // Update workout streak from real data
  useEffect(() => {
    if (!allSessions) return
    const streak = calcWorkoutStreak(allSessions)
    updateStreak('workout', streak)
  }, [allSessions, updateStreak])

  // Update ayurveda streak
  useEffect(() => {
    const morningTotal = 9 // from dinacharya
    const eveningTotal = 9
    if (todayCompleted.length >= Math.floor((morningTotal + eveningTotal) / 2)) {
      updateStreak('ayurveda', streaks.ayurveda > 0 ? streaks.ayurveda : 1)
    }
  }, [todayCompleted])

  const planetaryDay = getPlanetaryDay()
  const dailyTip = getDailyTip()
  const dailyRemedy = getDailyRemedy()
  const { label: programDayLabel, isRest } = getProgramDay()
  const program = isRest ? null : OBZEN_PROGRAM[programDayLabel]

  const targets = isTrainingDay
    ? { protein: 150, carbs: 270, fat: 59, calories: 2550 }
    : { protein: 145, carbs: 210, fat: 52, calories: 2250 }

  const showForearmWarning = checkIn?.forearmFatigue === true
  const showRestWarning = checkIn != null && (checkIn.energy <= 2 || checkIn.soreness === 'high')

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-noir-muted">{dayOfWeek()}</div>
        <div className="text-[18px] uppercase tracking-wide text-noir-white leading-tight">
          {formatDateLong(new Date())}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-noir-dim">
            {planetaryDay.planet} Day
          </span>
          <span className="text-noir-dim">·</span>
          <span className="text-[10px] uppercase tracking-widest text-noir-dim">
            {getMoonPhaseName()}
          </span>
          {isPittaSeasonPeak() && (
            <Badge variant="red" className="text-[9px]">Pitta Season</Badge>
          )}
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
        {(['today', 'weekly'] as DashTab[]).map(t => (
          <button
            key={t}
            onClick={() => setDashTab(t)}
            className={cn(
              'flex-1 py-2 text-[10px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0',
              dashTab === t ? 'bg-noir-elevated text-noir-white' : 'text-noir-dim hover:text-noir-muted hover:bg-noir-elevated/30'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {dashTab === 'weekly' && <WeeklySummaryTab />}

      {dashTab === 'today' && <>

      {/* Smart warnings */}
      {(showForearmWarning || showRestWarning || isSaturday()) && (
        <div className="space-y-2">
          {showRestWarning && (
            <div className="flex items-start gap-2 p-3 border border-noir-red/40 rounded-[2px] bg-noir-red/5">
              <AlertTriangle size={14} className="text-noir-red mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-noir-red mb-0.5">Low Readiness</div>
                <div className="text-[12px] text-noir-muted">
                  {checkIn?.soreness === 'high' && 'High soreness. '}
                  {checkIn && checkIn.energy <= 2 && 'Low energy. '}
                  Consider yoga or rest only today.
                </div>
              </div>
            </div>
          )}
          {showForearmWarning && (
            <div className="flex items-start gap-2 p-3 border border-yellow-700/40 rounded-[2px] bg-yellow-900/5">
              <Zap size={14} className="text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-yellow-600 mb-0.5">Forearm Fatigue</div>
                <div className="text-[12px] text-noir-muted">Reduce pull-up volume. Skip Hammer Curls.</div>
              </div>
            </div>
          )}
          {isSaturday() && (
            <div className="flex items-start gap-2 p-3 border border-noir-border rounded-[2px]">
              <Flame size={14} className="text-noir-muted mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-noir-accent mb-0.5">Saturn Day</div>
                <div className="text-[12px] text-noir-muted">Om Shani Namaha · Service · No new starts.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-in card */}
      {!checkIn ? (
        <button
          onClick={() => setCheckInOpen(true)}
          className="w-full border border-dashed border-noir-border rounded-[2px] py-4 text-[11px] uppercase tracking-widest text-noir-dim hover:border-noir-strong hover:text-noir-muted transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={13} />
          Log today's check-in
        </button>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-noir-muted">Today's Check-in</span>
            <button
              onClick={() => setCheckInOpen(true)}
              className="text-noir-dim hover:text-noir-muted transition-colors"
              aria-label="Edit check-in"
            >
              <Edit2 size={12} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-[20px] text-noir-white leading-none">{checkIn.mood}</div>
              <div className="text-[9px] uppercase tracking-widest text-noir-dim mt-1">Mood</div>
            </div>
            <div className="text-center">
              <div className="text-[20px] text-noir-white leading-none">{checkIn.energy}</div>
              <div className="text-[9px] uppercase tracking-widest text-noir-dim mt-1">Energy</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] text-noir-accent capitalize leading-none mt-1">{checkIn.soreness}</div>
              <div className="text-[9px] uppercase tracking-widest text-noir-dim mt-1.5">Soreness</div>
            </div>
            <div className="text-center">
              <div className={`text-[13px] leading-none mt-1 ${checkIn.forearmFatigue ? 'text-yellow-500' : 'text-noir-dim'}`}>
                {checkIn.forearmFatigue ? 'Yes' : 'No'}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-noir-dim mt-1.5">Forearm</div>
            </div>
          </div>
        </Card>
      )}

      {/* Today's workout */}
      <Card
        className="cursor-pointer hover:border-noir-strong transition-colors"
        onClick={() => navigate('/workout')}
      >
        <CardHeader label="Today's Workout" />
        {program ? (
          <>
            <div className="text-[13px] text-noir-accent">{programDayLabel}</div>
            <div className="text-[11px] text-noir-muted mt-0.5">{program.focus}</div>
            <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-2">
              {program.exercises.length} exercises · tap to start
            </div>
          </>
        ) : (
          <div className="text-[13px] text-noir-muted">Rest Day — yoga or recovery only</div>
        )}
      </Card>

      {/* Nutrition */}
      <Card
        className="cursor-pointer hover:border-noir-strong transition-colors"
        onClick={() => navigate('/nutrition')}
      >
        <CardHeader
          label="Nutrition"
          action={
            <Badge variant={isTrainingDay ? 'accent' : 'dim'}>
              {isTrainingDay ? 'Training' : 'Rest'}
            </Badge>
          }
        />
        <div className="space-y-2.5">
          <ProgressBar label="Protein" value={nutritionLog?.totalProtein ?? 0} max={targets.protein} showLabel compact />
          <ProgressBar label="Carbs" value={nutritionLog?.totalCarbs ?? 0} max={targets.carbs} showLabel compact />
          <ProgressBar label="Fat" value={nutritionLog?.totalFat ?? 0} max={targets.fat} showLabel compact />
          <ProgressBar label="Calories" value={nutritionLog?.totalCalories ?? 0} max={targets.calories} showLabel compact />
        </div>
      </Card>

      {/* Streaks */}
      <Card>
        <CardHeader label="Streaks" />
        <div className="grid grid-cols-4 gap-2">
          {([
            ['Workout', streaks.workout],
            ['Drum', streaks.drum],
            ['Nutrition', streaks.nutrition],
            ['Ayurveda', streaks.ayurveda],
          ] as [string, number][]).map(([label, count]) => (
            <div key={label} className="text-center">
              <div className="text-[20px] text-noir-white leading-none">{count}</div>
              <div className="text-[9px] uppercase tracking-widest text-noir-dim mt-1">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ayurveda tip */}
      <Card>
        <CardHeader label="Ayurveda · Today" />
        <p className="text-[13px] text-noir-muted leading-relaxed">{dailyTip}</p>
      </Card>

      {/* Vedic remedy */}
      <Card>
        <CardHeader label={`Vedic · ${dailyRemedy.planet}`} />
        <p className="text-[13px] text-noir-accent italic leading-relaxed">"{dailyRemedy.affirmation}"</p>
        {dailyRemedy.remedies[0] && (
          <p className="text-[12px] text-noir-muted mt-2">{dailyRemedy.remedies[0]}</p>
        )}
      </Card>

      {/* Upcoming events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <Card>
          <CardHeader label="Upcoming" />
          <div className="space-y-2">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between py-1.5 border-b border-noir-border last:border-0">
                <div>
                  <div className="text-[12px] text-noir-accent">{event.title}</div>
                  <div className="text-[10px] text-noir-dim">{event.date}{event.startTime ? ` · ${event.startTime}` : ''}</div>
                </div>
                <Badge variant="dim">{event.category}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      </>}

      {/* Check-in modal */}
      <CheckInModal
        open={checkInOpen}
        existing={checkIn}
        onClose={() => setCheckInOpen(false)}
        onSaved={() => setCheckInOpen(false)}
      />
    </div>
  )
}

function WeeklySummaryTab() {
  return (
    <div className="space-y-6">
      <div className="p-4 border border-noir-border rounded-[2px] bg-noir-surface">
        <WeeklyVolumeChart />
      </div>
      <div className="p-4 border border-noir-border rounded-[2px] bg-noir-surface">
        <MacroComplianceChart />
      </div>
      <div className="p-4 border border-noir-border rounded-[2px] bg-noir-surface">
        <DrumPieChart />
      </div>
      <div className="p-4 border border-noir-border rounded-[2px] bg-noir-surface">
        <ProgressOverloadChart />
      </div>
    </div>
  )
}
