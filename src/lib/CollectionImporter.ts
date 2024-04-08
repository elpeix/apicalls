/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Create openAPI types
import fs from 'fs'
import YAML from 'yaml'
import { getPathParamsFromUrl } from '../renderer/src/lib/paramsCapturer'

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
    } catch (_error) {
      throw new Error('path is invalid')
    }
  }

  private parseJson(data: string): object {
    try {
      return JSON.parse(data)
    } catch (_error) {
      throw new Error('Invalid JSON file')
    }
  }

  private parseYaml(data: string): object {
    try {
      return YAML.parse(data)
    } catch (_error) {
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
    const baseUrl = '{{baseUrl}}'
    if (data.paths) {
      collection.elements.push(...this.parsePaths(data.paths, baseUrl))
    }
    return collection
  }

  private parsePaths(paths: any, baseUrl: string): (RequestType | CollectionFolder)[] {
    const sortedPaths = this.sortPaths(paths)

    let count = 0
    const id = new Date().getTime()
    const collectionTree: (CollectionFolder | RequestType)[] = []
    for (const path in sortedPaths) {
      const params = this.getParams(sortedPaths[path])
      const collectionRequest: RequestType = {
        type: 'collection',
        id: `${id}_${++count}`,
        name: sortedPaths[path].summary || path,
        request: {
          url: baseUrl + path,
          method: this.getMethod(Object.keys(sortedPaths[path])[0]),
          headers: params.headers,
          pathParams: this.getPathParams(path),
          queryParams: params.queryParams
        }
      }
      const splitPath = path.split('/')
      let currentTree = collectionTree
      for (let i = 0; i < splitPath.length - 1; i++) {
        const pathPart = splitPath[i]
        if (!pathPart) {
          continue
        }
        const element = currentTree.find(
          (element) => (element as CollectionFolder).name === pathPart
        )
        if (element) {
          currentTree = (element as CollectionFolder).elements
        } else {
          const newFolder: CollectionFolder = {
            id: `folder_${id}_${++count}`,
            type: 'folder',
            name: pathPart,
            elements: []
          }
          currentTree.push(newFolder)
          currentTree = newFolder.elements
        }
      }
      const lastPathPart = splitPath[splitPath.length - 1]
      if (lastPathPart) {
        const element = currentTree.find(
          (element) => (element as CollectionFolder).name === lastPathPart
        )
        if (element) {
          currentTree = (element as CollectionFolder).elements
        }
      }
      currentTree.push(collectionRequest)
    }
    this.sortTree(collectionTree)
    return collectionTree
  }

  private getPathParams(path: string): KeyValue[] {
    return getPathParamsFromUrl(path)
  }

  private getParams(path: any): { headers: KeyValue[]; queryParams: KeyValue[] } {
    // Update type to openAPI path object
    const method = Object.keys(path)[0]
    const parameters = path[method].parameters ?? []
    const queryParams: KeyValue[] = []
    const headers: KeyValue[] = []
    if (!parameters) {
      return { headers, queryParams }
    }
    for (const parameter of parameters) {
      if (parameter.in === 'query') {
        queryParams.push({
          name: parameter.name,
          value: '',
          enabled: false
        })
      } else if (parameter.in === 'header') {
        headers.push({
          name: parameter.name,
          value: '',
          enabled: false
        })
      }
    }
    return { headers, queryParams }
  }

  private sortPaths(paths: any) {
    const sortedPaths: any = {}
    Object.keys(paths)
      .sort()
      .reverse()
      .forEach((key) => (sortedPaths[key] = paths[key]))
    return sortedPaths
  }

  private sortTree(tree: (CollectionFolder | RequestType)[]) {
    tree.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'collection') {
        return -1
      }
      if (a.type === 'collection' && b.type === 'folder') {
        return 1
      }
      if (a.type === 'folder' && b.type === 'folder') {
        return a.name.localeCompare(b.name)
      }
      if (a.type === 'collection' && b.type === 'collection') {
        const nameA = (a as RequestType).name || ''
        const nameB = (b as RequestType).name || ''
        return nameA.localeCompare(nameB)
      }
      return 0
    })
    for (const element of tree) {
      if (element.type === 'folder') {
        this.sortTree(element.elements)
      }
    }
  }

  private getMethod(method: string): Method {
    const methods: { [key: string]: Method } = {
      get: { value: 'GET', label: 'GET', body: false },
      post: { value: 'POST', label: 'POST', body: true },
      put: { value: 'PUT', label: 'PUT', body: true },
      patch: { value: 'PATCH', label: 'PATCH', body: true },
      delete: { value: 'DELETE', label: 'DELETE', body: false },
      head: { value: 'HEAD', label: 'HEAD', body: false },
      options: { value: 'OPTIONS', label: 'OPTIONS', body: false }
    }
    return methods[method] || methods['get']
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
