// Animated pose components — grouped by source file
// All exports are React components: ({ paused?: boolean }) => JSX.Element

export {
  MountainPoseAnim,
  BirdDogAnim,
  HorsePoseAnim,
  CatCowAnim,
  ForwardFoldAnim,
  HalfForwardBendAnim,
  CobraAnim,
  DownwardDogAnim,
  PlankAnim,
  LowLungeAnim,
} from './days-1-10'

export {
  HalfFrontSplitsAnim,
  HighLungeAnim,
  StandingSideStretchAnim,
  ChairPoseAnim,
  LizardPoseAnim,
  WarriorIAnim,
  WarriorIIAnim,
  WarriorIIIAnim,
  ReverseWarriorAnim,
  ExtendedTriangleAnim,
} from './days-11-20'

export {
  WideLegsForwardFoldAnim,
  EaglePoseAnim,
  KneelingQuadStretchAnim,
  ChildsPoseAnim,
  BoatPoseAnim,
  SupermanPoseAnim,
  BridgePoseAnim,
  BowPoseAnim,
  HeroPoseAnim,
  ReclineBigToeAnim,
} from './days-21-30'

export {
  UpwardSaluteAnim,
  ChaturangaAnim,
  UpwardDogAnim,
  LegsUpWallAnim,
  SupineTwistAnim,
  CorpsePoseAnim,
  DolphinPlankAnim,
  ThreeLeggedDownDogAnim,
  ArmBalanceSplitAnim,
  HandstandAnim,
  WristForearmStretchAnim,
  NeckRollsAnim,
  ThoracicRotationAnim,
  ShoulderCirclesAnim,
  HipFlexorStretchAnim,
  LegSwingsAnim,
  BandPullApartAnim,
} from './other-poses'

// ---------------------------------------------------------------------------
// Pose ID → animated component map
// ---------------------------------------------------------------------------

import type { FC } from 'react'

type PoseAnimComponent = FC<{ paused?: boolean }>

import {
  MountainPoseAnim,
  BirdDogAnim,
  HorsePoseAnim,
  CatCowAnim,
  ForwardFoldAnim,
  HalfForwardBendAnim,
  CobraAnim,
  DownwardDogAnim,
  PlankAnim,
  LowLungeAnim,
} from './days-1-10'

import {
  HalfFrontSplitsAnim,
  HighLungeAnim,
  StandingSideStretchAnim,
  ChairPoseAnim,
  LizardPoseAnim,
  WarriorIAnim,
  WarriorIIAnim,
  WarriorIIIAnim,
  ReverseWarriorAnim,
  ExtendedTriangleAnim,
} from './days-11-20'

import {
  WideLegsForwardFoldAnim,
  EaglePoseAnim,
  KneelingQuadStretchAnim,
  ChildsPoseAnim,
  BoatPoseAnim,
  SupermanPoseAnim,
  BridgePoseAnim,
  BowPoseAnim,
  HeroPoseAnim,
  ReclineBigToeAnim,
} from './days-21-30'

import {
  UpwardSaluteAnim,
  ChaturangaAnim,
  UpwardDogAnim,
  LegsUpWallAnim,
  SupineTwistAnim,
  CorpsePoseAnim,
  DolphinPlankAnim,
  ThreeLeggedDownDogAnim,
  ArmBalanceSplitAnim,
  HandstandAnim,
  WristForearmStretchAnim,
  NeckRollsAnim,
  ThoracicRotationAnim,
  ShoulderCirclesAnim,
  HipFlexorStretchAnim,
  LegSwingsAnim,
  BandPullApartAnim,
} from './other-poses'

export const POSE_ANIM_MAP: Record<string, PoseAnimComponent> = {
  // Day 1–30
  'mountain-pose':              MountainPoseAnim,
  'bird-dog':                   BirdDogAnim,
  'horse-pose':                 HorsePoseAnim,
  'cat-cow':                    CatCowAnim,
  'standing-forward-fold':      ForwardFoldAnim,
  'standing-half-forward-bend': HalfForwardBendAnim,
  'cobra':                      CobraAnim,
  'downward-dog':               DownwardDogAnim,
  'plank':                      PlankAnim,
  'plank-pose':                 PlankAnim,
  'low-lunge':                  LowLungeAnim,
  'half-front-splits':          HalfFrontSplitsAnim,
  'high-lunge':                 HighLungeAnim,
  'standing-side-stretch':      StandingSideStretchAnim,
  'chair-pose':                 ChairPoseAnim,
  'lizard-pose':                LizardPoseAnim,
  'warrior-1':                  WarriorIAnim,
  'warrior-2':                  WarriorIIAnim,
  'warrior-3':                  WarriorIIIAnim,
  'reverse-warrior':            ReverseWarriorAnim,
  'extended-triangle':          ExtendedTriangleAnim,
  'triangle-pose':              ExtendedTriangleAnim,
  'wide-legged-forward-fold':   WideLegsForwardFoldAnim,
  'eagle-pose':                 EaglePoseAnim,
  'kneeling-quad-stretch':      KneelingQuadStretchAnim,
  'childs-pose':                ChildsPoseAnim,
  'boat-pose':                  BoatPoseAnim,
  'superman-pose':              SupermanPoseAnim,
  'bridge-pose':                BridgePoseAnim,
  'bow-pose':                   BowPoseAnim,
  'hero-pose':                  HeroPoseAnim,
  'reclining-big-toe':          ReclineBigToeAnim,
  // Sun Sal / sequence helpers
  'sun-salutation-chaturanga':  ChaturangaAnim,
  'chaturanga':                 ChaturangaAnim,
  'upward-dog':                 UpwardDogAnim,
  'upward-facing-dog':          UpwardDogAnim,
  'upward-salute':              UpwardSaluteAnim,
  // Restorative / supine
  'legs-up-wall':               LegsUpWallAnim,
  'supine-twist':               SupineTwistAnim,
  'corpse-pose':                CorpsePoseAnim,
  // Core / advanced
  'dolphin-plank':              DolphinPlankAnim,
  'three-legged-down-dog':      ThreeLeggedDownDogAnim,
  'arm-balance-split':          ArmBalanceSplitAnim,
  'handstand-wall':             HandstandAnim,
  // Warmup / recovery
  'wrist-forearm-stretch':      WristForearmStretchAnim,
  'neck-rolls':                 NeckRollsAnim,
  'thoracic-rotation':          ThoracicRotationAnim,
  'shoulder-circles':           ShoulderCirclesAnim,
  'hip-flexor-stretch':         HipFlexorStretchAnim,
  'leg-swings':                 LegSwingsAnim,
  'band-pull-apart':            BandPullApartAnim,
}

export function hasPoseAnim(poseId: string): boolean {
  return poseId in POSE_ANIM_MAP
}
