import { useEffect, useState } from 'react'
import { SETTINGS } from '../../../lib/ipcChannels'
import { applyTheme, removeStyleProperties } from '../lib/utils'

const LIGHT = 'light'
const DARK = 'dark'

const defaultEditorThemes: Record<string, string> = {
  light: 'vs',
  dark: 'vs-dark',
  'hc-light': 'hc-light',
  'hc-dark': 'hc-black'
}

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

  const getEditorTheme = (): { name: string; mode: string; data: object } => {
    if (!settings || settings.theme === 'system') {
      const theme = mode === DARK ? 'vs-dark' : 'vs'
      return { name: theme, mode: theme, data: {} }
    }
    if (Object.keys(defaultEditorThemes).includes(settings.theme)) {
      return {
        name: defaultEditorThemes[settings.theme],
        data: {},
        mode: defaultEditorThemes[settings.theme]
      }
    }
    const theme = themes.get(settings.theme)

    return {
      name: settings?.theme,
      data: theme?.editor || {},
      mode: theme?.mode || mode
    }
  }

  return { settings, save, clear, getEditorTheme, themes }
}
