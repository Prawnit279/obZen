import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import type { WorkoutDaySession } from '@/db/dexie'
import { belongsToProfile, sessionHasActivity } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'
import { useProgressStore } from '@/store/useProgressStore'
import { PROFILES } from '@/config/profiles'
import { EXERCISE_LIBRARY, toExerciseId, COMPETITION_LIFT_IDS, libraryFor, exerciseNameFor } from '@/data/obzen-program'
import {
  e1rmSeries, bestCurrentE1RM, sbdTotal, weeklyVolume, fillWeeks, recentPRs,
  dotsScore, strengthStandard, trackingSeries, weeklyRepVolume, delta, isoWeekKey, displayLb, kgToLb,
} from '@/lib/progress'
import { todayISO } from '@/lib/utils'
import { LineChart, BarChart, ChartEmpty, liftHue } from './Charts'
import { ProgressionLadder } from './ProgressionLadder'
import { BodyweightPanel } from './BodyweightPanel'

const CARD = { background: 'var(--card)', border: '1px solid var(--hairline)' } as const

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section
      className="flex flex-col"
      style={{ ...CARD, borderRadius: 'var(--r-card)', padding: '16px 18px', gap: 13 }}
    >
      <h3
        className="uppercase"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
      >
        {label}
      </h3>
      {children}
    </section>
  )
}

function Stat({ value, unit, label, sub, hero }: {
  value: string; unit?: string; label: string; sub?: string; hero?: boolean
}) {
  return (
    <div
      className="flex-1 min-w-[104px] flex flex-col"
      style={{
        gap: 6, padding: '14px 16px',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-card)',
        background: hero ? 'var(--card-accent)' : 'var(--card)',
      }}
    >
      <span
        className="uppercase"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
      >
        {label}
      </span>
      <div className="flex items-baseline" style={{ gap: 5 }}>
        <span
          style={{
            fontSize: hero ? 36 : 22, fontWeight: 700,
            lineHeight: hero ? 0.9 : 1,
            letterSpacing: hero ? '-0.03em' : '-0.02em',
            color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-faint)' }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{sub}</span>}
    </div>
  )
}

/** Internal maths is kg; the gym is in pounds, so display converts at the edge. */
const lb = (kgValue: number) => displayLb(kgValue)
/** Scores (DOTS/Wilks) are unitless — never convert them. */
const score = (n: number) => `${Math.round(n * 10) / 10}`

export function WorkoutProgress() {
  const { activeId } = useProfileStore()
  const profile = PROFILES[activeId]
  const cfg = profile.progress
  const latestBodyweight = useProgressStore(s => s.latestBodyweight)
  const bodyweightKg = latestBodyweight(activeId) ?? profile.body.bodyweightKg ?? 0

  const sessions = useLiveQuery<WorkoutDaySession[]>(
    () => db.workoutDaySessions.orderBy('date').toArray(),
    []
  )

  if (!sessions) {
    return <div className="py-10 text-center" style={{ fontSize: 13, color: 'var(--ink-faint)' }}>Loading…</div>
  }

  // Everything below is computed from this profile's real training only.
  const mine = sessions.filter(s => belongsToProfile(s, activeId) && sessionHasActivity(s))

  if (mine.length === 0) {
    return (
      <div
        className="text-center space-y-2"
        style={{ ...CARD, borderRadius: 'var(--r-card)', padding: 24 }}
      >
        <p style={{ fontSize: 15, color: 'var(--ink-2)' }}>No training logged yet</p>
        <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          Log a few sessions and your strength trends, volume and PRs will appear here.
        </p>
      </div>
    )
  }

  // ── Key lifts ──────────────────────────────────────────────────────────────
  const keyLifts = cfg.keyLiftIds.map(id => ({
    id,
    name: exerciseNameFor(id),
    best: bestCurrentE1RM(mine, id, bodyweightKg),
    series: e1rmSeries(mine, id, bodyweightKg),
  }))

  // The SBD total is the three competition lifts by definition — not whichever
  // lifts this profile happens to chart, which are configured separately.
  const total = sbdTotal(mine, COMPETITION_LIFT_IDS)
  const dots = cfg.showPowerlifting && profile.sex
    ? dotsScore(total.totalKg, bodyweightKg, profile.sex)
    : 0

  // Bodyweight matters here: assisted and bodyweight work are scored on the
  // load actually moved, not on the number in the weight field.
  const volume = weeklyVolume(mine, bodyweightKg)
  // Look the current week up by key — `volume` only contains weeks that were
  // trained, so its last entry is the most recent *trained* week, which is not
  // the current one after any week off.
  const thisWeekKey = isoWeekKey(todayISO())
  const thisWeekVolume = volume.find(v => v.week === thisWeekKey)?.tonnageKg ?? 0
  const prs = recentPRs(mine, bodyweightKg).slice(0, 6)

  // ── Bodyweight-mode movements this profile has actually logged ─────────────
  const loggedIds = [...new Set(mine.flatMap(s => s.exercises.map(e => e.exerciseId)))]
  const bodyweightMovements = loggedIds
    .map(id => ({ id, entry: libraryFor(id) }))
    .filter(x => x.entry && x.entry.trackingMode !== 'load')
    .map(x => ({ id: x.id, entry: x.entry! }))

  // Ladders cover every bodyweight movement in the catalog for this profile's
  // programme, whether or not it has been logged yet.
  const ladderMovements = EXERCISE_LIBRARY.filter(ex => ex.progressionPath)
    .filter(ex => loggedIds.includes(toExerciseId(ex.name)) || cfg.keyLiftIds.includes(toExerciseId(ex.name)))

  return (
    <div className="space-y-4">
      {/* ── Stat row ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {cfg.showPowerlifting ? (
          <>
            <Stat
              hero
              value={lb(total.totalKg)} unit="lb" label="SBD Total"
              sub={total.loggedCount < total.lifts.length
                ? `${total.loggedCount} of ${total.lifts.length} lifts logged`
                : 'all three logged'}
            />
            {dots > 0 && <Stat value={score(dots)} label="DOTS (est.)" sub={`at ${lb(bodyweightKg)} lb`} />}
          </>
        ) : (
          keyLifts.slice(0, 2).map(l => (
            <Stat key={l.id} value={l.best > 0 ? lb(l.best) : '—'} unit={l.best > 0 ? 'lb' : ''} label={l.name} sub="best e1RM" />
          ))
        )}
        <Stat value={String(mine.length)} label="Sessions" />
        <Stat
          value={Math.round(kgToLb(thisWeekVolume)).toLocaleString()}
          unit="lb" label="Volume" sub="this week"
        />
      </div>

      {/* ── e1RM trend ─────────────────────────────────────────────────── */}
      <Card label="Estimated 1RM trend">
        <LineChart
          series={keyLifts
            .filter(l => l.series.length > 0)
            .map(l => ({ label: l.name, points: l.series.map(p => ({ date: p.date, value: kgToLb(p.e1rm) })) }))}
          yLabel="Estimated 1RM in pounds"
        />
      </Card>

      {/* ── Standards (powerlifting) or bodyweight trend ───────────────── */}
      {cfg.showPowerlifting && profile.sex && (
        <Card label="Strength standards (est.)">
          <div className="space-y-3">
            {[...total.lifts.map(l => ({ key: l.exerciseId, name: l.name, value: l.e1rm })),
              { key: 'total', name: 'Total', value: total.totalKg }].map((row, i) => {
              const std = strengthStandard(row.key, row.value, bodyweightKg, profile.sex!)
              if (!std) return null
              // Scale each row against its own Elite threshold, so a full bar
              // means Elite for that lift rather than for a male deadlift.
              const pct = Math.min(100, (std.ratio / std.eliteRatio) * 100)
              // The total is the sum, not a lift — it takes the accent rather
              // than borrowing another lift's hue.
              const hue = row.key === 'total' ? 'var(--violet-200)' : liftHue(row.name, i)
              return (
                <div key={row.key} className="flex flex-col" style={{ gap: 6 }}>
                  <div className="flex items-baseline justify-between" style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{row.name}</span>
                    <span style={{ color: 'var(--ink-dim)' }}>
                      {std.band}
                      <span
                        className="ml-2"
                        style={{ color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {Math.round(std.ratio * 100) / 100}×BW
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6, borderRadius: 'var(--r-bar)',
                      background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`, height: '100%',
                        borderRadius: 'var(--r-bar)',
                        background: hue,
                        transition: 'width var(--t-base) var(--ease-out)',
                      }}
                    />
                  </div>
                  {std.toNextKg !== null && std.nextBand && (
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                      {lb(std.toNextKg)} lb to {std.nextBand}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p
            style={{
              fontSize: 11, color: 'var(--ink-faint)',
              paddingTop: 12, borderTop: '1px solid var(--hairline-soft)',
            }}
          >
            Bands and the DOTS score are reference estimates — worth checking against a
            source you trust before treating them as authoritative.
          </p>
        </Card>
      )}

      {cfg.showBodyweightTrend && <BodyweightPanel profileId={activeId} />}

      {/* ── Weekly volume + PRs ────────────────────────────────────────── */}
      <Card label="Weekly volume (tonnage)">
        <BarChart
          data={fillWeeks(volume, todayISO(), 8)
            .map(v => ({ label: v.week.slice(-3), value: kgToLb(v.tonnageKg) }))}
          unit="lb"
        />
      </Card>

      <Card label="Personal records">
        {prs.length === 0 ? (
          <ChartEmpty text="No PRs yet." />
        ) : (
          <ul className="space-y-2">
            {prs.map(pr => (
              // Name and the lift itself lead; the estimate and date are
              // secondary and sit under them. On one row at phone width the
              // name was the part that got clipped, which is the wrong loser.
              <li key={pr.exerciseId} className="flex flex-col" style={{ gap: 2 }}>
                <div className="flex items-baseline justify-between gap-3">
                  <span style={{ fontSize: 15, color: 'var(--ink-2)' }}>{pr.name}</span>
                  <span
                    className="shrink-0"
                    style={{
                      fontSize: 15, fontWeight: 700, color: 'var(--ink)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {lb(pr.weightKg)} lb × {pr.reps}
                  </span>
                </div>
                <div
                  className="flex items-baseline justify-between gap-3"
                  style={{ fontSize: 11, color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}
                >
                  <span>~{lb(pr.e1rm)} est. 1RM</span>
                  <span>{pr.date}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ── Bodyweight-mode cards ──────────────────────────────────────── */}
      {bodyweightMovements.map(({ id, entry }) => {
        // Assistance is a weight, so convert it for display; seconds and reps
        // are unit-free and pass through unchanged.
        const rawSeries = trackingSeries(mine, id, entry.trackingMode)
        const series = entry.trackingMode === 'assisted'
          ? rawSeries.map(p => ({ ...p, value: kgToLb(p.value) }))
          : rawSeries
        const change = delta(series)
        const latest = series.length > 0 ? series[series.length - 1].value : 0
        const unit = entry.trackingMode === 'timed' ? 's' : entry.trackingMode === 'assisted' ? 'lb' : 'reps'
        // For assistance, down is progress — so a negative delta is good.
        const improving = entry.trackingMode === 'assisted' ? change < 0 : change > 0

        return (
          <Card key={id} label={entry.name}>
            <div className="flex items-baseline gap-3 mb-3">
              <span
                style={{
                  fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
                  color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round(latest * 10) / 10}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>{unit}</span>
              {series.length > 1 && (
                <span
                  style={{
                    fontSize: 13, fontWeight: 500,
                    color: improving ? 'var(--ok)' : 'var(--ink-faint)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {change > 0 ? '+' : ''}{Math.round(change * 10) / 10} {unit}
                  {entry.trackingMode === 'assisted' && ' assist'}
                </span>
              )}
            </div>
            <LineChart
              series={[{ label: entry.name, points: series }]}
              goal={entry.trackingMode === 'assisted' ? { value: 0, label: 'unassisted' } : undefined}
            />
            {entry.trackingMode === 'bodyweight-reps' && (
              <div className="mt-3">
                <div
                  className="uppercase"
                  style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)', marginBottom: 6 }}
                >
                  Weekly rep volume
                </div>
                <BarChart
                  data={fillWeeks(weeklyRepVolume(mine, id), todayISO(), 8)
                    .map(v => ({ label: v.week.slice(-3), value: v.tonnageKg }))}
                  unit="reps"
                />
              </div>
            )}
          </Card>
        )
      })}

      {/* ── Progression ladders ────────────────────────────────────────── */}
      {ladderMovements.map(ex => (
        <ProgressionLadder
          key={ex.name}
          profileId={activeId}
          exerciseId={toExerciseId(ex.name)}
          name={ex.name}
          path={ex.progressionPath!}
          assistanceKg={
            ex.trackingMode === 'assisted'
              ? trackingSeries(mine, toExerciseId(ex.name), 'assisted').slice(-1)[0]?.value
              : undefined
          }
        />
      ))}
    </div>
  )
}
