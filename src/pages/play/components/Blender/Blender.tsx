import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { PERFECT_WINDOW, GOOD_WINDOW, JUDGEMENTS } from '@/lib/constants'
import type { GameStatus, LastJudge, RotationController } from '@/types/game'
import styles from './Blender.module.css'

// Paints the active player's timing zone: a bright perfect core with a gold
// "good" band either side. `from ${target}deg` spins the whole pattern round
// so the zone sits over that seat's corner. Only ever drawn for one player.
function targetBand(target: number): string {
  const p = PERFECT_WINDOW
  const g = GOOD_WINDOW
  const perfect = 'var(--judge-perfect)'
  const good = 'var(--judge-good)'
  const off = 'rgba(255,255,255,0.05)'
  return `conic-gradient(
    from ${target}deg,
    ${perfect} 0deg ${p}deg,
    ${good} ${p}deg ${g}deg,
    ${off} ${g}deg ${360 - g}deg,
    ${good} ${360 - g}deg ${360 - p}deg,
    ${perfect} ${360 - p}deg 360deg
  )`
}

interface BlenderProps {
  pointerRef: RotationController['pointerRef']
  berryColor?: string
  lastJudge?: LastJudge | null
  countdown?: number
  status: GameStatus
  /** Active player's zone, degrees clockwise from top. */
  target?: number
  /** Every occupied seat's angle — one inward arrow drawn per seat. */
  seatAngles?: number[]
  /** Live RPM of the shared blender, shown on the LCD. */
  rpm?: number
  onPress: () => void
}

export default function Blender({
  pointerRef,
  berryColor = 'var(--grape)',
  lastJudge = null,
  countdown = 0,
  status,
  target = 0,
  seatAngles = [],
  rpm = 0,
  onPress,
}: BlenderProps) {
  const judgeRef = useRef<HTMLSpanElement>(null)

  // Flash the floating judgement text whenever a new press is recorded.
  useGSAP(
    () => {
      if (!lastJudge || !judgeRef.current) return
      gsap.fromTo(
        judgeRef.current,
        { y: 8, scale: 0.6, opacity: 0 },
        {
          y: -14,
          scale: 1,
          opacity: 1,
          duration: 0.18,
          ease: 'back.out(3)',
          onComplete: () =>
            gsap.to(judgeRef.current, {
              opacity: 0,
              y: -26,
              duration: 0.35,
              delay: 0.12,
            }),
        },
      )
    },
    { dependencies: [lastJudge?.id] },
  )

  const showCountdown = status === 'countdown'
  const rpmDisplay = String(Math.round(rpm)).padStart(3, '0')

  return (
    <button
      type="button"
      className={styles.blender}
      onPointerDown={onPress}
      aria-label="Blend — press to blend"
    >
      {/* machine chrome */}
      <span className={styles.handle} aria-hidden />
      <span className={`${styles.bolt} ${styles.boltTL}`} aria-hidden />
      <span className={`${styles.bolt} ${styles.boltTR}`} aria-hidden />
      <span className={`${styles.bolt} ${styles.boltBL}`} aria-hidden />
      <span className={`${styles.bolt} ${styles.boltBR}`} aria-hidden />

      {/* the round blending chamber — positioning context for everything below */}
      <div className={styles.chamber}>
        {/* timing band — one zone, over the active player's corner */}
        <div className={styles.band} style={{ background: targetBand(target) }} />
        <div className={styles.bandMask} />

        {/* one inward arrow per occupied seat; the active one is highlighted */}
        {seatAngles.map((angle, i) => (
          <div
            key={i}
            className={styles.seatRing}
            style={{ transform: `rotate(${angle}deg)` }}
            data-active={angle === target}
            aria-hidden
          >
            <span className={styles.seatArrow} />
          </div>
        ))}

        {/* marker tab, rotated round the bowl to sit on that zone */}
        <div className={styles.markerRing} style={{ transform: `rotate(${target}deg)` }}>
          <div className={styles.marker} />
        </div>

        {/* rotating blade — pivots at chamber center, tip points up at rotation 0 */}
        <div className={styles.pointer} ref={pointerRef}>
          <span className={styles.blade} />
          <span className={styles.bladeCap} />
        </div>

        {/* center hub tinted by the selected berry */}
        <div className={styles.hub} style={{ '--hub': berryColor } as CSSProperties}>
          {showCountdown ? (
            <span className={styles.countdown}>{countdown > 0 ? countdown : 'GO'}</span>
          ) : (
            <span className={styles.hubDot} />
          )}
        </div>

        {/* floating judgement */}
        {lastJudge && (
          <span
            ref={judgeRef}
            className={styles.judge}
            style={{ color: JUDGEMENTS[lastJudge.type].color, opacity: 0 }}
          >
            {JUDGEMENTS[lastJudge.type].label}
          </span>
        )}
      </div>

      {/* recessed RPM readout */}
      <div className={styles.lcd} aria-hidden>
        <span className={styles.lcdDigits}>{rpmDisplay}</span>
        <span className={styles.lcdLabel}>rpm</span>
      </div>
    </button>
  )
}
