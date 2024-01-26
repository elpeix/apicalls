const defaultMethod = 'GET'

export const restCall = async (request: CallRequest): Promise<CallResponse> => {
  if (!request.method) {
    request.method = defaultMethod
  }
  try {
    let path = request.url
    if (request.queryParams && request.queryParams.toString() !== '') {
      path += `?${request.queryParams.toString()}`
    }
    const initTime = Date.now()
    const requestInit: RequestInit = {
      method: request.method,
      headers: request.headers,
      cache: 'no-cache'
    }
    if (request.body) {
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
    const err = new Error('Rest call error')
    if (error instanceof Error) {
      err.stack = error.stack
    }
    throw err
  }
}