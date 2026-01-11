import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../../context/AppContext'
import styles from './NewTab.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'
import Icon from '../../base/Icon/Icon'

export default function NewTab({ showLabel = false }: { showLabel?: boolean }) {
  const { tabs } = useContext(AppContext)
  const onClick = () => tabs?.newTab()

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.newTab, () => {
      tabs?.newTab()
    })
    return () => ipcRenderer?.removeAllListeners(ACTIONS.newTab)
  }, [tabs])

  const className = `${styles.newTab} ${showLabel ? styles.withLabel : ''}`

  return (
    <div className={className} onClick={onClick}>
      <button
        className={`button-icon ${showLabel ? styles.button : ''}`}
        title={!showLabel ? 'New tab' : undefined}
      >
        <Icon icon="more" size={21} />
        {showLabel && <div className={styles.label}>New tab</div>}
      </button>
    </div>
  )
}
