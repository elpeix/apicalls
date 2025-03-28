import { createMethod } from '../../src/renderer/src/lib/factory'

export const getRequest = (id: Identifier, name = '', method = 'GET'): RequestType => {
  if (!name) {
    name = `request-${id}`
  }
  return {
    id,
    type: 'collection',
    name,
    request: {
      url: 'anyUrl',
      method: createMethod(method),
      headers: [],
      queryParams: []
    }
  }
}

export const getFolder = (
  id: Identifier,
  elements: (CollectionFolder | RequestType)[] = [],
  name = 'folder'
): CollectionFolder => {
  return {
    id,
    type: 'folder',
    name,
    elements
  }
}
