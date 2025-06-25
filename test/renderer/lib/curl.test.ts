import { describe, it, expect } from 'vitest'
import { parseCurl } from '../../../src/renderer/src/lib/curl'

describe('parseCurl', () => {
  it('parses a simple GET curl command', () => {
    const curl = `curl -X GET 'https://example.com'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://example.com')
    expect(result.method.value).toBe('GET')
    expect(result.headers).toEqual([])
    expect(result.body).toBe('none')
  })

  it('parses a curl command with headers', () => {
    const curl = `curl -X POST 'https://api.test.com' \\
-H 'Authorization: Bearer token' \\
-H 'Content-Type: application/json'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('POST')
    expect(result.headers).toEqual([
      { name: 'Authorization', value: 'Bearer token', enabled: true },
      { name: 'Content-Type', value: 'application/json', enabled: true }
    ])
    expect(result.body).toBe('none')
  })

  it('parses a curl command with body', () => {
    const curl = `curl -X POST 'https://api.test.com' \\
-d '{"foo":"bar"}'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('POST')
    expect(result.headers).toEqual([])
    expect(result.body).toEqual({ contentType: 'json', value: '{"foo":"bar"}' })
  })

  it('parses a curl command with headers and body', () => {
    const curl = `curl -X PUT 'https://api.test.com' \\
-H 'Content-Type: application/json' \\
-d '{"hello":"world"}'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('PUT')
    expect(result.headers).toEqual([
      { name: 'Content-Type', value: 'application/json', enabled: true }
    ])
    expect(result.body).toEqual({ contentType: 'json', value: '{"hello":"world"}' })
  })
})
