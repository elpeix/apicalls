import { getPathParamsFromUrl } from '../renderer/src/lib/paramsCapturer'

/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class ParserCollection {
  public parse(_: any): Collection {
    throw Error('Not implemented')
  }
  protected getMethod(method: string): Method {
    const methods: { [key: string]: Method } = {
      get: { value: 'GET', label: 'GET', body: false },
      post: { value: 'POST', label: 'POST', body: true },
      put: { value: 'PUT', label: 'PUT', body: true },
      patch: { value: 'PATCH', label: 'PATCH', body: true },
      delete: { value: 'DELETE', label: 'DELETE', body: false },
      head: { value: 'HEAD', label: 'HEAD', body: false },
      options: { value: 'OPTIONS', label: 'OPTIONS', body: false }
    }
    return methods[method.toLowerCase()] || methods['get']
  }

  protected getPathParams(path: string): KeyValue[] {
    return getPathParamsFromUrl(path, [])
  }
}
