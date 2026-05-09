import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNutritionStore } from '@/store/useNutritionStore'
import { PITTA_NUTRITION } from '@/data/ayurveda'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { Plus, X, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { db } from '@/db/dexie'
import type { MealEntry, SavedMeal } from '@/db/dexie'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
type TypedEntry = MealEntry & { mealType: MealType }

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MACRO_CLR = { protein: '#34d399', carbs: '#fbbf24', fat: '#a78bfa' }

function shiftDate(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function sumMacros(meals: TypedEntry[]) {
  return meals.reduce(
    (acc, m) => ({
      totalProtein: acc.totalProtein + (m.protein ?? 0),
      totalCarbs: acc.totalCarbs + (m.carbs ?? 0),
      totalFat: acc.totalFat + (m.fat ?? 0),
      totalCalories: acc.totalCalories + (m.calories ?? 0),
    }),
    { totalProtein: 0, totalCarbs: 0, totalFat: 0, totalCalories: 0 }
  )
}

async function persistEntry(date: string, isTrainingDay: boolean, entry: TypedEntry) {
  const existing = await db.nutritionLogs.where('date').equals(date).first()
  if (existing) {
    const meals = [...(existing.meals as TypedEntry[]), entry]
    await db.nutritionLogs.update(existing.id!, { meals, ...sumMacros(meals) })
  } else {
    await db.nutritionLogs.add({
      date,
      isTrainingDay,
      meals: [entry],
      ...sumMacros([entry]),
    })
  }
}

async function dropEntry(logId: number, entryId: string, allEntries: TypedEntry[]) {
  const next = allEntries.filter(m => m.id !== entryId)
  await db.nutritionLogs.update(logId, { meals: next, ...sumMacros(next) })
}

// ─── MacroBar ────────────────────────────────────────────────────────────────

interface MacroBarProps {
  label: string
  value: number
  max: number
  color: string
  unit?: string
}

function MacroBar({ label, value, max, color, unit = 'g' }: MacroBarProps) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: '#555555' }}>{label}</span>
        <span className="text-[11px]" style={{ color: '#d4d4d4' }}>
          {value}{unit} <span style={{ color: '#3a3a3a' }}>/ {max}{unit}</span>
        </span>
      </div>
      <div className="h-1 rounded-[1px]" style={{ background: '#1a1a1a' }}>
        <div
          className="h-full rounded-[1px] transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ─── AddMealSheet ────────────────────────────────────────────────────────────

interface AddMealSheetProps {
  date: string
  isTrainingDay: boolean
  savedMeals: SavedMeal[]
  initialMealType: MealType
  onClose: () => void
}

function AddMealSheet({ date, isTrainingDay, savedMeals, initialMealType, onClose }: AddMealSheetProps) {
  const [mealType, setMealType] = useState<MealType>(initialMealType)
  const [tab, setTab] = useState<'custom' | 'saved'>('custom')
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [time, setTime] = useState('')
  const [pitta, setPitta] = useState(false)
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && (calories || protein || carbs || fat)

  const buildEntry = (): TypedEntry => ({
    id: crypto.randomUUID(),
    name: name.trim(),
    calories: parseInt(calories) || 0,
    protein: parseFloat(protein) || 0,
    carbs: parseFloat(carbs) || 0,
    fat: parseFloat(fat) || 0,
    time: time || undefined,
    isPittaFriendly: pitta || undefined,
    mealType,
  })

  const handleLog = async () => {
    if (!canSave) return
    setSaving(true)
    await persistEntry(date, isTrainingDay, buildEntry())
    onClose()
  }

  const handleSaveTemplate = async () => {
    if (!name.trim()) return
    await db.savedMeals.add({
      name: name.trim(),
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      isPittaFriendly: pitta || undefined,
    })
  }

  const handleQuickAdd = async (meal: SavedMeal) => {
    await persistEntry(date, isTrainingDay, {
      id: crypto.randomUUID(),
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      isPittaFriendly: meal.isPittaFriendly,
      mealType,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-t-[4px] p-4 space-y-3 max-h-[85vh] overflow-y-auto" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-widest" style={{ color: '#d4d4d4' }}>Add Meal</p>
          <button onClick={onClose}><X size={14} style={{ color: '#555555' }} /></button>
        </div>

        {/* Meal type selector */}
        <div className="flex gap-1">
          {MEAL_TYPES.map(mt => (
            <button
              key={mt}
              onClick={() => setMealType(mt)}
              className="flex-1 py-1.5 rounded-[2px] text-[9px] uppercase tracking-widest transition-colors"
              style={mealType === mt
                ? { background: '#2a2a2a', color: '#d4d4d4', border: '1px solid #3a3a3a' }
                : { background: 'transparent', color: '#3a3a3a', border: '1px solid #1a1a1a' }
              }
            >
              {mt}
            </button>
          ))}
        </div>

        {/* Custom / Saved tabs */}
        <div className="flex gap-4 border-b" style={{ borderColor: '#1a1a1a' }}>
          {(['custom', 'saved'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="pb-2 text-[10px] uppercase tracking-widest transition-colors"
              style={tab === t
                ? { color: '#d4d4d4', borderBottom: '1px solid #d4d4d4' }
                : { color: '#3a3a3a' }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'custom' && (
          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Food / Meal *</label>
              <input
                className="input w-full"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Chicken rice bowl"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Calories (kcal)</label>
                <input type="number" className="input w-full" value={calories} onChange={e => setCalories(e.target.value)} placeholder="450" min="0" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Time</label>
                <input type="time" className="input w-full" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: MACRO_CLR.protein }}>Protein (g)</label>
                <input type="number" className="input w-full" value={protein} onChange={e => setProtein(e.target.value)} placeholder="40" min="0" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: MACRO_CLR.carbs }}>Carbs (g)</label>
                <input type="number" className="input w-full" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="50" min="0" />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: MACRO_CLR.fat }}>Fat (g)</label>
                <input type="number" className="input w-full" value={fat} onChange={e => setFat(e.target.value)} placeholder="15" min="0" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={pitta} onChange={e => setPitta(e.target.checked)} className="rounded-[2px]" />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: '#555555' }}>Pitta-friendly</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleLog}
                disabled={!canSave || saving}
                className="flex-1 py-2 rounded-[2px] text-[10px] uppercase tracking-widest disabled:opacity-30"
                style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}
              >
                {saving ? 'Logging…' : 'Log Meal'}
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!name.trim()}
                title="Save as template"
                className="px-3 py-2 rounded-[2px] disabled:opacity-30"
                style={{ border: '1px solid #2a2a2a', color: '#555555' }}
              >
                <Star size={12} />
              </button>
            </div>
          </div>
        )}

        {tab === 'saved' && (
          <div className="space-y-1.5">
            {savedMeals.length === 0 && (
              <p className="text-[11px] text-center py-4" style={{ color: '#333333' }}>
                No saved meals. Log a meal and tap ★ to save it.
              </p>
            )}
            {savedMeals.map(meal => (
              <div key={meal.id} className="flex items-center gap-2 px-3 py-2.5 rounded-[2px]" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px]" style={{ color: '#d4d4d4' }}>{meal.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#555555' }}>
                    {meal.calories}kcal · <span style={{ color: MACRO_CLR.protein }}>{meal.protein}p</span> · <span style={{ color: MACRO_CLR.carbs }}>{meal.carbs}c</span> · <span style={{ color: MACRO_CLR.fat }}>{meal.fat}f</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleQuickAdd(meal)}
                    className="px-2 py-1 rounded-[2px] text-[9px] uppercase tracking-widest"
                    style={{ border: '1px solid #2a2a2a', color: '#d4d4d4' }}
                  >
                    Add
                  </button>
                  <button onClick={() => db.savedMeals.delete(meal.id!)} aria-label="Delete saved meal">
                    <Trash2 size={11} style={{ color: '#3a3a3a' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MealSection ─────────────────────────────────────────────────────────────

interface MealSectionProps {
  type: MealType
  entries: TypedEntry[]
  logId?: number
  allEntries: TypedEntry[]
  onAdd: (type: MealType) => void
}

function MealSection({ type, entries, logId, allEntries, onAdd }: MealSectionProps) {
  const sectionCals = entries.reduce((acc, m) => acc + (m.calories ?? 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>{type}</span>
          {sectionCals > 0 && (
            <span className="text-[10px]" style={{ color: '#555555' }}>{sectionCals} kcal</span>
          )}
        </div>
        <button
          onClick={() => onAdd(type)}
          className="flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-1 rounded-[2px]"
          style={{ border: '1px solid #1a1a1a', color: '#555555' }}
        >
          <Plus size={9} /> Add
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="py-1.5 text-[10px]" style={{ color: '#2a2a2a' }}>—</div>
      ) : (
        <div className="space-y-1">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center gap-2 px-2.5 py-2 rounded-[2px]" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px]" style={{ color: '#d4d4d4' }}>{entry.name}</span>
                  {entry.isPittaFriendly && (
                    <span className="text-[9px] px-1 rounded-[2px]" style={{ background: '#0d2a1a', color: '#34d399' }}>pitta</span>
                  )}
                </div>
                <div className="text-[10px] mt-0.5 flex flex-wrap gap-1" style={{ color: '#555555' }}>
                  <span>{entry.calories}kcal</span>
                  {(entry.protein ?? 0) > 0 && <span style={{ color: MACRO_CLR.protein }}>{entry.protein}p</span>}
                  {(entry.carbs ?? 0) > 0 && <span style={{ color: MACRO_CLR.carbs }}>{entry.carbs}c</span>}
                  {(entry.fat ?? 0) > 0 && <span style={{ color: MACRO_CLR.fat }}>{entry.fat}f</span>}
                  {entry.time && <span style={{ color: '#3a3a3a' }}>{entry.time}</span>}
                </div>
              </div>
              {logId !== undefined && (
                <button
                  onClick={() => dropEntry(logId, entry.id, allEntries)}
                  aria-label="Remove entry"
                  className="shrink-0"
                >
                  <Trash2 size={11} style={{ color: '#3a3a3a' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Nutrition() {
  const { isTrainingDay, toggleTrainingDay } = useNutritionStore()
  const targets = isTrainingDay ? PITTA_NUTRITION.trainingDay : PITTA_NUTRITION.restDay

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [sheetMealType, setSheetMealType] = useState<MealType>('breakfast')
  const [showSheet, setShowSheet] = useState(false)
  const isToday = date === today

  const log = useLiveQuery(
    () => db.nutritionLogs.where('date').equals(date).first(),
    [date]
  )
  const savedMeals = useLiveQuery(() => db.savedMeals.toArray(), []) ?? []

  const entries = (log?.meals ?? []) as TypedEntry[]
  const { totalProtein, totalCarbs, totalFat, totalCalories } = sumMacros(entries)

  function openSheet(type: MealType) {
    setSheetMealType(type)
    setShowSheet(true)
  }

  return (
    <div className="page-container space-y-4">
      {/* Header */}
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
          {isTrainingDay ? 'Training' : 'Rest'}
        </button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setDate(d => shiftDate(d, -1))}
          className="p-1.5 rounded-[2px]"
          style={{ border: '1px solid #1a1a1a' }}
        >
          <ChevronLeft size={14} style={{ color: '#555555' }} />
        </button>
        <span className="text-[12px]" style={{ color: isToday ? '#d4d4d4' : '#888888' }}>
          {isToday ? 'Today' : date}
        </span>
        <button
          onClick={() => setDate(d => shiftDate(d, 1))}
          disabled={isToday}
          className="p-1.5 rounded-[2px] disabled:opacity-30"
          style={{ border: '1px solid #1a1a1a' }}
        >
          <ChevronRight size={14} style={{ color: '#555555' }} />
        </button>
      </div>

      {/* Macro summary */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardHeader label="Macros" />
          <span className="text-[16px]" style={{ color: totalCalories > 0 ? '#d4d4d4' : '#2a2a2a' }}>
            {totalCalories} <span className="text-[10px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>kcal</span>
          </span>
        </div>
        <div className="space-y-3">
          <MacroBar label="Protein" value={totalProtein} max={targets.protein.max} color={MACRO_CLR.protein} />
          <MacroBar label="Carbs" value={totalCarbs} max={targets.carbs.max} color={MACRO_CLR.carbs} />
          <MacroBar label="Fat" value={totalFat} max={targets.fat.max} color={MACRO_CLR.fat} />
        </div>
        <div className="mt-3 text-[10px] border-l pl-3" style={{ color: '#3a3a3a', borderColor: '#2a2a2a' }}>
          {targets.ayurvedicNote}
        </div>
      </Card>

      {/* Meal sections */}
      <Card>
        <div className="space-y-4 divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {MEAL_TYPES.map((mt, i) => (
            <div key={mt} className={i > 0 ? 'pt-4' : ''} style={i > 0 ? { borderTopColor: '#1a1a1a' } : {}}>
              <MealSection
                type={mt}
                entries={entries.filter(e => e.mealType === mt)}
                logId={log?.id}
                allEntries={entries}
                onAdd={openSheet}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Pitta favor foods */}
      <Card>
        <CardHeader label="Pitta-Favor Foods" />
        <div className="flex flex-wrap gap-1.5">
          {PITTA_NUTRITION.favorFoods.map((food: string) => (
            <span key={food} className="text-[11px] border border-noir-border rounded-[2px] px-2 py-0.5 text-noir-muted">
              {food}
            </span>
          ))}
        </div>
      </Card>

      {/* Add meal sheet */}
      {showSheet && (
        <AddMealSheet
          date={date}
          isTrainingDay={isTrainingDay}
          savedMeals={savedMeals}
          initialMealType={sheetMealType}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  )
}
