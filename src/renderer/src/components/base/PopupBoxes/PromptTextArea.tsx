import React, { useState, useEffect } from 'react'
import styles from './PopupBoxes.module.css'
import { Button } from '../Buttons/Buttons'

export default function PromptTextArea({
  initialValue = '',
  message,
  placeholder,
  confirmName = 'Ok',
  maxLength = 1000,
  onConfirm,
  onCancel
}: {
  initialValue?: string
  message: string
  maxLength?: number
  confirmName?: string
  placeholder?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleCancel = () => {
    setValue(initialValue)
    onCancel()
  }

  const handleOk = () => {
    setValue(initialValue)
    onConfirm(value.trim())
  }
  return (
    <div className={styles.popupBox}>
      <div className={styles.message}>
        {message}
        <textarea
          className={styles.textarea}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </div>
      <div className={styles.buttons}>
        <Button.Cancel className={styles.cancel} onClick={handleCancel}>
          Cancel
        </Button.Cancel>
        <Button.Ok className={styles.ok} onClick={handleOk}>
          {confirmName}
        </Button.Ok>
      </div>
    </div>
  )
}
