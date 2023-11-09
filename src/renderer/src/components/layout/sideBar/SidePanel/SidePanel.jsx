import React, { useContext } from 'react'
import styles from './SidePanel.module.css'
import { AppContext } from '../../../../context/AppContext'
import History from '../history/History'
import Environments from '../Environments/Environments'
import Settings from '../Settings/Settings'
import Collections from '../Collections/Collections'

export default function SidePanel() {

  const { menu } = useContext(AppContext)

  return (
    <aside className={styles.sidePanel}>
      <div className={styles.content}>
        { menu.selected && (
          <div className={styles.sidePanel}>
            { menu.selected.id === 'collection' && <Collections /> }
            { menu.selected.id === 'environment' && <Environments /> }
            { menu.selected.id === 'history' && <History /> }
            { menu.selected.id === 'settings' && <Settings /> }
          </div>
        )}
      </div>
    </aside>
  )
}
