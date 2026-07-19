import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { accuracy } from '@/utils/scoring'
import type { GameStats, Grade, PlayerState, Pokeblock } from '@/types/game'
import styles from './Results.module.css'

const GRADE_BLURB: Record<Grade, string> = {
  S: 'A flawless blend. The judges are speechless.',
  A: 'Contest-hall quality. Very nicely done.',
  B: 'A solid, respectable block.',
  C: 'Edible. Barely.',
  D: 'Perhaps stick to buying them.',
}

interface ResultsProps {
  result: Pokeblock
  stats: GameStats
  /** Ranked players, best first. Omitted for solo runs. */
  standings?: PlayerState[]
  winnerId?: number | null
  humanId?: number
  onPlayAgain: () => void
  onChangeBerry: () => void
}

export default function Results({
  result,
  stats,
  standings,
  winnerId,
  humanId,
  onPlayAgain,
  onChangeBerry,
}: ResultsProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!cardRef.current) return
      const items = cardRef.current.querySelectorAll('[data-reveal]')
      gsap.from(cardRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(2)',
      })
      gsap.from(items, {
        y: 14,
        opacity: 0,
        duration: 0.35,
        stagger: 0.07,
        delay: 0.15,
        ease: 'power2.out',
      })
    },
    { scope: cardRef },
  )

  const acc = accuracy(stats)
  const contest = standings && standings.length > 1
  const youWon = winnerId === humanId
  const winnerName = standings?.find((p) => p.id === winnerId)?.name

  return (
    <div className={styles.results} ref={cardRef}>
      {contest && (
        <span className={styles.verdict} data-win={youWon} data-reveal>
          {youWon ? 'You win!' : `${winnerName} wins`}
        </span>
      )}

      <div
        className={styles.block}
        data-reveal
        style={{ '--block': result.color } as CSSProperties}
      >
        <span className={styles.grade}>{result.grade}</span>
      </div>

      <h2 className={styles.title} data-reveal>
        {result.flavor} Pokéblock
      </h2>
      <p className={styles.blurb} data-reveal>
        {GRADE_BLURB[result.grade]}
      </p>

      <dl className={styles.stats} data-reveal>
        <div>
          <dt>Level</dt>
          <dd>{result.level}</dd>
        </div>
        <div>
          <dt>Raises</dt>
          <dd>{result.stat}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{acc}%</dd>
        </div>
        <div>
          <dt>Max RPM</dt>
          <dd>{Math.round(stats.maxRpm)}</dd>
        </div>
      </dl>

      <div className={styles.tallyRow} data-reveal>
        <span className={`${styles.tally} ${styles.tallyPerfect}`}>
          {stats.perfect} perfect
        </span>
        <span className={`${styles.tally} ${styles.tallyGood}`}>{stats.good} good</span>
        <span className={`${styles.tally} ${styles.tallyMiss}`}>{stats.miss} miss</span>
        <span className={styles.tally}>best combo {stats.bestCombo}</span>
      </div>

      {contest && (
        <ol className={styles.board} data-reveal>
          {standings.map((p, i) => (
            <li key={p.id} data-winner={p.id === winnerId} data-you={p.id === humanId}>
              <span className={styles.rank}>{i + 1}</span>
              <span className={styles.pname}>{p.name}</span>
              <span className={styles.pgrade}>{p.result?.grade}</span>
              <span className={styles.plevel}>Lv {p.result?.level ?? 0}</span>
            </li>
          ))}
        </ol>
      )}

      <div className={styles.actions} data-reveal>
        <button className="btn btn--zest" onClick={onPlayAgain}>
          Blend again
        </button>
        <button className="btn btn--ghost" onClick={onChangeBerry}>
          Change berry
        </button>
      </div>
    </div>
  )
}
