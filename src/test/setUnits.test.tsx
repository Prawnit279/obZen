/**
 * The logged-set contract: `LoggedSet` stores every movement as a weight and a
 * `reps`, but a plank puts seconds in `reps` and an assisted pull-up puts
 * assistance in `weight`. `lib/progress.ts` has always read them that way;
 * these tests pin the UI to the same reading, so the logger cannot ask for
 * "reps" and have the analytics score it as seconds.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { setUnitsFor, setUnitsForMode, formatSet } from '@/lib/setUnits'
import { trackingModeFor } from '@/data/obzen-program'
import { SetLogger } from '@/components/modules/workout/SetLogger'
import type { LoggedSet } from '@/db/dexie'

afterEach(cleanup)

const noop = () => {}
const loggedSet = (weight: number, reps: number): LoggedSet => ({
  setNumber: 1, weight, reps, unit: 'lbs', timestamp: '2026-08-10T10:00:00.000Z',
})

describe('setUnitsFor — reads the movement, not a guess', () => {
  it('treats every timed hold as seconds', () => {
    for (const id of ['plank', 'side-plank', 'hollow-body-hold', 'suitcase-carry', 'dead-bug']) {
      expect(trackingModeFor(id), `${id} tracking mode`).toBe('timed')
      const units = setUnitsFor(id)
      expect(units.countLabel, `${id} label`).toBe('sec')
      expect(units.isDuration, `${id} isDuration`).toBe(true)
    }
  })

  it('names the weight field assistance for assisted movements', () => {
    for (const id of ['assisted-pull-up', 'assisted-dip']) {
      const units = setUnitsFor(id)
      expect(units.isAssistance, `${id}`).toBe(true)
      expect(units.weightAria).toMatch(/assistance/i)
      // Assisted work is still counted in reps.
      expect(units.countLabel).toBe('reps')
    }
  })

  it('leaves ordinary barbell work alone', () => {
    const units = setUnitsFor('deadlift')
    expect(units).toMatchObject({ countLabel: 'reps', isDuration: false, isAssistance: false })
  })

  it('falls back to reps for an unknown movement', () => {
    expect(setUnitsFor('not-a-real-lift').countLabel).toBe('reps')
  })
})

describe('formatSet', () => {
  it('writes a hold as seconds, not a rep count', () => {
    expect(formatSet(setUnitsForMode('timed'), 0, 45)).toBe('45 s')
    // A loaded carry keeps its weight.
    expect(formatSet(setUnitsForMode('timed'), 35, 40)).toBe('35 lb · 40 s')
  })

  it('marks assistance as assistance', () => {
    expect(formatSet(setUnitsForMode('assisted'), 30, 6)).toBe('30 lb assist × 6')
  })

  it('writes ordinary sets unchanged', () => {
    expect(formatSet(setUnitsForMode('load'), 225, 5)).toBe('225 lb × 5')
  })
})

describe('SetLogger — asks for the number the analytics will read', () => {
  it('labels a plank in seconds', () => {
    render(
      <SetLogger exerciseId="plank" sets={[loggedSet(0, 45)]}
        onAddSet={noop} onUpdateSet={noop} onRemoveSet={noop} />
    )
    expect(screen.getByText('sec')).toBeInTheDocument()
    expect(screen.queryByText('reps')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/seconds held/i)).toBeInTheDocument()
    expect(screen.getByText(/hold in seconds/i)).toBeInTheDocument()
  })

  it('labels an assisted pull-up as assistance', () => {
    render(
      <SetLogger exerciseId="assisted-pull-up" sets={[loggedSet(30, 6)]}
        onAddSet={noop} onUpdateSet={noop} onRemoveSet={noop} />
    )
    expect(screen.getByText('reps')).toBeInTheDocument()
    expect(screen.getByLabelText(/assistance weight/i)).toBeInTheDocument()
    expect(screen.getByText(/assistance weight/i)).toBeInTheDocument()
  })

  it('leaves a barbell lift reading reps and weight', () => {
    render(
      <SetLogger exerciseId="deadlift" sets={[loggedSet(225, 5)]}
        onAddSet={noop} onUpdateSet={noop} onRemoveSet={noop} />
    )
    expect(screen.getByText('reps')).toBeInTheDocument()
    expect(screen.getByLabelText(/^weight, set 1$/i)).toBeInTheDocument()
    expect(screen.queryByText(/hold in seconds/i)).not.toBeInTheDocument()
  })
})
