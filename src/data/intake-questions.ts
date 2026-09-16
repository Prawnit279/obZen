/**
 * The goal questionnaire.
 *
 * Every question here earns its place by deciding something downstream — which
 * programme is recommended, how much volume it carries, or what the guidance is
 * allowed to claim. `drives` records that reason next to each one, so a future
 * edit can tell a load-bearing question from a decorative one.
 *
 * Four are pre-fillable from data the app already holds. Those are shown for
 * confirmation rather than asked cold: re-asking for a number already on screen
 * elsewhere reads as the app not paying attention.
 */

export type QuestionSection = 'goal' | 'starting' | 'schedule' | 'recovery' | 'nutrition' | 'preference'

export const SECTIONS: { id: QuestionSection; label: string; blurb: string }[] = [
  { id: 'goal',       label: 'Goal',       blurb: 'What the plan is optimising for.' },
  { id: 'starting',   label: 'Starting point', blurb: 'Where you are now.' },
  { id: 'schedule',   label: 'Schedule',   blurb: 'What you can actually do.' },
  { id: 'recovery',   label: 'Recovery',   blurb: 'What the volume has to fit inside.' },
  { id: 'nutrition',  label: 'Nutrition',  blurb: 'How realistic the goal is.' },
  { id: 'preference', label: 'Preference', blurb: 'Picking between plans that both fit.' },
]

export type AnswerType = 'single' | 'multi' | 'scale' | 'number' | 'date' | 'lifts'

/** What the app can fill in on the user's behalf, so it is confirmed not asked. */
export type Prefill = 'trainingDays' | 'weightGoal' | 'bodyweight' | 'topSets'

export interface IntakeQuestion {
  id: string
  section: QuestionSection
  /** The question as asked. */
  prompt: string
  /** One line under it, only where the question is easy to read two ways. */
  hint?: string
  type: AnswerType
  /** For single and multi. */
  options?: { value: string; label: string }[]
  /** For scale: the ends, low first. */
  scaleLabels?: [string, string]
  /** For number. */
  unit?: string
  /** Free-text box alongside the choices. */
  allowNote?: boolean
  prefill?: Prefill
  /** Why this question exists. Not shown to the user. */
  drives: string
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  // ── Goal ──────────────────────────────────────────────────────────────────
  {
    id: 'primary-goal', section: 'goal', type: 'single', prefill: 'weightGoal',
    prompt: 'What are you training for right now?',
    options: [
      { value: 'muscle',   label: 'Gain muscle' },
      { value: 'fat-loss', label: 'Lose fat, keep the muscle I have' },
      { value: 'recomp',   label: 'Lose fat and gain muscle' },
      { value: 'maintain', label: 'Maintain where I am' },
    ],
    drives: 'Programme family and how guidance frames every other number.',
  },
  {
    id: 'timeframe', section: 'goal', type: 'single',
    prompt: 'Over what sort of timeframe?',
    options: [
      { value: '8w',   label: '8 weeks' },
      { value: '12w',  label: '12 weeks' },
      { value: '16w',  label: '16 weeks' },
      { value: '24w',  label: '24 weeks or more' },
      { value: 'open', label: 'No deadline' },
    ],
    drives: 'Mesocycle length and how often a deload is scheduled.',
  },
  {
    id: 'target-date', section: 'goal', type: 'date',
    prompt: 'Is there a date you are training toward?',
    hint: 'A meet, a trip, anything you want to be ready for.',
    drives: 'Whether the block peaks toward a date or just accumulates.',
  },
  {
    id: 'strength-or-look', section: 'goal', type: 'single',
    prompt: 'If you had to pick one — the numbers, or how you look?',
    options: [
      { value: 'strength', label: 'The numbers on the bar' },
      { value: 'physique', label: 'How I look' },
      { value: 'both',     label: 'Genuinely both' },
    ],
    drives: 'Tie-breaker when the primary goal alone suits several programmes.',
  },

  // ── Starting point ────────────────────────────────────────────────────────
  {
    id: 'training-age', section: 'starting', type: 'single',
    prompt: 'How long have you trained consistently with barbells?',
    hint: 'Consistently — not counting long gaps.',
    options: [
      { value: 'under-6m', label: 'Under 6 months' },
      { value: '6-18m',    label: '6 to 18 months' },
      { value: '18m-3y',   label: '18 months to 3 years' },
      { value: 'over-3y',  label: 'Over 3 years' },
    ],
    drives: 'The largest single input to programme choice.',
  },
  {
    id: 'top-sets', section: 'starting', type: 'lifts', prefill: 'topSets',
    prompt: 'Your best recent set on each lift',
    hint: 'Weight and reps. Taken from your log where there is one.',
    drives: 'Seeds the training max every percentage-based programme runs on.',
  },
  {
    id: 'recent-progress', section: 'starting', type: 'single',
    prompt: 'Have your main lifts moved in the last eight weeks?',
    options: [
      { value: 'steady',  label: 'Yes, steadily' },
      { value: 'slow',    label: 'Slowly' },
      { value: 'stalled', label: 'Stalled' },
      { value: 'unsure',  label: 'Not sure' },
    ],
    drives: 'Whether to seed a training max, advance one, or reset it.',
  },
  {
    id: 'bodyweight', section: 'starting', type: 'number', unit: 'lb', prefill: 'bodyweight',
    prompt: 'What do you weigh?',
    drives: 'Strength ratios, the ×BW reading and the DOTS estimate.',
  },

  // ── Schedule ──────────────────────────────────────────────────────────────
  {
    id: 'days-per-week', section: 'schedule', type: 'single', prefill: 'trainingDays',
    prompt: 'How many days a week can you train?',
    hint: 'Realistically, on a normal week.',
    options: [
      { value: '2', label: '2 days' },
      { value: '3', label: '3 days' },
      { value: '4', label: '4 days' },
      { value: '5', label: '5 days' },
      { value: '6', label: '6 days' },
    ],
    drives: 'Gates programmes outright — some need 2 to 3 days, others 4 to 5.',
  },
  {
    id: 'session-length', section: 'schedule', type: 'single',
    prompt: 'How long is a realistic session?',
    options: [
      { value: '30', label: '30 minutes' },
      { value: '45', label: '45 minutes' },
      { value: '60', label: 'An hour' },
      { value: '75', label: '75 minutes' },
      { value: '90', label: '90 minutes or more' },
    ],
    drives: 'Gates high-volume templates — 5×10 does not fit in 45 minutes.',
  },
  {
    id: 'equipment', section: 'schedule', type: 'multi',
    prompt: 'What do you have access to?',
    options: [
      { value: 'rack',      label: 'Barbell and rack' },
      { value: 'bench',     label: 'Bench' },
      { value: 'dumbbells', label: 'Dumbbells' },
      { value: 'machines',  label: 'Cables or machines' },
      { value: 'pullup',    label: 'Pull-up bar' },
      { value: 'specialty', label: 'Specialty bars (safety squat, trap, EZ)' },
    ],
    drives: 'Programme viability, and which movements can be substituted.',
  },
  {
    id: 'conditioning', section: 'schedule', type: 'single',
    prompt: 'Do you train conditioning alongside lifting?',
    hint: 'Running, rucking, cycling, sport — anything with a cardio cost.',
    options: [
      { value: 'none',      label: 'No' },
      { value: 'secondary', label: 'Some, but lifting comes first' },
      { value: 'equal',     label: 'Yes, and it matters as much' },
    ],
    drives: 'The single question that makes a concurrent template the right answer.',
  },

  // ── Recovery ──────────────────────────────────────────────────────────────
  {
    id: 'sleep', section: 'recovery', type: 'single',
    prompt: 'How much do you usually sleep?',
    options: [
      { value: 'under-5', label: 'Under 5 hours' },
      { value: '5-6',     label: '5 to 6 hours' },
      { value: '6-7',     label: '6 to 7 hours' },
      { value: '7-8',     label: '7 to 8 hours' },
      { value: 'over-8',  label: 'Over 8 hours' },
    ],
    drives: 'The ceiling on weekly volume, and how often to deload.',
  },
  {
    id: 'soreness', section: 'recovery', type: 'scale',
    prompt: 'How beaten up do you usually feel between sessions?',
    scaleLabels: ['Fresh', 'Wrecked'],
    drives: 'How much the plan should adjust to the day rather than the sheet.',
  },
  {
    id: 'life-stress', section: 'recovery', type: 'single',
    prompt: 'How demanding is life outside the gym at the moment?',
    options: [
      { value: 'low',      label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high',     label: 'High' },
    ],
    drives: 'Deload cadence — stress spends the same recovery training does.',
  },
  {
    id: 'injuries', section: 'recovery', type: 'multi', allowNote: true,
    prompt: 'Anything you need to work around?',
    hint: 'Pick what applies and add detail if it helps.',
    options: [
      { value: 'none',     label: 'Nothing right now' },
      { value: 'lowback',  label: 'Lower back' },
      { value: 'knee',     label: 'Knee' },
      { value: 'shoulder', label: 'Shoulder' },
      { value: 'elbow',    label: 'Elbow or wrist' },
      { value: 'hip',      label: 'Hip' },
    ],
    drives: 'Which movements get substituted, and what guidance must not suggest.',
  },

  // ── Nutrition ─────────────────────────────────────────────────────────────
  {
    id: 'eating-consistency', section: 'nutrition', type: 'scale',
    prompt: 'How consistent is your eating with that goal?',
    scaleLabels: ['All over the place', 'Dialled in'],
    drives: 'Whether a recomp goal is plausible or should be said to be slow.',
  },
  {
    id: 'tracking', section: 'nutrition', type: 'single',
    prompt: 'Do you track protein or calories?',
    options: [
      { value: 'yes',     label: 'Yes, properly' },
      { value: 'roughly', label: 'Roughly' },
      { value: 'no',      label: 'No' },
    ],
    drives: 'How specific nutrition guidance is allowed to be.',
  },

  // ── Preference ────────────────────────────────────────────────────────────
  {
    id: 'plan-style', section: 'preference', type: 'single',
    prompt: 'Would you rather follow a fixed plan, or one that adjusts to the day?',
    options: [
      { value: 'fixed',   label: 'Fixed — tell me what to lift' },
      { value: 'adjusts', label: 'Adjusts to how I feel that day' },
      { value: 'either',  label: 'No strong preference' },
    ],
    drives: 'Percentage-based templates against autoregulated ones.',
  },
  {
    id: 'accessory-appetite', section: 'preference', type: 'single',
    prompt: 'How much accessory work do you actually enjoy?',
    hint: 'Honestly — a plan you skip half of is not the plan.',
    options: [
      { value: 'minimal',  label: 'Minimal — the main lifts and out' },
      { value: 'moderate', label: 'Some' },
      { value: 'high',     label: 'Plenty, I like the volume' },
    ],
    drives: 'High-volume templates against minimalist ones.',
  },
]
