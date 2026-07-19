import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BASE_SEC_PER_REV, BASE_RPM } from '@/lib/constants'
import type { RotationController } from '@/types/game'

// The spinning needle, GSAP dependent instead of React state.
//
// It moves every frame as an endless tween, and we just peek at where it's pointing when the
// player presses. React only ever hears the result — perfect / good / miss.
//
// Made lazily on first use, since the needle only exists once play starts.
export function useBlenderRotation(): RotationController {
  const pointerRef = useRef<HTMLDivElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const controllerRef = useRef<RotationController | null>(null)

  // Clean up the tween on unmount.
  useEffect(() => {
    return () => {
      tweenRef.current?.kill()
      tweenRef.current = null
    }
  }, [])

  // Build the handle once so its identity stays stable across renders.
  if (!controllerRef.current) {
    const getElement = () => pointerRef.current

    // Make the endless spin, and rebuild it if it's gone stale. The Blender
    // unmounts between rounds, so on "Blend again" pointerRef points at a fresh
    // element — a tween still bound to the old (detached) node would spin
    // something that's no longer on screen.
    const ensureTween = (): gsap.core.Tween | null => {
      const el = getElement()
      if (!el) return tweenRef.current
      if (tweenRef.current?.targets()[0] === el) return tweenRef.current
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(el, {
        rotation: '+=360',
        duration: BASE_SEC_PER_REV,
        ease: 'none',
        repeat: -1,
        paused: true,
      })
      return tweenRef.current
    }

    controllerRef.current = {
      pointerRef,

      /** Current rotation of the pointer in degrees. */
      getRotation() {
        const el = getElement()
        if (!el) return 0
        return Number(gsap.getProperty(el, 'rotation'))
      },

      /** Live RPM derived from the tween's timeScale. */
      getRpm() {
        const scale = tweenRef.current?.timeScale() ?? 1
        return BASE_RPM * scale
      },

      setTimeScale(scale: number) {
        ensureTween()?.timeScale(scale)
      },

      getTimeScale() {
        return tweenRef.current?.timeScale() ?? 1
      },

      play() {
        ensureTween()?.play()
      },

      pause() {
        tweenRef.current?.pause()
      },

      reset() {
        tweenRef.current?.pause()
        tweenRef.current?.timeScale(1)
        const el = getElement()
        if (el) gsap.set(el, { rotation: 0 })
      },

      /** Quick visual pulse on the pointer for hit feedback. */
      pulse(scale = 1.12) {
        const el = getElement()
        if (!el) return
        gsap.fromTo(el, { scale }, { scale: 1, duration: 0.25, ease: 'back.out(3)' })
      },
    }
  }

  return controllerRef.current
}
