/**
 * The three doshas, and what each one is usually advised.
 *
 * Ayurveda is a traditional system, not a clinical one. These are the
 * conventional descriptions and the guidance that classically follows from
 * them — useful as a lens for noticing patterns in sleep, appetite, energy and
 * temperament, and for choosing between things that are all fine anyway
 * (when to train, how hard, what to eat afterwards).
 *
 * They are not medical advice and nothing here should displace it. The UI says
 * so where this is shown rather than leaving the reader to infer it.
 *
 * The richer Pitta-specific material — the full dinacharya, remedy list and
 * macro targets — stays in `ayurveda.ts`, which predates this and is wired into
 * the Ayurveda screen's checklists. This file is the part that varies by dosha.
 */

export const DOSHAS = ['Vata', 'Pitta', 'Kapha'] as const
export type Dosha = typeof DOSHAS[number]

export interface DoshaGuidance {
  dosha: Dosha
  elements: string
  /** The classical qualities, in the order they are usually listed. */
  qualities: string[]
  /** What it tends to look like when things are going well. */
  balanced: string[]
  /** The usual first signs of excess — what to watch for. */
  excess: string[]
  /** The season this dosha classically accumulates in. */
  season: string
  /** One line on the governing principle: like increases like, so balance with the opposite. */
  principle: string

  training: {
    /** When training is classically best placed for this type. */
    bestTime: string
    /** How this type is usually advised to train. */
    approach: string
    /** The specific trap this type falls into. */
    watchFor: string
  }

  /** Tastes to favour and reduce — the core of Ayurvedic food guidance. */
  favorTastes: string[]
  reduceTastes: string[]
  /** A handful of concrete foods, so the tastes mean something practical. */
  favorFoods: string[]
  reduceFoods: string[]

  /** Short, actionable daily practices. */
  daily: string[]
}

export const DOSHA_GUIDANCE: Record<Dosha, DoshaGuidance> = {
  Vata: {
    dosha: 'Vata',
    elements: 'Air + Ether',
    qualities: ['dry', 'light', 'cold', 'rough', 'subtle', 'mobile'],
    balanced: ['creative', 'quick to learn', 'enthusiastic', 'adaptable', 'lively'],
    excess: ['anxious', 'scattered', 'restless sleep', 'dry skin', 'bloating', 'cold hands and feet', 'irregular appetite'],
    season: 'Autumn and early winter — cold, dry and windy',
    principle: 'Dry, light and cold accumulate, so warmth, oil, weight and above all routine settle them.',
    training: {
      bestTime: 'Mid-morning, once the body has warmed',
      approach: 'Steady and grounding. Moderate loads, longer rests, the same days each week — regularity matters more here than intensity.',
      watchFor: 'Under-eating and over-reaching on light, restless days. Vata burns through reserves it has not built.',
    },
    favorTastes: ['sweet', 'sour', 'salty'],
    reduceTastes: ['bitter', 'astringent', 'pungent'],
    favorFoods: ['warm cooked grains', 'root vegetables', 'ghee', 'sesame oil', 'soups and stews', 'stewed fruit', 'nuts', 'warm milk'],
    reduceFoods: ['raw salads', 'crackers and dry snacks', 'iced drinks', 'excess caffeine', 'beans in quantity', 'dried fruit'],
    daily: [
      'Eat at the same times each day — irregular meals unsettle Vata faster than any single food',
      'Warm sesame oil massage before a shower, especially in cold weather',
      'Warm, cooked, moist food over raw and dry',
      'Bed by 10pm; Vata sleep is light and hard to recover once lost',
      'Slow nasal breathing when scattered — long exhale, no force',
    ],
  },

  Pitta: {
    dosha: 'Pitta',
    elements: 'Fire + Water',
    qualities: ['hot', 'sharp', 'intense', 'light', 'acidic', 'penetrating'],
    balanced: ['courageous', 'direct', 'sharp intellect', 'warm personality', 'natural leader'],
    excess: ['irritable', 'impatient', 'judgmental', 'heartburn', 'skin rashes', 'inflammation', 'headaches'],
    season: 'Summer, roughly mid-June to October',
    principle: 'Heat and sharpness accumulate, so cooling, sweetness and letting up settle them.',
    training: {
      bestTime: 'Before 10am, or in the cool of the evening',
      approach: 'Hard work suits Pitta, but with the competitive edge taken off. Train to a plan rather than to whoever is on the next rack.',
      watchFor: 'Overheating and pushing through warning signs. Pitta will finish the session it planned regardless of what the body says.',
    },
    favorTastes: ['sweet', 'bitter', 'astringent'],
    reduceTastes: ['sour', 'salty', 'pungent'],
    favorFoods: ['rice', 'oats', 'sweet potato', 'cucumber', 'coconut', 'ghee', 'fennel', 'coriander', 'mint', 'sweet fruit', 'leafy greens'],
    reduceFoods: ['chilli', 'excess garlic', 'raw onion', 'tomato', 'vinegar', 'alcohol', 'fried food', 'excess caffeine'],
    daily: [
      'Largest meal between 10am and 2pm, when digestion is strongest',
      'Room-temperature drinks rather than iced — cold shocks more than it cools',
      'A teaspoon of ghee daily; it is the most Pitta-pacifying fat',
      'Avoid intense media late; the mind stays lit long after the screen is off',
      'Bed by 10pm, before the second Pitta window opens',
    ],
  },

  Kapha: {
    dosha: 'Kapha',
    elements: 'Earth + Water',
    qualities: ['heavy', 'slow', 'cool', 'oily', 'smooth', 'stable'],
    balanced: ['calm', 'steady', 'strong', 'patient', 'loyal', 'good stamina'],
    excess: ['sluggish', 'heavy after meals', 'congested', 'oversleeping', 'reluctant to start', 'holding weight easily'],
    season: 'Late winter and spring — cold and damp',
    principle: 'Heaviness and stagnation accumulate, so warmth, stimulation and movement settle them.',
    training: {
      bestTime: 'Early morning — the hardest time to start and the most useful',
      approach: 'Vigorous and varied. Higher intensity, shorter rests, changes of stimulus. Kapha responds well to being pushed once moving.',
      watchFor: 'Not starting. The session skipped is the one that mattered; consistency beats perfection here.',
    },
    favorTastes: ['pungent', 'bitter', 'astringent'],
    reduceTastes: ['sweet', 'sour', 'salty'],
    favorFoods: ['barley', 'millet', 'leafy greens', 'legumes', 'ginger', 'black pepper', 'turmeric', 'apples', 'honey in small amounts'],
    reduceFoods: ['dairy in quantity', 'fried food', 'sugar', 'wheat in excess', 'cold food and drink', 'heavy desserts', 'excess salt'],
    daily: [
      'Move first thing, before eating — Kapha shifts once it is in motion',
      'Skip or lighten breakfast if genuinely not hungry; forced meals sit heavy',
      'Warming spices at every meal — ginger, black pepper, turmeric',
      'Dry brushing before a shower rather than heavy oiling',
      'Up by 6am; sleeping into the Kapha window makes the whole day heavier',
    ],
  },
}

/** The guidance for a dosha, defaulting to Pitta for an unrecognised value. */
export function guidanceFor(dosha: string | undefined): DoshaGuidance {
  return DOSHA_GUIDANCE[dosha as Dosha] ?? DOSHA_GUIDANCE.Pitta
}

/**
 * One rotating daily line for a dosha, chosen by date so it is stable through
 * the day rather than changing on every render.
 */
export function dailyTipFor(dosha: string | undefined, dateISO: string): string {
  const tips = guidanceFor(dosha).daily
  const dayNumber = Math.floor(Date.parse(`${dateISO}T00:00:00Z`) / 86_400_000)
  const index = Number.isFinite(dayNumber) ? Math.abs(dayNumber) % tips.length : 0
  return tips[index]
}
