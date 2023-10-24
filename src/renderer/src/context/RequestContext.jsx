import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext'

export const RequestContext = createContext()

export default function RequestContextProvider({ definedRequest, children }) {

  const { history } = useContext(AppContext)

  const methods = useMemo(() => [
    { value: 'GET', label: 'GET', body: false },
    { value: 'POST', label: 'POST', body: true },
    { value: 'PUT', label: 'PUT', body: true },
    { value: 'PATCH', label: 'PATCH', body: true },
    { value: 'DELETE', label: 'DELETE', body: false },
    { value: 'HEAD', label: 'HEAD', body: false },
    { value: 'OPTION', label: 'OPTION', body: false }
  ], [])

  const [id, setId] = useState(0)
  const [name, setName] = useState('')
  const [requestMethod, setRequestMethod] = useState(methods[0])
  const [requestUrl, setRequestUrl] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [requestHeaders, setRequestHeaders] = useState([])
  const [requestParams, setRequestParams] = useState([])

  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)

  const [responseBody, setResponseBody] = useState('')
  const [responseHeaders, setResponseHeaders] = useState([])
  const [responseCookies, setResponseCookies] = useState([])
  const [responseStatus, setResponseStatus] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [responseSize, setResponseSize] = useState(0)

  const [consoleLogs, setConsoleLogs] = useState([])

  useEffect(() => {
    if (definedRequest) {
      // TODO validate definedRequest
      setId(definedRequest.id || 0)
      setName(definedRequest.name || '')
      setRequestMethod(definedRequest.method || methods[0])
      setRequestUrl(definedRequest.url || '')
      setRequestBody(definedRequest.body || '')
      setRequestHeaders(definedRequest.headers || [])
      setRequestParams(definedRequest.params || [])
    }
  }, [definedRequest, methods])


  const sendRequest = () => {
    if (!requestUrl || !urlIsValid()) return
    setFetching(true)

    const headers = requestHeaders.reduce((headers, header) => {
      headers[header.name] = header.value
      return headers
    }, {})

    const queryParams = requestParams.reduce((params, param) => {
      if (param.enabled) params[param.name] = param.value
      return params
    }, {})

    const url = new URL(requestUrl)
    url.search = new URLSearchParams(queryParams).toString()

    const requestParameters = {
      method: requestMethod.value,
      headers: headers,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    }
    if (requestBody && requestMethod.body) requestParameters.body = requestBody

    saveHistory()

    let fetchResponseSize = null

    const time = new Date().getTime()
    fetch(url, requestParameters)
      .then(res => {
        const fetchTime = new Date().getTime() - time
        setResponseTime(fetchTime)
        const headers = [...res.headers].map(header => ({
          name: header[0],
          value: header[1]
        }))
        const contentLength = headers.find(header => header.name === 'content-length')
        if (contentLength) {
          fetchResponseSize = Number(contentLength.value)
        }

        setFetched(true)
        setResponseStatus(res.status)
        setHeaders(headers)

        setConsoleLogs([...consoleLogs, {
          method: requestMethod.value,
          url: requestUrl,
          status: res.status,
          time: fetchTime
        }])

        return res.text()
      })
      .then(text => {
        if (fetchResponseSize === null) {
          fetchResponseSize = text.length
        }
        setResponseSize(fetchResponseSize)
        setResponseBody(text)
      })
      .catch(err => console.log(err))
      .finally(() => setFetching(false))
  }



  const saveHistory = () => {
    history.add({
      date: new Date().toISOString(),
      id: new Date().getTime(),
      name: name || `${requestMethod.value} - ${requestUrl}`,
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
    console.log('saveRequest', id)
  }

  const urlIsValid = () => {
    try {
      new URL(requestUrl)
      return true
    } catch (err) {
      return false
    }
  }

  const setMethod = method => {
    if (!method) return
    const definedMethod = methods.find(m => m.value === method.value)
    if (!definedMethod) return
    setRequestMethod(definedMethod)
  }

  const setHeaders = headers => {
    setResponseHeaders(headers)
    const cookies = headers
      .filter(header => header.name === 'set-cookie')
      .map(cookie => cookie.value.split(';'))
      .map(cookie => cookie[0].split('='))
    setResponseCookies(cookies)
  }

  const addParam = () => {
    setRequestParams([...requestParams, { name: '', value: '' }])
  }

  const removeParam = index => {
    const params = [...requestParams]
    params.splice(index, 1)
    setRequestParams(params)
  }

  const getActiveParamsLength = () => {
    return requestParams.filter(param => param.enabled).length
  }

  const addHeader = () => {
    setRequestHeaders([...requestHeaders, { name: '', value: '' }])
  }

  const removeHeader = index => {
    const headers = [...requestHeaders]
    headers.splice(index, 1)
    setRequestHeaders(headers)
  }

  const getActiveHeadersLength = () => {
    return requestHeaders.filter(header => header.enabled).length
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
      setUrl: setRequestUrl,
      setBody: setRequestBody,
      setHeaders: setRequestHeaders,
      setParams: setRequestParams,
      addParam,
      removeParam,
      getActiveParamsLength,
      addHeader,
      removeHeader,
      getActiveHeadersLength,
      fetch: sendRequest
    },
    fetching,
    fetched,
    response: {
      body: responseBody,
      headers: responseHeaders,
      cookies: responseCookies,
      status: responseStatus,
      time: responseTime,
      size: responseSize,
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

  return (
    <RequestContext.Provider value={contextValue}>
      {children}
    </RequestContext.Provider>
  )

}