/**
 * Axis-Master — skeletal joint angle type system for yoga pose animations.
 *
 * All angles in degrees. Positive = forward/inward flexion.
 * The SVG renderer (AnimatedPose) converts joint angles to path transforms.
 */

export interface JointAngles {
  // Head / neck
  neckTilt: number      // -30 to +60

  // Arms (+ = forward/inward, - = back)
  shoulderL: number     // -45 to +180
  shoulderR: number
  elbowL: number        // 0 to 145 (flexion only)
  elbowR: number
  wristL: number        // -35 to +35
  wristR: number

  // Hips / legs
  hipL: number          // -30 to +130
  hipR: number
  kneeL: number         // 0 to 140 (flexion only)
  kneeR: number
  ankleL: number        // 60 to 120 (neutral = 90)
  ankleR: number

  // Spine (segmented)
  spineBase: number     // -30 to +30
  spineMid: number
  spineTop: number

  // Global
  rotation: number      // whole-body Y-axis (0 = front-facing, 45 = 3/4, 90 = side)
}

// ── Joint constraints ──────────────────────────────────────────────────────

export const JOINT_LIMITS: Record<keyof JointAngles, [number, number]> = {
  neckTilt:  [-30, 60],
  shoulderL: [-45, 225], shoulderR: [-45, 225],
  elbowL:    [0, 145],   elbowR:    [0, 145],
  wristL:    [-35, 35],  wristR:    [-35, 35],
  hipL:      [-30, 150], hipR:      [-30, 150],
  kneeL:     [0, 140],   kneeR:     [0, 140],
  ankleL:    [60, 120],  ankleR:    [60, 120],
  spineBase: [-30, 30],  spineMid:  [-30, 30],  spineTop:  [-30, 30],
  rotation:  [0, 90],
}

export function clamp(val: number, [min, max]: [number, number]): number {
  return Math.max(min, Math.min(max, val))
}

export function constrainAngles(angles: Partial<JointAngles>): JointAngles {
  const result = { ...NEUTRAL, ...angles }
  for (const key of Object.keys(JOINT_LIMITS) as (keyof JointAngles)[]) {
    result[key] = clamp(result[key], JOINT_LIMITS[key])
  }
  return result
}

// ── Base proportions (px) ──────────────────────────────────────────────────

export const PROPORTIONS = {
  totalHeight: 160,
  headR: 13,
  torsoLen: 45,
  torsoW: 12,
  upperArmLen: 28,
  lowerArmLen: 24,
  armW: 9,
  upperLegLen: 38,
  lowerLegLen: 34,
  legW: 11,
} as const

// ── Easing curves ──────────────────────────────────────────────────────────

export const EASE = {
  inPose:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
  hold:     'ease-in-out',
  release:  'cubic-bezier(0.36, 0, 0.66, 0)',
} as const

// ── Neutral / standing pose ────────────────────────────────────────────────

export const NEUTRAL: JointAngles = {
  neckTilt:  0,
  shoulderL: 10,  shoulderR: 10,
  elbowL:    0,   elbowR:    0,
  wristL:    0,   wristR:    0,
  hipL:      5,   hipR:      5,
  kneeL:     0,   kneeR:     0,
  ankleL:    90,  ankleR:    90,
  spineBase: 0,   spineMid:  0,   spineTop: 0,
  rotation:  0,
}

// ── Named pose presets ─────────────────────────────────────────────────────

export const POSE_ANGLES: Record<string, Partial<JointAngles>> = {
  'mountain-pose': {
    neckTilt: 0,
    shoulderL: 5, shoulderR: 5,
    spineTop: 2,
  },

  'downward-facing-dog': {
    hipL: 90, hipR: 90,
    kneeL: 0, kneeR: 0,
    shoulderL: 180, shoulderR: 180,
    spineBase: -15, spineMid: -10, spineTop: -5,
    neckTilt: 30,
  },

  "child's-pose": {
    hipL: 130, hipR: 130,
    kneeL: 140, kneeR: 140,
    shoulderL: 160, shoulderR: 160,
    spineBase: 25, spineMid: 20, spineTop: 15,
    neckTilt: 45,
  },

  'warrior-1': {
    hipL: 60, hipR: 10,
    kneeL: 90, kneeR: 0,
    shoulderL: 175, shoulderR: 175,
    spineBase: -10,
  },

  'warrior-2': {
    hipL: 70, hipR: 70,
    kneeL: 90, kneeR: 0,
    shoulderL: 90, shoulderR: 90,
    rotation: 45,
  },

  'low-lunge': {
    hipL: 70, hipR: 5,
    kneeL: 90, kneeR: 130,
    shoulderL: 160, shoulderR: 160,
    spineBase: -5,
  },

  'cobra-pose': {
    spineBase: -25, spineMid: -15, spineTop: -10,
    neckTilt: -20,
    shoulderL: 15, shoulderR: 15,
    elbowL: 90, elbowR: 90,
    hipL: -10, hipR: -10,
  },

  'bridge-pose': {
    hipL: 80, hipR: 80,
    kneeL: 90, kneeR: 90,
    spineBase: -20, spineMid: -15, spineTop: -5,
  },

  'cat-pose': {
    spineBase: 20, spineMid: 25, spineTop: 20,
    neckTilt: 30,
  },

  'cow-pose': {
    spineBase: -20, spineMid: -20, spineTop: -15,
    neckTilt: -15,
  },
}
