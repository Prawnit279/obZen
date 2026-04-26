/**
 * Speech Actions — formats confirmation messages for each intent type.
 * All data-creating intents return requiresConfirmation: true.
 * Navigation intents return navigateTo and execute immediately.
 * Actual Dexie writes happen in SpeechUI after user confirmation.
 */

import type { SpeechIntent, SpeechActionResult } from './speech-recognition'

function friendlyDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function friendlyTime(hhmm?: string): string {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const ampm  = h >= 12 ? 'PM' : 'AM'
  const hour  = h % 12 || 12
  const mins  = m > 0 ? `:${String(m).padStart(2, '0')}` : ''
  return ` · ${hour}${mins} ${ampm}`
}

export function executeSpeechIntent(intent: SpeechIntent): SpeechActionResult {
  switch (intent.type) {
    case 'ADD_JAM_SESSION': {
      const venuePart = intent.venue ? ` at ${intent.venue}` : ''
      return {
        success: true,
        requiresConfirmation: true,
        message: `Jam session ${friendlyDate(intent.date)}${friendlyTime(intent.time)}${venuePart}. Confirm?`,
      }
    }

    case 'ADD_MEETING': {
      return {
        success: true,
        requiresConfirmation: true,
        message: `Meeting "${intent.title}" ${friendlyDate(intent.date)}${friendlyTime(intent.time)}. Confirm?`,
      }
    }

    case 'ADD_CALENDAR_EVENT': {
      return {
        success: true,
        requiresConfirmation: true,
        message: `Event "${intent.title}" ${friendlyDate(intent.date)}${friendlyTime(intent.time)}. Confirm?`,
      }
    }

    case 'SET_REMINDER': {
      return {
        success: true,
        requiresConfirmation: true,
        message: `Reminder ${friendlyDate(intent.date)}${friendlyTime(intent.time)}. Confirm?`,
      }
    }

    case 'OPEN_MODULE': {
      const label = intent.module === '/' ? 'Dashboard' : intent.module.replace('/', '')
      return {
        success: true,
        message: `Opening ${label}`,
        navigateTo: intent.module,
      }
    }

    case 'UNKNOWN': {
      return {
        success: false,
        message: `Didn't understand: "${intent.transcript}". Try again.`,
      }
    }

    default:
      return { success: false, message: 'Unknown intent.' }
  }
}
