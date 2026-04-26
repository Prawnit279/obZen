import type { NotationData, NotationNote } from './notation-types'

function snare16(sticking: 'R' | 'L', accent = false): NotationNote {
  return { pitch: 'snare', duration: '16', sticking, accent }
}

// 16 sixteenth notes fills one bar of 4/4
const ss = snare16

export const RUDIMENT_NOTATION: NotationData[] = [
  // 1. Single Stroke Roll — R L R L … 2 bars
  {
    id: 'notation-single-stroke-roll',
    lessonId: 'single-stroke-roll',
    title: 'Single Stroke Roll',
    timeSignature: { beats: 4, value: 4 },
    tempo: 80,
    measures: [
      { notes: [ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L')] },
      { notes: [ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L'), ss('R'), ss('L')] },
    ],
  },

  // 2. Double Stroke Roll — R R L L … 2 bars
  {
    id: 'notation-double-stroke-roll',
    lessonId: 'double-stroke-roll',
    title: 'Double Stroke Roll',
    timeSignature: { beats: 4, value: 4 },
    tempo: 80,
    measures: [
      { notes: [ss('R'), ss('R'), ss('L'), ss('L'), ss('R'), ss('R'), ss('L'), ss('L'), ss('R'), ss('R'), ss('L'), ss('L'), ss('R'), ss('R'), ss('L'), ss('L')] },
      { notes: [ss('R'), ss('R'), ss('L'), ss('L'), ss('R'), ss('R'), ss('L'), ss('L'), ss('R'), ss('R'), ss('L'), ss('L'), ss('R'), ss('R'), ss('L'), ss('L')] },
    ],
  },

  // 3. Single Paradiddle — R L R R L R L L … 2 bars
  {
    id: 'notation-single-paradiddle',
    lessonId: 'single-paradiddle',
    title: 'Single Paradiddle',
    timeSignature: { beats: 4, value: 4 },
    tempo: 80,
    measures: [
      {
        notes: [
          ss('R', true), ss('L'), ss('R'), ss('R'),
          ss('L', true), ss('R'), ss('L'), ss('L'),
          ss('R', true), ss('L'), ss('R'), ss('R'),
          ss('L', true), ss('R'), ss('L'), ss('L'),
        ],
      },
      {
        notes: [
          ss('R', true), ss('L'), ss('R'), ss('R'),
          ss('L', true), ss('R'), ss('L'), ss('L'),
          ss('R', true), ss('L'), ss('R'), ss('R'),
          ss('L', true), ss('R'), ss('L'), ss('L'),
        ],
      },
    ],
  },

  // 4. Double Paradiddle — R L R L R R L R L R L L … 2 bars
  {
    id: 'notation-double-paradiddle',
    lessonId: 'double-paradiddle',
    title: 'Double Paradiddle',
    timeSignature: { beats: 4, value: 4 },
    tempo: 72,
    measures: [
      {
        notes: [
          ss('R', true), ss('L'), ss('R'), ss('L'), ss('R'), ss('R'),
          ss('L', true), ss('R'), ss('L'), ss('R'), ss('L'), ss('L'),
          ss('R', true), ss('L'), ss('R'), ss('L'),
        ],
      },
      {
        notes: [
          ss('R'), ss('R'),
          ss('L', true), ss('R'), ss('L'), ss('R'), ss('L'), ss('L'),
          ss('R', true), ss('L'), ss('R'), ss('L'), ss('R'), ss('R'),
          ss('L', true), ss('R'),
        ],
      },
    ],
  },

  // 5. Flam — grace note before primary stroke (marked with flam flag)
  {
    id: 'notation-flam',
    lessonId: 'flam',
    title: 'Flam',
    timeSignature: { beats: 4, value: 4 },
    tempo: 70,
    measures: [
      {
        notes: [
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
        ],
      },
      {
        notes: [
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'R', flam: true },
          { pitch: 'snare', duration: '8', sticking: 'L', flam: true },
        ],
      },
    ],
  },

  // 6. Drag — two grace notes before primary stroke
  {
    id: 'notation-drag',
    lessonId: 'drag',
    title: 'Drag',
    timeSignature: { beats: 4, value: 4 },
    tempo: 70,
    measures: [
      {
        notes: [
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
        ],
      },
      {
        notes: [
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
        ],
      },
    ],
  },

  // 7. Five Stroke Roll — R R L L R (16th group + 8th to fill beat)
  {
    id: 'notation-five-stroke-roll',
    lessonId: 'five-stroke-roll',
    title: 'Five Stroke Roll',
    timeSignature: { beats: 4, value: 4 },
    tempo: 76,
    measures: [
      {
        notes: [
          ss('R'), ss('R'), ss('L'), ss('L'), { pitch: 'snare', duration: '8', sticking: 'R', accent: true },
          ss('L'), ss('L'), ss('R'), ss('R'), { pitch: 'snare', duration: '8', sticking: 'L', accent: true },
          ss('R'), ss('R'), ss('L'), ss('L'), { pitch: 'snare', duration: '8', sticking: 'R', accent: true },
        ],
      },
      {
        notes: [
          ss('L'), ss('L'), ss('R'), ss('R'), { pitch: 'snare', duration: '8', sticking: 'L', accent: true },
          ss('R'), ss('R'), ss('L'), ss('L'), { pitch: 'snare', duration: '8', sticking: 'R', accent: true },
          ss('L'), ss('L'), ss('R'), ss('R'), { pitch: 'snare', duration: '8', sticking: 'L', accent: true },
        ],
      },
    ],
  },

  // 8. Single Drag Tap — ll R  L  (two grace + primary + tap)
  {
    id: 'notation-single-drag-tap',
    lessonId: 'single-drag-tap',
    title: 'Single Drag Tap',
    timeSignature: { beats: 4, value: 4 },
    tempo: 72,
    measures: [
      {
        notes: [
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L' },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R' },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L' },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R' },
        ],
      },
      {
        notes: [
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L' },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R' },
          { pitch: 'snare', duration: '8', sticking: 'R', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'L' },
          { pitch: 'snare', duration: '8', sticking: 'L', drag: true },
          { pitch: 'snare', duration: '8', sticking: 'R' },
        ],
      },
    ],
  },
]

export function getNotationForRudiment(rudimentId: string): NotationData | undefined {
  return RUDIMENT_NOTATION.find(n => n.lessonId === rudimentId)
}

export function parseStickingText(text: string, tempo = 80): NotationData {
  const tokens = text.trim().toUpperCase().split(/\s+/)
  const notes = tokens.map(token => {
    const isRest = token === '_' || token === '-'
    const isAccent = token.endsWith('>')
    const sticking = token.replace('>', '') as 'R' | 'L'
    return {
      pitch: 'snare' as const,
      duration: '16' as const,
      sticking: isRest ? undefined : sticking,
      accent: isAccent,
      rest: isRest,
    }
  })

  // Split into 4/4 measures (16 sixteenth notes each)
  const measures = []
  for (let i = 0; i < notes.length; i += 16) {
    const slice = notes.slice(i, i + 16)
    // Pad to 16 if short
    while (slice.length < 16) slice.push({ pitch: 'snare' as const, duration: '16' as const, sticking: undefined, accent: false, rest: true })
    measures.push({ notes: slice })
  }

  return {
    id: `parsed-${Date.now()}`,
    lessonId: '',
    title: 'Custom Pattern',
    timeSignature: { beats: 4, value: 4 },
    tempo,
    measures: measures.length > 0 ? measures : [{ notes: Array(16).fill({ pitch: 'snare', duration: '16', rest: true }) }],
  }
}
