export const PITTA_PROFILE = {
  elements: 'Fire + Water',
  qualities: ['hot', 'sharp', 'intense', 'light', 'acidic', 'penetrating'],
  balancedSigns: ['courageous', 'direct', 'sharp intellect', 'warm personality', 'great leader'],
  imbalancedSigns: ['aggressive', 'angry', 'impatient', 'judgmental', 'heartburn', 'skin rashes', 'inflammation', 'headaches'],
  season: 'Summer (mid-June to October) — heightened imbalance risk',
  pittaTime: '10am–2pm and 10pm–2am',
  bestExerciseTime: 'Before 10am or in cool evening',
  avoid: ['hot yoga', 'overheating', 'competitive environments', 'spicy foods', 'hot drinks', 'sour/salty/pungent tastes'],
  favor: ['sweet', 'bitter', 'astringent', 'cooling foods', 'coconut', 'ghee', 'fennel', 'coriander', 'cilantro', 'mint'],
}

export const PITTA_DINACHARYA = {
  wakeTime: 'Before sunrise (cool time)',
  morningPractices: [
    { id: 'tongue-scraping', label: 'Tongue scraping', note: 'Yellow coating = Pitta imbalance indicator' },
    { id: 'oil-pulling', label: 'Oil pulling with coconut oil', note: 'Cooling for Pitta' },
    { id: 'warm-water-lime', label: 'Warm water with lime', note: 'Lime is more cooling than lemon' },
    { id: 'nasya', label: 'Nasya oil application', note: 'Nasal lubrication' },
    { id: 'sheetali', label: 'Cooling Breath (Sheetali pranayama)', note: 'Primary breath practice for Pitta' },
    { id: 'cooling-yoga', label: 'Cooling yoga sequence', note: 'No hot yoga' },
    { id: 'abhyanga', label: 'Coconut oil body massage (abhyanga)', note: 'Cooling oil only' },
    { id: 'cool-shower', label: 'Cool (not cold) shower', note: 'Cold water shocks Vata — cool is enough' },
    { id: 'warm-breakfast', label: 'Warm nourishing breakfast', note: 'Never skip — Pitta needs fuel' },
  ],
  nutritionPrinciples: [
    'Largest meal 10am–2pm (Pitta time — strongest digestion)',
    'Favor: sweet, bitter, astringent tastes',
    'Reduce: sour, salty, pungent',
    'Cool foods preferred — room temperature drinks (not iced)',
    'Avoid spicy food — worsens Pitta',
    'Ghee daily — very balancing for Pitta',
    'No mixing proteins in one meal',
    'Walk 5–10 mins after meals',
    'Dinner by 6–7pm — light and easy to digest',
    'Golden Milk before bed',
  ],
  eveningPractices: [
    { id: 'light-dinner', label: 'Light dinner by 6–7pm', note: 'Avoid heavy proteins at night' },
    { id: 'calming-eve', label: 'Calming activities', note: 'No violent or intense media' },
    { id: 'triphala', label: 'Triphala tablets before bed', note: 'Supports digestion and elimination' },
    { id: 'golden-milk', label: 'Golden Milk', note: 'Turmeric + warm milk — calms Pitta' },
    { id: 'foot-oil', label: 'Foot oiling with coconut or bhringaraj oil', note: 'Grounds and calms' },
    { id: 'head-oil', label: 'Head oiling (small amount)', note: 'Calming for overactive Pitta mind' },
    { id: 'cooling-oils', label: 'Cooling essential oils', note: 'Sandalwood, jasmine, lavender' },
    { id: 'anb', label: 'Alternate Nostril Breathing before sleep', note: 'Balances nervous system' },
    { id: 'bed-by-10', label: 'Bed by 10pm', note: 'Before Pitta time begins (10pm–2am)' },
  ],
}

export interface PittaRemedy {
  condition: string
  remedies: string[]
  herbs: string[]
  lifestyle: string
}

export const PITTA_REMEDIES: PittaRemedy[] = [
  {
    condition: 'Heartburn / Acid Reflux',
    remedies: [
      'Cooling Breath (Sheetali) immediately',
      '1 tbsp aloe vera juice + ¼ tsp baking soda in water',
      '2 tbsp apple cider vinegar in warm water (test — may aggravate)',
      'Omam water (ajwain seeds steeped in hot water, cooled)',
      'Avoid spicy, sour, fried foods',
    ],
    herbs: ['licorice', 'shatavari', 'fennel'],
    lifestyle: 'Eat dinner 3+ hours before bed. Walk after meals. Sleep on left side.',
  },
  {
    condition: 'Skin Rashes / Inflammation',
    remedies: [
      'Coconut oil topically on affected area',
      'Sandalwood + turmeric paste on rash',
      'Cool (not cold) baths with Epsom salts',
      'Neem supplements or neem tea',
      'Reduce heat-producing foods immediately',
    ],
    herbs: ['neem', 'turmeric', 'amalaki', 'guduchi'],
    lifestyle: 'Avoid overheating in exercise. Cool environment. Cotton clothing.',
  },
  {
    condition: 'Headache / Migraine',
    remedies: [
      'Alternate Nostril Breathing for 15+ minutes',
      'Cooling oil (coconut or sandalwood) on temples and forehead',
      'Cold black tea compress on forehead',
      'Avoid Pitta-aggravating foods',
      'Rest in cool dark room',
    ],
    herbs: ['brahmi', 'shatavari', 'boswellia'],
    lifestyle: 'Stay hydrated. Avoid midday sun. Reduce screen time.',
  },
  {
    condition: 'Anger / Irritability / Impatience',
    remedies: [
      'Cooling Breath (Sheetali) — 10 rounds immediately',
      'Alternate Nostril Breathing — minimum 5 minutes',
      'Rose water spray on face',
      'Eat sweet, bitter, astringent foods',
      'Avoid sour, salty, pungent foods while reactive',
    ],
    herbs: ['brahmi', 'ashwagandha', 'jatamansi'],
    lifestyle: 'Non-competitive exercise. Cooling yoga. Avoid arguments when hungry.',
  },
  {
    condition: 'Inflammation / Joint Pain',
    remedies: [
      'Turmeric golden milk twice daily',
      'Boswellia supplement (400mg)',
      'Coconut or sesame oil massage on affected joints',
      'Anti-inflammatory diet — reduce nightshades',
      'Ice therapy post-workout on inflamed areas',
    ],
    herbs: ['boswellia', 'turmeric', 'ashwagandha', 'guggulu'],
    lifestyle: 'Avoid overtraining. Cool-down properly after workouts.',
  },
  {
    condition: 'Overheating During Workout',
    remedies: [
      'Coconut water immediately',
      'Cooling Breath between sets',
      'Cold towel on neck and inner wrists',
      'Reduce session intensity by 30%',
      'Move to cooler environment or near fan',
    ],
    herbs: ['fennel water', 'CCF tea (cooled to room temp)'],
    lifestyle: 'Exercise before 10am or after 6pm. Avoid Pitta peak (10am–2pm) for intense sessions.',
  },
  {
    condition: 'Sleep Issues / Racing Mind',
    remedies: [
      'Golden Milk 30 minutes before bed',
      'Foot oiling with bhringaraj or coconut oil',
      'Small amount of head oil (brahmi oil)',
      'Alternate Nostril Breathing for 10 minutes',
      'Nutmeg in warm milk or Golden Milk',
      'No screens after 9pm — non-negotiable',
    ],
    herbs: ['ashwagandha', 'brahmi', 'jatamansi', 'nutmeg'],
    lifestyle: 'Bed by 10pm. Journal before sleep to discharge mental load. Lavender oil on pillow.',
  },
  {
    condition: 'Digestive Issues / Indigestion',
    remedies: [
      'CCF Tea (cumin, coriander, fennel — equal parts)',
      'Walk 5–10 minutes after every meal',
      'Avoid overeating — eat to 80% capacity',
      'Chew roasted fennel seeds after meals',
      'Warm water with lime before meals',
    ],
    herbs: ['triphala', 'fennel', 'mild ginger', 'ajwain'],
    lifestyle: 'Sit to eat. No screens during meals. Largest meal at lunch. Light dinner.',
  },
  {
    condition: 'Seasonal Pitta Imbalance (Summer)',
    remedies: [
      'Increase bitter, astringent, sweet foods significantly',
      'Coconut water daily — morning',
      'Reduce spicy foods completely June–October',
      'Cooling essential oils: sandalwood, jasmine, rose',
      'Cool (not cold) baths — especially in evenings',
    ],
    herbs: ['neem', 'amalaki', 'guduchi', 'shatavari'],
    lifestyle: 'Wear light cotton. Avoid midday heat. Sun gaze only at dawn and dusk.',
  },
  {
    condition: 'Stress / Burnout (INTJ overwork pattern)',
    remedies: [
      'Meditation daily — minimum 20 minutes',
      'Alternate Nostril Breathing at stress onset',
      'Abhyanga (self-oil massage) with cooling oils — Sunday ritual',
      'Periodic media fast — one full day per week',
      'Nature walks — barefoot earthing practice',
    ],
    herbs: ['ashwagandha', 'brahmi', 'tulsi', 'jatamansi'],
    lifestyle: 'Honor rest as productive. Schedule downtime with the same discipline as work.',
  },
]

export const PITTA_NUTRITION = {
  trainingDay: {
    protein: { min: 135, max: 165, unit: 'g' },
    carbs: { min: 220, max: 320, unit: 'g' },
    fat: { min: 50, max: 68, unit: 'g' },
    calories: { min: 2400, max: 2700, unit: 'kcal' },
    ayurvedicNote: 'Favor cooling proteins: fish, tofu, eggs. Rice over spicy foods. Coconut water for hydration. Ghee in cooking.',
  },
  restDay: {
    protein: { min: 135, max: 155, unit: 'g' },
    carbs: { min: 180, max: 240, unit: 'g' },
    fat: { min: 45, max: 60, unit: 'g' },
    calories: { min: 2100, max: 2400, unit: 'kcal' },
    ayurvedicNote: 'Kitchari (Pitta version) ideal on rest days. Light dinner. No heavy proteins at night.',
  },
  favorFoods: [
    'rice', 'oats', 'sweet potatoes', 'zucchini', 'asparagus', 'coconut',
    'ghee', 'fennel', 'coriander', 'mint', 'pomegranate', 'sweet fruits',
    'tofu', 'eggs', 'fish', 'mung beans', 'cucumber', 'leafy greens',
  ],
  avoidFoods: [
    'chili', 'excess garlic', 'raw onion', 'tomatoes', 'excess citrus',
    'vinegar', 'alcohol', 'fried foods', 'processed foods', 'caffeine excess',
  ],
  herbs: ['turmeric', 'fennel', 'coriander', 'cardamom', 'mint', 'shatavari', 'brahmi', 'neem', 'amalaki'],
  recipes: ['Pitta Kitchari', 'CCF Tea', 'Golden Milk', 'Daikon Tofu Summer Detox Soup', 'Easy Breakfast Bowl (quinoa version)'],
}

export const DAILY_AYURVEDA_TIPS: string[] = [
  'Tongue scraping removes Ama (toxins) accumulated overnight — look for yellow coating as Pitta indicator',
  'Ghee is the most Pitta-pacifying fat — add 1 tsp to rice or vegetables daily',
  'Largest meal at noon when Pitta fire is strongest — skip the late heavy dinners',
  'Coconut oil on scalp before bed calms Pitta mind and promotes deep sleep',
  'CCF Tea (cumin, coriander, fennel) supports digestion and reduces inflammation',
  'Walk 5–10 minutes after meals — stimulates digestion without aggravating Pitta',
  'Sheetali pranayama (cooling breath) is the single most powerful Pitta pacifier',
  'Avoid skipping meals — irregular eating destabilizes Pitta and causes irritability',
  'Fennel seeds chewed after meals reduce acid reflux and aid digestion',
  'Rose water spray on face and eyes calms Pitta heat instantly',
  'Alternate Nostril Breathing before bed discharges accumulated mental Pitta',
  'Summer is Pitta season — increase bitter and astringent foods June through October',
  'Triphala at bedtime supports elimination and removes excess Pitta from gut',
  'Avoid exercising in peak Pitta time (10am–2pm) — workout before 10am',
  'Sandalwood or jasmine essential oil on pulse points reduces Pitta anxiety',
  'Bed by 10pm — staying up through Pitta night time (10pm–2am) aggravates fire',
  'Pomegranate juice is one of the best Pitta-pacifying fruits — deeply cooling',
  'Raw onion and garlic are Pitta-aggravating — cook them or avoid when imbalanced',
  'Earthing (barefoot on grass/soil) is cooling and grounding for Pitta fire',
  'Saturn Atmakaraka: your soul purpose is through discipline and patient service',
  'Rahu Mahadasha brings ambition — channel it into dharmic work, not ego drives',
  'Ketu on lagna: detachment is a gift, not isolation — engage fully, release outcomes',
  'Moon Darakaraka (Bharani): your soulmate mirrors emotional depth — develop yours',
  'Jupiter in Anuradha (7th): deep loyal partnerships are destined — trust the timing',
  'Cooling yoga after intense workouts: Child\'s Pose, Legs Up the Wall, Supine Twist',
  'Bitter tastes (leafy greens, turmeric, neem) are the most underused Pitta pacifiers',
  'Never eat while stressed — cortisol and Pitta fire together damage digestion',
  'Mung beans are the ideal Pitta-pacifying protein — light, easy to digest, cooling',
  'Gold or silver jewelry is Pitta-pacifying — avoid excessive copper which heats',
  'Aspirational Pitta trap: competitive environments feel good but worsen imbalance',
]
