import { useState } from 'react'
import type { ProfileId } from '@/config/profiles'
import { PROFILES } from '@/config/profiles'
import { useProgressStore } from '@/store/useProgressStore'
import { todayISO } from '@/lib/utils'
import { LineChart } from './Charts'
import { kgToLb, lbToKg } from '@/lib/progress'

/** Stable fallback reference — `?? []` inline in a zustand selector would
 *  construct a new array every call, breaking snapshot equality and looping. */
const NO_ENTRIES: never[] = []

/**
 * Bodyweight trend + a minimal logger. Bodyweight is not stored in Dexie
 * anywhere, so entries live in the localStorage progress store.
 */
export function BodyweightPanel({ profileId }: { profileId: ProfileId }) {
  const entries = useProgressStore(s => s.bodyweight[profileId] ?? NO_ENTRIES)
  const logBodyweight = useProgressStore(s => s.logBodyweight)
  const [value, setValue] = useState('')

  // Stored in kg (so existing entries keep working); shown and entered in lb.
  const starting = PROFILES[profileId].body.bodyweightKg
  const latestKg = entries.length > 0 ? entries[entries.length - 1].kg : starting
  const latest = latestKg !== undefined ? kgToLb(latestKg) : undefined
  const change = entries.length > 1
    ? kgToLb(entries[entries.length - 1].kg - entries[0].kg)
    : 0

  const submit = () => {
    const lb = Number(value)
    if (!Number.isFinite(lb) || lb <= 0) return
    logBodyweight(profileId, todayISO(), lbToKg(lb))
    setValue('')
  }

  return (
    <section className="rounded-[var(--r-control)] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <h3 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'var(--ink-dim)' }}>
        Bodyweight
      </h3>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[22px] tabular-nums" style={{ color: 'var(--ink)' }}>
          {latest !== undefined ? Math.round(latest * 10) / 10 : '—'}
        </span>
        <span className="text-[12px]" style={{ color: 'var(--ink-dim)' }}>lb</span>
        {entries.length > 1 && (
          <span className="text-[12px]" style={{ color: change < 0 ? 'var(--complete-text)' : 'var(--ink-dim)' }}>
            {change > 0 ? '+' : ''}{Math.round(change * 10) / 10} lb
          </span>
        )}
      </div>

      {entries.length > 1 ? (
        <LineChart
          series={[{ label: 'Bodyweight', points: entries.map(e => ({ date: e.date, value: kgToLb(e.kg) })) }]}
          yLabel="Bodyweight in pounds"
        />
      ) : (
        <p className="text-[13px] py-2" style={{ color: 'var(--ink-faint)' }}>
          Log twice to see a trend.
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder="Today's weight (lb)"
          aria-label="Today's bodyweight in pounds"
          className="flex-1 rounded-[var(--r-control)] px-3 py-2 text-[15px] bg-transparent focus:outline-none"
          style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="px-4 rounded-[var(--r-control)] text-[12px] uppercase tracking-widest transition-opacity disabled:opacity-30"
          style={{ border: '1px solid var(--muted)', color: 'var(--ink)' }}
        >
          Log
        </button>
      </div>
    </section>
  )
}
