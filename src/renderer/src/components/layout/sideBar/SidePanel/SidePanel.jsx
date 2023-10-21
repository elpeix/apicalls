import React, { useContext } from 'react'
import styles from './SidePanel.module.css'
import Collections from '../Collections'
import { AppContext } from '../../../../context/AppContext'
import History from '../history/History'

export default function SidePanel() {

  const appContext = useContext(AppContext)

  return (
    <div className={styles.sidePanel}>
      <div className={styles.title}>{appContext.menu.selected.title}</div>
      <div className={styles.content}>
        {appContext.menu.selected && (
          <div className={styles.sidePanel}>
            {appContext.menu.selected.id === 'collection' && <Collections />}
            {appContext.menu.selected.id === 'environment' && ('')}
            {appContext.menu.selected.id === 'history' && (<History />)}
            {appContext.menu.selected.id === 'settings' && ('')}
          </div>
        )}
      </div>
    </div>
  )
}
