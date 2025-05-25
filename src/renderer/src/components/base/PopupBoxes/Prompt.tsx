import React, { useState } from 'react'
import styles from './PopupBoxes.module.css'
import { Button } from '../Buttons/Buttons'

export default function Prompt({
  message,
  placeholder,
  confirmName,
  value = '',
  onConfirm,
  onCancel
}: {
  message: string
  confirmName?: string
  placeholder?: string
  value?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}) {
  const [inputValue, setInputValue] = useState(value)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleOk()
    }
  }
  const handleCancel = () => {
    setInputValue('')
    onCancel()
  }

  const handleOk = () => {
    if (value) {
      setInputValue('')
      onConfirm(inputValue)
    }
  }
  return (
    <div className={styles.popupBox}>
      <div className={styles.message}>
        {message}
        <input
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
      </div>
      <div className={styles.buttons}>
        <Button.Cancel className={styles.cancel} onClick={handleCancel}>
          Cancel
        </Button.Cancel>
        <Button.Ok className={styles.ok} onClick={handleOk}>
          {confirmName || 'Ok'}
        </Button.Ok>
      </div>
    </div>
  )
}
