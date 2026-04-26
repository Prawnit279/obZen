export interface ProgramExercise {
  name: string
  warmup: string
  working: string
  muscle: 'legs' | 'back' | 'shoulders' | 'arms' | 'chest' | 'core'
}

export interface ProgramDay {
  focus: string
  exercises: ProgramExercise[]
}

export const OBZEN_PROGRAM: Record<string, ProgramDay> = {
  'Day 1': {
    focus: 'Pull / Legs / Arms',
    exercises: [
      { name: 'Leg Press', warmup: '45×10, 110×10', working: '140×8×2', muscle: 'legs' },
      { name: 'Weighted Pull-ups', warmup: 'BW×5', working: '+25lbs×5×6', muscle: 'back' },
      { name: 'Barbell Row', warmup: 'light', working: '20×10×3', muscle: 'back' },
      { name: 'DB Lateral Raises', warmup: '10×10', working: '12×10×3', muscle: 'shoulders' },
      { name: 'Cable Bicep Curls', warmup: 'light', working: '30lbs×8×3', muscle: 'arms' },
      { name: 'Cable Triceps', warmup: 'light', working: '30lbs×10×3', muscle: 'arms' },
      { name: 'Standing Calf Raises', warmup: '40×15', working: '50lbs×15×3', muscle: 'legs' },
      { name: 'Bar Knee Raises', warmup: '—', working: 'BW×10×3', muscle: 'core' },
      { name: 'Leg Extension', warmup: '30×10, 60×10', working: '80×10×1', muscle: 'legs' },
      { name: 'Barbell Squat', warmup: 'BW×10, 20×5, 40×5', working: '50×5×2', muscle: 'legs' },
    ],
  },
  'Day 2': {
    focus: 'Zercher / Quad / Shoulders',
    exercises: [
      { name: 'Zercher Squat', warmup: 'BW×8, 20×10', working: '40×8×2, 50×5×2', muscle: 'legs' },
      { name: 'Barbell Squat', warmup: 'BW×5, 50×5, 70×5', working: '90×5×3', muscle: 'legs' },
      { name: 'Leg Press', warmup: '45×10, 110×10', working: '130×8×3', muscle: 'legs' },
      { name: 'Leg Extension', warmup: '60×8, 90×8', working: '100×8×2, 110×8×1', muscle: 'legs' },
      { name: 'Shoulder Press (Bar)', warmup: '40×8, 65×8', working: '80×8×2', muscle: 'shoulders' },
      { name: 'DB Shoulder Press', warmup: '25×10', working: '30×10×3, 35×10×2', muscle: 'shoulders' },
      { name: 'Weighted Pull-ups', warmup: 'BW×5', working: '+25lbs×5×6', muscle: 'back' },
      { name: 'Weighted Push-ups', warmup: 'BW×10', working: '10lbs×12×3', muscle: 'chest' },
      { name: 'Russian Twists', warmup: '—', working: '15lbs×10×3', muscle: 'core' },
      { name: 'Hanging Leg Raises', warmup: '—', working: 'BW×10×3', muscle: 'core' },
    ],
  },
  'Day 3': {
    focus: 'Posterior / Delts / Forearms / Calves',
    exercises: [
      { name: 'Deadlift', warmup: 'BW×5, 20×5, 50×5, 70×5', working: '90×5×3', muscle: 'legs' },
      { name: 'Romanian Deadlift', warmup: 'light', working: '50lbs×8×3', muscle: 'legs' },
      { name: 'DB Shoulder Press', warmup: '25×10', working: '30×10×3, 35×10×2', muscle: 'shoulders' },
      { name: 'DB Lateral Raises', warmup: '10×10', working: '12×10×3', muscle: 'shoulders' },
      { name: 'Rear Delt Raises', warmup: 'light', working: '10-12lbs×12×3', muscle: 'shoulders' },
      { name: 'Weighted Pull-ups', warmup: 'BW×5', working: '+25lbs×5×3', muscle: 'back' },
      { name: 'Hammer Curls', warmup: '25×10', working: '35lbs×10×3', muscle: 'arms' },
      { name: 'Standing Calf Raises', warmup: '40×15', working: '50lbs×15×3', muscle: 'legs' },
      { name: 'Hanging Leg Raises', warmup: '—', working: 'BW×10×3', muscle: 'core' },
    ],
  },
}

export type MuscleGroup = 'legs' | 'back' | 'shoulders' | 'arms' | 'chest' | 'core'

export const SWAP_OPTIONS: Record<MuscleGroup, string[]> = {
  legs: [
    'Barbell Squat', 'Zercher Squat', 'Leg Press', 'Leg Extension',
    'Romanian Deadlift', 'Walking Lunges', 'Standing Calf Raises',
    'Box Step-ups', 'Leg Curl Machine', 'Goblet Squat', 'Bulgarian Split Squat',
  ],
  shoulders: [
    'Barbell Shoulder Press', 'DB Shoulder Press', 'DB Lateral Raises',
    'Rear Delt Raises', 'Trap Raises', 'Face Pulls', 'Arnold Press',
    'Machine Shoulder Press', 'Cable Lateral Raises', 'Upright Row',
  ],
  back: [
    'Weighted Pull-ups', 'BW Pull-ups', 'Barbell Row', 'DB Row',
    'Trap Raises', 'Cable Row', 'Lat Pulldown', 'T-Bar Row',
    'Chest-Supported Row', 'Meadows Row',
  ],
  chest: [
    'Weighted Push-ups', 'BW Push-ups', 'DB Chest Press',
    'Cable Fly', 'Barbell Bench Press', 'Incline DB Press',
    'Cable Crossover', 'Pec Deck',
  ],
  arms: [
    'Barbell Curls', 'DB Hammer Curls', 'Cable Bicep Curls',
    'Cable Triceps', 'Overhead Tricep Extension', 'Skull Crushers',
    'Preacher Curls', 'Concentration Curls', 'Dips', 'Close-Grip Bench',
  ],
  core: [
    'Hanging Leg Raises', 'Bar Knee Raises', 'Russian Twists',
    'Plank', 'Dead Bug', 'Ab Wheel', 'Cable Crunch',
    'Bicycle Crunches', 'Dragon Flag', 'Pallof Press',
  ],
}

export const PULL_HEAVY_EXERCISES = [
  'Weighted Pull-ups', 'BW Pull-ups', 'Lat Pulldown', 'Cable Row',
  'Barbell Row', 'DB Row', 'T-Bar Row',
]

export const FOREARM_LOAD_EXERCISES = [
  'Hammer Curls', 'Cable Bicep Curls', 'Barbell Curls', 'Wrist Curls',
  'Reverse Curls', 'Farmer Carries',
]
