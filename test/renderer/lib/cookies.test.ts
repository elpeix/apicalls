import { describe, it, expect } from 'vitest'
import {
  processCookies,
  clearExpiredCookies,
  clearCookies,
  removeCookie
} from '../../../src/renderer/src/lib/cookies'

describe('Cookies test', () => {
  it('should process cookies correctly', () => {
    const headers = [
      {
        name: 'Set-Cookie',
        value:
          'name=value; domain=example.com; expires=Wed, 21 Oct 2015 07:28:00 GMT; path=/; HttpOnly; SameSite=None'
      },
      {
        name: 'Set-Cookie',
        value:
          'name2=value2; Domain=example.com; expires=Wed, 21 Oct 2025 07:28:00 GMT; path=/; HttpOnly; SameSite=None'
      }
    ]
    const cookies = processCookies(headers)
    expect(cookies).toEqual([
      {
        name: 'name',
        value: 'value',
        domain: 'example.com',
        expires: new Date('Wed, 21 Oct 2015 07:28:00 GMT'),
        httpOnly: true,
        sameSite: 'None',
        path: '/'
      },
      {
        name: 'name2',
        value: 'value2',
        domain: 'example.com',
        expires: new Date('Wed, 21 Oct 2025 07:28:00 GMT'),
        httpOnly: true,
        sameSite: 'None',
        path: '/'
      }
    ])
  })

  it('should not process invalid cookies', () => {
    const headers = [
      {
        name: 'SetCookie',
        value: 'name=value; domain=example.com; expires=Wed, 21 Oct 2015 07:28:00 GMT'
      },
      {
        name: 'Set-Cookie',
        value: '; Domain=example.com; expires=Wed, 21 Oct 2025 07:28:00 GMT'
      },
      {
        name: 'Set-Cookie',
        value: 'name2-value2; Domain=example.com; expires=Wed, 21 Oct 2025 07:28:00 GMT'
      }
    ]
    const cookies = processCookies(headers)
    expect(cookies).toEqual([])
  })

  it('should clear expired cookies', () => {
    const cookies = [
      {
        name: 'name',
        value: 'value',
        domain: 'example.com',
        expires: new Date('Wed, 21 Oct 2015 07:28:00 GMT'),
        httpOnly: true,
        sameSite: 'None',
        path: '/'
      }
    ]
    const clearedCookies = clearExpiredCookies(cookies)
    expect(clearedCookies).toEqual([])
  })

  it('should not clear non-expired cookies', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const cookies = [
      {
        name: 'name',
        value: 'value',
        domain: 'example.com',
        expires: futureDate,
        httpOnly: true,
        sameSite: 'None',
        path: '/'
      }
    ]
    const clearedCookies = clearExpiredCookies(cookies)
    expect(clearedCookies).toEqual(cookies)
  })

  it('should clear cookies by domain', () => {
    const cookies = [
      {
        name: 'name',
        value: 'value',
        domain: 'example.com',
        expires: new Date('Wed, 21 Oct 2015 07:28:00 GMT'),
        httpOnly: true,
        sameSite: 'None',
        path: '/'
      }
    ]
    const clearedCookies = clearCookies('https://example.com', cookies)
    expect(clearedCookies).toEqual([])
  })

  it('should remove cookie by index', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const cookies = [
      {
        name: 'name',
        value: 'value',
        domain: 'example.com',
        expires: futureDate,
        httpOnly: true,
        sameSite: 'None',
        path: '/'
      },
      {
        name: 'name2',
        value: 'value2',
        domain: 'example.com',
        expires: futureDate,
        httpOnly: true,
        sameSite: 'None',
        path: '/'
      }
    ]
    const index = 1
    const removedCookies = removeCookie(cookies, index)
    expect(removedCookies).toEqual([cookies[0]])
  })
})
