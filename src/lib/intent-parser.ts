/**
 * Intent Parser — converts raw speech transcript → typed SpeechIntent.
 * Pure functions, no side-effects, no imports from React.
 */

import type { SpeechIntent } from './speech-recognition'

// ── Patterns ──────────────────────────────────────────────────────────────────

const DATE_PATTERNS = {
  today:     /\btoday\b/i,
  tomorrow:  /\btomorrow\b/i,
  dayOfWeek: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  explicit:  /\b(\d{1,2})[/\-\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2})\b/i,
}

const TIME_PATTERNS = {
  explicit: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i,
  oclock:   /\b(\d{1,2})\s*o'?clock\b/i,
}

const INTENT = {
  jam:     /\b(jam|jam session|rehearsal|band practice)\b/i,
  meeting: /\b(meeting|call|sync|standup|catch up)\b/i,
  event:   /\b(schedule|add|create|set up|book)\b/i,
  remind:  /\b(remind|reminder|don't forget|remember)\b/i,
  open:    /\b(open|go to|show me|take me to)\b/i,
}

const FILLER_RE = /\b(schedule|add|create|set up|book|a|an|the|for|me|to|please|i want|i need|remind|reminder)\b/gi

// ── Helpers ───────────────────────────────────────────────────────────────────

function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function extractDate(t: string): string {
  if (DATE_PATTERNS.today.test(t)) return isoToday()

  if (DATE_PATTERNS.tomorrow.test(t)) {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }

  const dowMatch = DATE_PATTERNS.dayOfWeek.exec(t)
  if (dowMatch) {
    const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const target = DAYS.indexOf(dowMatch[1].toLowerCase())
    const d = new Date()
    let diff = target - d.getDay()
    if (diff <= 0) diff += 7
    d.setDate(d.getDate() + diff)
    return d.toISOString().slice(0, 10)
  }

  const explicitMatch = DATE_PATTERNS.explicit.exec(t)
  if (explicitMatch) {
    const MONTHS: Record<string, number> = {
      jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
      jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
    }
    const day = parseInt(explicitMatch[1], 10)
    const rawMonth = explicitMatch[2]
    const month = isNaN(parseInt(rawMonth, 10))
      ? (MONTHS[rawMonth.toLowerCase()] ?? 1)
      : parseInt(rawMonth, 10)
    const d = new Date()
    d.setMonth(month - 1, day)
    if (d < new Date()) d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().slice(0, 10)
  }

  return isoToday()
}

export function extractTime(t: string): string | undefined {
  const explicit = TIME_PATTERNS.explicit.exec(t)
  if (explicit) {
    let hours = parseInt(explicit[1], 10)
    const minutes = explicit[2] ? parseInt(explicit[2], 10) : 0
    const ampm = explicit[3]?.toLowerCase()
    if (ampm === 'pm' && hours !== 12) hours += 12
    if (ampm === 'am' && hours === 12) hours = 0
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const oclock = TIME_PATTERNS.oclock.exec(t)
  if (oclock) {
    const hours = parseInt(oclock[1], 10)
    return `${String(hours).padStart(2, '0')}:00`
  }

  return undefined
}

export function extractTitle(t: string, fallback: string): string {
  const cleaned = t
    .replace(INTENT.event, '')
    .replace(INTENT.meeting, '')
    .replace(INTENT.jam, '')
    .replace(DATE_PATTERNS.today, '')
    .replace(DATE_PATTERNS.tomorrow, '')
    .replace(DATE_PATTERNS.dayOfWeek, '')
    .replace(TIME_PATTERNS.explicit, '')
    .replace(TIME_PATTERNS.oclock, '')
    .replace(/\bwith\s+[\w\s,]+$/i, '')
    .replace(/\bat\s+[\w\s]+$/i, '')
    .replace(FILLER_RE, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || fallback
}

export function extractAttendees(t: string): string[] {
  const withMatch = /\bwith\s+([\w\s,]+?)(?:\s+(?:at|on|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d)|\s*$)/i.exec(t)
  if (!withMatch) return []
  return withMatch[1]
    .split(/\s*(?:,|and)\s*/i)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 40)
}

export function extractVenue(t: string): string | undefined {
  // "at the studio" / "at rehearsal room" — avoid "at 7pm"
  const atMatch = /\bat\s+(?:the\s+)?([\w\s]+?)(?:\s+(?:on|at\s+\d|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d)|$)/i.exec(t)
  if (atMatch && !/^\d/.test(atMatch[1].trim())) {
    const v = atMatch[1].trim()
    if (v.length > 1 && v.length < 50) return v
  }
  return undefined
}

type CalendarCategory = 'workout' | 'drum' | 'work' | 'meeting' | 'jam' | 'personal' | 'ayurveda' | 'yoga'

const CATEGORY_MAP: Array<[RegExp, CalendarCategory]> = [
  [/\b(workout|gym|train|lift|weights)\b/i,     'workout'],
  [/\b(drum|rehearsal|band|jam)\b/i,             'drum'],
  [/\b(meeting|call|sync|standup|catch up)\b/i,  'meeting'],
  [/\b(yoga|stretch|meditation)\b/i,             'yoga'],
  [/\b(ayurveda|herbs|ritual)\b/i,               'ayurveda'],
  [/\b(work|project|deadline|client)\b/i,        'work'],
]

export function extractCategory(t: string): string | undefined {
  for (const [pattern, cat] of CATEGORY_MAP) {
    if (pattern.test(t)) return cat
  }
  return undefined
}

const MODULE_MAP: Array<[RegExp, string]> = [
  [/\b(workout|gym|training|exercise)\b/i,   '/workout'],
  [/\b(drum|drum studio|music)\b/i,          '/drum'],
  [/\b(yoga|poses|breathing)\b/i,            '/yoga'],
  [/\b(calendar|schedule|events)\b/i,        '/calendar'],
  [/\b(nutrition|food|meal|diet)\b/i,        '/nutrition'],
  [/\b(projects|tasks|boards)\b/i,           '/projects'],
  [/\b(meetings?)\b/i,                       '/meetings'],
  [/\b(ayurveda|herbs)\b/i,                  '/ayurveda'],
  [/\b(vedic|astrology|remedies)\b/i,        '/vedic'],
  [/\b(settings|preferences)\b/i,            '/settings'],
  [/\b(home|dashboard|overview)\b/i,         '/'],
]

export function extractModule(t: string): string {
  for (const [pattern, route] of MODULE_MAP) {
    if (pattern.test(t)) return route
  }
  return '/'
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseIntent(transcript: string): SpeechIntent {
  const t = transcript.toLowerCase()

  if (INTENT.jam.test(t)) {
    return {
      type:  'ADD_JAM_SESSION',
      date:  extractDate(t),
      time:  extractTime(t),
      venue: extractVenue(t),
      notes: transcript,
    }
  }

  if (INTENT.meeting.test(t) && INTENT.event.test(t)) {
    return {
      type:      'ADD_MEETING',
      title:     extractTitle(t, 'Meeting'),
      date:      extractDate(t),
      time:      extractTime(t),
      attendees: extractAttendees(t),
    }
  }

  if (INTENT.event.test(t)) {
    return {
      type:     'ADD_CALENDAR_EVENT',
      title:    extractTitle(t, 'Event'),
      date:     extractDate(t),
      time:     extractTime(t),
      category: extractCategory(t),
    }
  }

  if (INTENT.remind.test(t)) {
    return {
      type: 'SET_REMINDER',
      text: transcript,
      date: extractDate(t),
      time: extractTime(t),
    }
  }

  if (INTENT.open.test(t)) {
    return {
      type:   'OPEN_MODULE',
      module: extractModule(t),
    }
  }

  return { type: 'UNKNOWN', transcript }
}
