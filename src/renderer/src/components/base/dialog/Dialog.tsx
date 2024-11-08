import React, { useEffect, useState } from 'react'
import styles from './Dialog.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export default function Dialog({
  children,
  className = '',
  onClose,
  preventKeyClose = false,
  position = 'center'
}: {
  children: React.ReactNode
  className?: string
  onClose?: () => void
  preventKeyClose?: boolean
  position?: 'top' | 'center'
}) {
  const [show, setShow] = useState(true)

  const closeDialog = () => {
    setShow(false)
    if (onClose) onClose()
  }

  useEffect(() => {
    if (preventKeyClose) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.once(ACTIONS.escape, closeDialog)
    return () => ipcRenderer?.removeListener(ACTIONS.escape, closeDialog)
  }, [onClose, preventKeyClose])

  const dialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    e.stopPropagation()
  }

  return (
    <>
      {show && (
        <div
          className={`${styles.overlay} ${position === 'top' ? styles.dialogOnTop : ''}`}
          onClick={closeDialog}
        >
          <dialog className={`${styles.dialog} ${className}`} onClick={dialogClick}>
            {children}
          </dialog>
        </div>
      )}
    </>
  )
}
