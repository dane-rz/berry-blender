import type { Difficulty, Judge } from '../types/game'

// ── Game tuning ─────────────────────────────────────────────
// All the "feel" lives here. Tweak away.

// How close (in degrees) counts as a hit.
export const PERFECT_WINDOW = 10
export const GOOD_WINDOW = 26

// Spin speed. At timeScale 1 a lap takes BASE_SEC_PER_REV seconds.
export const BASE_SEC_PER_REV = 2.4
export const BASE_RPM = 60 / BASE_SEC_PER_REV // 25 rpm at timeScale 1

// How each judgement nudges the speed (multiplies timeScale).
export const SPEED_STEP: Record<Judge, number> = {
  perfect: 1.07,
  good: 1.025,
  miss: 0.93,
}
export const MIN_TIME_SCALE = 0.7
export const MAX_TIME_SCALE = 4.0

// A round lasts this many seconds.
export const ROUND_SECONDS = 25

// Points awarded per judgement (drives final Pokéblock quality).
export const POINTS: Record<Judge, number> = {
  perfect: 3,
  good: 1,
  miss: -1,
}

// Judgement metadata for UI (label + CSS custom property name).
export const JUDGEMENTS: Record<Judge, { label: string; color: string }> = {
  perfect: { label: 'Perfect!', color: 'var(--judge-perfect)' },
  good: { label: 'Good', color: 'var(--judge-good)' },
  miss: { label: 'Miss', color: 'var(--judge-miss)' },
}

// ── Players ─────────────────────────────────────────────────
// One human plus up to three AI opponents share a single blender.
export const HUMAN_ID = 0
export const MAX_AI = 3

// Each seat's zone of the ring — the diagonal under its corner card
// (bl, br, tr, tl), in degrees clockwise from top. Only the active one's drawn.
export const SEAT_ANGLES = [225, 135, 45, 315]

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard']

// How each AI "feels". Not the judging windows (those stay fixed and fair) —
// just when an AI decides to press and how sloppy it is about it:
//   hitChance — odds it bothers to go for its zone on a given lap
//   window    — how far out (deg) it'll commit
//   reaction  — delay from "now" to the press (ms)
//   jitter    — random slop on that delay (ms). More = more whiffs,
//               and it stings more once the blender's flying.
export interface AIProfile {
  hitChance: number
  window: number
  reaction: number
  jitter: number
}

export const AI_PROFILES: Record<Difficulty, AIProfile> = {
  easy: { hitChance: 0.55, window: GOOD_WINDOW * 1.4, reaction: 130, jitter: 90 },
  medium: { hitChance: 0.82, window: GOOD_WINDOW, reaction: 70, jitter: 45 },
  hard: { hitChance: 0.96, window: PERFECT_WINDOW * 1.6, reaction: 25, jitter: 14 },
}
