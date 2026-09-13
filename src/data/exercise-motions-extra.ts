/**
 * Movement animations for the free-weight additions — EZ bar, barbell and
 * dumbbell work the two programme templates never prescribed.
 *
 * Same format and canvas as `exercise-motions-data.ts`; kept in its own module
 * because that one is already past the file-size budget. `exercise-motions.ts`
 * merges the two into one table.
 *
 * The import direction matters and is load-bearing: this file value-imports the
 * data module for its `pose` helper and type-imports the types module, while the
 * types module value-imports both tables. Add a value import from either table
 * back to the types module and that becomes a runtime cycle.
 */

import type { ExerciseMotion, Pose } from './exercise-motions'
import { pose } from './exercise-motions-data'

/** Everything but the arms — what the pressing and rowing frames below fix. */
type Frame = Omit<Pose, 'elbow' | 'hand'>

/**
 * A lifter lying on a flat bench — the frame every pressing variant here starts
 * from. Only the arms differ between them, so the torso is stated once.
 */
const ON_BENCH: Frame = {
  head: [62, 100], neck: [76, 104], hip: [116, 106],
  knee: [140, 120], ankle: [146, 138],
}

/**
 * The same lifter on a 30° incline: hips stay put, the torso rises. Kept under
 * the 18px neck-to-hip gap that makes the renderer draw a profile figure — a
 * press seen head-on shows nothing.
 */
const ON_INCLINE: Frame = {
  head: [66, 86], neck: [78, 92], hip: [118, 106],
  knee: [142, 120], ankle: [148, 138],
}

/** Seated upright in profile, legs out to the right. */
const SEATED: Frame = {
  head: [86, 52], neck: [88, 64], hip: [86, 100],
  knee: [116, 104], ankle: [122, 132],
}

/** Hinged at the hips, back flat — the row and swing frame. */
const HINGED: Frame = {
  head: [84, 64], neck: [88, 72], hip: [110, 90],
  knee: [106, 114], ankle: [100, 138],
}

export const EXTRA_MOTIONS: Record<string, ExerciseMotion> = {
  // ── EZ bar ─────────────────────────────────────────────────────────────────
  'ez-bar-curl': {
    equipment: 'bar', durationSec: 2.6, caption: 'Angled grip, elbows pinned to the ribs',
    poses: [
      pose({ elbow: [102, 70], hand: [104, 92] }),
      pose({ elbow: [102, 68], hand: [115, 75] }),
      pose({ elbow: [102, 66], hand: [111, 55] }),
    ],
  },
  'ez-bar-reverse-curl': {
    equipment: 'bar', durationSec: 2.6, caption: 'Palms down — the forearms take the load',
    poses: [
      pose({ elbow: [102, 70], hand: [104, 92] }),
      pose({ elbow: [102, 69], hand: [114, 77] }),
      pose({ elbow: [102, 67], hand: [108, 59] }),
    ],
  },
  'ez-bar-preacher-curl': {
    equipment: 'bar', view: 'side', durationSec: 2.8, bench: { x: 96, y: 90, width: 30 },
    caption: 'Upper arms locked on the pad, no swing',
    poses: [
      { ...SEATED, elbow: [110, 84], hand: [124, 104] },
      { ...SEATED, elbow: [110, 84], hand: [126, 88] },
      { ...SEATED, elbow: [110, 84], hand: [116, 70] },
    ],
  },
  'ez-bar-skull-crusher': {
    equipment: 'bar', durationSec: 3, ground: false, bench: { x: 56, y: 108, width: 88 },
    caption: 'Elbows still, the bar travels past the forehead',
    poses: [
      { ...ON_BENCH, elbow: [80, 84], hand: [80, 64] },
      { ...ON_BENCH, elbow: [80, 84], hand: [70, 74] },
      { ...ON_BENCH, elbow: [80, 84], hand: [58, 86] },
    ],
  },
  'ez-bar-overhead-triceps-extension': {
    equipment: 'bar', durationSec: 2.8, caption: 'Elbows high and still, bar behind the head',
    poses: [
      pose({ elbow: [104, 48], hand: [102, 30] }),
      pose({ elbow: [104, 48], hand: [92, 44] }),
      pose({ elbow: [104, 48], hand: [86, 58] }),
    ],
  },
  'ez-bar-upright-row': {
    equipment: 'bar', durationSec: 2.6, caption: 'Elbows lead, bar stays close to the body',
    poses: [
      pose({ elbow: [102, 72], hand: [102, 92] }),
      pose({ elbow: [108, 62], hand: [102, 78] }),
      pose({ elbow: [114, 52], hand: [102, 64] }),
    ],
  },

  // ── Barbell ────────────────────────────────────────────────────────────────
  'front-squat': {
    equipment: 'bar', durationSec: 3.2, caption: 'Elbows up, torso vertical the whole way down',
    poses: [
      pose({ hand: [108, 52], elbow: [110, 60] }),
      pose({ head: [98, 56], neck: [99, 68], hip: [101, 100], knee: [91, 116], hand: [107, 70], elbow: [109, 78] }),
      pose({ head: [97, 70], neck: [98, 82], hip: [102, 112], knee: [85, 120], hand: [106, 84], elbow: [108, 92] }),
    ],
  },
  'incline-bench-press': {
    equipment: 'bar', durationSec: 3.2, ground: false, bench: { x: 58, y: 112, width: 84 },
    caption: 'Bench at 30°, press over the collarbone',
    poses: [
      { ...ON_INCLINE, elbow: [80, 74], hand: [80, 54] },
      { ...ON_INCLINE, elbow: [74, 82], hand: [80, 72] },
      { ...ON_INCLINE, elbow: [70, 88], hand: [80, 88] },
    ],
  },
  'barbell-push-press': {
    equipment: 'bar', durationSec: 2.8, caption: 'Short dip, then drive the bar overhead',
    poses: [
      pose({ elbow: [110, 62], hand: [104, 46] }),
      pose({ head: [100, 44], neck: [100, 56], hip: [100, 92], knee: [96, 116], elbow: [110, 68], hand: [104, 52] }),
      pose({ elbow: [106, 54], hand: [100, 32] }),
      pose({ elbow: [102, 48], hand: [100, 18] }),
    ],
  },
  'barbell-shrug': {
    equipment: 'bar', durationSec: 2.4, caption: 'Shrug straight up — no rolling the shoulders',
    poses: [
      pose({ neck: [100, 54], elbow: [102, 72], hand: [102, 92] }),
      pose({ neck: [100, 49], elbow: [102, 67], hand: [102, 86] }),
      pose({ neck: [100, 44], elbow: [102, 62], hand: [102, 80] }),
    ],
  },
  't-bar-row': {
    equipment: 'bar', view: 'side', durationSec: 3, caption: 'Chest over the bar, row to the sternum',
    poses: [
      { ...HINGED, elbow: [98, 96], hand: [100, 116] },
      { ...HINGED, elbow: [94, 90], hand: [100, 106] },
      { ...HINGED, elbow: [88, 82], hand: [100, 94] },
    ],
  },
  'barbell-wrist-curl': {
    equipment: 'bar', view: 'side', durationSec: 2.4, bench: { x: 62, y: 104, width: 40 },
    caption: 'Forearms flat on the thighs — only the wrists move',
    poses: [
      { ...SEATED, elbow: [100, 90], hand: [124, 98] },
      { ...SEATED, elbow: [100, 90], hand: [126, 92] },
      { ...SEATED, elbow: [100, 90], hand: [124, 84] },
    ],
  },

  // ── Dumbbell ───────────────────────────────────────────────────────────────
  'incline-dumbbell-press': {
    equipment: 'dumbbell', durationSec: 3, ground: false, bench: { x: 58, y: 112, width: 84 },
    caption: 'Incline bench, dumbbells press over the chest',
    poses: [
      { ...ON_INCLINE, elbow: [80, 74], hand: [80, 52] },
      { ...ON_INCLINE, elbow: [72, 82], hand: [78, 72] },
      { ...ON_INCLINE, elbow: [66, 88], hand: [76, 90] },
    ],
  },
  'dumbbell-fly': {
    equipment: 'dumbbell', durationSec: 3, ground: false, bench: { x: 56, y: 108, width: 88 },
    caption: 'Wide arc, a soft bend held in the elbows',
    poses: [
      { ...ON_BENCH, elbow: [78, 84], hand: [80, 64] },
      { ...ON_BENCH, elbow: [72, 88], hand: [64, 74] },
      { ...ON_BENCH, elbow: [66, 92], hand: [48, 86] },
    ],
  },
  'dumbbell-pullover': {
    equipment: 'dumbbell', durationSec: 3.2, ground: false, bench: { x: 56, y: 108, width: 88 },
    caption: 'Arms travel back over the head, ribs down',
    poses: [
      { ...ON_BENCH, elbow: [74, 86], hand: [74, 66] },
      { ...ON_BENCH, elbow: [66, 84], hand: [56, 74] },
      { ...ON_BENCH, elbow: [58, 82], hand: [38, 84] },
    ],
  },
  'dumbbell-shrug': {
    equipment: 'dumbbell', durationSec: 2.4, caption: 'Shrug the shoulders toward the ears',
    poses: [
      pose({ neck: [100, 54], elbow: [104, 72], hand: [106, 92] }),
      pose({ neck: [100, 49], elbow: [104, 67], hand: [106, 87] }),
      pose({ neck: [100, 44], elbow: [104, 62], hand: [106, 82] }),
    ],
  },
  'dumbbell-front-raise': {
    equipment: 'dumbbell', durationSec: 2.6, caption: 'Raise to eye level, no swing from the hips',
    poses: [
      pose({ elbow: [102, 70], hand: [106, 90] }),
      pose({ elbow: [106, 64], hand: [124, 76] }),
      pose({ elbow: [110, 58], hand: [138, 54] }),
    ],
  },
  'concentration-curl': {
    equipment: 'dumbbell', view: 'side', durationSec: 2.8, bench: { x: 62, y: 104, width: 40 },
    caption: 'Elbow braced on the thigh, curl slowly',
    poses: [
      { ...SEATED, elbow: [104, 92], hand: [112, 114] },
      { ...SEATED, elbow: [104, 92], hand: [120, 98] },
      { ...SEATED, elbow: [104, 92], hand: [112, 80] },
    ],
  },
  'dumbbell-overhead-triceps-extension': {
    equipment: 'dumbbell', durationSec: 2.8, caption: 'One bell overhead, elbows point at the ceiling',
    poses: [
      pose({ elbow: [104, 46], hand: [104, 28] }),
      pose({ elbow: [104, 46], hand: [94, 42] }),
      pose({ elbow: [104, 46], hand: [88, 56] }),
    ],
  },
  'dumbbell-triceps-kickback': {
    equipment: 'dumbbell', view: 'side', durationSec: 2.6,
    caption: 'Upper arm locked in place, extend behind you',
    poses: [
      { ...HINGED, elbow: [100, 86], hand: [102, 104] },
      { ...HINGED, elbow: [100, 86], hand: [112, 98] },
      { ...HINGED, elbow: [100, 86], hand: [120, 88] },
    ],
  },
  'kettlebell-swing': {
    equipment: 'dumbbell', view: 'side', durationSec: 3,
    caption: 'Snap the hips — the arms only guide it',
    poses: [
      { ...HINGED, elbow: [96, 92], hand: [90, 108] },
      pose({ elbow: [100, 74], hand: [110, 84] }),
      pose({ elbow: [104, 66], hand: [126, 60] }),
    ],
  },

  // ── Cable and machine ──────────────────────────────────────────────────────
  'cable-fly': {
    equipment: 'none', durationSec: 2.8, caption: 'Arc the hands together in front of the chest',
    poses: [
      pose({ elbow: [110, 62], hand: [130, 58] }),
      pose({ elbow: [112, 62], hand: [120, 62] }),
      pose({ elbow: [112, 64], hand: [106, 66] }),
    ],
  },
  'pec-deck': {
    equipment: 'none', durationSec: 2.6, bench: { x: 84, y: 100, width: 26 },
    caption: 'Seated, squeeze the arms together',
    poses: [
      { head: [92, 48], neck: [94, 60], hip: [96, 98], knee: [124, 106], ankle: [128, 134], elbow: [112, 64], hand: [132, 62] },
      { head: [92, 48], neck: [94, 60], hip: [96, 98], knee: [124, 106], ankle: [128, 134], elbow: [112, 64], hand: [120, 62] },
      { head: [92, 48], neck: [94, 60], hip: [96, 98], knee: [124, 106], ankle: [128, 134], elbow: [110, 64], hand: [104, 62] },
    ],
  },
  'incline-chest-press-machine': {
    equipment: 'none', durationSec: 2.8, ground: false, bench: { x: 64, y: 104, width: 22 },
    caption: 'Seated incline press, up and away from the chest',
    poses: [
      { head: [80, 54], neck: [82, 66], hip: [84, 102], knee: [112, 110], ankle: [116, 136], elbow: [92, 76], hand: [104, 70] },
      { head: [80, 54], neck: [82, 66], hip: [84, 102], knee: [112, 110], ankle: [116, 136], elbow: [96, 70], hand: [120, 60] },
      { head: [80, 54], neck: [82, 66], hip: [84, 102], knee: [112, 110], ankle: [116, 136], elbow: [100, 64], hand: [136, 48] },
    ],
  },
  /**
   * Drawn facing the viewer, which is the only angle that shows the movement at
   * all: the knees travel toward each other, and the front rig mirrors each
   * joint about the centre line, so one knee x gives both legs.
   */
  'inner-thigh-machine': {
    equipment: 'none', durationSec: 2.8, bench: { x: 84, y: 100, width: 26 },
    caption: 'Seated, squeeze the knees together',
    poses: [
      { head: [100, 48], neck: [100, 60], hip: [100, 98], knee: [124, 112], ankle: [132, 134], elbow: [92, 76], hand: [88, 94] },
      { head: [100, 48], neck: [100, 60], hip: [100, 98], knee: [116, 112], ankle: [120, 134], elbow: [92, 76], hand: [88, 94] },
      { head: [100, 48], neck: [100, 60], hip: [100, 98], knee: [108, 112], ankle: [108, 134], elbow: [92, 76], hand: [88, 94] },
    ],
  },
  'seated-calf-raise': {
    equipment: 'none', view: 'side', durationSec: 2.2, bench: { x: 62, y: 104, width: 40 },
    caption: 'Full stretch down, then high onto the toes',
    poses: [
      { ...SEATED, knee: [118, 102], elbow: [92, 82], hand: [100, 96] },
      { ...SEATED, knee: [118, 97], elbow: [92, 82], hand: [100, 96] },
      { ...SEATED, knee: [118, 91], elbow: [92, 82], hand: [100, 96] },
    ],
  },
}
