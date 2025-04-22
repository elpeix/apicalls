import React, { useEffect, useState } from 'react'
import { WINDOW_ACTIONS } from '../../../../../lib/ipcChannels'
import styles from './WindowIcons.module.css'
import ButtonIcon from '../ButtonIcon'

export default function WindowIcons() {
  if (window.api.os.isMac) {
    return null
  }
  const ipcRenderer = window.electron?.ipcRenderer

  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    ipcRenderer?.send(WINDOW_ACTIONS.isMaximized)
    ipcRenderer?.on(WINDOW_ACTIONS.maximized, (_: unknown, maximized: boolean) => {
      setIsMaximized(maximized)
    })
    return () => ipcRenderer?.removeAllListeners(WINDOW_ACTIONS.maximized)
  }, [])

  const minimizeWindow = () => ipcRenderer?.send(WINDOW_ACTIONS.minimize)
  const maximizeWindow = () => ipcRenderer?.send(WINDOW_ACTIONS.maximize)
  const closeWindow = () => ipcRenderer?.send(WINDOW_ACTIONS.close)

  return (
    <div className={styles.windowIcons}>
      <ButtonIcon
        icon="minimize"
        title="Minimize"
        iconClassName={styles.windoIcon}
        onClick={minimizeWindow}
      />
      <ButtonIcon
        icon={isMaximized ? 'maximized' : 'unmaximized'}
        title={isMaximized ? 'Restore' : 'Maximize'}
        iconClassName={styles.windoIcon}
        onClick={maximizeWindow}
      />
      <ButtonIcon
        icon="close"
        title="Close"
        iconClassName={styles.windoIcon}
        onClick={closeWindow}
        className={styles.close}
      />
    </div>
  )
}
