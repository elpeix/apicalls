import React, { useEffect, useState } from 'react'
import FormDataTable from '../base/Params/FormDataTable'

export default function FormDataEditor({
  value,
  onChange,
  allowFiles = true
}: {
  value: string
  onChange: (value: string) => void
  allowFiles?: boolean
}) {
  const [items, setItems] = useState<KeyValue[]>([])

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]')
      if (Array.isArray(parsed)) {
        setItems(parsed.map(parseItem).filter((item): item is KeyValue => item !== null))
      } else {
        setItems([])
      }
    } catch {
      setItems([])
    }
  }, [value])

  const parseItem = (item: unknown): KeyValue | null => {
    if (typeof item === 'object' && item !== null) {
      const parsed = item as KeyValue
      if (parsed.name === undefined) {
        return null
      }
      return {
        name: parsed.name,
        value: parsed.value,
        enabled: !!parsed.enabled,
        type: parsed.type || 'text'
      }
    }
    return null
  }

  const updateItems = (newItems: KeyValue[]) => {
    setItems(newItems)
    onChange(JSON.stringify(newItems))
  }

  const handleAdd = () => {
    updateItems([...items, { name: '', value: '', enabled: true, type: 'text' }])
  }

  return (
    <FormDataTable
      items={items}
      onSave={updateItems}
      onAdd={handleAdd}
      maxNameSize={240}
      minNameSize={60}
      defaultNameSize={90}
      showEnable={true}
      bulkMode={false}
      draggable={true}
      dragFormat="environment-headers"
      addCaption="Add field"
      removeCaption="Remove field"
      showType={allowFiles}
    />
  )
}
