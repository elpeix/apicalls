import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext'

export const RequestContext = createContext<{
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
  children
}: {
  tabId: Identifier
  requestName?: string
  requestId?: Identifier
  collectionId?: Identifier | null
  definedRequest: RequestBase
  children: React.ReactNode
}) {
  const { history, environments, tabs, collections } = useContext(AppContext)

  const methods = useMemo(
    () => [
      { value: 'GET', label: 'GET', body: false },
      { value: 'POST', label: 'POST', body: true },
      { value: 'PUT', label: 'PUT', body: true },
      { value: 'PATCH', label: 'PATCH', body: true },
      { value: 'DELETE', label: 'DELETE', body: false },
      { value: 'HEAD', label: 'HEAD', body: false },
      { value: 'OPTIONS', label: 'OPTIONS', body: false }
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
    if (changed && tabs) {
      setChanged(false)
      tabs.updateTabRequest(tabId, {
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

    const headers: Record<string, string> = requestHeaders.reduce(
      (headers: Record<string, string>, header) => {
        headers[getValue(header.name)] = getValue(header.value)
        return headers
      },
      {}
    )

    const queryParams: Record<string, string> = requestParams.reduce(
      (params: Record<string, string>, param) => {
        if (param.enabled) params[getValue(param.name)] = getValue(param.value)
        return params
      },
      {}
    )

    const url = getUrl({})
    url.search = new URLSearchParams(queryParams).toString()

    const requestParameters = {
      method: requestMethod.value,
      headers: headers,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    } as RequestInit
    if (requestBody && requestMethod.body) requestParameters.body = getValue(requestBody)

    saveHistory()

    let fetchResponseSize: number = 0
    const time = new Date().getTime()
    fetch(url, requestParameters)
      .then((res) => {
        const fetchTime = new Date().getTime() - time
        setResponseTime(fetchTime)
        const headers = [...res.headers].map((header) => ({
          name: header[0],
          value: header[1]
        }))
        const contentLength = headers.find((header) => header.name === 'content-length')
        if (contentLength) {
          fetchResponseSize = Number(contentLength.value)
        }
        setFetched(true)
        setResponseStatus(res.status)
        setFetchedHeaders(headers)
        setConsoleLogs([
          ...consoleLogs,
          {
            method: requestMethod.value,
            url: url.href,
            status: res.status,
            time: fetchTime
          }
        ])
        return res.text()
      })
      .then((text) => {
        if (fetchResponseSize === null) {
          fetchResponseSize = text.length
        }
        setResponseSize(fetchResponseSize)
        setResponseBody(text)
      })
      .catch((err) => console.log(err))
      .finally(() => setFetching(false))
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
      // setBody: setResponseBody, // TODO Use when loading saved request
      // setHeaders: setHeaders,
      // setStatus: setResponseStatus,
      // setTime: setResponseTime
    },
    save: saveRequest,
    console: {
      logs: consoleLogs,
      clear: () => setConsoleLogs([])
    }
  }

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
