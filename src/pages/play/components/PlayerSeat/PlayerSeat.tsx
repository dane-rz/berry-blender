import { JUDGEMENTS } from '@/lib/constants'
import { playerScore } from '@/utils/scoring'
import type { PlayerState } from '@/types/game'
import styles from './PlayerSeat.module.css'

// Seat 0 (human) sits bottom-left; the rest wrap counter-clockwise.
const CORNERS = ['bl', 'br', 'tr', 'tl'] as const

interface PlayerSeatProps {
  player: PlayerState
}

export default function PlayerSeat({ player }: PlayerSeatProps) {
  const { name, kind, seat, difficulty, perfect, good, miss, combo, lastJudge } = player
  const score = Math.max(0, playerScore(player))

  return (
    <div
      className={styles.seat}
      data-corner={CORNERS[seat] ?? 'bl'}
      data-kind={kind}
      data-hot={combo > 1}
    >
      <div className={styles.head}>
        <span className={styles.name}>{name}</span>
        {difficulty && <span className={styles.diff}>{difficulty}</span>}
      </div>

      <span className={styles.score}>{score}</span>

      <div className={styles.tallies}>
        <span className={styles.perfect}>{perfect}</span>
        <span className={styles.good}>{good}</span>
        <span className={styles.miss}>{miss}</span>
      </div>

      {combo > 1 && <span className={styles.combo}>{combo}× combo</span>}

      {/* Re-keying on the judge id restarts the CSS pop for each new hit. */}
      {lastJudge && (
        <span
          key={lastJudge.id}
          className={styles.flash}
          style={{ color: JUDGEMENTS[lastJudge.type].color }}
        >
          {JUDGEMENTS[lastJudge.type].label}
        </span>
      )}
    </div>
  )
}
