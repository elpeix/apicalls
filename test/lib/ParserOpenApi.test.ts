import { describe, it, expect } from 'vitest'
import { ParserOpenApi } from '../../src/lib/ParserOpenApi'

describe('ParserOpenApi', () => {
  it('should parse description from openapi operation', () => {
    const parser = new ParserOpenApi()
    const openApiData = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0'
      },
      paths: {
        '/test': {
          get: {
            summary: 'Test Endpoint',
            description: 'This is a test description',
            responses: {
              '200': {
                description: 'OK'
              }
            }
          }
        }
      }
    }

    const collection = parser.parse(openApiData)
    const request = collection.elements[0] as RequestType

    expect(request.type).toBe('collection')
    expect(request.request).toBeDefined()
    expect(request.description).toBe('This is a test description')
  })
})
