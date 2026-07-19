import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import {
  ROUND_SECONDS,
  SPEED_STEP,
  MIN_TIME_SCALE,
  MAX_TIME_SCALE,
  HUMAN_ID,
  SEAT_ANGLES,
  POINTS,
} from '@/lib/constants'
import { judgePress, makePokeblock, rankPlayers } from '@/utils/scoring'
import type { Berry } from '@/api/models/berries'
import type {
  Difficulty,
  GameAction,
  GameState,
  PlayerState,
  RotationController,
} from '@/types/game'

function makePlayer(
  id: number,
  kind: PlayerState['kind'],
  name: string,
  difficulty: Difficulty | null,
): PlayerState {
  return {
    id,
    kind,
    name,
    seat: id,
    target: SEAT_ANGLES[id] ?? 0,
    difficulty,
    perfect: 0,
    good: 0,
    miss: 0,
    combo: 0,
    bestCombo: 0,
    lastJudge: null,
    result: null,
  }
}

// Seats fill up counter-clockwise: human first (bottom-left), then the AIs.
function makePlayers(aiCount: number, difficulty: Difficulty): PlayerState[] {
  const players = [makePlayer(HUMAN_ID, 'human', 'You', null)]
  for (let i = 1; i <= aiCount; i++) {
    players.push(makePlayer(i, 'ai', `AI ${i + 1}`, difficulty))
  }
  return players
}

// Finite states: selecting → countdown → blending → results
const initialState: GameState = {
  status: 'selecting',
  berry: null,
  aiCount: 0,
  difficulty: 'medium',
  countdown: 3,
  timeLeft: ROUND_SECONDS,
  rpm: 0,
  maxRpm: 0,
  players: makePlayers(0, 'medium'),
  winnerId: null,
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, berry: action.berry }

    case 'SET_AI_COUNT':
      return {
        ...state,
        aiCount: action.count,
        players: makePlayers(action.count, state.difficulty),
      }

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.difficulty,
        players: makePlayers(state.aiCount, action.difficulty),
      }

    case 'START':
      if (!state.berry) return state
      return {
        ...initialState,
        berry: state.berry,
        aiCount: state.aiCount,
        difficulty: state.difficulty,
        players: makePlayers(state.aiCount, state.difficulty),
        status: 'countdown',
      }

    case 'COUNTDOWN_TICK':
      return { ...state, countdown: state.countdown - 1 }

    case 'BEGIN_BLEND':
      return { ...state, status: 'blending', countdown: 0 }

    case 'PRESS': {
      if (state.status !== 'blending') return state
      const { playerId, judge, rpm } = action
      const players = state.players.map((p) => {
        if (p.id !== playerId) return p
        const combo = judge === 'miss' ? 0 : p.combo + 1
        return {
          ...p,
          perfect: p.perfect + (judge === 'perfect' ? 1 : 0),
          good: p.good + (judge === 'good' ? 1 : 0),
          miss: p.miss + (judge === 'miss' ? 1 : 0),
          combo,
          bestCombo: Math.max(p.bestCombo, combo),
          lastJudge: { type: judge, id: (p.lastJudge?.id ?? 0) + 1 },
        }
      })
      // RPM belongs to the shared blender, not any one player.
      return { ...state, players, rpm, maxRpm: Math.max(state.maxRpm, rpm) }
    }

    case 'TICK': {
      const timeLeft = Math.max(0, state.timeLeft - action.dt)
      return { ...state, timeLeft }
    }

    case 'FINISH': {
      const players = state.players.map((p) => ({
        ...p,
        result: makePokeblock({
          berry: state.berry,
          perfect: p.perfect,
          good: p.good,
          miss: p.miss,
          maxRpm: state.maxRpm,
        }),
      }))
      return {
        ...state,
        status: 'results',
        timeLeft: 0,
        players,
        winnerId: rankPlayers(players)[0]?.id ?? null,
      }
    }

    case 'RESET':
      return {
        ...initialState,
        berry: state.berry,
        aiCount: state.aiCount,
        difficulty: state.difficulty,
        players: makePlayers(state.aiCount, state.difficulty),
      }

    default:
      return state
  }
}

export interface UseBlenderGameResult {
  state: GameState
  human: PlayerState
  aiPlayers: PlayerState[]
  standings: PlayerState[]
  selectBerry: (berry: Berry) => void
  setAiCount: (count: number) => void
  setDifficulty: (difficulty: Difficulty) => void
  start: () => void
  reset: () => void
  press: (playerId: number, target: number) => void
}

export function useBlenderGame(rotation: RotationController): UseBlenderGameResult {
  const [state, dispatch] = useReducer(reducer, initialState)
  const statusRef = useRef(state.status)
  statusRef.current = state.status

  // ── Countdown: 3 → 2 → 1 → GO ────────────────────────────
  useEffect(() => {
    if (state.status !== 'countdown') return
    rotation.reset()
    const id = setInterval(() => dispatch({ type: 'COUNTDOWN_TICK' }), 700)
    return () => clearInterval(id)
  }, [state.status, rotation])

  useEffect(() => {
    if (state.status === 'countdown' && state.countdown <= 0) {
      dispatch({ type: 'BEGIN_BLEND' })
    }
  }, [state.status, state.countdown])

  useEffect(() => {
    if (state.status !== 'blending') return
    console.log('Game Start', {
      berry: state.berry?.name,
      players: state.players.length,
      ai: state.aiCount,
      difficulty: state.difficulty,
    })
  }, [state.status, state.berry?.name, state.players.length, state.aiCount, state.difficulty])

  // ── Blend loop: spin + round timer ───────────────────────
  useEffect(() => {
    if (state.status !== 'blending') return
    rotation.play()
    let raf: number
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      dispatch({ type: 'TICK', dt })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      rotation.pause()
    }
  }, [state.status, rotation])

  useEffect(() => {
    if (state.status === 'blending' && state.timeLeft <= 0) {
      dispatch({ type: 'FINISH' })
    }
  }, [state.status, state.timeLeft])

  useEffect(() => {
    if (state.status !== 'results') return
    console.log('Game End', {
      winner: state.winnerId,
      scores: state.players.map((p) => ({
        player: p.id,
        perfect: p.perfect,
        good: p.good,
        miss: p.miss,
      })),
    })
  }, [state.status, state.players, state.winnerId])

  // ── Actions ──────────────────────────────────────────────
  const selectBerry = useCallback(
    (berry: Berry) => dispatch({ type: 'SELECT', berry }),
    [],
  )
  const setAiCount = useCallback(
    (count: number) => dispatch({ type: 'SET_AI_COUNT', count }),
    [],
  )
  const setDifficulty = useCallback(
    (difficulty: Difficulty) => dispatch({ type: 'SET_DIFFICULTY', difficulty }),
    [],
  )
  const start = useCallback(() => dispatch({ type: 'START' }), [])
  const reset = useCallback(() => {
    rotation.reset()
    dispatch({ type: 'RESET' })
  }, [rotation])

  // Every press — human or AI — reads the shared pointer against that player's
  // own zone, nudges the one blender's speed, and records the outcome.
  const press = useCallback(
    (playerId: number, target: number) => {
      if (statusRef.current !== 'blending') return
      const angle = rotation.getRotation()
      const judge = judgePress(angle, target)

      const next = Math.min(
        MAX_TIME_SCALE,
        Math.max(MIN_TIME_SCALE, rotation.getTimeScale() * SPEED_STEP[judge]),
      )
      rotation.setTimeScale(next)
      if (judge !== 'miss') rotation.pulse()

      dispatch({ type: 'PRESS', playerId, judge, rpm: rotation.getRpm() })

      console.log('Press', { player: playerId, zone: target, angle: +angle.toFixed(1), judge, points: POINTS[judge] })
    },
    [rotation],
  )

  const human = state.players.find((p) => p.kind === 'human') ?? state.players[0]
  const aiPlayers = useMemo(
    () => state.players.filter((p) => p.kind === 'ai'),
    [state.players],
  )
  const standings = useMemo(() => rankPlayers(state.players), [state.players])

  return {
    state,
    human,
    aiPlayers,
    standings,
    selectBerry,
    setAiCount,
    setDifficulty,
    start,
    reset,
    press,
  }
}
