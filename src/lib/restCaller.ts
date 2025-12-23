import {
  fetch,
  Agent,
  RequestInit,
  setGlobalDispatcher,
  FormData,
  Headers,
  Response,
  ProxyAgent,
  Dispatcher
} from 'undici'
import { RestCallerError } from './RestCallerError'
import { getSettings } from './settings'
import { openAsBlob } from 'node:fs'

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
      signal: abortController.signal,
      redirect: (settings.followRequestRedirect ?? false) ? 'follow' : 'manual'
    }
    let sentBody: string | undefined
    if (request.body && request.method.body) {
      // Normalize headers to handle case-insensitivity and various formats (array, object, Headers)
      const headers = new Headers(request.headers)
      const contentType = headers.get('content-type') || ''
      requestInit.headers = headers

      if (contentType.toLowerCase().includes('multipart/form-data')) {
        try {
          const formData = new FormData()
          const bodyParts = JSON.parse(request.body)
          if (Array.isArray(bodyParts)) {
            for (const part of bodyParts) {
              if (part.enabled) {
                if (part.type === 'file' && part.value) {
                  try {
                    const fileBlob = await openAsBlob(part.value)
                    formData.append(part.name, fileBlob, part.value.split(/[\\/]/).pop())
                  } catch (err) {
                    console.error(`Failed to read file: ${part.value}`, err)
                  }
                } else {
                  formData.append(part.name, part.value)
                }
              }
            }
          }
          // Serialize the form data to a string to ensure we use the same content type boundary for both the request and the log
          let bodyString = ''
          try {
            bodyString = await new Response(formData).text()
            sentBody = bodyString

            // Extract boundary from the body string (first line is usually "--boundary")
            const boundaryLine = bodyString.split('\r\n')[0] || bodyString.split('\n')[0]
            if (boundaryLine.startsWith('--')) {
              const boundary = boundaryLine.substring(2)
              headers.set('content-type', `multipart/form-data; boundary=${boundary}`)
            }

            requestInit.body = bodyString
          } catch (e) {
            console.error('Failed to read form-data body', e)
            requestInit.body = formData
            // Fallback: remove content-type and let fetch handle it (but boundary might mismatch in log)
            headers.delete('content-type')
          }
        } catch (e) {
          console.error('Failed to parse form-data body', e)
          requestInit.body = request.body
        }
      } else {
        requestInit.body = request.body
      }
    }

    let agent: Dispatcher
    if (settings.proxy) {
      agent = new ProxyAgent({
        uri: settings.proxy,
        keepAliveMaxTimeout: settings.timeout + 1000,
        bodyTimeout: settings.timeout,
        connectTimeout: settings.timeout,
        connect: {
          rejectUnauthorized: settings.rejectUnauthorized ?? true
        }
      })
    } else {
      agent = new Agent({
        keepAliveMaxTimeout: settings.timeout + 1000,
        bodyTimeout: settings.timeout,
        connectTimeout: settings.timeout,
        connect: {
          rejectUnauthorized: settings.rejectUnauthorized ?? true
        }
      })
    }

    setGlobalDispatcher(agent)

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
      responseHeaders: headers,
      sentBody
    } as CallResponse
  } catch (error) {
    const message = 'Rest call error'
    const response = {
      id,
      result: String(error),
      status: {
        code: 999,
        text: 'Internal Server Error'
      },
      contentLength: 0,
      responseTime: {
        all: 0,
        data: 0,
        response: 0
      },
      responseHeaders: []
    } as CallResponse
    const err = new RestCallerError(
      message,
      request,
      response,
      error instanceof Error ? error : null
    )
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
