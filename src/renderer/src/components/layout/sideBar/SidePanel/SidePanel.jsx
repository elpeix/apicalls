import React, { useContext } from 'react'
import styles from './SidePanel.module.css'
import Collections from '../Collections'
import { AppContext } from '../../../../context/AppContext'
import History from '../history/History'

export default function SidePanel() {

  const { menu } = useContext(AppContext)

  return (
    <div className={styles.sidePanel}>
      <div className={styles.title}>{menu.selected.title}</div>
      <div className={styles.content}>
        {menu.selected && (
          <div className={styles.sidePanel}>
            {menu.selected.id === 'collection' && <Collections />}
            {menu.selected.id === 'environment' && ('')}
            {menu.selected.id === 'history' && (<History />)}
            {menu.selected.id === 'settings' && ('')}
          </div>
        )}
      </div>
    </div>
  )
}
