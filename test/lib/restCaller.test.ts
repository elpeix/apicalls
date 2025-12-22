import { fetch, Response } from 'undici'
import { describe, it, expect, vi, assert, afterEach } from 'vitest'
import { restCall } from '../../src/lib/restCaller'

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
    fetch: vi.fn(),
    Agent: vi.fn(),
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
      text = vi
        .fn()
        .mockResolvedValue(
          '--boundary\r\nContent-Disposition: form-data; name="key1"\r\n\r\nvalue1\r\n--boundary--'
        )
    }
  }
})

describe('restCaller', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  const RESULT = '{"result":"success"}'
  const STATUS_CODE = 200
  const STATUS_TEXT = 'OK'
  const CONTENT_LENGTH = 1234

  it('should return a CallResponse object', async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>

    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Length', CONTENT_LENGTH.toString())
    mockFetch.mockResolvedValue({
      ok: true,
      status: STATUS_CODE,
      statusText: STATUS_TEXT,
      headers: headers,
      text: async () => RESULT
    })
    const response = await restCall(1, {
      url: 'https://apicalls.dev/get',
      method: {
        value: 'GET',
        label: 'GET',
        body: false
      },
      queryParams: [{ name: 'name', value: 'John' }],
      headers: new Headers({
        'Content-Type': 'application/json',
        'Content-Length': CONTENT_LENGTH.toString()
      })
    })

    expect(response).toBeInstanceOf(Object)
    expect(response).toHaveProperty('result')
    expect(response.result).toBe(RESULT)
    expectStatus(response)
    expect(response).toHaveProperty('contentLength')
    expect(response.contentLength).toBe(1234)
    expectResponseTime(response)
    expect(response).toHaveProperty('responseHeaders')
  })

  const expectStatus = (response: CallResponse) => {
    expect(response).toHaveProperty('status')
    expect(response.status).toHaveProperty('code')
    expect(response.status).toHaveProperty('text')
    const status = response.status
    expect(status.code).toBe(STATUS_CODE)
    expect(status.text).toBe(STATUS_TEXT)
  }

  const expectResponseTime = (response: CallResponse) => {
    expect(response.responseTime).toHaveProperty('all')
    expect(response.responseTime.all).toBeTypeOf('number')
    expect(response.responseTime).toHaveProperty('data')
    expect(response.responseTime.data).toBeTypeOf('number')
    expect(response.responseTime).toHaveProperty('response')
    expect(response.responseTime.response).toBeTypeOf('number')
  }

  it('has a fetch error', async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>
    mockFetch.mockRejectedValue(new Error('Network error'))
    try {
      await restCall(1, { url: 'https://apicalls.dev/get' })
      assert.fail('should throw an error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      if (error instanceof Error) {
        expect(error.message).toBe('Rest call error')
      } else {
        assert.fail('should be an instance of Error')
      }
    }
  })

  it('should be success on POST request ', async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>

    mockFetch.mockReturnValue(
      new Promise((resolve, _) => {
        const headers: Headers = new Headers()
        headers.set('Content-Type', 'application/json')
        headers.set('Content-Length', CONTENT_LENGTH.toString())
        resolve({
          ok: true,
          status: STATUS_CODE,
          statusText: STATUS_TEXT,
          headers: headers,
          text: async () => RESULT
        } as Response)
      })
    )

    try {
      await restCall(1, {
        url: 'https://apicalls.dev/post',
        method: {
          value: 'POST',
          label: 'POST',
          body: true
        },
        queryParams: [],
        headers: new Headers({
          'Content-Type': 'application/json',
          'Content-Length': CONTENT_LENGTH.toString()
        }),
        body: JSON.stringify({ name: 'John' })
      })
    } catch (_error) {
      assert.fail('should not throw an error')
    }

    expect(mockFetch).toHaveBeenCalled()

    const url = mockFetch.mock.calls[0][0]
    const requestInit = mockFetch.mock.calls[0][1]

    expect(url).toBe('https://apicalls.dev/post')
    expect(requestInit).not.toBeUndefined()
    expect(requestInit).toHaveProperty('method')
    expect(requestInit?.method).toBe('POST')

    expect(requestInit).toHaveProperty('headers')
    const headers = requestInit?.headers
    expect(headers).toBeInstanceOf(Headers)
    if (headers !== undefined) {
      let count = 0
      ;(headers as Headers).forEach((value: string, key: string) => {
        count++
        if (key === 'Content-Type') {
          expect(value).toBe('application/json')
        }
        if (key === 'Content-Length') {
          expect(value).toBe(CONTENT_LENGTH.toString())
        }
      })
      expect(count).toBe(2)
    } else {
      assert.fail('headers should not be undefined')
    }

    expect(requestInit).toHaveProperty('body')
    expect(requestInit?.body).toBe('{"name":"John"}')
  })

  it('should be success on multipart/form-data request', async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>

    mockFetch.mockReturnValue(
      new Promise((resolve, _) => {
        resolve({
          ok: true,
          status: STATUS_CODE,
          statusText: STATUS_TEXT,
          headers: new Headers(),
          text: async () => RESULT
        } as Response)
      })
    )

    let response: CallResponse | null = null
    try {
      response = await restCall(1, {
        url: 'https://apicalls.dev/post',
        method: {
          value: 'POST',
          label: 'POST',
          body: true
        },
        queryParams: [],
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: JSON.stringify([
          { name: 'key1', value: 'value1', enabled: true },
          { name: 'key2', value: 'value2', enabled: false }
        ])
      })
    } catch (_error) {
      assert.fail('should not throw an error')
    }

    expect(mockFetch).toHaveBeenCalled()

    const requestInit = mockFetch.mock.calls[0][1]

    expect(requestInit).toHaveProperty('body')
    const body = requestInit?.body
    // Body should be the string returned by Response.text()
    expect(body).toBe(
      '--boundary\r\nContent-Disposition: form-data; name="key1"\r\n\r\nvalue1\r\n--boundary--'
    )

    const headers = requestInit?.headers as Headers
    expect(headers.has('Content-Type')).toBe(true)
    expect(headers.get('Content-Type')).toContain('multipart/form-data; boundary=boundary')

    expect(response).toBeDefined()
    expect(response?.sentBody).toBe(
      '--boundary\r\nContent-Disposition: form-data; name="key1"\r\n\r\nvalue1\r\n--boundary--'
    )
  })
})
