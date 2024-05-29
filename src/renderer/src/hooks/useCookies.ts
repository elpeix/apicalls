import { useState } from 'react'

export function useCookies(): CookiesHookType {
  const [items, setItems] = useState<OriginCookies[]>([])

  const upsert = (origin: string, cookies: string[]) => {
    let originCookies = get(origin)
    if (originCookies) {
      update(origin, cookies)
    } else {
      originCookies = { origin, cookies }
      updateOriginCookies([...items, originCookies])
    }
  }

  const update = (origin: string, cookies: string[]) => {
    updateOriginCookies(
      items.map((originCookies) => {
        if (originCookies.origin === origin) {
          return { origin, cookies }
        }
        return originCookies
      })
    )
  }

  const remove = (origin: string) => {
    updateOriginCookies(items.filter((originCookies) => originCookies.origin !== origin))
  }

  const updateOriginCookies = (newOriginCookies: OriginCookies[]) => {
    setItems([...newOriginCookies])
  }

  const clear = () => updateOriginCookies([])

  const getAll = () => items

  const get = (origin: string) => items.find((originCookies) => originCookies.origin === origin)

  return {
    upsert,
    remove,
    clear,
    getAll,
    get
  }
}
