import { useState } from 'react'

export function useMenu(): MenuHookType {
  const items: MenuItem[] = [
    { id: 'collection', title: 'Collections' },
    { id: 'environment', title: 'Environments' },
    { id: 'history', title: 'History' },
    { id: '-', spacer: true },
    { id: 'settings', title: 'Settings' }
  ]

  const [selected, setSelected] = useState(items[0])

  const select = (id: Identifier) => {
    const item = items.find((item) => item.id === id)
    if (item) setSelected(item)
    else setSelected({ id: '', title: '' })
  }

  return { items, selected, select }
}
