import { Link, Outlet } from 'react-router-dom'
import styles from './RootLayout.module.css'

export default function RootLayout() {
  return (
    <div className="app">
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" className={styles.brand} aria-label="Berry Blender home">
            <span className={styles.brandMark} aria-hidden="true">
              <span className={`${styles.brandBerry} ${styles.brandBerry1}`} />
              <span className={`${styles.brandBerry} ${styles.brandBerry2}`} />
              <span className={`${styles.brandBerry} ${styles.brandBerry3}`} />
            </span>
            <span className={styles.brandName}>Berry&nbsp;Blender</span>
          </Link>
          <span className={styles.tag}>a blending rhythm game</span>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
