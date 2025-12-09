/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParserCollection } from './ParserCollection'

export class ParserOpenApi extends ParserCollection {
  // @Override (classic man)
  public parse(data: any): Collection {
    if (!data || !data.paths) {
      throw Error('Invalid openAPI file')
    }
    const id = new Date().getTime()
    const collection: Collection = {
      id,
      name: data.info.title,
      description: data.info.description || '',
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
      const splitPath = path.split('/')
      let currentTree = collectionTree
      for (let i = 0; i < splitPath.length - 1; i++) {
        const pathPart = splitPath[i]
        if (!pathPart || (pathPart === '{{baseUrl}}' && i === 0)) {
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

      for (const method in sortedPaths[path]) {
        const params = this.getParams(sortedPaths[path][method].parameters ?? [])
        currentTree.push({
          type: 'collection',
          id: `${id}_${++count}`,
          name: sortedPaths[path].summary || path,
          request: {
            url: path.startsWith('{{baseUrl}}') ? path : baseUrl + path,
            method: this.getMethod(method),
            headers: params.headers,
            pathParams: this.getPathParams(path),
            queryParams: params.queryParams
          }
        })
      }
    }
    this.sortTree(collectionTree)
    return collectionTree
  }

  private sortPaths(paths: any) {
    const sortedPaths: any = {}
    Object.keys(paths)
      .sort()
      .reverse()
      .forEach((key) => (sortedPaths[key] = paths[key]))
    return sortedPaths
  }

  private getParams(parameters: any): { headers: KeyValue[]; queryParams: KeyValue[] } {
    // Update type to openAPI path object
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
}
