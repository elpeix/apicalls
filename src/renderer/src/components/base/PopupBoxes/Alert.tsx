import React, { CSSProperties } from 'react'
import styles from './PopupBoxes.module.css'
import { Button } from '../Buttons/Buttons'

export default function Alert({
  message,
  buttonName = 'Ok',
  buttonColor = 'primary',
  onClose = () => {}
}: AlertType) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      onClose()
    }
  }

  let style: CSSProperties = {}
  if (buttonColor === 'danger') {
    style = {
      color: 'var(--danger-color)'
    }
  }

  return (
    <div className={styles.popupBox}>
      <div className={styles.message}>{message}</div>
      <div className={styles.buttons}>
        <Button.Ok
          className={styles.ok}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          style={style}
          autoFocus
        >
          {buttonName}
        </Button.Ok>
      </div>
    </div>
  )
}
