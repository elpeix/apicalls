import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext'
import { CALL_API, CALL_API_FAILURE, CALL_API_RESPONSE } from '../../../lib/ipcChannels'
import { createMethod } from '../lib/factory'

export const RequestContext = createContext<{
  path: PathItem[]
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
  console: {
    logs: RequestLog[]
    clear: () => void
  } | null
}>({
  path: [],
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
  save: () => {},
  console: null
})

export default function RequestContextProvider({
  tabId,
  requestName = '',
  requestId = 0,
  definedRequest,
  collectionId,
  path,
  children
}: {
  tabId: Identifier
  requestName?: string
  requestId?: Identifier
  collectionId?: Identifier | null
  definedRequest: RequestBase
  path?: PathItem[]
  children: React.ReactNode
}) {
  const { history, environments, tabs, collections } = useContext(AppContext)

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
  const [requestHeaders, setRequestHeaders] = useState(definedRequest.headers || [])
  const [requestParams, setRequestParams] = useState(definedRequest.params || [])

  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)

  const [responseBody, setResponseBody] = useState('')
  const [responseHeaders, setResponseHeaders] = useState<KeyValue[]>([])
  const [responseCookies, setResponseCookies] = useState<String[][]>([])
  const [responseStatus, setResponseStatus] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [responseSize, setResponseSize] = useState(0)

  const [consoleLogs, setConsoleLogs] = useState<RequestLog[]>([])

  useEffect(() => {
    if (changed) {
      setChanged(false)
      tabs?.updateTabRequest(tabId, {
        ...definedRequest,
        method: requestMethod,
        url: requestUrl,
        headers: requestHeaders,
        params: requestParams,
        body: requestBody
      })
    }
  }, [
    tabId,
    tabs,
    changed,
    definedRequest,
    requestMethod,
    requestUrl,
    requestBody,
    requestHeaders,
    requestParams
  ])

  useEffect(() => {
    if (!collectionId || !collections) return
    const collection = collections.get(collectionId)
    if (!collection) return
    const preRequestdata = collection.preRequestData
    if (!preRequestdata) return
    setPreRequestData(preRequestData)
  }, [collectionId, collections])

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
      setConsoleLogs([
        ...consoleLogs,
        {
          method: requestMethod.value,
          url: url,
          status: callResponse.status.code,
          time: callResponse.responseTime.all
        }
      ])
      setFetching(false)
    })

    window.electron.ipcRenderer.on(CALL_API_FAILURE, (_: any, error: Error) => {
      console.log('error', error)
      setFetching(false)
    })
  }

  const saveHistory = () => {
    if (!history) return
    history.add({
      type: 'history',
      date: new Date().toISOString(),
      id: new Date().getTime(),
      name: requestName || `${requestMethod.value} - ${requestUrl}`,
      request: {
        method: requestMethod,
        url: requestUrl,
        headers: requestHeaders,
        params: requestParams,
        body: requestBody
      }
    })
  }

  const saveRequest = () => {
    // TODO
    console.log('saveRequest', requestId)
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
    request: {
      methods,
      method: requestMethod,
      url: requestUrl,
      body: requestBody,
      headers: requestHeaders,
      params: requestParams,
      setMethod,
      setUrl,
      setBody,
      setHeaders,
      setParams,
      addParam,
      removeParam,
      getActiveParamsLength,
      addHeader,
      removeHeader,
      getActiveHeadersLength,
      fetch: sendRequest,
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
    save: saveRequest,
    console: {
      logs: consoleLogs,
      clear: () => setConsoleLogs([])
    }
  }

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
