import { createMethod } from './factory'

export function parseCurl(curlCommand: string): RequestBase {
  const curlParts = curlCommand.split('\\\n').map((part) => part.trim())
  const methodPart = curlParts[0].match(/curl -X (\w+)/)
  const urlPart = curlParts[0].match(/'([^']+)'/)
  const headers: KeyValue[] = []
  let body: BodyType = 'none'

  curlParts.slice(1).forEach((part) => {
    if (part.startsWith('-H')) {
      const headerMatch = part.match(/'([^']+): ([^']+)'/)
      if (headerMatch) {
        headers.push({ name: headerMatch[1], value: headerMatch[2], enabled: true })
      }
    } else if (part.startsWith('-d')) {
      const bodyMatch = part.match(/'([^']+)'/)
      if (bodyMatch) {
        body = { contentType: 'json', value: bodyMatch[1] }
      }
    }
  })

  return {
    url: urlPart ? urlPart[1] : '',
    method: methodPart ? createMethod(methodPart[1]) : 'GET',
    headers: headers,
    body: body
  } as RequestBase
}
