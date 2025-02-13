import { useEffect, useState } from 'react'

// TODO: Remove
export default function useTheme() {
  const LIGHT = 'light'
  const DARK = 'dark'

  const base = window || global
  const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

  const [mode, setMode] = useState(matchMedia.matches ? DARK : LIGHT)

  useEffect(() => {
    matchMedia.addEventListener('change', (e) => {
      setMode(e.matches ? DARK : LIGHT)
    })
  }, [matchMedia])

  const getTheme = (light: string, dark: string): string => (mode === LIGHT ? light : dark)

  return { mode, getTheme }
}
