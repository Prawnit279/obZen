/**
 * What the set logger says once an exercise is in a circuit.
 *
 * Circuits were grouping and rounds with nothing downstream: the logger showed
 * the same "Set 1" it shows for anything else, so the round count a circuit
 * declared had no effect on logging it. These pin the three things that
 * changed — the rows offered, what they are called, and the header that
 * explains why they are called that.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { SetLogger } from '@/components/modules/workout/SetLogger'
import type { Circuit, LoggedSet } from '@/db/dexie'

afterEach(cleanup)

const circuit: Circuit = { id: 'c1', name: 'Abs', rounds: 4 }

const logged = (reps: number, n: number): LoggedSet => ({
  setNumber: n, weight: 0, reps, unit: 'lbs', timestamp: `2026-10-04T10:0${n}:00.000Z`,
})

function show(props: Partial<Parameters<typeof SetLogger>[0]> = {}) {
  render(
    <SetLogger
      exerciseId="plank"
      sets={[]}
      onAddSet={() => {}}
      onUpdateSet={() => {}}
      onRemoveSet={() => {}}
      {...props}
    />
  )
}

describe('an exercise outside any circuit', () => {
  it('still counts sets', () => {
    show()
    expect(screen.getByText('Set 1')).toBeInTheDocument()
    expect(screen.queryByText(/Round/)).not.toBeInTheDocument()
  })

  it('opens on a single row', () => {
    show()
    expect(screen.getAllByText(/^Set \d+$/)).toHaveLength(1)
  })
})

describe('an exercise in a circuit', () => {
  it('counts rounds, not sets', () => {
    show({ circuit })
    expect(screen.getByText('Round 1')).toBeInTheDocument()
    expect(screen.queryByText(/^Set \d/)).not.toBeInTheDocument()
  })

  it('offers a row for every round the circuit declares', () => {
    // Four rounds means four times through. Opening on one row made every
    // round after the first a tap on "add set" for something the circuit had
    // already said.
    show({ circuit })
    expect(screen.getAllByText(/^Round \d+$/)).toHaveLength(4)
  })

  it('names the circuit and its rounds, so the labels make sense', () => {
    show({ circuit })
    expect(screen.getByText(/Abs, 4 rounds/)).toBeInTheDocument()
  })

  it('tells a screen reader the same thing it shows', () => {
    // The visible label and the accessible name used to diverge the moment one
    // of them stopped saying "set".
    show({ circuit })
    expect(screen.getByLabelText(/seconds held, round 1/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/seconds held, set 1/i)).not.toBeInTheDocument()
  })

  it('keeps counting rounds past the number declared', () => {
    // A fifth time through a four-round circuit is a fifth round, not an
    // error and not a second "Round 4".
    show({ circuit, sets: [1, 2, 3, 4, 5].map(n => logged(30, n)) })
    expect(screen.getByText('Round 5')).toBeInTheDocument()
    expect(screen.getAllByText('Round 4')).toHaveLength(1)
  })

  it('shows only the rounds actually logged once logging has started', () => {
    // Two logged sets in a four-round circuit are two rows, not four: the
    // declared count seeds an empty logger, it does not pad a started one.
    show({ circuit, sets: [logged(30, 1), logged(30, 2)] })
    expect(screen.getAllByText(/^Round \d+$/)).toHaveLength(2)
  })

  it('still lets a round be marked as assistance', () => {
    // The flags are orthogonal to the labelling, and a circuit is exactly
    // where assistance work tends to live.
    show({ circuit })
    expect(screen.getByLabelText(/mark round 1 as supplemental/i)).toBeInTheDocument()
  })
})
