export const getLanguageName = (source) => {
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

export const formatSource = (source) => {
  if (isJson(source)) {
    return JSON.stringify(JSON.parse(source), null, 2)
  }
  return source
}


const isJson = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
const isXml = (source) => source.startsWith('<?xml')
const isHtml = (source) => source.startsWith('<!DOCTYPE html')