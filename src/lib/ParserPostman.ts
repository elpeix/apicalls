import { ParserCollection } from './ParserCollection'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type PostmanRequest = {
  method: string
  url: { raw: string; protocol?: string; host?: string[]; query?: string } | string
  header?: any[]
  body?: { raw: string }
}

export type PostmanItem = {
  id?: string
  name: string
  item?: PostmanItem[]
  request?: PostmanRequest | string
}

export type PostmanCollection = {
  info: { _postman_id?: string; name: string; schema?: string }
  item: PostmanItem[]
}

export class ParserPostman extends ParserCollection {
  count: number = 0
  id: Identifier = ''
  // @Override (classic man)
  public parse(data: any): Collection {
    if (!data || !data.item) {
      throw Error('Invalid collection')
    }
    try {
      data = data as PostmanCollection
      this.count = 0
      this.id = new Date().getTime().toString()
      return {
        id: data.info._postman_id || this.id,
        name: data.info.name,
        elements: this.parseItems(data.item)
      }
    } catch (error) {
      throw Error('Invalid collection' + error)
    }
  }

  private parseItems(items: PostmanItem[]): (RequestType | CollectionFolder)[] {
    return items.map((item) => {
      if (item.item) {
        return {
          id: item.id || `folder_${this.id}_${++this.count}`,
          type: 'folder',
          name: item.name,
          expanded: false,
          elements: this.parseItems(item.item)
        } as CollectionFolder
      }
      return this.getRequest(item)
    })
  }

  private getRequest(item: PostmanItem): RequestType {
    if (!item.request) {
      throw new Error('Invalid item structure')
    }

    let method: string
    let url: string
    let headers: KeyValue[] = []
    let queryParams: KeyValue[] = []
    let body: string = ''

    if (typeof item.request === 'string') {
      method = 'GET'
      url = item.request
    } else {
      const request = item.request as PostmanRequest
      if (typeof request.url === 'string') {
        method = request.method
        url = request.url
      } else {
        method = request.method
        url = request.url.raw
        if (request.header) {
          headers = request.header.map((header: any) => {
            return {
              name: header.key,
              value: header.value
            } as KeyValue
          })
        }
      }
      if (request.body && request.body.raw && typeof request.body.raw === 'string') {
        body = request.body.raw
      }
    }

    url = url.split('#')[0].trim()
    queryParams = this.getQueryParams(url)
    url = url.split('?')[0]
    url = this.replacePathParams(url)

    return {
      id: item.id || `${this.id}_${++this.count}`,
      type: 'collection',
      name: item.name,
      date: new Date().toISOString(),
      request: {
        method: this.getMethod(method),
        url: this.replacePathParams(url),
        headers,
        pathParams: this.getPathParams(url),
        queryParams,
        body
      }
    } as RequestType
  }

  private getQueryParams(url: string): KeyValue[] {
    if (!url.includes('?')) {
      return []
    }
    const query = url.split('?')[1]
    return query.split('&').map((param) => {
      const [name, value] = param.split('=')
      return { name, value }
    })
  }

  private replacePathParams(url: string): string {
    return url.replace(/:(\w+)/g, '{$1}')
  }
}
