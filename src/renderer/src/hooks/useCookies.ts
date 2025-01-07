import { useState } from 'react'
import { clearCookies, filterCookies, getCookieValues, updateCookies } from '../lib/cookies'

export function useCookies(): CookiesHookType {
  const [cookies, setCookies] = useState<Cookie[]>([])

  const upsert = (headers: KeyValue[]) => {
    setCookies((cookies) => updateCookies(cookies, headers))
  }

  const remove = (url: string) => {
    setCookies((cookies) => clearCookies(url, cookies))
  }

  const clear = () => setCookies([])

  const getAll = () => cookies

  const get = (url: string) => filterCookies(url, cookies)

  const stringify = (url: string) => getCookieValues(url, cookies)

  return {
    upsert,
    remove,
    clear,
    getAll,
    get,
    stringify
  }
}
