import { useState } from 'react'
import { Plus, X, Repeat } from 'lucide-react'
import type { WorkoutDaySession } from '@/db/dexie'
import {
  circuitMembers, canAddToCircuit,
  MAX_CIRCUIT_EXERCISES, MIN_CIRCUIT_ROUNDS, MAX_CIRCUIT_ROUNDS,
} from '@/lib/circuits'
import { exerciseNameFor } from '@/data/obzen-program'
import { Card } from '@/components/ui/Card'
import { SegmentedPill } from '@/components/ui/SegmentedPill'

interface Props {
  session: WorkoutDaySession
  onCreate: (name: string, rounds: number, exerciseIds: string[]) => void
  onDrop: (circuitId: string) => void
  onRounds: (circuitId: string, rounds: number) => void
  onPullOut: (exerciseId: string) => void
}

const ROUND_CHOICES = Array.from(
  { length: MAX_CIRCUIT_ROUNDS - MIN_CIRCUIT_ROUNDS + 1 },
  (_, i) => MIN_CIRCUIT_ROUNDS + i
)

/**
 * Circuits within the day.
 *
 * Builds from exercises already in the session rather than offering its own
 * picker — a circuit is a way of working through what is already planned, and
 * a second way to add exercises would be a second place for them to go missing.
 */
export function CircuitsCard({ session, onCreate, onDrop, onRounds, onPullOut }: Props) {
  const [building, setBuilding] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const [rounds, setRounds] = useState(MIN_CIRCUIT_ROUNDS)

  const circuits = session.circuits ?? []
  const loose = session.exercises.filter(e => !e.circuitId)

  const toggle = (id: string) =>
    setPicked(p => p.includes(id)
      ? p.filter(x => x !== id)
      : p.length < MAX_CIRCUIT_EXERCISES ? [...p, id] : p)

  const build = () => {
    if (picked.length === 0) return
    onCreate('Circuit', rounds, picked)
    setPicked([]); setRounds(MIN_CIRCUIT_ROUNDS); setBuilding(false)
  }

  if (circuits.length === 0 && !building) {
    // Nothing to group means nothing to offer.
    if (loose.length < 2) return null
    return (
      <button
        onClick={() => setBuilding(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[var(--r-control)] text-[length:var(--text-md)] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ border: '1px dashed var(--border)', color: 'var(--ink-dim)' }}
      >
        <Repeat size={14} /> Add Circuit
      </button>
    )
  }

  return (
    <Card label="Circuits">
      {circuits.map(circuit => {
        const members = circuitMembers(session, circuit.id)
        return (
          <div key={circuit.id} style={{ marginBottom: 16 }}>
            <div className="flex items-center justify-between" style={{ gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 'var(--text-xl)', color: 'var(--ink)' }}>
                {circuit.name}
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
                  {' '}· {members.length} exercise{members.length === 1 ? '' : 's'}
                </span>
              </span>
              <button
                onClick={() => onDrop(circuit.id)}
                aria-label={`Ungroup ${circuit.name}`}
                style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-dim)' }}
              >
                Ungroup
              </button>
            </div>

            <SegmentedPill
              label={`${circuit.name} rounds`}
              grow
              value={circuit.rounds}
              onChange={(r: number) => onRounds(circuit.id, r)}
              options={ROUND_CHOICES.map(r => ({ value: r, label: `${r} rounds` }))}
            />

            <ul style={{ marginTop: 8 }}>
              {members.map((e, i) => (
                <li
                  key={e.exerciseId}
                  className="flex items-center justify-between"
                  style={{ gap: 10, padding: '6px 0' }}
                >
                  <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-2)' }}>
                    <span style={{ color: 'var(--ink-faint)' }}>{i + 1}.</span>{' '}
                    {e.name ?? exerciseNameFor(e.exerciseId)}
                  </span>
                  <button
                    onClick={() => onPullOut(e.exerciseId)}
                    aria-label={`Remove ${e.name ?? exerciseNameFor(e.exerciseId)} from ${circuit.name}`}
                    style={{ color: 'var(--ink-faint)' }}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>

            {!canAddToCircuit(session, circuit.id) && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-ghost)', marginTop: 4 }}>
                Full at {MAX_CIRCUIT_EXERCISES}.
              </p>
            )}
          </div>
        )
      })}

      {building ? (
        <div style={{ paddingTop: circuits.length > 0 ? 12 : 0, borderTop: circuits.length > 0 ? '1px solid var(--hairline-soft)' : undefined }}>
          <div style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)', marginBottom: 8 }}>
            Pick up to {MAX_CIRCUIT_EXERCISES} exercises to work in rounds.
          </div>

          <div className="flex flex-col" style={{ gap: 6, marginBottom: 10 }}>
            {loose.map(e => {
              const on = picked.includes(e.exerciseId)
              const full = !on && picked.length >= MAX_CIRCUIT_EXERCISES
              return (
                <button
                  key={e.exerciseId}
                  onClick={() => toggle(e.exerciseId)}
                  aria-pressed={on}
                  disabled={full}
                  className="text-left transition-colors"
                  style={{
                    padding: '10px 12px', borderRadius: 'var(--r-control)',
                    fontSize: 'var(--text-md)',
                    border: `1px solid ${on ? 'rgb(var(--accent-soft-rgb) / 0.55)' : 'var(--hairline)'}`,
                    background: on ? 'rgb(var(--accent-soft-rgb) / 0.14)' : 'transparent',
                    color: full ? 'var(--ink-ghost)' : on ? 'var(--ink)' : 'var(--ink-dim)',
                  }}
                >
                  {e.name ?? exerciseNameFor(e.exerciseId)}
                </button>
              )
            })}
          </div>

          <SegmentedPill
            label="Rounds"
            grow
            value={rounds}
            onChange={setRounds}
            options={ROUND_CHOICES.map(r => ({ value: r, label: `${r} rounds` }))}
          />

          <div className="flex" style={{ gap: 10, marginTop: 12 }}>
            <button
              onClick={build}
              disabled={picked.length === 0}
              className="flex-1 py-2.5 rounded-[var(--r-control)] text-[length:var(--text-md)] uppercase tracking-widest transition-opacity"
              style={{
                background: picked.length > 0 ? 'var(--accent)' : 'transparent',
                color: picked.length > 0 ? 'var(--on-accent)' : 'var(--ink-ghost)',
                border: picked.length > 0 ? 'none' : '1px solid var(--hairline)',
              }}
            >
              Create circuit
            </button>
            <button
              onClick={() => { setBuilding(false); setPicked([]) }}
              className="py-2.5 px-4 text-[length:var(--text-md)] uppercase tracking-widest"
              style={{ color: 'var(--ink-dim)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        loose.length >= 2 && (
          <button
            onClick={() => setBuilding(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[var(--r-control)] text-[length:var(--text-md)] uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{ border: '1px dashed var(--border)', color: 'var(--ink-dim)' }}
          >
            <Plus size={14} /> Another circuit
          </button>
        )
      )}
    </Card>
  )
}
