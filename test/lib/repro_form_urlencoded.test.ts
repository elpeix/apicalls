import { fetch } from 'undici'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { restCall } from '../../src/lib/restCaller'

vi.mock('../../src/lib/settings.ts', () => {
  const getSettings = vi.fn(() => {
    return { timeout: 1000 }
  })
  return {
    getSettings: getSettings
  }
})

vi.mock('undici', () => {
  return {
    fetch: vi.fn(),
    Agent: vi.fn(),
    ProxyAgent: vi.fn(),
    setGlobalDispatcher: vi.fn(),
    FormData: class {
      append = vi.fn()
    },
    Headers: Headers,
    Response: class {
      body: ReadableStream
      constructor(body: ReadableStream) {
        this.body = body
      }
      text = vi.fn().mockResolvedValue('success')
    }
  }
})

describe('restCaller reproduction', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should correctly encode application/x-www-form-urlencoded body', async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => 'success'
    })

    await restCall(1, {
      url: 'https://apicalls.dev/post',
      method: {
        value: 'POST',
        label: 'POST',
        body: true
      },
      queryParams: [],
      headers: new Headers({
        'content-type': 'application/x-www-form-urlencoded'
      }),

      body: JSON.stringify([
        { name: 'foo', value: 'bar', enabled: true },
        { name: 'baz', value: 'qux', enabled: true },
        { name: 'disabled', value: 'ignored', enabled: false }
      ])
    })

    expect(mockFetch).toHaveBeenCalled()
    const requestInit = mockFetch.mock.calls[0][1]

    expect(requestInit).toHaveProperty('body')
    expect(requestInit?.body).toBe('foo=bar&baz=qux')
  })
})
