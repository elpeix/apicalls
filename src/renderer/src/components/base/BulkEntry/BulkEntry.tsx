import React, { useState, useEffect } from 'react'
import PromptTextArea from '../PopupBoxes/PromptTextArea'

export default function BulkEntry({
  initialValue = [],
  onSave = () => {},
  onCancel = () => {}
}: {
  initialValue: KeyValue[]
  onSave: (items: KeyValue[]) => void
  onCancel?: () => void
}) {
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(initialValue.map((item) => `${item.name.trim()}: ${item.value.trim()}`).join('\n'))
  }, [initialValue])

  const handleOk = (value: string) => {
    const lines = value.split('\n')
    const newItems = lines
      .map((line) => {
        const parts = line.split(':')
        if (parts.length < 2 || parts[0].trim() === '') {
          return null
        }
        const value = parts.slice(1).join(':').trim()
        return { name: parts[0].trim(), value, enabled: true } as KeyValue
      })
      .filter((item) => item !== null) as KeyValue[]
    const uniqueItems = newItems
      .filter((item, index) => {
        const firstIndex = newItems.findIndex((i) => i.name === item.name)
        return firstIndex === index
      })
      .map((item) => {
        initialValue.forEach((initialItem) => {
          if (initialItem.name === item.name) {
            item.enabled = initialItem.enabled ?? item.enabled
          }
        })
        return item
      })
    onSave(uniqueItems)
  }

  return (
    <PromptTextArea
      initialValue={value}
      message="Enter the bulk data"
      placeholder="Name: Value"
      onConfirm={handleOk}
      onCancel={onCancel}
    />
  )
}
