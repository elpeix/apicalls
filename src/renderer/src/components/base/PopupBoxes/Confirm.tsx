import React from 'react'
import Dialog from '../dialog/Dialog'
import styles from './PopupBoxes.module.css'

export default function Confirm({
  message,
  confirmName,
  onConfirm,
  onCancel
}: {
  message: string
  confirmName?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      onConfirm()
    }
  }

  return (
    <Dialog className={styles.popupBox} onClose={onCancel}>
      <div className={styles.message}>{message}</div>
      <div className={styles.buttons}>
        <button className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
        <button className={styles.ok} onClick={onConfirm} onKeyDown={handleKeyDown} autoFocus>
          {confirmName || 'Ok'}
        </button>
      </div>
    </Dialog>
  )
}
