import { describe, it, expect } from 'vitest'
import { EnvironmentImporter } from '../../src/lib/EnvironmentImporter'
import fs from 'fs'
import path from 'path'

describe('EnvironmentImporter', () => {
  const fixturePath = path.resolve(__dirname, '../fixtures/environment.json')

  it('should throw an error when path is empty', () => {
    expect(() => new EnvironmentImporter('')).toThrow('Invalid path provided.')
  })

  it('should throw an error when path is not a json file', () => {
    expect(() => new EnvironmentImporter('invalid.txt')).toThrow('Path must point to a JSON file.')
  })

  it('should throw an error when file does not exist', () => {
    expect(() => new EnvironmentImporter('non-existent.json')).toThrow(
      'File does not exist at the provided path.'
    )
  })

  it('should import a valid environment file', () => {
    const importer = new EnvironmentImporter(fixturePath)
    const environment = importer.import()

    expect(environment).toBeDefined()
    expect(environment.name).toBe('Test Environment')
    expect(environment.variables).toHaveLength(1)
    expect(environment.variables[0]).toEqual({
      name: 'baseUrl',
      value: 'https://api.example.com',
      enabled: true
    })
    expect(environment.requestHeaders).toBeDefined()
    expect(environment.requestHeaders).toHaveLength(1)
    expect(environment.requestHeaders?.[0]).toEqual({
      name: 'Authorization',
      value: 'Bearer token123',
      enabled: true
    })
  })

  it('should validate environment structure', () => {
    // Create a temporary invalid file
    const tempPath = path.resolve(__dirname, '../fixtures/invalid_env.json')
    fs.writeFileSync(tempPath, JSON.stringify({ foo: 'bar' }))

    try {
      const importer = new EnvironmentImporter(tempPath)
      expect(() => importer.import()).toThrow('Invalid environment file')
    } finally {
      fs.unlinkSync(tempPath)
    }
  })

  it('should simulate export and re-import cycle', () => {
    const originalEnv = {
      name: 'Export Test',
      variables: [{ name: 'var1', value: 'val1', enabled: true }],
      requestHeaders: [{ name: 'header1', value: 'value1', enabled: true }]
    }

    // Simulate export (JSON.stringify logic from ipcEnvironmentActions.ts)
    const exportedJson = JSON.stringify(originalEnv)

    // Write to a temp file
    const tempPath = path.resolve(__dirname, '../fixtures/temp_export_env.json')
    fs.writeFileSync(tempPath, exportedJson)

    try {
      const importer = new EnvironmentImporter(tempPath)
      const importedEnv = importer.import()

      expect(importedEnv.name).toBe(originalEnv.name)
      expect(importedEnv.variables).toEqual(originalEnv.variables)
      expect(importedEnv.requestHeaders).toEqual(originalEnv.requestHeaders)
    } finally {
      fs.unlinkSync(tempPath)
    }
  })
})
