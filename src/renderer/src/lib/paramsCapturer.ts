export const getPathParamsFromUrl = (url: string, previousPathParams: KeyValue[]): KeyValue[] => {
  if (!url || !url.includes('/')) return []

  const pathParams = url
    .split('/')
    .filter((p) => canBeParam(p))
    .map((p) => {
      const name = p.slice(1, -1)
      const values = (previousPathParams || [])
        .filter((param) => param.name === name)
        .map((param) => param.value)

      return {
        name,
        value: values[0] || '',
        enabled: true
      } as KeyValue
    })

  return pathParams
}

export const replacePathParams = (url: string, params: KeyValue[]): string => {
  url = url.trim()
  const pathParams = params.filter((p) => p.enabled)
  if (!url || !url.includes('/') || !pathParams.length) {
    return url
  }

  params = pathParams
  return url
    .split('/')
    .map((p: string, _: number) => {
      if (canBeParam(p)) {
        const name = p.slice(1, -1)
        for (let j = 0; j < pathParams.length; j++) {
          if (pathParams[j].name === name) {
            const value = pathParams[j].value
            pathParams.splice(j, 1)
            return value
          }
        }
      }
      return p
    })
    .join('/')
}

const canBeParam = (p: string): boolean => p.length > 2 && /^{(\w)+}$/i.test(p)

export const getQueryParamsFromUrl = (
  params: string,
  previousQueryParams: KeyValue[]
): KeyValue[] => {
  let queryParamList: KeyValue[] = []
  if (params) {
    queryParamList = params
      .split('&')
      .map((param: string): KeyValue | undefined => {
        const entry = param.split('=')
        if (entry.length <= 2) {
          const name = entry[0].trim()
          const value = decodeQueryParam(name, entry[1] || '')
          return { name, value, enabled: true }
        }
      })
      .filter((param): param is KeyValue => param !== undefined)
  }

  const newQueryParams = previousQueryParams
    .map((param) => {
      const paramIndex = queryParamList.findIndex((p) => p.name === param.name)
      if (paramIndex > -1) {
        const value = queryParamList[paramIndex].value
        queryParamList.splice(paramIndex, 1)
        return { ...param, value }
      } else {
        if (!param.enabled) return param
        return { ...param, toBeRemoved: true }
      }
    })
    .filter((param) => !param.toBeRemoved)

  return [...newQueryParams, ...queryParamList]
}

const decodeQueryParam = (name: string, value: string): string => {
  try {
    value = value.replaceAll('+', ' ')
    return decodeURIComponent(value.trim())
  } catch (_) {
    throw new Error(`Query param "${name}" is malformed`)
  }
}
