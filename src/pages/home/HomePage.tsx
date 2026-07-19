import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ROUND_SECONDS } from '@/lib/constants'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero] > *', {
        y: 26,
        opacity: 0,
        duration: 0.5,
        stagger: 0.09,
      }).from(
        `.${styles.cluster}`,
        { scale: 0.7, opacity: 0, duration: 0.6, ease: 'back.out(1.7)' },
        '<0.1',
      )

      // Ambient float on the berry cluster.
      gsap.to(`.${styles.berry}`, {
        y: -10,
        duration: 0.8,
        ease: 'sine',
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.4, from: 'random' },
      })
    },
    { scope: root },
  )

  return (
    <section className={`${styles.home} container`} ref={root}>
      <div className={styles.hero} data-hero>
        <span className="eyebrow">Press-timing arcade game</span>
        <h1 className={styles.title}>
          Blend the berries.
          <br />
          <span className={styles.accent}>Nail the timing.</span>
        </h1>
        <p className={styles.lede}>
          A love letter to the Game Boy Advance berry-blending minigame, rebuilt for the
          browser. Feed a berry into the blender, then hit the beat as the needle sweeps
          the top. {ROUND_SECONDS} seconds to craft the perfect Pokéblock.
        </p>
        <button className={`btn ${styles.cta}`} onClick={() => navigate('/play')}>
          Start blending →
        </button>
      </div>

      <div className={styles.cluster} aria-hidden="true">
        <span className={`${styles.berry} ${styles.berryA}`} />
        <span className={`${styles.berry} ${styles.berryB}`} />
        <span className={`${styles.berry} ${styles.berryC}`} />
        <span className={`${styles.berry} ${styles.berryD}`} />
        <span className={`${styles.berry} ${styles.berryE}`} />
      </div>
    </section>
  )
}
