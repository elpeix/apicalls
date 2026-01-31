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

  // Refs for stable state access in callbacks
  const requestMethodRef = useRef(requestMethod)
  const requestUrlRef = useRef(requestUrl)
  const requestBodyRef = useRef(requestBody)
  const requestAuthRef = useRef(requestAuth)
  const requestHeadersRef = useRef(requestHeaders)
  const requestPathParamsRef = useRef(requestPathParams)
  const requestQueryParamsRef = useRef(requestQueryParams)
  const requestFullUrlRef = useRef(requestFullUrl)
  const requestPreScriptRef = useRef(requestPreScript)
  const requestPostScriptRef = useRef(requestPostScript)
  const collectionRef = useRef(collection)

  useEffect(() => {
     requestMethodRef.current = requestMethod
     requestUrlRef.current = requestUrl
     requestBodyRef.current = requestBody
     requestAuthRef.current = requestAuth
     requestHeadersRef.current = requestHeaders
     requestPathParamsRef.current = requestPathParams
     requestQueryParamsRef.current = requestQueryParams
     requestFullUrlRef.current = requestFullUrl
     requestPreScriptRef.current = requestPreScript
     requestPostScriptRef.current = requestPostScript
     collectionRef.current = collection
  }, [
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
      collection
  ])


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
      const currentPathParams = requestPathParamsRef.current
      if (currentPathParams) {
        value = replacePathParams(value, currentPathParams)
      }
      if (environmentsRef.current) {
        const enviroment = getRequestEnvironment()
        if (enviroment) {
          value = environmentsRef.current.replaceVariables(enviroment.id, value)
        }
      }
      return value
    },
    [getRequestEnvironment]
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
      if (keyValuesAreEqual(pathParams, requestPathParamsRef.current)) return
      setRequestPathParams(pathParams)
      setChanged(true)
      setSaved(false)
    },
    []
  )

  const setQueryParams = useCallback(
    (params: KeyValue[]) => {
      if (keyValuesAreEqual(params, requestQueryParamsRef.current)) return
      setRequestQueryParams(params)
      setChanged(true)
      setSaved(false)
    },
    []
  )

  const setFullUrl = useCallback(
    (value: string) => {
      if (value === requestFullUrlRef.current) return
      setRequestFullUrl(value)
      const [url, params] = value.split('?')
        setRequestUrl(url)
      const newPathParams = getPathParamsFromUrl(url, requestPathParamsRef.current)
      if (!keyValuesAreEqual(newPathParams, requestPathParamsRef.current)){
          setRequestPathParams(newPathParams)
      }

      const newQueryParams = getQueryParamsFromUrl(params, requestQueryParamsRef.current)
      if(!keyValuesAreEqual(newQueryParams, requestQueryParamsRef.current)) {
          setRequestQueryParams(newQueryParams)
      }

      setChanged(true)
      setSaved(false)
    },
    []
  )

  const setBody = useCallback(
    (body: BodyType) => {
      const currentBody = requestBodyRef.current
      if (
        typeof currentBody !== 'string' &&
        typeof body !== 'string' &&
        currentBody.contentType === body.contentType &&
        currentBody.value === body.value
      ) {
        return
      }
      setRequestBody(body)
      setChanged(true)
      setSaved(false)
    },
    []
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
      if (keyValuesAreEqual(headers, requestHeadersRef.current)) return
      setRequestHeaders(headers)
      setChanged(true)
      setSaved(false)
    },
    []
  )

  const addHeader = useCallback(() => {
    setHeaders([...requestHeadersRef.current, { enabled: true, name: '', value: '' }])
  }, [setHeaders])

  const removeHeader = useCallback(
    (index: number) => {
      const headers = [...requestHeadersRef.current]
      headers.splice(index, 1)
      setHeaders(headers)
    },
    [setHeaders]
  )

  const getActiveHeadersLength = useCallback(() => {
    return requestHeadersRef.current.filter((header: KeyValue) => header.enabled).length
  }, [])

  const removePathParam = useCallback(
    (index: number) => {
      const params = [...requestPathParamsRef.current]
      params.splice(index, 1)
      setPathParams(params)
    },
    [setPathParams]
  )

  const getActivePathParamsLength = useCallback(() => {
    return requestPathParamsRef.current.filter((param: KeyValue) => param.enabled).length
  }, [])

  const addQueryParam = useCallback(() => {
    setRequestQueryParams([...requestQueryParamsRef.current, { enabled: true, name: '', value: '' }])
  }, [])

  const removeQueryParam = useCallback(
    (index: number) => {
      const params = [...requestQueryParamsRef.current]
      params.splice(index, 1)
      setQueryParams(params)
    },
    [setQueryParams]
  )

  const getActiveQueryParamsLength = useCallback(() => {
    return requestQueryParamsRef.current.filter((param: KeyValue) => param.enabled).length
  }, [])

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
    ({ url = '' }) => {
        const targetUrl = url || requestUrlRef.current
        return new URL(getValue(targetUrl))
    },
    [getValue]
  )

  const urlIsValid = useCallback(
    ({ url = '' }) => {
      try {
        getUrlObject({ url })
        return true
      } catch (_err) {
        return false
      }
    },
    [getUrlObject]
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
      const currentCollection = collectionRef.current
      const currentWorkspace = workspacesRef.current

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

      setHeadersFn(currentCollection?.requestHeaders)
      setHeadersFn(getRequestEnvironment()?.requestHeaders)
      setHeadersFn(currentWorkspace?.selectedWorkspace?.requestHeaders)
      setHeadersFn(settingsRef.current?.settings?.defaultHeaders)
    },
    [getRequestEnvironment, getValue]
  )

  const getHeaders = useCallback(
    (url: string) => {
      const headers: HeadersInit = {}
      let userAgentDefined = false
      let contentTypeDefined = false
      
      const currentHeaders = requestHeadersRef.current
      const currentMethod = requestMethodRef.current
      const currentBody = requestBodyRef.current
      const currentAuth = requestAuthRef.current
      const currentSettings = settingsRef.current
      
      currentHeaders.forEach((header) => {
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

      if (!contentTypeDefined && currentMethod.body && typeof currentBody !== 'string') {
        const contentType = getContentType(currentBody)
        if (contentType) {
          headers['Content-Type'] = contentType
        }
      }

      setDefaultHeaders(headers)

      if (currentAuth.type !== 'none' && currentAuth.value) {
        if (currentAuth.type === 'bearer') {
          headers['Authorization'] = `Bearer ${getValue(currentAuth.value as string)}`
        } else if (currentAuth.type === 'basic') {
          const requestAuthRecord = currentAuth.value as RequestAuthBasic
          const username = requestAuthRecord.username || ''
          const password = requestAuthRecord.password || ''
          headers['Authorization'] = `Basic ${btoa(`${getValue(username)}:${getValue(password)}`)}`
        } else if (currentAuth.type === 'oauth2') {
          const authValue = currentAuth.value as RequestAuthOAuth2
          if (authValue?.accessToken) {
            headers['Authorization'] = `Bearer ${getValue(authValue.accessToken)}`
          }
        }
      }
      if (currentSettings?.settings?.manageCookies) {
        const originCookies = cookiesRef.current?.stringify(getValue(url))
        if (originCookies) {
          headers['Cookie'] = originCookies
        }
      }
      return headers
    },
    [
      getValue,
      getDefaultUserAgent,
      setDefaultHeaders
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
    const url = getValue(requestUrlRef.current)
    let path = url
    const currentQueryParams = requestQueryParamsRef.current
    const queryParams = prepareQueryParams(currentQueryParams)
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
    const currentMethod = requestMethodRef.current
    const currentBody = requestBodyRef.current
    
    let curl = `curl -X ${currentMethod.value} '${path}'`
    if (headers && Object.keys(headers).length > 0) {
      Object.keys(headers).forEach((key) => {
        curl += `\\\n  -H '${key}: ${headers[key]}'`
      })
    }
    if (currentBody && currentMethod.body) {
      curl += `\\\n  -d '${getBody(currentBody)}'`
    }
    navigator.clipboard.writeText(curl)
    applicationRef.current.notify({ message: 'cURL command copied to clipboard' })
  }, [
    getValue,
    prepareQueryParams,
    getHeaders
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
    const currentQueryParams = requestQueryParamsRef.current
    if (currentQueryParams) {
      currentQueryParams
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
    return `${requestUrlRef.current}${queryParamsValue}`
  }, [getRequestEnvironment])

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
