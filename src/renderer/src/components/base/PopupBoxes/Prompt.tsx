import React, { useState } from 'react'
import styles from './PopupBoxes.module.css'

export default function Prompt({
  message,
  placeholder,
  confirmName,
  onConfirm,
  onCancel
}: {
  message: string
  confirmName?: string
  placeholder?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState('')
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleOk()
    }
  }
  const handleCancel = () => {
    setValue('')
    onCancel()
  }

  const handleOk = () => {
    setValue('')
    onConfirm(value)
  }
  return (
    <div className={styles.popupBox}>
      <div className={styles.message}>
        {message}
        <input
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </div>
      <div className={styles.buttons}>
        <button className={styles.cancel} onClick={handleCancel}>
          Cancel
        </button>
        <button className={styles.ok} onClick={handleOk}>
          {confirmName || 'Ok'}
        </button>
      </div>
    </div>
  )
}
