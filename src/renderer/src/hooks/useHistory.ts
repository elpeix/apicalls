import { useEffect, useState } from 'react'
import { SETTINGS } from '../../../lib/ipcChannels'

export function useHistory(): HistoryHookType {
  const [history, setHistory] = useState<RequestType[]>([])
  const [settings, setSettings] = useState<AppSettingsType | null>(null)

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send(SETTINGS.get)
    ipcRenderer.on(SETTINGS.updated, (_: unknown, settings: AppSettingsType) =>
      setSettings(settings)
    )
    return () => ipcRenderer.removeAllListeners(SETTINGS.updated)
  }, [])

  const add = (request: RequestType) => {
    const newHistory = [...history, request]
    if (!settings) return
    const maxHistory = Math.min(Math.max(settings.maxHistory, 1), 100)
    if (newHistory.length > maxHistory) {
      newHistory.shift()
    }
    setHistory(newHistory)
  }
  const remove = (id: string) => setHistory(history.filter((history) => history.id !== id))
  const clear = () => setHistory([])
  const getAll = () => history
  const get = (id: Identifier) => history.find((history) => history.id === id)

  return {
    getAll,
    add,
    remove,
    clear,
    get
  }
}
