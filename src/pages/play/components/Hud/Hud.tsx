import { ROUND_SECONDS } from '@/lib/constants'
import styles from './Hud.module.css'

interface HudProps {
  timeLeft: number
  combo: number
  bestCombo: number
}

export default function Hud({ timeLeft, combo, bestCombo }: HudProps) {
  const timePct = (timeLeft / ROUND_SECONDS) * 100

  return (
    <div className={styles.hud}>
      <div className={styles.stat}>
        <span className={styles.label}>Time</span>
        <span className={styles.value}>{Math.ceil(timeLeft)}s</span>
        <div className={styles.bar}>
          <div
            className={`${styles.barFill} ${styles.barFillTime}`}
            style={{ width: `${timePct}%` }}
          />
        </div>
      </div>

      <div className={styles.combo} data-active={combo > 1}>
        <span className={styles.comboNum}>{combo}</span>
        <span className={styles.label}>combo</span>
        {bestCombo > 0 && <span className={styles.best}>best {bestCombo}</span>}
      </div>
    </div>
  )
}
