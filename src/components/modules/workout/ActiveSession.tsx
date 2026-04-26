import { useState, useEffect, useCallback } from 'react'
import type { ExerciseLog } from '@/db/dexie'
import type { ProgramDay } from '@/data/obzen-program'
import { buildInitialSets, saveExerciseLog, updateExerciseLog, completeWorkoutSession } from '@/lib/workout'
import { ActiveExercise } from './ActiveExercise'
import { Button } from '@/components/ui/Button'
import { formatDuration } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import { Timer, CheckCircle } from 'lucide-react'


interface Props {
  sessionId: number
  dayLabel: string
  program: ProgramDay
  forearmFatigue: boolean
  onComplete: () => void
  onAbort: () => void
}

export function ActiveSession({ sessionId, dayLabel, program, forearmFatigue, onComplete, onAbort }: Props) {
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [logIds, setLogIds] = useState<(number | null)[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [completing, setCompleting] = useState(false)

  // Init exercise logs
  useEffect(() => {
    const today = todayISO()
    const initialLogs: ExerciseLog[] = program.exercises.map(ex => ({
      sessionId,
      exerciseId: ex.name.toLowerCase().replace(/\s+/g, '-'),
      exerciseName: ex.name,
      date: today,
      sets: buildInitialSets(ex.working, ex.warmup),
      injuryFlag: false,
      skipped: false,
    }))
    setLogs(initialLogs)
    setLogIds(new Array(initialLogs.length).fill(null))
  }, [sessionId, program])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const persistLog = useCallback(async (index: number, log: ExerciseLog) => {
    const existingId = logIds[index]
    if (existingId != null) {
      await updateExerciseLog(existingId, log)
    } else {
      const id = await saveExerciseLog(log)
      setLogIds(prev => {
        const next = [...prev]
        next[index] = id
        return next
      })
    }
  }, [logIds])

  const handleChange = (index: number, updated: ExerciseLog) => {
    setLogs(prev => {
      const next = [...prev]
      next[index] = updated
      return next
    })
    persistLog(index, updated)
  }

  const handleSkip = (index: number) => {
    const updated = { ...logs[index], skipped: !logs[index].skipped }
    handleChange(index, updated)
  }

  const handleComplete = async () => {
    setCompleting(true)
    // Persist any unsaved logs
    for (let i = 0; i < logs.length; i++) {
      await persistLog(i, logs[i])
    }
    await completeWorkoutSession(sessionId)
    onComplete()
  }

  const completedExercises = logs.filter(l => !l.skipped && l.sets.some(s => !s.isWarmup && s.completed)).length
  const totalExercises = logs.filter(l => !l.skipped).length
  const sessionPct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Session header */}
      <div className="flex items-center justify-between py-2 border-b border-noir-border">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">{dayLabel}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <Timer size={12} className="text-noir-dim" />
            <span className="text-[13px] text-noir-accent font-mono">
              {formatDuration(Math.floor(elapsed / 60))}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[16px] text-noir-white">{sessionPct}%</div>
          <div className="text-[9px] uppercase tracking-widest text-noir-dim">
            {completedExercises}/{totalExercises} done
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-noir-border h-0.5 rounded-[1px]">
        <div
          className="h-0.5 bg-noir-accent rounded-[1px] transition-all duration-500"
          style={{ width: `${sessionPct}%` }}
        />
      </div>

      {/* Exercises */}
      <div className="space-y-2">
        {logs.map((log, i) => (
          <ActiveExercise
            key={i}
            log={log}
            forearmFatigue={forearmFatigue}
            onChange={updated => handleChange(i, updated)}
            onSkip={() => handleSkip(i)}
            isActive={activeIdx === i}
            onActivate={() => setActiveIdx(i)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={onAbort} className="shrink-0">
          Abort
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleComplete}
          disabled={completing}
        >
          <CheckCircle size={14} className="inline mr-1.5 -mt-0.5" />
          Complete Session
        </Button>
      </div>

      {forearmFatigue && (
        <div className="text-[11px] text-yellow-600/80 text-center">
          Pitta note: cool down if session exceeds 60 mins. Forearm fatigue active — grip exercises flagged.
        </div>
      )}
    </div>
  )
}
