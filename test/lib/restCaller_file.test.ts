import { vi, describe, it, expect, beforeEach } from 'vitest'
import { restCall } from '../../src/lib/restCaller'
import { Headers } from 'undici'

// Mock dependencies
const mockFetch = vi.fn()
const mockAgent = vi.fn()
const mockSetGlobalDispatcher = vi.fn()
const mockFormDataAppend = vi.fn()

// Mock settings.ts to avoid ElectronStore initialization
vi.mock('../../src/lib/settings.ts', () => {
  return {
    namedExport: 'getSettings',
    getSettings: () => {
      return { timeout: 1000 }
    }
  }
})

vi.mock('undici', () => {
  return {
    fetch: (...args: unknown[]) => mockFetch(...args),
    Agent: class {
      constructor(...args: unknown[]) {
        mockAgent(...args)
      }
    },
    setGlobalDispatcher: (...args: unknown[]) => mockSetGlobalDispatcher(...args),
    FormData: class {
      append(...args: unknown[]) {
        mockFormDataAppend(...args)
      }
    },
    Headers: class {
      map: Map<string, string>
      constructor(init?: Headers | [string, string][] | Record<string, string>) {
        this.map = new Map()
        if (init) {
          if (init instanceof Headers) {
            init.forEach((v, k) => this.map.set(k.toLowerCase(), v))
          } else if (Array.isArray(init)) {
            init.forEach(([k, v]) => this.map.set(k.toLowerCase(), v))
          } else {
            Object.entries(init).forEach(([k, v]) => this.map.set(k.toLowerCase(), v as string))
          }
        }
      }
      get(key: string) {
        return this.map.get(key.toLowerCase()) || null
      }
      set(key: string, value: string) {
        this.map.set(key.toLowerCase(), value)
      }
      has(key: string) {
        return this.map.has(key.toLowerCase())
      }
      delete(key: string) {
        this.map.delete(key.toLowerCase())
      }
      forEach(callback: (value: string, key: string) => void) {
        this.map.forEach((v, k) => callback(v, k))
      }
    },
    Response: class {
      body: string
      constructor(body: string) {
        this.body = body
      }
      text = vi
        .fn()
        .mockResolvedValue(
          '--boundary\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\n\r\nfile content\r\n--boundary--'
        )
    }
  }
})

vi.mock('node:fs', () => ({
  openAsBlob: vi.fn().mockResolvedValue(new Blob(['file content'], { type: 'text/plain' }))
}))

import { openAsBlob } from 'node:fs'

describe('restCaller with file upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      text: () => Promise.resolve('ok'),
      headers: new Map(),
      status: 200,
      statusText: 'OK'
    })
  })

  it('should handle file upload in multipart/form-data', async () => {
    const bodyWithFile = JSON.stringify([
      { name: 'textPart', value: 'textValue', enabled: true, type: 'text' },
      { name: 'filePart', value: '/path/to/test.txt', enabled: true, type: 'file' }
    ])

    const request = {
      url: 'http://test.com',
      method: { value: 'POST', label: 'POST', body: true },
      headers: { 'content-type': 'multipart/form-data' },
      body: bodyWithFile
    }

    const response = await restCall('test-id', request as CallRequest)

    expect(openAsBlob).toHaveBeenCalledWith('/path/to/test.txt')

    expect(mockFormDataAppend).toHaveBeenCalledWith('textPart', 'textValue')
    expect(mockFormDataAppend).toHaveBeenCalledTimes(2)
    const lastCall = mockFormDataAppend.mock.lastCall
    expect(lastCall?.[0]).toBe('filePart')
    expect(lastCall?.[1]).toBeInstanceOf(Blob)
    expect(lastCall?.[2]).toBe('test.txt')

    expect(response.sentBody).toContain('--boundary')
  })
})
