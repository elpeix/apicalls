import React, { useContext } from 'react'
import { AppContext } from '../../../context/AppContext'
import styles from './NewTab.module.css'

export default function NewTab() {

  const appContext = useContext(AppContext)

  return (
    <div className={styles.newTab} onClick={appContext.tabs.newTab}>
      <span>+</span>
    </div>
  )
}
