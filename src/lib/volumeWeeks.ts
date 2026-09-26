/**
 * Week-by-week volume, for reading rather than for charting.
 *
 * `weeklyVolume` omits untrained weeks. That is right for looking one up by key
 * and wrong for a history: a fortnight off is among the more interesting things
 * a volume record can tell you, and a series that simply skips it reads as
 * continuous training. Every week inside the range appears here, trained or
 * not, and a zero is a real answer rather than a missing one.
 *
 * Each row carries all three readings — everything, main work, assistance —
 * gathered together so a row cannot disagree with itself about its own week.
 * They are computed by the same `weeklyVolume` the rest of the app uses, with
 * its `SetKind` filter, rather than by a second traversal with its own opinion
 * about what counts.
 *
 * Tonnage stays in kilos, like `weeklyVolume`. The pound conversion belongs at
 * the point of display, and doing it here would let a caller apply it twice.
 */

import type { WorkoutDaySession } from '@/db/dexie'
import type { WeeklyVolume } from '@/lib/progress'
import { weeklyVolume, isoWeekKey } from '@/lib/progress'
import type { LiftRange } from '@/lib/liftViews'
import { rangeStart } from '@/lib/liftViews'

export interface VolumeWeek {
  /** ISO week key, e.g. `2026-W39`. */
  week: string
  /** The Monday that week begins on, so a row can name a real date. */
  startISO: string
  total: WeeklyVolume
  main: WeeklyVolume
  supplemental: WeeklyVolume
}

const DAY_MS = 86_400_000

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * The Monday of the week containing a date.
 *
 * Noon local, matching `isoWeekKey`, so the two never disagree about which week
 * a date belongs to across a daylight-saving boundary.
 */
function mondayOf(dateISO: string): Date {
  const d = new Date(`${dateISO}T12:00:00`)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/** An empty week, so an untrained one reads as zero rather than as absent. */
function blank(week: string): WeeklyVolume {
  return { week, tonnageKg: 0, sets: 0 }
}

export function volumeWeeks(
  sessions: WorkoutDaySession[],
  bodyweightKg: number,
  range: LiftRange,
  todayISO: string
): VolumeWeek[] {
  // Where the window opens. A bounded range says so itself; `all` starts at the
  // first week actually trained, because an empty log has no history to show
  // and a row of zeroes would invent one.
  const earliest = sessions.reduce<string | null>(
    (acc, s) => (acc === null || s.date < acc ? s.date : acc),
    null
  )
  const from = range === 'all' ? earliest : rangeStart(range, todayISO)
  if (from === null) return []

  const lastMonday = mondayOf(todayISO)

  // A bounded range spans exactly the number of weeks it is named for — eight
  // rows for "8 weeks", not nine. Counting inclusive Mondays from the range's
  // start date would give one more, because the start lands mid-week; the label
  // would then be a lie and the list would be a row longer than the chart.
  // `all` is inclusive instead: it runs from the first week actually trained.
  const count = range === 'all'
    ? Math.floor((lastMonday.getTime() - mondayOf(from).getTime()) / (7 * DAY_MS)) + 1
    : Math.round((Date.parse(`${todayISO}T12:00:00`) - Date.parse(`${from}T12:00:00`)) / (7 * DAY_MS))
  if (count <= 0) return []

  const firstMonday = new Date(lastMonday.getTime() - (count - 1) * 7 * DAY_MS)

  // One pass each, then indexed by week. Three passes over the sessions rather
  // than one, but each goes through `weeklyVolume` — so the split here and the
  // split anywhere else in the app come from the same arithmetic.
  const byKind = {
    total: new Map(weeklyVolume(sessions, bodyweightKg).map(v => [v.week, v])),
    main: new Map(weeklyVolume(sessions, bodyweightKg, 'main').map(v => [v.week, v])),
    supplemental: new Map(weeklyVolume(sessions, bodyweightKg, 'supplemental').map(v => [v.week, v])),
  }

  return Array.from({ length: count }, (_, i) => {
    const monday = new Date(firstMonday.getTime() + i * 7 * DAY_MS)
    const startISO = iso(monday)
    const week = isoWeekKey(startISO)
    return {
      week,
      startISO,
      total: byKind.total.get(week) ?? blank(week),
      main: byKind.main.get(week) ?? blank(week),
      supplemental: byKind.supplemental.get(week) ?? blank(week),
    }
  })
}
