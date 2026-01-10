import { useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { createAuth, getMethods } from '../../lib/factory'

export type RequestStateType = ReturnType<typeof useRequestState>

import {
  getPathParamsFromUrl,
  getQueryParamsFromUrl,
  replacePathParams
} from '../../lib/paramsCapturer'
import { getBody, getContentType } from '../../lib/utils'
import { getGeneralDefaultUserAgent } from '../../../../lib/defaults'
import { parseCurl } from '../../lib/curl'

export const responseInitialValue: RequestResponseType = {
  body: '',
  headers: [],
  cookies: [],
  status: 0,
  time: 0,
  size: 0
}

export function useRequestState(tab: RequestTab) {
  const {
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

  const [response, setResponse] = useState<RequestResponseType>(
    tab.response || responseInitialValue
  )

  const [requestEditorState, setRequestEditorState] = useState('')
  const [responseEditorState, setResponseEditorState] = useState('')

  useEffect(() => {
    if (changed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [
    tabs,
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
    requestPathParams,
    requestPreScript,
    requestPostScript
  ])

  useEffect(() => {
    if (!collectionId || !collections) return
    const collection = collections.get(collectionId)
    if (!collection) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollection(collection)
    if (collection.preRequest) {
      setPreRequestData(collection.preRequest)
    }
  }, [collectionId, collections, preRequestData])

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

  const setRequestResponse = (response: RequestResponseType) => {
    setResponse(response)
    const newTab = { ...tab }
    newTab.response = settings?.settings?.saveLastResponse ? response : undefined
    tabs?.updateTab(tab.id, newTab)
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

  const getUrlObject = ({ url = requestUrl }) => new URL(getValue(url))

  const urlIsValid = ({ url = requestUrl }) => {
    try {
      getUrlObject({ url })
      return true
    } catch (_err) {
      return false
    }
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

    const setHeadersFn = (definedHeaders: KeyValue[] | undefined) => {
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

    setHeadersFn(collection?.requestHeaders)
    setHeadersFn(getRequestEnvironment()?.requestHeaders)
    setHeadersFn(workspaces?.selectedWorkspace?.requestHeaders)
    setHeadersFn(settings?.settings?.defaultHeaders)
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
      } else if (requestAuth.type === 'oauth2') {
        const authValue = requestAuth.value as RequestAuthOAuth2
        if (authValue?.accessToken) {
          headers['Authorization'] = `Bearer ${getValue(authValue.accessToken)}`
        }
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

  return {
    path,
    collectionId,
    collection,
    preRequestData,
    tabId,

    // State
    requestMethod,
    requestUrl,
    requestBody,
    requestAuth,
    requestHeaders,
    requestPathParams,
    requestQueryParams,
    requestFullUrl,
    requestPreScript,
    requestPostScript,
    response,
    openSaveAs,
    saved,
    requestEditorState,
    responseEditorState,

    // Actions
    setMethod,
    setUrl,
    setFullUrl,
    setBody,
    setAuth,
    setPreScript,
    setPostScript,
    setHeaders,
    addHeader,
    removeHeader,
    setPathParams,
    removePathParam,
    setQueryParams,
    addQueryParam,
    removeQueryParam,
    saveRequest,
    setOpenSaveAs,
    setEditorState,
    getEditorState,
    copyAsCurl,
    pasteCurl,

    // Helpers
    getValue,
    getHeaders,
    getRequestEnvironment,
    prepareQueryParams,
    urlIsValid,
    getActiveHeadersLength,
    getActivePathParamsLength,
    getActiveQueryParamsLength,
    getFullUrl,
    setRequestResponse,
    setResponse,
    getDefaultUserAgent,
    setDefaultHeaders
  }
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
