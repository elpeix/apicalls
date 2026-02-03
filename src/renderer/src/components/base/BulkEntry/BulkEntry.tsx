import React, { useCallback, useEffect, useState } from 'react'
import { ACTIONS } from '../../../../../lib/ipcChannels'
import { Button } from '../Buttons/Buttons'
import SimpleEditor from '../Editor/SimpleEditor'
import Switch from '../Switch/Switch'
import styles from './BulkEntry.module.css'

export default function BulkEntry({
  initialValue = [],
  onSave = () => {},
  onCancel = () => {}
}: {
  initialValue: KeyValue[]
  onSave: (items: KeyValue[]) => void
  onCancel?: () => void
}) {
  const [value, setValue] = useState(() =>
    initialValue.map((item) => `${item.name.trim()}: ${item.value.trim()}`).join('\n')
  )
  const [wordWrap, setWordWrap] = useState(true)

  const handleOk = useCallback(() => {
    const lines = value.split('\n')
    const newItems = lines
      .map((line) => {
        const parts = line.split(':')
        if (parts.length < 2 || parts[0].trim() === '') {
          return null
        }
        const val = parts.slice(1).join(':').trim()
        return { name: parts[0].trim(), value: val, enabled: true } as KeyValue
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
  }, [value, initialValue, onSave])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.sendRequest, () => handleOk())
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.sendRequest)
    }
  }, [handleOk])

  const handleCancel = () => {
    onCancel?.()
  }

  const handleChange = (newValue: string | undefined) => {
    setValue(newValue ?? '')
  }

  return (
    <div className={styles.bulkEntry}>
      <div className={styles.header}>
        <label className={styles.label}>Enter the bulk data</label>
        <div className={styles.wordWrap}>
          <Switch text="Word wrap" active={wordWrap} onChange={setWordWrap} reverse={true} />
        </div>
      </div>
      <div className={styles.editorContainer}>
        <SimpleEditor value={value} onChange={handleChange} wordWrap={wordWrap} />
      </div>
      <div className={styles.buttons}>
        <Button.Cancel onClick={handleCancel}>Cancel</Button.Cancel>
        <Button.Ok onClick={handleOk}>Ok</Button.Ok>
      </div>
    </div>
  )
}
