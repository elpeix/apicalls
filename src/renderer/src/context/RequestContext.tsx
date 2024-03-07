import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext'
import { CALL_API, CALL_API_FAILURE, CALL_API_RESPONSE } from '../../../lib/ipcChannels'
import { createAuth, createAuthHeaderValue, createMethod } from '../lib/factory'

export const RequestContext = createContext<{
  path: PathItem[]
  collectionId?: Identifier | null
  request: RequestContextRequest | null
  fetching: boolean
  fetched: boolean
  response: {
    body: string
    headers: KeyValue[]
    cookies: String[][]
    status: number
    time: number
    size: number
  }
  save: () => void
}>({
  path: [],
  collectionId: null,
  request: null,
  fetching: false,
  fetched: false,
  response: {
    body: '',
    headers: [],
    cookies: [],
    status: 0,
    time: 0,
    size: 0
  },
  save: () => {}
})

export default function RequestContextProvider({
  tab,
  children
}: {
  tab: RequestTab
  children: React.ReactNode
}) {
  const { history, environments, tabs, collections, requestConsole } = useContext(AppContext)

  const path = tab.path || []
  const collectionId = tab.collectionId
  const tabId = tab.id
  const definedRequest = tab.request

  const methods = useMemo(
    () => [
      createMethod('GET'),
      createMethod('POST'),
      createMethod('PUT'),
      createMethod('PATCH'),
      createMethod('DELETE'),
      createMethod('HEAD'),
      createMethod('OPTIONS')
    ],
    []
  )

  // Pre-request scripts will be executed before the request is sent
  const [preRequestData, setPreRequestData] = useState<PreRequestData | null>(null)

  const [changed, setChanged] = useState(false)
  const [requestMethod, setRequestMethod] = useState(definedRequest.method || methods[0])
  const [requestUrl, setRequestUrl] = useState(definedRequest.url || '')
  const [requestBody, setRequestBody] = useState(definedRequest.body || '')
  const [requestAuth, setRequestAuth] = useState(definedRequest.auth || createAuth('none'))
  const [requestHeaders, setRequestHeaders] = useState(definedRequest.headers || [])
  const [requestParams, setRequestParams] = useState(definedRequest.params || [])

  const [launchRequest, setLaunchRequest] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)

  const [responseBody, setResponseBody] = useState('')
  const [responseHeaders, setResponseHeaders] = useState<KeyValue[]>([])
  const [responseCookies, setResponseCookies] = useState<String[][]>([])
  const [responseStatus, setResponseStatus] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [responseSize, setResponseSize] = useState(0)

  useEffect(() => {
    if (changed) {
      setChanged(false)
      tabs?.updateTabRequest(tabId, {
        ...definedRequest,
        method: requestMethod,
        url: requestUrl,
        auth: requestAuth,
        headers: requestHeaders,
        params: requestParams,
        body: requestBody
      })
      return
    }
    if (launchRequest) {
      setLaunchRequest(false)
      sendRequest()
    }
  }, [
    tabId,
    tabs,
    changed,
    definedRequest,
    requestMethod,
    requestUrl,
    requestAuth,
    requestBody,
    requestHeaders,
    requestParams,
    launchRequest
  ])

  useEffect(() => {
    if (!collectionId || !collections) return
    const collection = collections.get(collectionId)
    if (!collection) return
    const preRequestdata = collection.preRequestData
    if (!preRequestdata) return
    setPreRequestData(preRequestData)
  }, [collectionId, collections])

  const fetch = () => {
    setLaunchRequest(true)
  }

  const sendRequest = () => {
    if (!requestUrl || !urlIsValid({})) return
    setFetching(true)

    // TODO Pre-request scripts

    const url = getValue(requestUrl)

    const headers: HeadersInit = {}
    requestHeaders.forEach((header) => {
      if (header.enabled) {
        headers[getValue(header.name)] = getValue(header.value)
      }
    })
    if (requestAuth.type !== 'none' && requestAuth.value) {
      headers['Authorization'] = createAuthHeaderValue({
        type: requestAuth.type,
        value: getValue(requestAuth.value)
      })
    }

    saveHistory()

    const callApiRequest: CallRequest = {
      id: tabId,
      url,
      method: requestMethod.value,
      headers,
      queryParams: requestParams,
      body: requestBody
    }
    window.electron.ipcRenderer.send(CALL_API, callApiRequest)
    window.electron.ipcRenderer.on(CALL_API_RESPONSE, (_: any, callResponse: CallResponse) => {
      if (callResponse.id !== tabId) return
      setFetched(true)
      setResponseTime(callResponse.responseTime.all)
      setResponseStatus(callResponse.status.code)
      setResponseSize(callResponse.contentLength)
      setFetchedHeaders(callResponse.responseHeaders)
      setResponseBody(callResponse.result || '')
      requestConsole?.add({
        method: requestMethod.value,
        url: getFullUrl(),
        status: callResponse.status.code,
        time: callResponse.responseTime.all
      })
      setFetching(false)
      window.electron.ipcRenderer.removeAllListeners(CALL_API_FAILURE)
      window.electron.ipcRenderer.removeAllListeners(CALL_API_RESPONSE)
    })

    const getFullUrl = () => {
      const params = requestParams
        .filter((param) => param.enabled)
        .map((param) => `${param.name}=${param.value}`)
        .join('&')
      return `${url}${params ? '?' + params : ''}`
    }

    window.electron.ipcRenderer.on(CALL_API_FAILURE, (_: any, error: Error) => {
      setFetching(false)
      console.log('error', error)
      window.electron.ipcRenderer.removeAllListeners(CALL_API_FAILURE)
      window.electron.ipcRenderer.removeAllListeners(CALL_API_RESPONSE)
    })
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
        params: requestParams,
        body: requestBody
      }
    })
  }

  const saveRequest = () => {
    if (!collections) return
    if (!collectionId) {
      console.error('No collection selected')
      return
    }
    const request = {
      type: 'collection',
      id: tab.id,
      name: tab.name,
      date: new Date().toISOString(),
      request: {
        method: requestMethod,
        url: requestUrl,
        auth: requestAuth,
        headers: requestHeaders,
        params: requestParams,
        body: requestBody
      }
    } as RequestType
    collections.saveRequest({ path, collectionId, request })
  }

  const urlIsValid = ({ url = requestUrl }) => {
    try {
      getUrl({ url })
      return true
    } catch (err) {
      return false
    }
  }

  const getUrl = ({ url = requestUrl }) => new URL(getValue(url))
  const getValue = (value: string): string => {
    if (!environments) return value
    return environments.replaceVariables(value)
  }

  const setMethod = (method: Method) => {
    if (!method) return
    const definedMethod = methods.find((m) => m.value === method.value)
    if (!definedMethod) return
    setRequestMethod(definedMethod)
    setChanged(true)
  }

  const setUrl = (url: string) => {
    setRequestUrl(url)
    setChanged(true)
  }

  const setFullUrl = (value: string) => {
    const [url, params] = value.split('?')
    setUrl(value)
    setUrl(url)

    const paramList: KeyValue[] = params
      ? params
          .split('&')
          .map((param): KeyValue | undefined => {
            const entry = param.split('=')
            if (entry.length <= 2) {
              const name = entry[0].trim()
              const value = entry[1].trim()
              return { name, value, enabled: true }
            }
          })
          .filter((param): param is KeyValue => param !== undefined)
      : []

    const newParams = requestParams
      .map((param) => {
        const paramIndex = paramList.findIndex((p) => p.name === param.name)
        if (paramIndex > -1) {
          const value = paramList[paramIndex].value
          paramList.splice(paramIndex, 1)
          return { ...param, value }
        } else {
          if (!param.enabled) return param
          return { ...param, toBeRemoved: true }
        }
      })
      .filter((param) => !param.toBeRemoved)

    setParams([...newParams, ...paramList])
  }

  const setBody = (body: string) => {
    setRequestBody(body)
    setChanged(true)
  }

  const setHeaders = (headers: KeyValue[]) => {
    setRequestHeaders(headers)
    setChanged(true)
  }

  const setParams = (params: KeyValue[]) => {
    setRequestParams(params)
    setChanged(true)
  }

  const setFetchedHeaders = (headers: KeyValue[]) => {
    setResponseHeaders(headers)
    const cookies = headers
      .filter((header: KeyValue) => header.name === 'set-cookie')
      .map((cookie) => cookie.value.split(';'))
      .map((cookie) => cookie[0].split('='))
    setResponseCookies(cookies)
  }

  const addParam = () => {
    setRequestParams([...requestParams, { enabled: true, name: '', value: '' }])
  }

  const removeParam = (index: number) => {
    const params = [...requestParams]
    params.splice(index, 1)
    setParams(params)
  }

  const getActiveParamsLength = () => {
    return requestParams.filter((param: KeyValue) => param.enabled).length
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

  const contextValue = {
    path: path || [],
    collectionId,
    request: {
      methods,
      method: requestMethod,
      url: requestUrl,
      body: requestBody,
      auth: requestAuth,
      headers: requestHeaders,
      params: requestParams,
      setMethod,
      setUrl,
      setFullUrl,
      setBody,
      setAuth: setRequestAuth,
      setHeaders,
      setParams,
      addParam,
      removeParam,
      getActiveParamsLength,
      addHeader,
      removeHeader,
      getActiveHeadersLength,
      fetch,
      urlIsValid
    },
    fetching,
    fetched,
    response: {
      body: responseBody,
      headers: responseHeaders,
      cookies: responseCookies,
      status: responseStatus,
      time: responseTime,
      size: responseSize
    },
    save: saveRequest
  }

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
