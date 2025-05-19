import React, { useContext } from 'react'
import styles from './SidePanel.module.css'
import { AppContext } from '../../../../context/AppContext'
import History from '../history/History'
import Environments from '../Environments/Environments'
import Settings from '../Settings/Settings'
import Collections from '../Collections/Collections'
import Cookies from '../Cookies/Cookies'

export default function SidePanel() {
  const { menu } = useContext(AppContext)

  const classNameSelected = menu?.selected?.id || ''

  return (
    <aside className={styles.sidePanel}>
      <div className={styles.workspace}>
        <div className={styles.name}>Workspace</div>
      </div>
      <div className={styles.content}>
        {menu && (
          <div className={`${styles.sidePanel} ${styles[classNameSelected]}`}>
            <div className={styles.collections}>
              <Collections />
            </div>
            <div className={styles.environment}>
              <Environments />
            </div>
            <div className={styles.history}>
              <History />
            </div>
            <div className={styles.cookies}>
              <Cookies />
            </div>
            <div className={styles.settings}>
              <Settings />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
