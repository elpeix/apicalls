import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext'
import { CALL_API, CALL_API_FAILURE, CALL_API_RESPONSE } from '../../../lib/ipcChannels'
import { createAuth, createAuthHeaderValue, getMethods } from '../lib/factory'
import {
  getPathParamsFromUrl,
  getQueryParamsFromUrl,
  replacePathParams
} from '../lib/paramsCapturer'
import { useConsole } from '../hooks/useConsole'

export const RequestContext = createContext<RequestContestType>({
  path: [],
  collectionId: null,
  request: null,
  fetching: false,
  fetched: false,
  fetchError: '',
  response: {
    body: '',
    headers: [],
    cookies: [],
    status: 0,
    time: 0,
    size: 0
  },
  save: () => {},
  requestConsole: null
})

export default function RequestContextProvider({
  tab,
  children
}: {
  tab: RequestTab
  children: React.ReactNode
}) {
  const { history, environments, tabs, collections } = useContext(AppContext)

  const path = tab.path || []
  const collectionId = tab.collectionId
  const tabId = tab.id
  const definedRequest = tab.request

  const methods = useMemo(() => getMethods(), [])

  // Pre-request scripts will be executed before the request is sent
  const [preRequestData, setPreRequestData] = useState<PreRequest | null>(null)

  const [changed, setChanged] = useState(false)
  const [saved, setSaved] = useState(false)
  const [requestMethod, setRequestMethod] = useState(definedRequest.method || methods[0])
  const [requestUrl, setRequestUrl] = useState(definedRequest.url || '')
  const [requestBody, setRequestBody] = useState(definedRequest.body || '')
  const [requestAuth, setRequestAuth] = useState(definedRequest.auth || createAuth('none'))
  const [requestHeaders, setRequestHeaders] = useState(definedRequest.headers || [])
  const [requestPathParams, setRequestPathParams] = useState(definedRequest.pathParams || [])
  const [requestQueryParams, setRequestQueryParams] = useState(definedRequest.queryParams || [])

  const [launchRequest, setLaunchRequest] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const [responseBody, setResponseBody] = useState('')
  const [responseHeaders, setResponseHeaders] = useState<KeyValue[]>([])
  const [responseCookies, setResponseCookies] = useState<string[][]>([])
  const [responseStatus, setResponseStatus] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [responseSize, setResponseSize] = useState(0)
  const requestConsole = useConsole()

  useEffect(() => {
    if (changed) {
      setChanged(false)
      tabs?.updateTabRequest(tabId, {
        ...definedRequest,
        method: requestMethod,
        url: requestUrl,
        auth: requestAuth,
        headers: requestHeaders,
        queryParams: requestQueryParams,
        body: requestBody
      })
      tabs?.setSaved(tabId, saved)
      return
    }
    if (launchRequest) {
      setLaunchRequest(false)
      sendRequest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    requestQueryParams,
    launchRequest
  ])

  useEffect(() => {
    if (!collectionId || !collections) return
    const collection = collections.get(collectionId)
    if (!collection) return
    if (collection.preRequest) {
      setPreRequestData(collection.preRequest)
    }
  }, [collectionId, collections, preRequestData])

  const fetch = () => {
    setLaunchRequest(true)
  }

  const sendRequest = () => {
    if (!requestUrl || !urlIsValid({})) return
    setFetching(true)
    setFetched(false)
    setFetchError('')

    if (preRequestData) {
      sendPreRequest()
    } else {
      sendMainRequest()
    }
  }

  const sendMainRequest = (requestLogs: RequestLog[] = []) => {
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
      queryParams: requestQueryParams,
      body: requestBody
    }
    window.electron.ipcRenderer.send(CALL_API, callApiRequest)
    window.electron.ipcRenderer.on(CALL_API_RESPONSE, (_: unknown, callResponse: CallResponse) => {
      if (callResponse.id !== tabId) return
      setFetched(true)
      setResponseTime(callResponse.responseTime.all)
      setResponseStatus(callResponse.status.code)
      setResponseSize(callResponse.contentLength)
      setFetchedHeaders(callResponse.responseHeaders)
      setResponseBody(callResponse.result || '')
      requestConsole?.addAll([
        ...requestLogs,
        {
          method: requestMethod.value,
          url: getFullUrl(),
          status: callResponse.status.code,
          time: callResponse.responseTime.all,
          request: callApiRequest,
          response: callResponse
        }
      ])
      setFetching(false)
      window.electron.ipcRenderer.removeAllListeners(CALL_API_FAILURE)
      window.electron.ipcRenderer.removeAllListeners(CALL_API_RESPONSE)
    })

    const getFullUrl = () => {
      const params = requestQueryParams
        .filter((param) => param.enabled)
        .map((param) => `${param.name}=${param.value}`)
        .join('&')
      return `${url}${params ? '?' + params : ''}`
    }

    window.electron.ipcRenderer.on(
      CALL_API_FAILURE,
      (_: unknown, response: CallResponseFailure) => {
        setFetching(false)
        setFetched(true)
        setFetchError(response.message)
        requestConsole?.addAll([
          ...requestLogs,
          {
            method: requestMethod.value,
            url: getFullUrl(),
            status: 999,
            time: 0,
            request: callApiRequest,
            failure: response
          }
        ])
        window.electron.ipcRenderer.removeAllListeners(CALL_API_FAILURE)
        window.electron.ipcRenderer.removeAllListeners(CALL_API_RESPONSE)
      }
    )
  }

  const sendPreRequest = () => {
    if (!preRequestData) {
      return
    }
    const environment = environments?.getActive()
    if (!environment) {
      return
    }
    const request = preRequestData.request
    const url = getValue(request.url)
    const headers: HeadersInit = {}
    request.headers?.forEach((header) => {
      if (header.enabled) {
        headers[getValue(header.name)] = getValue(header.value)
      }
    })
    const callApiRequest: CallRequest = {
      id: tabId,
      url,
      method: request.method.value,
      headers: headers,
      queryParams: request.queryParams,
      body: request.body
    }
    window.electron.ipcRenderer.send(CALL_API, callApiRequest)
    window.electron.ipcRenderer.on(CALL_API_RESPONSE, (_: unknown, callResponse: CallResponse) => {
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
      window.electron.ipcRenderer.removeAllListeners(CALL_API_FAILURE)
      window.electron.ipcRenderer.removeAllListeners(CALL_API_RESPONSE)
      sendMainRequest([requestLog])
    })
    window.electron.ipcRenderer.on(
      CALL_API_FAILURE,
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
        window.electron.ipcRenderer.removeAllListeners(CALL_API_FAILURE)
        window.electron.ipcRenderer.removeAllListeners(CALL_API_RESPONSE)
      }
    )
  }

  const setDataToCapture = (
    callResponse: CallResponse,
    dataToCapture: PreRequestDataToCapture,
    environment: Environment
  ) => {
    const name = dataToCapture.setEnvironmentVariable
    let value = ''
    if (dataToCapture.type === 'body') {
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
      variable.value = value
    } else {
      environment.variables = [
        ...environment.variables,
        {
          name: name,
          value: value
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
    console.log('Save request', saved)
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
        pathParams: requestPathParams,
        queryParams: requestQueryParams,
        body: requestBody
      }
    } as RequestType
    collections.saveRequest({ path, collectionId, request })
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
      value = environments.replaceVariables(value)
    }
    return value
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
    const [url, params] = value.split('?')
    setUrl(value)
    setUrl(url)
    setPathParams(getPathParamsFromUrl(url))
    setQueryParams(getQueryParamsFromUrl(params, requestQueryParams))
  }

  const setBody = (body: string) => {
    setRequestBody(body)
    setChanged(true)
    setSaved(false)
  }

  // Headers
  const setHeaders = (headers: KeyValue[]) => {
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
    setResponseHeaders(headers)
    const cookies = headers
      .filter((header: KeyValue) => header.name === 'set-cookie')
      .map((cookie) => cookie.value.split(';'))
      .map((cookie) => cookie[0].split('='))
    setResponseCookies(cookies)
  }

  // Path params
  const setPathParams = (pathParams: KeyValue[]) => {
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

  // Query params
  const setQueryParams = (params: KeyValue[]) => {
    setRequestQueryParams(params)
    setChanged(true)
    setSaved(false)
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

  const contextValue = {
    path: path || [],
    collectionId,
    request: {
      method: requestMethod,
      url: requestUrl,
      body: requestBody,
      auth: requestAuth,
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
      setBody,
      setAuth: setRequestAuth,
      fetch,
      urlIsValid
    },
    fetching,
    fetched,
    fetchError,
    response: {
      body: responseBody,
      headers: responseHeaders,
      cookies: responseCookies,
      status: responseStatus,
      time: responseTime,
      size: responseSize
    },
    save: saveRequest,
    saved,
    requestConsole
  }

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
