import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import type { WorkoutDaySession } from '@/db/dexie'
import { belongsToProfile, sessionHasActivity } from '@/lib/workoutSession'
import { useProfileStore } from '@/store/useProfileStore'
import { useProgressStore } from '@/store/useProgressStore'
import { PROFILES } from '@/config/profiles'
import { LIBRARY_BY_ID, EXERCISE_LIBRARY, toExerciseId } from '@/data/obzen-program'
import {
  e1rmSeries, bestCurrentE1RM, sbdTotal, weeklyVolume, recentPRs,
  dotsScore, strengthStandard, trackingSeries, weeklyRepVolume, delta, isoWeekKey,
} from '@/lib/progress'
import { todayISO } from '@/lib/utils'
import { LineChart, BarChart, ChartEmpty } from './Charts'
import { ProgressionLadder } from './ProgressionLadder'
import { BodyweightPanel } from './BodyweightPanel'

const CARD = { background: '#161616', border: '1px solid #323232' } as const

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2px] p-4" style={CARD}>
      <h3 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: '#a6a6a6' }}>
        {label}
      </h3>
      {children}
    </section>
  )
}

function Stat({ value, unit, label, sub }: { value: string; unit?: string; label: string; sub?: string }) {
  return (
    <div className="rounded-[2px] p-3 flex-1 min-w-[100px]" style={CARD}>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] tabular-nums leading-none" style={{ color: '#e2e2e2' }}>{value}</span>
        {unit && <span className="text-[12px]" style={{ color: '#8a8a8a' }}>{unit}</span>}
      </div>
      <div className="text-[11px] uppercase tracking-widest mt-1.5" style={{ color: '#8a8a8a' }}>{label}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: '#6f6f6f' }}>{sub}</div>}
    </div>
  )
}

const kg = (n: number) => `${Math.round(n * 10) / 10}`

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
    return <div className="py-10 text-center text-[13px]" style={{ color: '#6f6f6f' }}>Loading…</div>
  }

  // Everything below is computed from this profile's real training only.
  const mine = sessions.filter(s => belongsToProfile(s, activeId) && sessionHasActivity(s))

  if (mine.length === 0) {
    return (
      <div className="rounded-[2px] p-6 text-center space-y-2" style={CARD}>
        <p className="text-[15px]" style={{ color: '#e2e2e2' }}>No training logged yet</p>
        <p className="text-[13px]" style={{ color: '#8a8a8a' }}>
          Log a few sessions and your strength trends, volume and PRs will appear here.
        </p>
      </div>
    )
  }

  // ── Key lifts ──────────────────────────────────────────────────────────────
  const keyLifts = cfg.keyLiftIds.map(id => ({
    id,
    name: LIBRARY_BY_ID[id]?.name ?? id,
    best: bestCurrentE1RM(mine, id, bodyweightKg),
    series: e1rmSeries(mine, id, bodyweightKg),
  }))

  const total = sbdTotal(mine, cfg.keyLiftIds)
  const dots = cfg.showPowerlifting && profile.sex
    ? dotsScore(total.totalKg, bodyweightKg, profile.sex)
    : 0

  const volume = weeklyVolume(mine)
  // Look the current week up by key — `volume` only contains weeks that were
  // trained, so its last entry is the most recent *trained* week, which is not
  // the current one after any week off.
  const thisWeekKey = isoWeekKey(todayISO())
  const thisWeekVolume = volume.find(v => v.week === thisWeekKey)?.tonnageKg ?? 0
  const prs = recentPRs(mine, bodyweightKg).slice(0, 6)

  // ── Bodyweight-mode movements this profile has actually logged ─────────────
  const loggedIds = [...new Set(mine.flatMap(s => s.exercises.map(e => e.exerciseId)))]
  const bodyweightMovements = loggedIds
    .map(id => ({ id, entry: LIBRARY_BY_ID[id] }))
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
              value={kg(total.totalKg)} unit="kg" label="SBD Total"
              sub={total.loggedCount < total.lifts.length
                ? `${total.loggedCount} of ${total.lifts.length} lifts logged`
                : 'all three logged'}
            />
            {dots > 0 && <Stat value={kg(dots)} label="DOTS (est.)" sub={`at ${kg(bodyweightKg)} kg`} />}
          </>
        ) : (
          keyLifts.slice(0, 2).map(l => (
            <Stat key={l.id} value={l.best > 0 ? kg(l.best) : '—'} unit={l.best > 0 ? 'kg' : ''} label={l.name} sub="best e1RM" />
          ))
        )}
        <Stat value={String(mine.length)} label="Sessions" />
        <Stat
          value={kg(thisWeekVolume / 1000)}
          unit="t" label="Volume" sub="this week"
        />
      </div>

      {/* ── e1RM trend ─────────────────────────────────────────────────── */}
      <Card label="Estimated 1RM trend">
        <LineChart
          series={keyLifts
            .filter(l => l.series.length > 0)
            .map(l => ({ label: l.name, points: l.series.map(p => ({ date: p.date, value: p.e1rm })) }))}
          yLabel="Estimated 1RM in kilograms"
        />
      </Card>

      {/* ── Standards (powerlifting) or bodyweight trend ───────────────── */}
      {cfg.showPowerlifting && profile.sex && (
        <Card label="Strength standards (est.)">
          <div className="space-y-3">
            {[...total.lifts.map(l => ({ key: l.exerciseId, name: l.name, value: l.e1rm })),
              { key: 'total', name: 'Total', value: total.totalKg }].map(row => {
              const std = strengthStandard(row.key, row.value, bodyweightKg, profile.sex!)
              if (!std) return null
              const pct = Math.min(100, (std.ratio / 2.75) * 100)
              return (
                <div key={row.key}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span style={{ color: '#e2e2e2' }}>{row.name}</span>
                    <span style={{ color: '#a6a6a6' }}>
                      {std.band}
                      <span className="ml-2 tabular-nums" style={{ color: '#6f6f6f' }}>
                        {Math.round(std.ratio * 100) / 100}×BW
                      </span>
                    </span>
                  </div>
                  <div className="h-[3px] mt-1.5 rounded-full" style={{ background: '#252525' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#a6a6a6' }} />
                  </div>
                  {std.toNextKg !== null && std.nextBand && (
                    <div className="text-[11px] mt-1" style={{ color: '#6f6f6f' }}>
                      {kg(std.toNextKg)} kg to {std.nextBand}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-[11px] mt-3 pt-3" style={{ color: '#6f6f6f', borderTop: '1px solid #252525' }}>
            Bands and the DOTS score are reference estimates — worth checking against a
            source you trust before treating them as authoritative.
          </p>
        </Card>
      )}

      {cfg.showBodyweightTrend && <BodyweightPanel profileId={activeId} />}

      {/* ── Weekly volume + PRs ────────────────────────────────────────── */}
      <Card label="Weekly volume (tonnage)">
        <BarChart
          data={volume.slice(-8).map(v => ({ label: v.week.slice(-3), value: v.tonnageKg }))}
          unit="kg"
        />
      </Card>

      <Card label="Personal records">
        {prs.length === 0 ? (
          <ChartEmpty text="No PRs yet." />
        ) : (
          <ul className="space-y-2">
            {prs.map(pr => (
              <li key={pr.exerciseId} className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] truncate" style={{ color: '#e2e2e2' }}>{pr.name}</span>
                <span className="text-[13px] tabular-nums shrink-0" style={{ color: '#a6a6a6' }}>
                  {kg(pr.e1rm)} kg
                  <span className="ml-2 text-[11px]" style={{ color: '#6f6f6f' }}>{pr.date}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ── Bodyweight-mode cards ──────────────────────────────────────── */}
      {bodyweightMovements.map(({ id, entry }) => {
        const series = trackingSeries(mine, id, entry.trackingMode)
        const change = delta(series)
        const latest = series.length > 0 ? series[series.length - 1].value : 0
        const unit = entry.trackingMode === 'timed' ? 's' : entry.trackingMode === 'assisted' ? 'kg' : 'reps'
        // For assistance, down is progress — so a negative delta is good.
        const improving = entry.trackingMode === 'assisted' ? change < 0 : change > 0

        return (
          <Card key={id} label={entry.name}>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[22px] tabular-nums" style={{ color: '#e2e2e2' }}>
                {Math.round(latest * 10) / 10}
              </span>
              <span className="text-[12px]" style={{ color: '#8a8a8a' }}>{unit}</span>
              {series.length > 1 && (
                <span className="text-[12px]" style={{ color: improving ? '#86efac' : '#8a8a8a' }}>
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
                <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: '#8a8a8a' }}>
                  Weekly rep volume
                </div>
                <BarChart
                  data={weeklyRepVolume(mine, id).slice(-8).map(v => ({ label: v.week.slice(-3), value: v.tonnageKg }))}
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
