import { useState } from 'react'

export function useMenu() {

  const items = [
    { id: 'collection', title: 'Collections' },
    { id: 'environment', title: 'Environments' },
    { id: 'history', title: 'History' },
    { spacer: true },
    { id: 'settings', title: 'Settings' }
  ]

  const [selected, setSelected] = useState(items[0])

  const select = id => {
    const item = items.find(item => item.id === id)
    if (item) setSelected(item)
    else setSelected(null)
  }

  return { items,  selected, select }

}