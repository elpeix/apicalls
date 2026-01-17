import { useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'

const base = window || global

export const useEditorTheme = (appSettings: AppSettingsHookType | null) => {
  const [theme, setTheme] = useState(
    appSettings?.getEditorTheme()?.name ||
      (base.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs')
  )
  const [themeData, setThemeData] = useState<monaco.editor.IStandaloneThemeData | null>(() => {
    const editorTheme = appSettings?.getEditorTheme()
    if (editorTheme && editorTheme.data && editorTheme.data.colors) {
      return resolveThemeVariables(editorTheme.data, editorTheme.colors || {})
    }
    return editorTheme?.data || null
  })

  useEffect(() => {
    const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = () => {
      const editorTheme = appSettings?.getEditorTheme()

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
        const resolvedThemeData = resolveThemeVariables(editorTheme.data, editorTheme.colors || {})
        setThemeData(resolvedThemeData)
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

    matchMedia.addEventListener('change', mediaListener)
    return () => matchMedia.removeEventListener('change', mediaListener)
  }, [appSettings])

  return { theme, themeData }
}

function resolveThemeVariables(
  themeData: monaco.editor.IStandaloneThemeData,
  themeColors: Record<string, string>
): monaco.editor.IStandaloneThemeData {
  const colors = themeData.colors || {}
  const rules = themeData.rules || []

  const resolveValue = (value: string, visited: Set<string> = new Set()): string => {
    if (!value || !value.startsWith('var(--')) {
      return value
    }
    const varName = value.replace('var(--', '').replace(')', '')

    if (visited.has(varName)) {
      console.warn(`Circular dependency detected for theme variable: ${varName}`)
      return '#000000' // Return a safe fallback
    }
    visited.add(varName)

    let resolved = themeColors[varName] || colors[varName]

    if (!resolved) {
      console.warn(`Theme variable not found: ${varName}`)
      return '#ff00ff'
    }

    if (resolved.startsWith('var(--')) {
      resolved = resolveValue(resolved, visited)
    }

    return resolved
  }

  const resolvedRules = rules.map((rule) => {
    const newRule = { ...rule }
    if (newRule.foreground) {
      newRule.foreground = resolveValue(newRule.foreground)
    }
    if (newRule.background) {
      newRule.background = resolveValue(newRule.background)
    }
    return newRule
  })

  const resolvedColors: Record<string, string> = {}
  Object.keys(colors).forEach((key) => {
    resolvedColors[key] = resolveValue(colors[key])
  })

  return {
    ...themeData,
    base: themeData.base,
    inherit: themeData.inherit,
    rules: resolvedRules,
    colors: resolvedColors
  }
}
