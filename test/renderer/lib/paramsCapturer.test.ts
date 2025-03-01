import { it, describe, expect } from 'vitest'
import {
  getPathParamsFromUrl,
  getQueryParamsFromUrl,
  replacePathParams
} from '../../../src/renderer/src/lib/paramsCapturer'

describe('Params Capturer Test', () => {
  it('should return an empty array if url is empty', () => {
    expect(getPathParamsFromUrl('')).toEqual([])
    expect(getPathParamsFromUrl('  ')).toEqual([])
  })

  it('should return an empty array if url has no path', () => {
    expect(getPathParamsFromUrl('/')).toEqual([])
    expect(getPathParamsFromUrl('https://example.com')).toEqual([])
  })

  it('should return an empty array if url has invalid params', () => {
    expect(getPathParamsFromUrl('/{}')).toEqual([])
    expect(getPathParamsFromUrl('https://example.com{:param}')).toEqual([])
    expect(getPathParamsFromUrl('https://example.com/{')).toEqual([])
    expect(getPathParamsFromUrl('https://example.com/{}')).toEqual([])
    expect(getPathParamsFromUrl('https://example.com/{/}')).toEqual([])
  })

  it('should return an empty array if url has param with /{any}a', () => {
    expect(getPathParamsFromUrl('/{any}a')).toEqual([])
  })

  it('should return an array if url has params with /{any}/', () => {
    const params = getPathParamsFromUrl('/{any}/')
    expect(params).toEqual([getKeyValue('any')])
  })

  it('should return an array if url has params with /{any}', () => {
    const params = getPathParamsFromUrl('/{any}')
    expect(params).toEqual([getKeyValue('any')])
  })

  it('should return an array if url has params with /{any}/{other}', () => {
    const params = getPathParamsFromUrl('/{any}/{other}')
    expect(params).toEqual([getKeyValue('any'), getKeyValue('other')])
  })

  it('should return an array if url has params with /{{env}}/{any}/', () => {
    const params = getPathParamsFromUrl('/{{env}}/{any}/')
    expect(params).toEqual([getKeyValue('any')])
  })

  it('should return an array if url has params with /{any_param}', () => {
    const params = getPathParamsFromUrl('/{any_param}')
    expect(params).toEqual([getKeyValue('any_param')])
  })

  it('should return decoded query paramaters value', () => {
    const params = getQueryParamsFromUrl('q=a%26b%25c', [])
    expect(params).toEqual([getKeyValue('q', 'a&b%c')])
  })

  it('should return multiple query parameters', () => {
    const params = getQueryParamsFromUrl('q=a%26b%25c&other=true', [])
    expect(params).toEqual([getKeyValue('q', 'a&b%c'), getKeyValue('other', 'true')])
  })

  it('should return an error when query parameters are malformed', () => {
    try {
      getQueryParamsFromUrl('q=a&b=c%d', [])
      expect.fail()
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      const error = err as Error
      expect(error.message).toBe('Query param "b" is malformed')
    }
  })

  it('should not fail when querye parameters does not have values', () => {
    const params = getQueryParamsFromUrl('a&b', [])
    expect(params).toEqual([getKeyValue('a', ''), getKeyValue('b', '')])
  })

  it('getQueryParamsFromUrl should replace spaces with +', () => {
    const params = getQueryParamsFromUrl('a=b+c+d', [])
    expect(params).toEqual([getKeyValue('a', 'b c d')])
  })
})

const getKeyValue = (name: string, value = '', enabled = true): KeyValue => {
  return { name, value, enabled }
}

describe('Replace path params', () => {
  it('should return an empty string if url is empty', () => {
    expect(replacePathParams('', [])).toEqual('')
    expect(replacePathParams('  ', [])).toEqual('')
  })

  it('should return the url if no params', () => {
    expect(replacePathParams('/test', [])).toEqual('/test')
    expect(replacePathParams('https://example.com', [])).toEqual('https://example.com')
    expect(replacePathParams('https://example.com/test', [])).toEqual('https://example.com/test')
    expect(replacePathParams('https://example.com/test/', [])).toEqual('https://example.com/test/')
    expect(replacePathParams('https://example.com/{test}', [])).toEqual(
      'https://example.com/{test}'
    )
  })

  it('should return the url without replace disabled params', () => {
    const params = [getKeyValue('test', 'value', false)]
    expect(replacePathParams('/{test}', params)).toEqual('/{test}')
    expect(params.length).toBe(1)
    expect(params[0].enabled).toBe(false)
  })

  it('should replace the params', () => {
    const params = [getKeyValue('test', 'value')]
    expect(replacePathParams('/{test}', params)).toEqual('/value')
    expect(params.length).toBe(1)
    expect(params[0].enabled).toBe(true)
    expect(params[0].value).toBe('value')
  })

  it('should replace once', () => {
    const params = [getKeyValue('test', 'value')]
    expect(replacePathParams('/{test}/{test}', params)).toEqual('/value/{test}')
  })

  it('should not replace env variables', () => {
    const params = [getKeyValue('test', 'value'), getKeyValue('env', 'nops')]
    expect(replacePathParams('/{{env}}/{test}', params)).toEqual('/{{env}}/value')
  })
})
