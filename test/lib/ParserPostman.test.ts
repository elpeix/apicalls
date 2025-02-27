import { describe, it, expect } from 'vitest'
import { ParserPostman, PostmanCollection, PostmanRequest } from '../../src/lib/ParserPostman'

describe('ParserPostman tests', () => {
  it('should thow an error if data is null', () => {
    const parser = new ParserPostman()
    expect(() => parser.parse(null)).toThrow('Invalid collection')
  })

  it('should thow an error if data is not a valid postman collection', () => {
    const parser = new ParserPostman()
    expect(() => parser.parse({})).toThrow('Invalid collection')
  })

  it('should parse a collection', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(getSimpleCollection({}))

    expect(collection.id).toBeDefined()
    expect(collection.name).toBe('Test collection')
    expect(collection.elements).toHaveLength(1)

    const element = collection.elements[0]
    expect(element.id).toBeDefined()
    expect(element.name).toBe('Test request')
    expect(element.type).toBe('collection')

    const requestElement = element as RequestType
    expect(requestElement.date).toBeDefined()
    expect(requestElement.request).toBeDefined()

    const request = requestElement.request
    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com')
    expect(request.method.value).toBe('GET')
  })

  it('should parse a collection with a string request', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(getSimpleCollection({ requestIsString: true }))
    const element = collection.elements[0] as RequestType
    const request = element.request

    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com')
  })

  it('should parse a collection with a url as string', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(getSimpleCollection({ urlIsObject: false }))
    const element = collection.elements[0] as RequestType
    const request = element.request

    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com')
  })

  it('should parse a collection with a url with path paramters', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(getSimpleCollection({ url: 'https://example.com/:id' }))
    const element = collection.elements[0] as RequestType
    const request = element.request

    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com/{id}')
    expect(request.pathParams).toHaveLength(1)
    const pathParam = request.pathParams?.[0]
    expect(pathParam?.name).toBe('id')
  })

  it('should parse a collection with a url with query parameters', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(getSimpleCollection({ url: 'https://example.com?id=1' }))
    const element = collection.elements[0] as RequestType
    const request = element.request

    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com')
    expect(request.queryParams).toHaveLength(1)
    const queryParam = request.queryParams?.[0]
    expect(queryParam?.name).toBe('id')
    expect(queryParam?.value).toBe('1')
  })

  it('should parse a collection with folders', () => {
    const parser = new ParserPostman()
    const collection = parser.parse({
      info: {
        name: 'Test collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'Folder 1',
          item: [
            {
              name: 'Test request',
              request: {
                method: 'GET',
                url: {
                  raw: 'https://example.com',
                  protocol: 'https',
                  host: ['example', 'com']
                }
              }
            }
          ]
        }
      ]
    })

    expect(collection.id).toBeDefined()
    expect(collection.name).toBe('Test collection')
    expect(collection.elements).toHaveLength(1)

    const element = collection.elements[0]
    expect(element.id).toBeDefined()
    expect(element.name).toBe('Folder 1')
    expect(element.type).toBe('folder')

    const folder = element as CollectionFolder
    expect(folder.expanded).toBe(false)
    expect(folder.elements).toHaveLength(1)

    const requestElement = folder.elements[0] as RequestType
    expect(requestElement.date).toBeDefined()
    expect(requestElement.request).toBeDefined()

    const request = requestElement.request
    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com')
    expect(request.method.value).toBe('GET')
  })

  it('should parse a collection with multiple folders', () => {
    const parser = new ParserPostman()
    const collection = parser.parse({
      info: {
        name: 'Test collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: 'Folder 1',
          item: [
            {
              name: 'Test request',
              request: {
                method: 'GET',
                url: {
                  raw: 'https://example.com',
                  protocol: 'https',
                  host: ['example', 'com']
                }
              }
            }
          ]
        },
        {
          name: 'Folder 2',
          item: [
            {
              name: 'Test request 2',
              request: {
                method: 'GET',
                url: {
                  raw: 'https://example2.com',
                  protocol: 'https',
                  host: ['example2', 'com']
                }
              }
            }
          ]
        }
      ]
    })

    expect(collection.id).toBeDefined()
    expect(collection.name).toBe('Test collection')
    expect(collection.elements).toHaveLength(2)

    const element1 = collection.elements[0]
    expect(element1.id).toBeDefined()
    expect(element1.name).toBe('Folder 1')
    expect(element1.type).toBe('folder')

    const folder1 = element1 as CollectionFolder
    expect(folder1.expanded).toBe(false)
    expect(folder1.elements).toHaveLength(1)

    const requestElement1 = folder1.elements[0] as RequestType
    expect(requestElement1.date).toBeDefined()
    expect(requestElement1.request).toBeDefined()

    const request1 = requestElement1.request
    expect(request1.method.value).toBe('GET')
    expect(request1.url).toBe('https://example.com')
    expect(request1.method.value).toBe('GET')

    const element2 = collection.elements[1]
    expect(element2.id).toBeDefined()
    expect(element2.name).toBe('Folder 2')
    expect(element2.type).toBe('folder')

    const folder2 = element2 as CollectionFolder
    expect(folder2.expanded).toBe(false)
    expect(folder2.elements).toHaveLength(1)

    const requestElement2 = folder2.elements[0] as RequestType
    expect(requestElement2.date).toBeDefined()
    expect(requestElement2.request).toBeDefined()

    const request2 = requestElement2.request
    expect(request2.method.value).toBe('GET')
    expect(request2.url).toBe('https://example2.com')
    expect(request2.method.value).toBe('GET')
  })

  it('should parse a collection with a post request', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(
      getSimpleCollection({
        method: 'POST',
        url: 'https://example.com'
      })
    )
    const element = collection.elements[0] as RequestType
    const request = element.request
    expect(request.method.value).toBe('POST')
    expect(request.url).toBe('https://example.com')
  })

  it('should parse a collection with a put request', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(
      getSimpleCollection({
        method: 'PUT',
        url: 'https://example.com'
      })
    )
    const element = collection.elements[0] as RequestType
    const request = element.request
    expect(request.method.value).toBe('PUT')
    expect(request.url).toBe('https://example.com')
  })

  it('should parse a collection with a rare request', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(
      getSimpleCollection({
        method: 'PROPFIND',
        url: 'https://example.com'
      })
    )
    const element = collection.elements[0] as RequestType
    const request = element.request
    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com')
  })

  it('should parse a collection with a request with headers', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(
      getSimpleCollection({
        url: 'https://example.com',
        requestIsString: false,
        addHeaders: true
      })
    )
    const element = collection.elements[0] as RequestType
    const request = element.request
    expect(request.headers).toHaveLength(1)
    const header = request.headers?.[0]
    expect(header?.name).toBe('Content-Type')
    expect(header?.value).toBe('application/json')
  })

  it('should parse a collection with a url with hash (ignored)', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(
      getSimpleCollection({
        url: 'https://example.com?id=1#hash'
      })
    )
    const element = collection.elements[0] as RequestType
    const request = element.request
    expect(request.method.value).toBe('GET')
    expect(request.url).toBe('https://example.com')
    expect(request.queryParams).toHaveLength(1)
    const queryParam = request.queryParams?.[0]
    expect(queryParam?.name).toBe('id')
    expect(queryParam?.value).toBe('1')
  })

  it('should parse a collection with a request with a body', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(
      getSimpleCollection({
        method: 'POST',
        url: 'https://example.com',
        requestIsString: false,
        body: '{"key": "value"}'
      })
    )
    const element = collection.elements[0] as RequestType
    const request = element.request
    expect(request.body).toBe('{"key": "value"}')
  })

  it('should pase a collection with {{}} in the url', () => {
    const parser = new ParserPostman()
    const collection = parser.parse(
      getSimpleCollection({
        url: '{{http}}://{{url}}:{{port}}/the/path'
      })
    )
    const element = collection.elements[0] as RequestType
    const request = element.request
    expect(request.url).toBe('{{http}}://{{url}}:{{port}}/the/path')
    expect(request.pathParams).toHaveLength(0)
  })
})

const getSimpleCollection = ({
  postmanId = undefined,
  method = 'GET',
  url = 'https://example.com',
  requestIsString = false,
  urlIsObject = true,
  addHeaders = false,
  body = ''
}: {
  postmanId?: string
  method?: string
  url?: string
  requestIsString?: boolean
  urlIsObject?: boolean
  addHeaders?: boolean
  body?: string
}): PostmanCollection => {
  const request = requestIsString
    ? url
    : ({
        method: method,
        body: { raw: body },
        url: urlIsObject
          ? {
              raw: url,
              protocol: 'https',
              host: ['example', 'com']
            }
          : url
      } as PostmanRequest)

  if (!requestIsString && addHeaders) {
    ;(request as PostmanRequest).header = [{ key: 'Content-Type', value: 'application/json' }]
  }

  return {
    info: {
      _postman_id: postmanId,
      name: 'Test collection',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [
      {
        name: 'Test request',
        request: request
      }
    ]
  }
}
