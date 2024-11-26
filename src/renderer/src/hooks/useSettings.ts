import { useEffect, useState } from 'react'
import { SETTINGS } from '../../../lib/ipcChannels'
import { applyTheme, removeStyleProperties } from '../lib/utils'

const LIGHT = 'light'
const DARK = 'dark'

export function useSettings(): AppSettingsHookType {
  const [settings, setSettings] = useState<AppSettingsType | null>(null)
  const [themes, setThemes] = useState<Map<string, AppTheme>>(new Map())

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
    ipcRenderer?.on(SETTINGS.listThemes, (_: unknown, themes: Map<string, AppTheme>) => {
      const theme = document.documentElement.getAttribute('data-theme')
      if (theme) {
        const colors = themes.get(theme)?.colors
        if (colors) {
          applyTheme(colors)
        }
      }
      setThemes(themes)
    })
    return () => {
      ipcRenderer?.removeAllListeners(SETTINGS.updated)
      ipcRenderer?.removeAllListeners(SETTINGS.listThemes)
    }
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
    removeStyleProperties()
    const colors = themes.get(settings.theme)?.colors
    if (colors) {
      applyTheme(colors)
    }
    if (settings.menu !== undefined) {
      ipcRenderer?.send(SETTINGS.toggleMenu, settings.menu)
    }
  }

  const clear = () => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.clear)
  }

  const getEditorTheme = () => {
    // TODO: Return base and colors
    if (!settings || settings.theme === 'system') {
      return mode === LIGHT ? 'vs-light' : 'vs-dark'
    }
    const editor = themes.get(settings?.theme)?.editor
    if (editor) {
      return editor.base
    }
    return settings?.theme === 'dark' ? 'vs-dark' : 'vs-light'
  }

  return { settings, save, clear, getEditorTheme, themes }
}
