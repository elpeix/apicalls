export function applyTheme(theme: Record<string, string>): void {
  const root = document.documentElement
  Object.keys(theme).forEach((key) => {
    root.style.setProperty(`--${key}`, theme[key])
  })
}

export function removeStyleProperties(): void {
  const root = document.documentElement
  const keys = Array.from(root.style).filter((key) => key.startsWith('--'))
  keys.forEach((key) => root.style.removeProperty(key))
}

export function stringifySize(size: number): string {
  if (size < 1024) {
    return `${size} bytes`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

export function getValueFromPath(json: string, path: string): string | number | boolean {
  try {
    const dict = JSON.parse(json)
    const result = path.split('.').reduce((acc, part) => {
      const arrayMatch = part.match(/([^[\]]+)|(\[\d+\])/g)
      if (!arrayMatch) {
        return acc[part]
      }
      return arrayMatch.reduce((innerAcc, key) => {
        if (key.startsWith('[') && key.endsWith(']')) {
          return innerAcc[parseInt(key.slice(1, -1), 10)]
        }
        return innerAcc[key]
      }, acc)
    }, dict)

    if (typeof result === 'object' || result === undefined) {
      return ''
    }
    return result
  } catch (_) {
    return ''
  }
}

export const queryFilter = (text: string, filter: string): boolean => {
  let filterIndex = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === filter[filterIndex]) {
      filterIndex++
    }
    if (filterIndex === filter.length) {
      return true
    }
  }
  return false
}
