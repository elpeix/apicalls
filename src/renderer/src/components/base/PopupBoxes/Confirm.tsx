import React from 'react'
import styles from './PopupBoxes.module.css'
import { Button } from '../Buttons/Buttons'

export default function Confirm({
  message,
  confirmName,
  confirmColor = 'primary',
  onConfirm,
  onCancel
}: {
  message: string
  confirmName?: string
  confirmColor?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      onConfirm()
    }
  }

  return (
    <div className={styles.popupBox}>
      <div className={styles.message}>{message}</div>
      <div className={styles.buttons}>
        <Button.Cancel onClick={onCancel}>Cancel</Button.Cancel>
        <Button.Ok
          className={confirmColor === 'danger' ? styles.danger : styles.ok}
          onClick={onConfirm}
          onKeyDown={handleKeyDown}
          autoFocus
        >
          {confirmName || 'Ok'}
        </Button.Ok>
      </div>
    </div>
  )
}
