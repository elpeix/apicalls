import { describe, it, expect, vi, assert } from 'vitest'
import { restCall } from '../../src/lib/restCaller'
// import { CallResponse } from '../../src/types/types'

const stubFetch = vi.fn()

global.fetch = stubFetch

describe('restCaller', () => {
  const RESULT = '{"result":"success"}'
  const STATUS_CODE = 200
  const STATUS_TEXT = 'OK'
  const CONTENT_LENGTH = 1234

  it('should return a CallResponse object', async () => {
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
      queryParams: new URLSearchParams({ name: 'John' }),
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
})
