import { useEffect, useState } from 'react'
import { ACTIONS } from '../../../lib/ipcChannels'

export function useMenu(): MenuHookType {
  const items: MenuItem[] = [
    { id: 'collection', title: 'Collections' },
    { id: 'environment', title: 'Environments' },
    { id: 'history', title: 'History' },
    { id: '-', spacer: true },
    { id: 'settings', title: 'Settings' }
  ]

  const [selected, setSelected] = useState(items[0])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.showCollections, () => setSelected(items[0]))
    ipcRenderer?.on(ACTIONS.showEnvironments, () => setSelected(items[1]))
    ipcRenderer?.on(ACTIONS.showHistory, () => setSelected(items[2]))
    ipcRenderer?.on(ACTIONS.showSettings, () => setSelected(items[4]))

    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.showCollections)
      ipcRenderer?.removeAllListeners(ACTIONS.showEnvironments)
      ipcRenderer?.removeAllListeners(ACTIONS.showHistory)
      ipcRenderer?.removeAllListeners(ACTIONS.showSettings)
    }
  }, [setSelected])

  const select = (id: Identifier) => {
    const item = items.find((item) => item.id === id)
    if (item) setSelected(item)
    else setSelected({ id: '', title: '' })
  }

  return { items, selected, select }
}
