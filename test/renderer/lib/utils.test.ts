import { describe, it, expect } from 'vitest'
import { getValueFromPath } from '../../../src/renderer/src/lib/utils'

describe('Get value from path test', () => {
  it('should return a blank value when json argument is not a JSON', () => {
    const path = 'any.path'
    const invalidJson = ['', '{{}', '[]', ']', '{value:true}']
    invalidJson.forEach((json) => {
      expect(getValueFromPath(json, path)).toBe('')
    })
  })

  it('should return a blank value when path is invalid', () => {
    const json = '{"data": {"value": "someValue"}}'
    const path = 'data.value.invalid'
    expect(getValueFromPath(json, path)).toBe('')
  })

  it('should return a blank value when path is valid but result is not a string', () => {
    const path = 'data'
    const jsons = ['{"data": {"value": "someValue"}}', '{"data": [1,2,3]}']
    jsons.forEach((json) => {
      expect(getValueFromPath(json, path)).toBe('')
    })
  })

  it('should return valid value from object', () => {
    const json = '{"data": {"value": "someValue"}}'
    const path = 'data.value'
    expect(getValueFromPath(json, path)).toBe('someValue')
  })

  it('should return valid value from array', () => {
    const json = '{"data": {"value": [1,2,3,5,7]}}'
    const path = 'data.value[3]'
    expect(getValueFromPath(json, path)).toBe(5)
  })

  it('should return valid value from nested object', () => {
    const json = '{"data": {"value": {"nested": true}}}'
    const path = 'data.value.nested'
    expect(getValueFromPath(json, path)).toBe(true)
  })

  it('should return valid value from nested array', () => {
    const json = '{"data": {"value": [1,2,[3,5,7]]}}'
    const path = 'data.value[2][1]'
    expect(getValueFromPath(json, path)).toBe(5)
  })

  it('should return valid value from nested array and object', () => {
    const json = '{"data": {"value": [1,2,[3,5,7], {"nested": true}]}}'
    const path = 'data.value[3].nested'
    expect(getValueFromPath(json, path)).toBe(true)
  })
})
