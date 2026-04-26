export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function dayOfWeek(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

export function dayOfWeekShort(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

export function currentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

export function isPittaSeasonPeak(): boolean {
  const month = new Date().getMonth() + 1
  return month >= 6 && month <= 10
}

export function isSaturday(): boolean {
  return new Date().getDay() === 6
}

export function isSunday(): boolean {
  return new Date().getDay() === 0
}

export function isMonday(): boolean {
  return new Date().getDay() === 1
}

export function getMoonPhaseEmoji(): string {
  const synodicMonth = 29.53058867
  const known = new Date('2000-01-06T18:14:00Z')
  const now = new Date()
  const diff = (now.getTime() - known.getTime()) / 1000 / 60 / 60 / 24
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth
  if (phase < 1.85) return '🌑'
  if (phase < 5.54) return '🌒'
  if (phase < 9.22) return '🌓'
  if (phase < 12.91) return '🌔'
  if (phase < 16.61) return '🌕'
  if (phase < 20.30) return '🌖'
  if (phase < 23.99) return '🌗'
  if (phase < 27.68) return '🌘'
  return '🌑'
}

export function getMoonPhaseName(): string {
  const synodicMonth = 29.53058867
  const known = new Date('2000-01-06T18:14:00Z')
  const now = new Date()
  const diff = (now.getTime() - known.getTime()) / 1000 / 60 / 60 / 24
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth
  if (phase < 1.85) return 'New Moon'
  if (phase < 5.54) return 'Waxing Crescent'
  if (phase < 9.22) return 'First Quarter'
  if (phase < 12.91) return 'Waxing Gibbous'
  if (phase < 16.61) return 'Full Moon'
  if (phase < 20.30) return 'Waning Gibbous'
  if (phase < 23.99) return 'Last Quarter'
  if (phase < 27.68) return 'Waning Crescent'
  return 'New Moon'
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

export function pct(val: number, max: number): number {
  if (max === 0) return 0
  return clamp(Math.round((val / max) * 100), 0, 100)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function getPlanetaryDay(): { planet: string; day: string } {
  const days = [
    { planet: 'Sun', day: 'Sunday' },
    { planet: 'Moon', day: 'Monday' },
    { planet: 'Mars', day: 'Tuesday' },
    { planet: 'Mercury', day: 'Wednesday' },
    { planet: 'Jupiter', day: 'Thursday' },
    { planet: 'Venus', day: 'Friday' },
    { planet: 'Saturn', day: 'Saturday' },
  ]
  return days[new Date().getDay()]
}
