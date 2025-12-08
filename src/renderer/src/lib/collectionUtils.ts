export const addFolderToCollection = (
  collection: Collection,
  parentPath: PathItem[],
  folder: CollectionFolder,
  insertAfterId?: number | string
): Collection => {
  const newCollection = { ...collection }

  if (parentPath.length === 0) {
    newCollection.elements = insertElement(newCollection.elements, folder, insertAfterId)
    return newCollection
  }

  const pathCopy = [...parentPath]

  return addFolderRescursive(newCollection, pathCopy, folder, insertAfterId)
}

const addFolderRescursive = <T extends Collection | CollectionFolder>(
  container: T,
  path: PathItem[],
  folderToAdd: CollectionFolder,
  insertAfterId?: number | string
): T => {
  if (path.length === 0) {
    return {
      ...container,
      elements: insertElement(container.elements, folderToAdd, insertAfterId)
    } as T
  }

  const nextPathItem = path[0]
  const remainingPath = path.slice(1)

  const nextElementIndex = container.elements.findIndex((e) => e.id === nextPathItem.id)

  if (nextElementIndex === -1) {
    console.error('Path element not found', nextPathItem)
    return container
  }

  const nextElement = container.elements[nextElementIndex]

  if (nextElement.type !== 'folder') {
    console.error('Path element is not a folder', nextPathItem)
    return container
  }

  const updatedNextElement = addFolderRescursive(
    nextElement,
    remainingPath,
    folderToAdd,
    insertAfterId
  )

  const newElements = [...container.elements]
  newElements[nextElementIndex] = updatedNextElement

  return {
    ...container,
    elements: newElements
  } as T
}

const insertElement = (
  elements: (CollectionFolder | RequestType)[],
  element: CollectionFolder,
  afterId?: number | string
) => {
  const newElements = [...elements]
  if (afterId) {
    const index = newElements.findIndex((e) => e.id === afterId)
    if (index !== -1) {
      newElements.splice(index + 1, 0, element)
      return newElements
    }
  }
  newElements.push(element)
  return newElements
}

export const findContainer = (
  collection: Collection,
  path: PathItem[]
): Collection | CollectionFolder | undefined => {
  let current: Collection | CollectionFolder = collection
  for (const pathItem of path) {
    if (!current.elements) return undefined
    const next = current.elements.find((e) => e.id === pathItem.id && e.type === 'folder') as
      | CollectionFolder
      | undefined
    if (!next) return undefined
    current = next
  }
  return current
}
