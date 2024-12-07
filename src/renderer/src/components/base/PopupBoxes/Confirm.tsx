import React, { CSSProperties } from 'react'
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

  let styleConfirm: CSSProperties = {}
  if (confirmColor === 'danger') {
    styleConfirm = {
      color: 'var(--danger-color)'
    }
  }

  return (
    <div className={styles.popupBox}>
      <div className={styles.message}>{message}</div>
      <div className={styles.buttons}>
        <Button.Cancel onClick={onCancel}>Cancel</Button.Cancel>
        <Button.Ok
          className={styles.ok}
          onClick={onConfirm}
          onKeyDown={handleKeyDown}
          style={styleConfirm}
          autoFocus
        >
          {confirmName || 'Ok'}
        </Button.Ok>
      </div>
    </div>
  )
}
