import { REQUEST } from '../../../../lib/ipcChannels'
import { getBody } from '../../lib/utils'

type UsePreRequestProps = {
  tabId: Identifier
  preRequestData: PreRequest | null
  requestMethod: Method
  environments: EnvironmentsHookType | null
  requestConsole: ConsoleHookType | null
  setFetching: (fetching: boolean) => void
  setFetched: (fetched: FetchedType) => void
  setFetchError: (error: string) => void
  getValue: (value: string) => string
  prepareQueryParams: (params: KeyValue[]) => KeyValue[]
  getDefaultUserAgent: () => string
  setDefaultHeaders: (headers: Record<string, string>) => void
  onComplete: (requestLogs: RequestLog[]) => void
}

export function usePreRequest({
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
  onComplete
}: UsePreRequestProps) {
  const CHANNEL_CALL = REQUEST.call
  const CHANNEL_RESPONSE = `${REQUEST.response}-${tabId}`
  const CHANNEL_FAILURE = `${REQUEST.failure}-${tabId}`
  const CHANNEL_CANCELLED = `${REQUEST.cancelled}-${tabId}`

  // Correction: We need the environment to Capture Data into.
  // In RequestContext: const environment = getRequestEnvironment()

  const setDataToCapture = (
    callResponse: CallResponse,
    dataToCapture: PreRequestDataToCapture,
    environment: Environment
  ) => {
    const name = dataToCapture.setEnvironmentVariable
    let value: string | number | boolean = ''
    if (dataToCapture.type === 'body') {
      // value = getValueFromPath(callResponse.result || '', dataToCapture.path)
      // Original code had commented out getValueFromPath and used JSON parse
      try {
        const jsonResult = JSON.parse(callResponse.result || '{}')
        value = jsonResult[dataToCapture.path] // FIXME: Real path is not implemented
      } catch {
        value = ''
      }
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

  const sendPreRequest = (currentEnvironment: Environment | null) => {
    if (!preRequestData || !preRequestData.active) {
      return
    }
    const environment = currentEnvironment
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

    setDefaultHeaders(headers)

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
      onComplete([requestLog])
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

    window.electron?.ipcRenderer.on(CHANNEL_CANCELLED, (_: unknown, requestId: Identifier) => {
      if (requestId !== tabId) {
        return
      }
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

  return {
    sendPreRequest
  }
}
