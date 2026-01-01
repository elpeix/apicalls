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

export const queryFilter = (text: string, filter: string): number => {
  let filterIndex = 0
  let consecutive = 0
  let consecutiveFound = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === filter[filterIndex]) {
      filterIndex++
      consecutive++
    } else {
      consecutiveFound = Math.max(consecutiveFound, consecutive)
      consecutive = 0
    }
    if (filterIndex === filter.length) {
      consecutiveFound = Math.max(consecutiveFound, consecutive)
      return consecutiveFound
    }
  }
  return 0
}

export const stringArrayEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export const getBody = (body: BodyType): string => {
  if (body === 'none' || body === '') return ''
  return typeof body === 'string' ? body : body.value || ''
}
export const getContentType = (body: BodyType): string | undefined => {
  const contentTypes: Record<Exclude<ContentTypes, 'none'>, string> = {
    json: 'application/json',
    xml: 'application/xml',
    text: 'text/plain',
    'form-data': 'multipart/form-data',
    'form-urlencoded': 'application/x-www-form-urlencoded'
  }
  if (body === 'none' || body === '') return undefined
  if (typeof body === 'string') {
    return contentTypes.text
  }
  return contentTypes[body.contentType]
}
