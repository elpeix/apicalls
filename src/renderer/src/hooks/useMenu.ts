import { useEffect, useState } from 'react'
import { ACTIONS } from '../../../lib/ipcChannels'

export function useMenu(settings: AppSettingsType): MenuHookType {
  const items: MenuItem[] = [
    { id: 'collection', title: 'Collections' },
    { id: 'environment', title: 'Environments' },
    { id: 'history', title: 'History' },
    { id: 'cookies', title: 'Cookies' },
    { id: '-', spacer: true },
    { id: 'settings', title: 'Settings' }
  ]

  const [selected, setSelected] = useState(items[0])
  const [expanded, setExpanded] = useState(true)

  const selectMenuItem = (menuItem: MenuItem) => {
    if (menuItem.spacer) return
    setSelected(menuItem)
    setExpanded(true)
  }

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.toggleSidebar, () => setExpanded((prev) => !prev))
    ipcRenderer?.on(ACTIONS.showCollections, () => selectMenuItem(items[0]))
    ipcRenderer?.on(ACTIONS.showEnvironments, () => selectMenuItem(items[1]))
    ipcRenderer?.on(ACTIONS.showHistory, () => selectMenuItem(items[2]))
    if (settings.manageCookies) {
      ipcRenderer?.on(ACTIONS.showCookies, () => selectMenuItem(items[3]))
    }
    ipcRenderer?.on(ACTIONS.showSettings, () => selectMenuItem(items[5]))

    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.toggleSidebar)
      ipcRenderer?.removeAllListeners(ACTIONS.showCollections)
      ipcRenderer?.removeAllListeners(ACTIONS.showEnvironments)
      ipcRenderer?.removeAllListeners(ACTIONS.showHistory)
      ipcRenderer?.removeAllListeners(ACTIONS.showCookies)
      ipcRenderer?.removeAllListeners(ACTIONS.showSettings)
    }
  }, [selectMenuItem, settings])

  const select = (id: Identifier) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      if (item.id === selected.id) {
        setExpanded(!expanded)
        return
      }
      selectMenuItem(item)
    } else {
      setSelected({ id: '', title: '' })
    }
  }

  return { items, selected, select, expanded, setExpanded }
}
