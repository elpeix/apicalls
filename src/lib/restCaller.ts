import { RestCallerError } from './RestCallerError'
import { getSettings } from './settings'

const defaultMethod: Method = {
  value: 'GET',
  label: 'GET',
  body: false
}

const abortControllers: Map<Identifier, AbortController> = new Map()

export const restCall = async (id: Identifier, request: CallRequest): Promise<CallResponse> => {
  if (!request.method) {
    request.method = defaultMethod
  }
  try {
    const abortController = new AbortController()
    abortControllers.set(id, abortController)
    const settings = getSettings()
    if (settings.timeout > 0) {
      setTimeout(() => {
        abortController.abort()
        abortControllers.delete(id)
      }, settings.timeout)
    }

    let path = request.url
    const queryParams = new URLSearchParams()
    if (request.queryParams && request.queryParams.length > 0) {
      request.queryParams
        .filter((param) => param.enabled && param.name)
        .forEach((param) => {
          queryParams.append(param.name, param.value)
        })
      path += `?${queryParams.toString()}`
    }
    const initTime = Date.now()
    const requestInit: RequestInit = {
      method: request.method.value,
      headers: request.headers,
      cache: 'no-cache',
      signal: abortController.signal
    }
    if (request.body && request.method.body) {
      requestInit.body = request.body
    }
    const response = await fetch(path, requestInit)
    const requestTime = Date.now() - initTime
    const dataTime = Date.now()

    const result = await response.text()
    const responseTime = {
      all: Date.now() - initTime,
      data: Date.now() - dataTime,
      response: requestTime
    }

    let contentLength = parseInt(response.headers.get('Content-Length') ?? '0')
    if (contentLength === 0) {
      contentLength = result.length
    }
    const headers: KeyValue[] = []
    response.headers.forEach((value, key) => {
      headers.push({ name: key, value })
    })
    return {
      id,
      result,
      status: {
        code: response.status,
        text: response.statusText
      },
      contentLength,
      responseTime,
      responseHeaders: headers
    } as CallResponse
  } catch (error) {
    const err = new RestCallerError('Rest call error', request, null)
    if (error instanceof Error) {
      err.stack = error.stack
    }
    throw err
  }
}

export const restCancel = (id: Identifier): boolean => {
  const controller = abortControllers.get(id)
  if (controller) {
    controller.abort()
    abortControllers.delete(id)
    return true
  }
  return false
}
