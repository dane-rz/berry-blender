import type { CSSProperties } from 'react'
import { useBerries } from '@/api/queries/berries'
import { DIFFICULTIES, MAX_AI } from '@/lib/constants'
import type { Berry } from '@/api/models/berries'
import type { Difficulty } from '@/types/game'
import styles from './BerryPicker.module.css'

const AI_COUNTS = Array.from({ length: MAX_AI + 1 }, (_, n) => n)

interface BerryPickerProps {
  selectedId?: string
  aiCount: number
  difficulty: Difficulty
  onSelect: (berry: Berry) => void
  onAiCountChange: (count: number) => void
  onDifficultyChange: (difficulty: Difficulty) => void
  onStart: () => void
}

export default function BerryPicker({
  selectedId,
  aiCount,
  difficulty,
  onSelect,
  onAiCountChange,
  onDifficultyChange,
  onStart,
}: BerryPickerProps) {
  const { data: berries, isPending, isError, refetch } = useBerries()

  if (isPending) {
    return (
      <div className={`${styles.picker} ${styles.state}`}>
        <div className={styles.spinner} aria-hidden="true" />
        <p>Stocking the berry crate…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`${styles.picker} ${styles.state}`}>
        <p>The berry crate didn't arrive.</p>
        <button className="btn btn--ghost" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className={styles.picker}>
      <p className={styles.prompt}>Pick a berry to blend</p>
      <ul className={styles.grid}>
        {berries.map((berry) => {
          const active = berry.id === selectedId
          return (
            <li key={berry.id}>
              <button
                type="button"
                className={styles.berry}
                data-active={active}
                style={{ '--berry': berry.color } as CSSProperties}
                onClick={() => onSelect(berry)}
              >
                <span className={styles.blob} />
                <span className={styles.name}>{berry.name}</span>
                <span className={styles.flavor}>{berry.flavor}</span>
                {berry.rarity !== 'common' && (
                  <span className={styles.rarity}>{berry.rarity}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <div className={styles.setup}>
        <div className={styles.field}>
          <span className={styles.setupLabel}>Opponents</span>
          <div className={styles.segment}>
            {AI_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                data-active={aiCount === n}
                onClick={() => onAiCountChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {aiCount > 0 && (
          <div className={styles.field}>
            <span className={styles.setupLabel}>Difficulty</span>
            <div className={styles.segment}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  data-active={difficulty === d}
                  onClick={() => onDifficultyChange(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        className={`btn btn--zest ${styles.start}`}
        onClick={onStart}
        disabled={!selectedId}
      >
        {selectedId ? 'Start blending' : 'Choose a berry first'}
      </button>
    </div>
  )
}
