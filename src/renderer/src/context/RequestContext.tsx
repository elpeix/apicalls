import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
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
  setEditorState: () => {},
  getEditorState: () => '',
  requestConsole: null,
  getRequestEnvironment: () => null,
  copyAsCurl: () => {}
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
    appSettings: settings
  } = useContext(AppContext)

  const path = tab.path || []
  const collectionId = tab.collectionId
  const tabId = tab.id
  const definedRequest = tab.request

  const methods = useMemo(() => getMethods(), [])

  const [collection, setCollection] = useState<Collection | null>(null)

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
  const [openSaveAs, setOpenSaveAs] = useState(false)

  const [launchRequest, setLaunchRequest] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [response, setResponse] = useState<RequestContextResponseType>(responseInitialValue)
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

    const queryParams = prepareQueryParams(requestQueryParams)
    const callApiRequest: CallRequest = {
      id: tabId,
      url,
      method: requestMethod,
      headers: getHeaders(url),
      queryParams,
      body: requestBody === 'none' || requestBody === '' ? undefined : getBody(requestBody)
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
    return settings?.settings?.defaultUserAgent || getGeneralDefaultUserAgent(application.version)
  }

  const prepareQueryParams = (queryParams: KeyValue[]) => {
    return queryParams
      .filter((queryParam: KeyValue) => queryParam.enabled)
      .map((queryParam: KeyValue) => {
        return {
          name: queryParam.name,
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
      curl += ` -d '${requestBody}'`
    }
    navigator.clipboard.writeText(curl)
    application.notify({ message: 'cURL command copied to clipboard' })
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
      getFullUrl,
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
    setOpenSaveAs,
    setEditorState,
    getEditorState,
    getRequestEnvironment,
    copyAsCurl
  }

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
