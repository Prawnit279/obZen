export interface VedicRemedy {
  planet: string
  theme: string
  remedies: string[]
  meditation: string
  affirmation: string
  day?: string
  color?: string
}

export const VEDIC_REMEDIES: VedicRemedy[] = [
  {
    planet: 'Saturn (Atmakaraka)',
    theme: 'Discipline, delayed rewards, karmic authority, service',
    day: 'Saturday',
    color: 'Dark blue or black',
    remedies: [
      'Chant: Om Shani Namaha (108 times on Saturdays)',
      'Fast or eat simple food on Saturdays',
      'Service to the elderly or disabled — karma yoga',
      'Wear dark blue or black on Saturdays',
      'Sesame seed oil abhyanga on Saturdays',
      'Donate sesame seeds, iron, or black cloth on Saturdays',
      'Practice patience consciously when delayed or blocked',
      'Build systems over relying on motivation — Saturn rewards structure',
    ],
    meditation: 'Saturn Mantra meditation — 20 mins on Saturday mornings facing west',
    affirmation: 'I embrace discipline as devotion. Delays are redirections toward mastery.',
  },
  {
    planet: 'Rahu (Mahadasha Active ~2024–2030)',
    theme: 'Ambition, illusion, sudden change, material world mastery',
    day: 'Saturday or Wednesday',
    color: 'Dark blue or grey',
    remedies: [
      'Chant: Om Rahave Namaha (108 times on Saturdays or Wednesdays)',
      'Donate to orphanages or marginalized communities — Rahu rules the outsider',
      'Avoid overthinking and chasing illusions — ground in physical reality',
      'Coconut donation to temple or flowing water (river, ocean)',
      'Reduce excessive ambition — distinguish desire from dharma',
      'Journal to track where illusion meets reality in decision-making',
      'Hessonite (Gomed) gemstone if confirmed by Jyotishi',
    ],
    meditation: 'Trataka (candle gazing) — builds Rahu focus without feeding delusion',
    affirmation: 'I channel ambition into disciplined action. I see clearly without illusion.',
  },
  {
    planet: 'Ketu (Conjunct Lagna in Ashwini)',
    theme: 'Detachment, past-life mastery, spiritual isolation, karmic release',
    day: 'Tuesday',
    color: 'Smoke grey or brown',
    remedies: [
      'Chant: Om Ketave Namaha (108 times on Tuesdays)',
      'Donate to animal shelters — Ketu rules animals and the instinctual',
      'Practice non-attachment consciously — release outcomes deliberately',
      'Spend time in silence and solitude — honor the Warrior-Hermit archetype',
      "Distinguish healthy solitude from avoidant withdrawal — don't cross the line",
      "Past-life regression or deep shadow work meditation",
      "Cat's eye (Lehsunia) gemstone if confirmed by Jyotishi",
    ],
    meditation: "Silent sitting — 20 mins minimum. No mantra. Pure presence.",
    affirmation: "I release what no longer serves. My solitude is sacred, not exile.",
  },
  {
    planet: 'Jupiter in Anuradha (7th House)',
    theme: 'Destined partner, deep loyal bonds, transformative relationships',
    day: 'Thursday',
    color: 'Yellow or gold',
    remedies: [
      'Chant: Om Gurave Namaha (108 times on Thursdays)',
      'Donate yellow items, turmeric, or sweets on Thursdays',
      'Cultivate patience in relationships — Jupiter delays but delivers',
      'Study how Saturn and Ketu themes show up in your partnerships',
      'Avoid controlling or demanding in relationships — Jupiter rewards surrender',
      'Perform acts of generosity without expectation — Jupiter expands what you give',
      'Yellow sapphire (Pukhraj) if confirmed by Jyotishi',
    ],
    meditation: 'Heart chakra meditation — visualize emerald green expanding from chest outward',
    affirmation: 'I trust Jupiter\'s timing. My destined connection comes when I am ready.',
  },
  {
    planet: 'Moon (Darakaraka in Bharani)',
    theme: 'Soulmate indicator — nurturing, emotionally stable, intense, creative',
    day: 'Monday',
    color: 'White or silver',
    remedies: [
      'Chant: Om Chandraya Namaha (108 times on Mondays)',
      'Offer milk or white flowers to the moon on full moon nights',
      'Cultivate emotional availability — partner mirrors your emotional world',
      'Practice emotional expression — shadow work for emotional suppression',
      'Journal on full and new moon — track emotional cycles and patterns',
      'Pearl or moonstone if confirmed by Jyotishi',
    ],
    meditation: 'Moon gazing on full moon — 5–10 mins with soft unfocused gaze',
    affirmation: 'I am emotionally available. I give and receive care without armor.',
  },
  {
    planet: 'Upapada Lagna (Capricorn)',
    theme: 'Marriage dharma — structure, commitment, ambition in partnership',
    day: 'Saturday',
    color: 'Dark colors — Capricorn/Saturn tones',
    remedies: [
      'Partnership must align with life purpose and ambition — not just compatibility',
      'Look for Capricorn-Saturn qualities: disciplined, reliable, structured, patient',
      'Avoid rushing into commitment — Capricorn UL rewards slow deliberate union',
      'Build life structure first — career and purpose clarity attracts aligned partner',
      'Reflect on what you are building as a unit — Capricorn demands shared goals',
    ],
    meditation: 'Intention-setting meditation on partnership dharma — what you build together',
    affirmation: 'My partnership is built on shared purpose and mutual respect.',
  },
  {
    planet: 'General Vedic Daily Practice',
    theme: 'Overall karmic balance, protection, and alignment',
    day: 'Daily',
    color: 'White at dawn, dark at dusk',
    remedies: [
      'Sun gazing at dawn (facing east) — 5–10 seconds, soft unfocused gaze',
      'Sun gazing at dusk (facing west) — 5–10 seconds, soft unfocused gaze',
      'Earthing — barefoot on grass or soil minimum 15 mins daily',
      'Chant Om Namah Shivaya during sun gazing or morning routine',
      'Light a ghee diya (lamp) on Saturday evenings — Saturn offering',
      'Saturday: discipline, service, reduced ambition — not a day for new starts',
      'Maintain a clean, organized living space — Saturn Atmakaraka rewards order',
    ],
    meditation: 'So Hum mantra meditation — 20–30 mins daily at dawn',
    affirmation: 'I align with my karma consciously. I serve, discipline, and trust the path.',
  },
]

export const PLANETARY_DAYS = {
  0: { planet: 'Sun', color: 'Orange/Gold', mantra: 'Om Suryaya Namaha' },
  1: { planet: 'Moon', color: 'White/Silver', mantra: 'Om Chandraya Namaha' },
  2: { planet: 'Mars', color: 'Red', mantra: 'Om Mangalaya Namaha' },
  3: { planet: 'Mercury', color: 'Green', mantra: 'Om Budhaya Namaha' },
  4: { planet: 'Jupiter', color: 'Yellow/Gold', mantra: 'Om Gurave Namaha' },
  5: { planet: 'Venus', color: 'White/Pink', mantra: 'Om Shukraya Namaha' },
  6: { planet: 'Saturn', color: 'Dark Blue/Black', mantra: 'Om Shani Namaha' },
}

export const RAHU_MAHADASHA = {
  start: '2024-01-01',
  end: '2030-12-31',
  theme: 'Ambition, illusion, material mastery, expansion',
  guidance: [
    'Channel Rahu ambition into dharmic service — Saturn Atmakaraka keeps it grounded',
    'Beware illusion and shortcuts — Rahu tempts, Saturn demands patience',
    'Material gains are possible — ensure they align with Ketu detachment practice',
    'Foreign elements, technology, and innovation are Rahu gifts — use them',
    'Stay vigilant against obsession — Rahu amplifies whatever it touches',
  ],
}
