import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { ExerciseSessionState, LoggedSet } from '@/db/dexie'
import type { ProgramExercise } from '@/data/obzen-program'
import { ExerciseCard } from './ExerciseCard'

interface Props {
  exercises: ExerciseSessionState[]
  programMap: Record<string, ProgramExercise>
  forearmFatigue: boolean
  dayLabel: 'Day 1' | 'Day 2' | 'Day 3'
  onReorder: (newOrder: string[]) => void
  onStatusChange: (exerciseId: string, status: ExerciseSessionState['status']) => void
  onAddSet: (exerciseId: string, set: LoggedSet) => void
  onUpdateSet: (exerciseId: string, index: number, set: LoggedSet) => void
  onRemoveSet: (exerciseId: string, index: number) => void
}

export function SortableExerciseList({
  exercises,
  programMap,
  forearmFatigue,
  dayLabel,
  onReorder,
  onStatusChange,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = exercises.findIndex(e => e.exerciseId === active.id)
    const newIndex = exercises.findIndex(e => e.exerciseId === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(exercises, oldIndex, newIndex)
    onReorder(reordered.map(e => e.exerciseId))
  }

  const ids = exercises.map(e => e.exerciseId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Grabbed exercise ${active.id}. Use arrow keys to move.`,
          onDragOver: ({ active, over }) =>
            over ? `Exercise ${active.id} is over position ${over.id}.` : '',
          onDragEnd: ({ active, over }) =>
            over
              ? `Exercise ${active.id} dropped at position ${over.id}.`
              : `Exercise ${active.id} dropped. Sort cancelled.`,
          onDragCancel: ({ active }) => `Drag of exercise ${active.id} cancelled.`,
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {exercises.map(ex => (
            <ExerciseCard
              key={ex.exerciseId}
              exerciseState={ex}
              programExercise={programMap[ex.exerciseId]}
              forearmFatigue={forearmFatigue}
              dayLabel={dayLabel}
              onStatusChange={status => onStatusChange(ex.exerciseId, status)}
              onAddSet={set => onAddSet(ex.exerciseId, set)}
              onUpdateSet={(i, set) => onUpdateSet(ex.exerciseId, i, set)}
              onRemoveSet={i => onRemoveSet(ex.exerciseId, i)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
