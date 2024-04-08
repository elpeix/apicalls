export const getLanguageName = (source: string) => {
  source = source.trim()
  if (isJson(source)) {
    return 'json'
  }
  if (isXml(source)) {
    return 'xml'
  }
  if (isHtml(source)) {
    return 'html'
  }
  return 'text'
}

export const formatSource = (source: string) => {
  if (isJson(source)) {
    return JSON.stringify(JSON.parse(source), null, 2)
  }
  return source
}

const isJson = (str: string) => {
  try {
    JSON.parse(str)
  } catch (_error) {
    return false
  }
  return true
}
const isXml = (source: string) => source.startsWith('<?xml')
const isHtml = (source: string) => source.startsWith('<!DOCTYPE html')
