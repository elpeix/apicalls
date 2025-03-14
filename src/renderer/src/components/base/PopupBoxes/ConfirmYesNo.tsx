import React, { CSSProperties } from 'react'
import styles from './PopupBoxes.module.css'
import { Button } from '../Buttons/Buttons'

export default function ConfirmYesNo({
  message,
  yesName = 'Yes',
  noName = 'No',
  yesColor = 'primary',
  noColor = 'danger',
  onYes,
  onNo,
  onCancel
}: YesNoType) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      onYes()
    }
  }
  const dangerConfirmStyle: CSSProperties = {
    color: 'var(--danger-color)',
    borderColor: 'var(--danger-color)'
  }
  const styleYesConfirm: CSSProperties = yesColor === 'danger' ? dangerConfirmStyle : {}
  const styleNoConfirm: CSSProperties = noColor === 'danger' ? dangerConfirmStyle : {}

  return (
    <div className={styles.popupBox}>
      <div className={styles.message}>{message}</div>
      <div className={styles.buttons}>
        <Button.Ok
          className={styles.ok}
          onClick={onNo}
          onKeyDown={handleKeyDown}
          style={styleNoConfirm}
        >
          {noName || 'Ok'}
        </Button.Ok>
        <Button.Cancel onClick={onCancel}>Cancel</Button.Cancel>
        <Button.Ok
          className={styles.ok}
          onClick={onYes}
          onKeyDown={handleKeyDown}
          style={styleYesConfirm}
          autoFocus
        >
          {yesName || 'Ok'}
        </Button.Ok>
      </div>
    </div>
  )
}
