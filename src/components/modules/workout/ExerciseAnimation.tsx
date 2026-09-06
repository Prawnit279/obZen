import { createContext, useContext } from 'react'
import type { ComponentProps } from 'react'
import type { ExerciseMotion, Pose } from '@/data/exercise-motions'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * A looping figure performing one rep, drawn facing the viewer.
 *
 * Each exercise supplies joint positions for a few key moments of the lift and
 * SMIL interpolates between them, so every movement has its own path. The pose
 * data carries the motion in its vertical values — squat depth, bar height, hip
 * travel — while limbs are placed left and right of the centre line here, which
 * is what makes the figure read as a person rather than a flat profile.
 *
 * Pure declarative SVG: a couple of KB, themeable, no images, keeps animating
 * offline, and holds the opening pose under prefers-reduced-motion.
 */

const LIMB = 'var(--muscle-body)'
const OUTLINE = 'var(--muscle-outline)'
const IRON = 'var(--equip-iron)'
const PLATE = 'var(--equip-plate)'

const MID = 100

/** Set when the viewer prefers reduced motion, so the figure holds still. */
const StillContext = createContext(false)

/**
 * One SMIL animation, left out entirely under prefers-reduced-motion.
 *
 * Dropping the element is the only thing that works — SMIL ignores CSS, so a
 * `display: none` rule on <animate> computes to none while the animation runs
 * on regardless. Every shape already carries the opening pose in its own
 * attributes, so with these gone the figure simply holds that first frame.
 */
function Animate(props: ComponentProps<'animate'>) {
  const still = useContext(StillContext)
  if (still) return null
  return <animate {...props} />
}

/** How far each joint sits from the centre line, in canvas units. */
const SPREAD = { shoulder: 15, elbow: 17, hand: 18, hip: 8, knee: 10, ankle: 11 }

/**
 * Lateral travel of the hands. In the source poses a hand moving away from the
 * body reads as "out to the side" — that is what makes a lateral raise or a row
 * look different from a curl.
 */
function handSpread(pose: Pose): number {
  return SPREAD.hand + Math.max(0, pose.hand[0] - MID) * 0.7
}
function elbowSpread(pose: Pose): number {
  return SPREAD.elbow + Math.max(0, pose.elbow[0] - MID) * 0.35
}

type Side = -1 | 1

function xOf(pose: Pose, joint: keyof Pose, side: Side): number {
  switch (joint) {
    case 'hand':  return MID + side * handSpread(pose)
    case 'elbow': return MID + side * elbowSpread(pose)
    case 'neck':  return MID + side * SPREAD.shoulder
    case 'hip':   return MID + side * SPREAD.hip
    case 'knee':  return MID + side * SPREAD.knee
    case 'ankle': return MID + side * SPREAD.ankle
    default:      return MID
  }
}

/** Poses played forward then back, so the rep returns to its start smoothly. */
function loopOf(motion: ExerciseMotion): Pose[] {
  return [...motion.poses, ...motion.poses.slice(0, -1).reverse()]
}

/**
 * Whether to draw this movement in profile instead of facing the viewer. Two
 * separate reasons, so two separate mechanisms:
 *
 * Lying and reclined work — bench, hip thrust, push-up, leg press, floor core —
 * lays the body out horizontally, leaving no vertical room for a front-on
 * figure (a bench press has a 2px torso). That is read off the pose, so new
 * motions classify themselves.
 *
 * Hinges and rows travel front-to-back, the one axis a front view cannot show.
 * Geometry cannot catch those: an RDL starts standing tall, so its opening pose
 * is indistinguishable from a squat's. They opt in explicitly instead.
 */
function isProfileView(motion: ExerciseMotion): boolean {
  if (motion.view === 'side') return true
  const p = motion.poses[0]
  return Math.abs(p.hip[1] - p.neck[1]) < 18
}

function timing(motion: ExerciseMotion) {
  const n = motion.poses.length * 2 - 1
  return {
    dur: `${motion.durationSec}s`,
    repeatCount: 'indefinite' as const,
    keyTimes: Array.from({ length: n }, (_, i) => (i / (n - 1)).toFixed(3)).join(';'),
    calcMode: 'spline' as const,
    keySplines: Array.from({ length: n - 1 }, () => '0.4 0 0.6 1').join(';'),
  }
}

const xs = (motion: ExerciseMotion, j: keyof Pose, side: Side) =>
  loopOf(motion).map(p => xOf(p, j, side).toFixed(1)).join(';')
const ys = (motion: ExerciseMotion, j: keyof Pose) =>
  loopOf(motion).map(p => p[j][1]).join(';')

/** Shift every value in a SMIL list by a fixed amount. */
const shiftBy = (values: string, by: number) =>
  values.split(';').map(v => (Number(v) + by).toFixed(1)).join(';')

/** One limb segment on one side of the body. */
function Limb({
  motion, from, to, side, width = 5.5,
}: { motion: ExerciseMotion; from: keyof Pose; to: keyof Pose; side: Side; width?: number }) {
  const t = timing(motion)
  const p0 = motion.poses[0]
  return (
    <line
      x1={xOf(p0, from, side)} y1={p0[from][1]}
      x2={xOf(p0, to, side)}   y2={p0[to][1]}
      stroke={LIMB} strokeWidth={width} strokeLinecap="round"
    >
      <Animate attributeName="x1" values={xs(motion, from, side)} {...t} />
      <Animate attributeName="y1" values={ys(motion, from)} {...t} />
      <Animate attributeName="x2" values={xs(motion, to, side)} {...t} />
      <Animate attributeName="y2" values={ys(motion, to)} {...t} />
    </line>
  )
}

/** Half-width of the torso at the hips — narrower than the shoulders, so the
 *  trunk tapers the way a body does instead of reading as a slab. */
const WAIST = 10

/** Trunk, neck and head. The trunk is a taper, animated as a polygon. */
function Torso({ motion }: { motion: ExerciseMotion }) {
  const t = timing(motion)
  const p0 = motion.poses[0]
  const SH = SPREAD.shoulder

  const trunkAt = (p: Pose) =>
    `${MID - SH},${p.neck[1]} ${MID + SH},${p.neck[1]} ${MID + WAIST},${p.hip[1]} ${MID - WAIST},${p.hip[1]}`

  return (
    <>
      {/* neck */}
      <line x1={MID} y1={p0.head[1]} x2={MID} y2={p0.neck[1]} stroke={LIMB} strokeWidth="6">
        <Animate attributeName="y1" values={ys(motion, 'head')} {...t} />
        <Animate attributeName="y2" values={ys(motion, 'neck')} {...t} />
      </line>

      <polygon points={trunkAt(p0)} fill={LIMB}>
        <Animate attributeName="points" values={loopOf(motion).map(trunkAt).join(';')} {...t} />
      </polygon>

      {/* rounded shoulder caps, so the arms hang off a deltoid rather than a corner */}
      {([-1, 1] as Side[]).map(s => (
        <circle key={s} cx={MID + s * SH} cy={p0.neck[1]} r="4.5" fill={LIMB}>
          <Animate attributeName="cy" values={ys(motion, 'neck')} {...t} />
        </circle>
      ))}

      <circle cx={MID} cy={p0.head[1]} r="9" fill={LIMB} stroke={OUTLINE} strokeWidth="0.8">
        <Animate attributeName="cy" values={ys(motion, 'head')} {...t} />
      </circle>
    </>
  )
}

/** The barbell, dumbbells or pull-up bar the figure is holding. */
function Equipment({ motion }: { motion: ExerciseMotion }) {
  const t = timing(motion)
  const p0 = motion.poses[0]

  if (motion.equipment === 'none') return null

  // A pull-up bar is fixed in space, above the hands.
  if (motion.equipment === 'fixedBar') {
    const y = p0.hand[1]
    return (
      <>
        <line x1={MID - 46} y1={y} x2={MID + 46} y2={y} stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
        <line x1={MID - 46} y1={y - 9} x2={MID - 46} y2={y} stroke={OUTLINE} strokeWidth="2.5" />
        <line x1={MID + 46} y1={y - 9} x2={MID + 46} y2={y} stroke={OUTLINE} strokeWidth="2.5" />
      </>
    )
  }

  const handY = ys(motion, 'hand')
  const leftX = xs(motion, 'hand', -1)
  const rightX = xs(motion, 'hand', 1)

  // A barbell runs through both hands, with plates outboard of the grip.
  if (motion.equipment === 'bar') {
    const l = xOf(p0, 'hand', -1)
    const r = xOf(p0, 'hand', 1)
    return (
      <>
        <line x1={l - 17} y1={p0.hand[1]} x2={r + 17} y2={p0.hand[1]} stroke={IRON} strokeWidth="3.5" strokeLinecap="round">
          <Animate attributeName="x1" values={shiftBy(leftX, -17)} {...t} />
          <Animate attributeName="y1" values={handY} {...t} />
          <Animate attributeName="x2" values={shiftBy(rightX, 17)} {...t} />
          <Animate attributeName="y2" values={handY} {...t} />
        </line>
        <circle cx={l - 11} cy={p0.hand[1]} r="8" fill={PLATE} stroke={OUTLINE} strokeWidth="1">
          <Animate attributeName="cx" values={shiftBy(leftX, -11)} {...t} />
          <Animate attributeName="cy" values={handY} {...t} />
        </circle>
        <circle cx={r + 11} cy={p0.hand[1]} r="8" fill={PLATE} stroke={OUTLINE} strokeWidth="1">
          <Animate attributeName="cx" values={shiftBy(rightX, 11)} {...t} />
          <Animate attributeName="cy" values={handY} {...t} />
        </circle>
      </>
    )
  }

  // Dumbbells: one per hand, a short handle with a bell at each end.
  const bell = (side: Side) => {
    const vals = side === -1 ? leftX : rightX
    const x0 = xOf(p0, 'hand', side)
    return (
      <g key={side}>
        <line x1={x0 - 7} y1={p0.hand[1]} x2={x0 + 7} y2={p0.hand[1]} stroke={IRON} strokeWidth="3" strokeLinecap="round">
          <Animate attributeName="x1" values={shiftBy(vals, -7)} {...t} />
          <Animate attributeName="y1" values={handY} {...t} />
          <Animate attributeName="x2" values={shiftBy(vals, 7)} {...t} />
          <Animate attributeName="y2" values={handY} {...t} />
        </line>
        <circle cx={x0 - 7} cy={p0.hand[1]} r="5" fill={PLATE} stroke={OUTLINE} strokeWidth="0.9">
          <Animate attributeName="cx" values={shiftBy(vals, -7)} {...t} />
          <Animate attributeName="cy" values={handY} {...t} />
        </circle>
        <circle cx={x0 + 7} cy={p0.hand[1]} r="5" fill={PLATE} stroke={OUTLINE} strokeWidth="0.9">
          <Animate attributeName="cx" values={shiftBy(vals, 7)} {...t} />
          <Animate attributeName="cy" values={handY} {...t} />
        </circle>
      </g>
    )
  }
  return <>{[bell(-1), bell(1)]}</>
}

// ── Side-on rig, for lying and reclined movements ────────────────────────────

const sideXs = (motion: ExerciseMotion, j: keyof Pose) =>
  loopOf(motion).map(p => p[j][0]).join(';')

/** A limb drawn in profile, following both axes of the pose. */
function SideLimb({
  motion, from, to, width = 5.5,
}: { motion: ExerciseMotion; from: keyof Pose; to: keyof Pose; width?: number }) {
  const t = timing(motion)
  const p0 = motion.poses[0]
  return (
    <line
      x1={p0[from][0]} y1={p0[from][1]} x2={p0[to][0]} y2={p0[to][1]}
      stroke={LIMB} strokeWidth={width} strokeLinecap="round"
    >
      <Animate attributeName="x1" values={sideXs(motion, from)} {...t} />
      <Animate attributeName="y1" values={ys(motion, from)} {...t} />
      <Animate attributeName="x2" values={sideXs(motion, to)} {...t} />
      <Animate attributeName="y2" values={ys(motion, to)} {...t} />
    </line>
  )
}

/** Bar or dumbbell held in the single visible hand of a profile view. */
function SideEquipment({ motion }: { motion: ExerciseMotion }) {
  const t = timing(motion)
  const p0 = motion.poses[0]
  if (motion.equipment === 'none') return null

  if (motion.equipment === 'fixedBar') {
    const [x, y] = p0.hand
    return <line x1={x - 30} y1={y} x2={x + 30} y2={y} stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
  }

  const hx = sideXs(motion, 'hand')
  const hy = ys(motion, 'hand')
  const half = motion.equipment === 'bar' ? 20 : 8
  const plate = motion.equipment === 'bar' ? 8 : 5

  return (
    <>
      <line
        x1={p0.hand[0] - half} y1={p0.hand[1]} x2={p0.hand[0] + half} y2={p0.hand[1]}
        stroke={IRON} strokeWidth="3.5" strokeLinecap="round"
      >
        <Animate attributeName="x1" values={shiftBy(hx, -half)} {...t} />
        <Animate attributeName="y1" values={hy} {...t} />
        <Animate attributeName="x2" values={shiftBy(hx, half)} {...t} />
        <Animate attributeName="y2" values={hy} {...t} />
      </line>
      <circle cx={p0.hand[0] - half} cy={p0.hand[1]} r={plate} fill={PLATE} stroke={OUTLINE} strokeWidth="1">
        <Animate attributeName="cx" values={shiftBy(hx, -half)} {...t} />
        <Animate attributeName="cy" values={hy} {...t} />
      </circle>
      <circle cx={p0.hand[0] + half} cy={p0.hand[1]} r={plate} fill={PLATE} stroke={OUTLINE} strokeWidth="1">
        <Animate attributeName="cx" values={shiftBy(hx, half)} {...t} />
        <Animate attributeName="cy" values={hy} {...t} />
      </circle>
    </>
  )
}

function SideRig({ motion }: { motion: ExerciseMotion }) {
  const t = timing(motion)
  const p0 = motion.poses[0]
  return (
    <>
      <SideLimb motion={motion} from="hip" to="knee" width={7} />
      <SideLimb motion={motion} from="knee" to="ankle" width={6} />
      <SideLimb motion={motion} from="hip" to="neck" width={13} />
      <SideLimb motion={motion} from="neck" to="elbow" />
      <SideLimb motion={motion} from="elbow" to="hand" />
      <circle cx={p0.head[0]} cy={p0.head[1]} r="8.5" fill={LIMB} stroke={OUTLINE} strokeWidth="0.8">
        <Animate attributeName="cx" values={sideXs(motion, 'head')} {...t} />
        <Animate attributeName="cy" values={ys(motion, 'head')} {...t} />
      </circle>
      <SideEquipment motion={motion} />
    </>
  )
}

export function ExerciseAnimation({ motion, label }: { motion: ExerciseMotion; label: string }) {
  const sides: Side[] = [-1, 1]
  const profile = isProfileView(motion)
  const still = useReducedMotion()
  return (
    <StillContext.Provider value={still}>
      <div
        className="rounded-[2px] py-2 exercise-animation"
        style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
      >
        <svg
          viewBox="0 0 200 160" width="100%" height="185" role="img"
          aria-label={still
            ? `Starting position for ${label}`
            : `Animated demonstration of ${label}`}
        >
          {motion.ground !== false && (
            <line x1="24" y1="146" x2="176" y2="146" stroke={OUTLINE} strokeWidth="1.5" strokeDasharray="4 4" />
          )}
          {motion.bench && (
            profile
              // In profile the bench sits where the pose puts it, under the lifter.
              ? <rect
                  x={motion.bench.x} y={motion.bench.y}
                  width={motion.bench.width} height="6" rx="2" fill={OUTLINE}
                />
              // Head-on it is edge-on beneath the figure, so it is centred on the
              // body rather than following the pose's x.
              : <rect x={MID - 42} y={motion.bench.y} width="84" height="6" rx="2" fill={OUTLINE} />
          )}

          {profile ? (
            <SideRig motion={motion} />
          ) : (
            <>
              {/* legs, then torso, then arms, so the arms read in front */}
              {sides.map(s => <Limb key={`t${s}`} motion={motion} from="hip" to="knee" side={s} width={8} />)}
              {sides.map(s => <Limb key={`s${s}`} motion={motion} from="knee" to="ankle" side={s} width={6} />)}
              <Torso motion={motion} />
              {sides.map(s => <Limb key={`u${s}`} motion={motion} from="neck" to="elbow" side={s} />)}
              {sides.map(s => <Limb key={`f${s}`} motion={motion} from="elbow" to="hand" side={s} />)}
              <Equipment motion={motion} />
            </>
          )}
        </svg>
        <p className="text-[10px] uppercase tracking-widest text-center" style={{ color: 'var(--dim)' }}>
          {motion.caption}
        </p>
      </div>
    </StillContext.Provider>
  )
}
