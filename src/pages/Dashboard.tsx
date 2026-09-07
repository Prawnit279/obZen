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
import { getProgram, getScheduledDay } from '@/data/obzen-program'
import { SHOW_NUTRITION, SHOW_VEDIC, SHOW_ASTROLOGY } from '@/config/features'
import { PROFILES, PROFILE_IDS } from '@/config/profiles'
import { useProfileStore } from '@/store/useProfileStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { CheckInModal } from '@/components/modules/dashboard/CheckInModal'
import { WeeklyVolumeChart } from '@/components/modules/dashboard/WeeklyVolumeChart'
import { WeekStrip } from '@/components/modules/dashboard/WeekStrip'
import { DrumPieChart } from '@/components/modules/dashboard/DrumPieChart'
import { MacroComplianceChart } from '@/components/modules/dashboard/MacroComplianceChart'
import { ProgressOverloadChart } from '@/components/modules/dashboard/ProgressOverloadChart'
import { useNavigate } from 'react-router-dom'
import { Zap, AlertTriangle, Flame, Plus, Edit2 } from 'lucide-react'

type DashTab = 'today' | 'weekly'

function getDailyTip(): string {
  const day = new Date().getDate()
  return DAILY_AYURVEDA_TIPS[day % DAILY_AYURVEDA_TIPS.length]
}

function getDailyRemedy() {
  const day = new Date().getDate()
  return VEDIC_REMEDIES[day % VEDIC_REMEDIES.length]
}

function getProgramDay(profileId: string): { label: string; isRest: boolean } {
  const scheduled = getScheduledDay(profileId)
  return scheduled.kind === 'train'
    ? { label: scheduled.dayLabel, isRest: false }
    : { label: scheduled.label, isRest: true }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const today = todayISO()
  const { checkAndReset, todayCompleted } = useAyurvedaStore()
  const { streaks, updateStreak } = useAppStore()
  const { isTrainingDay } = useNutritionStore()
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [dashTab, setDashTab] = useState<DashTab>('today')
  const { activeId, setActive } = useProfileStore()

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
  const { label: programDayLabel, isRest } = getProgramDay(activeId)
  const program = isRest ? null : getProgram(activeId)[programDayLabel]

  const targets = isTrainingDay
    ? { protein: 150, carbs: 270, fat: 59, calories: 2550 }
    : { protein: 145, carbs: 210, fat: 52, calories: 2250 }

  const showForearmWarning = checkIn?.forearmFatigue === true
  const showRestWarning = checkIn != null && (checkIn.energy <= 2 || checkIn.soreness === 'high')

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="uppercase"
            style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
          >
            {dayOfWeek()}
          </span>
          {/* Profile switcher — segmented pill */}
          <div
            role="group"
            aria-label="Active profile"
            className="flex"
            style={{
              gap: 2, padding: 2,
              borderRadius: 'var(--r-pill)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            {PROFILE_IDS.map(id => {
              const on = id === activeId
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  aria-pressed={on}
                  className="transition-colors"
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--r-pill)',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.03em',
                    background: on
                      ? 'linear-gradient(140deg, var(--violet-400), var(--violet-900))'
                      : 'transparent',
                    color: on ? '#FFFFFF' : 'var(--ink-faint)',
                    boxShadow: on ? '0 2px 14px rgba(76,29,149,0.6)' : 'none',
                  }}
                >
                  {PROFILES[id].name}
                </button>
              )
            })}
          </div>
        </div>
        <h1
          className="mt-1"
          style={{
            fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em',
            lineHeight: 1.1, color: 'var(--ink)',
          }}
        >
          {formatDateLong(new Date())}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--ink-dim)', marginTop: 2 }}>
          {PROFILES[activeId].name}'s day
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {SHOW_ASTROLOGY && (
            <>
              <span className="text-[10px] uppercase tracking-widest text-noir-dim">
                {planetaryDay.planet} Day
              </span>
              <span className="text-noir-dim">·</span>
              <span className="text-[10px] uppercase tracking-widest text-noir-dim">
                {getMoonPhaseName()}
              </span>
            </>
          )}
          {isPittaSeasonPeak() && (
            <Badge variant="red">Pitta Season</Badge>
          )}
        </div>
      </div>

      {/* Tab selector */}
      <div
        role="group"
        aria-label="Dashboard range"
        className="flex"
        style={{
          gap: 2, padding: 2,
          borderRadius: 'var(--r-pill)',
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        {(['today', 'weekly'] as DashTab[]).map(t => {
          const on = dashTab === t
          return (
            <button
              key={t}
              onClick={() => setDashTab(t)}
              aria-pressed={on}
              className="flex-1 capitalize transition-colors"
              style={{
                padding: '6px 12px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--r-pill)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.03em',
                background: on
                  ? 'linear-gradient(140deg, var(--violet-400), var(--violet-900))'
                  : 'transparent',
                color: on ? '#FFFFFF' : 'var(--ink-faint)',
                boxShadow: on ? '0 2px 14px rgba(76,29,149,0.6)' : 'none',
              }}
            >
              {t}
            </button>
          )
        })}
      </div>

      {dashTab === 'weekly' && <WeeklySummaryTab />}

      {dashTab === 'today' && <>

      {/* Smart warnings */}
      {(showForearmWarning || showRestWarning || (SHOW_ASTROLOGY && isSaturday())) && (
        <div className="space-y-2">
          {showRestWarning && (
            <div
              className="flex items-start gap-2"
              style={{
                padding: '12px 14px', borderRadius: 'var(--r-inset)',
                border: '1px solid rgba(248,113,113,0.32)', background: 'rgba(248,113,113,0.06)',
              }}
            >
              <AlertTriangle size={14} style={{ color: 'var(--red)' }} className="mt-0.5 shrink-0" />
              <div>
                <div className="uppercase" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', marginBottom: 2, color: 'var(--red)' }}>Low Readiness</div>
                <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
                  {checkIn?.soreness === 'high' && 'High soreness. '}
                  {checkIn && checkIn.energy <= 2 && 'Low energy. '}
                  Consider yoga or rest only today.
                </div>
              </div>
            </div>
          )}
          {showForearmWarning && (
            <div
              className="flex items-start gap-2"
              style={{
                padding: '12px 14px', borderRadius: 'var(--r-inset)',
                border: '1px solid rgba(167,139,250,0.30)', background: 'rgba(139,92,246,0.07)',
              }}
            >
              <Zap size={14} style={{ color: 'var(--violet-100)' }} className="mt-0.5 shrink-0" />
              <div>
                <div className="uppercase" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', marginBottom: 2, color: 'var(--violet-100)' }}>Forearm Fatigue</div>
                <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>Reduce pull-up volume. Skip Hammer Curls.</div>
              </div>
            </div>
          )}
          {SHOW_ASTROLOGY && isSaturday() && (
            <div
              className="flex items-start gap-2"
              style={{
                padding: '12px 14px', borderRadius: 'var(--r-inset)',
                border: '1px solid var(--hairline)',
              }}
            >
              <Flame size={14} style={{ color: 'var(--ink-dim)' }} className="mt-0.5 shrink-0" />
              <div>
                <div className="uppercase" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', marginBottom: 2, color: 'var(--ink-2)' }}>Saturn Day</div>
                <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>Om Shani Namaha · Service · No new starts.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-in card */}
      {!checkIn ? (
        <button
          onClick={() => setCheckInOpen(true)}
          className="w-full uppercase transition-colors flex items-center justify-center gap-2"
          style={{
            border: '1px dashed var(--hairline)',
            borderRadius: 'var(--r-card)',
            padding: '16px 0',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: 'var(--ink-faint)',
          }}
        >
          <Plus size={13} />
          Log today's check-in
        </button>
      ) : (
        <Card>
          <div className="flex items-center justify-between">
            <span
              className="uppercase"
              style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
            >
              Today's Check-in
            </span>
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
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{checkIn.mood}</div>
              <div className="uppercase" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--ink-faint)', marginTop: 6 }}>Mood</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{checkIn.energy}</div>
              <div className="uppercase" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--ink-faint)', marginTop: 6 }}>Energy</div>
            </div>
            <div className="text-center">
              <div className="capitalize" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.35, color: 'var(--ink-2)' }}>
                {checkIn.soreness}
              </div>
              <div className="uppercase" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--ink-faint)', marginTop: 6 }}>Soreness</div>
            </div>
            <div className="text-center">
              <div style={{
                fontSize: 15, fontWeight: 500, lineHeight: 1.35,
                color: checkIn.forearmFatigue ? 'var(--violet-100)' : 'var(--ink-faint)',
              }}>
                {checkIn.forearmFatigue ? 'Yes' : 'No'}
              </div>
              <div className="uppercase" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--ink-faint)', marginTop: 6 }}>Forearm</div>
            </div>
          </div>
        </Card>
      )}

      {/* Today's workout */}
      <Card
        elevated
        className="cursor-pointer transition-colors"
        onClick={() => navigate('/workout')}
      >
        <CardHeader label="Today's Workout" />
        {program ? (
          <div className="flex flex-col" style={{ gap: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              {programDayLabel}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{program.focus}</div>
            <div
              className="uppercase"
              style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--ink-faint)' }}
            >
              {program.exercises.length} exercises · tap to start
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            {programDayLabel}
          </div>
        )}
      </Card>

      {/* This week's training (Mon–Sun) */}
      <WeekStrip />

      {/* Nutrition */}
      {SHOW_NUTRITION && (
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
      )}

      {/* Ayurveda tip */}
      <Card>
        <CardHeader label="Ayurveda · Today" />
        <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-dim)' }}>{dailyTip}</p>
      </Card>

      {/* Vedic remedy */}
      {SHOW_VEDIC && (
        <Card>
          <CardHeader label={`Vedic · ${dailyRemedy.planet}`} />
          <p style={{ fontSize: 13, lineHeight: 1.55, fontStyle: 'italic', color: 'var(--ink-2)' }}>
            "{dailyRemedy.affirmation}"
          </p>
          {dailyRemedy.remedies[0] && (
            <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{dailyRemedy.remedies[0]}</p>
          )}
        </Card>
      )}

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
      {SHOW_NUTRITION && (
        <div className="p-4 border border-noir-border rounded-[2px] bg-noir-surface">
          <MacroComplianceChart />
        </div>
      )}
      <div className="p-4 border border-noir-border rounded-[2px] bg-noir-surface">
        <DrumPieChart />
      </div>
      <div className="p-4 border border-noir-border rounded-[2px] bg-noir-surface">
        <ProgressOverloadChart />
      </div>
    </div>
  )
}
