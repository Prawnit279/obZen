/**
 * Speech Recognition — types shared across the speech module.
 * Implementation: Web Speech API, no library, no server.
 */

export type SpeechIntent =
  | { type: 'ADD_CALENDAR_EVENT'; title: string; date: string; time?: string; category?: string }
  | { type: 'ADD_JAM_SESSION';    date: string; time?: string; venue?: string; notes?: string }
  | { type: 'ADD_MEETING';        title: string; date: string; time?: string; attendees?: string[] }
  | { type: 'SET_REMINDER';       text: string; date: string; time?: string }
  | { type: 'OPEN_MODULE';        module: string }
  | { type: 'UNKNOWN';            transcript: string }

export interface SpeechResult {
  transcript: string
  confidence: number
  intent: SpeechIntent
}

export interface SpeechActionResult {
  success: boolean
  message: string
  requiresConfirmation?: boolean
  navigateTo?: string
}
