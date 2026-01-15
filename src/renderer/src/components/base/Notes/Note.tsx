import React from 'react'
import PromptTextArea from '../PopupBoxes/PromptTextArea'

export default function Note({
  value = '',
  onSave,
  onCancel
}: {
  value?: string
  onSave: (value: string) => void
  onCancel: () => void
}) {
  const handleConfirm = (newValue: string) => {
    onSave(newValue)
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <PromptTextArea
      value={value}
      placeholder="Type your note here..."
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
