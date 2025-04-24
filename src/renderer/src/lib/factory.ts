export const createFolder = (name = 'New folder'): CollectionFolder => {
  return {
    id: new Date().getTime(),
    type: 'folder',
    name,
    elements: []
  }
}

export const createRequest = ({
  id = new Date().getTime(),
  type = 'draft',
  name = '',
  method = createMethod('GET')
}: {
  id?: Identifier
  type?: 'draft' | 'collection'
  name?: string
  method?: Method
}): RequestType => {
  return {
    id,
    type,
    name,
    request: {
      url: '',
      method,
      auth: createAuth('none'),
      headers: [],
      pathParams: [],
      queryParams: []
    }
  }
}

export const createAuth = (type: RequestAuthType, value = ''): RequestAuth => {
  return { type, value }
}

export const createMethod = (method: string): Method => {
  return {
    value: method,
    label: method,
    body: ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)
  }
}

export const getMethods = (): Method[] => [
  createMethod('GET'),
  createMethod('POST'),
  createMethod('PUT'),
  createMethod('PATCH'),
  createMethod('DELETE'),
  createMethod('HEAD'),
  createMethod('OPTIONS')
]

export const defaultHttpHeaders = {
  Accept: ['application/json', 'text/html', 'application/xml', '*/*'],
  'Accept-Encoding': ['gzip', 'deflate', 'br'],
  'Accept-Language': [],
  Authorization: [],
  'Cache-Control': ['no-cache', 'no-store', 'max-age='],
  Connection: ['keep-alive', 'close'],
  'Content-Length': [],
  'Content-Type': [
    'application/json',
    'application/xml',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain'
  ],
  Cookie: [],
  Host: [],
  'If-None-Match': [],
  Origin: [],
  Referer: [],
  'User-Agent': []
}
