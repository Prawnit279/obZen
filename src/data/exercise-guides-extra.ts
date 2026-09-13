/**
 * Guides for the free-weight additions — EZ bar, barbell, dumbbell, and the
 * cable and machine movements that came with them.
 *
 * Separate module for the same reason the motion table is split: `exercise-
 * guides.ts` is near the file-size budget. It merges this in.
 *
 * Worth writing rather than leaning on the group fallback: `arms` falls back to
 * biceps *and* triceps, so without an entry a skull crusher highlights the
 * biceps and a curl the triceps. Naming the muscle is the whole point of the
 * diagram.
 */

import type { ExerciseGuide } from './exercise-guides'

export const EXTRA_GUIDES: Record<string, ExerciseGuide> = {
  // ── EZ bar ─────────────────────────────────────────────────────────────────
  'ez-bar-curl': {
    primary: ['biceps'], secondary: ['forearms'],
    steps: [
      'Take the inner angle of the bar, palms turned slightly in.',
      'Pin the elbows to the ribs and curl without letting them drift forward.',
      'Stop when the forearms reach vertical — past that the biceps unload.',
      'Lower over about two seconds, all the way to straight arms.',
    ],
  },
  'ez-bar-preacher-curl': {
    primary: ['biceps'], secondary: ['forearms'],
    steps: [
      'Set the seat so the armpits rest over the top of the pad.',
      'Lay the upper arms flat on the pad — they stay there for every rep.',
      'Curl to the point where the pad stops the elbows travelling.',
      'Lower until the arms are straight, holding a moment at the bottom.',
    ],
  },
  'ez-bar-reverse-curl': {
    primary: ['forearms'], secondary: ['biceps'],
    steps: [
      'Grip the outer angle of the bar with the knuckles up.',
      'Curl with the wrists held straight — let them collapse and the bar stalls.',
      'Expect to use roughly half the weight of a normal curl.',
      'Lower slowly; this is the version that trains the grip.',
    ],
  },
  'ez-bar-skull-crusher': {
    primary: ['triceps'],
    steps: [
      'Lie on the bench and press the bar up over the shoulders.',
      'Keep the upper arms still — the elbows are the hinge and nothing else moves.',
      'Lower the bar past the forehead, not to it.',
      'Extend back to the start without letting the elbows flare wide.',
    ],
  },
  'ez-bar-overhead-triceps-extension': {
    primary: ['triceps'],
    steps: [
      'Press the bar overhead with the elbows pointing at the ceiling.',
      'Lower behind the head until the forearms touch the biceps.',
      'Keep the ribs down — the lower back arches the moment they lift.',
      'Extend without letting the elbows drift out to the sides.',
    ],
  },
  'ez-bar-upright-row': {
    primary: ['sideDelts'], secondary: ['traps', 'biceps'],
    steps: [
      'Hold the bar at the hips, hands a little wider than the shoulders.',
      'Lead with the elbows and keep the bar close to the body.',
      'Stop at chest height — higher rotates the shoulder into the pinch.',
      'Lower under control rather than dropping into the next rep.',
    ],
  },

  // ── Barbell ────────────────────────────────────────────────────────────────
  'front-squat': {
    primary: ['quads'], secondary: ['glutes', 'abs', 'traps'],
    steps: [
      'Rack the bar across the front delts, elbows lifted and pointing forward.',
      'Brace, then sit straight down with the torso as vertical as it will go.',
      'Descend until the hip crease passes the knee, if the ankles allow it.',
      'Drive up keeping the elbows high — they drop and the bar rolls forward.',
    ],
  },
  'incline-bench-press': {
    primary: ['chest', 'frontDelts'], secondary: ['triceps'],
    steps: [
      'Set the bench near 30°; steeper and it becomes a shoulder press.',
      'Pull the shoulder blades back and down into the bench.',
      'Lower the bar to the upper chest, just under the collarbone.',
      'Press back over the collarbone rather than over the face.',
    ],
  },
  'barbell-push-press': {
    primary: ['frontDelts'], secondary: ['triceps', 'quads', 'abs'],
    steps: [
      'Start with the bar racked on the front delts, elbows just ahead of it.',
      'Dip at the knees a few inches, torso staying vertical.',
      'Reverse the dip hard and let the drive carry the bar past the head.',
      'Finish with the elbows locked and the bar over the mid-foot.',
    ],
  },
  'barbell-shrug': {
    primary: ['traps'], secondary: ['forearms'],
    steps: [
      'Stand with the bar at arms length, shoulders relaxed down.',
      'Shrug straight up toward the ears — no rolling, which loads nothing.',
      'Hold the top for a full second.',
      'Lower all the way down to get the stretch at the bottom.',
    ],
  },
  't-bar-row': {
    primary: ['lats'], secondary: ['traps', 'biceps', 'forearms'],
    steps: [
      'Straddle the bar and hinge until the torso is near 45°.',
      'Let the arms hang straight, then row toward the sternum.',
      'Drive the elbows back and squeeze the shoulder blades together.',
      'Lower to full stretch without letting the torso rise to meet the bar.',
    ],
  },
  'barbell-wrist-curl': {
    primary: ['forearms'],
    steps: [
      'Sit and lay the forearms along the thighs, palms up, wrists past the knees.',
      'Let the bar roll to the fingertips for the stretch.',
      'Curl it back up using the wrists only — the forearms never leave the thighs.',
      'Keep the reps slow; the range is small and momentum takes it over.',
    ],
  },

  // ── Dumbbell ───────────────────────────────────────────────────────────────
  'incline-dumbbell-press': {
    primary: ['chest', 'frontDelts'], secondary: ['triceps'],
    steps: [
      'Set the bench near 30° and sit back with a dumbbell on each thigh.',
      'Kick them to the shoulders one at a time, blades pinned back.',
      'Press up and slightly together, stopping short of clanking them.',
      'Lower until the elbows sit just below the shoulders.',
    ],
  },
  'dumbbell-fly': {
    primary: ['chest'], secondary: ['frontDelts'],
    steps: [
      'Lie flat and press the dumbbells over the chest, palms facing each other.',
      'Set a soft bend in the elbows and keep that angle for the whole set.',
      'Open the arms in a wide arc until the chest stretches.',
      'Bring them back along the same arc — squeeze rather than press.',
    ],
  },
  'dumbbell-pullover': {
    primary: ['chest', 'lats'], secondary: ['triceps'],
    steps: [
      'Lie flat holding one dumbbell over the chest in both hands.',
      'Keep the elbows slightly bent and the ribs pulled down.',
      'Lower the weight back over the head until the ribcage stretches.',
      'Pull it back over the chest without letting the back arch off the bench.',
    ],
  },
  'dumbbell-shrug': {
    primary: ['traps'], secondary: ['forearms'],
    steps: [
      'Stand with a dumbbell in each hand, arms hanging straight.',
      'Shrug the shoulders toward the ears, chin tucked.',
      'Pause at the top, then lower to a full stretch.',
      'Do not swing the weights — the only movement is the shoulders.',
    ],
  },
  'dumbbell-front-raise': {
    primary: ['frontDelts'], secondary: ['sideDelts'],
    steps: [
      'Stand with the dumbbells at the thighs, thumbs pointing up.',
      'Raise one or both to eye level with a soft bend in the elbow.',
      'Stop there — higher hands the work to the traps.',
      'Lower slowly and resist the urge to rock the hips into the next rep.',
    ],
  },
  'concentration-curl': {
    primary: ['biceps'], secondary: ['forearms'],
    steps: [
      'Sit and brace the back of the upper arm against the inner thigh.',
      'Let the arm hang straight with the dumbbell just off the floor.',
      'Curl up slowly, turning the little finger slightly inward at the top.',
      'Lower all the way; the braced elbow makes cheating impossible.',
    ],
  },
  'dumbbell-overhead-triceps-extension': {
    primary: ['triceps'],
    steps: [
      'Press one dumbbell overhead, held in both hands.',
      'Point the elbows at the ceiling and keep them there.',
      'Lower behind the head until the forearms meet the biceps.',
      'Extend up without flaring the elbows or letting the ribs lift.',
    ],
  },
  'dumbbell-triceps-kickback': {
    primary: ['triceps'],
    steps: [
      'Hinge to about 45° and pin the upper arm alongside the ribs.',
      'Extend the forearm back until the whole arm is straight.',
      'Squeeze at the top — this movement is all about the end position.',
      'Lower to 90° and keep the upper arm still throughout.',
    ],
  },
  'kettlebell-swing': {
    primary: ['glutes', 'hamstrings'], secondary: ['lowerBack', 'forearms', 'abs'],
    steps: [
      'Stand with the bell a foot ahead, hinge and hike it back between the legs.',
      'Snap the hips forward — the arms only guide it, they never lift.',
      'Let it float to chest height, glutes locked and ribs down.',
      'Send the hips back as it returns and load the next rep with the hinge.',
    ],
  },

  // ── Cable and machine ──────────────────────────────────────────────────────
  'cable-fly': {
    primary: ['chest'], secondary: ['frontDelts'],
    steps: [
      'Set the pulleys at chest height and take a staggered stance.',
      'Hold a soft elbow bend and bring the hands together in front of the chest.',
      'Squeeze for a beat where the hands meet.',
      'Let the arms open back to a stretch, keeping tension on the cables.',
    ],
  },
  'pec-deck': {
    primary: ['chest'], secondary: ['frontDelts'],
    steps: [
      'Set the seat so the handles sit level with the mid-chest.',
      'Press the back flat into the pad and keep the shoulders down.',
      'Bring the arms together and hold the squeeze briefly.',
      'Open back to a stretch without letting the weight stack rest.',
    ],
  },
  'incline-chest-press-machine': {
    primary: ['chest', 'frontDelts'], secondary: ['triceps'],
    steps: [
      'Set the seat so the handles sit level with the upper chest.',
      'Press the back into the pad and pull the shoulders down before the first rep.',
      'Press up and away, stopping just short of locking the elbows.',
      'Return until the hands are back level with the chest, under control.',
    ],
  },
  'inner-thigh-machine': {
    primary: ['adductors'],
    steps: [
      'Sit with the pads against the inside of the knees, back flat on the seat.',
      'Open only as far as the stretch is comfortable — this is the range that hurts people.',
      'Squeeze the knees together and hold for a beat.',
      'Let them open slowly; the return is where the work is.',
    ],
  },
  'seated-calf-raise': {
    primary: ['calves'],
    steps: [
      'Sit with the pad across the thighs and the balls of the feet on the platform.',
      'Drop the heels as far as they will go for a full stretch.',
      'Press up onto the toes and pause at the top.',
      'Keep the reps slow — the calves respond to the stretch, not the bounce.',
    ],
  },
}
