export const createFolder = (name = 'New folder'): CollectionFolder => {
  return {
    id: crypto.randomUUID(),
    type: 'folder',
    name,
    elements: []
  }
}

export const createRequest = ({
  id = crypto.randomUUID(),
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

const generateNewId = (): Identifier => {
  return crypto.randomUUID()
}

const duplicateElementRecursive = (
  element: CollectionFolder | RequestType
): CollectionFolder | RequestType => {
  const newId = generateNewId()

  if (element.type === 'folder') {
    const duplicatedFolder: CollectionFolder = {
      ...element,
      id: newId,
      name: element.name,
      elements: element.elements.map((child) => duplicateElementRecursive(child)) as (
        | CollectionFolder
        | RequestType
      )[]
    }
    return duplicatedFolder
  }

  const duplicatedRequest: RequestType = {
    ...element,
    id: newId,
    name: element.name,
    request: duplicateRequestBase(element.request)
  }
  return duplicatedRequest
}

export const duplicateFolder = (folder: CollectionFolder): CollectionFolder => {
  const duplicated = duplicateElementRecursive(folder) as CollectionFolder
  return {
    ...duplicated,
    name: `${folder.name} Copy`
  }
}

const duplicateRequestBase = (request: RequestBase): RequestBase => {
  return {
    url: request.url,
    method: request.method,
    auth: request.auth,
    headers: request.headers ? duplicateKeyValues(request.headers) : [],
    pathParams: request.pathParams ? duplicateKeyValues(request.pathParams) : [],
    queryParams: request.queryParams ? duplicateKeyValues(request.queryParams) : [],
    body: request.body
  }
}

const duplicateKeyValues = (keyValues: KeyValue[]): KeyValue[] => {
  return keyValues.map((keyValue) => ({ ...keyValue }))
}
