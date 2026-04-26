import { POSE_ANIM_MAP, hasPoseAnim } from '@/components/modules/yoga/poses/index'

// ---------------------------------------------------------------------------
// Size mapping
// ---------------------------------------------------------------------------

const SIZE_PX = {
  small:  80,
  medium: 120,
  large:  160,
} as const

// ViewBox is 160×180, so height = width × (180/160) = width × 1.125
function sizeToHeight(w: number): number {
  return Math.round(w * 1.125)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AnimatedPoseProps {
  /** Pose ID matching keys in POSE_ANIM_MAP (e.g. 'mountain-pose') */
  poseId: string
  size?: 'small' | 'medium' | 'large'
  /** When false (default) animation plays. When true animation is paused. */
  autoPlay?: boolean
  /** Show motion arrows — passed to component; currently a hint for future use */
  showArrows?: boolean
}

export function AnimatedPose({
  poseId,
  size = 'medium',
  autoPlay = true,
  showArrows: _showArrows = true,
}: AnimatedPoseProps) {
  const PoseComponent = POSE_ANIM_MAP[poseId]

  if (!PoseComponent) {
    // Graceful fallback: dim placeholder box
    const w = SIZE_PX[size]
    const h = sizeToHeight(w)
    return (
      <div
        style={{
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          borderRadius: 2,
        }}
      >
        <span style={{ fontSize: 10, color: '#3a3a3a', textTransform: 'uppercase', letterSpacing: 2 }}>
          —
        </span>
      </div>
    )
  }

  const w = SIZE_PX[size]
  const h = sizeToHeight(w)

  return (
    <div style={{ width: w, height: h, flexShrink: 0 }}>
      <PoseComponent paused={!autoPlay} />
    </div>
  )
}

// Re-export for convenience
export { hasPoseAnim }
