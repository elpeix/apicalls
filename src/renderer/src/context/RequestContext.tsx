import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react'
import { AppContext } from './AppContext'
import { REQUEST } from '../../../lib/ipcChannels'
import { createAuth, getMethods } from '../lib/factory'
import {
  getPathParamsFromUrl,
  getQueryParamsFromUrl,
  replacePathParams
} from '../lib/paramsCapturer'
import { useConsole } from '../hooks/useConsole'
import { getBody, getContentType, getValueFromPath } from '../lib/utils'
import { getGeneralDefaultUserAgent } from '../../../lib/defaults'
import { parseCurl } from '../lib/curl'

const responseInitialValue: RequestResponseType = {
  body: '',
  headers: [],
  cookies: [],
  status: 0,
  time: 0,
  size: 0
}

export const RequestContext = createContext<RequestContextType>({
  path: [],
  isActive: false,
  collectionId: null,
  request: null,
  fetching: false,
  fetched: false,
  fetchError: '',
  fetchErrorCause: '',
  response: responseInitialValue,
  save: () => {},
  setEditorState: () => {},
  getEditorState: () => '',
  requestConsole: null,
  getRequestEnvironment: () => null,
  copyAsCurl: () => {},
  pasteCurl: () => {}
})

export default function RequestContextProvider({
  tab,
  children
}: {
  tab: RequestTab
  children: React.ReactNode
}) {
  const {
    history,
    environments,
    tabs,
    collections,
    cookies,
    application,
    workspaces,
    appSettings: settings
  } = useContext(AppContext)

  const path = tab.path || []
  const collectionId = tab.collectionId
  const tabId = tab.id
  const definedRequest = tab.request

  const methods = useMemo(() => getMethods(), [])

  const [collection, setCollection] = useState<Collection | null>(null)
  const activeScriptIds = useRef<Set<string>>(new Set())

  // Pre-request scripts will be executed before the request is sent
  const [preRequestData, setPreRequestData] = useState<PreRequest | null>(null)

  const [changed, setChanged] = useState(false)
  const [saved, setSaved] = useState(false)
  const [requestMethod, setRequestMethod] = useState(definedRequest.method || methods[0])
  const [requestUrl, setRequestUrl] = useState(definedRequest.url || '')
  const [requestBody, setRequestBody] = useState<BodyType>(definedRequest.body || '')
  const [requestAuth, setRequestAuth] = useState(definedRequest.auth || createAuth('none'))
  const [requestHeaders, setRequestHeaders] = useState(definedRequest.headers || [])
  const [requestPathParams, setRequestPathParams] = useState(definedRequest.pathParams || [])
  const [requestQueryParams, setRequestQueryParams] = useState(definedRequest.queryParams || [])
  const [requestFullUrl, setRequestFullUrl] = useState(definedRequest.url || '')
  const [requestPreScript, setRequestPreScript] = useState(definedRequest.preScript || '')
  const [requestPostScript, setRequestPostScript] = useState(definedRequest.postScript || '')
  const [openSaveAs, setOpenSaveAs] = useState(false)

  const [launchRequest, setLaunchRequest] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState<FetchedType>(tab.response ? 'old' : false)
  const [fetchError, setFetchError] = useState('')
  const [fetchErrorCause, setFetchErrorCause] = useState('')
  const [response, setResponse] = useState<RequestResponseType>(
    tab.response || responseInitialValue
  )
  const requestConsole = useConsole()

  const [requestEditorState, setRequestEditorState] = useState('')
  const [responseEditorState, setResponseEditorState] = useState('')

  useEffect(() => {
    if (changed) {
      setChanged(false)
      tabs?.updateTabRequest(tabId, saved, {
        ...definedRequest,
        method: requestMethod,
        url: requestUrl,
        auth: requestAuth,
        headers: requestHeaders,
        pathParams: requestPathParams,
        queryParams: requestQueryParams,
        body: requestBody,
        preScript: requestPreScript,
        postScript: requestPostScript
      })
      return
    }
    if (launchRequest) {
      setLaunchRequest(false)
      sendRequest()
    }
  }, [
    tabId,
    changed,
    saved,
    definedRequest,
    requestMethod,
    requestUrl,
    requestAuth,
    requestBody,
    requestHeaders,
    requestQueryParams,
    requestPreScript,
    requestPostScript,
    launchRequest
  ])

  const CHANNEL_CALL = REQUEST.call
  const CHANNEL_CANCEL = REQUEST.cancel
  const CHANNEL_RESPONSE = `${REQUEST.response}-${tabId}`
  const CHANNEL_FAILURE = `${REQUEST.failure}-${tabId}`
  const CHANNEL_CANCELLED = `${REQUEST.cancelled}-${tabId}`

  useEffect(() => {
    if (!collectionId || !collections) return
    const collection = collections.get(collectionId)
    if (!collection) return
    setCollection(collection)
    if (collection.preRequest) {
      setPreRequestData(collection.preRequest)
    }
  }, [collectionId, collections, preRequestData])

  const fetch = () => {
    setLaunchRequest(true)
  }

  const cancel = () => {
    window.electron?.ipcRenderer.send(CHANNEL_CANCEL, tabId)
    // Cancel any active script requests
    activeScriptIds.current.forEach((id) => {
      window.electron?.ipcRenderer.send(REQUEST.cancel, id)
    })
    activeScriptIds.current.clear()
  }

  const sendRequest = () => {
    if (!requestUrl || !urlIsValid({})) return
    setFetching(true)
    setFetched(false)
    setFetchError('')
    setFetchErrorCause('')

    if (preRequestData && preRequestData.active && preRequestData.request.url.trim().length > 0) {
      sendPreRequest()
    } else {
      sendMainRequest()
    }
  }

  const sendMainRequest = async (requestLogs: RequestLog[] = []) => {
    const environment = getRequestEnvironment()
    const url = getValue(requestUrl)

    // Calculate initial effective headers (Global + Collection + Env + Request + Auth)
    // Cast to Record<string, string> for checking/modification in script
    const effectiveHeaders = getHeaders(url) as Record<string, string>

    // Create a mutable request object to pass through scripts
    const contextRequest = {
      method: requestMethod.value,
      url: requestUrl,
      headers: effectiveHeaders,
      body: requestBody
    }

    // Execute Collection Pre-Script
    if (collection && collection.preScript && collection.preScript.trim().length > 0) {
      const success = await executeScript(collection.preScript, {
        request: contextRequest,
        environment: getScriptEnvironment(environment),
        console: getScriptConsole()
      })
      if (!success) {
        console.error('Collection pre-script failed')
        setFetching(false)
        return
      }
    }

    // Execute Pre-Script
    if (requestPreScript) {
      const success = await executeScript(requestPreScript, {
        request: contextRequest,
        environment: getScriptEnvironment(environment),
        console: getScriptConsole()
      })
      if (!success) {
        setFetching(false)
        return
      }
    }

    saveHistory()

    const queryParams = prepareQueryParams(requestQueryParams)
    // Use the potentially modified values from contextRequest
    const callApiRequest: CallRequest = {
      id: tabId,
      url: contextRequest.url,
      method: {
        value: contextRequest.method,
        label: contextRequest.method,
        body: contextRequest.method !== 'GET' && contextRequest.method !== 'HEAD'
      },
      headers: contextRequest.headers,
      queryParams,
      body:
        contextRequest.body === 'none' || contextRequest.body === ''
          ? undefined
          : getBody(contextRequest.body)
    }
    tab.response = undefined

    window.electron?.ipcRenderer.send(CHANNEL_CALL, callApiRequest)

    window.electron?.ipcRenderer.on(CHANNEL_RESPONSE, (_: unknown, callResponse: CallResponse) => {
      if (callResponse.id !== tabId) return
      setFetched(true)
      setRequestResponse({
        body: callResponse.result || '',
        headers: callResponse.responseHeaders,
        cookies: [],
        time: callResponse.responseTime.all,
        status: callResponse.status.code,
        size: callResponse.contentLength
      })
      setFetchedHeaders(callResponse.responseHeaders)
      setCookies(callResponse.responseHeaders, requestUrl)

      // Execute Post-Script
      // We need to use an async IIFE because the listener callback itself can't be awaited by sendMainRequest
      const runPostScripts = async () => {
        if (requestPostScript) {
          await executeScript(requestPostScript, {
            request: {
              method: contextRequest.method,
              url: contextRequest.url,
              headers: contextRequest.headers,
              body: contextRequest.body
            },
            response: {
              status: callResponse.status.code,
              headers: callResponse.responseHeaders,
              body: tryParseBody(callResponse.result || '{}'),
              rawBody: callResponse.result || ''
            },
            environment: getScriptEnvironment(getRequestEnvironment()),
            console: getScriptConsole()
          })
        }

        // Execute Collection Post-Script
        if (collection && collection.postScript) {
          await executeScript(collection.postScript, {
            request: {
              method: contextRequest.method,
              url: contextRequest.url,
              headers: contextRequest.headers,
              body: contextRequest.body
            },
            response: {
              status: callResponse.status.code,
              headers: callResponse.responseHeaders,
              body: tryParseBody(callResponse.result || '{}'),
              rawBody: callResponse.result || ''
            },
            environment: getScriptEnvironment(getRequestEnvironment()),
            console: getScriptConsole()
          })
        }
      }
      runPostScripts()

      requestConsole?.addAll([
        ...requestLogs,
        {
          method: requestMethod.value,
          url: getFullUrlForConsole(),
          status: callResponse.status.code,
          time: callResponse.responseTime.all,
          request: callApiRequest,
          response: callResponse
        }
      ])
      setFetching(false)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_FAILURE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_RESPONSE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_CANCELLED)
    })

    const getFullUrlForConsole = () => {
      const params = queryParams
        .filter((param) => param.enabled)
        .map((param) => `${param.name}=${param.value}`)
        .join('&')
      return `${url}${params ? '?' + params : ''}`
    }

    window.electron?.ipcRenderer.on(
      CHANNEL_FAILURE,
      (_: unknown, response: CallResponseFailure) => {
        setFetching(false)
        setFetched(true)
        setFetchError(response.message)
        setFetchErrorCause(response.cause ? response.cause.toString() : '')
        requestConsole?.addAll([
          ...requestLogs,
          {
            method: requestMethod.value,
            url: getFullUrlForConsole(),
            status: 999,
            time: 0,
            request: callApiRequest,
            failure: response
          }
        ])
        window.electron?.ipcRenderer.removeAllListeners(CHANNEL_FAILURE)
        window.electron?.ipcRenderer.removeAllListeners(CHANNEL_RESPONSE)
        window.electron?.ipcRenderer.removeAllListeners(CHANNEL_CANCELLED)
      }
    )

    window.electron?.ipcRenderer.on(CHANNEL_CANCELLED, (_: unknown, requestId: number) => {
      if (requestId !== tabId) return
      setFetching(false)
      setFetched(true)
      setFetchError('Request was cancelled')
      requestConsole?.addAll([
        ...requestLogs,
        {
          method: requestMethod.value,
          url: getFullUrlForConsole(),
          status: 499,
          time: 0,
          request: callApiRequest,
          failure: {
            request: callApiRequest,
            message: 'Request was cancelled'
          } as CallResponseFailure
        }
      ])
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_FAILURE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_RESPONSE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_CANCELLED)
    })
  }

  const setRequestResponse = (response: RequestResponseType) => {
    setResponse(response)
    tab.response = settings?.settings?.saveLastResponse ? response : undefined
    tabs?.updateTab(tab.id, tab)
  }

  type ScriptContext = {
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

  const tryParseBody = (body: string) => {
    try {
      return JSON.parse(body)
    } catch {
      return body
    }
  }

  const executeScript = async (script: string, context: ScriptContext): Promise<boolean> => {
    // Add http client to context
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

  const performScriptRequest = (
    method: string,
    url: string,
    body: unknown,
    headers: Record<string, string> = {}
  ): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      // Generate a unique ID for this script request to distinguish it from main requests
      // We use a negative ID or a specific range if possible, or just a very large random number
      // Since tabId is string (UUID) usually? Wait, Identifier is string in types.d.ts?
      // In RequestContext tabId seems to be string.
      // Let's use a composite ID
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
        // ID check if failure has ID? CallResponseFailure usually has request attached
        // But for simplicity if we can't match ID on failure easily, we might need a timeout
        // Assuming response.request.id exists
        if (response.request?.id !== scriptRequestId) return
        cleanUp()
        reject(new Error(response.message))
      }

      window.electron?.ipcRenderer.on(`${REQUEST.response}-${scriptRequestId}`, onResponse)
      window.electron?.ipcRenderer.on(`${REQUEST.failure}-${scriptRequestId}`, onFailure)

      window.electron?.ipcRenderer.send(CHANNEL_CALL, callApiRequest)
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

  const sendPreRequest = () => {
    if (!preRequestData || !preRequestData.active) {
      return
    }
    const environment = getRequestEnvironment()
    if (!environment) {
      return
    }
    const request = preRequestData.request
    const url = getValue(request.url)
    const headers: HeadersInit = {}
    let userAgentDefined = false
    request.headers?.forEach((header) => {
      if (header.enabled && header.name) {
        const headerName = getValue(header.name)
        headers[headerName] = getValue(header.value)
        if (headerName === 'User-Agent') {
          userAgentDefined = true
        }
      }
    })

    if (!userAgentDefined) {
      headers['User-Agent'] = getDefaultUserAgent()
    }

    setDefaultHeaders(headers)

    const callApiRequest: CallRequest = {
      id: tabId,
      url,
      method: request.method,
      headers,
      queryParams: prepareQueryParams(request.queryParams || []),
      body: getBody(request.body || '')
    }

    window.electron?.ipcRenderer.send(CHANNEL_CALL, callApiRequest)

    window.electron?.ipcRenderer.on(CHANNEL_RESPONSE, (_: unknown, callResponse: CallResponse) => {
      if (callResponse.id !== tabId) return
      try {
        preRequestData.dataToCapture.forEach((dataToCapture) => {
          setDataToCapture(callResponse, dataToCapture, environment)
        })
        environments?.update(environment)
      } catch (e) {
        console.error(e)
      }
      const requestLog = {
        method: request.method.value,
        url,
        status: callResponse.status.code,
        time: callResponse.responseTime.all,
        request: callApiRequest,
        response: callResponse
      }
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_FAILURE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_RESPONSE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_CANCELLED)
      sendMainRequest([requestLog])
    })

    window.electron?.ipcRenderer.on(
      CHANNEL_FAILURE,
      (_: unknown, response: CallResponseFailure) => {
        setFetching(false)
        setFetched(true)
        setFetchError(response.message)
        requestConsole?.add({
          method: requestMethod.value,
          url,
          status: 999,
          time: 0,
          request: callApiRequest,
          failure: response
        })
        window.electron?.ipcRenderer.removeAllListeners(CHANNEL_FAILURE)
        window.electron?.ipcRenderer.removeAllListeners(CHANNEL_RESPONSE)
        window.electron?.ipcRenderer.removeAllListeners(CHANNEL_CANCELLED)
      }
    )

    window.electron?.ipcRenderer.on(CHANNEL_CANCELLED, (_: unknown, requestId: number) => {
      if (requestId !== tabId) return
      setFetching(false)
      setFetched(true)
      setFetchError('Request was cancelled')
      requestConsole?.add({
        method: requestMethod.value,
        url,
        status: 499,
        time: 0,
        request: callApiRequest,
        failure: {
          request: callApiRequest,
          message: 'Request was cancelled'
        } as CallResponseFailure
      })

      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_FAILURE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_RESPONSE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_CANCELLED)
    })
  }

  const getDefaultUserAgent = () => {
    const settingsHeader = settings?.settings?.defaultHeaders?.find(
      (header) => header.name === 'User-Agent'
    )
    if (settingsHeader && settingsHeader.enabled && settingsHeader.value) {
      return getValue(settingsHeader.value)
    }
    return getGeneralDefaultUserAgent(application.version)
  }

  const setDefaultHeaders = (headers: Record<string, string>) => {
    const headerNamesLower = Object.keys(headers).map((h) => h.toLowerCase())

    const setHeaders = (definedHeaders: KeyValue[] | undefined) => {
      definedHeaders?.forEach((header) => {
        if (
          header.enabled &&
          header.name &&
          !headerNamesLower.includes(header.name.toLowerCase())
        ) {
          headers[header.name] = getValue(header.value)
          headerNamesLower.push(header.name.toLowerCase())
        }
      })
    }

    setHeaders(collection?.requestHeaders)
    setHeaders(getRequestEnvironment()?.requestHeaders)
    setHeaders(workspaces?.selectedWorkspace?.requestHeaders)
    setHeaders(settings?.settings?.defaultHeaders)
  }

  const prepareQueryParams = (queryParams: KeyValue[]) => {
    return queryParams
      .filter((queryParam: KeyValue) => queryParam.enabled)
      .map((queryParam: KeyValue) => {
        return {
          name: getValue(queryParam.name),
          value: getValue(queryParam.value || ''),
          enabled: queryParam.enabled
        } as KeyValue
      })
  }

  const getRequestEnvironment = () => {
    if (collection && collection.environmentId) {
      const environment = environments?.get(collection.environmentId)
      if (environment) {
        return environment
      }
    }
    const environment = environments?.getActive()
    if (!environment) {
      return null
    }
    return environment
  }

  const setDataToCapture = (
    callResponse: CallResponse,
    dataToCapture: PreRequestDataToCapture,
    environment: Environment
  ) => {
    const name = dataToCapture.setEnvironmentVariable
    let value: string | number | boolean = ''
    if (dataToCapture.type === 'body') {
      value = getValueFromPath(callResponse.result || '', dataToCapture.path)
      const jsonResult = JSON.parse(callResponse.result || '{}')
      value = jsonResult[dataToCapture.path] // FIXME: Real path is not implemented
    } else if (dataToCapture.type === 'header') {
      value =
        callResponse.responseHeaders
          .find((header) => header.name === dataToCapture.path)
          ?.value.toString() || ''
    }
    const variable = environment.variables.find((variable) => variable.name === name)
    if (variable) {
      variable.value = value as string
    } else {
      environment.variables = [
        ...environment.variables,
        {
          name: name,
          value: value.toString()
        }
      ]
    }
  }

  const saveHistory = () => {
    if (!history) return
    history.add({
      type: 'history',
      date: new Date().toISOString(),
      id: new Date().getTime(),
      name: `${requestMethod.value} - ${requestUrl}`,
      request: {
        method: requestMethod,
        url: requestUrl,
        auth: requestAuth,
        headers: requestHeaders,
        pathParams: requestPathParams,
        queryParams: requestQueryParams,
        body: requestBody
      }
    })
  }

  const saveRequest = () => {
    if (!collections) return
    if (!collectionId) {
      setOpenSaveAs(true)
      return
    }
    tabs?.saveTab(tab.id)
    setSaved(true)
    setChanged(true)
  }

  const urlIsValid = ({ url = requestUrl }) => {
    try {
      getUrl({ url })
      return true
    } catch (_err) {
      return false
    }
  }

  const getUrl = ({ url = requestUrl }) => new URL(getValue(url))

  const getValue = (value: string): string => {
    if (requestPathParams) {
      value = replacePathParams(value, requestPathParams)
    }
    if (environments) {
      const enviroment = getRequestEnvironment()
      if (enviroment) {
        value = environments.replaceVariables(enviroment.id, value)
      }
    }
    return value
  }

  const getHeaders = (url: string) => {
    const headers: HeadersInit = {}
    let userAgentDefined = false
    let contentTypeDefined = false
    requestHeaders.forEach((header) => {
      if (header.enabled && header.name) {
        const headerName = getValue(header.name)
        headers[headerName] = getValue(header.value)
        if (headerName.toLowerCase() === 'user-agent') {
          userAgentDefined = true
        }
        if (headerName.toLowerCase() === 'content-type') {
          contentTypeDefined = true
        }
      }
    })
    if (!userAgentDefined) {
      headers['User-Agent'] = getDefaultUserAgent()
    }

    if (!contentTypeDefined && requestMethod.body && typeof requestBody !== 'string') {
      const contentType = getContentType(requestBody)
      if (contentType) {
        headers['Content-Type'] = contentType
      }
    }

    setDefaultHeaders(headers)

    if (requestAuth.type !== 'none' && requestAuth.value) {
      if (requestAuth.type === 'bearer') {
        const value = getValue(requestAuth.value as string)
        headers['Authorization'] = `Bearer ${getValue(value)}`
      } else if (requestAuth.type === 'basic') {
        const requestAuthRecord = requestAuth.value as RequestAuthBasic
        const username = requestAuthRecord.username || ''
        const password = requestAuthRecord.password || ''
        headers['Authorization'] = `Basic ${btoa(`${getValue(username)}:${getValue(password)}`)}`
      }
    }
    if (settings?.settings?.manageCookies) {
      const originCookies = cookies?.stringify(getValue(url))
      if (originCookies) {
        headers['Cookie'] = originCookies
      }
    }
    return headers
  }

  const setCookies = (headers: KeyValue[], url: string) => {
    if (settings?.settings?.manageCookies) {
      cookies?.upsert(headers, getValue(url))
    }
  }

  const setMethod = (method: Method) => {
    if (!method) return
    const definedMethod = methods.find((m) => m.value === method.value)
    if (!definedMethod) return
    setRequestMethod(definedMethod)
    setChanged(true)
    setSaved(false)
  }

  const setUrl = (url: string) => {
    setRequestUrl(url)
    setChanged(true)
    setSaved(false)
  }

  const setFullUrl = (value: string) => {
    if (value === requestFullUrl) return
    setRequestFullUrl(value)
    const [url, params] = value.split('?')
    setUrl(url)
    setPathParams(getPathParamsFromUrl(url, requestPathParams))
    setQueryParams(getQueryParamsFromUrl(params, requestQueryParams))
  }

  const getFullUrl = () => {
    const queryParams = new URLSearchParams()
    if (requestQueryParams) {
      requestQueryParams
        .filter((param) => param.enabled && param.name)
        .forEach((param) => {
          queryParams.append(param.name, param.value)
        })
    }
    let queryParamsValue = queryParams.size ? '?' + queryParams.toString() : ''
    const environment = getRequestEnvironment()
    const envVariables = environment?.variables || []
    envVariables.forEach((variable) => {
      queryParamsValue = queryParamsValue.replaceAll(
        `%7B%7B${variable.name}%7D%7D`,
        `{{${variable.name}}}`
      )
    })
    return `${requestUrl}${queryParamsValue}`
  }

  const setBody = (body: BodyType) => {
    if (
      typeof requestBody !== 'string' &&
      typeof body !== 'string' &&
      requestBody.contentType === body.contentType &&
      requestBody.value === body.value
    ) {
      return
    }
    setRequestBody(body)
    setChanged(true)
    setSaved(false)
  }

  const setHeaders = (headers: KeyValue[]) => {
    if (keyValuesAreEqual(headers, requestHeaders)) return
    setRequestHeaders(headers)
    setChanged(true)
    setSaved(false)
  }

  const addHeader = () => {
    setHeaders([...requestHeaders, { enabled: true, name: '', value: '' }])
  }

  const removeHeader = (index: number) => {
    const headers = [...requestHeaders]
    headers.splice(index, 1)
    setHeaders(headers)
  }

  const getActiveHeadersLength = () => {
    return requestHeaders.filter((header: KeyValue) => header.enabled).length
  }

  const setFetchedHeaders = (headers: KeyValue[]) => {
    const cookies = headers
      .filter((header: KeyValue) => header.name === 'set-cookie')
      .map((cookie) => cookie.value.split(';'))
      .map((cookie) => cookie[0].split('='))
    setResponse((prev: RequestResponseType) => ({ ...prev, headers, cookies }))
  }

  const setPathParams = (pathParams: KeyValue[]) => {
    if (keyValuesAreEqual(pathParams, requestPathParams)) return
    setRequestPathParams(pathParams)
    setChanged(true)
    setSaved(false)
  }

  const removePathParam = (index: number) => {
    const params = [...requestPathParams]
    params.splice(index, 1)
    setPathParams(params)
  }

  const getActivePathParamsLength = () => {
    return requestPathParams.filter((param: KeyValue) => param.enabled).length
  }

  const setQueryParams = (params: KeyValue[]) => {
    if (keyValuesAreEqual(params, requestQueryParams)) return
    setRequestQueryParams(params)
    setChanged(true)
    setSaved(false)
  }

  const keyValuesAreEqual = (a: KeyValue[], b: KeyValue[]) => {
    if (a.length !== b.length) return false
    return a.every((item, index) => keyValueAreEqual(item, b[index]))
  }

  const keyValueAreEqual = (a: KeyValue, b: KeyValue) => {
    return (
      a.name === b.name &&
      a.value === b.value &&
      a.enabled === b.enabled &&
      a.toBeRemoved === b.toBeRemoved
    )
  }

  const addQueryParam = () => {
    setRequestQueryParams([...requestQueryParams, { enabled: true, name: '', value: '' }])
  }

  const removeQueryParam = (index: number) => {
    const params = [...requestQueryParams]
    params.splice(index, 1)
    setQueryParams(params)
  }

  const getActiveQueryParamsLength = () => {
    return requestQueryParams.filter((param: KeyValue) => param.enabled).length
  }

  const setAuth = (auth: RequestAuth) => {
    setRequestAuth(auth)
    setChanged(true)
    setSaved(false)
  }

  const setPreScript = (script: string) => {
    setRequestPreScript(script)
    setChanged(true)
    setSaved(false)
  }

  const setPostScript = (script: string) => {
    setRequestPostScript(script)
    setChanged(true)
    setSaved(false)
  }

  const setEditorState = (type: 'request' | 'response', state: string) => {
    if (type === 'request') {
      setRequestEditorState(state)
    } else {
      setResponseEditorState(state)
    }
  }

  const getEditorState = (type: 'request' | 'response') => {
    if (type === 'request') {
      return requestEditorState
    }
    return responseEditorState
  }

  const copyAsCurl = () => {
    const url = getValue(requestUrl)
    let path = url
    const queryParams = prepareQueryParams(requestQueryParams)
    const urlParams = new URLSearchParams()
    if (queryParams && queryParams.length > 0) {
      queryParams
        .filter((param) => param.enabled && param.name)
        .forEach((param) => {
          urlParams.append(param.name, param.value)
        })
      path += `?${urlParams.toString()}`
    }
    const headers: Record<string, string> = getHeaders(url)
    let curl = `curl -X ${requestMethod.value} '${path}'`
    if (headers && Object.keys(headers).length > 0) {
      Object.keys(headers).forEach((key) => {
        curl += `\\\n  -H '${key}: ${headers[key]}'`
      })
    }
    if (requestBody && requestMethod.body) {
      curl += `\\\n  -d '${getBody(requestBody)}'`
    }
    navigator.clipboard.writeText(curl)
    application.notify({ message: 'cURL command copied to clipboard' })
  }

  const pasteCurl = (curlCommand: string) => {
    const requestBase = parseCurl(curlCommand)
    if (!requestBase) {
      application.notify({ message: 'Invalid cURL command' })
      return
    }

    setRequestMethod(requestBase.method)
    setRequestUrl(requestBase.url)
    setRequestHeaders(requestBase.headers || [])
    setQueryParams(requestBase.queryParams || [])
    setRequestBody(requestBase.body || 'none')
  }

  const contextValue = {
    path: path || [],
    isActive: tab.active,
    collectionId,
    request: {
      method: requestMethod,
      url: requestUrl,
      body: requestBody,
      auth: requestAuth,
      preScript: requestPreScript,
      postScript: requestPostScript,
      headers: {
        items: requestHeaders,
        set: setHeaders,
        add: addHeader,
        remove: removeHeader,
        getActiveLength: getActiveHeadersLength
      },
      pathParams: {
        items: requestPathParams,
        set: setPathParams,
        remove: removePathParam,
        getActiveLength: getActivePathParamsLength
      },
      queryParams: {
        items: requestQueryParams,
        set: setQueryParams,
        add: addQueryParam,
        remove: removeQueryParam,
        getActiveLength: getActiveQueryParamsLength
      },
      setMethod,
      setUrl,
      setFullUrl,
      getFullUrl,
      setBody,
      setAuth,
      setPreScript,
      setPostScript,
      fetch,
      cancel,
      urlIsValid
    },
    fetching,
    fetched,
    fetchError,
    fetchErrorCause,
    response: response,
    save: saveRequest,
    saved,
    requestConsole,
    tabId,
    openSaveAs,
    setOpenSaveAs,
    setEditorState,
    getEditorState,
    getRequestEnvironment,
    copyAsCurl,
    pasteCurl
  }

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
