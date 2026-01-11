import { createMethod } from './factory'

/**
 * Tokenizes a shell command string into arguments, handling quotes and escapes.
 */
function shellTokenize(command: string): string[] {
  const tokens: string[] = []
  let currentToken = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let escaped = false

  for (let i = 0; i < command.length; i++) {
    const char = command[i]

    if (escaped) {
      currentToken += char
      escaped = false
      continue
    }

    if (char === '\\') {
      if (inSingleQuote) {
        currentToken += char
      } else {
        escaped = true
      }
      continue
    }

    if (char === "'") {
      if (inDoubleQuote) {
        currentToken += char
      } else {
        inSingleQuote = !inSingleQuote
      }
      continue
    }

    if (char === '"') {
      if (inSingleQuote) {
        currentToken += char
      } else {
        inDoubleQuote = !inDoubleQuote
      }
      continue
    }

    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      if (inSingleQuote || inDoubleQuote) {
        currentToken += char
      } else if (currentToken.length > 0) {
        tokens.push(currentToken)
        currentToken = ''
      }
      continue
    }

    currentToken += char
  }

  if (currentToken.length > 0) {
    tokens.push(currentToken)
  }

  return tokens
}

export function parseCurl(curlCommand: string): RequestBase {
  // Remove line continuations (backslash followed by newline)
  const cleanCommand = curlCommand.replace(/\\\s*\n/g, ' ')

  const args = shellTokenize(cleanCommand)

  // Remove 'curl' if it's the first argument
  if (args.length > 0 && args[0].trim() === 'curl') {
    args.shift()
  }

  let method = createMethod('GET')
  let url = ''
  const headers: KeyValue[] = []
  const queryParams: KeyValue[] = []
  let body: BodyType = 'none'
  let auth: RequestAuth | undefined = undefined

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    // URL (argument that doesn't start with -)
    if (!arg.startsWith('-')) {
      if (!url) {
        url = arg

        // Extract query params from URL
        const urlParts = url.split('?')
        if (urlParts.length > 1) {
          url = urlParts[0]
          const queryString = urlParts[1]
          const params = new URLSearchParams(queryString)
          params.forEach((value, key) => {
            queryParams.push({
              name: key,
              value: value,
              enabled: true
            })
          })
        }
      }
      continue
    }

    // Method
    if (arg === '-X' || arg === '--request') {
      if (args[i + 1]) {
        method = createMethod(args[i + 1])
        i++
      }
      continue
    }

    // Headers
    if (arg === '-H' || arg === '--header') {
      if (args[i + 1]) {
        const header = args[i + 1]
        const colonIndex = header.indexOf(':')
        if (colonIndex !== -1) {
          const name = header.substring(0, colonIndex).trim()
          const value = header.substring(colonIndex + 1).trim()
          headers.push({ name, value, enabled: true })
        }
        i++
      }
      continue
    }

    // Body
    if (
      arg === '-d' ||
      arg === '--data' ||
      arg === '--data-raw' ||
      arg === '--data-ascii' ||
      arg === '--data-binary'
    ) {
      if (args[i + 1]) {
        // If method is still GET (default), switch to POST implicitly
        if (method.value === 'GET') {
          method = createMethod('POST')
        }

        const value = args[i + 1]
        // Try to detect content type from headers or content
        let contentType = 'json'

        // Basic heuristic: check if it looks like JSON
        try {
          JSON.parse(value)
          contentType = 'json'
        } catch {
          if (value.includes('=')) {
            contentType = 'form-urlencoded'
          } else {
            contentType = 'text'
          }
        }

        body = { contentType: contentType as Exclude<ContentTypes, 'none'>, value }
        i++
      }
      continue
    }

    // Auth
    if (arg === '-u' || arg === '--user') {
      if (args[i + 1]) {
        const [username, password] = args[i + 1].split(':')
        auth = {
          type: 'basic',
          value: { username, password: password || '' }
        }
        i++
      }
      continue
    }

    // Compressed flags (e.g. -vXPOST)
    if (arg.startsWith('-X')) {
      const remaining = arg.substring(2)
      if (remaining) {
        method = createMethod(remaining)
      }
      continue
    }
  }

  return {
    url,
    method,
    headers,
    queryParams,
    body,
    auth
  } as RequestBase
}
