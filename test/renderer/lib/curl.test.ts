import { describe, it, expect } from 'vitest'
import { parseCurl } from '../../../src/renderer/src/lib/curl'

describe('parseCurl', () => {
  it('parses a simple GET curl command', () => {
    const curl = `curl -X GET 'https://api.test.com'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('GET')
    expect(result.headers).toEqual([])
    expect(result.body).toBe('none')
  })

  it('parses a curl command with query parameters', () => {
    const curl = `curl -X GET 'https://api.test.com?param1=value1&param2=value2'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('GET')
    expect(result.headers).toEqual([])
    expect(result.queryParams).toEqual([
      { name: 'param1', value: 'value1', enabled: true },
      { name: 'param2', value: 'value2', enabled: true }
    ])
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

  it('parses a curl command with headers and body in one line', () => {
    const curl = `curl -X PUT 'https://api.test.com' -H 'Content-Type: application/json' -d '{"hello":"world"}'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('PUT')
    expect(result.headers).toEqual([
      { name: 'Content-Type', value: 'application/json', enabled: true }
    ])
    expect(result.body).toEqual({ contentType: 'json', value: '{"hello":"world"}' })
  })

  it('parses a curl command without -X (defaults to GET)', () => {
    const curl = `curl 'https://example.com'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://example.com')
    expect(result.method.value).toBe('GET')
    expect(result.headers).toEqual([])
    expect(result.body).toBe('none')
  })

  it('parses a curl command with mixed quotes', () => {
    const curl = `curl -X POST "https://api.test.com" -H 'Content-Type: application/json' -d "{\\"foo\\":\\"bar\\"}"`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('POST')
    expect(result.headers).toEqual([
      { name: 'Content-Type', value: 'application/json', enabled: true }
    ])
    expect(result.body).toEqual({ contentType: 'json', value: '{"foo":"bar"}' })
  })

  it('parses a curl command with multiple -d (last one wins)', () => {
    const curl = `curl -X POST 'https://api.test.com' -d 'first' -d 'second'`
    const result = parseCurl(curl)
    expect(result.body).toEqual({ contentType: 'text', value: 'second' })
  })

  it('parses a curl command with body without quotes', () => {
    const curl = `curl -X POST 'https://api.test.com' -d foo=bar`
    const result = parseCurl(curl)
    expect(result.body).toEqual({ contentType: 'form-urlencoded', value: 'foo=bar' })
  })

  it('parses a curl command with header without space after colon', () => {
    const curl = `curl -X GET 'https://api.test.com' -H 'X-Token:abc123'`
    const result = parseCurl(curl)
    expect(result.headers).toEqual([{ name: 'X-Token', value: 'abc123', enabled: true }])
  })

  it('parses a header with colon in value', () => {
    const curl = `curl -X GET 'https://api.test.com' -H 'X-Info: value:with:colons'`
    const result = parseCurl(curl)
    expect(result.headers).toEqual([{ name: 'X-Info', value: 'value:with:colons', enabled: true }])
  })

  it('ignores unknown flags', () => {
    const curl = `curl -X GET 'https://api.test.com' --compressed`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('GET')
  })

  it('ignores flags without arguments', () => {
    const curl = `curl -L -X GET 'https://api.test.com'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.test.com')
    expect(result.method.value).toBe('GET')
  })

  it('parses a curl command with no url', () => {
    const curl = `curl -X GET`
    const result = parseCurl(curl)
    expect(result.url).toBe('')
  })

  it('parses a curl command with -X and -d but no url', () => {
    const curl = `curl -X POST -d '{"foo":"bar"}'`
    const result = parseCurl(curl)
    expect(result.url).toBe('')
    expect(result.method.value).toBe('POST')
    expect(result.body).toEqual({ contentType: 'json', value: '{"foo":"bar"}' })
  })

  it('parses basic GET request', () => {
    const curl = 'curl https://api.example.com/users'
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.example.com/users')
    expect(result.method.value).toBe('GET')
  })

  it('parses POST with JSON body', () => {
    const curl = `curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{"name": "John", "age": 30}'`
    const result = parseCurl(curl)
    expect(result.method.value).toBe('POST')
    expect(result.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Content-Type', value: 'application/json' })
      ])
    )
    const body = result.body as { contentType: string; value: string }
    expect(body.value).toBe('{"name": "John", "age": 30}')
  })

  it('parses complex escaped JSON body', () => {
    // curl -d "{\"key\": \"value\"}"
    const curl = `curl -X POST https://example.com -d "{\\"key\\": \\"value\\"}"`
    const result = parseCurl(curl)
    const body = result.body as { contentType: string; value: string }
    expect(body.value).toBe('{"key": "value"}')
  })

  it('parses URL with query parameters', () => {
    const curl = 'curl "https://api.example.com/search?q=test&page=1"'
    const result = parseCurl(curl)
    expect(result.url).toBe('https://api.example.com/search')
    expect(result.queryParams).toEqual([
      { name: 'q', value: 'test', enabled: true },
      { name: 'page', value: '1', enabled: true }
    ])
  })

  it('parses compressed flags (not supported by current parser likely)', () => {
    // e.g. -XPOST
    const curl = 'curl -XPOST https://example.com'
    const result = parseCurl(curl)
    expect(result.method.value).toBe('POST')
  })

  it('handles multiline curl commands', () => {
    const curl = `curl -X POST \\
      https://example.com \\
      -H 'Content-Type: application/json' \\
      -d '{"foo": "bar"}'`
    const result = parseCurl(curl)
    expect(result.url).toBe('https://example.com')
    const body = result.body as { contentType: string; value: string }
    expect(body.value).toBe('{"foo": "bar"}')
  })
})
