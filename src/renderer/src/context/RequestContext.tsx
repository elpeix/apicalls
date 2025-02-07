import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext'
import { REQUEST } from '../../../lib/ipcChannels'
import { createAuth, createAuthHeaderValue, getMethods } from '../lib/factory'
import {
  getPathParamsFromUrl,
  getQueryParamsFromUrl,
  replacePathParams
} from '../lib/paramsCapturer'
import { useConsole } from '../hooks/useConsole'
import { getValueFromPath } from '../lib/utils'

const responseInitialValue: RequestContextResponseType = {
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
  response: responseInitialValue,
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
  const {
    history,
    environments,
    tabs,
    collections,
    cookies,
    appSettings: settings
  } = useContext(AppContext)

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
  const [requestFullUrl, setRequestFullUrl] = useState(definedRequest.url || '')
  const [openSaveAs, setOpenSaveAs] = useState(false)

  const [launchRequest, setLaunchRequest] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [response, setResponse] = useState<RequestContextResponseType>(responseInitialValue)
  const requestConsole = useConsole()

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
    changed,
    saved,
    definedRequest,
    requestMethod,
    requestUrl,
    requestAuth,
    requestBody,
    requestHeaders,
    requestQueryParams,
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
    if (collection.preRequest) {
      setPreRequestData(collection.preRequest)
    }
  }, [collectionId, collections, preRequestData])

  const fetch = () => {
    setLaunchRequest(true)
  }

  const cancel = () => {
    window.electron?.ipcRenderer.send(CHANNEL_CANCEL, tabId)
  }

  const sendRequest = () => {
    if (!requestUrl || !urlIsValid({})) return
    setFetching(true)
    setFetched(false)
    setFetchError('')

    if (preRequestData && preRequestData.active) {
      sendPreRequest()
    } else {
      sendMainRequest()
    }
  }

  const sendMainRequest = (requestLogs: RequestLog[] = []) => {
    const url = getValue(requestUrl)

    saveHistory()

    const callApiRequest: CallRequest = {
      id: tabId,
      url,
      method: requestMethod,
      headers: getHeaders(url),
      queryParams: requestQueryParams,
      body: requestBody
    }
    window.electron?.ipcRenderer.send(CHANNEL_CALL, callApiRequest)
    window.electron?.ipcRenderer.on(CHANNEL_RESPONSE, (_: unknown, callResponse: CallResponse) => {
      if (callResponse.id !== tabId) return
      setFetched(true)
      setResponse({
        body: callResponse.result || '',
        headers: callResponse.responseHeaders,
        cookies: [],
        time: callResponse.responseTime.all,
        status: callResponse.status.code,
        size: callResponse.contentLength
      })
      setFetchedHeaders(callResponse.responseHeaders)
      setCookies(callResponse.responseHeaders, requestUrl)
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
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_FAILURE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_RESPONSE)
      window.electron?.ipcRenderer.removeAllListeners(CHANNEL_CANCELLED)
    })

    const getFullUrl = () => {
      const params = requestQueryParams
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
          url: getFullUrl(),
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

  const sendPreRequest = () => {
    if (!preRequestData || !preRequestData.active) {
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
      if (header.enabled && header.name) {
        headers[getValue(header.name)] = getValue(header.value)
      }
    })
    const callApiRequest: CallRequest = {
      id: tabId,
      url,
      method: request.method,
      headers,
      queryParams: request.queryParams,
      body: request.body
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
      variable.value = value.toString()
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

  const getHeaders = (url: string) => {
    const headers: HeadersInit = {}
    requestHeaders.forEach((header) => {
      if (header.enabled && header.name) {
        headers[getValue(header.name)] = getValue(header.value)
      }
    })
    if (requestAuth.type !== 'none' && requestAuth.value) {
      headers['Authorization'] = createAuthHeaderValue({
        type: requestAuth.type,
        value: getValue(requestAuth.value)
      })
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
    setPathParams(getPathParamsFromUrl(url))
    setQueryParams(getQueryParamsFromUrl(params, requestQueryParams))
  }

  const setBody = (body: string) => {
    if (body === requestBody) return
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
    setResponse((prev: RequestContextResponseType) => ({ ...prev, headers, cookies }))
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

  const contextValue = {
    path: path || [],
    isActive: tab.active,
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
      setAuth,
      fetch,
      cancel,
      urlIsValid
    },
    fetching,
    fetched,
    fetchError,
    response: response,
    save: saveRequest,
    saved,
    requestConsole,
    tabId,
    openSaveAs,
    setOpenSaveAs
  }

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
