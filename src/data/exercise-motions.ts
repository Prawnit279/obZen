/**
 * Movement animations, one per exercise.
 *
 * Each entry gives the figure's joint positions at a few key moments of the
 * rep; the renderer interpolates between them and plays the loop forwards and
 * back. Side-on view unless noted, facing right, ground at y=140 in a
 * 200×150 canvas.
 *
 * Data rather than 40 hand-drawn animations: every movement gets its own
 * distinct path while the figure itself stays consistent.
 */

export type Point = [number, number]

export interface Pose {
  head: Point
  neck: Point
  hip: Point
  knee: Point
  ankle: Point
  elbow: Point
  hand: Point
}

export interface ExerciseMotion {
  /** Key moments of one rep, start first. */
  poses: Pose[]
  durationSec: number
  caption: string
  equipment: 'bar' | 'dumbbell' | 'fixedBar' | 'none'
  /** Draw the floor line (default true). */
  ground?: boolean
  /** Bench, box or seat the lifter is on. */
  bench?: { x: number; y: number; width: number }
  /**
   * Force the profile view. Hinges and rows travel front-to-back, which is
   * exactly the axis a front-on figure cannot show — the hip angle that makes
   * a deadlift a deadlift disappears head-on. Lying movements pick the profile
   * view from their own geometry and do not need this.
   */
  view?: 'side'
}

import { EXERCISE_MOTIONS } from './exercise-motions-data'

export { EXERCISE_MOTIONS }

/** Motion for an exercise id, if one exists. */
export function motionFor(exerciseId: string): ExerciseMotion | undefined {
  return EXERCISE_MOTIONS[exerciseId]
}
