import { useEffect, useState } from 'react'
import { SETTINGS } from '../../../lib/ipcChannels'

export function useSettings(): AppSettingsHookType {
  const [settings, setSettings] = useState<AppSettingsType | null>(null)
  const LIGHT = 'light'
  const DARK = 'dark'

  const base = window || global
  const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

  const [mode, setMode] = useState(matchMedia.matches ? DARK : LIGHT)

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.get)
    ipcRenderer?.on(SETTINGS.updated, (_: unknown, settings: AppSettingsType) => {
      setSettings(settings)
      document.documentElement.setAttribute('data-theme', settings.theme)
    })
    return () => ipcRenderer?.removeAllListeners(SETTINGS.updated)
  }, [])

  useEffect(() => {
    matchMedia.addEventListener('change', (e) => {
      setMode(e.matches ? DARK : LIGHT)
    })
  }, [matchMedia])

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

  const getEditorTheme = () => {
    if (!settings || settings.theme === 'system') {
      return mode === LIGHT ? 'vs-light' : 'vs-dark'
    }
    return settings?.theme === 'dark' ? 'vs-dark' : 'vs-light'
  }

  return { settings, save, clear, getEditorTheme }
}
