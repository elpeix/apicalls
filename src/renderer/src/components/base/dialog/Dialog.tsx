import React, { useEffect, useState } from 'react'
import styles from './Dialog.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export default function Dialog({
  children,
  className = '',
  onClose
}: {
  children: React.ReactNode
  className?: string
  onClose?: () => void
}) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.on(ACTIONS.escape, () => {
      setShow(false)
      if (onClose) onClose()
    })
    return () => ipcRenderer.removeAllListeners(ACTIONS.escape)
  }, [onClose])

  const overlayClick = () => {
    setShow(false)
    if (onClose) onClose()
  }

  const dialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    e.stopPropagation()
  }

  return (
    <>
      {show && (
        <div className={styles.overlay} onClick={overlayClick}>
          <dialog className={`${styles.dialog} ${className}`} onClick={dialogClick}>
            {children}
          </dialog>
        </div>
      )}
    </>
  )
}
