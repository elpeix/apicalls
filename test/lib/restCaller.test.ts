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

describe('restCaller', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  const RESULT = '{"result":"success"}'
  const STATUS_CODE = 200
  const STATUS_TEXT = 'OK'
  const CONTENT_LENGTH = 1234

  it('should return a CallResponse object', async () => {
    const stubFetch = vi.fn()
    global.fetch = stubFetch

    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Length', CONTENT_LENGTH.toString())
    stubFetch.mockResolvedValue({
      ok: true,
      status: STATUS_CODE,
      statusText: STATUS_TEXT,
      headers: headers,
      text: async () => RESULT
    })
    const response = await restCall({
      url: 'https://apicalls.dev/get',
      method: 'GET',
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
    const stubFetch = vi.fn()
    global.fetch = stubFetch

    stubFetch.mockRejectedValue(new Error('Network error'))
    try {
      await restCall({ url: 'https://apicalls.dev/get' })
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
    const mockFetch = vi.fn(fetch)
    global.fetch = mockFetch

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
      await restCall({
        url: 'https://apicalls.dev/post',
        method: 'POST',
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
})
