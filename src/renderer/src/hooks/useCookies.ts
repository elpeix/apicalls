import { useState } from 'react'
import {
  clearExpiredCookies,
  filterCookies,
  getCookieValues,
  removeDomainCookies,
  updateCookies
} from '../lib/cookies'
import { COOKIES } from '../../../lib/ipcChannels'

export function useCookies(): CookiesHookType {
  const [cookies, setCookies] = useState<Cookie[]>([])
  const ipcRenderer = window.electron?.ipcRenderer

  const upsert = (headers: KeyValue[], defaultUrl: string = '') => {
    setCookies((cookies) => {
      const updatedCookies = updateCookies(cookies, headers, defaultUrl)
      ipcRenderer?.send(COOKIES.set, updatedCookies)
      return updatedCookies
    })
  }

  const updateGroup = (group: string, groupCookies: Cookie[]) => {
    const groups = getGroups()
    if (!groups.includes(group)) {
      return
    }
    setCookies((cookies) => {
      const clearedCookies = removeDomainCookies(group, cookies)
      const updatedCookies = [...clearedCookies, ...groupCookies]
      ipcRenderer?.send(COOKIES.set, updatedCookies)
      return updatedCookies
    })
  }

  const remove = (domain: string) => {
    setCookies((cookies) => {
      const clearedCookies = removeDomainCookies(domain, cookies)
      ipcRenderer?.send(COOKIES.set, clearedCookies)
      return clearedCookies
    })
  }

  const set = (cookies: Cookie[]) => {
    const clearedCookies = clearExpiredCookies(cookies)
    setCookies(clearedCookies)
  }

  const clear = () => {
    ipcRenderer?.send(COOKIES.set, [])
    setCookies([])
  }

  const getAll = () => cookies

  const getGroups = () => Array.from(new Set(cookies.map((cookie) => cookie.domain)))

  const getGrouped = () => {
    const groups = new Map<string, Cookie[]>()
    cookies.forEach((cookie) => {
      const group = groups.get(cookie.domain) || []
      group.push(cookie)
      groups.set(cookie.domain, group)
    })
    return groups
  }

  const get = (url: string) => filterCookies(url, cookies)

  const stringify = (url: string) => getCookieValues(url, cookies)

  return {
    set,
    upsert,
    remove,
    clear,
    getAll,
    getGroups,
    getGrouped,
    updateGroup,
    get,
    stringify
  }
}
