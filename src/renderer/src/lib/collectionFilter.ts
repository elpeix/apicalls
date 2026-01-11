import { queryFilter } from './utils'

export const filterCollectionElements = (
  elements: (CollectionFolder | RequestType)[],
  filter: string
): (CollectionFolder | RequestType)[] => {
  if (filter === '' || elements.length === 0) {
    return elements
  }
  return filterElements(structuredClone(elements), filter)
}

const filterElements = (
  elements: (CollectionFolder | RequestType)[],
  filter: string
): (CollectionFolder | RequestType)[] => {
  if (filter === '' || elements.length === 0) {
    return elements
  }
  const newElements = [...elements]
  return newElements.filter((element) => {
    if (element.type === 'folder') {
      const folder = element as CollectionFolder
      const folderElements = filterElements(folder.elements, filter)
      const hasElements = folderElements.length > 0
      folder.expanded = hasElements
      folder.elements = folderElements
      return hasElements
    }
    if (!element.name) {
      return false
    }
    return partialFilter(element, filter)
  })
}

const partialFilter = (element: RequestType, filter: string): boolean => {
  const methodAndName = `${element.request.method.value} ${element.name}`.toLowerCase()
  return queryFilter(methodAndName, filter.toLowerCase()) > 0
}

export const toggleCollectionElements = (
  elements: (CollectionFolder | RequestType)[],
  expand: boolean,
  path: PathItem[] = []
) => {
  const pathCopy = [...path]
  elements.forEach((element) => {
    if (element.type === 'folder') {
      const folder = element as CollectionFolder
      if (pathCopy.length === 0) {
        folder.expanded = expand
      } else if (pathCopy.length > 0 && pathCopy[0].id === folder.id) {
        folder.expanded = expand
        pathCopy.shift()
      }
      toggleCollectionElements(folder.elements, expand, pathCopy)
    }
  })
  return elements
}

// TODO: Promise
export const flatRequests = (collections: Collection[]): FlatRequest[] => {
  return collections.flatMap((collection) =>
    flatElements(collection.id, collection.name, collection.elements)
  )
}

const flatElements = (
  collectionId: Identifier,
  collectionName: string,
  elements: (CollectionFolder | RequestType)[],
  folderId: Identifier = '',
  folderPath: string = '',
  path: PathItem[] = []
): FlatRequest[] => {
  let requests: FlatRequest[] = []
  elements.forEach((element) => {
    const newPath = [...path, { id: element.id, type: element.type } as PathItem]
    if (element.type === 'folder') {
      const folderRequests = flatElements(
        collectionId,
        collectionName,
        element.elements,
        element.id,
        `${folderPath}${element.name}/`,
        newPath
      )
      requests = requests.concat(folderRequests)
    } else {
      const filter = `${collectionName} ${element.request.method.value} ${element.name}`
      const filterPositions = [
        collectionName.length,
        collectionName.length + 1 + element.request.method.value.length,
        collectionName.length +
          1 +
          element.request.method.value.length +
          1 +
          (element.name?.length || 0)
      ]

      requests.push({
        ...element,
        collectionId,
        collectionName,
        folderId,
        folderPath,
        filter,
        path: newPath,
        filterPositions
      })
    }
  })
  return requests
}
