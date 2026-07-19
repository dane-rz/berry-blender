import {
  PERFECT_WINDOW,
  GOOD_WINDOW,
  POINTS,
  BASE_RPM,
  MAX_TIME_SCALE,
} from '../lib/constants'
import type { Berry } from '../api/models/berries'
import type { Grade, Judge, PlayerState, Pokeblock } from '../types/game'

// How far off `target` we are, 0–180°. 350° from 0 is 10, 190° is 170.
// Each seat passes its own target, so it's a param (defaults to the top).
export function angleError(rotation: number, target = 0): number {
  const mod = (((rotation - target) % 360) + 360) % 360
  return mod > 180 ? 360 - mod : mod
}

export function judgePress(rotation: number, target = 0): Judge {
  const err = angleError(rotation, target)
  if (err <= PERFECT_WINDOW) return 'perfect'
  if (err <= GOOD_WINDOW) return 'good'
  return 'miss'
}

interface PokeblockInput {
  berry: Berry | null
  perfect: number
  good: number
  miss: number
  maxRpm: number
}

// Turn a finished run into a Pokéblock. Quality is part accuracy, part how
// fast the blender ended up going.
export function makePokeblock({
  berry,
  perfect,
  good,
  miss,
  maxRpm,
}: PokeblockInput): Pokeblock {
  const hitScore = perfect * POINTS.perfect + good * POINTS.good + miss * POINTS.miss
  const speedBonus = Math.round((maxRpm / (BASE_RPM * MAX_TIME_SCALE)) * 20)
  const raw = Math.max(0, hitScore + speedBonus)

  // Map raw score to a 1–100 "level" and a letter grade.
  const level = Math.min(100, Math.round(raw * 1.4))
  const grade = gradeFor(level)

  return {
    berry,
    level,
    grade,
    flavor: berry?.flavor ?? 'Mystery',
    color: berry?.color ?? 'var(--grape)',
    // The strongest contest stat this block would raise, from the berry.
    stat: berry?.stat ?? 'Sheen',
  }
}

function gradeFor(level: number): Grade {
  if (level >= 85) return 'S'
  if (level >= 70) return 'A'
  if (level >= 50) return 'B'
  if (level >= 30) return 'C'
  return 'D'
}

interface AccuracyInput {
  perfect: number
  good: number
  miss: number
}

/** Total presses that connected (perfect or good). */
export function accuracy({ perfect, good, miss }: AccuracyInput): number {
  const total = perfect + good + miss
  if (total === 0) return 0
  return Math.round(((perfect + good) / total) * 100)
}

/** Running score used for the live scoreboard and ranking. Can go negative. */
export function playerScore({ perfect, good, miss }: AccuracyInput): number {
  return perfect * POINTS.perfect + good * POINTS.good + miss * POINTS.miss
}

// Best player first. Pokéblock level wins; perfect then good hits break ties.
export function rankPlayers(players: PlayerState[]): PlayerState[] {
  return [...players].sort((a, b) => {
    const byLevel = (b.result?.level ?? 0) - (a.result?.level ?? 0)
    if (byLevel) return byLevel
    if (b.perfect !== a.perfect) return b.perfect - a.perfect
    return b.good - a.good
  })
}
