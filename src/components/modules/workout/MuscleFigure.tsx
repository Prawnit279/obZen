import type { MuscleId } from '@/data/exercise-guides'

/**
 * Anatomical front/back figures with the worked muscle groups shaded.
 *
 * Hand-authored SVG rather than bundled images: it scales, themes, weighs
 * almost nothing and works offline. Primary movers are filled dark purple,
 * assisting muscles navy blue — and both are named in the legend alongside, so
 * the diagram never depends on colour alone to be understood.
 */

const PRIMARY = 'var(--muscle-primary)'
const SECONDARY = 'var(--muscle-secondary)'
const BODY = 'var(--muscle-body)'
const OUTLINE = 'var(--muscle-outline)'

type Shade = (id: MuscleId) => string

function makeShader(primary: MuscleId[], secondary: MuscleId[]): Shade {
  const p = new Set(primary)
  const s = new Set(secondary)
  return id => (p.has(id) ? PRIMARY : s.has(id) ? SECONDARY : BODY)
}

const STROKE = { stroke: OUTLINE, strokeWidth: 0.8, strokeLinejoin: 'round' as const }

/** Front view: chest, delts, arms, abs, quads. */
function FrontFigure({ shade }: { shade: Shade }) {
  return (
    <svg viewBox="0 0 100 232" width="112" height="260" role="img" aria-label="Front view of the muscles worked">
      {/* head + neck */}
      <ellipse cx="50" cy="16" rx="10.5" ry="12.5" fill={BODY} {...STROKE} />
      <path d="M45 27 h10 v7 h-10 z" fill={BODY} {...STROKE} />

      {/* traps sloping to the shoulders */}
      <path d="M40 34 q10 -5 20 0 l6 6 h-32 z" fill={shade('traps')} {...STROKE} />

      {/* torso silhouette */}
      <path d="M34 40 h32 l4 34 -4 26 h-32 l-4 -26 z" fill={BODY} {...STROKE} />

      {/* chest — two pecs */}
      <path d="M50 43 v18 h-13 q-4 -9 -1 -17 z" fill={shade('chest')} {...STROKE} />
      <path d="M50 43 v18 h13 q4 -9 1 -17 z" fill={shade('chest')} {...STROKE} />

      {/* abs — three bands each side */}
      <path d="M43 64 h6 v8 h-6 z M51 64 h6 v8 h-6 z" fill={shade('abs')} {...STROKE} />
      <path d="M43 74 h6 v8 h-6 z M51 74 h6 v8 h-6 z" fill={shade('abs')} {...STROKE} />
      <path d="M44 84 h5 v9 h-5 z M51 84 h5 v9 h-5 z" fill={shade('abs')} {...STROKE} />

      {/* obliques flanking the abs */}
      <path d="M37 64 h5 v26 l-6 -6 z" fill={shade('obliques')} {...STROKE} />
      <path d="M63 64 h-5 v26 l6 -6 z" fill={shade('obliques')} {...STROKE} />

      {/* front delts (cap) then side delts (outer) */}
      <path d="M34 41 q-7 2 -8 11 q6 3 10 -2 z" fill={shade('frontDelts')} {...STROKE} />
      <path d="M66 41 q7 2 8 11 q-6 3 -10 -2 z" fill={shade('frontDelts')} {...STROKE} />
      <path d="M26 52 q-3 6 -1 11 q6 0 8 -6 z" fill={shade('sideDelts')} {...STROKE} />
      <path d="M74 52 q3 6 1 11 q-6 0 -8 -6 z" fill={shade('sideDelts')} {...STROKE} />

      {/* biceps */}
      <path d="M25 63 q-4 10 -1 20 q6 1 8 -6 l1 -13 z" fill={shade('biceps')} {...STROKE} />
      <path d="M75 63 q4 10 1 20 q-6 1 -8 -6 l-1 -13 z" fill={shade('biceps')} {...STROKE} />

      {/* forearms */}
      <path d="M24 84 q-3 12 0 22 q6 1 8 -6 l1 -15 z" fill={shade('forearms')} {...STROKE} />
      <path d="M76 84 q3 12 0 22 q-6 1 -8 -6 l-1 -15 z" fill={shade('forearms')} {...STROKE} />
      {/* hands */}
      <ellipse cx="28" cy="112" rx="4.5" ry="6" fill={BODY} {...STROKE} />
      <ellipse cx="72" cy="112" rx="4.5" ry="6" fill={BODY} {...STROKE} />

      {/* hips */}
      <path d="M34 100 h32 l-2 14 h-28 z" fill={BODY} {...STROKE} />

      {/* quads */}
      <path d="M37 115 h11 l-1 42 h-12 q-2 -22 2 -42 z" fill={shade('quads')} {...STROKE} />
      <path d="M63 115 h-11 l1 42 h12 q2 -22 -2 -42 z" fill={shade('quads')} {...STROKE} />
      {/* adductors (inner thigh) */}
      <path d="M48 115 h4 v30 h-4 z" fill={shade('adductors')} {...STROKE} />

      {/* knees + lower legs (tibialis reads as calves here) */}
      <path d="M36 158 h11 v6 h-11 z M53 158 h11 v6 h-11 z" fill={BODY} {...STROKE} />
      <path d="M37 165 h9 l-1 34 h-8 q-2 -18 0 -34 z" fill={shade('calves')} {...STROKE} />
      <path d="M63 165 h-9 l1 34 h8 q2 -18 0 -34 z" fill={shade('calves')} {...STROKE} />
      {/* feet */}
      <path d="M36 200 h10 v7 h-12 z" fill={BODY} {...STROKE} />
      <path d="M64 200 h-10 v7 h12 z" fill={BODY} {...STROKE} />
    </svg>
  )
}

/** Back view: traps, lats, lower back, triceps, glutes, hamstrings. */
function BackFigure({ shade }: { shade: Shade }) {
  return (
    <svg viewBox="0 0 100 232" width="112" height="260" role="img" aria-label="Back view of the muscles worked">
      <ellipse cx="50" cy="16" rx="10.5" ry="12.5" fill={BODY} {...STROKE} />
      <path d="M45 27 h10 v7 h-10 z" fill={BODY} {...STROKE} />

      {/* upper traps — the diamond across the shoulders */}
      <path d="M40 34 q10 -5 20 0 l7 8 -17 12 -17 -12 z" fill={shade('traps')} {...STROKE} />

      <path d="M34 40 h32 l4 34 -4 26 h-32 l-4 -26 z" fill={BODY} {...STROKE} />

      {/* lats — wide at the armpit, tapering to the waist */}
      <path d="M35 48 h13 v26 l-17 -6 q-1 -12 4 -20 z" fill={shade('lats')} {...STROKE} />
      <path d="M65 48 h-13 v26 l17 -6 q1 -12 -4 -20 z" fill={shade('lats')} {...STROKE} />

      {/* mid traps / spinal column */}
      <path d="M48 46 h4 v34 h-4 z" fill={shade('traps')} {...STROKE} />

      {/* lower back (erectors) */}
      <path d="M40 80 h20 l-2 18 h-16 z" fill={shade('lowerBack')} {...STROKE} />

      {/* rear delts */}
      <path d="M34 41 q-8 3 -8 13 q7 2 11 -4 z" fill={shade('rearDelts')} {...STROKE} />
      <path d="M66 41 q8 3 8 13 q-7 2 -11 -4 z" fill={shade('rearDelts')} {...STROKE} />

      {/* triceps */}
      <path d="M25 55 q-4 13 -1 27 q6 1 8 -6 l1 -19 z" fill={shade('triceps')} {...STROKE} />
      <path d="M75 55 q4 13 1 27 q-6 1 -8 -6 l-1 -19 z" fill={shade('triceps')} {...STROKE} />

      {/* forearms */}
      <path d="M24 84 q-3 12 0 22 q6 1 8 -6 l1 -15 z" fill={shade('forearms')} {...STROKE} />
      <path d="M76 84 q3 12 0 22 q-6 1 -8 -6 l-1 -15 z" fill={shade('forearms')} {...STROKE} />
      <ellipse cx="28" cy="112" rx="4.5" ry="6" fill={BODY} {...STROKE} />
      <ellipse cx="72" cy="112" rx="4.5" ry="6" fill={BODY} {...STROKE} />

      {/* glutes — the rounded pair at the hips */}
      <path d="M34 99 q7 -3 15 0 v15 q-9 3 -16 -3 z" fill={shade('glutes')} {...STROKE} />
      <path d="M66 99 q-7 -3 -15 0 v15 q9 3 16 -3 z" fill={shade('glutes')} {...STROKE} />

      {/* hamstrings */}
      <path d="M36 116 h12 l-1 41 h-13 q-2 -21 2 -41 z" fill={shade('hamstrings')} {...STROKE} />
      <path d="M64 116 h-12 l1 41 h13 q2 -21 -2 -41 z" fill={shade('hamstrings')} {...STROKE} />

      <path d="M35 158 h12 v6 h-12 z M53 158 h12 v6 h-12 z" fill={BODY} {...STROKE} />

      {/* calves — the distinct gastroc bulge */}
      <path d="M37 165 q-3 14 0 24 q7 2 9 -5 l1 -19 z" fill={shade('calves')} {...STROKE} />
      <path d="M63 165 q3 14 0 24 q-7 2 -9 -5 l-1 -19 z" fill={shade('calves')} {...STROKE} />
      <path d="M38 190 h8 l-1 10 h-8 z" fill={BODY} {...STROKE} />
      <path d="M62 190 h-8 l1 10 h8 z" fill={BODY} {...STROKE} />
      <path d="M36 200 h10 v7 h-12 z" fill={BODY} {...STROKE} />
      <path d="M64 200 h-10 v7 h12 z" fill={BODY} {...STROKE} />
    </svg>
  )
}

interface Props {
  primary: MuscleId[]
  secondary?: MuscleId[]
}

export function MuscleFigure({ primary, secondary = [] }: Props) {
  const shade = makeShader(primary, secondary)
  return (
    <div className="flex items-start justify-center gap-3">
      <figure className="flex flex-col items-center gap-1">
        <FrontFigure shade={shade} />
        <figcaption className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>Front</figcaption>
      </figure>
      <figure className="flex flex-col items-center gap-1">
        <BackFigure shade={shade} />
        <figcaption className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>Back</figcaption>
      </figure>
    </div>
  )
}

export { PRIMARY as MUSCLE_PRIMARY_COLOR, SECONDARY as MUSCLE_SECONDARY_COLOR }
