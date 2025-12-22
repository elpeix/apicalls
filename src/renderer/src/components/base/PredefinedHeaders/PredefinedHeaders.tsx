import React, { useEffect, useState } from 'react'
import styles from './PredefinedHeaders.module.css'
import Params from '../Params/Params'
import { Button } from '../Buttons/Buttons'

export default function PredefinedHeaders({
  title = 'Headers',
  headers = [],
  onSave,
  onClose
}: {
  title?: string
  headers: KeyValue[]
  onSave: (headers: KeyValue[]) => void
  onClose: () => void
}) {
  const [items, setItems] = useState(headers)

  useEffect(() => {
    setItems(headers)
  }, [headers])

  const onAddHandler = () => {
    setItems([
      ...items,
      {
        name: '',
        value: '',
        enabled: true
      }
    ])
  }

  const saveHandler = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onSave(items)
  }

  return (
    <div className={styles.content}>
      <div className={styles.header}>{title}</div>
      <Params
        items={items}
        onSave={setItems}
        onAdd={onAddHandler}
        maxNameSize={240}
        minNameSize={60}
        defaultNameSize={90}
        bulkMode={false}
        draggable={true}
        dragFormat="environment-headers"
        addCaption="Add header"
        removeCaption="Remove header"
        className={styles.params}
      />
      <div className={styles.footer}>
        <Button.Cancel onClick={onClose}>Cancel</Button.Cancel>
        <Button.Ok onClick={saveHandler}>Save</Button.Ok>
      </div>
    </div>
  )
}
