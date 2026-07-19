import type { Berry } from '../api/models/berries'

export type Judge = 'perfect' | 'good' | 'miss'

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D'

export type GameStatus = 'selecting' | 'countdown' | 'blending' | 'results'

/** AI skill preset. Solo play uses none. */
export type Difficulty = 'easy' | 'medium' | 'hard'

/** Who is behind a seat around the blender. */
export type PlayerKind = 'human' | 'ai'

export interface Pokeblock {
  berry: Berry | null
  level: number
  grade: Grade
  flavor: string
  color: string
  stat: string
}

/** Running tallies for a single blend run. */
export interface GameStats {
  perfect: number
  good: number
  miss: number
  bestCombo: number
  maxRpm: number
}

/** A judgement flash marker — `id` bumps so the UI can retrigger the animation. */
export interface LastJudge {
  type: Judge
  id: number
}

// One player around the shared blender. Everyone drives the same spin but hits
// their own zone and keeps their own score.
export interface PlayerState {
  id: number
  kind: PlayerKind
  name: string
  /** Seat index 0..3 — drives the on-ring position (0 = human, bottom-left). */
  seat: number
  /** This seat's target angle on the ring, degrees clockwise from top. */
  target: number
  /** AI preset, or null for the human. */
  difficulty: Difficulty | null
  perfect: number
  good: number
  miss: number
  combo: number
  bestCombo: number
  lastJudge: LastJudge | null
  result: Pokeblock | null
}

export interface GameState {
  status: GameStatus
  berry: Berry | null
  /** Number of AI opponents (0..MAX_AI), chosen on the berry screen. */
  aiCount: number
  /** Difficulty applied to every AI opponent. */
  difficulty: Difficulty
  countdown: number
  timeLeft: number
  /** Live RPM of the single shared blender. */
  rpm: number
  /** Fastest the shared blender reached this run. */
  maxRpm: number
  players: PlayerState[]
  winnerId: number | null
}

export type GameAction =
  | { type: 'SELECT'; berry: Berry }
  | { type: 'SET_AI_COUNT'; count: number }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'START' }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'BEGIN_BLEND' }
  | { type: 'PRESS'; playerId: number; judge: Judge; rpm: number }
  | { type: 'TICK'; dt: number }
  | { type: 'FINISH' }
  | { type: 'RESET' }

// The imperative handle for the GSAP needle. useBlenderGame and Blender both go
// through this so neither has to poke at GSAP directly.
export interface RotationController {
  pointerRef: React.RefObject<HTMLDivElement | null>
  getRotation: () => number
  getRpm: () => number
  setTimeScale: (scale: number) => void
  getTimeScale: () => number
  play: () => void
  pause: () => void
  reset: () => void
  pulse: (scale?: number) => void
}
