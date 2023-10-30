import { useEffect, useState } from 'react'

export default function useTheme() {

  const LIGHT = 'light'
  const DARK = 'dark'

  const base = window || global
  const matchMedia = base.matchMedia('(prefers-color-scheme: dark)')

  const [mode, setMode] = useState(matchMedia.matches ? DARK : LIGHT)

  useEffect(() => {
    matchMedia.addEventListener('change', e => {
      setMode(e.matches ? DARK : LIGHT)
    })
  }, [matchMedia])

  const getTheme = (light, dark) => mode === LIGHT ? light : dark

  return { mode, getTheme }
}