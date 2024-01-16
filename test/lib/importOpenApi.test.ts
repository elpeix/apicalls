import { describe, it, expect } from 'vitest'
import OpenApiImporter from '../../src/lib/importOpenApi'

describe('OpenApiImporter', () => {
  it('should throw an error when path is empty', () => {
    try {
      new OpenApiImporter('')
      expect.fail()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      const error = err as Error
      expect(error.message).toBe('path is empty')
    }
  })

  it('should throw an error when path is invalid', () => {
    try {
      new OpenApiImporter('invalid.json')
      expect.fail()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      const error = err as Error
      expect(error.message).toBe('path is invalid')
    }
  })

  it('should throw an error when file type is invalid', async () => {
    try {
      new OpenApiImporter('./test/fixtures/invalid')
      expect.fail()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      const error = err as Error
      expect(error.message).toBe('Invalid file type')
    }
  })

  it('should return an OpenApiImporter object', async () => {
    const fileNames = ['openapi.json', 'openapi.yaml', 'openapi.yml']
    for (const fileName of fileNames) {
      const result = new OpenApiImporter(`./test/fixtures/${fileName}`)
      expect(result).toBeInstanceOf(OpenApiImporter)
    }
  })

  it('should throw an error when JSON file is invalid', async () => {
    try {
      const importer = new OpenApiImporter('./test/fixtures/invalid.json')
      importer.import()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      const error = err as Error
      expect(error.message).toBe('Invalid JSON file')
    }
  })

  it('should throw an error when YAML file is invalid', async () => {
    try {
      const importer = new OpenApiImporter('./test/fixtures/invalid.yaml')
      importer.import()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      const error = err as Error
      expect(error.message).toBe('Invalid YAML file')
    }
  })

  it('should return a collection when JSON file is valid', async () => {
    const importer = new OpenApiImporter('./test/fixtures/openapi.json')
    for await (const progress of importer.import()) {
      expect(progress).toBeTypeOf('number')
    }
    const collection = importer.getCollection()
    expect(collection).toBeDefined()
    expect(collection).not.toBeNull()
    expect(collection.name).toBe('Openapi fixture')
    expect(collection.elements).toHaveLength(2)
    for (const element of collection.elements) {
      expect(element).toHaveProperty('name')
      expect(element).toHaveProperty('type')
      expect(element.type).toBe('collection')
      expect(element).toHaveProperty('request')
      const requestElement = element as RequestType
      const request = requestElement.request
      expect(request).toHaveProperty('url')
      expect(request).toHaveProperty('method')
      if (request.method.value === 'GET') {
        expect(request.url).toBe('http://localhost:3000/')
      } else if (request.method.value === 'POST') {
        expect(request.url).toBe('http://localhost:3000/otherPath')
      }
    }
  })
})
