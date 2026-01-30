import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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

  const collectionsRef = useRef(collections)
  const environmentsRef = useRef(environments)
  const tabsRef = useRef(tabs)
  const settingsRef = useRef(settings)
  const workspacesRef = useRef(workspaces)
  const cookiesRef = useRef(cookies)
  const applicationRef = useRef(application)

  useEffect(() => {
    collectionsRef.current = collections
    environmentsRef.current = environments
    tabsRef.current = tabs
    settingsRef.current = settings
    workspacesRef.current = workspaces
    cookiesRef.current = cookies
    applicationRef.current = application
  }, [collections, environments, tabs, settings, workspaces, cookies, application])

  const path = useMemo(() => tab.path || [], [tab.path])
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

  const requestEditorStateRef = useRef('')
  const responseEditorStateRef = useRef('')

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
    if (!collectionId) return
    const collection = collections?.get(collectionId)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollection(collection || null)
    if (collection?.preRequest) {
      setPreRequestData(collection.preRequest)
    }
  }, [collectionId, collections])

  const getRequestEnvironment = useCallback(() => {
    const currentCollection = collectionId ? collectionsRef.current?.get(collectionId) : null

    if (currentCollection && currentCollection.environmentId) {
      const environment = environmentsRef.current?.get(currentCollection.environmentId)
      if (environment) {
        return environment
      }
    }
    const environment = environmentsRef.current?.getActive()
    if (!environment) {
      return null
    }
    return environment
  }, [collectionId])

  const getValue = useCallback(
    (value: string): string => {
      if (requestPathParams) {
        value = replacePathParams(value, requestPathParams)
      }
      if (environmentsRef.current) {
        const enviroment = getRequestEnvironment()
        if (enviroment) {
          value = environmentsRef.current.replaceVariables(enviroment.id, value)
        }
      }
      return value
    },
    [requestPathParams, getRequestEnvironment]
  )

  const setRequestResponse = useCallback(
    (response: RequestResponseType) => {
      setResponse(response)
      const newTab = { ...tab }
      newTab.response = settingsRef.current?.settings?.saveLastResponse ? response : undefined
      tabsRef.current?.updateTab(tab.id, newTab)
    },
    [tab]
  )

  const setMethod = useCallback(
    (method: Method) => {
      if (!method) return
      const definedMethod = methods.find((m) => m.value === method.value)
      if (!definedMethod) return
      setRequestMethod(definedMethod)
      setChanged(true)
      setSaved(false)
    },
    [methods]
  )

  const setUrl = useCallback((url: string) => {
    setRequestUrl(url)
    setChanged(true)
    setSaved(false)
  }, [])

  const setPathParams = useCallback(
    (pathParams: KeyValue[]) => {
      if (keyValuesAreEqual(pathParams, requestPathParams)) return
      setRequestPathParams(pathParams)
      setChanged(true)
      setSaved(false)
    },
    [requestPathParams]
  )

  const setQueryParams = useCallback(
    (params: KeyValue[]) => {
      if (keyValuesAreEqual(params, requestQueryParams)) return
      setRequestQueryParams(params)
      setChanged(true)
      setSaved(false)
    },
    [requestQueryParams]
  )

  const setFullUrl = useCallback(
    (value: string) => {
      if (value === requestFullUrl) return
      setRequestFullUrl(value)
      const [url, params] = value.split('?')
      setUrl(url)
      setPathParams(getPathParamsFromUrl(url, requestPathParams))
      setQueryParams(getQueryParamsFromUrl(params, requestQueryParams))
    },
    [requestFullUrl, setUrl, setPathParams, setQueryParams, requestPathParams, requestQueryParams]
  )

  const setBody = useCallback(
    (body: BodyType) => {
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
    },
    [requestBody]
  )

  const setAuth = useCallback((auth: RequestAuth) => {
    setRequestAuth(auth)
    setChanged(true)
    setSaved(false)
  }, [])

  const setPreScript = useCallback((script: string) => {
    setRequestPreScript(script)
    setChanged(true)
    setSaved(false)
  }, [])

  const setPostScript = useCallback((script: string) => {
    setRequestPostScript(script)
    setChanged(true)
    setSaved(false)
  }, [])

  const setHeaders = useCallback(
    (headers: KeyValue[]) => {
      if (keyValuesAreEqual(headers, requestHeaders)) return
      setRequestHeaders(headers)
      setChanged(true)
      setSaved(false)
    },
    [requestHeaders]
  )

  const addHeader = useCallback(() => {
    setHeaders([...requestHeaders, { enabled: true, name: '', value: '' }])
  }, [requestHeaders, setHeaders])

  const removeHeader = useCallback(
    (index: number) => {
      const headers = [...requestHeaders]
      headers.splice(index, 1)
      setHeaders(headers)
    },
    [requestHeaders, setHeaders]
  )

  const getActiveHeadersLength = useCallback(() => {
    return requestHeaders.filter((header: KeyValue) => header.enabled).length
  }, [requestHeaders])

  const removePathParam = useCallback(
    (index: number) => {
      const params = [...requestPathParams]
      params.splice(index, 1)
      setPathParams(params)
    },
    [requestPathParams, setPathParams]
  )

  const getActivePathParamsLength = useCallback(() => {
    return requestPathParams.filter((param: KeyValue) => param.enabled).length
  }, [requestPathParams])

  const addQueryParam = useCallback(() => {
    setRequestQueryParams([...requestQueryParams, { enabled: true, name: '', value: '' }])
  }, [requestQueryParams, setRequestQueryParams])

  const removeQueryParam = useCallback(
    (index: number) => {
      const params = [...requestQueryParams]
      params.splice(index, 1)
      setQueryParams(params)
    },
    [requestQueryParams, setQueryParams]
  )

  const getActiveQueryParamsLength = useCallback(() => {
    return requestQueryParams.filter((param: KeyValue) => param.enabled).length
  }, [requestQueryParams])

  const saveRequest = useCallback(() => {
    if (!collectionsRef.current) return
    if (!collectionId) {
      setOpenSaveAs(true)
      return
    }
    tabsRef.current?.saveTab(tab.id)
    setSaved(true)
    setChanged(true)
  }, [collectionId, tab.id])

  const getUrlObject = useCallback(
    ({ url = requestUrl }) => new URL(getValue(url)),
    [requestUrl, getValue]
  )

  const urlIsValid = useCallback(
    ({ url = requestUrl }) => {
      try {
        getUrlObject({ url })
        return true
      } catch (_err) {
        return false
      }
    },
    [requestUrl, getUrlObject]
  )

  const setEditorState = useCallback((type: 'request' | 'response', state: string) => {
    if (type === 'request') {
      requestEditorStateRef.current = state
    } else {
      responseEditorStateRef.current = state
    }
  }, [])

  const getEditorState = useCallback((type: 'request' | 'response') => {
    if (type === 'request') {
      return requestEditorStateRef.current
    }
    return responseEditorStateRef.current
  }, [])

  const getDefaultUserAgent = useCallback(() => {
    const settingsHeader = settingsRef.current?.settings?.defaultHeaders?.find(
      (header) => header.name === 'User-Agent'
    )
    if (settingsHeader && settingsHeader.enabled && settingsHeader.value) {
      return getValue(settingsHeader.value)
    }
    return getGeneralDefaultUserAgent(applicationRef.current.version)
  }, [getValue])

  const setDefaultHeaders = useCallback(
    (headers: Record<string, string>) => {
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
      setHeadersFn(workspacesRef.current?.selectedWorkspace?.requestHeaders)
      setHeadersFn(settingsRef.current?.settings?.defaultHeaders)
    },
    [collection, getRequestEnvironment, getValue]
  )

  const getHeaders = useCallback(
    (url: string) => {
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
          headers['Authorization'] = `Bearer ${getValue(requestAuth.value as string)}`
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
      if (settingsRef.current?.settings?.manageCookies) {
        const originCookies = cookiesRef.current?.stringify(getValue(url))
        if (originCookies) {
          headers['Cookie'] = originCookies
        }
      }
      return headers
    },
    [
      requestHeaders,
      getValue,
      getDefaultUserAgent,
      requestMethod.body,
      requestBody,
      setDefaultHeaders,
      requestAuth
    ]
  )

  const prepareQueryParams = useCallback(
    (queryParams: KeyValue[]) => {
      return queryParams
        .filter((queryParam: KeyValue) => queryParam.enabled)
        .map((queryParam: KeyValue) => {
          return {
            name: getValue(queryParam.name),
            value: getValue(queryParam.value || ''),
            enabled: queryParam.enabled
          } as KeyValue
        })
    },
    [getValue]
  )

  const copyAsCurl = useCallback(() => {
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
    applicationRef.current.notify({ message: 'cURL command copied to clipboard' })
  }, [
    getValue,
    requestUrl,
    prepareQueryParams,
    requestQueryParams,
    getHeaders,
    requestMethod,
    requestBody
  ])

  const pasteCurl = useCallback(
    (curlCommand: string) => {
      const requestBase = parseCurl(curlCommand)
      if (!requestBase) {
        applicationRef.current.notify({ message: 'Invalid cURL command' })
        return
      }

      setRequestMethod(requestBase.method)
      setRequestUrl(requestBase.url)
      setRequestHeaders(requestBase.headers || [])
      setQueryParams(requestBase.queryParams || [])
      setRequestBody(requestBase.body || 'none')
    },
    [setQueryParams]
  )

  const getFullUrl = useCallback(() => {
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
  }, [requestQueryParams, getRequestEnvironment, requestUrl])

  return useMemo(
    () => ({
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
    }),
    [
      path,
      collectionId,
      collection,
      preRequestData,
      tabId,
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
    ]
  )
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
