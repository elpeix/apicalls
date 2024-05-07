import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../../context/AppContext'
import styles from './NewTab.module.css'
import { ACTION_NEW_TAB } from '../../../../../lib/ipcChannels'
import Icon from '../../base/Icon/Icon'

export default function NewTab({ showLabel = false }: { showLabel?: boolean }) {
  const { tabs } = useContext(AppContext)
  const onClick = () => tabs?.newTab()

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.on(ACTION_NEW_TAB, () => {
      tabs?.newTab()
    })
    return () => ipcRenderer.removeAllListeners(ACTION_NEW_TAB)
  }, [tabs])

  const className = `${styles.newTab} ${showLabel ? styles.withLabel : ''}`

  return (
    <div className={className} onClick={onClick}>
      <div className={styles.icon}>
        <button className={`button-icon`} title="New tab">
          <Icon icon="more" size={21} />
        </button>
      </div>
      {showLabel && <div className={styles.label}>New tab</div>}
    </div>
  )
}
