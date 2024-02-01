import fs from 'fs'
import YAML from 'yaml'

class CollectionImporter {
  private collection: Collection | undefined

  constructor(private path: string) {
    this.path = path
    this.validatePath()
  }

  private validatePath() {
    if (!this.path) {
      throw new Error('path is empty')
    }
    if (
      !this.path.endsWith('.json') &&
      !this.path.endsWith('.yaml') &&
      !this.path.endsWith('.yml')
    ) {
      throw new Error('Invalid file type')
    }
    if (!fs.existsSync(this.path)) {
      throw new Error('path is invalid')
    }
  }

  private readFile(): string {
    try {
      return fs.readFileSync(this.path, 'utf-8')
    } catch (error) {
      throw new Error('path is invalid')
    }
  }

  private parseJson(data: string): Object {
    try {
      return JSON.parse(data)
    } catch (error) {
      throw new Error('Invalid JSON file')
    }
  }

  private parseYaml(data: string): Object {
    try {
      return YAML.parse(data)
    } catch (error) {
      throw new Error('Invalid YAML file')
    }
  }

  private parseCollection(data: any): Collection {
    const id = new Date().getTime()
    const collection: Collection = {
      id,
      name: data.info.title,
      elements: []
    }
    let baseUrl = '{{baseUrl}}'
    if (data.servers) {
      baseUrl = data.servers[0].url
    }
    if (data.paths) {
      collection.elements.push(...this.parsePaths(data.paths, baseUrl))
    }
    return collection
  }

  private parsePaths(paths: any, baseUrl: string): RequestType[] {
    const collectionRequests: RequestType[] = []
    let count = 0
    const id = new Date().getTime()
    for (const path in paths) {
      const collectionRequest: RequestType = {
        type: 'collection',
        id: `${id}_${++count}`, // TODO generate id
        name: paths[path].summary || path,
        request: {
          url: baseUrl + path,
          method: this.getMethod(Object.keys(paths[path])[0]),
          headers: [],
          params: []
        }
      }
      collectionRequests.push(collectionRequest)
    }
    return collectionRequests
  }

  private getMethod(method: string): Method {
    switch (method) {
      case 'get':
        return { value: 'GET', label: 'GET', body: false }
      case 'post':
        return { value: 'POST', label: 'POST', body: true }
      case 'put':
        return { value: 'PUT', label: 'PUT', body: true }
      case 'patch':
        return { value: 'PATCH', label: 'PATCH', body: true }
      case 'delete':
        return { value: 'DELETE', label: 'DELETE', body: false }
      case 'head':
        return { value: 'HEAD', label: 'HEAD', body: false }
      case 'options':
        return { value: 'OPTIONS', label: 'OPTIONS', body: false }
      default:
        return { value: 'GET', label: 'GET', body: false }
    }
  }

  public async *import(): AsyncGenerator<number> {
    const data = this.readFile()
    yield 33.33 // 33.33% progress
    const parsedData = this.path.endsWith('.json') ? this.parseJson(data) : this.parseYaml(data)
    yield 66.66 // 66.66% progress
    this.collection = this.parseCollection(parsedData)
    yield 100 // 100% progress
  }

  public getCollection(): Collection {
    if (!this.collection) {
      throw new Error('collection is undefined')
    }
    return this.collection
  }
}

export default CollectionImporter
