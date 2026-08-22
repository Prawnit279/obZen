import type { Pose, ExerciseMotion } from '@/data/exercise-motions'

/**
 * A looping figure performing one rep of the movement.
 *
 * Built as an articulated rig: each exercise supplies its own joint positions
 * for a few key moments of the lift, and SMIL interpolates between them. That
 * gives every exercise a genuinely distinct motion from a small amount of data,
 * rather than 40 separately drawn animations that would drift in quality.
 *
 * Pure declarative SVG — no JS, no images, a couple of KB, and it keeps
 * animating offline. Honours prefers-reduced-motion by holding the first pose.
 */

const LIMB = 'var(--muscle-body)'
const ACCENT = 'var(--muscle-primary)'
const EQUIP = 'var(--muscle-outline)'

/** Joint order must match Pose. */
type Joint = keyof Pose

function values(motion: ExerciseMotion, joint: Joint, axis: 0 | 1): string {
  // Play forwards then back, so the rep returns to its start without a jump.
  const loop = [...motion.poses, ...motion.poses.slice(0, -1).reverse()]
  return loop.map(p => p[joint][axis]).join(';')
}

function keyTimes(motion: ExerciseMotion): string {
  const n = motion.poses.length * 2 - 1
  return Array.from({ length: n }, (_, i) => (i / (n - 1)).toFixed(3)).join(';')
}

interface SegmentProps {
  motion: ExerciseMotion
  from: Joint
  to: Joint
  width?: number
  colour?: string
}

/** One limb segment, animated by moving its two endpoints. */
function Segment({ motion, from, to, width = 5, colour = LIMB }: SegmentProps) {
  const dur = `${motion.durationSec}s`
  const times = keyTimes(motion)
  const common = { dur, repeatCount: 'indefinite', keyTimes: times, calcMode: 'spline' as const,
    keySplines: Array.from({ length: motion.poses.length * 2 - 2 }, () => '0.4 0 0.6 1').join(';') }

  return (
    <line
      x1={motion.poses[0][from][0]} y1={motion.poses[0][from][1]}
      x2={motion.poses[0][to][0]}   y2={motion.poses[0][to][1]}
      stroke={colour} strokeWidth={width} strokeLinecap="round"
    >
      <animate attributeName="x1" values={values(motion, from, 0)} {...common} />
      <animate attributeName="y1" values={values(motion, from, 1)} {...common} />
      <animate attributeName="x2" values={values(motion, to, 0)} {...common} />
      <animate attributeName="y2" values={values(motion, to, 1)} {...common} />
    </line>
  )
}

/** The head, which follows the neck joint. */
function Head({ motion }: { motion: ExerciseMotion }) {
  const dur = `${motion.durationSec}s`
  const times = keyTimes(motion)
  const common = { dur, repeatCount: 'indefinite', keyTimes: times, calcMode: 'spline' as const,
    keySplines: Array.from({ length: motion.poses.length * 2 - 2 }, () => '0.4 0 0.6 1').join(';') }
  return (
    <circle cx={motion.poses[0].head[0]} cy={motion.poses[0].head[1]} r="7" fill={LIMB}>
      <animate attributeName="cx" values={values(motion, 'head', 0)} {...common} />
      <animate attributeName="cy" values={values(motion, 'head', 1)} {...common} />
    </circle>
  )
}

/** The bar, dumbbell or handle, tracked to the hands. */
function Equipment({ motion }: { motion: ExerciseMotion }) {
  if (motion.equipment === 'none') return null
  const dur = `${motion.durationSec}s`
  const times = keyTimes(motion)
  const common = { dur, repeatCount: 'indefinite', keyTimes: times, calcMode: 'spline' as const,
    keySplines: Array.from({ length: motion.poses.length * 2 - 2 }, () => '0.4 0 0.6 1').join(';') }

  // A bar is drawn through the hand; a fixed bar (pull-ups) stays put.
  if (motion.equipment === 'fixedBar') {
    const [x, y] = motion.poses[0].hand
    return <line x1={x - 26} y1={y} x2={x + 26} y2={y} stroke={EQUIP} strokeWidth="3" strokeLinecap="round" />
  }

  const half = motion.equipment === 'bar' ? 22 : 7
  return (
    <line
      x1={motion.poses[0].hand[0] - half} y1={motion.poses[0].hand[1]}
      x2={motion.poses[0].hand[0] + half} y2={motion.poses[0].hand[1]}
      stroke={ACCENT} strokeWidth="4" strokeLinecap="round"
    >
      <animate attributeName="x1" values={values(motion, 'hand', 0).split(';').map(v => Number(v) - half).join(';')} {...common} />
      <animate attributeName="y1" values={values(motion, 'hand', 1)} {...common} />
      <animate attributeName="x2" values={values(motion, 'hand', 0).split(';').map(v => Number(v) + half).join(';')} {...common} />
      <animate attributeName="y2" values={values(motion, 'hand', 1)} {...common} />
    </line>
  )
}

export function ExerciseAnimation({ motion, label }: { motion: ExerciseMotion; label: string }) {
  return (
    <div
      className="rounded-[2px] py-2 exercise-animation"
      style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
    >
      <svg viewBox="0 0 200 150" width="100%" height="170" role="img" aria-label={`Animated demonstration of ${label}`}>
        {/* floor / bench reference line */}
        {motion.ground !== false && (
          <line x1="10" y1="140" x2="190" y2="140" stroke={EQUIP} strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        {motion.bench && (
          <rect x={motion.bench[0]} y={motion.bench[1]} width={motion.bench[2]} height="6" rx="2" fill={EQUIP} />
        )}

        {/* legs */}
        <Segment motion={motion} from="hip" to="knee" />
        <Segment motion={motion} from="knee" to="ankle" />
        {/* torso */}
        <Segment motion={motion} from="hip" to="neck" width={6} />
        {/* arms */}
        <Segment motion={motion} from="neck" to="elbow" />
        <Segment motion={motion} from="elbow" to="hand" />

        <Head motion={motion} />
        <Equipment motion={motion} />
      </svg>
      <p className="text-[10px] uppercase tracking-widest text-center" style={{ color: 'var(--dim)' }}>
        {motion.caption}
      </p>
    </div>
  )
}
