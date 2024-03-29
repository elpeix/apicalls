export const getPathParamsFromUrl = (url: string): KeyValue[] => {
  if (!url || !url.includes('/')) return []
  return url
    .split('/')
    .filter((p) => p.length > 2 && /^{[a-z0-9]+}$/i.test(p))
    .map((p) => {
      return {
        name: p.slice(1, -1),
        value: '',
        enabled: true
      } as KeyValue
    })
}

export const getQueryParamsFromUrl = (
  params: string,
  previousQueryParams: KeyValue[]
): KeyValue[] => {
  const queryParamList: KeyValue[] = params
    ? params
        .split('&')
        .map((param): KeyValue | undefined => {
          const entry = param.split('=')
          if (entry.length <= 2) {
            const name = entry[0].trim()
            const value = entry[1].trim()
            return { name, value, enabled: true }
          }
        })
        .filter((param): param is KeyValue => param !== undefined)
    : []

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
