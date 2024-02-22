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
      params: []
    }
  }
}

export const createAuth = (type: RequestAuthType, value = ''): RequestAuth => {
  return { type, value }
}

export const createAuthHeaderValue = (requestAuth: RequestAuth): string => {
  if (requestAuth.type === 'none' || !requestAuth.value) {
    return ''
  }
  const types = {
    bearer: 'Bearer',
    basic: 'Basic'
  }
  return `${types[requestAuth.type]} ${requestAuth.value}`
}

export const createMethod = (method: string): Method => {
  return {
    value: method,
    label: method,
    body: ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)
  }
}
