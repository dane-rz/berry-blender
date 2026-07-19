import { useEffect } from 'react'
import { HUMAN_ID } from '@/lib/constants'
import { useBlenderRotation } from './hooks/useBlenderRotation'
import { useBlenderGame } from './hooks/useBlenderGame'
import { Blender, BerryPicker, Hud, Results, PlayerSeat, AIController } from './components'
import styles from './PlayPage.module.css'

export default function PlayPage() {
  const rotation = useBlenderRotation()
  const game = useBlenderGame(rotation)
  const { state, human, aiPlayers, standings, press } = game
  const { status } = state

  // Spacebar is the human's press.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        press(HUMAN_ID, human.target)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press, human.target])

  const playing = status === 'countdown' || status === 'blending'
  const multiplayer = aiPlayers.length > 0

  return (
    <section className={`${styles.play} container`}>
      {status === 'selecting' && (
        <BerryPicker
          selectedId={state.berry?.id}
          aiCount={state.aiCount}
          difficulty={state.difficulty}
          onSelect={game.selectBerry}
          onAiCountChange={game.setAiCount}
          onDifficultyChange={game.setDifficulty}
          onStart={game.start}
        />
      )}

      {playing && (
        <div className={styles.stage}>
          {status === 'blending' && (
            <Hud
              timeLeft={state.timeLeft}
              combo={human.combo}
              bestCombo={human.bestCombo}
            />
          )}

          <div className={styles.arena} data-multiplayer={multiplayer}>
            {multiplayer && (
              <div className={styles.seats}>
                {state.players.map((p) => (
                  <PlayerSeat key={p.id} player={p} />
                ))}
              </div>
            )}

            <Blender
              pointerRef={rotation.pointerRef}
              berryColor={state.berry?.color}
              lastJudge={human.lastJudge}
              countdown={state.countdown}
              status={status}
              target={human.target}
              seatAngles={state.players.map((p) => p.target)}
              rpm={state.rpm}
              onPress={() => press(HUMAN_ID, human.target)}
            />
          </div>

          {status === 'blending' &&
            aiPlayers.map((p) => (
              <AIController
                key={p.id}
                rotation={rotation}
                active
                difficulty={p.difficulty ?? 'medium'}
                target={p.target}
                onPress={() => press(p.id, p.target)}
              />
            ))}

          {status === 'blending' && (
            <p className={styles.hint}>
              Tap the blender or press <kbd>Space</kbd> when the needle sweeps through
              your zone
            </p>
          )}
        </div>
      )}

      {status === 'results' && human.result && (
        <Results
          result={human.result}
          stats={{
            perfect: human.perfect,
            good: human.good,
            miss: human.miss,
            bestCombo: human.bestCombo,
            maxRpm: state.maxRpm,
          }}
          standings={multiplayer ? standings : undefined}
          winnerId={state.winnerId}
          humanId={HUMAN_ID}
          onPlayAgain={game.start}
          onChangeBerry={game.reset}
        />
      )}
    </section>
  )
}
