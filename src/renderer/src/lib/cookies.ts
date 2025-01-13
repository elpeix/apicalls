export const processCookies = (headers: KeyValue[], defaultDomain: string = '') => {
  const cookies = headers
    .filter((header) => header.name.toLowerCase() === 'set-cookie')
    .map((header) => {
      const parts = header.value.split(';')
      if (parts.length === 0) {
        return null
      }
      const cookieNameValue = parts.shift()
      if (!cookieNameValue || !cookieNameValue.includes('=')) {
        return null
      }
      const cookieName = cookieNameValue.split('=')
      const cookie: Cookie = {
        name: cookieName[0],
        value: cookieName[1],
        domain: defaultDomain,
        expires: new Date(),
        httpOnly: false,
        path: '',
        sameSite: ''
      }
      parts.forEach((item) => {
        const [key, value] = item.split('=')
        const trimmedKey = key.trim().toLowerCase()
        if (trimmedKey === 'expires') {
          cookie.expires = new Date(value)
        } else if (trimmedKey === 'domain') {
          cookie.domain = value.trim()
        } else if (trimmedKey === 'path') {
          cookie.path = value.trim()
        } else if (trimmedKey === 'httponly') {
          cookie.httpOnly = true
        } else if (trimmedKey === 'samesite') {
          cookie.sameSite = value.trim()
        } else if (trimmedKey === 'max-age') {
          cookie.expires = new Date(cookie.expires.getTime() + Number(value.trim()) * 1000)
        }
      })
      return cookie
    })
    .filter((cookie) => cookie !== null) as Cookie[]
  return cookies
}

export const updateCookies = (cookies: Cookie[], headers: KeyValue[], defaultUrl: string = '') => {
  const { hostname } = defaultUrl ? new URL(defaultUrl) : { hostname: '' }
  const newCookies = processCookies(headers, hostname)
  newCookies.forEach((newCookie) => {
    const index = cookies.findIndex(
      (cookie) => cookie.name === newCookie.name && cookie.domain === newCookie.domain
    )
    if (index === -1) {
      cookies.push(newCookie)
    } else {
      cookies[index] = newCookie
    }
  })
  return cookies
}

export const filterCookies = (url: string, cookies: Cookie[]) => {
  const { hostname, pathname } = new URL(url)
  return clearExpiredCookies(cookies).filter((cookie) => {
    if (isSameDomain(hostname, cookie.domain)) {
      if (cookie.path === '/') {
        return true
      }
      return pathname.startsWith(cookie.path)
    }
    return false
  })
}

export const getCookieValues = (url: string, cookies: Cookie[]) => {
  return filterCookies(url, cookies)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')
}

const isSameDomain = (domain: string, cookieDomain: string) => {
  if (cookieDomain === domain) {
    return true
  }
  if (cookieDomain.startsWith('.')) {
    return domain.endsWith(cookieDomain)
  }
  if (cookieDomain.startsWith('www.')) {
    return domain === cookieDomain.slice(4)
  }
  if (domain.startsWith('www.')) {
    return domain.slice(4) === cookieDomain
  }
  return false
}

export const clearExpiredCookies = (cookies: Cookie[]) => {
  const now = new Date()
  return cookies.filter((cookie) => {
    if (!cookie.expires) {
      return true
    }
    const expires = new Date(cookie.expires)
    return expires.getTime() > now.getTime()
  })
}

export const clearCookies = (url: string, cookies: Cookie[]) => {
  const { hostname } = new URL(url)
  return clearExpiredCookies(cookies).filter((cookie) => isSameDomain(hostname, cookie.domain))
}

export const removeDomainCookies = (domain: string, cookies: Cookie[]) => {
  return clearExpiredCookies(cookies).filter((cookie) => cookie.domain !== domain)
}

export const removeCookie = (cookies: Cookie[], index: number) => {
  return clearExpiredCookies(cookies).filter((_, i) => i !== index)
}
