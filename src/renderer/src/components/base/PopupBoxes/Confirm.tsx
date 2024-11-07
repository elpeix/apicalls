import React from 'react'
import Dialog from '../dialog/Dialog'
import styles from './PopupBoxes.module.css'

export default function Confirm({
  message,
  confirmName,
  confirmColor = '',
  onConfirm,
  onCancel
}: {
  message: string
  confirmName?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      onConfirm()
    }
  }

  const styleConfirm = confirmColor ? { color: confirmColor } : {}

  return (
    <Dialog className={styles.popupBox} onClose={onCancel}>
      <div className={styles.message}>{message}</div>
      <div className={styles.buttons}>
        <button className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
        <button
          className={styles.ok}
          onClick={onConfirm}
          onKeyDown={handleKeyDown}
          style={styleConfirm}
          autoFocus
        >
          {confirmName || 'Ok'}
        </button>
      </div>
    </Dialog>
  )
}
