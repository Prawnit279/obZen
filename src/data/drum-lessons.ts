export type FocusArea =
  | 'rudiments'
  | 'grooves'
  | 'fills'
  | 'independence'
  | 'dynamics'
  | 'bass-drum'
  | 'linear'
  | 'phrasing'
  | 'stickings'
  | 'reading'
  | 'coordination'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface DrumLesson {
  id: string
  book: string
  author: string
  concept: string
  exerciseRef: string
  focusArea: FocusArea
  difficulty: Difficulty
  practiceGoal: string
  bpmTarget?: number
}

export interface DrumBook {
  id: string
  title: string
  author: string
  focus: string
  description: string
  lessons: DrumLesson[]
}

export const DRUM_BOOKS: DrumBook[] = [
  {
    id: 'stick-control',
    title: 'Stick Control',
    author: 'George Lawrence Stone',
    focus: 'Precise stick control, accent/tap relationships, endurance',
    description: 'The foundational text for single and alternating sticking combinations, accent studies, and roll development.',
    lessons: [
      {
        id: 'sc-01', book: 'Stick Control', author: 'George Lawrence Stone',
        concept: 'Single Beat Combinations — alternating stickings pp.5-10',
        exerciseRef: 'pp.5-10, exercises 1-72',
        focusArea: 'rudiments', difficulty: 'beginner',
        practiceGoal: 'Play all combinations evenly at 60bpm. Then increase to 80bpm.',
        bpmTarget: 80,
      },
      {
        id: 'sc-02', book: 'Stick Control', author: 'George Lawrence Stone',
        concept: 'Accent Studies — accent/tap dynamics within stickings',
        exerciseRef: 'pp.11-20',
        focusArea: 'dynamics', difficulty: 'intermediate',
        practiceGoal: 'Accented notes must be at least 3 dynamic levels above taps.',
        bpmTarget: 70,
      },
      {
        id: 'sc-03', book: 'Stick Control', author: 'George Lawrence Stone',
        concept: 'Flam Exercises — flam development within sticking sequences',
        exerciseRef: 'pp.21-30',
        focusArea: 'rudiments', difficulty: 'intermediate',
        practiceGoal: 'Even flams on both hands before increasing tempo.',
        bpmTarget: 65,
      },
      {
        id: 'sc-04', book: 'Stick Control', author: 'George Lawrence Stone',
        concept: 'Roll Exercises — building roll control through sticking combos',
        exerciseRef: 'pp.31-40',
        focusArea: 'rudiments', difficulty: 'intermediate',
        practiceGoal: 'Smooth transitions between roll types at 70bpm.',
        bpmTarget: 70,
      },
      {
        id: 'sc-05', book: 'Stick Control', author: 'George Lawrence Stone',
        concept: 'Mixed Stickings — advanced sticking combination studies',
        exerciseRef: 'pp.41-128',
        focusArea: 'stickings', difficulty: 'advanced',
        practiceGoal: 'Master each pattern before moving forward.',
        bpmTarget: 90,
      },
    ],
  },
  {
    id: 'syncopation',
    title: 'Progressive Steps to Syncopation',
    author: 'Ted Reed',
    focus: 'Reading, independence, applying written line to full kit',
    description: 'The definitive reading and independence text. The written line is applied to different limbs for creative independence development.',
    lessons: [
      {
        id: 'syn-01', book: 'Syncopation', author: 'Ted Reed',
        concept: 'Reading Exercises — single-line rhythmic reading',
        exerciseRef: 'pp.4-32',
        focusArea: 'reading', difficulty: 'beginner',
        practiceGoal: 'Read each exercise cleanly on snare with metronome.',
        bpmTarget: 70,
      },
      {
        id: 'syn-02', book: 'Syncopation', author: 'Ted Reed',
        concept: 'Syncopation Applied to Drumset — ride+bass+snare from written line',
        exerciseRef: 'pp.33-72',
        focusArea: 'independence', difficulty: 'intermediate',
        practiceGoal: 'Play written line on ride, snare on beats 2&4, bass drum on written rests.',
        bpmTarget: 75,
      },
      {
        id: 'syn-03', book: 'Syncopation', author: 'Ted Reed',
        concept: 'Triplet Application — reading syncopation as triplets',
        exerciseRef: 'pp.33-72 (triplet reading)',
        focusArea: 'reading', difficulty: 'advanced',
        practiceGoal: 'Apply any exercise as triplets over a swing pattern.',
        bpmTarget: 60,
      },
    ],
  },
  {
    id: 'chapin',
    title: 'Advanced Techniques for the Modern Drummer',
    author: 'Jim Chapin',
    focus: 'Four-way independence, jazz coordination',
    description: 'The jazz independence bible. Develops the ability to play four independent voices simultaneously.',
    lessons: [
      {
        id: 'chap-01', book: 'Advanced Techniques', author: 'Jim Chapin',
        concept: 'Coordination Studies Vol.1 — left hand independence against jazz ride',
        exerciseRef: 'Vol.1, exercises 1-20',
        focusArea: 'independence', difficulty: 'intermediate',
        practiceGoal: 'Hold steady jazz ride pattern while left hand plays written variations.',
        bpmTarget: 65,
      },
      {
        id: 'chap-02', book: 'Advanced Techniques', author: 'Jim Chapin',
        concept: 'Jazz Independence — ride cymbal voicings with left hand/foot independence',
        exerciseRef: 'Vol.1, pp.10-40',
        focusArea: 'coordination', difficulty: 'advanced',
        practiceGoal: 'All four limbs independent: ride, HH foot, snare, bass drum.',
        bpmTarget: 60,
      },
    ],
  },
  {
    id: 'new-breed',
    title: 'The New Breed',
    author: 'Gary Chester',
    focus: 'Multi-layered independence, session drummer coordination',
    description: 'Session player independence bible. The guide track concept is foundational to studio drumming.',
    lessons: [
      {
        id: 'nb-01', book: 'The New Breed', author: 'Gary Chester',
        concept: 'System 1 — 16th note groove independence',
        exerciseRef: 'System 1, exercises 1-40',
        focusArea: 'independence', difficulty: 'intermediate',
        practiceGoal: 'Play continuous 16th note guide track while hands/feet play written figures.',
        bpmTarget: 70,
      },
      {
        id: 'nb-02', book: 'The New Breed', author: 'Gary Chester',
        concept: 'System 2 — 8th note triplet independence',
        exerciseRef: 'System 2, exercises 1-40',
        focusArea: 'independence', difficulty: 'advanced',
        practiceGoal: 'Maintain triplet guide track through all written variations.',
        bpmTarget: 60,
      },
      {
        id: 'nb-03', book: 'The New Breed', author: 'Gary Chester',
        concept: 'Continuous Motion Studies — never stopping between exercises',
        exerciseRef: 'Continuous motion pages',
        focusArea: 'grooves', difficulty: 'advanced',
        practiceGoal: 'Seamless transitions between all exercises with no interruption.',
        bpmTarget: 75,
      },
    ],
  },
  {
    id: 'master-studies',
    title: 'Master Studies',
    author: 'Joe Morello',
    focus: 'Control, dynamics, endurance, speed development',
    description: 'Advanced control and dynamic studies from the legendary Dave Brubeck drummer.',
    lessons: [
      {
        id: 'ms-01', book: 'Master Studies', author: 'Joe Morello',
        concept: 'Accent Patterns — developing dynamic accent control',
        exerciseRef: 'pp.1-40',
        focusArea: 'dynamics', difficulty: 'intermediate',
        practiceGoal: 'Clean accent-tap differentiation at slow tempos before adding speed.',
        bpmTarget: 70,
      },
      {
        id: 'ms-02', book: 'Master Studies', author: 'Joe Morello',
        concept: 'Single Stroke Studies — speed and endurance development',
        exerciseRef: 'pp.41-60',
        focusArea: 'rudiments', difficulty: 'intermediate',
        practiceGoal: 'Work singles from 80bpm to 200bpm in 5bpm increments.',
        bpmTarget: 150,
      },
      {
        id: 'ms-03', book: 'Master Studies', author: 'Joe Morello',
        concept: 'Double Stroke Studies — double stroke open roll development',
        exerciseRef: 'pp.61-80',
        focusArea: 'rudiments', difficulty: 'advanced',
        practiceGoal: 'Even doubles at 100bpm. Both strokes identical in volume.',
        bpmTarget: 100,
      },
      {
        id: 'ms-04', book: 'Master Studies', author: 'Joe Morello',
        concept: 'Combination Studies — mixing single and double strokes',
        exerciseRef: 'pp.81-128',
        focusArea: 'stickings', difficulty: 'advanced',
        practiceGoal: 'Seamless transition between single and double stroke passages.',
        bpmTarget: 90,
      },
    ],
  },
  {
    id: 'bass-drum-control',
    title: 'Bass Drum Control',
    author: 'Colin Bailey',
    focus: 'Bass drum technique, independence with hands',
    description: 'Dedicated bass drum development. Essential for building power and precision in the kick.',
    lessons: [
      {
        id: 'bdc-01', book: 'Bass Drum Control', author: 'Colin Bailey',
        concept: 'Single Pedal Exercises — foundational bass drum patterns',
        exerciseRef: 'pp.1-30',
        focusArea: 'bass-drum', difficulty: 'beginner',
        practiceGoal: 'Even bass drum strokes matching hand patterns at 70bpm.',
        bpmTarget: 70,
      },
      {
        id: 'bdc-02', book: 'Bass Drum Control', author: 'Colin Bailey',
        concept: 'Bass Drum with Hands — coordination between kick and hands',
        exerciseRef: 'pp.31-60',
        focusArea: 'independence', difficulty: 'intermediate',
        practiceGoal: 'No rushing or dragging bass drum against hand patterns.',
        bpmTarget: 80,
      },
      {
        id: 'bdc-03', book: 'Bass Drum Control', author: 'Colin Bailey',
        concept: 'Speed and Endurance Studies — building kick speed',
        exerciseRef: 'pp.61-90',
        focusArea: 'bass-drum', difficulty: 'advanced',
        practiceGoal: 'Consistent bass drum at 120bpm 16th notes for 2 minutes.',
        bpmTarget: 120,
      },
    ],
  },
  {
    id: 'realistic-rock',
    title: 'Realistic Rock',
    author: 'Carmine Appice',
    focus: 'Rock drumming, fills, double bass introduction',
    description: 'The rock drumming foundation. Practical grooves, fills, and double bass patterns from a rock legend.',
    lessons: [
      {
        id: 'rr-01', book: 'Realistic Rock', author: 'Carmine Appice',
        concept: 'Basic Rock Beats — core rock groove vocabulary',
        exerciseRef: 'Basic beats section',
        focusArea: 'grooves', difficulty: 'beginner',
        practiceGoal: 'Solid rock groove at 90bpm. No flamming.',
        bpmTarget: 90,
      },
      {
        id: 'rr-02', book: 'Realistic Rock', author: 'Carmine Appice',
        concept: 'Fills and Variations — rock fill vocabulary',
        exerciseRef: 'Fills section',
        focusArea: 'fills', difficulty: 'intermediate',
        practiceGoal: 'Fill every 4 bars cleanly — in and out of groove without hesitation.',
        bpmTarget: 85,
      },
      {
        id: 'rr-03', book: 'Realistic Rock', author: 'Carmine Appice',
        concept: 'Linear Patterns — grooves where no two voices play simultaneously',
        exerciseRef: 'Linear section',
        focusArea: 'linear', difficulty: 'intermediate',
        practiceGoal: 'Clean linear groove at 80bpm. Each note articulated separately.',
        bpmTarget: 80,
      },
    ],
  },
  {
    id: 'drummers-bible',
    title: "The Drummer's Bible",
    author: 'Mick Berry & Jason Gianni',
    focus: 'Versatility, style application, genre literacy',
    description: 'Over 200 styles and beats covering every major genre. Essential for versatility and session work.',
    lessons: [
      {
        id: 'db-01', book: "The Drummer's Bible", author: 'Mick Berry & Jason Gianni',
        concept: 'Genre Studies — rock, jazz, latin, funk, world styles',
        exerciseRef: 'Style sections by genre',
        focusArea: 'grooves', difficulty: 'intermediate',
        practiceGoal: 'Play through 5 different genre grooves in one session.',
        bpmTarget: 80,
      },
      {
        id: 'db-02', book: "The Drummer's Bible", author: 'Mick Berry & Jason Gianni',
        concept: 'Style-Specific Fills — fills native to each genre',
        exerciseRef: 'Fill sections per style chapter',
        focusArea: 'fills', difficulty: 'intermediate',
        practiceGoal: 'Pair each groove with its native fill style.',
        bpmTarget: 75,
      },
    ],
  },
  {
    id: 'groove-essentials',
    title: 'Groove Essentials',
    author: 'Tommy Igoe',
    focus: 'Groove mastery, dynamic control, feel',
    description: '47 essential grooves mapped across styles. The groove map system develops systematic control over feel.',
    lessons: [
      {
        id: 'ge-01', book: 'Groove Essentials', author: 'Tommy Igoe',
        concept: '47 Grooves — systematic groove vocabulary across styles',
        exerciseRef: 'Full groove map',
        focusArea: 'grooves', difficulty: 'intermediate',
        practiceGoal: 'Play each groove for 4 minutes without losing the feel.',
        bpmTarget: 80,
      },
      {
        id: 'ge-02', book: 'Groove Essentials', author: 'Tommy Igoe',
        concept: 'Dynamics within Grooves — soft to loud within the same pattern',
        exerciseRef: 'Dynamic variation sections',
        focusArea: 'dynamics', difficulty: 'intermediate',
        practiceGoal: 'Four dynamic levels within one groove. Each clearly distinct.',
        bpmTarget: 75,
      },
      {
        id: 'ge-03', book: 'Groove Essentials', author: 'Tommy Igoe',
        concept: 'Orchestration Variations — moving groove elements around the kit',
        exerciseRef: 'Orchestration sections',
        focusArea: 'grooves', difficulty: 'advanced',
        practiceGoal: 'Same groove concept played on 3 different kit orchestrations.',
        bpmTarget: 80,
      },
    ],
  },
  {
    id: 'language-of-drumming',
    title: 'The Language of Drumming',
    author: 'Benny Greb',
    focus: 'Creative vocabulary building, modular thinking, musical expression',
    description: 'A landmark method for thinking about drumming as a language. Individual sound units are combined into musical phrases.',
    lessons: [
      {
        id: 'lod-01', book: 'The Language of Drumming', author: 'Benny Greb',
        concept: 'The Greb Alphabet — individual sound units as vocabulary',
        exerciseRef: 'Alphabet chapter, units A-Z',
        focusArea: 'phrasing', difficulty: 'intermediate',
        practiceGoal: 'Define and isolate 10 personal sound units from your playing.',
        bpmTarget: 70,
      },
      {
        id: 'lod-02', book: 'The Language of Drumming', author: 'Benny Greb',
        concept: 'Modular Phrasing — combining vocabulary units into phrases',
        exerciseRef: 'Phrase construction chapter',
        focusArea: 'phrasing', difficulty: 'intermediate',
        practiceGoal: 'Construct a 4-bar phrase from 4 different vocabulary units.',
        bpmTarget: 75,
      },
      {
        id: 'lod-03', book: 'The Language of Drumming', author: 'Benny Greb',
        concept: 'Dynamic Language — soft/loud as musical vocabulary',
        exerciseRef: 'Dynamics chapter',
        focusArea: 'dynamics', difficulty: 'advanced',
        practiceGoal: 'Same phrase at 4 dynamic levels: pp, mp, mf, ff.',
        bpmTarget: 80,
      },
      {
        id: 'lod-04', book: 'The Language of Drumming', author: 'Benny Greb',
        concept: 'Creative Application — composing original grooves from building blocks',
        exerciseRef: 'Application chapter',
        focusArea: 'phrasing', difficulty: 'advanced',
        practiceGoal: 'Compose and memorize one original 4-bar musical phrase.',
        bpmTarget: 80,
      },
    ],
  },
  {
    id: 'sticking-patterns',
    title: 'Sticking Patterns',
    author: 'Gary Chaffee',
    focus: 'Linear drumming, sticking vocabulary, pattern application',
    description: 'Linear pattern development organized by family. No two voices play simultaneously in linear drumming.',
    lessons: [
      {
        id: 'sp-01', book: 'Sticking Patterns', author: 'Gary Chaffee',
        concept: 'Linear Pattern Families — single alternating, double alternating, combination',
        exerciseRef: 'Pattern families chapters',
        focusArea: 'linear', difficulty: 'intermediate',
        practiceGoal: 'Play each pattern family cleanly at 70bpm.',
        bpmTarget: 70,
      },
      {
        id: 'sp-02', book: 'Sticking Patterns', author: 'Gary Chaffee',
        concept: '16th-Note Linear Patterns — no two voices simultaneously',
        exerciseRef: '16th note chapter',
        focusArea: 'linear', difficulty: 'advanced',
        practiceGoal: 'Linear groove at 90bpm. Zero voice overlaps.',
        bpmTarget: 90,
      },
      {
        id: 'sp-03', book: 'Sticking Patterns', author: 'Gary Chaffee',
        concept: 'Sticking Groupings — 3s, 4s, 5s, 6s, 7s patterns',
        exerciseRef: 'Groupings chapter',
        focusArea: 'stickings', difficulty: 'advanced',
        practiceGoal: 'One pattern from each grouping (3,4,5,6,7) in one session.',
        bpmTarget: 75,
      },
      {
        id: 'sp-04', book: 'Sticking Patterns', author: 'Gary Chaffee',
        concept: 'Pattern Orchestration — applying stickings around the kit',
        exerciseRef: 'Orchestration chapter',
        focusArea: 'fills', difficulty: 'advanced',
        practiceGoal: 'One pattern orchestrated across 5 different kit configurations.',
        bpmTarget: 80,
      },
    ],
  },
  {
    id: 'syncopation-expanded',
    title: 'Progressive Steps to Syncopation (Expanded Applications)',
    author: 'Ted Reed',
    focus: 'Applying syncopation as a full kit voice — bass drum, snare, and ride independence',
    description: 'Expanded application index for the Reed text. Uses the written line as a "melody" played on different limbs simultaneously.',
    lessons: [
      {
        id: 'se-01', book: 'Syncopation (Expanded)', author: 'Ted Reed',
        concept: 'Written Line on Bass Drum — hands comp over written bass drum melody',
        exerciseRef: 'Any exercise page applied to bass drum',
        focusArea: 'bass-drum', difficulty: 'advanced',
        practiceGoal: 'Play written line on bass drum while ride and snare maintain swing comp.',
        bpmTarget: 65,
      },
      {
        id: 'se-02', book: 'Syncopation (Expanded)', author: 'Ted Reed',
        concept: 'Two-Voice Reading — left hand and bass drum play written line simultaneously',
        exerciseRef: 'Applied two-voice section',
        focusArea: 'independence', difficulty: 'advanced',
        practiceGoal: 'Both bass drum and left hand play written line. Ride maintains quarter notes.',
        bpmTarget: 60,
      },
    ],
  },
  {
    id: 'syncopation-advanced',
    title: 'Progressive Steps to Syncopation (Advanced)',
    author: 'Ted Reed',
    focus: 'Advanced independence, melody as drum voice, four-bar construction',
    description: 'Advanced applications of the Reed syncopation text — treating the written line as a melody applied to specific limbs.',
    lessons: [
      {
        id: 'sa-01', book: 'Syncopation (Advanced)', author: 'Ted Reed',
        concept: 'Melody as Drum Voice — written line on bass drum while hands comp',
        exerciseRef: 'Applied independence section',
        focusArea: 'independence', difficulty: 'advanced',
        practiceGoal: 'Written line on bass drum. Ride and snare comp pattern over it.',
        bpmTarget: 65,
      },
      {
        id: 'sa-02', book: 'Syncopation (Advanced)', author: 'Ted Reed',
        concept: 'Four-Bar Phrase Construction — building complete phrases from exercises',
        exerciseRef: 'Phrase construction section',
        focusArea: 'phrasing', difficulty: 'advanced',
        practiceGoal: 'Combine 4 exercises into one 4-bar musical statement.',
        bpmTarget: 70,
      },
    ],
  },
]

export const ALL_LESSONS: DrumLesson[] = DRUM_BOOKS.flatMap(b => b.lessons)

export function getLessonsByFocus(focus: FocusArea): DrumLesson[] {
  return ALL_LESSONS.filter(l => l.focusArea === focus)
}

export function getLessonsByDifficulty(difficulty: Difficulty): DrumLesson[] {
  return ALL_LESSONS.filter(l => l.difficulty === difficulty)
}
