import { useCallback, useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { REQUEST } from '../../../../lib/ipcChannels'
import { usePreRequest } from './usePreRequest'
import { getBody } from '../../lib/utils'
import { RequestStateType } from './useRequestState'
import { ScriptExecutorType } from './useScriptExecutor'

type RequestSenderProps = {
  tab: RequestTab
  requestState: RequestStateType
  scriptExecutor: ScriptExecutorType
  requestConsole: ConsoleHookType | null
}

export function useRequestSender({
  tab,
  requestState,
  scriptExecutor,
  requestConsole
}: RequestSenderProps) {
  const { environments, cookies, appSettings: settings } = useContext(AppContext)

  const {
    requestMethod,
    requestUrl,
    requestBody,
    requestHeaders,
    requestPathParams,
    requestQueryParams,
    requestPreScript,
    requestPostScript,
    requestAuth,
    collection,
    preRequestData,
    tabId,
    getRequestEnvironment,
    getValue,
    getHeaders,
    prepareQueryParams,
    urlIsValid,
    // In state it is saveRequest (saves tab). In context there is saveHistory.
    // useRequestState has `saveRequest` which saves the tab.
    // RequestContext has local `saveHistory`.
    setRequestResponse,
    setResponse: setResponseState,
    getDefaultUserAgent,
    setDefaultHeaders
  } = requestState

  const { executeScript, getScriptEnvironment, getScriptConsole, tryParseBody, cancelScripts } =
    scriptExecutor

  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState<FetchedType>(tab.response ? 'old' : false)
  const [fetchError, setFetchError] = useState('')
  const [fetchErrorCause, setFetchErrorCause] = useState('')
  const [fetchedUrl, setFetchedUrl] = useState(tab.response ? requestUrl : '')

  const { history } = useContext(AppContext)

  const saveHistory = useCallback(() => {
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
  }, [
    history,
    requestMethod,
    requestUrl,
    requestAuth,
    requestHeaders,
    requestPathParams,
    requestQueryParams,
    requestBody
  ])

  const setCookies = useCallback(
    (headers: KeyValue[], url: string) => {
      if (settings?.settings?.manageCookies) {
        cookies?.upsert(headers, getValue(url))
      }
    },
    [settings, cookies, getValue]
  )

  const sendMainRequest = useCallback(
    async (requestLogs: RequestLog[] = []) => {
      const environment = getRequestEnvironment()
      const url = getValue(requestUrl)

      const effectiveHeaders = getHeaders(url) as Record<string, string>

      const contextRequest = {
        method: requestMethod.value,
        url: requestUrl,
        headers: effectiveHeaders,
        queryParams: requestQueryParams,
        body: requestBody
      }

      if (collection && collection.preScript && collection.preScript.trim().length > 0) {
        const success = await executeScript(collection.preScript, {
          request: contextRequest,
          environment: getScriptEnvironment(environment),
          console: getScriptConsole()
        })
        if (!success) {
          console.error('Collection pre-script failed')
          setFetching(false)
          return
        }
      }

      if (requestPreScript) {
        const success = await executeScript(requestPreScript, {
          request: contextRequest,
          environment: getScriptEnvironment(environment),
          console: getScriptConsole()
        })
        if (!success) {
          setFetching(false)
          return
        }
      }

      saveHistory()

      const queryParams = prepareQueryParams(contextRequest.queryParams)

      const callApiRequest: CallRequest = {
        id: tabId,
        url: getValue(contextRequest.url),
        method: {
          value: contextRequest.method,
          label: contextRequest.method,
          body: contextRequest.method !== 'GET' && contextRequest.method !== 'HEAD'
        },
        headers: contextRequest.headers,
        queryParams,
        body:
          contextRequest.body === 'none' || contextRequest.body === ''
            ? undefined
            : getBody(contextRequest.body)
      }

      const CHANNEL_CALL = REQUEST.call
      const CHANNEL_RESPONSE = `${REQUEST.response}-${tabId}`
      const CHANNEL_FAILURE = `${REQUEST.failure}-${tabId}`
      const CHANNEL_CANCELLED = `${REQUEST.cancelled}-${tabId}`

      window.electron?.ipcRenderer.send(CHANNEL_CALL, callApiRequest)

      window.electron?.ipcRenderer.on(
        CHANNEL_RESPONSE,
        (_: unknown, callResponse: CallResponse) => {
          if (callResponse.id !== tabId) return
          setFetched(true)
          const responseData = {
            body: callResponse.result || '',
            headers: callResponse.responseHeaders,
            cookies: [],
            time: callResponse.responseTime.all,
            status: callResponse.status.code,
            size: callResponse.contentLength
          }
          setRequestResponse(responseData)

          const setFetchedHeaders = (headers: KeyValue[]) => {
            const cookies = headers
              .filter((header: KeyValue) => header.name === 'set-cookie')
              .map((cookie) => cookie.value.split(';'))
              .map((cookie) => cookie[0].split('='))
            setResponseState((prev: RequestResponseType) => ({ ...prev, headers, cookies }))
          }

          setFetchedHeaders(callResponse.responseHeaders)
          setCookies(callResponse.responseHeaders, requestUrl)

          const runPostScripts = async () => {
            if (requestPostScript) {
              await executeScript(requestPostScript, {
                request: {
                  method: contextRequest.method,
                  url: contextRequest.url,
                  queryParams: contextRequest.queryParams,
                  headers: contextRequest.headers,
                  body: contextRequest.body
                },
                response: {
                  status: callResponse.status.code,
                  headers: callResponse.responseHeaders,
                  body: tryParseBody(callResponse.result || '{}'),
                  rawBody: callResponse.result || ''
                },
                environment: getScriptEnvironment(getRequestEnvironment()),
                console: getScriptConsole()
              })
            }

            if (collection && collection.postScript) {
              await executeScript(collection.postScript, {
                request: {
                  method: contextRequest.method,
                  url: contextRequest.url,
                  queryParams: contextRequest.queryParams,
                  headers: contextRequest.headers,
                  body: contextRequest.body
                },
                response: {
                  status: callResponse.status.code,
                  headers: callResponse.responseHeaders,
                  body: tryParseBody(callResponse.result || '{}'),
                  rawBody: callResponse.result || ''
                },
                environment: getScriptEnvironment(getRequestEnvironment()),
                console: getScriptConsole()
              })
            }
          }
          runPostScripts()

          requestConsole?.addAll([
            ...requestLogs,
            {
              method: requestMethod.value,
              url: getFullUrlForConsole(url, queryParams),
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
        }
      )

      const getFullUrlForConsole = (url: string, params: KeyValue[]) => {
        const paramStr = params
          .filter((param) => param.enabled)
          .map((param) => `${param.name}=${param.value}`)
          .join('&')
        return `${url}${paramStr ? '?' + paramStr : ''}`
      }

      window.electron?.ipcRenderer.on(
        CHANNEL_FAILURE,
        (_: unknown, response: CallResponseFailure) => {
          setFetching(false)
          setFetched(true)
          setFetchError(response.message)
          setFetchErrorCause(response.cause ? response.cause.toString() : '')
          requestConsole?.addAll([
            ...requestLogs,
            {
              method: requestMethod.value,
              url: getFullUrlForConsole(url, queryParams),
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
            url: getFullUrlForConsole(url, queryParams),
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
    },
    [
      getRequestEnvironment,
      requestUrl,
      requestMethod,
      requestBody,
      collection,
      requestPreScript,
      saveHistory,
      requestQueryParams,
      tabId,
      setRequestResponse,
      setResponseState,
      setCookies,
      requestPostScript,
      tryParseBody,
      getScriptEnvironment,
      getScriptConsole,
      requestConsole,
      executeScript,
      getValue,
      getHeaders,
      prepareQueryParams,
      setFetched,
      setFetching,
      setFetchError,
      setFetchErrorCause
    ]
  )

  const { sendPreRequest } = usePreRequest({
    tabId,
    preRequestData,
    requestMethod,
    environments,
    requestConsole,
    setFetching,
    setFetched,
    setFetchError,
    getValue,
    prepareQueryParams,
    getDefaultUserAgent,
    setDefaultHeaders,
    onComplete: sendMainRequest
  })

  const cancel = () => {
    window.electron?.ipcRenderer.send(REQUEST.cancel, tabId)
    cancelScripts()
  }

  const sendRequest = useCallback(() => {
    if (!requestUrl || !urlIsValid({})) return
    setFetching(true)
    setFetched(false)
    setFetchError('')
    setFetchErrorCause('')
    setFetchedUrl(requestUrl)

    if (preRequestData && preRequestData.active && preRequestData.request.url.trim().length > 0) {
      sendPreRequest(getRequestEnvironment())
    } else {
      sendMainRequest()
    }
  }, [
    requestUrl,
    urlIsValid,
    setFetching,
    setFetched,
    setFetchError,
    setFetchErrorCause,
    preRequestData,
    sendPreRequest,
    getRequestEnvironment,
    sendMainRequest
  ])

  const fetch = () => {
    sendRequest()
  }

  return {
    fetching,
    fetched,
    fetchError,
    fetchErrorCause,
    fetchedUrl,
    fetch,
    cancel
  }
}
