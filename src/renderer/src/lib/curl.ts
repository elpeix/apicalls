import { createMethod } from './factory'

export function parseCurl(curlCommand: string): RequestBase {
  const curlReplace = /^curl\s+/
  const argsMatch = /(?:[^\s"']+|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')+/g
  const args = curlCommand.replace(curlReplace, '').match(argsMatch) || []

  let method = createMethod('GET')
  let url = ''
  const headers: KeyValue[] = []
  const queryParams: KeyValue[] = []
  let body: BodyType = 'none'

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    // Method
    if (arg === '-X' && args[i + 1]) {
      method = createMethod(args[i + 1].replace(/['"]/g, ''))
      i++
      continue
    }

    // Headers
    if (arg === '-H' && args[i + 1]) {
      const header = args[i + 1].replace(/^['"]|['"]$/g, '')
      const [name, ...rest] = header.split(':')
      headers.push({ name, value: rest.join(':').trim(), enabled: true })
      i++
      continue
    }

    // Body
    if (arg === '-d' && args[i + 1]) {
      const value = args[i + 1].replace(/^['"]|['"]$/g, '')
      body = { contentType: 'json', value }
      i++
      continue
    }

    // URL
    if (!arg.startsWith('-') && !arg.startsWith('\\')) {
      url = arg
        .replace(/\\$/, '') // Remove trailing slash if present
        .trim()
        .replace(/^['"]|['"]$/g, '')

      // Split query parameters if present
      const urlParts = url.split('?')
      if (urlParts.length > 1) {
        url = urlParts[0]
        const queryString = urlParts[1]
        queryString.split('&').forEach((param) => {
          const [name, value] = param.split('=')
          if (name && value) {
            queryParams.push({
              name: decodeURIComponent(name),
              value: decodeURIComponent(value),
              enabled: true
            })
          }
        })
      }
    }
  }

  return {
    url,
    method,
    headers,
    queryParams,
    body
  } as RequestBase
}
