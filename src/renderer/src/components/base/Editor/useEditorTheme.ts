import { useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'

const base = window || global

export const useEditorTheme = (appSettings: AppSettingsHookType | null) => {
  const [theme, setTheme] = useState(
    appSettings?.getEditorTheme()?.name ||
      (base.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs')
  )
  const [themeData, setThemeData] = useState<monaco.editor.IStandaloneThemeData | null>(
    appSettings?.getEditorTheme()?.data || null
  )

  useEffect(() => {
    const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = () => {
      const editorTheme = appSettings?.getEditorTheme()

      // Fallback to system if no theme set or dynamic mode
      if (!editorTheme) {
        setTheme(matchMedia.matches ? 'vs-dark' : 'vs')
        return
      }

      const editorThemeMode = editorTheme.mode
      if (editorThemeMode === 'hc-light' || editorThemeMode === 'hc-black') {
        setThemeData(null)
        setTheme(editorThemeMode)
        return
      }

      if (editorTheme.data && editorTheme.data.colors) {
        setThemeData(editorTheme.data)
        setTheme(editorTheme.name)
      } else {
        setThemeData(null)
        setTheme(editorTheme.mode === 'vs-dark' ? 'vs-dark' : 'vs')
      }
    }

    updateTheme()

    const mediaListener = () => {
      updateTheme()
    }

    // Modern browsers use addEventListener
    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', mediaListener)
    } else {
      // Fallback
      matchMedia.addListener(mediaListener)
    }

    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener('change', mediaListener)
      } else {
        matchMedia.removeListener(mediaListener)
      }
    }
  }, [appSettings]) // matchMedia is created inside, so not a dependency.

  return { theme, themeData }
}
