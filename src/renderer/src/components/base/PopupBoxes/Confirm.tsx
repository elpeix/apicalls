import React, { CSSProperties } from 'react'
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
  confirmColor?: 'primary' | 'danger' | string // TODO: remove string
  onConfirm: () => void
  onCancel: () => void
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      onConfirm()
    }
  }

  // TODO: Remove string, primary and use object for color
  let styleConfirm: CSSProperties = {}
  if (confirmColor === 'primary') {
    // pass
  } else if (confirmColor === 'danger') {
    styleConfirm = {
      color: 'var(--danger-color)'
    }
  } else if (confirmColor) {
    styleConfirm = {
      color: confirmColor
    }
  }

  // TODO: Remove Dialog and use div
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
