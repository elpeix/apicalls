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
      headers: [],
      params: []
    }
  }
}

export const createMethod = (method: string): Method => {
  return {
    value: method,
    label: method,
    body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  }
}
