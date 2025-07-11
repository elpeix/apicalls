import { describe, it, expect } from 'vitest'
import CollectionExporter from '../../src/lib/CollectionExporter'

const mockCollection: Collection = {
  id: 'test-collection',
  name: 'Test Collection',
  description: 'A collection for testing purposes',
  elements: [
    {
      id: '123',
      type: 'collection',
      name: 'Get Users',
      description: 'Get all users',
      request: {
        url: '/users',
        method: { value: 'GET', label: 'GET', body: false },
        queryParams: [
          { name: 'id', enabled: true, value: '123' },
          { name: 'filter', enabled: false, value: 'active' }
        ]
      }
    },
    {
      id: 'folder-1',
      type: 'folder',
      name: 'User Folder',
      elements: [
        {
          id: '456',
          type: 'collection',
          name: 'Get User By Id',
          description: 'Get user by id',
          request: {
            url: '/users/{id}',
            method: { value: 'GET', label: 'GET', body: false },
            queryParams: [{ name: 'id', enabled: true, value: '456' }]
          }
        }
      ]
    }
  ]
}

describe('CollectionExporter', () => {
  it('exportToJSON returns the collection as JSON', () => {
    const exporter = new CollectionExporter(mockCollection)
    const json = exporter.exportToJSON()
    expect(JSON.parse(json)).toMatchObject(mockCollection)
  })

  it('exportToOpenAPI returns a valid OpenAPI JSON', () => {
    const exporter = new CollectionExporter(mockCollection)
    const openApiJson = exporter.exportToOpenAPI()
    const openApi = JSON.parse(openApiJson)
    expect(openApi.openapi).toBe('3.0.1')
    expect(openApi.info.title).toBe('Test Collection')
    expect(openApi.paths['/users'].get.summary).toBe('Get Users')
    expect(openApi.paths['/users'].get.parameters[0].name).toBe('id')
    expect(openApi.paths['/users/{id}'].get.summary).toBe('Get User By Id')
    expect(openApi.paths['/users/{id}'].get.parameters[0].name).toBe('id')
  })

  it('exportToPostman returns a valid Postman collection JSON', () => {
    const exporter = new CollectionExporter(mockCollection)
    const postmanJson = exporter.exportToPostman()
    const postmanCollection = JSON.parse(postmanJson)
    expect(postmanCollection.info.name).toBe('Test Collection')
    expect(postmanCollection.item[0].name).toBe('Get Users')
    expect(postmanCollection.item[0].request.method).toBe('GET')
    expect(postmanCollection.item[1].name).toBe('User Folder')
    expect(postmanCollection.item[1].item[0].name).toBe('Get User By Id')
  })
})
