import { useRef } from 'react'
import { REQUEST } from '../../../../lib/ipcChannels'

type ScriptExecutorProps = {
  environments: EnvironmentsHookType | null
  application: ApplicationType
  requestConsole: ConsoleHookType | null
}

export type ScriptContext = {
  request: {
    method: string
    url: string
    headers: Record<string, string>
    body: BodyType
  }
  response?: {
    status: number
    headers: KeyValue[]
    body: unknown
    rawBody: string
  }
  environment: {
    get: (key: string) => string | undefined
    set: (key: string, value: string) => void
  }
  console: {
    log: (message: unknown) => void
    error: (message: unknown) => void
  }
  http?: {
    get: (url: string, headers?: Record<string, string>) => Promise<unknown>
    post: (url: string, body: unknown, headers?: Record<string, string>) => Promise<unknown>
    put: (url: string, body: unknown, headers?: Record<string, string>) => Promise<unknown>
    delete: (url: string, headers?: Record<string, string>) => Promise<unknown>
    request: (
      method: string,
      url: string,
      body?: unknown,
      headers?: Record<string, string>
    ) => Promise<unknown>
  }
}

export function useScriptExecutor({
  // tabId, // Removed unused
  environments,
  application,
  requestConsole
}: ScriptExecutorProps) {
  const activeScriptIds = useRef<Set<string>>(new Set())

  const tryParseBody = (body: string) => {
    try {
      return JSON.parse(body)
    } catch {
      return body
    }
  }

  const getScriptEnvironment = (env: Environment | null) => {
    return {
      get: (key: string) => {
        return env?.variables.find((v) => v.name === key)?.value
      },
      set: (key: string, value: string) => {
        if (!env) return
        const variable = env.variables.find((v) => v.name === key)
        if (variable) {
          variable.value = value
        } else {
          env.variables.push({ name: key, value: value.toString(), enabled: true })
        }
        environments?.update(env)
      },
      unset: (key: string) => {
        if (!env) return
        env.variables = env.variables.filter((v) => v.name !== key)
        environments?.update(env)
      }
    }
  }

  const getScriptConsole = () => {
    const safeStringify = (message: unknown): string => {
      try {
        if (typeof message === 'string') return message
        if (typeof message === 'object') return JSON.stringify(message, null, 2)
        return String(message)
      } catch (_e) {
        return '[Circular or Non-Serializable Object]'
      }
    }

    return {
      log: (message: unknown) => {
        console.log('Script Log:', message)
        requestConsole?.add({
          type: 'log',
          message: safeStringify(message),
          time: new Date().getTime()
        })
      },
      error: (message: unknown) => {
        console.error('Script Error:', message)
        requestConsole?.add({
          type: 'error',
          message: safeStringify(message),
          time: new Date().getTime()
        })
      }
    }
  }

  const performScriptRequest = (
    method: string,
    url: string,
    body: unknown,
    headers: Record<string, string> = {}
  ): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const scriptRequestId = `script-${Date.now()}-${Math.random()}`

      const callApiRequest: CallRequest = {
        id: scriptRequestId,
        url,
        method: { value: method, label: method, body: method !== 'GET' && method !== 'HEAD' },
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body || '')
      }

      activeScriptIds.current.add(scriptRequestId)

      const cleanUp = () => {
        window.electron?.ipcRenderer.removeListener(
          `${REQUEST.response}-${scriptRequestId}`,
          onResponse
        )
        window.electron?.ipcRenderer.removeListener(
          `${REQUEST.failure}-${scriptRequestId}`,
          onFailure
        )
        activeScriptIds.current.delete(scriptRequestId)
      }

      const onResponse = (_: unknown, callResponse: CallResponse) => {
        if (callResponse.id !== scriptRequestId) return
        cleanUp()
        resolve({
          status: callResponse.status.code,
          statusText: callResponse.status.text,
          headers: callResponse.responseHeaders,
          body: tryParseBody(callResponse.result || '{}'),
          rawBody: callResponse.result || ''
        })
      }

      const onFailure = (_: unknown, response: CallResponseFailure) => {
        if (response.request?.id !== scriptRequestId) return
        cleanUp()
        reject(new Error(response.message))
      }

      window.electron?.ipcRenderer.on(`${REQUEST.response}-${scriptRequestId}`, onResponse)
      window.electron?.ipcRenderer.on(`${REQUEST.failure}-${scriptRequestId}`, onFailure)

      window.electron?.ipcRenderer.send(REQUEST.call, callApiRequest)
    })
  }

  const executeScript = async (script: string, context: ScriptContext): Promise<boolean> => {
    const http = {
      get: (url: string, headers?: Record<string, string>) =>
        performScriptRequest('GET', url, undefined, headers),
      post: (url: string, body: unknown, headers?: Record<string, string>) =>
        performScriptRequest('POST', url, body, headers),
      put: (url: string, body: unknown, headers?: Record<string, string>) =>
        performScriptRequest('PUT', url, body, headers),
      delete: (url: string, headers?: Record<string, string>) =>
        performScriptRequest('DELETE', url, undefined, headers),
      request: (method: string, url: string, body?: unknown, headers?: Record<string, string>) =>
        performScriptRequest(method, url, body, headers)
    }

    try {
      const func = new Function(
        'request',
        'response',
        'environment',
        'console',
        'http',
        'window',
        'document',
        'alert',
        'confirm',
        'prompt',
        'fetch',
        'XMLHttpRequest',
        'globalThis',
        'self',
        `return (async () => { ${script + '\n\n'} })()`
      )
      await func(
        context.request,
        context.response,
        context.environment,
        context.console,
        http,
        undefined, // window
        undefined, // document
        undefined, // alert
        undefined, // confirm
        undefined, // prompt
        undefined, // fetch
        undefined, // XMLHttpRequest
        undefined, // globalThis
        undefined // self
      )
      return true
    } catch (err) {
      application.showAlert({
        message: 'Script error: ' + err,
        buttonColor: 'danger'
      })
      getScriptConsole().error('Script error: ' + err)
      return false
    }
  }

  const cancelScripts = () => {
    activeScriptIds.current.forEach((id) => {
      window.electron?.ipcRenderer.send(REQUEST.cancel, id)
    })
    activeScriptIds.current.clear()
  }

  return {
    executeScript,
    cancelScripts,
    getScriptEnvironment,
    getScriptConsole,
    tryParseBody
  }
}

export type ScriptExecutorType = ReturnType<typeof useScriptExecutor>
