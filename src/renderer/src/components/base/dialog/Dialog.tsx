import React, { useState } from 'react'
import styles from './Dialog.module.css'

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
