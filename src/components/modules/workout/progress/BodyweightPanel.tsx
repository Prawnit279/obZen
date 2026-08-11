import { useState } from 'react'
import type { ProfileId } from '@/config/profiles'
import { PROFILES } from '@/config/profiles'
import { useProgressStore } from '@/store/useProgressStore'
import { todayISO } from '@/lib/utils'
import { LineChart } from './Charts'

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

  const starting = PROFILES[profileId].body.bodyweightKg
  const latest = entries.length > 0 ? entries[entries.length - 1].kg : starting
  const change = entries.length > 1 ? entries[entries.length - 1].kg - entries[0].kg : 0

  const submit = () => {
    const kg = Number(value)
    if (!Number.isFinite(kg) || kg <= 0) return
    logBodyweight(profileId, todayISO(), kg)
    setValue('')
  }

  return (
    <section className="rounded-[2px] p-4" style={{ background: '#161616', border: '1px solid #323232' }}>
      <h3 className="text-[11px] uppercase tracking-widest mb-3" style={{ color: '#a6a6a6' }}>
        Bodyweight
      </h3>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[22px] tabular-nums" style={{ color: '#e2e2e2' }}>
          {latest !== undefined ? Math.round(latest * 10) / 10 : '—'}
        </span>
        <span className="text-[12px]" style={{ color: '#8a8a8a' }}>kg</span>
        {entries.length > 1 && (
          <span className="text-[12px]" style={{ color: change < 0 ? '#86efac' : '#8a8a8a' }}>
            {change > 0 ? '+' : ''}{Math.round(change * 10) / 10} kg
          </span>
        )}
      </div>

      {entries.length > 1 ? (
        <LineChart
          series={[{ label: 'Bodyweight', points: entries.map(e => ({ date: e.date, value: e.kg })) }]}
          yLabel="Bodyweight in kilograms"
        />
      ) : (
        <p className="text-[13px] py-2" style={{ color: '#6f6f6f' }}>
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
          placeholder="Today's weight (kg)"
          aria-label="Today's bodyweight in kilograms"
          className="flex-1 rounded-[2px] px-3 py-2 text-[15px] bg-transparent focus:outline-none"
          style={{ border: '1px solid #323232', color: '#e2e2e2' }}
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="px-4 rounded-[2px] text-[12px] uppercase tracking-widest transition-opacity disabled:opacity-30"
          style={{ border: '1px solid #a6a6a6', color: '#e2e2e2' }}
        >
          Log
        </button>
      </div>
    </section>
  )
}
