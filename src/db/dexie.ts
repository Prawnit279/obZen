import Dexie, { type EntityTable } from 'dexie'

// --- Workout ---
export interface WorkoutSession {
  id?: number
  date: string
  dayLabel: string
  duration?: number
  notes?: string
  completedAt?: string
}

export interface ExerciseLog {
  id?: number
  sessionId: number
  exerciseId: string
  exerciseName: string
  date: string
  sets: SetLog[]
  injuryFlag?: boolean
  skipped?: boolean
}

export interface SetLog {
  setNumber: number
  weight: string
  reps: number
  isWarmup: boolean
  completed: boolean
}

// --- Drum ---
export interface DrumSession {
  id?: number
  date: string
  focusArea: string
  duration: number
  notes?: string
  bpmAchieved?: number
  bookRef?: string
  completedAt?: string
}

export interface RudimentLog {
  id?: number
  sessionId: number
  rudimentId: string
  bpm: number
  date: string
  notes?: string
}

export interface Song {
  id?: number
  title: string
  artist: string
  bpm?: number
  timeSignature?: string
  status: 'learning' | 'ready' | 'performed'
  purpose: 'jam' | 'recording' | 'cover' | 'original'
  notes?: string
  addedAt: string
}

export interface JamSession {
  id?: number
  date: string
  time: string
  venue: string
  bandmates: string[]
  setlist: number[]
  preCeck: string[]
  postNotes?: string
  status: 'upcoming' | 'done' | 'cancelled'
}

// --- Calendar ---
export interface CalendarEvent {
  id?: number
  title: string
  date: string
  startTime?: string
  endTime?: string
  category: 'workout' | 'drum' | 'work' | 'meeting' | 'jam' | 'personal' | 'ayurveda' | 'yoga'
  notes?: string
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly'
  linkedModuleId?: number
  linkedModuleType?: string
}

// --- Nutrition ---
export interface NutritionLog {
  id?: number
  date: string
  isTrainingDay: boolean
  meals: MealEntry[]
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalCalories: number
  notes?: string
}

export interface MealEntry {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  time?: string
  isPittaFriendly?: boolean
}

export interface SavedMeal {
  id?: number
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  isPittaFriendly?: boolean
  tags?: string[]
}

// --- Tasks ---
export interface Board {
  id?: number
  name: string
  category: 'work' | 'creative' | 'personal' | 'courses'
  color?: string
}

export interface Task {
  id?: number
  boardId: number
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  tags?: string[]
  notes?: string
  subTasks?: SubTask[]
  createdAt: string
  completedAt?: string
}

export interface SubTask {
  id: string
  title: string
  done: boolean
}

// --- Meetings ---
export interface Meeting {
  id?: number
  date: string
  time: string
  title: string
  attendees?: string[]
  agenda?: string[]
  notes?: string
  status: 'open' | 'in-progress' | 'done'
}

export interface ActionItem {
  id?: number
  meetingId: number
  title: string
  owner?: string
  dueDate?: string
  status: 'open' | 'in-progress' | 'done'
}

// --- Workout Day Session (v2 inline logging) ---
export interface LoggedSet {
  setNumber: number
  weight: number
  reps: number
  unit: 'lbs' | 'kg'
  timestamp: string
}

export interface ExerciseSessionState {
  exerciseId: string
  status: 'pending' | 'complete' | 'skipped'
  sets: LoggedSet[]
  note?: string
  addedFrom?: 'Day 1' | 'Day 2' | 'Day 3' | 'library' | 'custom'
}

export interface WorkoutDaySession {
  id?: number
  date: string
  dayLabel: 'Day 1' | 'Day 2' | 'Day 3'
  exercises: ExerciseSessionState[]
  order: string[] // exerciseId ordering
}

// --- Drum Library ---
export type DrumBookCategory =
  | 'Technique' | 'Independence' | 'Rudiments' | 'Grooves'
  | 'Reading' | 'Bass Drum' | 'Style' | 'Theory' | 'Other'

export interface DrumBook {
  id?: number
  title: string
  author: string
  category: DrumBookCategory
  tags?: string[]
  dateAdded: string
  pageCount?: number
  fileSize?: number    // bytes
  type: 'uploaded' | 'indexed'
}

export interface DrumNotation {
  id?: number
  bookId: number
  lessonId?: string
  pageRef?: number
  title: string
  imageData: string  // base64 clipped image
  dateAdded: string
}

export interface DrumPDF {
  id?: number
  bookId: number
  data: ArrayBuffer
  mimeType: string
  size: number
}

// --- Image Cache ---
export interface CachedImage {
  id?: number
  key: string           // poseName | rudimentId | exerciseName | category | planet
  imageData: string     // base64
  generatedAt: string
  size: number
  type: 'yoga' | 'rudiment' | 'exercise' | 'ayurveda' | 'vedic' | 'progress'
}

// --- Yoga ---
export interface YogaSession {
  id?: number
  date: string
  sequenceId: string
  sequenceName: string
  duration: number
  posesDone: string[]
  notes?: string
}

// --- App ---
export interface CheckIn {
  id?: number
  date: string
  mood: 1 | 2 | 3 | 4 | 5
  energy: 1 | 2 | 3 | 4 | 5
  soreness: 'none' | 'mild' | 'moderate' | 'high'
  forearmFatigue: boolean
  notes?: string
}

export interface ProgressPhoto {
  id?: number
  date: string
  dataUrl: string
  weight?: number
  notes?: string
}

export interface AyurvedaLog {
  id?: number
  date: string
  completedItems: string[]
  pittaSymptoms?: string[]
  notes?: string
}

export interface VedicLog {
  id?: number
  date: string
  planet: string
  practice: string
  mantra?: string
  mantraCount?: number
  notes?: string
}

// --- Dexie DB ---
export class ObzenDB extends Dexie {
  workoutSessions!: EntityTable<WorkoutSession, 'id'>
  workoutDaySessions!: EntityTable<WorkoutDaySession, 'id'>
  exerciseLogs!: EntityTable<ExerciseLog, 'id'>
  drumSessions!: EntityTable<DrumSession, 'id'>
  rudimentLogs!: EntityTable<RudimentLog, 'id'>
  songs!: EntityTable<Song, 'id'>
  jamSessions!: EntityTable<JamSession, 'id'>
  calendarEvents!: EntityTable<CalendarEvent, 'id'>
  nutritionLogs!: EntityTable<NutritionLog, 'id'>
  savedMeals!: EntityTable<SavedMeal, 'id'>
  boards!: EntityTable<Board, 'id'>
  tasks!: EntityTable<Task, 'id'>
  meetings!: EntityTable<Meeting, 'id'>
  actionItems!: EntityTable<ActionItem, 'id'>
  yogaSessions!: EntityTable<YogaSession, 'id'>
  checkIns!: EntityTable<CheckIn, 'id'>
  progressPhotos!: EntityTable<ProgressPhoto, 'id'>
  ayurvedaLogs!: EntityTable<AyurvedaLog, 'id'>
  vedicLogs!: EntityTable<VedicLog, 'id'>
  drumBooks!: EntityTable<DrumBook, 'id'>
  drumNotations!: EntityTable<DrumNotation, 'id'>
  drumPDFs!: EntityTable<DrumPDF, 'id'>
  cachedImages!: EntityTable<CachedImage, 'id'>

  constructor() {
    super('obzen')
    this.version(1).stores({
      workoutSessions: '++id, date, dayLabel',
      exerciseLogs: '++id, sessionId, exerciseId, date',
      drumSessions: '++id, date, focusArea, duration',
      rudimentLogs: '++id, sessionId, rudimentId, date',
      songs: '++id, title, artist, status, purpose',
      jamSessions: '++id, date, status',
      calendarEvents: '++id, date, startTime, category, recurring',
      nutritionLogs: '++id, date',
      savedMeals: '++id, name',
      boards: '++id, name, category',
      tasks: '++id, boardId, status, dueDate, priority',
      meetings: '++id, date, title, status',
      actionItems: '++id, meetingId, status, dueDate',
      yogaSessions: '++id, date, sequenceId',
      checkIns: '++id, date',
      progressPhotos: '++id, date',
      ayurvedaLogs: '++id, date',
      vedicLogs: '++id, date, planet',
    })
    this.version(2).stores({
      workoutSessions: '++id, date, dayLabel',
      workoutDaySessions: '++id, date, dayLabel',
      exerciseLogs: '++id, sessionId, exerciseId, date',
      drumSessions: '++id, date, focusArea, duration',
      rudimentLogs: '++id, sessionId, rudimentId, date',
      songs: '++id, title, artist, status, purpose',
      jamSessions: '++id, date, status',
      calendarEvents: '++id, date, startTime, category, recurring',
      nutritionLogs: '++id, date',
      savedMeals: '++id, name',
      boards: '++id, name, category',
      tasks: '++id, boardId, status, dueDate, priority',
      meetings: '++id, date, title, status',
      actionItems: '++id, meetingId, status, dueDate',
      yogaSessions: '++id, date, sequenceId',
      checkIns: '++id, date',
      progressPhotos: '++id, date',
      ayurvedaLogs: '++id, date',
      vedicLogs: '++id, date, planet',
    })
    this.version(3).stores({
      workoutSessions: '++id, date, dayLabel',
      workoutDaySessions: '++id, date, dayLabel',
      exerciseLogs: '++id, sessionId, exerciseId, date',
      drumSessions: '++id, date, focusArea, duration',
      rudimentLogs: '++id, sessionId, rudimentId, date',
      songs: '++id, title, artist, status, purpose',
      jamSessions: '++id, date, status',
      calendarEvents: '++id, date, startTime, category, recurring',
      nutritionLogs: '++id, date',
      savedMeals: '++id, name',
      boards: '++id, name, category',
      tasks: '++id, boardId, status, dueDate, priority',
      meetings: '++id, date, title, status',
      actionItems: '++id, meetingId, status, dueDate',
      yogaSessions: '++id, date, sequenceId',
      checkIns: '++id, date',
      progressPhotos: '++id, date',
      ayurvedaLogs: '++id, date',
      vedicLogs: '++id, date, planet',
      drumBooks: '++id, title, author, category, dateAdded, type',
      drumNotations: '++id, bookId, lessonId, dateAdded',
      drumPDFs: '++id, bookId',
      cachedImages: '++id, key, type, generatedAt',
    })
  }
}

export const db = new ObzenDB()
