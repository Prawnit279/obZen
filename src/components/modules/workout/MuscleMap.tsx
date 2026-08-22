import type { MuscleId } from '@/data/exercise-guides'

/**
 * Front and back body diagrams with the worked muscles shaded.
 *
 * Drawn as inline SVG rather than shipped images: it works offline, themes
 * with the rest of the app, and scales without assets. Primary movers are
 * filled solid, secondary muscles lightly — and each is labelled in a legend,
 * so the meaning never depends on colour alone.
 */

const PRIMARY = 'var(--complete-text)'
const SECONDARY = 'var(--series-1)'
const BODY = 'var(--elevated)'
const OUTLINE = 'var(--border-strong)'

function fill(id: MuscleId, primary: MuscleId[], secondary: MuscleId[]): string {
  if (primary.includes(id)) return PRIMARY
  if (secondary.includes(id)) return SECONDARY
  return BODY
}

function opacity(id: MuscleId, primary: MuscleId[], secondary: MuscleId[]): number {
  if (primary.includes(id)) return 0.9
  if (secondary.includes(id)) return 0.45
  return 1
}

interface Props {
  primary: MuscleId[]
  secondary?: MuscleId[]
}

export function MuscleMap({ primary, secondary = [] }: Props) {
  const f = (id: MuscleId) => fill(id, primary, secondary)
  const o = (id: MuscleId) => opacity(id, primary, secondary)

  return (
    <div className="flex items-start justify-center gap-4">
      {/* ── Front ─────────────────────────────────────────────────────── */}
      <figure className="flex flex-col items-center gap-1">
        <svg viewBox="0 0 60 130" width="82" height="178" role="img" aria-label="Front view of muscles worked">
          {/* head + torso outline */}
          <circle cx="30" cy="10" r="7" fill={BODY} stroke={OUTLINE} strokeWidth="0.6" />
          <path d="M20 20 h20 l3 26 h-26 z" fill={BODY} stroke={OUTLINE} strokeWidth="0.6" />
          {/* chest */}
          <path d="M21 22 h18 v10 h-18 z" fill={f('chest')} opacity={o('chest')} />
          {/* abs */}
          <rect x="25" y="33" width="10" height="13" rx="1.5" fill={f('abs')} opacity={o('abs')} />
          {/* obliques */}
          <path d="M20 33 h4 v13 h-3 z" fill={f('obliques')} opacity={o('obliques')} />
          <path d="M40 33 h-4 v13 h3 z" fill={f('obliques')} opacity={o('obliques')} />
          {/* front delts */}
          <circle cx="18" cy="23" r="4.4" fill={f('frontDelts')} opacity={o('frontDelts')} />
          <circle cx="42" cy="23" r="4.4" fill={f('frontDelts')} opacity={o('frontDelts')} />
          {/* side delts */}
          <circle cx="15" cy="25" r="3" fill={f('sideDelts')} opacity={o('sideDelts')} />
          <circle cx="45" cy="25" r="3" fill={f('sideDelts')} opacity={o('sideDelts')} />
          {/* biceps */}
          <rect x="12" y="29" width="5" height="12" rx="2.4" fill={f('biceps')} opacity={o('biceps')} />
          <rect x="43" y="29" width="5" height="12" rx="2.4" fill={f('biceps')} opacity={o('biceps')} />
          {/* forearms */}
          <rect x="11" y="42" width="4.6" height="12" rx="2.2" fill={f('forearms')} opacity={o('forearms')} />
          <rect x="44.4" y="42" width="4.6" height="12" rx="2.2" fill={f('forearms')} opacity={o('forearms')} />
          {/* quads */}
          <path d="M22 48 h7 l-1 25 h-7 z" fill={f('quads')} opacity={o('quads')} />
          <path d="M38 48 h-7 l1 25 h7 z" fill={f('quads')} opacity={o('quads')} />
          {/* adductors */}
          <path d="M29 48 h2 l-0.5 18 h-1 z" fill={f('adductors')} opacity={o('adductors')} />
          {/* lower legs */}
          <path d="M22 75 h6 l-1 22 h-5 z" fill={BODY} stroke={OUTLINE} strokeWidth="0.5" />
          <path d="M38 75 h-6 l1 22 h5 z" fill={BODY} stroke={OUTLINE} strokeWidth="0.5" />
        </svg>
        <figcaption className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>Front</figcaption>
      </figure>

      {/* ── Back ──────────────────────────────────────────────────────── */}
      <figure className="flex flex-col items-center gap-1">
        <svg viewBox="0 0 60 130" width="82" height="178" role="img" aria-label="Back view of muscles worked">
          <circle cx="30" cy="10" r="7" fill={BODY} stroke={OUTLINE} strokeWidth="0.6" />
          <path d="M20 20 h20 l3 26 h-26 z" fill={BODY} stroke={OUTLINE} strokeWidth="0.6" />
          {/* traps */}
          <path d="M24 20 h12 l-2 8 h-8 z" fill={f('traps')} opacity={o('traps')} />
          {/* lats */}
          <path d="M21 28 h7 v14 l-8 -2 z" fill={f('lats')} opacity={o('lats')} />
          <path d="M39 28 h-7 v14 l8 -2 z" fill={f('lats')} opacity={o('lats')} />
          {/* lower back */}
          <rect x="26" y="40" width="8" height="7" rx="1.5" fill={f('lowerBack')} opacity={o('lowerBack')} />
          {/* rear delts */}
          <circle cx="18" cy="23" r="4.4" fill={f('rearDelts')} opacity={o('rearDelts')} />
          <circle cx="42" cy="23" r="4.4" fill={f('rearDelts')} opacity={o('rearDelts')} />
          {/* triceps */}
          <rect x="12" y="29" width="5" height="12" rx="2.4" fill={f('triceps')} opacity={o('triceps')} />
          <rect x="43" y="29" width="5" height="12" rx="2.4" fill={f('triceps')} opacity={o('triceps')} />
          {/* glutes */}
          <path d="M22 47 h7 v9 h-7 z" fill={f('glutes')} opacity={o('glutes')} />
          <path d="M38 47 h-7 v9 h7 z" fill={f('glutes')} opacity={o('glutes')} />
          {/* hamstrings */}
          <path d="M22 57 h7 l-1 16 h-6 z" fill={f('hamstrings')} opacity={o('hamstrings')} />
          <path d="M38 57 h-7 l1 16 h6 z" fill={f('hamstrings')} opacity={o('hamstrings')} />
          {/* calves */}
          <path d="M22 76 h6 l-1 18 h-5 z" fill={f('calves')} opacity={o('calves')} />
          <path d="M38 76 h-6 l1 18 h5 z" fill={f('calves')} opacity={o('calves')} />
        </svg>
        <figcaption className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--dim)' }}>Back</figcaption>
      </figure>
    </div>
  )
}

export { PRIMARY as MUSCLE_PRIMARY_COLOR, SECONDARY as MUSCLE_SECONDARY_COLOR }
