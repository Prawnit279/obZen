/**
 * Render smoke tests for the leaf components the Train, Progress and Drum
 * views compose.
 *
 * Same rationale as renderSmoke.test.tsx, which covers the views themselves: a
 * crash inside a component that nothing mounts is invisible to `tsc` and to the
 * pure-function suite, and surfaces only as a blank screen. These six had no
 * test mounting them at all. Mounting each one under real data — the shipped
 * motion table, the shipped guides, seeded sessions — is the point; the
 * assertions stay behavioural so the SVG geometry can be redrawn freely.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { db } from '@/db/dexie'
import type { LoggedSet } from '@/db/dexie'
import { useProfileStore } from '@/store/useProfileStore'
import { ExerciseAnimation } from '@/components/modules/workout/ExerciseAnimation'
import { MuscleFigure } from '@/components/modules/workout/MuscleFigure'
import { ExerciseDetailSheet } from '@/components/modules/workout/ExerciseDetailSheet'
import { ProgressOverloadChart } from '@/components/modules/dashboard/ProgressOverloadChart'
import { WeeklyVolumeChart } from '@/components/modules/dashboard/WeeklyVolumeChart'
import { NotationViewer } from '@/components/modules/drum/NotationViewer'
import { FiveThreeOneCard } from '@/components/modules/workout/tools/FiveThreeOneCard'
import { EXERCISE_MOTIONS } from '@/data/exercise-motions'
import { MUSCLE_LABEL } from '@/data/exercise-guides'
import type { MuscleId } from '@/data/exercise-guides'
import { RUDIMENT_NOTATION } from '@/data/rudiment-notation'
import { PROFILES } from '@/config/profiles'

// ── fixtures ─────────────────────────────────────────────────────────────────

function set(weight: number, reps: number): LoggedSet {
  return { setNumber: 1, weight, reps, unit: 'lbs', timestamp: '2026-08-10T10:00:00.000Z' }
}

/** Today in the app's local-date form — the weekly chart only looks back 7 days. */
function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface SeedExercise { exerciseId: string; name: string; muscle: string; weight: number; reps: number }

async function seedSession(profileId: string, date: string, exercises: SeedExercise[]) {
  await db.workoutDaySessions.add({
    date,
    dayLabel: 'Day 1',
    profileId,
    focus: 'Test',
    exercises: exercises.map(e => ({
      exerciseId: e.exerciseId,
      name: e.name,
      muscle: e.muscle,
      status: 'complete' as const,
      sets: [set(e.weight, e.reps)],
    })),
    order: exercises.map(e => e.exerciseId),
    completedAt: `${date}T11:00:00.000Z`,
  })
}

/** Every numeric attribute the SVG components emit, so bad geometry can't hide. */
function numericAttributes(container: HTMLElement): string[] {
  const values: string[] = []
  container.querySelectorAll('svg *').forEach(el => {
    for (const attr of Array.from(el.attributes)) values.push(attr.value)
  })
  return values
}

/**
 * Point `prefers-reduced-motion` at a fixed answer. jsdom ships no media-query
 * engine, so the hook has to be fed its match rather than asked for one.
 */
function prefersReducedMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

beforeEach(async () => {
  await db.delete()
  await db.open()
  useProfileStore.setState({ activeId: 'pronit' })
  // Motion on by default; the reduced-motion tests opt in.
  prefersReducedMotion(false)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ── ExerciseAnimation ────────────────────────────────────────────────────────

describe('ExerciseAnimation — renders without crashing', () => {
  const ids = Object.keys(EXERCISE_MOTIONS)

  it('mounts every motion in the shipped table', () => {
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      const { container, unmount } = render(
        <ExerciseAnimation motion={EXERCISE_MOTIONS[id]} label={id} />
      )
      expect(container.querySelector('svg')).not.toBeNull()
      unmount()
    }
  })

  it('emits no NaN geometry for any motion', () => {
    // The renderer derives every coordinate from the pose data. A missing joint
    // or a bad spread calculation shows up as NaN in an attribute rather than
    // as a thrown error, so the figure silently disappears instead of crashing.
    const bad: string[] = []
    for (const id of ids) {
      const { container, unmount } = render(
        <ExerciseAnimation motion={EXERCISE_MOTIONS[id]} label={id} />
      )
      if (numericAttributes(container).some(v => v.includes('NaN'))) bad.push(id)
      unmount()
    }
    expect(bad).toEqual([])
  })

  it('labels the figure with the exercise name', () => {
    render(<ExerciseAnimation motion={EXERCISE_MOTIONS['barbell-squat']} label="Barbell Squat" />)
    expect(screen.getByRole('img', { name: /animated demonstration of barbell squat/i })).toBeInTheDocument()
  })

  it('shows the motion caption', () => {
    const motion = EXERCISE_MOTIONS['deadlift']
    render(<ExerciseAnimation motion={motion} label="Deadlift" />)
    expect(screen.getByText(motion.caption)).toBeInTheDocument()
  })

  it('animates each drawn element', () => {
    // SMIL <animate> children are the whole mechanism — a figure with none is
    // a still frame, which is what a broken timing helper would produce.
    const { container } = render(
      <ExerciseAnimation motion={EXERCISE_MOTIONS['barbell-squat']} label="Barbell Squat" />
    )
    expect(container.querySelectorAll('animate').length).toBeGreaterThan(0)
  })

  it('draws a bench for both the profile and the head-on rig', () => {
    // Regression guard: the head-on bench rect is centred on the body rather
    // than following the pose's x, and previously rendered off-canvas.
    const benched = ids.filter(id => EXERCISE_MOTIONS[id].bench)
    expect(benched.length).toBeGreaterThan(0)

    for (const id of benched) {
      const { container, unmount } = render(
        <ExerciseAnimation motion={EXERCISE_MOTIONS[id]} label={id} />
      )
      const rects = Array.from(container.querySelectorAll('rect'))
      expect(rects.length, `${id} draws no bench`).toBeGreaterThan(0)
      // Inside the 200-unit canvas, at a real width.
      for (const r of rects) {
        const x = Number(r.getAttribute('x'))
        const w = Number(r.getAttribute('width'))
        expect(x, `${id} bench x`).toBeGreaterThanOrEqual(0)
        expect(x + w, `${id} bench right edge`).toBeLessThanOrEqual(200)
        expect(w, `${id} bench width`).toBeGreaterThan(0)
      }
      unmount()
    }
  })

  it('omits the floor line when the motion opts out', () => {
    const grounded = ids.find(id => EXERCISE_MOTIONS[id].ground !== false)!
    const airborne = ids.find(id => EXERCISE_MOTIONS[id].ground === false)!

    const a = render(<ExerciseAnimation motion={EXERCISE_MOTIONS[grounded]} label={grounded} />)
    const withGround = a.container.querySelectorAll('line[stroke-dasharray]').length
    a.unmount()

    const b = render(<ExerciseAnimation motion={EXERCISE_MOTIONS[airborne]} label={airborne} />)
    const withoutGround = b.container.querySelectorAll('line[stroke-dasharray]').length

    expect(withGround).toBeGreaterThan(0)
    expect(withoutGround).toBe(0)
  })

  it('hangs loaded iron only on the movements that carry it', () => {
    // Bars and dumbbells are loaded, so they draw in the iron and plate tokens.
    // A pull-up bar is fixed apparatus and a bodyweight movement holds nothing,
    // so neither should put iron in the lifter's hands.
    const byEquipment = (kind: string) => ids.find(id => EXERCISE_MOTIONS[id].equipment === kind)

    for (const kind of ['bar', 'dumbbell'] as const) {
      const id = byEquipment(kind)
      expect(id, `no motion uses ${kind}`).toBeDefined()
      const { container, unmount } = render(
        <ExerciseAnimation motion={EXERCISE_MOTIONS[id!]} label={id!} />
      )
      expect(container.innerHTML, `${kind} draws no iron`).toContain('--equip-iron')
      expect(container.innerHTML, `${kind} draws no plates`).toContain('--equip-plate')
      unmount()
    }

    for (const kind of ['fixedBar', 'none'] as const) {
      const id = byEquipment(kind)
      expect(id, `no motion uses ${kind}`).toBeDefined()
      const { container, unmount } = render(
        <ExerciseAnimation motion={EXERCISE_MOTIONS[id!]} label={id!} />
      )
      expect(container.innerHTML, `${kind} loads the lifter up`).not.toContain('--equip-iron')
      unmount()
    }
  })

  it('holds the opening pose when the viewer prefers reduced motion', () => {
    // SMIL ignores CSS, so the <animate> elements have to be left out rather
    // than hidden. Every shape carries pose 0 in its own attributes, so what
    // remains is the first frame, standing still.
    const motion = EXERCISE_MOTIONS['barbell-squat']
    const moving = render(<ExerciseAnimation motion={motion} label="Barbell Squat" />)
    const movingLimb = moving.container.querySelector('line[stroke-width="8"]')!
    const movingY = movingLimb.getAttribute('y1')
    moving.unmount()

    prefersReducedMotion(true)
    const { container } = render(<ExerciseAnimation motion={motion} label="Barbell Squat" />)

    expect(container.querySelectorAll('animate').length).toBe(0)
    // Same first frame as the animated figure — the shapes are all still there.
    expect(container.querySelectorAll('line').length).toBeGreaterThan(0)
    expect(container.querySelector('line[stroke-width="8"]')!.getAttribute('y1')).toBe(movingY)
    expect(movingY).toBe(String(motion.poses[0].hip[1]))
  })

  it('describes a still figure as a starting position, not a demonstration', () => {
    prefersReducedMotion(true)
    render(<ExerciseAnimation motion={EXERCISE_MOTIONS['deadlift']} label="Deadlift" />)
    expect(screen.getByRole('img', { name: /starting position for deadlift/i })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /animated demonstration/i })).not.toBeInTheDocument()
  })

  it('keeps every motion drawable with animation switched off', () => {
    prefersReducedMotion(true)
    for (const id of ids) {
      const { container, unmount } = render(
        <ExerciseAnimation motion={EXERCISE_MOTIONS[id]} label={id} />
      )
      expect(container.querySelectorAll('animate').length, `${id} still animates`).toBe(0)
      expect(numericAttributes(container).some(v => v.includes('NaN')), `${id} NaN`).toBe(false)
      unmount()
    }
  })

  it('takes every colour from a CSS variable', () => {
    const { container } = render(
      <ExerciseAnimation motion={EXERCISE_MOTIONS['bench-press']} label="Bench Press" />
    )
    const colours = Array.from(container.querySelectorAll('svg *')).flatMap(el =>
      ['fill', 'stroke'].map(a => el.getAttribute(a)).filter((v): v is string => !!v && v !== 'none')
    )
    expect(colours.length).toBeGreaterThan(0)
    expect(colours.filter(c => !c.startsWith('var(--'))).toEqual([])
  })
})

// ── MuscleFigure ─────────────────────────────────────────────────────────────

describe('MuscleFigure — renders without crashing', () => {
  const ALL_MUSCLES = Object.keys(MUSCLE_LABEL) as MuscleId[]

  it('draws both the front and the back view', () => {
    render(<MuscleFigure primary={['glutes']} secondary={['hamstrings']} />)
    expect(screen.getByRole('img', { name: /front view of the muscles worked/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /back view of the muscles worked/i })).toBeInTheDocument()
  })

  it('mounts with no muscles highlighted', () => {
    const { container } = render(<MuscleFigure primary={[]} />)
    expect(container.querySelectorAll('svg').length).toBe(2)
  })

  it('shades every muscle the guides can name', () => {
    // Each MuscleId has to reach a drawn shape on one of the two figures,
    // otherwise a guide can list a muscle the diagram never highlights.
    const unshaded: MuscleId[] = []
    for (const id of ALL_MUSCLES) {
      const { container, unmount } = render(<MuscleFigure primary={[id]} />)
      if (!container.innerHTML.includes('var(--muscle-primary)')) unshaded.push(id)
      unmount()
    }
    expect(unshaded).toEqual([])
  })

  it('distinguishes primary movers from assisting muscles', () => {
    const { container } = render(<MuscleFigure primary={['chest']} secondary={['triceps']} />)
    expect(container.innerHTML).toContain('var(--muscle-primary)')
    expect(container.innerHTML).toContain('var(--muscle-secondary)')
  })

  it('takes every colour from a CSS variable', () => {
    const { container } = render(<MuscleFigure primary={['quads']} secondary={['glutes']} />)
    const colours = Array.from(container.querySelectorAll('svg *')).flatMap(el =>
      ['fill', 'stroke'].map(a => el.getAttribute(a)).filter((v): v is string => !!v && v !== 'none')
    )
    expect(colours.length).toBeGreaterThan(0)
    expect(colours.filter(c => !c.startsWith('var(--'))).toEqual([])
  })
})

// ── ExerciseDetailSheet ──────────────────────────────────────────────────────

describe('ExerciseDetailSheet — renders without crashing', () => {
  it('shows the movement, its muscles and its steps', () => {
    render(
      <ExerciseDetailSheet
        exerciseId="deadlift" name="Deadlift" muscle="legs" target="4 × 5"
        onClose={() => {}}
      />
    )
    expect(screen.getByRole('heading', { name: 'Deadlift' })).toBeInTheDocument()
    expect(screen.getByText('4 × 5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /animated demonstration of deadlift/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /front view of the muscles worked/i })).toBeInTheDocument()
    expect(screen.getByText(/how to perform it/i)).toBeInTheDocument()
    expect(screen.getByText(/setting up/i)).toBeInTheDocument()
  })

  it('mounts for an exercise with no guide and no motion', () => {
    render(<ExerciseDetailSheet exerciseId="not-a-real-lift" name="Mystery Lift" onClose={() => {}} />)
    expect(screen.getByText(/no guide for this movement yet/i)).toBeInTheDocument()
  })

  it('closes via the close button', async () => {
    const onClose = vi.fn()
    render(<ExerciseDetailSheet exerciseId="deadlift" name="Deadlift" onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('swaps straight away when nothing has been logged', async () => {
    const onSwap = vi.fn()
    render(
      <ExerciseDetailSheet
        exerciseId="barbell-back-squat" name="Barbell Back Squat" loggedSetCount={0}
        onSwap={onSwap} onClose={() => {}}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /goblet squat/i }))
    expect(onSwap).toHaveBeenCalledWith('Goblet Squat')
  })

  it('confirms before a swap would discard logged sets', async () => {
    const onSwap = vi.fn()
    render(
      <ExerciseDetailSheet
        exerciseId="barbell-back-squat" name="Barbell Back Squat" loggedSetCount={3}
        onSwap={onSwap} onClose={() => {}}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /goblet squat/i }))

    expect(onSwap).not.toHaveBeenCalled()
    expect(screen.getByText(/your 3 logged sets will be lost/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /^swap$/i }))
    expect(onSwap).toHaveBeenCalledWith('Goblet Squat')
  })

  it('backs out of the confirm without swapping', async () => {
    const onSwap = vi.fn()
    render(
      <ExerciseDetailSheet
        exerciseId="barbell-back-squat" name="Barbell Back Squat" loggedSetCount={2}
        onSwap={onSwap} onClose={() => {}}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /goblet squat/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onSwap).not.toHaveBeenCalled()
    expect(screen.queryByText(/will be lost/i)).not.toBeInTheDocument()
  })

  it('disables a swap that is already on the day', async () => {
    const onSwap = vi.fn()
    render(
      <ExerciseDetailSheet
        exerciseId="barbell-back-squat" name="Barbell Back Squat"
        presentExerciseIds={['goblet-squat']} onSwap={onSwap} onClose={() => {}}
      />
    )
    expect(screen.getByRole('button', { name: /goblet squat/i })).toBeDisabled()
    expect(screen.getByText(/already added/i)).toBeInTheDocument()
  })
})

// ── ProgressOverloadChart ────────────────────────────────────────────────────

describe('ProgressOverloadChart — renders without crashing', () => {
  it('shows the empty state when nothing is logged', async () => {
    render(<ProgressOverloadChart />)
    expect(await screen.findByText(/log workouts to see overload progress/i)).toBeInTheDocument()
  })

  it('plots the active profile’s key lifts from day sessions', async () => {
    // The chart used to read a table nothing writes to; seeding real day
    // sessions is what proves it is wired to the live one.
    await seedSession('pronit', '2026-08-10', [
      { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'legs', weight: 225, reps: 5 },
      { exerciseId: 'bench-press', name: 'Bench Press', muscle: 'chest', weight: 155, reps: 5 },
    ])
    await seedSession('pronit', '2026-08-17', [
      { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'legs', weight: 245, reps: 5 },
    ])

    const { container } = render(<ProgressOverloadChart />)
    await screen.findByText(/progressive overload/i)

    await waitFor(() => expect(container.querySelectorAll('path[d]').length).toBeGreaterThan(0))
    expect(screen.getByText(/barbell squat/i)).toBeInTheDocument()
    expect(screen.getByText(/bench press/i)).toBeInTheDocument()
  })

  it('ignores another profile’s training', async () => {
    await seedSession('aishwarya', '2026-08-10', [
      { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'legs', weight: 95, reps: 8 },
    ])
    render(<ProgressOverloadChart />)
    expect(await screen.findByText(/log workouts to see overload progress/i)).toBeInTheDocument()
  })

  it('charts each profile’s own key lifts', async () => {
    useProfileStore.setState({ activeId: 'aishwarya' })
    const [firstLift] = PROFILES.aishwarya.progress.keyLiftIds
    await seedSession('aishwarya', '2026-08-10', [
      { exerciseId: firstLift, name: 'Hip Thrust Machine', muscle: 'legs', weight: 135, reps: 12 },
    ])

    render(<ProgressOverloadChart />)
    await screen.findByText(/progressive overload/i)

    // Her legend leads with her own lifts, not the powerlifting three.
    expect(screen.getByText(/hip thrust machine/i)).toBeInTheDocument()
    expect(screen.queryByText(/bench press/i)).not.toBeInTheDocument()
  })

  it('skips sets that were never performed', async () => {
    await db.workoutDaySessions.add({
      date: '2026-08-10',
      dayLabel: 'Day 1',
      profileId: 'pronit',
      focus: 'Test',
      exercises: [{
        exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'legs', status: 'pending',
        // A placeholder row from the logger — no reps, no timestamp.
        sets: [{ setNumber: 1, weight: 225, reps: 0, unit: 'lbs', timestamp: '' }],
      }],
      order: ['barbell-squat'],
    })
    render(<ProgressOverloadChart />)
    expect(await screen.findByText(/log workouts to see overload progress/i)).toBeInTheDocument()
  })
})

// ── WeeklyVolumeChart ────────────────────────────────────────────────────────

describe('WeeklyVolumeChart — renders without crashing', () => {
  it('shows the empty state for a week with no training', async () => {
    render(<WeeklyVolumeChart />)
    expect(await screen.findByText(/no workout data this week/i)).toBeInTheDocument()
  })

  it('stacks volume by muscle group for the current week', async () => {
    await seedSession('pronit', todayIso(), [
      { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'legs', weight: 225, reps: 5 },
      { exerciseId: 'bench-press', name: 'Bench Press', muscle: 'chest', weight: 155, reps: 5 },
    ])

    const { container } = render(<WeeklyVolumeChart />)
    await screen.findByText(/weekly volume/i)

    await waitFor(() => expect(container.querySelectorAll('rect').length).toBeGreaterThan(0))
    expect(screen.queryByText(/no workout data this week/i)).not.toBeInTheDocument()
  })

  it('ignores another profile’s training', async () => {
    await seedSession('aishwarya', todayIso(), [
      { exerciseId: 'hip-thrust-machine', name: 'Hip Thrust Machine', muscle: 'legs', weight: 135, reps: 12 },
    ])
    render(<WeeklyVolumeChart />)
    expect(await screen.findByText(/no workout data this week/i)).toBeInTheDocument()
  })

  it('leaves last week’s training out of the window', async () => {
    const old = new Date()
    old.setDate(old.getDate() - 30)
    const oldIso = `${old.getFullYear()}-${String(old.getMonth() + 1).padStart(2, '0')}-${String(old.getDate()).padStart(2, '0')}`
    await seedSession('pronit', oldIso, [
      { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'legs', weight: 225, reps: 5 },
    ])
    render(<WeeklyVolumeChart />)
    expect(await screen.findByText(/no workout data this week/i)).toBeInTheDocument()
  })

  it('names every muscle group in the legend', async () => {
    await seedSession('pronit', todayIso(), [
      { exerciseId: 'barbell-squat', name: 'Barbell Squat', muscle: 'legs', weight: 225, reps: 5 },
    ])
    render(<WeeklyVolumeChart />)
    await screen.findByText(/weekly volume/i)

    for (const muscle of ['legs', 'back', 'shoulders', 'arms', 'chest', 'core']) {
      expect(screen.getByText(muscle)).toBeInTheDocument()
    }
  })
})

// ── FiveThreeOneCard ─────────────────────────────────────────────────────────

describe('FiveThreeOneCard — renders without crashing', () => {
  // The card links to the 5/3/1 guide, so it needs a router around it.
  const renderCard = () =>
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FiveThreeOneCard />
      </MemoryRouter>
    )

  it('mounts before any input, asking for an estimated 1RM', () => {
    renderCard()
    expect(screen.getByText(/awaiting|an estimated 1rm/i)).toBeInTheDocument()
  })

  it('states the rep range Joker sets are meant for', async () => {
    renderCard()
    // Joker sets only appear once there is a Training Max to work from.
    await userEvent.type(screen.getByPlaceholderText('315'), '300')
    expect(await screen.findByText(/joker sets · 1–3 reps/i)).toBeInTheDocument()
  })

  it('rounds the training max and the wave to 5 lb', async () => {
    renderCard()
    await userEvent.type(screen.getByPlaceholderText('315'), '303')
    // TM = 90% of 303 = 272.7 -> 275.
    expect(await screen.findByText(/275/)).toBeInTheDocument()
  })
})

// ── NotationViewer ───────────────────────────────────────────────────────────

describe('NotationViewer — renders without crashing', () => {
  beforeEach(() => {
    // VexFlow measures text through a canvas; jsdom has none. It already
    // handles a null context, so stubbing it keeps the not-implemented noise
    // out of the run without changing what gets drawn.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    document.documentElement.removeAttribute('style')
  })

  it('draws the staves for a rudiment', async () => {
    const data = RUDIMENT_NOTATION[0]
    const { container } = render(<NotationViewer data={data} />)

    // VexFlow is imported dynamically, so the SVG lands a tick after mount.
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull(), { timeout: 4000 })
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0)
  })

  it('shows the title, tempo and time signature', () => {
    const data = RUDIMENT_NOTATION[0]
    render(<NotationViewer data={data} />)
    expect(screen.getByText(data.title)).toBeInTheDocument()
    expect(
      screen.getByText(`${data.tempo} BPM · ${data.timeSignature.beats}/${data.timeSignature.value}`)
    ).toBeInTheDocument()
  })

  it('takes its colours from the theme rather than hardcoded hex', async () => {
    // The tokens are read off the document at draw time, which is what lets the
    // score follow the light theme. Setting them inline proves they are read.
    document.documentElement.style.setProperty('--bg', 'rgb(1, 2, 3)')
    document.documentElement.style.setProperty('--accent', 'rgb(4, 5, 6)')

    const { container } = render(<NotationViewer data={RUDIMENT_NOTATION[0]} />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull(), { timeout: 4000 })

    const svg = container.querySelector('svg') as SVGElement
    expect(svg.style.background).toBe('rgb(1, 2, 3)')
  })

  it('paints the score in the theme foreground, not a fixed white', async () => {
    // The restyle sweep runs after VexFlow draws, so it is the last word on
    // colour: if it hardcodes a light hex, a light theme renders the score
    // near-invisible whatever the stave styles said.
    document.documentElement.style.setProperty('--accent', 'rgb(28, 28, 33)')
    document.documentElement.style.setProperty('--muted', 'rgb(90, 90, 100)')

    const { container } = render(<NotationViewer data={RUDIMENT_NOTATION[0]} />)
    await waitFor(() => expect(container.querySelector('svg path')).not.toBeNull(), { timeout: 4000 })

    const painted = Array.from(container.querySelectorAll('svg path, svg rect, svg polygon, svg text'))
      .flatMap(el => [el.getAttribute('fill'), el.getAttribute('stroke')])
      .filter((v): v is string => !!v && v !== 'none')

    expect(painted.length).toBeGreaterThan(0)
    const offTheme = painted.filter(c => c !== 'rgb(28, 28, 33)' && c !== 'rgb(90, 90, 100)')
    expect(offTheme).toEqual([])
  })

  it('mounts every shipped rudiment', async () => {
    for (const data of RUDIMENT_NOTATION) {
      const { container, unmount } = render(<NotationViewer data={data} />)
      await waitFor(() => expect(container.querySelector('svg')).not.toBeNull(), { timeout: 4000 })
      unmount()
    }
  })
})
