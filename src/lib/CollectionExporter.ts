import { OpenApiType, PostmanCollection, PostmanItem, PostmanQuery } from './ImportExportTypes'

class CollectionExporter {
  private collection: Collection

  constructor(collection: Collection) {
    this.collection = collection
  }

  exportToJSON(): string {
    return JSON.stringify(this.collection, null, 2)
  }

  exportToOpenAPI(): string {
    const openApiCollection: OpenApiType = {
      openapi: '3.0.1',
      info: {
        title: this.collection.name,
        version: '1.0.0',
        description: ''
      },
      paths: {}
    }

    const elements = this.collection.elements || []
    for (const element of elements) {
      this.processCollectionElement(element, openApiCollection)
    }

    return JSON.stringify(openApiCollection, null, 2)
  }

  exportToPostman(): string {
    const postmanCollection: PostmanCollection = {
      info: {
        name: this.collection.name,
        description: this.collection.description || '',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: []
    }
    const elements = this.collection.elements || []
    for (const element of elements) {
      this.processPostmanElement(element, postmanCollection.item)
    }
    return JSON.stringify(postmanCollection, null, 2)
  }

  private processCollectionElement(
    element: CollectionFolder | RequestType,
    openApiCollection: OpenApiType
  ) {
    if (element.type === 'folder') {
      const folder = element as CollectionFolder
      if (!openApiCollection.paths) {
        openApiCollection.paths = {}
      }
      for (const child of folder.elements || []) {
        this.processCollectionElement(child, openApiCollection)
      }
    } else if (element.type === 'collection') {
      const requestType = element as RequestType
      const request = requestType.request || {}
      const path = request.url.replace(/\/$/, '')
      if (!openApiCollection.paths[path]) {
        openApiCollection.paths[path] = {}
      }
      openApiCollection.paths[path][request.method.value.toLowerCase()] = {
        summary: requestType.name,
        description: requestType.description || '',
        parameters: request.queryParams
          ?.filter((param) => param.enabled)
          .map((param) => ({
            name: param.name,
            in: 'path',
            required: true,
            schema: { type: 'string' }
          })),
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      }
    }
  }

  private processPostmanElement(element: CollectionFolder | RequestType, items: PostmanItem[]) {
    if (element.type === 'folder') {
      const folder = element as CollectionFolder
      const folderItem: PostmanItem = {
        name: folder.name,
        item: []
      }
      for (const child of folder.elements || []) {
        this.processPostmanElement(child, folderItem.item || [])
      }
      items.push(folderItem)
    } else if (element.type === 'collection') {
      const requestType = element as RequestType
      const request = requestType.request || {}
      const postmanItem: PostmanItem = {
        name: requestType.name || '',
        description: requestType.description || '',
        request: {
          method: request.method.value,
          url: {
            raw: request.url,
            protocol: request.url.startsWith('http') ? request.url.split('://')[0] : undefined,
            host: request.url.split('/').filter((part) => part && !part.includes('{')),
            query: request.queryParams?.map((param) => ({
              key: param.name,
              value: param.value,
              disabled: !param.enabled
            })) as PostmanQuery[]
          }
        }
      }
      items.push(postmanItem)
    }
  }
}

export default CollectionExporter
