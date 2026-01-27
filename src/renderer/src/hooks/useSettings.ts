import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SETTINGS, SYSTEM_ACTIONS } from '../../../lib/ipcChannels'
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
  const themesRef = useRef<Map<string, AppTheme>>(new Map())

  const base = window || global
  const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

  const [mode, setMode] = useState(matchMedia.matches ? DARK : LIGHT)

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.get)
    ipcRenderer?.on(SETTINGS.updated, (_: unknown, settings: AppSettingsType) => {
      setSettings(settings)
      if (settings?.theme === 'system') {
        document.documentElement.setAttribute('data-theme', matchMedia.matches ? DARK : LIGHT)
        removeStyleProperties()
      } else {
        document.documentElement.setAttribute('data-theme', settings.theme)
      }
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
      themesRef.current = themes
    })

    return () => {
      ipcRenderer?.removeAllListeners(SETTINGS.updated)
      ipcRenderer?.removeAllListeners(SETTINGS.listThemes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer

    // Listen for system theme changes from main process
    ipcRenderer?.on(SYSTEM_ACTIONS.systemThemeChanged, (_: unknown, systemTheme: string) => {
      if (settings?.theme === 'system') {
        document.documentElement.setAttribute('data-theme', systemTheme)
        removeStyleProperties()
      }
    })
    return () => ipcRenderer?.removeAllListeners(SYSTEM_ACTIONS.systemThemeChanged)
  }, [settings])

  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => setMode(e.matches ? DARK : LIGHT)
    matchMedia.addEventListener('change', handleChange)

    return () => matchMedia.removeEventListener('change', handleChange)
  }, [matchMedia])

  const save = useCallback(
    (newSettings: AppSettingsType) => {
      setSettings(newSettings)
      if (newSettings.theme === 'system') {
        document.documentElement.setAttribute('data-theme', matchMedia.matches ? DARK : LIGHT)
      } else {
        document.documentElement.setAttribute('data-theme', newSettings.theme)
      }
      const ipcRenderer = window.electron?.ipcRenderer
      ipcRenderer?.send(SETTINGS.save, newSettings)
      removeStyleProperties()
      const colors = themesRef.current.get(newSettings.theme)?.colors
      if (colors) {
        applyTheme(colors)
      }
      if (newSettings.menu !== undefined && newSettings.menu !== settings?.menu) {
        ipcRenderer?.send(SETTINGS.toggleMenu, newSettings.menu)
      }
      if (
        newSettings.manageCookies !== undefined &&
        newSettings.manageCookies !== settings?.manageCookies
      ) {
        ipcRenderer?.send(SETTINGS.toggleMenuCookies, newSettings.manageCookies)
      }
    },
    [matchMedia, settings]
  )

  const clear = useCallback(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(SETTINGS.clear)
    removeStyleProperties()
  }, [])

  const getEditorTheme = useCallback((): {
    name: string
    mode: string
    data: object
    colors?: Record<string, string>
  } => {
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
      mode: theme?.mode || mode,
      colors: theme?.colors || {}
    }
  }, [settings, mode, themes])

  const isCustomWindowMode = useCallback(() => {
    if (window.api.os.isMac) {
      return true
    }
    return settings?.windowMode !== 'native'
  }, [settings?.windowMode])

  return useMemo(
    () => ({ settings, save, clear, getEditorTheme, themes, isCustomWindowMode }),
    [settings, save, clear, getEditorTheme, themes, isCustomWindowMode]
  )
}
