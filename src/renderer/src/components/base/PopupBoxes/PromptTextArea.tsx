import React, { useState, useEffect } from 'react'
import styles from './PopupBoxes.module.css'
import { Button } from '../Buttons/Buttons'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export default function PromptTextArea({
  value = '',
  message = '',
  placeholder,
  confirmName = 'Ok',
  maxLength = 1000,
  simpleMode = false,
  onChange,
  onConfirm,
  onCancel
}: {
  value?: string
  message?: string
  maxLength?: number
  confirmName?: string
  placeholder?: string
  simpleMode?: boolean
  onChange?: (value: string) => void
  onConfirm?: (value: string) => void
  onCancel?: () => void
}) {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.sendRequest, () => onConfirm?.(internalValue.trim()))
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.sendRequest)
    }
  }, [internalValue])

  const handleCancel = () => {
    setInternalValue(value)
    onCancel?.()
  }

  const handleOk = () => {
    onConfirm?.(value.trim())
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    e.target.value = ''
    e.target.value = value
  }

  return (
    <div className={`${styles.popupBoxTextarea} ${simpleMode ? styles.simpleMode : ''}`}>
      <div className={styles.textareaContainer}>
        {!simpleMode && message && <label htmlFor="textarea">{message}</label>}
        <textarea
          id="textarea"
          className={styles.textarea}
          value={internalValue}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={handleChange}
          autoFocus
          onFocus={handleFocus}
        />
      </div>
      {!simpleMode && (
        <div className={styles.buttons}>
          <Button.Cancel className={styles.cancel} onClick={handleCancel}>
            Cancel
          </Button.Cancel>
          <Button.Ok className={styles.ok} onClick={handleOk}>
            {confirmName}
          </Button.Ok>
        </div>
      )}
    </div>
  )
}
