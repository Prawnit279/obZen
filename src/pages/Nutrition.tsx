import { useState } from 'react'
import { useNutritionStore } from '@/store/useNutritionStore'
import { PITTA_NUTRITION } from '@/data/ayurveda'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function Nutrition() {
  const { isTrainingDay, toggleTrainingDay } = useNutritionStore()
  const targets = isTrainingDay ? PITTA_NUTRITION.trainingDay : PITTA_NUTRITION.restDay

  const [logged] = useState({ protein: 0, carbs: 0, fat: 0, calories: 0 })

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-noir-muted">Daily Log</div>
          <div className="text-[18px] uppercase tracking-wide text-noir-white">Nutrition</div>
        </div>
        <button
          onClick={toggleTrainingDay}
          className={cn(
            'px-3 py-1.5 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
            isTrainingDay
              ? 'border-noir-accent text-noir-white bg-noir-elevated'
              : 'border-noir-border text-noir-dim hover:border-noir-strong'
          )}
        >
          {isTrainingDay ? 'Training Day' : 'Rest Day'}
        </button>
      </div>

      <Card>
        <CardHeader label="Today's Macros" />
        <div className="space-y-4">
          <ProgressBar
            label={`Protein (${targets.protein.min}–${targets.protein.max}g)`}
            value={logged.protein}
            max={targets.protein.max}
            showLabel
          />
          <ProgressBar
            label={`Carbs (${targets.carbs.min}–${targets.carbs.max}g)`}
            value={logged.carbs}
            max={targets.carbs.max}
            showLabel
          />
          <ProgressBar
            label={`Fat (${targets.fat.min}–${targets.fat.max}g)`}
            value={logged.fat}
            max={targets.fat.max}
            showLabel
          />
          <ProgressBar
            label={`Calories (${targets.calories.min}–${targets.calories.max} kcal)`}
            value={logged.calories}
            max={targets.calories.max}
            showLabel
          />
        </div>
        <div className="mt-3 text-[11px] text-noir-dim border-l border-noir-strong pl-3">
          {targets.ayurvedicNote}
        </div>
      </Card>

      <Button variant="primary" fullWidth>
        Log Meal
      </Button>

      <Card>
        <CardHeader label="Pitta-Favor Foods" />
        <div className="flex flex-wrap gap-1.5">
          {PITTA_NUTRITION.favorFoods.map(food => (
            <span key={food} className="text-[11px] border border-noir-border rounded-[2px] px-2 py-0.5 text-noir-muted">
              {food}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader label="Avoid" />
        <div className="flex flex-wrap gap-1.5">
          {PITTA_NUTRITION.avoidFoods.map(food => (
            <span key={food} className="text-[11px] border border-noir-red/40 rounded-[2px] px-2 py-0.5 text-noir-red/80">
              {food}
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}
