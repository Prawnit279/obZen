/**
 * How each movement is performed, and what it works.
 *
 * Kept as static data (no images to ship, works offline) and rendered as a
 * highlighted body diagram plus written steps. Muscle ids match the regions
 * drawn in MuscleFigure.
 */

export type MuscleId =
  | 'glutes' | 'hamstrings' | 'quads' | 'calves' | 'adductors'
  | 'lats' | 'traps' | 'lowerBack' | 'rearDelts'
  | 'chest' | 'frontDelts' | 'sideDelts' | 'triceps' | 'biceps' | 'forearms'
  | 'abs' | 'obliques'

export const MUSCLE_LABEL: Record<MuscleId, string> = {
  glutes: 'Glutes', hamstrings: 'Hamstrings', quads: 'Quads', calves: 'Calves',
  adductors: 'Adductors', lats: 'Lats', traps: 'Traps', lowerBack: 'Lower back',
  rearDelts: 'Rear delts', chest: 'Chest', frontDelts: 'Front delts',
  sideDelts: 'Side delts', triceps: 'Triceps', biceps: 'Biceps',
  forearms: 'Forearms', abs: 'Abs', obliques: 'Obliques',
}

export interface ExerciseGuide {
  /** Muscles doing most of the work. */
  primary: MuscleId[]
  /** Muscles assisting. */
  secondary?: MuscleId[]
  /** How to perform it, in order. */
  steps: string[]
  /** Getting into position before the first rep. */
  setup?: string[]
  /** What commonly goes wrong, and the correction. */
  mistakes?: { wrong: string; fix: string }[]
  /** How to know the set was a good one. */
  cues?: string[]
}

/**
 * Guides keyed by exercise id (see toExerciseId). Movements without an entry
 * fall back to their muscle group, so the UI degrades rather than breaking.
 */
export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  'hip-thrust-machine': {
    primary: ['glutes'], secondary: ['hamstrings', 'quads'],
    steps: [
      'Sit with your upper back against the pad, feet flat and shoulder-width.',
      'Tuck the chin and keep the ribs down — the spine stays neutral throughout.',
      'Drive through the mid-foot until the hips are level with the knees.',
      'Hold the squeeze at the top for a full second, then lower under control.',
    ],
  },
  'romanian-deadlift': {
    primary: ['hamstrings', 'glutes'], secondary: ['lowerBack', 'forearms'],
    steps: [
      'Stand tall with the bar at hip height, knees softly bent.',
      'Push the hips back, letting the bar travel down the thighs.',
      'Stop the moment you feel the hamstring stretch — do not chase the floor.',
      'Drive the hips forward to stand, squeezing the glutes at the top.',
    ],
  },
  'bulgarian-split-squat': {
    primary: ['glutes', 'quads'], secondary: ['hamstrings', 'adductors'],
    steps: [
      'Place the rear foot on a bench, front foot a long stride ahead.',
      'Lean the torso slightly forward — this shifts work from quad to glute.',
      'Lower until the front thigh is roughly parallel.',
      'Drive through the front heel to stand.',
    ],
  },
  'leg-press': {
    primary: ['quads', 'glutes'], secondary: ['hamstrings'],
    steps: [
      'Set the feet high and wide on the platform to bias glutes and hamstrings.',
      'Lower until the knees reach about 90°, keeping the lower back on the pad.',
      'Press through the whole foot.',
      'Never lock the knees out at the top.',
    ],
  },
  'cable-glute-kickback': {
    primary: ['glutes'], secondary: ['hamstrings'],
    steps: [
      'Attach the cuff above the ankle and face the machine, hips square.',
      'Drive the leg back and slightly up, without arching the lower back.',
      'Squeeze at the end range.',
      'Return slowly — this is a finisher for blood flow, not a max lift.',
    ],
  },
  'dead-bug': {
    primary: ['abs'], secondary: ['obliques'],
    steps: [
      'Lie on your back, arms up, knees and hips at 90°.',
      'Press the lower back flat into the floor and keep it there.',
      'Lower the opposite arm and leg slowly toward the floor.',
      'If the back lifts, shorten the reach.',
    ],
  },
  'assisted-pull-up': {
    primary: ['lats'], secondary: ['biceps', 'rearDelts', 'forearms'],
    steps: [
      'Set the most assistance available to start; reduce it as you get stronger.',
      'Take a full hang at the bottom, shoulders active.',
      'Pull the elbows down and back, chest toward the bar.',
      'Lower under control to a full hang.',
    ],
  },
  'assisted-dip': {
    primary: ['chest', 'triceps'], secondary: ['frontDelts'],
    steps: [
      'Grip the bars, arms locked, and lean the torso forward slightly.',
      'Lower until the shoulder feels a stretch — never below it.',
      'Press back up without locking the elbows hard.',
      'Keep the shoulders down away from the ears.',
    ],
  },
  'seated-cable-row': {
    primary: ['lats', 'traps'], secondary: ['biceps', 'rearDelts'],
    steps: [
      'Sit tall with a slight knee bend, chest up.',
      'Pull the handle to the belly button.',
      'Drive the shoulder blades back and together.',
      'Return without rocking the torso.',
    ],
  },
  'dumbbell-shoulder-press': {
    primary: ['frontDelts'], secondary: ['sideDelts', 'triceps', 'abs'],
    steps: [
      'Sit or stand with ribs down and glutes tight.',
      'Start with the dumbbells at ear height, elbows slightly forward.',
      'Press up and slightly back, not forward.',
      'Lower under control to the start.',
    ],
  },
  'face-pull': {
    primary: ['rearDelts'], secondary: ['traps'],
    steps: [
      'Set the cable at roughly face height with a rope attachment.',
      'Pull toward the forehead, leading with the elbows high.',
      'Externally rotate so the hands finish beside the ears.',
      'Return slowly — this is the antidote to a desk job.',
    ],
  },
  'cable-pallof-press': {
    primary: ['obliques', 'abs'],
    steps: [
      'Stand side-on to the cable, hands at the chest.',
      'Press straight out and resist the pull that wants to twist you.',
      'Nothing moves except your arms.',
      'Return to the chest with the same control.',
    ],
  },
  'hollow-body-hold': {
    primary: ['abs'],
    steps: [
      'Lie on your back and press the lower back flat into the floor.',
      'Lift the shoulder blades and legs a few inches.',
      'Hold that shape and breathe.',
      'Drop the legs closer to the ground to make it harder.',
    ],
  },
  'deadlift': {
    primary: ['hamstrings', 'glutes', 'lowerBack'], secondary: ['traps', 'lats', 'forearms', 'quads'],
    steps: [
      'Set up with the bar over mid-foot, shins close.',
      'Take the slack out of the bar before you pull.',
      'Push the floor away, keeping the bar against the shins.',
      'End the set the moment the back rounds.',
    ],
  },
  'barbell-back-squat': {
    primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lowerBack', 'abs'],
    steps: [
      'Bar on the upper back, feet shoulder-width, toes slightly out.',
      'Brace, then sit down between the hips.',
      'Track the knees over the toes.',
      'Earn depth before you add weight.',
    ],
  },
  'barbell-squat': {
    primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lowerBack', 'abs'],
    steps: [
      'Bar on the upper back, feet shoulder-width, toes slightly out.',
      'Brace hard, then sit down between the hips.',
      'Keep the knees tracking over the toes.',
      'Drive up through the whole foot.',
    ],
  },
  'walking-lunge': {
    primary: ['glutes', 'quads'], secondary: ['hamstrings', 'adductors'],
    steps: [
      'Take a long stride — a long stride hits the glutes, a short one the quads.',
      'Lower until the back knee is just off the floor.',
      'Drive through the front heel into the next stride.',
      'Keep the torso tall throughout.',
    ],
  },
  'seated-leg-curl': {
    primary: ['hamstrings'], secondary: ['calves'],
    steps: [
      'Set the pad just above the heels, thighs strapped down.',
      'Curl the heels under and toward you.',
      'Squeeze at the bottom of the range.',
      'Return slowly — the eccentric is the point.',
    ],
  },
  'cable-crunch': {
    primary: ['abs'], secondary: ['obliques'],
    steps: [
      'Kneel below the cable, rope beside the head.',
      'Curl the ribs toward the hips.',
      'The hips themselves stay completely still.',
      'Return under control without letting the weight pull you upright.',
    ],
  },
  'bench-press': {
    primary: ['chest'], secondary: ['frontDelts', 'triceps'],
    steps: [
      'Five points of contact: head, upper back, glutes, both feet.',
      'Set the shoulder blades back and down.',
      'Lower to the lower chest with the elbows around 45°.',
      'Press back over the shoulders.',
    ],
  },
  'weighted-pull-ups': {
    primary: ['lats'], secondary: ['biceps', 'rearDelts', 'forearms'],
    steps: [
      'Hang with the added weight secure, shoulders active.',
      'Pull the elbows down and back, chest toward the bar.',
      'Avoid kipping — the tempo stays controlled.',
      'Lower to a full hang each rep.',
    ],
  },
  'weighted-push-ups': {
    primary: ['chest'], secondary: ['frontDelts', 'triceps', 'abs'],
    steps: [
      'Place the load across the upper back and set a rigid plank.',
      'Lower with the elbows around 45° from the body.',
      'Press away, keeping the hips in line with the shoulders.',
      'Do not let the lower back sag.',
    ],
  },
  'barbell-row': {
    primary: ['lats', 'traps'], secondary: ['biceps', 'rearDelts', 'lowerBack'],
    steps: [
      'Hinge to roughly 45°, back flat.',
      'Row to the lower ribs, elbows close.',
      'Squeeze the shoulder blades at the top.',
      'Lower without letting the torso rise.',
    ],
  },
  'db-lateral-raises': {
    primary: ['sideDelts'],
    steps: [
      'Stand with a slight forward lean, dumbbells at the sides.',
      'Raise out to shoulder height, leading with the elbows.',
      'Keep a soft elbow — no swinging.',
      'Lower slowly.',
    ],
  },
  'db-shoulder-press': {
    primary: ['frontDelts'], secondary: ['sideDelts', 'triceps'],
    steps: [
      'Ribs down, glutes tight, dumbbells at ear height.',
      'Press up and slightly back.',
      'Finish with the biceps near the ears.',
      'Lower under control.',
    ],
  },
  'standing-calf-raises': {
    primary: ['calves'],
    steps: [
      'Balls of the feet on the platform, heels free.',
      'Drop the heels for a full stretch.',
      'Rise as high as possible onto the toes.',
      'Pause at the top — no bouncing.',
    ],
  },
  'bar-dips': {
    primary: ['chest', 'triceps'], secondary: ['frontDelts'],
    steps: [
      'Grip the bars and lock the arms, shoulders down away from the ears.',
      'Lean the torso forward to bias the chest; stay upright to bias triceps.',
      'Lower until the shoulder feels a stretch — never below it.',
      'Press back up without slamming the elbows straight.',
    ],
  },
  'pull-ups': {
    primary: ['lats'], secondary: ['biceps', 'rearDelts', 'forearms'],
    steps: [
      'Overhand grip, hands just outside shoulder width.',
      'Start from a full hang with the shoulders active.',
      'Pull the elbows down and back until the chin clears the bar.',
      'Lower under control to a full hang each rep.',
    ],
  },
  'chin-ups': {
    primary: ['lats', 'biceps'], secondary: ['rearDelts', 'forearms'],
    steps: [
      'Underhand grip, hands about shoulder width.',
      'Hang fully, then drive the elbows down toward the ribs.',
      'Bring the chest toward the bar rather than just the chin.',
      'Lower slowly — the biceps take more of the work here.',
    ],
  },
  'neutral-grip-pull-ups': {
    primary: ['lats'], secondary: ['biceps', 'forearms'],
    steps: [
      'Palms facing each other on parallel handles.',
      'Full hang to start, shoulders packed down.',
      'Pull until the chest is level with the hands.',
      'This grip is usually the kindest on the shoulders.',
    ],
  },
  'barbell-rear-delt-row': {
    primary: ['rearDelts'], secondary: ['traps', 'lats', 'biceps'],
    steps: [
      'Hinge forward with a wide, overhand grip on the bar.',
      'Row toward the upper chest with the elbows flaring out.',
      'Squeeze the shoulder blades together at the top.',
      'Lower under control without standing up.',
    ],
  },
  'dumbbell-rear-delt-row': {
    primary: ['rearDelts'], secondary: ['traps', 'lats'],
    steps: [
      'Hinge forward, dumbbells hanging straight down.',
      'Row with the elbows high and wide, not tucked.',
      'Pause briefly with the shoulder blades pinched.',
      'Lower slowly to a full stretch.',
    ],
  },
  'barbell-front-raises': {
    primary: ['frontDelts'], secondary: ['sideDelts'],
    steps: [
      'Stand tall, bar resting against the thighs.',
      'Raise the bar with straight arms to about eye level.',
      'Keep the ribs down — no leaning back to swing it up.',
      'Lower under control.',
    ],
  },
  'dumbbell-lateral-raises': {
    primary: ['sideDelts'],
    steps: [
      'Stand with a slight forward lean, dumbbells at the sides.',
      'Raise out to shoulder height, leading with the elbows.',
      'Keep a soft elbow and avoid shrugging.',
      'Lower slowly — this one does not need heavy weight.',
    ],
  },
  'barbell-curls': {
    primary: ['biceps'], secondary: ['forearms'],
    steps: [
      'Stand tall, hands about shoulder width, elbows at the sides.',
      'Curl the bar up while the elbows stay pinned in place.',
      'Squeeze at the top without swinging the hips.',
      'Lower all the way to a full stretch.',
    ],
  },
  'zottman-curl': {
    primary: ['biceps', 'forearms'],
    steps: [
      'Curl up with the palms facing you.',
      'At the top, rotate the palms to face down.',
      'Lower slowly in that pronated position.',
      'Rotate back at the bottom and repeat.',
    ],
  },
  'hanging-leg-raises': {
    primary: ['abs'], secondary: ['obliques', 'forearms'],
    steps: [
      'Hang from the bar, shoulders active.',
      'Curl the pelvis up as the legs rise.',
      'Avoid swinging — control the descent.',
      'Lower with the same tempo you raised.',
    ],
  },
}

/** Sensible fallback so every exercise shows something useful. */
const GROUP_FALLBACK: Record<string, MuscleId[]> = {
  legs: ['quads', 'glutes', 'hamstrings'],
  back: ['lats', 'traps'],
  shoulders: ['frontDelts', 'sideDelts'],
  chest: ['chest'],
  arms: ['biceps', 'triceps'],
  core: ['abs'],
}

export function guideFor(exerciseId: string, muscleGroup?: string): ExerciseGuide | undefined {
  const guide = EXERCISE_GUIDES[exerciseId]
  if (guide) return guide
  const primary = muscleGroup ? GROUP_FALLBACK[muscleGroup] : undefined
  return primary ? { primary, steps: [] } : undefined
}

// ── Extra depth for the lifts actually trained most ──────────────────────────

/**
 * Setup, common faults and success cues for the core lifts — deadlift, squat,
 * bench, hip thrust, RDL, pull-up, leg press, rows, push-up, leg raise and dip.
 * Layered onto the base guides rather than duplicating them, and shared across
 * each lift's close variants.
 */
const CORE_DETAIL: Record<string, Pick<ExerciseGuide, 'setup' | 'mistakes' | 'cues'>> = {
  deadlift: {
    setup: [
      'Bar over mid-foot, roughly an inch from the shins.',
      'Grip just outside the knees, then drop the hips until the shoulders sit slightly ahead of the bar.',
      'Take a breath into the belly and brace before the bar moves.',
    ],
    mistakes: [
      { wrong: 'Hips shoot up first, turning it into a stiff-legged pull', fix: 'Push the floor away with the legs — hips and chest rise together.' },
      { wrong: 'Bar drifts away from the shins', fix: 'Keep the lats engaged, as if squeezing oranges in the armpits.' },
      { wrong: 'Rounding the lower back to chase one more rep', fix: 'End the set the moment the back rounds. That rep is not worth it.' },
      { wrong: 'Leaning back and hyperextending at lockout', fix: 'Finish standing tall with the glutes squeezed, ribs down.' },
    ],
    cues: ['Bar stays in contact with the legs the whole way', 'Same back angle off the floor as at setup'],
  },
  'barbell-squat': {
    setup: [
      'Bar on the upper back, not the neck; hands as narrow as the shoulders allow.',
      'Feet shoulder-width, toes turned out 15–30°.',
      'Big breath, brace the whole trunk, then unrack and take two steps back.',
    ],
    mistakes: [
      { wrong: 'Knees collapse inward out of the hole', fix: 'Screw the feet into the floor and think about spreading it apart.' },
      { wrong: 'Hips rise faster than the chest ("good-morning" squat)', fix: 'Drive the whole torso up as one piece; keep the chest proud.' },
      { wrong: 'Heels lift off the floor', fix: 'Push through the mid-foot; check ankle mobility or use lifting shoes.' },
      { wrong: 'Cutting depth as the weight climbs', fix: 'Earn depth before you add weight — thigh to parallel or below.' },
    ],
    cues: ['Knees track over the toes throughout', 'Depth is the same on the last rep as the first'],
  },
  'bench-press': {
    setup: [
      'Five points of contact: head, upper back, glutes, and both feet flat.',
      'Pull the shoulder blades back and down, and keep them pinned there.',
      'Grip so the forearms are vertical at the bottom.',
    ],
    mistakes: [
      { wrong: 'Elbows flared to 90°, stressing the shoulder', fix: 'Tuck to roughly 45° from the torso.' },
      { wrong: 'Bouncing the bar off the chest', fix: 'Touch lightly, pause, then press.' },
      { wrong: 'Shoulders rolling forward at lockout', fix: 'Keep the blades retracted from first rep to last.' },
      { wrong: 'Feet wandering or hips lifting off the bench', fix: 'Drive the feet down and keep the glutes in contact.' },
    ],
    cues: ['Bar path is a shallow arc from lower chest to over the shoulders', 'Wrists stacked over the elbows'],
  },
  'hip-thrust-machine': {
    setup: [
      'Bench or pad just under the shoulder blades.',
      'Feet flat, shins vertical when the hips are at the top.',
      'Chin tucked so you are looking at your knees, not the ceiling.',
    ],
    mistakes: [
      { wrong: 'Arching the lower back to fake extra height', fix: 'Keep the ribs down — the movement comes from the hips, not the spine.' },
      { wrong: 'Feet too close, turning it into a quad exercise', fix: 'Walk the feet out until the shins are vertical at the top.' },
      { wrong: 'Rushing the top without a squeeze', fix: 'Hold at lockout for a full second every rep.' },
    ],
    cues: ['Torso and thighs form a straight line at the top', 'You feel it in the glutes, not the lower back'],
  },
  'romanian-deadlift': {
    setup: [
      'Start standing with the bar at the hips, knees softly bent.',
      'Brace, set the lats, and keep the bar in contact with the legs.',
    ],
    mistakes: [
      { wrong: 'Squatting the weight down instead of hinging', fix: 'Push the hips backwards; the knee angle barely changes.' },
      { wrong: 'Chasing the floor and rounding the back', fix: 'Stop at the hamstring stretch — range comes from hips, not spine.' },
      { wrong: 'Bar drifting forward of the thighs', fix: 'Drag it down the legs; keep the lats tight.' },
    ],
    cues: ['A clear stretch in the hamstrings at the bottom', 'Back angle changes, spine shape does not'],
  },
  'pull-ups': {
    setup: [
      'Overhand grip just outside shoulder width.',
      'Start from a dead hang with the shoulders pulled down away from the ears.',
    ],
    mistakes: [
      { wrong: 'Kipping or swinging to get up', fix: 'Keep the legs still — squeeze the glutes and brace the abs.' },
      { wrong: 'Half reps that never reach a full hang', fix: 'Lower all the way each rep; the bottom is where strength is built.' },
      { wrong: 'Shrugging the shoulders at the start of the pull', fix: 'Depress the shoulder blades first, then pull.' },
    ],
    cues: ['Chest rises toward the bar, not just the chin', 'Elbows drive down and back'],
  },
  'leg-press': {
    setup: [
      'Feet high and wide on the platform to bias glutes and hamstrings.',
      'Back and hips flat against the pad before the first rep.',
    ],
    mistakes: [
      { wrong: 'Lower back rounding off the pad at the bottom', fix: 'Shorten the range — stop before the hips tuck under.' },
      { wrong: 'Locking the knees hard at the top', fix: 'Stop just short of lockout and keep tension on the muscle.' },
      { wrong: 'Hands pushing on the knees', fix: 'Hold the handles; let the legs do the work.' },
    ],
    cues: ['Knees track in line with the toes', 'Hips never lift away from the pad'],
  },
  'barbell-row': {
    setup: [
      'Hinge to roughly 45°, back flat, bar hanging under the shoulders.',
      'Brace hard — the torso angle must not change during the set.',
    ],
    mistakes: [
      { wrong: 'Standing up a little on every rep to heave the weight', fix: 'Lighten the load and hold the hinge still.' },
      { wrong: 'Pulling to the chest with the elbows flared', fix: 'Row to the lower ribs with the elbows closer to the body.' },
      { wrong: 'Jerking through the lower back', fix: 'Initiate with the shoulder blades, not the hips.' },
    ],
    cues: ['Torso angle identical on rep 1 and the last rep', 'Squeeze the blades together at the top'],
  },
  'push-up': {
    setup: [
      'Hands just outside shoulder width, under the shoulders.',
      'Set a rigid plank: glutes squeezed, ribs down, neck neutral.',
    ],
    mistakes: [
      { wrong: 'Hips sagging toward the floor', fix: 'Squeeze the glutes and brace the abs before you descend.' },
      { wrong: 'Elbows flaring out to 90°', fix: 'Keep them at about 45° from the torso.' },
      { wrong: 'Head reaching for the floor before the chest', fix: 'Lead with the chest; the whole body moves as one plank.' },
    ],
    cues: ['A straight line from head to heels the whole set', 'Chest touches before anything else'],
  },
  'hanging-leg-raises': {
    setup: [
      'Hang from the bar with the shoulders active, not fully relaxed.',
      'Squeeze the legs together and brace before the first rep.',
    ],
    mistakes: [
      { wrong: 'Swinging and using momentum', fix: 'Pause at the bottom of every rep to kill the swing.' },
      { wrong: 'Only lifting the legs, never the pelvis', fix: 'Curl the pelvis up at the top — that is what works the abs.' },
      { wrong: 'Dropping the legs and losing tension', fix: 'Lower with the same tempo you raised.' },
    ],
    cues: ['The lower back rounds slightly at the top', 'No swing between reps'],
  },
  'bar-dips': {
    setup: [
      'Mount the bars with the arms locked and the shoulders pulled down.',
      'Lean the torso forward for chest, stay upright for triceps.',
    ],
    mistakes: [
      { wrong: 'Dropping too deep and stressing the shoulder', fix: 'Stop where the shoulder feels a stretch — never below it.' },
      { wrong: 'Shoulders shrugging up toward the ears', fix: 'Keep them actively pressed down throughout.' },
      { wrong: 'Bouncing out of the bottom', fix: 'Pause briefly, then press with control.' },
    ],
    cues: ['Shoulders stay below the elbows at the bottom', 'No shrug at any point'],
  },
}

/** Variants that share a core lift's setup, faults and cues. */
const DETAIL_ALIASES: Record<string, string> = {
  'barbell-back-squat': 'barbell-squat',
  'smith-machine-squat': 'barbell-squat',
  'goblet-squat': 'barbell-squat',
  'trap-bar-deadlift': 'deadlift',
  'sumo-deadlift': 'deadlift',
  'rack-pull': 'deadlift',
  'kettlebell-deadlift': 'deadlift',
  'dumbbell-rdl': 'romanian-deadlift',
  'single-leg-rdl': 'romanian-deadlift',
  'barbell-hip-thrust': 'hip-thrust-machine',
  'single-leg-hip-thrust': 'hip-thrust-machine',
  'glute-bridge': 'hip-thrust-machine',
  'chin-ups': 'pull-ups',
  'neutral-grip-pull-ups': 'pull-ups',
  'weighted-pull-ups': 'pull-ups',
  'assisted-pull-up': 'pull-ups',
  'band-assisted-pull-up': 'pull-ups',
  'dumbbell-bench-press': 'bench-press',
  'close-grip-bench-press': 'bench-press',
  'weighted-push-ups': 'push-up',
  'seated-cable-row': 'barbell-row',
  'one-arm-db-row': 'barbell-row',
  'chest-supported-row': 'barbell-row',
  'machine-row': 'barbell-row',
  'assisted-dip': 'bar-dips',
  'bench-dip': 'bar-dips',
  'bar-knee-raises': 'hanging-leg-raises',
  'hanging-knee-raise': 'hanging-leg-raises',
  'leg-lowers': 'hanging-leg-raises',
}

/** Setup/faults/cues for a lift, following variant aliases. */
export function coreDetailFor(exerciseId: string): Pick<ExerciseGuide, 'setup' | 'mistakes' | 'cues'> | undefined {
  return CORE_DETAIL[exerciseId] ?? CORE_DETAIL[DETAIL_ALIASES[exerciseId] ?? '']
}
