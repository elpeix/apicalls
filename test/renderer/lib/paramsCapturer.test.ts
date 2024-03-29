import { it, describe, expect } from 'vitest'
import { getPathParamsFromUrl } from '../../../src/renderer/src/lib/paramsCapturer'

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
})

const getKeyValue = (name: string): KeyValue => {
  return { name, value: '', enabled: true }
}
