import type { Pose, ExerciseMotion } from './exercise-motions'

const STAND: Pose = {
  head: [100, 38], neck: [100, 50], hip: [100, 86],
  knee: [100, 112], ankle: [100, 138], elbow: [100, 68], hand: [100, 86],
}

const pose = (over: Partial<Pose>): Pose => ({ ...STAND, ...over })

export const EXERCISE_MOTIONS: Record<string, ExerciseMotion> = {
  // ── Squat pattern ──────────────────────────────────────────────────────────
  'barbell-squat': {
    equipment: 'bar', durationSec: 4, caption: 'Sit between the hips, drive up',
    poses: [
      pose({ hand: [96, 46], elbow: [88, 54] }),
      pose({ head: [97, 48], neck: [98, 60], hip: [101, 94], knee: [94, 114], hand: [93, 56], elbow: [85, 64] }),
      pose({ head: [94, 60], neck: [95, 72], hip: [102, 104], knee: [88, 116], hand: [91, 68], elbow: [83, 76] }),
      pose({ head: [93, 68], neck: [94, 80], hip: [103, 111], knee: [85, 118], hand: [90, 76], elbow: [82, 84] }),
      pose({ head: [92, 74], neck: [93, 86], hip: [103, 116], knee: [82, 120], hand: [89, 82], elbow: [81, 90] }),
    ],
  },
  'barbell-back-squat': {
    equipment: 'bar', durationSec: 3.2, caption: 'Sit between the hips, drive up',
    poses: [
      pose({ hand: [96, 46], elbow: [88, 54] }),
      pose({ head: [94, 60], neck: [95, 72], hip: [102, 104], knee: [88, 116], hand: [91, 68], elbow: [83, 76] }),
      pose({ head: [92, 74], neck: [93, 86], hip: [103, 116], knee: [82, 120], hand: [89, 82], elbow: [81, 90] }),
    ],
  },
  'zercher-squat': {
    equipment: 'bar', durationSec: 3.2, caption: 'Bar in the elbows, squat upright',
    poses: [
      pose({ hand: [114, 62], elbow: [108, 66] }),
      pose({ head: [97, 58], neck: [98, 70], hip: [101, 102], knee: [90, 116], hand: [112, 80], elbow: [106, 84] }),
      pose({ head: [96, 72], neck: [97, 84], hip: [102, 114], knee: [84, 120], hand: [110, 94], elbow: [104, 98] }),
    ],
  },
  'goblet-squat': {
    equipment: 'dumbbell', durationSec: 3, caption: 'Weight at the chest, sit down tall',
    poses: [
      pose({ hand: [110, 60], elbow: [106, 64] }),
      pose({ head: [97, 60], neck: [98, 72], hip: [101, 104], knee: [89, 116], hand: [109, 78], elbow: [105, 82] }),
      pose({ head: [96, 74], neck: [97, 86], hip: [102, 116], knee: [83, 120], hand: [108, 92], elbow: [104, 96] }),
    ],
  },
  'hack-squat': {
    equipment: 'none', durationSec: 3, caption: 'Back supported, knees track the toes',
    poses: [
      pose({ hand: [112, 82], elbow: [108, 72] }),
      pose({ head: [92, 52], neck: [93, 64], hip: [96, 98], knee: [86, 114], hand: [108, 94] }),
      pose({ head: [88, 64], neck: [89, 76], hip: [94, 110], knee: [80, 120], hand: [106, 106] }),
    ],
  },
  'leg-press': {
    equipment: 'none', durationSec: 3.6, ground: false, bench: { x: 40, y: 108, width: 70 },
    caption: 'Feet high and wide, never lock out',
    poses: [
      { head: [50, 96], neck: [64, 100], hip: [96, 104], knee: [130, 96], ankle: [160, 88], elbow: [66, 112], hand: [80, 116] },
      { head: [50, 96], neck: [64, 100], hip: [96, 104], knee: [126, 90], ankle: [151, 91], elbow: [66, 112], hand: [80, 116] },
      { head: [50, 96], neck: [64, 100], hip: [96, 104], knee: [120, 82], ankle: [140, 96], elbow: [66, 112], hand: [80, 116] },
      { head: [50, 96], neck: [64, 100], hip: [96, 104], knee: [113, 77], ankle: [129, 99], elbow: [66, 112], hand: [80, 116] },
      { head: [50, 96], neck: [64, 100], hip: [96, 104], knee: [108, 74], ankle: [120, 100], elbow: [66, 112], hand: [80, 116] },
    ],
  },
  'leg-extension': {
    equipment: 'none', durationSec: 2.6, ground: false, bench: { x: 70, y: 96, width: 60 },
    caption: 'Straighten the knee, squeeze the quad',
    poses: [
      { head: [86, 56], neck: [88, 68], hip: [92, 94], knee: [118, 96], ankle: [120, 124], elbow: [82, 84], hand: [78, 96] },
      { head: [86, 56], neck: [88, 68], hip: [92, 94], knee: [118, 96], ankle: [140, 110], elbow: [82, 84], hand: [78, 96] },
      { head: [86, 56], neck: [88, 68], hip: [92, 94], knee: [118, 96], ankle: [150, 94], elbow: [82, 84], hand: [78, 96] },
    ],
  },
  'smith-machine-squat': {
    equipment: 'bar', durationSec: 3, caption: 'Fixed path, sit straight down',
    poses: [
      pose({ hand: [96, 46], elbow: [88, 54] }),
      pose({ head: [98, 62], neck: [99, 74], hip: [100, 106], knee: [88, 118], hand: [95, 70], elbow: [87, 78] }),
      pose({ head: [97, 74], neck: [98, 86], hip: [100, 116], knee: [83, 121], hand: [94, 82], elbow: [86, 90] }),
    ],
  },
  'front-foot-elevated-split-squat': {
    equipment: 'dumbbell', durationSec: 3, bench: { x: 118, y: 122, width: 34 },
    caption: 'Front foot raised, drop the back knee',
    poses: [
      pose({ hip: [98, 88], knee: [120, 108], ankle: [128, 120], hand: [92, 96], elbow: [94, 76] }),
      pose({ head: [98, 48], neck: [98, 60], hip: [96, 100], knee: [122, 112], ankle: [128, 120], hand: [90, 108] }),
      pose({ head: [98, 58], neck: [98, 70], hip: [95, 110], knee: [124, 116], ankle: [128, 120], hand: [89, 118] }),
    ],
  },

  // ── Lunge / split pattern ──────────────────────────────────────────────────
  'bulgarian-split-squat': {
    equipment: 'dumbbell', durationSec: 3.2, bench: { x: 130, y: 112, width: 40 },
    caption: 'Rear foot up, torso leans slightly forward',
    poses: [
      pose({ hip: [96, 86], knee: [92, 112], ankle: [86, 138], hand: [88, 96], elbow: [92, 74] }),
      pose({ head: [92, 48], neck: [94, 60], hip: [96, 100], knee: [88, 120], ankle: [86, 138], hand: [86, 110] }),
      pose({ head: [88, 58], neck: [91, 70], hip: [96, 112], knee: [84, 128], ankle: [86, 138], hand: [84, 122] }),
    ],
  },
  'walking-lunge': {
    equipment: 'dumbbell', durationSec: 3.2, caption: 'Long stride, drive through the front heel',
    poses: [
      pose({ hand: [92, 96], elbow: [94, 74] }),
      pose({ head: [98, 46], neck: [98, 58], hip: [96, 96], knee: [120, 112], ankle: [128, 138], hand: [90, 106] }),
      pose({ head: [98, 56], neck: [98, 68], hip: [95, 108], knee: [124, 120], ankle: [130, 138], hand: [89, 118] }),
    ],
  },
  'reverse-lunge': {
    equipment: 'dumbbell', durationSec: 3.2, caption: 'Step back, knee toward the floor',
    poses: [
      pose({ hand: [92, 96], elbow: [94, 74] }),
      pose({ head: [100, 46], neck: [100, 58], hip: [100, 96], knee: [78, 114], ankle: [70, 138], hand: [94, 106] }),
      pose({ head: [100, 56], neck: [100, 68], hip: [100, 108], knee: [74, 124], ankle: [66, 138], hand: [93, 118] }),
    ],
  },
  'curtsy-lunge': {
    equipment: 'dumbbell', durationSec: 3.2, caption: 'Step behind and across, hips square',
    poses: [
      pose({ hand: [92, 96], elbow: [94, 74] }),
      pose({ head: [100, 48], neck: [100, 60], hip: [100, 98], knee: [84, 116], ankle: [76, 136], hand: [94, 108] }),
      pose({ head: [100, 58], neck: [100, 70], hip: [100, 110], knee: [80, 126], ankle: [72, 138], hand: [93, 120] }),
    ],
  },
  'step-up': {
    equipment: 'dumbbell', durationSec: 3, bench: { x: 124, y: 116, width: 40 },
    caption: 'Drive through the top foot, stand tall',
    poses: [
      pose({ hip: [96, 96], knee: [116, 110], ankle: [128, 116], hand: [90, 106], elbow: [92, 84] }),
      pose({ head: [104, 44], neck: [104, 56], hip: [106, 88], knee: [122, 102], ankle: [128, 116], hand: [100, 98] }),
      pose({ head: [110, 30], neck: [110, 42], hip: [112, 76], knee: [126, 96], ankle: [128, 116], hand: [106, 86] }),
    ],
  },

  // ── Hinge pattern ──────────────────────────────────────────────────────────
  'deadlift': {
    equipment: 'bar', view: 'side', durationSec: 4, caption: 'Bar against the shins, push the floor away',
    poses: [
      pose({ head: [92, 66], neck: [94, 78], hip: [104, 104], knee: [96, 118], hand: [102, 128], elbow: [98, 104] }),
      pose({ head: [93, 62], neck: [95, 74], hip: [104, 100], knee: [97, 118], hand: [102, 122], elbow: [98, 99] }),
      pose({ head: [96, 54], neck: [97, 66], hip: [103, 95], knee: [99, 117], hand: [102, 112], elbow: [99, 90] }),
      pose({ head: [98, 46], neck: [99, 58], hip: [101, 90], knee: [100, 115], hand: [101, 100], elbow: [100, 79] }),
      pose({ hand: [100, 90], elbow: [100, 70] }),
    ],
  },
  'romanian-deadlift': {
    equipment: 'bar', view: 'side', durationSec: 3.8, caption: 'Push the hips back, stop at the stretch',
    poses: [
      pose({ hand: [100, 90], elbow: [100, 70] }),
      pose({ head: [95, 44], neck: [96, 56], hip: [104, 87], knee: [102, 114], hand: [99, 96], elbow: [98, 76] }),
      pose({ head: [90, 52], neck: [92, 62], hip: [108, 88], knee: [104, 114], hand: [98, 104], elbow: [96, 84] }),
      pose({ head: [86, 62], neck: [89, 71], hip: [110, 89], knee: [105, 114], hand: [97, 111], elbow: [94, 91] }),
      pose({ head: [82, 70], neck: [86, 78], hip: [112, 90], knee: [106, 114], hand: [96, 118], elbow: [92, 98] }),
    ],
  },
  'dumbbell-rdl': {
    equipment: 'dumbbell', view: 'side', durationSec: 3.2, caption: 'Hips back, dumbbells close to the legs',
    poses: [
      pose({ hand: [102, 90], elbow: [101, 70] }),
      pose({ head: [90, 52], neck: [92, 62], hip: [108, 88], knee: [104, 114], hand: [100, 104] }),
      pose({ head: [82, 70], neck: [86, 78], hip: [112, 90], knee: [106, 114], hand: [98, 118] }),
    ],
  },
  'single-leg-rdl': {
    equipment: 'dumbbell', view: 'side', durationSec: 3.2, caption: 'One leg back, hips level',
    poses: [
      pose({ hand: [102, 90], elbow: [101, 70] }),
      pose({ head: [86, 56], neck: [90, 64], hip: [108, 88], knee: [116, 106], ankle: [130, 118], hand: [98, 106] }),
      pose({ head: [76, 72], neck: [82, 78], hip: [112, 88], knee: [126, 96], ankle: [148, 92], hand: [96, 120] }),
    ],
  },
  'good-morning': {
    equipment: 'bar', view: 'side', durationSec: 3.2, caption: 'Bar on the back, hinge at the hips',
    poses: [
      pose({ hand: [96, 46], elbow: [88, 54] }),
      pose({ head: [88, 54], neck: [91, 62], hip: [108, 88], knee: [104, 114], hand: [88, 58], elbow: [82, 66] }),
      pose({ head: [78, 70], neck: [84, 76], hip: [112, 90], knee: [106, 114], hand: [82, 72], elbow: [78, 80] }),
    ],
  },
  'trap-bar-deadlift': {
    equipment: 'bar', view: 'side', durationSec: 3.4, caption: 'Handles at your sides, stand up tall',
    poses: [
      pose({ head: [94, 64], neck: [96, 76], hip: [104, 102], knee: [98, 118], hand: [104, 126], elbow: [100, 102] }),
      pose({ head: [97, 52], neck: [98, 64], hip: [102, 94], knee: [99, 116], hand: [103, 108] }),
      pose({ hand: [102, 90], elbow: [101, 70] }),
    ],
  },
  'sumo-deadlift': {
    equipment: 'bar', view: 'side', durationSec: 3.4, caption: 'Wide stance, hips close to the bar',
    poses: [
      pose({ head: [96, 62], neck: [97, 74], hip: [102, 100], knee: [86, 118], hand: [100, 126], elbow: [99, 100] }),
      pose({ head: [98, 52], neck: [99, 64], hip: [101, 94], knee: [90, 118], hand: [100, 110] }),
      pose({ hand: [100, 90], elbow: [100, 70] }),
    ],
  },
  'rack-pull': {
    equipment: 'bar', durationSec: 2.8, caption: 'Shortened range from the pins',
    poses: [
      pose({ head: [94, 58], neck: [96, 70], hip: [104, 96], knee: [100, 118], hand: [102, 112], elbow: [100, 92] }),
      pose({ head: [98, 48], neck: [99, 60], hip: [102, 90], knee: [100, 116], hand: [101, 100] }),
      pose({ hand: [100, 90], elbow: [100, 70] }),
    ],
  },
  'kettlebell-deadlift': {
    equipment: 'dumbbell', view: 'side', durationSec: 3, caption: 'Bell between the feet, hinge and stand',
    poses: [
      pose({ head: [94, 64], neck: [96, 76], hip: [104, 102], knee: [98, 118], hand: [100, 124], elbow: [99, 102] }),
      pose({ head: [97, 52], neck: [98, 64], hip: [102, 94], knee: [99, 116], hand: [100, 108] }),
      pose({ hand: [100, 90], elbow: [100, 70] }),
    ],
  },
  'seated-leg-curl': {
    equipment: 'none', durationSec: 2.6, ground: false, bench: { x: 64, y: 96, width: 64 },
    caption: 'Curl the heels under, slow on the way back',
    poses: [
      { head: [80, 56], neck: [82, 68], hip: [88, 94], knee: [124, 94], ankle: [152, 92], elbow: [78, 84], hand: [74, 96] },
      { head: [80, 56], neck: [82, 68], hip: [88, 94], knee: [124, 94], ankle: [144, 110], elbow: [78, 84], hand: [74, 96] },
      { head: [80, 56], neck: [82, 68], hip: [88, 94], knee: [124, 94], ankle: [130, 120], elbow: [78, 84], hand: [74, 96] },
    ],
  },
  'lying-leg-curl': {
    equipment: 'none', durationSec: 2.6, ground: false, bench: { x: 56, y: 104, width: 76 },
    caption: 'Face down, curl the heels to the glutes',
    poses: [
      { head: [50, 100], neck: [64, 102], hip: [104, 102], knee: [134, 102], ankle: [162, 102], elbow: [64, 112], hand: [76, 114] },
      { head: [50, 100], neck: [64, 102], hip: [104, 102], knee: [134, 102], ankle: [156, 84], elbow: [64, 112], hand: [76, 114] },
      { head: [50, 100], neck: [64, 102], hip: [104, 102], knee: [134, 102], ankle: [138, 74], elbow: [64, 112], hand: [76, 114] },
    ],
  },

  // ── Hip thrust / glute ─────────────────────────────────────────────────────
  'hip-thrust-machine': {
    equipment: 'none', durationSec: 3.6, bench: { x: 56, y: 96, width: 34 },
    caption: 'Chin tucked, squeeze at the top',
    poses: [
      { head: [58, 88], neck: [70, 92], hip: [104, 116], knee: [130, 108], ankle: [136, 138], elbow: [72, 104], hand: [84, 108] },
      { head: [58, 87], neck: [70, 91], hip: [105, 110], knee: [131, 105], ankle: [136, 138], elbow: [72, 102], hand: [84, 105] },
      { head: [58, 86], neck: [70, 90], hip: [106, 104], knee: [132, 102], ankle: [136, 138], elbow: [72, 100], hand: [84, 102] },
      { head: [58, 85], neck: [70, 89], hip: [107, 98], knee: [133, 99], ankle: [136, 138], elbow: [72, 98], hand: [84, 99] },
      { head: [58, 84], neck: [70, 88], hip: [108, 92], knee: [134, 96], ankle: [136, 138], elbow: [72, 96], hand: [84, 96] },
    ],
  },
  'barbell-hip-thrust': {
    equipment: 'bar', durationSec: 3, bench: { x: 56, y: 96, width: 34 },
    caption: 'Bar over the hips, drive to level',
    poses: [
      { head: [58, 88], neck: [70, 92], hip: [104, 116], knee: [130, 108], ankle: [136, 138], elbow: [92, 112], hand: [104, 112] },
      { head: [58, 86], neck: [70, 90], hip: [106, 104], knee: [132, 102], ankle: [136, 138], elbow: [94, 100], hand: [106, 100] },
      { head: [58, 84], neck: [70, 88], hip: [108, 92], knee: [134, 96], ankle: [136, 138], elbow: [96, 88], hand: [108, 88] },
    ],
  },
  'single-leg-hip-thrust': {
    equipment: 'none', durationSec: 3, bench: { x: 56, y: 96, width: 34 },
    caption: 'One foot down, hips stay level',
    poses: [
      { head: [58, 88], neck: [70, 92], hip: [104, 116], knee: [130, 104], ankle: [136, 138], elbow: [72, 104], hand: [84, 108] },
      { head: [58, 86], neck: [70, 90], hip: [106, 104], knee: [136, 92], ankle: [150, 108], elbow: [72, 100], hand: [84, 102] },
      { head: [58, 84], neck: [70, 88], hip: [108, 92], knee: [140, 78], ankle: [160, 92], elbow: [72, 96], hand: [84, 96] },
    ],
  },
  'glute-bridge': {
    equipment: 'none', durationSec: 2.8, caption: 'Shoulders on the floor, drive the hips up',
    poses: [
      { head: [56, 136], neck: [70, 136], hip: [106, 136], knee: [130, 118], ankle: [136, 138], elbow: [72, 132], hand: [86, 134] },
      { head: [56, 136], neck: [70, 134], hip: [106, 122], knee: [132, 112], ankle: [136, 138], elbow: [72, 132], hand: [86, 134] },
      { head: [56, 136], neck: [70, 132], hip: [106, 108], knee: [134, 104], ankle: [136, 138], elbow: [72, 132], hand: [86, 134] },
    ],
  },
  'cable-glute-kickback': {
    equipment: 'none', durationSec: 2.6, caption: 'Drive the leg back, no arching',
    poses: [
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [104, 114], ankle: [104, 138], hand: [112, 86], elbow: [106, 70] }),
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [118, 108], ankle: [132, 118], hand: [112, 86], elbow: [106, 70] }),
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [128, 98], ankle: [154, 100], hand: [112, 86], elbow: [106, 70] }),
    ],
  },
  'machine-kickback': {
    equipment: 'none', durationSec: 2.6, caption: 'Machine kickback, squeeze at the end',
    poses: [
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [104, 114], ankle: [104, 138], hand: [112, 86] }),
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [116, 108], ankle: [128, 118], hand: [112, 86] }),
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [126, 100], ankle: [148, 104], hand: [112, 86] }),
    ],
  },
  'banded-kickback': {
    equipment: 'none', durationSec: 2.4, caption: 'Band tension, controlled return',
    poses: [
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [104, 114], ankle: [104, 138], hand: [112, 86] }),
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [116, 106], ankle: [130, 114], hand: [112, 86] }),
      pose({ head: [92, 44], neck: [94, 56], hip: [104, 88], knee: [124, 98], ankle: [146, 98], hand: [112, 86] }),
    ],
  },
  'frog-pump': {
    equipment: 'none', durationSec: 2.4, caption: 'Heels together, knees out, pump the hips',
    poses: [
      { head: [56, 136], neck: [70, 136], hip: [104, 134], knee: [126, 120], ankle: [116, 132], elbow: [72, 132], hand: [86, 134] },
      { head: [56, 136], neck: [70, 134], hip: [104, 124], knee: [128, 114], ankle: [116, 130], elbow: [72, 132], hand: [86, 134] },
      { head: [56, 136], neck: [70, 132], hip: [104, 112], knee: [130, 106], ankle: [116, 128], elbow: [72, 132], hand: [86, 134] },
    ],
  },
  'cable-pull-through': {
    equipment: 'none', view: 'side', durationSec: 3, caption: 'Hinge, then snap the hips through',
    poses: [
      pose({ hand: [96, 92], elbow: [98, 74] }),
      pose({ head: [90, 54], neck: [92, 64], hip: [108, 88], knee: [104, 114], hand: [90, 104], elbow: [92, 88] }),
      pose({ head: [82, 70], neck: [86, 78], hip: [112, 90], knee: [106, 114], hand: [82, 116], elbow: [86, 100] }),
    ],
  },

  // ── Horizontal press ───────────────────────────────────────────────────────
  'bench-press': {
    equipment: 'bar', durationSec: 3.6, ground: false, bench: { x: 56, y: 108, width: 88 },
    caption: 'Shoulder blades set, press over the shoulders',
    poses: [
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [78, 84], hand: [78, 66] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [75, 88], hand: [78, 74] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [70, 92], hand: [78, 84] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [67, 96], hand: [78, 92] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [66, 98], hand: [78, 98] },
    ],
  },
  'dumbbell-bench-press': {
    equipment: 'dumbbell', durationSec: 3, ground: false, bench: { x: 56, y: 108, width: 88 },
    caption: 'Dumbbells over the chest, control the descent',
    poses: [
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [78, 84], hand: [78, 64] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [70, 92], hand: [76, 84] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [64, 98], hand: [74, 100] },
    ],
  },
  'close-grip-bench-press': {
    equipment: 'bar', durationSec: 3, ground: false, bench: { x: 56, y: 108, width: 88 },
    caption: 'Elbows tucked, triceps do the work',
    poses: [
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [80, 86], hand: [80, 66] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [76, 94], hand: [80, 84] },
      { head: [62, 100], neck: [76, 104], hip: [116, 106], knee: [140, 120], ankle: [146, 138], elbow: [74, 100], hand: [80, 100] },
    ],
  },
  'push-up': {
    equipment: 'none', durationSec: 3.4, caption: 'Rigid plank, elbows about 45°',
    poses: [
      { head: [60, 96], neck: [74, 100], hip: [116, 112], knee: [146, 124], ankle: [172, 134], elbow: [72, 118], hand: [70, 138] },
      { head: [60, 101], neck: [74, 105], hip: [116, 116], knee: [146, 126], ankle: [172, 135], elbow: [69, 121], hand: [70, 138] },
      { head: [60, 106], neck: [74, 110], hip: [116, 120], knee: [146, 128], ankle: [172, 136], elbow: [66, 124], hand: [70, 138] },
      { head: [60, 111], neck: [74, 115], hip: [116, 123], knee: [146, 130], ankle: [172, 137], elbow: [63, 126], hand: [70, 138] },
      { head: [60, 116], neck: [74, 120], hip: [116, 126], knee: [146, 132], ankle: [172, 138], elbow: [60, 128], hand: [70, 138] },
    ],
  },
  'weighted-push-ups': {
    equipment: 'none', durationSec: 3, caption: 'Load on the back, hips in line',
    poses: [
      { head: [60, 96], neck: [74, 100], hip: [116, 112], knee: [146, 124], ankle: [172, 134], elbow: [72, 118], hand: [70, 138] },
      { head: [60, 106], neck: [74, 110], hip: [116, 120], knee: [146, 128], ankle: [172, 136], elbow: [66, 124], hand: [70, 138] },
      { head: [60, 116], neck: [74, 120], hip: [116, 126], knee: [146, 132], ankle: [172, 138], elbow: [60, 128], hand: [70, 138] },
    ],
  },
  'bar-dips': {
    equipment: 'none', durationSec: 3.4, ground: false,
    caption: 'Lean forward, stop at the stretch',
    poses: [
      { head: [100, 40], neck: [100, 52], hip: [104, 88], knee: [112, 112], ankle: [104, 132], elbow: [90, 68], hand: [86, 86] },
      { head: [99, 46], neck: [99, 58], hip: [104, 94], knee: [113, 117], ankle: [104, 136], elbow: [88, 72], hand: [86, 86] },
      { head: [98, 52], neck: [98, 64], hip: [104, 100], knee: [114, 122], ankle: [104, 140], elbow: [86, 76], hand: [86, 86] },
      { head: [97, 57], neck: [97, 69], hip: [104, 105], knee: [115, 126], ankle: [104, 143], elbow: [84, 79], hand: [86, 86] },
      { head: [96, 62], neck: [96, 74], hip: [104, 110], knee: [116, 130], ankle: [104, 146], elbow: [82, 82], hand: [86, 86] },
    ],
  },
  'assisted-dip': {
    equipment: 'none', durationSec: 3, ground: false,
    caption: 'Assisted — lean forward, controlled depth',
    poses: [
      { head: [100, 42], neck: [100, 54], hip: [104, 90], knee: [112, 112], ankle: [104, 130], elbow: [90, 70], hand: [86, 88] },
      { head: [98, 52], neck: [98, 64], hip: [104, 100], knee: [114, 120], ankle: [104, 138], elbow: [86, 78], hand: [86, 88] },
      { head: [96, 60], neck: [96, 72], hip: [104, 108], knee: [116, 126], ankle: [104, 142], elbow: [83, 84], hand: [86, 88] },
    ],
  },
  'bench-dip': {
    equipment: 'none', durationSec: 2.6, bench: { x: 70, y: 100, width: 44 },
    caption: 'Hands behind, elbows straight back',
    poses: [
      { head: [104, 48], neck: [104, 60], hip: [108, 96], knee: [140, 100], ankle: [166, 128], elbow: [92, 78], hand: [90, 98] },
      { head: [104, 58], neck: [104, 70], hip: [108, 106], knee: [140, 108], ankle: [166, 132], elbow: [88, 86], hand: [90, 98] },
      { head: [104, 66], neck: [104, 78], hip: [108, 114], knee: [140, 114], ankle: [166, 136], elbow: [85, 92], hand: [90, 98] },
    ],
  },
  'chest-press-machine': {
    equipment: 'none', durationSec: 2.8, ground: false, bench: { x: 66, y: 104, width: 20 },
    caption: 'Seated press, shoulders down',
    poses: [
      { head: [80, 52], neck: [82, 64], hip: [84, 100], knee: [112, 108], ankle: [116, 134], elbow: [92, 74], hand: [104, 76] },
      { head: [80, 52], neck: [82, 64], hip: [84, 100], knee: [112, 108], ankle: [116, 134], elbow: [96, 72], hand: [122, 74] },
      { head: [80, 52], neck: [82, 64], hip: [84, 100], knee: [112, 108], ankle: [116, 134], elbow: [100, 70], hand: [140, 72] },
    ],
  },

  // ── Vertical press ─────────────────────────────────────────────────────────
  'dumbbell-shoulder-press': {
    equipment: 'dumbbell', durationSec: 2.8, caption: 'Ribs down, press up and slightly back',
    poses: [
      pose({ elbow: [112, 62], hand: [110, 46] }),
      pose({ elbow: [114, 58], hand: [108, 34] }),
      pose({ elbow: [110, 54], hand: [104, 24] }),
    ],
  },
  'db-shoulder-press': {
    equipment: 'dumbbell', durationSec: 2.8, caption: 'Ribs down, press up and slightly back',
    poses: [
      pose({ elbow: [112, 62], hand: [110, 46] }),
      pose({ elbow: [114, 58], hand: [108, 34] }),
      pose({ elbow: [110, 54], hand: [104, 24] }),
    ],
  },
  'shoulder-press-bar': {
    equipment: 'bar', durationSec: 2.8, caption: 'Bar from the shoulders, lock overhead',
    poses: [
      pose({ elbow: [110, 62], hand: [104, 46] }),
      pose({ elbow: [108, 56], hand: [102, 32] }),
      pose({ elbow: [104, 50], hand: [100, 20] }),
    ],
  },
  'machine-shoulder-press': {
    equipment: 'none', durationSec: 2.8, bench: { x: 80, y: 100, width: 24 },
    caption: 'Fixed path press overhead',
    poses: [
      { head: [92, 46], neck: [94, 58], hip: [96, 96], knee: [122, 104], ankle: [126, 132], elbow: [108, 62], hand: [108, 46] },
      { head: [92, 46], neck: [94, 58], hip: [96, 96], knee: [122, 104], ankle: [126, 132], elbow: [106, 56], hand: [104, 32] },
      { head: [92, 46], neck: [94, 58], hip: [96, 96], knee: [122, 104], ankle: [126, 132], elbow: [102, 50], hand: [100, 20] },
    ],
  },
  'arnold-press': {
    equipment: 'dumbbell', durationSec: 3, caption: 'Rotate the palms as you press',
    poses: [
      pose({ elbow: [108, 64], hand: [96, 54] }),
      pose({ elbow: [114, 58], hand: [110, 38] }),
      pose({ elbow: [108, 52], hand: [102, 22] }),
    ],
  },
  'landmine-press': {
    equipment: 'bar', durationSec: 2.8, caption: 'Angled press, one arm at a time',
    poses: [
      pose({ elbow: [110, 64], hand: [112, 50] }),
      pose({ elbow: [118, 56], hand: [130, 40] }),
      pose({ elbow: [124, 50], hand: [146, 30] }),
    ],
  },

  // ── Vertical pull ──────────────────────────────────────────────────────────
  'pull-ups': {
    equipment: 'fixedBar', durationSec: 3.6, ground: false,
    caption: 'Full hang, chest toward the bar',
    poses: [
      { head: [100, 54], neck: [100, 66], hip: [100, 102], knee: [104, 128], ankle: [100, 150], elbow: [100, 46], hand: [100, 26] },
      { head: [100, 49], neck: [100, 61], hip: [100, 97], knee: [104, 123], ankle: [100, 145], elbow: [96, 44], hand: [100, 26] },
      { head: [100, 44], neck: [100, 56], hip: [100, 92], knee: [104, 118], ankle: [100, 140], elbow: [92, 42], hand: [100, 26] },
      { head: [100, 39], neck: [100, 51], hip: [100, 87], knee: [104, 113], ankle: [100, 135], elbow: [89, 41], hand: [100, 26] },
      { head: [100, 34], neck: [100, 46], hip: [100, 82], knee: [104, 108], ankle: [100, 130], elbow: [86, 40], hand: [100, 26] },
    ],
  },
  'chin-ups': {
    equipment: 'fixedBar', durationSec: 3, ground: false,
    caption: 'Underhand grip, elbows drive down',
    poses: [
      { head: [100, 54], neck: [100, 66], hip: [100, 102], knee: [104, 128], ankle: [100, 150], elbow: [102, 46], hand: [100, 26] },
      { head: [100, 44], neck: [100, 56], hip: [100, 92], knee: [104, 118], ankle: [100, 140], elbow: [96, 42], hand: [100, 26] },
      { head: [100, 32], neck: [100, 44], hip: [100, 80], knee: [104, 106], ankle: [100, 128], elbow: [92, 38], hand: [100, 26] },
    ],
  },
  'neutral-grip-pull-ups': {
    equipment: 'fixedBar', durationSec: 3, ground: false,
    caption: 'Palms facing, shoulder-friendly pull',
    poses: [
      { head: [100, 54], neck: [100, 66], hip: [100, 102], knee: [104, 128], ankle: [100, 150], elbow: [101, 46], hand: [100, 26] },
      { head: [100, 44], neck: [100, 56], hip: [100, 92], knee: [104, 118], ankle: [100, 140], elbow: [94, 42], hand: [100, 26] },
      { head: [100, 33], neck: [100, 45], hip: [100, 81], knee: [104, 107], ankle: [100, 129], elbow: [89, 39], hand: [100, 26] },
    ],
  },
  'weighted-pull-ups': {
    equipment: 'fixedBar', durationSec: 3.2, ground: false,
    caption: 'Added weight, same controlled tempo',
    poses: [
      { head: [100, 56], neck: [100, 68], hip: [100, 104], knee: [104, 130], ankle: [100, 150], elbow: [100, 48], hand: [100, 26] },
      { head: [100, 46], neck: [100, 58], hip: [100, 94], knee: [104, 120], ankle: [100, 142], elbow: [92, 44], hand: [100, 26] },
      { head: [100, 36], neck: [100, 48], hip: [100, 84], knee: [104, 110], ankle: [100, 132], elbow: [86, 42], hand: [100, 26] },
    ],
  },
  'assisted-pull-up': {
    equipment: 'fixedBar', durationSec: 3, ground: false,
    caption: 'Assisted — full hang, chest to the bar',
    poses: [
      { head: [100, 54], neck: [100, 66], hip: [100, 102], knee: [110, 124], ankle: [104, 144], elbow: [100, 46], hand: [100, 26] },
      { head: [100, 44], neck: [100, 56], hip: [100, 92], knee: [110, 114], ankle: [104, 134], elbow: [92, 42], hand: [100, 26] },
      { head: [100, 34], neck: [100, 46], hip: [100, 82], knee: [110, 104], ankle: [104, 124], elbow: [86, 40], hand: [100, 26] },
    ],
  },
  'band-assisted-pull-up': {
    equipment: 'fixedBar', durationSec: 3, ground: false,
    caption: 'Band assistance at the bottom',
    poses: [
      { head: [100, 54], neck: [100, 66], hip: [100, 102], knee: [112, 122], ankle: [106, 142], elbow: [100, 46], hand: [100, 26] },
      { head: [100, 43], neck: [100, 55], hip: [100, 91], knee: [112, 112], ankle: [106, 132], elbow: [92, 42], hand: [100, 26] },
      { head: [100, 33], neck: [100, 45], hip: [100, 81], knee: [112, 102], ankle: [106, 122], elbow: [86, 40], hand: [100, 26] },
    ],
  },
  'lat-pulldown': {
    equipment: 'bar', durationSec: 2.8, bench: { x: 84, y: 100, width: 30 },
    caption: 'Pull to the collarbone, chest up',
    poses: [
      { head: [96, 50], neck: [98, 62], hip: [100, 98], knee: [126, 106], ankle: [130, 134], elbow: [98, 40], hand: [98, 22] },
      { head: [96, 50], neck: [98, 62], hip: [100, 98], knee: [126, 106], ankle: [130, 134], elbow: [88, 50], hand: [98, 40] },
      { head: [96, 50], neck: [98, 62], hip: [100, 98], knee: [126, 106], ankle: [130, 134], elbow: [82, 60], hand: [98, 58] },
    ],
  },

  // ── Horizontal pull ────────────────────────────────────────────────────────
  'seated-cable-row': {
    equipment: 'bar', view: 'side', durationSec: 2.8, ground: false, bench: { x: 58, y: 106, width: 40 },
    caption: 'Pull to the belly button, no rocking',
    poses: [
      { head: [80, 54], neck: [82, 66], hip: [84, 102], knee: [122, 104], ankle: [150, 116], elbow: [104, 76], hand: [130, 84] },
      { head: [80, 54], neck: [82, 66], hip: [84, 102], knee: [122, 104], ankle: [150, 116], elbow: [98, 78], hand: [112, 86] },
      { head: [80, 54], neck: [82, 66], hip: [84, 102], knee: [122, 104], ankle: [150, 116], elbow: [88, 80], hand: [96, 88] },
    ],
  },
  'barbell-row': {
    equipment: 'bar', view: 'side', durationSec: 3.4, caption: 'Hinge to 45°, row to the lower ribs',
    poses: [
      pose({ head: [84, 62], neck: [88, 70], hip: [110, 90], knee: [106, 114], elbow: [96, 96], hand: [96, 116] }),
      pose({ head: [84, 62], neck: [88, 70], hip: [110, 90], knee: [106, 114], elbow: [94, 92], hand: [96, 110] }),
      pose({ head: [84, 62], neck: [88, 70], hip: [110, 90], knee: [106, 114], elbow: [92, 88], hand: [96, 104] }),
      pose({ head: [84, 62], neck: [88, 70], hip: [110, 90], knee: [106, 114], elbow: [89, 84], hand: [96, 98] }),
      pose({ head: [84, 62], neck: [88, 70], hip: [110, 90], knee: [106, 114], elbow: [86, 80], hand: [96, 92] }),
    ],
  },
  'barbell-rear-delt-row': {
    equipment: 'bar', view: 'side', durationSec: 2.8, caption: 'Wide grip, elbows flare to the sides',
    poses: [
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [98, 98], hand: [98, 118] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [100, 86], hand: [98, 104] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [104, 74], hand: [98, 90] }),
    ],
  },
  'dumbbell-rear-delt-row': {
    equipment: 'dumbbell', view: 'side', durationSec: 2.8, caption: 'Elbows high and wide, squeeze the rear delts',
    poses: [
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [96, 98], hand: [96, 118] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [100, 86], hand: [96, 104] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [106, 72], hand: [96, 88] }),
    ],
  },
  'one-arm-db-row': {
    equipment: 'dumbbell', durationSec: 2.8, bench: { x: 116, y: 100, width: 40 },
    caption: 'Support on the bench, row to the hip',
    poses: [
      { head: [64, 74], neck: [76, 78], hip: [112, 92], knee: [110, 116], ankle: [108, 138], elbow: [78, 100], hand: [78, 120] },
      { head: [64, 74], neck: [76, 78], hip: [112, 92], knee: [110, 116], ankle: [108, 138], elbow: [76, 92], hand: [78, 106] },
      { head: [64, 74], neck: [76, 78], hip: [112, 92], knee: [110, 116], ankle: [108, 138], elbow: [72, 84], hand: [78, 92] },
    ],
  },
  'chest-supported-row': {
    equipment: 'bar', durationSec: 2.8, bench: { x: 70, y: 90, width: 60 },
    caption: 'Chest supported, pure back work',
    poses: [
      { head: [66, 70], neck: [78, 74], hip: [116, 86], knee: [124, 110], ankle: [128, 136], elbow: [86, 100], hand: [86, 120] },
      { head: [66, 70], neck: [78, 74], hip: [116, 86], knee: [124, 110], ankle: [128, 136], elbow: [84, 92], hand: [86, 106] },
      { head: [66, 70], neck: [78, 74], hip: [116, 86], knee: [124, 110], ankle: [128, 136], elbow: [80, 84], hand: [86, 92] },
    ],
  },
  'machine-row': {
    equipment: 'none', view: 'side', durationSec: 2.8, bench: { x: 66, y: 104, width: 24 },
    caption: 'Seated machine row, blades together',
    poses: [
      { head: [80, 54], neck: [82, 66], hip: [84, 100], knee: [112, 108], ankle: [116, 134], elbow: [106, 74], hand: [132, 78] },
      { head: [80, 54], neck: [82, 66], hip: [84, 100], knee: [112, 108], ankle: [116, 134], elbow: [98, 76], hand: [114, 80] },
      { head: [80, 54], neck: [82, 66], hip: [84, 100], knee: [112, 108], ankle: [116, 134], elbow: [88, 78], hand: [96, 82] },
    ],
  },
  'inverted-row': {
    equipment: 'fixedBar', durationSec: 2.8, ground: false,
    caption: 'Body straight, pull the chest to the bar',
    poses: [
      { head: [56, 104], neck: [70, 104], hip: [112, 108], knee: [142, 114], ankle: [170, 120], elbow: [76, 86], hand: [76, 66] },
      { head: [56, 96], neck: [70, 96], hip: [112, 102], knee: [142, 110], ankle: [170, 118], elbow: [70, 82], hand: [76, 66] },
      { head: [56, 86], neck: [70, 86], hip: [112, 96], knee: [142, 106], ankle: [170, 116], elbow: [64, 78], hand: [76, 66] },
    ],
  },
  'face-pull': {
    equipment: 'none', durationSec: 2.6, caption: 'Elbows high, pull toward the forehead',
    poses: [
      pose({ elbow: [116, 62], hand: [136, 54] }),
      pose({ elbow: [118, 56], hand: [120, 48] }),
      pose({ elbow: [120, 50], hand: [104, 44] }),
    ],
  },
  'reverse-pec-deck': {
    equipment: 'none', durationSec: 2.6, bench: { x: 84, y: 100, width: 26 },
    caption: 'Open the arms wide, squeeze the rear delts',
    poses: [
      { head: [92, 48], neck: [94, 60], hip: [96, 98], knee: [124, 106], ankle: [128, 134], elbow: [112, 62], hand: [130, 60] },
      { head: [92, 48], neck: [94, 60], hip: [96, 98], knee: [124, 106], ankle: [128, 134], elbow: [110, 60], hand: [118, 56] },
      { head: [92, 48], neck: [94, 60], hip: [96, 98], knee: [124, 106], ankle: [128, 134], elbow: [106, 58], hand: [102, 52] },
    ],
  },
  'band-pull-apart': {
    equipment: 'none', durationSec: 2.4, caption: 'Pull the band apart at chest height',
    poses: [
      pose({ elbow: [110, 60], hand: [126, 58] }),
      pose({ elbow: [112, 58], hand: [116, 56] }),
      pose({ elbow: [114, 56], hand: [102, 54] }),
    ],
  },
  'rear-delt-fly': {
    equipment: 'dumbbell', durationSec: 2.6, caption: 'Hinge, arc the arms out',
    poses: [
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [92, 96], hand: [92, 116] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [94, 86], hand: [96, 100] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [98, 76], hand: [104, 84] }),
    ],
  },
  'rear-delt-raises': {
    equipment: 'dumbbell', durationSec: 2.6, caption: 'Bent over, raise to shoulder height',
    poses: [
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [92, 96], hand: [92, 116] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [94, 86], hand: [96, 100] }),
      pose({ head: [84, 66], neck: [88, 74], hip: [110, 92], knee: [106, 114], elbow: [98, 76], hand: [104, 84] }),
    ],
  },

  // ── Raises ─────────────────────────────────────────────────────────────────
  'db-lateral-raises': {
    equipment: 'dumbbell', durationSec: 2.6, caption: 'Lead with the elbows to shoulder height',
    poses: [
      pose({ elbow: [104, 68], hand: [106, 88] }),
      pose({ elbow: [112, 62], hand: [124, 72] }),
      pose({ elbow: [118, 54], hand: [138, 54] }),
    ],
  },
  'dumbbell-lateral-raises': {
    equipment: 'dumbbell', durationSec: 2.6, caption: 'Lead with the elbows to shoulder height',
    poses: [
      pose({ elbow: [104, 68], hand: [106, 88] }),
      pose({ elbow: [112, 62], hand: [124, 72] }),
      pose({ elbow: [118, 54], hand: [138, 54] }),
    ],
  },
  'cable-lateral-raises': {
    equipment: 'none', durationSec: 2.6, caption: 'Constant cable tension through the arc',
    poses: [
      pose({ elbow: [104, 70], hand: [104, 90] }),
      pose({ elbow: [112, 62], hand: [124, 74] }),
      pose({ elbow: [118, 54], hand: [140, 56] }),
    ],
  },
  'barbell-front-raises': {
    equipment: 'bar', durationSec: 2.6, caption: 'Raise the bar to eye level, no swing',
    poses: [
      pose({ elbow: [102, 70], hand: [106, 90] }),
      pose({ elbow: [108, 64], hand: [124, 74] }),
      pose({ elbow: [112, 58], hand: [136, 52] }),
    ],
  },
  'trap-raises': {
    equipment: 'dumbbell', durationSec: 2.4, caption: 'Shrug the shoulders straight up',
    poses: [
      pose({ neck: [100, 52], elbow: [104, 70], hand: [106, 90] }),
      pose({ neck: [100, 48], elbow: [104, 66], hand: [106, 84] }),
      pose({ neck: [100, 44], elbow: [104, 62], hand: [106, 78] }),
    ],
  },

  // ── Curls / arms ───────────────────────────────────────────────────────────
  'barbell-curls': {
    equipment: 'bar', durationSec: 2.6, caption: 'Elbows pinned, curl to the shoulders',
    poses: [
      pose({ elbow: [102, 70], hand: [104, 92] }),
      pose({ elbow: [102, 68], hand: [116, 74] }),
      pose({ elbow: [102, 66], hand: [112, 54] }),
    ],
  },
  'cable-bicep-curls': {
    equipment: 'none', durationSec: 2.6, caption: 'Cable tension, elbows stay still',
    poses: [
      pose({ elbow: [102, 70], hand: [104, 92] }),
      pose({ elbow: [102, 68], hand: [116, 74] }),
      pose({ elbow: [102, 66], hand: [112, 54] }),
    ],
  },
  'hammer-curls': {
    equipment: 'dumbbell', durationSec: 2.6, caption: 'Neutral grip, thumbs up throughout',
    poses: [
      pose({ elbow: [104, 70], hand: [106, 92] }),
      pose({ elbow: [104, 68], hand: [118, 76] }),
      pose({ elbow: [104, 66], hand: [114, 56] }),
    ],
  },
  'zottman-curl': {
    equipment: 'dumbbell', durationSec: 3.2, caption: 'Curl up, rotate, lower with palms down',
    poses: [
      pose({ elbow: [104, 70], hand: [106, 92] }),
      pose({ elbow: [104, 67], hand: [118, 72] }),
      pose({ elbow: [104, 64], hand: [110, 52] }),
    ],
  },
  'cable-triceps': {
    equipment: 'none', durationSec: 2.4, caption: 'Elbows locked at the sides, press down',
    poses: [
      pose({ elbow: [104, 68], hand: [112, 56] }),
      pose({ elbow: [104, 70], hand: [112, 74] }),
      pose({ elbow: [104, 72], hand: [110, 92] }),
    ],
  },

  // ── Calves ─────────────────────────────────────────────────────────────────
  'standing-calf-raises': {
    equipment: 'none', durationSec: 2.2, caption: 'Full stretch down, high onto the toes',
    poses: [
      pose({ head: [100, 42], neck: [100, 54], hip: [100, 90], knee: [100, 116], ankle: [100, 142], hand: [102, 90] }),
      pose({ head: [100, 38], neck: [100, 50], hip: [100, 86], knee: [100, 112], ankle: [100, 138], hand: [102, 86] }),
      pose({ head: [100, 30], neck: [100, 42], hip: [100, 78], knee: [100, 104], ankle: [100, 130], hand: [102, 78] }),
    ],
  },

  // ── Core ───────────────────────────────────────────────────────────────────
  'dead-bug': {
    equipment: 'none', durationSec: 3, caption: 'Lower back glued down, reach opposite limbs',
    poses: [
      { head: [66, 130], neck: [78, 130], hip: [112, 132], knee: [114, 108], ankle: [136, 106], elbow: [78, 112], hand: [80, 94] },
      { head: [66, 130], neck: [78, 130], hip: [112, 132], knee: [126, 112], ankle: [150, 116], elbow: [72, 116], hand: [58, 104] },
      { head: [66, 130], neck: [78, 130], hip: [112, 132], knee: [138, 122], ankle: [164, 128], elbow: [66, 120], hand: [44, 114] },
    ],
  },
  'hollow-body-hold': {
    equipment: 'none', durationSec: 3.6, caption: 'Hold the shape — lower back pressed flat',
    poses: [
      { head: [66, 124], neck: [78, 126], hip: [112, 132], knee: [138, 122], ankle: [162, 116], elbow: [64, 116], hand: [50, 108] },
      { head: [66, 120], neck: [78, 123], hip: [112, 132], knee: [140, 120], ankle: [166, 112], elbow: [62, 112], hand: [46, 102] },
    ],
  },
  'plank': {
    equipment: 'none', durationSec: 3.6, caption: 'Hold a rigid line from head to heels',
    poses: [
      { head: [58, 106], neck: [72, 110], hip: [114, 120], knee: [144, 128], ankle: [172, 136], elbow: [70, 128], hand: [80, 132] },
      { head: [58, 104], neck: [72, 108], hip: [114, 118], knee: [144, 127], ankle: [172, 135], elbow: [70, 128], hand: [80, 132] },
    ],
  },
  'side-plank': {
    equipment: 'none', durationSec: 3.6, caption: 'Hips stacked and lifted, hold the line',
    poses: [
      { head: [58, 100], neck: [72, 106], hip: [114, 120], knee: [144, 128], ankle: [172, 136], elbow: [72, 128], hand: [64, 134] },
      { head: [58, 96], neck: [72, 103], hip: [114, 117], knee: [144, 126], ankle: [172, 135], elbow: [72, 128], hand: [64, 134] },
    ],
  },
  'cable-pallof-press': {
    equipment: 'none', durationSec: 2.8, caption: 'Resist the twist — only the arms move',
    poses: [
      pose({ elbow: [108, 66], hand: [112, 62] }),
      pose({ elbow: [112, 65], hand: [128, 62] }),
      pose({ elbow: [116, 64], hand: [146, 62] }),
    ],
  },
  'suitcase-carry': {
    equipment: 'dumbbell', durationSec: 3, caption: 'Walk tall, one side loaded',
    poses: [
      pose({ knee: [98, 112], ankle: [94, 138], hand: [110, 92], elbow: [108, 72] }),
      pose({ knee: [104, 110], ankle: [110, 134], hand: [110, 92], elbow: [108, 72] }),
      pose({ knee: [98, 112], ankle: [92, 136], hand: [110, 92], elbow: [108, 72] }),
    ],
  },
  'half-kneeling-chop': {
    equipment: 'none', durationSec: 2.8, caption: 'Half-kneeling, chop across the body',
    poses: [
      { head: [100, 60], neck: [100, 72], hip: [100, 106], knee: [80, 124], ankle: [124, 122], elbow: [112, 66], hand: [124, 50] },
      { head: [100, 60], neck: [100, 72], hip: [100, 106], knee: [80, 124], ankle: [124, 122], elbow: [106, 78], hand: [104, 84] },
      { head: [100, 60], neck: [100, 72], hip: [100, 106], knee: [80, 124], ankle: [124, 122], elbow: [96, 88], hand: [80, 108] },
    ],
  },
  'cable-crunch': {
    equipment: 'none', durationSec: 2.6, caption: 'Curl the ribs to the hips, hips still',
    poses: [
      { head: [100, 58], neck: [100, 70], hip: [100, 106], knee: [92, 126], ankle: [118, 130], elbow: [106, 58], hand: [104, 44] },
      { head: [98, 70], neck: [99, 80], hip: [100, 106], knee: [92, 126], ankle: [118, 130], elbow: [104, 68], hand: [102, 54] },
      { head: [96, 84], neck: [98, 92], hip: [100, 106], knee: [92, 126], ankle: [118, 130], elbow: [102, 80], hand: [100, 66] },
    ],
  },
  'reverse-crunch': {
    equipment: 'none', durationSec: 2.6, caption: 'Curl the pelvis up off the floor',
    poses: [
      { head: [62, 132], neck: [76, 132], hip: [114, 132], knee: [130, 112], ankle: [148, 118], elbow: [76, 136], hand: [92, 138] },
      { head: [62, 132], neck: [76, 132], hip: [112, 126], knee: [122, 104], ankle: [136, 108], elbow: [76, 136], hand: [92, 138] },
      { head: [62, 132], neck: [76, 132], hip: [110, 118], knee: [110, 94], ankle: [122, 94], elbow: [76, 136], hand: [92, 138] },
    ],
  },
  'hanging-leg-raises': {
    equipment: 'fixedBar', durationSec: 3.6, ground: false,
    caption: 'Curl the pelvis as the legs rise',
    poses: [
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [100, 126], ankle: [100, 148], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [110, 121], ankle: [120, 136], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [120, 114], ankle: [138, 122], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [126, 105], ankle: [148, 106], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [130, 96], ankle: [154, 92], elbow: [100, 44], hand: [100, 26] },
    ],
  },
  'hanging-knee-raise': {
    equipment: 'fixedBar', durationSec: 2.8, ground: false,
    caption: 'Knees to the chest, no swinging',
    poses: [
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [100, 126], ankle: [100, 148], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [116, 110], ankle: [122, 132], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [124, 90], ankle: [132, 112], elbow: [100, 44], hand: [100, 26] },
    ],
  },
  'bar-knee-raises': {
    equipment: 'fixedBar', durationSec: 2.8, ground: false,
    caption: 'Knees to the chest from a dead hang',
    poses: [
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [100, 126], ankle: [100, 148], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [116, 110], ankle: [122, 132], elbow: [100, 44], hand: [100, 26] },
      { head: [100, 52], neck: [100, 64], hip: [100, 100], knee: [124, 90], ankle: [132, 112], elbow: [100, 44], hand: [100, 26] },
    ],
  },
  'leg-lowers': {
    equipment: 'none', durationSec: 3, caption: 'Lower the legs only as far as the back allows',
    poses: [
      { head: [62, 132], neck: [76, 132], hip: [114, 132], knee: [116, 106], ankle: [118, 82], elbow: [76, 136], hand: [92, 138] },
      { head: [62, 132], neck: [76, 132], hip: [114, 132], knee: [128, 112], ankle: [146, 96], elbow: [76, 136], hand: [92, 138] },
      { head: [62, 132], neck: [76, 132], hip: [114, 132], knee: [140, 122], ankle: [168, 118], elbow: [76, 136], hand: [92, 138] },
    ],
  },
  'russian-twists': {
    equipment: 'dumbbell', durationSec: 2.6, caption: 'Rotate through the ribs, not the arms',
    poses: [
      { head: [86, 92], neck: [90, 102], hip: [104, 128], knee: [130, 112], ankle: [140, 132], elbow: [100, 106], hand: [116, 100] },
      { head: [86, 92], neck: [90, 102], hip: [104, 128], knee: [130, 112], ankle: [140, 132], elbow: [98, 108], hand: [104, 112] },
      { head: [86, 92], neck: [90, 102], hip: [104, 128], knee: [130, 112], ankle: [140, 132], elbow: [94, 110], hand: [86, 120] },
    ],
  },
  'ab-wheel': {
    equipment: 'none', durationSec: 3.2, caption: 'Roll out only as far as the back stays flat',
    poses: [
      { head: [92, 100], neck: [96, 110], hip: [104, 130], knee: [96, 136], ankle: [82, 138], elbow: [110, 116], hand: [118, 130] },
      { head: [82, 110], neck: [88, 118], hip: [104, 132], knee: [96, 136], ankle: [82, 138], elbow: [118, 124], hand: [140, 134] },
      { head: [72, 120], neck: [80, 126], hip: [104, 134], knee: [96, 137], ankle: [82, 138], elbow: [124, 130], hand: [162, 136] },
    ],
  },
  'ab-wheel-from-knees': {
    equipment: 'none', durationSec: 3.2, caption: 'From the knees, roll out and back',
    poses: [
      { head: [92, 100], neck: [96, 110], hip: [104, 130], knee: [96, 136], ankle: [82, 138], elbow: [110, 116], hand: [118, 130] },
      { head: [82, 110], neck: [88, 118], hip: [104, 132], knee: [96, 136], ankle: [82, 138], elbow: [118, 124], hand: [140, 134] },
      { head: [72, 120], neck: [80, 126], hip: [104, 134], knee: [96, 137], ankle: [82, 138], elbow: [124, 130], hand: [162, 136] },
    ],
  },
  'bird-dog': {
    equipment: 'none', durationSec: 3, caption: 'Opposite arm and leg, hips square',
    poses: [
      { head: [88, 106], neck: [94, 112], hip: [124, 116], knee: [124, 132], ankle: [138, 138], elbow: [96, 124], hand: [96, 138] },
      { head: [86, 104], neck: [92, 110], hip: [124, 116], knee: [136, 128], ankle: [154, 126], elbow: [86, 116], hand: [72, 110] },
    ],
  },
  'nordic-negative': {
    equipment: 'none', durationSec: 3.4, caption: 'Ankles anchored, lower as slowly as you can',
    poses: [
      { head: [100, 62], neck: [100, 74], hip: [100, 110], knee: [100, 132], ankle: [116, 138], elbow: [108, 88], hand: [112, 104] },
      { head: [86, 76], neck: [90, 86], hip: [100, 114], knee: [100, 132], ankle: [116, 138], elbow: [92, 98], hand: [90, 116] },
      { head: [66, 100], neck: [76, 106], hip: [100, 120], knee: [100, 132], ankle: [116, 138], elbow: [72, 116], hand: [60, 132] },
    ],
  },
  'stability-ball-curl': {
    equipment: 'none', durationSec: 2.8, caption: 'Heels on the ball, curl it toward the hips',
    poses: [
      { head: [56, 134], neck: [70, 134], hip: [104, 124], knee: [136, 118], ankle: [166, 116], elbow: [70, 138], hand: [86, 138] },
      { head: [56, 134], neck: [70, 134], hip: [104, 116], knee: [130, 104], ankle: [148, 116], elbow: [70, 138], hand: [86, 138] },
      { head: [56, 134], neck: [70, 134], hip: [104, 110], knee: [122, 92], ankle: [130, 114], elbow: [70, 138], hand: [86, 138] },
    ],
  },
}
