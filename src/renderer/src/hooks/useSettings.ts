import { useEffect, useState } from 'react'
import { SETTINGS } from '../../../lib/ipcChannels'

export function useSettigns(): AppSettingsHookType {
  const [settings, setSettings] = useState<AppSettingsType | null>(null)

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.get)
    ipcRenderer?.on(SETTINGS.updated, (_: unknown, settings: AppSettingsType) => {
      setSettings(settings)
      document.documentElement.setAttribute('data-theme', settings.theme)
    })
    return () => ipcRenderer?.removeAllListeners(SETTINGS.updated)
  }, [])

  const save = (settings: AppSettingsType) => {
    setSettings(settings)
    document.documentElement.setAttribute('data-theme', settings.theme)
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.save, settings)

    if (settings.menu !== undefined) {
      ipcRenderer?.send(SETTINGS.toggleMenu, settings.menu)
    }
  }

  const clear = () => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.clear)
  }

  return { settings, save, clear }
}
