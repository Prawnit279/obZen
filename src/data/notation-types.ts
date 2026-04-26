export type DrumPitch =
  | 'snare' | 'kick' | 'hihat' | 'ride' | 'crash' | 'tom1' | 'tom2' | 'floor'

export type NoteDuration = 'w' | 'h' | 'q' | '8' | '16' | '32'

export interface NotationNote {
  pitch: DrumPitch
  duration: NoteDuration
  sticking?: 'R' | 'L'
  accent?: boolean
  flam?: boolean
  drag?: boolean
  rest?: boolean
}

export interface Measure {
  notes: NotationNote[]
}

export interface NotationData {
  id: string
  lessonId: string
  title: string
  timeSignature: { beats: number; value: number }
  tempo: number
  measures: Measure[]
}

// Pitch → VexFlow key string mapping (5-line percussion staff positions)
export const PITCH_KEYS: Record<DrumPitch, string> = {
  snare:  'c/5',
  kick:   'f/4',
  hihat:  'g/5',
  ride:   'f/5',
  crash:  'a/5',
  tom1:   'a/4',
  tom2:   'g/4',
  floor:  'd/4',
}

// Pitches that use X noteheads
export const X_NOTEHEAD_PITCHES: DrumPitch[] = ['hihat', 'ride', 'crash']
