import type { MuscleGroup } from './obzen-program'

export type ExerciseCategory = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  secondaryMuscles?: MuscleGroup[]
  category: ExerciseCategory
  drummerNote?: string
  pittaNote?: string
}

export const EXERCISES: Exercise[] = [
  // LEGS
  { id: 'barbell-squat', name: 'Barbell Squat', muscleGroup: 'legs', category: 'barbell' },
  { id: 'zercher-squat', name: 'Zercher Squat', muscleGroup: 'legs', category: 'barbell' },
  { id: 'front-squat', name: 'Front Squat', muscleGroup: 'legs', category: 'barbell' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'legs', category: 'dumbbell' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'legs', category: 'dumbbell' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', category: 'machine' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'legs', category: 'machine' },
  { id: 'leg-curl', name: 'Leg Curl Machine', muscleGroup: 'legs', category: 'machine' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'legs', category: 'barbell' },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'legs', secondaryMuscles: ['back'], category: 'barbell' },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', muscleGroup: 'legs', category: 'barbell' },
  { id: 'walking-lunges', name: 'Walking Lunges', muscleGroup: 'legs', category: 'dumbbell' },
  { id: 'reverse-lunge', name: 'Reverse Lunge', muscleGroup: 'legs', category: 'dumbbell' },
  { id: 'box-step-ups', name: 'Box Step-ups', muscleGroup: 'legs', category: 'dumbbell' },
  { id: 'calf-raises-standing', name: 'Standing Calf Raises', muscleGroup: 'legs', category: 'machine' },
  { id: 'calf-raises-seated', name: 'Seated Calf Raises', muscleGroup: 'legs', category: 'machine' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'legs', category: 'barbell' },
  { id: 'glute-bridge', name: 'Glute Bridge', muscleGroup: 'legs', category: 'bodyweight' },

  // BACK
  { id: 'weighted-pullups', name: 'Weighted Pull-ups', muscleGroup: 'back', secondaryMuscles: ['arms'], category: 'bodyweight', drummerNote: 'High forearm load — reduce if wrist fatigue flagged' },
  { id: 'bw-pullups', name: 'BW Pull-ups', muscleGroup: 'back', secondaryMuscles: ['arms'], category: 'bodyweight', drummerNote: 'Moderate forearm load — monitor grip endurance' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', category: 'cable' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', secondaryMuscles: ['arms'], category: 'barbell' },
  { id: 'db-row', name: 'DB Row', muscleGroup: 'back', category: 'dumbbell' },
  { id: 'cable-row', name: 'Cable Row', muscleGroup: 'back', category: 'cable' },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'back', category: 'barbell' },
  { id: 'chest-supported-row', name: 'Chest-Supported Row', muscleGroup: 'back', category: 'machine' },
  { id: 'meadows-row', name: 'Meadows Row', muscleGroup: 'back', category: 'barbell' },
  { id: 'trap-raises', name: 'Trap Raises', muscleGroup: 'back', secondaryMuscles: ['shoulders'], category: 'dumbbell' },
  { id: 'face-pulls', name: 'Face Pulls', muscleGroup: 'back', secondaryMuscles: ['shoulders'], category: 'cable' },

  // SHOULDERS
  { id: 'barbell-ohp', name: 'Shoulder Press (Bar)', muscleGroup: 'shoulders', secondaryMuscles: ['arms'], category: 'barbell' },
  { id: 'db-shoulder-press', name: 'DB Shoulder Press', muscleGroup: 'shoulders', category: 'dumbbell' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'shoulders', category: 'dumbbell' },
  { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscleGroup: 'shoulders', category: 'machine' },
  { id: 'db-lateral-raises', name: 'DB Lateral Raises', muscleGroup: 'shoulders', category: 'dumbbell' },
  { id: 'cable-lateral-raises', name: 'Cable Lateral Raises', muscleGroup: 'shoulders', category: 'cable' },
  { id: 'rear-delt-raises', name: 'Rear Delt Raises', muscleGroup: 'shoulders', category: 'dumbbell' },
  { id: 'upright-row', name: 'Upright Row', muscleGroup: 'shoulders', category: 'barbell' },
  { id: 'db-shrugs', name: 'DB Shrugs', muscleGroup: 'shoulders', category: 'dumbbell' },
  { id: 'cable-upright-row', name: 'Cable Upright Row', muscleGroup: 'shoulders', category: 'cable' },

  // CHEST
  { id: 'bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'arms'], category: 'barbell' },
  { id: 'incline-bench', name: 'Incline Bench Press', muscleGroup: 'chest', category: 'barbell' },
  { id: 'db-chest-press', name: 'DB Chest Press', muscleGroup: 'chest', category: 'dumbbell' },
  { id: 'incline-db-press', name: 'Incline DB Press', muscleGroup: 'chest', category: 'dumbbell' },
  { id: 'cable-fly', name: 'Cable Fly', muscleGroup: 'chest', category: 'cable' },
  { id: 'pec-deck', name: 'Pec Deck', muscleGroup: 'chest', category: 'machine' },
  { id: 'weighted-pushups', name: 'Weighted Push-ups', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'arms'], category: 'bodyweight' },
  { id: 'bw-pushups', name: 'BW Push-ups', muscleGroup: 'chest', category: 'bodyweight' },
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'chest', category: 'cable' },
  { id: 'dips', name: 'Dips', muscleGroup: 'chest', secondaryMuscles: ['arms'], category: 'bodyweight' },

  // ARMS
  { id: 'barbell-curls', name: 'Barbell Curls', muscleGroup: 'arms', category: 'barbell', drummerNote: 'Bicep load — monitor if wrist/forearm fatigue present' },
  { id: 'hammer-curls', name: 'Hammer Curls', muscleGroup: 'arms', category: 'dumbbell', drummerNote: 'Forearm/brachialis load — skip if forearm fatigue flagged' },
  { id: 'cable-bicep-curls', name: 'Cable Bicep Curls', muscleGroup: 'arms', category: 'cable', drummerNote: 'Moderate forearm engagement' },
  { id: 'preacher-curls', name: 'Preacher Curls', muscleGroup: 'arms', category: 'machine' },
  { id: 'concentration-curls', name: 'Concentration Curls', muscleGroup: 'arms', category: 'dumbbell' },
  { id: 'cable-triceps', name: 'Cable Triceps Pushdown', muscleGroup: 'arms', category: 'cable' },
  { id: 'overhead-tricep-ext', name: 'Overhead Tricep Extension', muscleGroup: 'arms', category: 'dumbbell' },
  { id: 'skull-crushers', name: 'Skull Crushers', muscleGroup: 'arms', category: 'barbell' },
  { id: 'close-grip-bench', name: 'Close-Grip Bench', muscleGroup: 'arms', secondaryMuscles: ['chest'], category: 'barbell' },
  { id: 'tricep-dips', name: 'Tricep Dips', muscleGroup: 'arms', category: 'bodyweight' },
  { id: 'reverse-curls', name: 'Reverse Curls', muscleGroup: 'arms', category: 'barbell', drummerNote: 'High forearm engagement — skip if wrist fatigue flagged' },
  { id: 'wrist-curls', name: 'Wrist Curls', muscleGroup: 'arms', category: 'dumbbell', drummerNote: 'Direct wrist load — avoid when drumming fatigue present' },

  // CORE
  { id: 'hanging-leg-raises', name: 'Hanging Leg Raises', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'bar-knee-raises', name: 'Bar Knee Raises', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'russian-twists', name: 'Russian Twists', muscleGroup: 'core', category: 'dumbbell' },
  { id: 'plank', name: 'Plank', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'dead-bug', name: 'Dead Bug', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'ab-wheel', name: 'Ab Wheel', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'core', category: 'cable' },
  { id: 'bicycle-crunches', name: 'Bicycle Crunches', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'dragon-flag', name: 'Dragon Flag', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'pallof-press', name: 'Pallof Press', muscleGroup: 'core', category: 'cable' },
  { id: 'side-plank', name: 'Side Plank', muscleGroup: 'core', category: 'bodyweight' },
  { id: 'v-ups', name: 'V-Ups', muscleGroup: 'core', category: 'bodyweight' },
]

export function getExercisesByMuscle(muscleGroup: MuscleGroup): Exercise[] {
  return EXERCISES.filter(e => e.muscleGroup === muscleGroup)
}

export function searchExercises(query: string): Exercise[] {
  const q = query.toLowerCase()
  return EXERCISES.filter(e => e.name.toLowerCase().includes(q))
}
