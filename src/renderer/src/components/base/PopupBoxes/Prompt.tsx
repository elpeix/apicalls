import React, { ChangeEvent, FocusEvent, useState } from 'react'
import styles from './PopupBoxes.module.css'
import { Button } from '../Buttons/Buttons'

export default function Prompt({
  message,
  placeholder,
  confirmName,
  value = '',
  valueSelected = false,
  onConfirm,
  onCancel
}: {
  message: string
  confirmName?: string
  placeholder?: string
  value?: string
  valueSelected?: boolean
  onConfirm: (value: string) => void
  onCancel: () => void
}) {
  const [inputValue, setInputValue] = useState(value)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleOk()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    if (valueSelected) {
      e.target.select()
    }
  }

  const handleCancel = () => {
    setInputValue('')
    onCancel()
  }

  const handleOk = () => {
    if (inputValue) {
      onConfirm(inputValue)
      setInputValue('')
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
          onChange={handleChange}
          onFocus={handleFocus}
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
