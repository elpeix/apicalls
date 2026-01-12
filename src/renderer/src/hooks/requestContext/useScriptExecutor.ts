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
    queryParams: KeyValue[]
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

  const executeScript = async (script: string, context: ScriptContext): Promise<boolean> => {
    return new Promise((resolve) => {
      const TIMEOUT_MS = 60000 // 1 minute - TODO: Make configurable
      let timeoutId: NodeJS.Timeout | undefined = undefined
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      // Allow scripts, but NO same-origin (blocks access to parent DOM/cookies/storage)
      iframe.sandbox.add('allow-scripts')
      document.body.appendChild(iframe)

      const scriptConsole = getScriptConsole()
      const scriptEnv = getScriptEnvironment((environments && environments.getActive()) || null)

      const cleanup = () => {
        clearTimeout(timeoutId)
        window.removeEventListener('message', handleMessage)
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }

      const handleMessage = async (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) return
        if (event.origin !== window.location.origin && event.origin !== 'null') {
          return
        }
        const data = event.data

        if (data.type === 'log') {
          scriptConsole.log(data.message)
        } else if (data.type === 'error') {
          scriptConsole.error(data.message)
        } else if (data.type === 'env-set') {
          scriptEnv.set(data.key, data.value)
        } else if (data.type === 'env-unset') {
          scriptEnv.unset(data.key)
        } else if (data.type === 'http-request') {
          try {
            const result = await performScriptRequest(
              data.method,
              data.url,
              data.body,
              data.headers
            )
            if (document.body.contains(iframe) && iframe.contentWindow) {
              iframe.contentWindow.postMessage({ type: 'http-response', id: data.id, result }, '*')
            }
          } catch (err) {
            const serializedError =
              err instanceof Error
                ? { name: err.name, message: err.message, stack: err.stack }
                : { message: String(err) }
            iframe.contentWindow?.postMessage(
              { type: 'http-error', id: data.id, error: serializedError },
              '*'
            )
          }
        } else if (data.type === 'execution-complete') {
          if (data.request) {
            Object.assign(context.request, data.request)
          }
          if (data.response && context.response) {
            Object.assign(context.response, data.response)
          }
          cleanup()
          resolve(true)
        } else if (data.type === 'execution-error') {
          application.showAlert({
            message: 'Script error: ' + data.error,
            buttonColor: 'danger'
          })
          scriptConsole.error('Script error: ' + data.error)
          cleanup()
          resolve(false)
        }
      }

      window.addEventListener('message', handleMessage)

      // The runtime code that runs INSIDE the iframe
      // This is now static code, safe from injection
      const runtimeCode = `
        window.addEventListener('message', async (event) => {
          if (event.data.type !== 'START_EXECUTION') return;
          
          const { script, context } = event.data;

          // SHIM: Console
          const safeStringify = (arg) => {
            if (arg instanceof Error) {
              return arg.stack || arg.message || String(arg);
            }
            if (typeof arg === 'bigint') {
              // JSON.stringify throws on BigInt
              return arg.toString();
            }
            if (typeof arg === 'object' && arg !== null) {
              try {
                return JSON.stringify(arg, null, 2);
              } catch (e) {
                // Fallback for circular or unserializable objects
                try {
                  return Object.prototype.toString.call(arg);
                } catch {
                  return String(arg);
                }
              }
            }
            return String(arg);
          };

          const console = {
            log: (...args) => window.parent.postMessage({ type: 'log', message: args.map(safeStringify).join(' ') }, '*'),
            error: (...args) => window.parent.postMessage({ type: 'error', message: args.map(safeStringify).join(' ') }, '*')
          };

          // SHIM: Environment
          const environment = {
            get: (key) => context.environmentVars.find(v => v.name === key)?.value,
            set: (key, value) => {
               const v = context.environmentVars.find(v => v.name === key);
               if(v) v.value = value;
               else context.environmentVars.push({ name: key, value: String(value) });
               window.parent.postMessage({ type: 'env-set', key, value }, '*');
            },
            unset: (key) => {
               context.environmentVars = context.environmentVars.filter(v => v.name !== key);
               window.parent.postMessage({ type: 'env-unset', key }, '*');
            }
          };

          // SHIM: HTTP
          const createHttp = () => {
            const pendingRequests = new Map();

            window.addEventListener('message', (event) => {
               if (event.data.type === 'http-response' || event.data.type === 'http-error') {
                 const resolver = pendingRequests.get(event.data.id);
                 if (resolver) {
                   resolver(event.data);
                   pendingRequests.delete(event.data.id);
                 }
               }
            });

            const request = (method, url, body, headers) => {
              return new Promise((resolve, reject) => {
                const id = Math.random().toString(36);
                const timeoutId = setTimeout(() => {
                    pendingRequests.delete(id);
                    reject(new Error('Request timed out'));
                }, 30000); // 30s internal timeout

                pendingRequests.set(id, (data) => {
                    clearTimeout(timeoutId);
                    if (data.type === 'http-response') resolve(data.result);
                    else reject(data.error);
                });
                window.parent.postMessage({ type: 'http-request', id, method, url, body, headers }, '*');
              });
            };

            return {
              get: (url, headers) => request('GET', url, null, headers),
              post: (url, body, headers) => request('POST', url, body, headers),
              put: (url, body, headers) => request('PUT', url, body, headers),
              delete: (url, headers) => request('DELETE', url, null, headers),
              request
            };
          };
          
          const http = createHttp();
          const { request, response } = context;

          try {
             // Use new Function to execute the script string in this scope
             // properties defined above (console, environment, http, request, response) are available via closure/scope
             const userScriptFunction = new Function(
                'console', 
                'environment', 
                'http', 
                'request', 
                'response', 
                'return (async () => { ' + script + ' })()'
             );
             
             await userScriptFunction(console, environment, http, request, response);
             
             window.parent.postMessage({ type: 'execution-complete', request: context.request, response: context.response }, '*');
          } catch (e) {
             window.parent.postMessage({ type: 'execution-error', error: e.toString() }, '*');
          }
        });
      `

      // Write the content to the iframe
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body>
        <script>
          ${runtimeCode}
        </script>
        </body>
        </html>
      `

      iframe.onload = () => {
        iframe.contentWindow?.postMessage(
          {
            type: 'START_EXECUTION',
            script: script + '\n', // Add newline to prevent syntax error
            context: {
              request: context.request,
              response: context.response,
              environmentVars: environments?.getActive()?.variables || []
            }
          },
          '*'
        )
      }

      iframe.srcdoc = htmlContent

      timeoutId = setTimeout(() => {
        scriptConsole.error(`Script execution timed out after ${TIMEOUT_MS}ms`)
        cleanup()
        resolve(false)
      }, TIMEOUT_MS)
    })
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
