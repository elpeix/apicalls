import { useState } from 'react'

export function useMenu(): MenuHook {
  const items = [
    { id: 'collection', title: 'Collections' },
    { id: 'environment', title: 'Environments' },
    { id: 'history', title: 'History' },
    { spacer: true },
    { id: 'settings', title: 'Settings' }
  ]

  const [selected, setSelected] = useState(items[0])

  const select = (id: string | number) => {
    const item = items.find((item) => item.id === id)
    if (item) setSelected(item)
    else setSelected({ id: '', title: '' })
  }

  return { items, selected, select }
}
