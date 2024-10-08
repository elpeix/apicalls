export const getPathParamsFromUrl = (url: string): KeyValue[] => {
  if (!url || !url.includes('/')) return []
  return url
    .split('/')
    .filter((p) => canBeParam(p))
    .map((p) => {
      return {
        name: p.slice(1, -1),
        value: '',
        enabled: true
      } as KeyValue
    })
}

export const replacePathParams = (url: string, params: KeyValue[]): string => {
  url = url.trim()
  params = params.filter((p) => p.enabled)
  if (!url || !url.includes('/') || !params.length) {
    return url
  }
  return url
    .split('/')
    .map((p: string, _: number) => {
      if (canBeParam(p)) {
        const name = p.slice(1, -1)
        for (let j = 0; j < params.length; j++) {
          if (params[j].name === name) {
            const value = params[j].value
            params.splice(j, 1)
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
          const value = entry[1].trim()
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
