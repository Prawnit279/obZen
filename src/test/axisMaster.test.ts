/**
 * The joint-angle system behind the yoga pose figures.
 *
 * Worth knowing before reading further: nothing imports any of this. Every
 * export has zero consumers outside the module — including its `clamp`, which
 * is shadowed by an unrelated three-argument `clamp` in `lib/utils.ts` that is
 * the one actually in use. The yoga feature it was built for is flag-disabled
 * and its renderer was never wired up.
 *
 * These tests therefore pin a design rather than protect a behaviour. They are
 * here because the invariants fail silently if it is ever switched on: an angle
 * outside its limit is not an error, it is a clamp, and the pose renders as
 * something other than what was authored.
 */
import { describe, it, expect } from 'vitest'
import {
  clamp, constrainAngles, JOINT_LIMITS, NEUTRAL, POSE_ANGLES, PROPORTIONS, EASE,
} from '@/lib/axis-master'
import type { JointAngles } from '@/lib/axis-master'

const JOINTS = Object.keys(JOINT_LIMITS) as (keyof JointAngles)[]

// ── clamp ────────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('leaves a value inside the range alone', () => {
    expect(clamp(10, [0, 20])).toBe(10)
  })

  it('pulls a value back to the nearer bound', () => {
    expect(clamp(-5, [0, 20])).toBe(0)
    expect(clamp(99, [0, 20])).toBe(20)
  })

  it('treats both bounds as allowed', () => {
    expect(clamp(0, [0, 20])).toBe(0)
    expect(clamp(20, [0, 20])).toBe(20)
  })

  it('handles a range that crosses zero', () => {
    expect(clamp(-40, [-30, 60])).toBe(-30)
    expect(clamp(-15, [-30, 60])).toBe(-15)
  })

  it('collapses a zero-width range to its single value', () => {
    expect(clamp(5, [90, 90])).toBe(90)
  })
})

// ── constrainAngles ──────────────────────────────────────────────────────────

describe('constrainAngles', () => {
  it('fills every joint from neutral when given nothing', () => {
    expect(constrainAngles({})).toEqual(NEUTRAL)
  })

  it('keeps the angles it was given', () => {
    expect(constrainAngles({ kneeL: 90 }).kneeL).toBe(90)
  })

  it('pulls an impossible angle back inside the joint', () => {
    // A knee does not bend backwards, and 400° is not a shoulder.
    expect(constrainAngles({ kneeL: -50 }).kneeL).toBe(JOINT_LIMITS.kneeL[0])
    expect(constrainAngles({ shoulderR: 400 }).shoulderR).toBe(JOINT_LIMITS.shoulderR[1])
  })

  it('does not modify the object it was handed', () => {
    const input: Partial<JointAngles> = { kneeL: -50 }
    constrainAngles(input)
    expect(input).toEqual({ kneeL: -50 })
  })

  it('returns every joint, not only the ones supplied', () => {
    const result = constrainAngles({ neckTilt: 20 })
    for (const joint of JOINTS) expect(typeof result[joint]).toBe('number')
  })

  it('is idempotent — constraining a constrained pose changes nothing', () => {
    const once = constrainAngles({ kneeL: 999, hipR: -999 })
    expect(constrainAngles(once)).toEqual(once)
  })
})

// ── The data agreeing with its own constraints ───────────────────────────────

describe('JOINT_LIMITS', () => {
  it('covers every joint the type declares', () => {
    // A joint with no limit is unconstrained without saying so.
    for (const joint of Object.keys(NEUTRAL) as (keyof JointAngles)[]) {
      expect(JOINT_LIMITS[joint]).toBeDefined()
    }
  })

  it('states every range low end first', () => {
    for (const joint of JOINTS) {
      const [min, max] = JOINT_LIMITS[joint]
      expect(min).toBeLessThanOrEqual(max)
    }
  })
})

describe('NEUTRAL', () => {
  it('is itself a reachable pose', () => {
    // Every other pose starts from here. A neutral angle outside its own limit
    // would be silently clamped, so standing would not be the pose authored.
    for (const joint of JOINTS) {
      const [min, max] = JOINT_LIMITS[joint]
      expect(NEUTRAL[joint]).toBeGreaterThanOrEqual(min)
      expect(NEUTRAL[joint]).toBeLessThanOrEqual(max)
    }
  })

  it('survives constraining unchanged', () => {
    expect(constrainAngles(NEUTRAL)).toEqual(NEUTRAL)
  })

  it('stands on flat feet', () => {
    expect(NEUTRAL.ankleL).toBe(90)
    expect(NEUTRAL.ankleR).toBe(90)
  })
})

describe('POSE_ANGLES', () => {
  const poses = Object.entries(POSE_ANGLES)

  it('has poses to check', () => {
    expect(poses.length).toBeGreaterThan(0)
  })

  it('authors every angle inside the joint it belongs to', () => {
    // The guard that matters: an out-of-range angle is not rejected, it is
    // clamped, so the pose renders as something the author never chose.
    for (const [name, angles] of poses) {
      for (const [joint, value] of Object.entries(angles) as [keyof JointAngles, number][]) {
        const [min, max] = JOINT_LIMITS[joint]
        expect(
          value >= min && value <= max,
          `${name}.${joint} = ${value}, outside [${min}, ${max}]`
        ).toBe(true)
      }
    }
  })

  it('renders every pose unchanged through the constraint pass', () => {
    for (const [name, angles] of poses) {
      const constrained = constrainAngles(angles)
      for (const [joint, value] of Object.entries(angles) as [keyof JointAngles, number][]) {
        expect(constrained[joint], `${name}.${joint} was clamped`).toBe(value)
      }
    }
  })

  it('gives every pose a distinct lower-case key', () => {
    // Eight are clean kebab-case and "child's-pose" carries an apostrophe. It
    // is pinned rather than corrected because nothing looks these up — see the
    // note at the top of this file — so there is no lookup to match it against.
    const names = Object.keys(POSE_ANGLES)
    expect(new Set(names).size).toBe(names.length)
    for (const name of names) {
      expect(name).toBe(name.toLowerCase())
      expect(name).toMatch(/^[a-z0-9'-]+$/)
    }
  })
})

// ── Figure and motion constants ──────────────────────────────────────────────

describe('PROPORTIONS', () => {
  it('gives every limb a positive length', () => {
    for (const [part, value] of Object.entries(PROPORTIONS)) {
      expect(value, part).toBeGreaterThan(0)
    }
  })

  it('keeps the figure inside the height it claims', () => {
    // Head, torso and one leg stacked have to fit the canvas the renderer draws
    // into, or the figure is cropped at the feet.
    const stacked = PROPORTIONS.headR * 2 + PROPORTIONS.torsoLen
      + PROPORTIONS.upperLegLen + PROPORTIONS.lowerLegLen
    expect(stacked).toBeLessThanOrEqual(PROPORTIONS.totalHeight)
  })

  it('keeps arms slimmer than legs, and forearms shorter than upper arms', () => {
    expect(PROPORTIONS.armW).toBeLessThan(PROPORTIONS.legW)
    expect(PROPORTIONS.lowerArmLen).toBeLessThan(PROPORTIONS.upperArmLen)
    expect(PROPORTIONS.lowerLegLen).toBeLessThan(PROPORTIONS.upperLegLen)
  })
})

describe('EASE', () => {
  it('gives every phase a curve CSS will accept', () => {
    for (const [phase, curve] of Object.entries(EASE)) {
      expect(curve, phase).toMatch(/^(cubic-bezier\((-?[\d.]+,\s*){3}-?[\d.]+\)|ease(-in)?(-out)?|linear)$/)
    }
  })

  it('overshoots going into a pose and never coming out of one', () => {
    // The second control point above 1 is what makes a pose settle with a
    // little spring; a release that did the same would look like a stumble.
    expect(EASE.inPose).toMatch(/1\.\d/)
    expect(EASE.release).not.toMatch(/1\.[1-9]/)
  })
})
