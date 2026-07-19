import { useEffect, useRef } from 'react'
import { AI_PROFILES } from '@/lib/constants'
import { angleError } from '@/utils/scoring'
import type { Difficulty, RotationController } from '@/types/game'

export interface UseAIPlayerParams {
  rotation: RotationController
  /** Only presses while the blend is actually running. */
  active: boolean
  difficulty: Difficulty
  /** This AI's zone on the ring, degrees clockwise from top. */
  target: number
  /** Fires a single press, already bound to this AI's id. */
  onPress: () => void
}

// How often the AI checks the needle — often enough to catch its zone even at
// top speed, not so often it gets expensive.
const SAMPLE_MS = 25

// Runs one AI opponent on the shared blender. It watches the needle, guesses
// where it'll be after its reaction time, and presses when that lines up with
// its zone — sloppily enough that easy ones whiff and hard ones don't. Draws
// nothing; wrap it in a headless <AIController>.
export function useAIPlayer({
  rotation,
  active,
  difficulty,
  target,
  onPress,
}: UseAIPlayerParams): void {
  // Keep the latest press/rotation without re-arming the loop each render.
  const onPressRef = useRef(onPress)
  onPressRef.current = onPress
  const rotationRef = useRef(rotation)
  rotationRef.current = rotation

  useEffect(() => {
    if (!active) return
    const profile = AI_PROFILES[difficulty]

    // One press per lap: arm as the needle nears the zone, disarm once we've
    // pressed (or skipped), re-arm after it's clearly gone past.
    let armed = true
    const pending = new Set<number>()

    const sample = window.setInterval(() => {
      const rot = rotationRef.current
      const rpm = rot.getRpm()
      const degPerMs = (rpm * 360) / 60 / 1000
      const predicted = rot.getRotation() + degPerMs * profile.reaction
      const err = angleError(predicted, target)

      if (err > profile.window) {
        if (err > profile.window + 4) armed = true
        return
      }
      if (!armed) return
      armed = false

      // Sometimes the AI just misses the beat entirely.
      if (Math.random() > profile.hitChance) return

      const slop = (Math.random() * 2 - 1) * profile.jitter
      const delay = Math.max(0, profile.reaction + slop)
      const timer = window.setTimeout(() => {
        pending.delete(timer)
        onPressRef.current()
      }, delay)
      pending.add(timer)
    }, SAMPLE_MS)

    return () => {
      window.clearInterval(sample)
      pending.forEach(window.clearTimeout)
    }
  }, [active, difficulty, target])
}
