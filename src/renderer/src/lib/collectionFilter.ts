export const filterCollectionElements = (
  elements: (CollectionFolder | RequestType)[],
  filter: string
): (CollectionFolder | RequestType)[] => {
  if (filter === '' || elements.length === 0) {
    return elements
  }
  const copy = JSON.parse(JSON.stringify({ elements }))
  return filterElements(copy.elements, filter)
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
  return queryFilter(methodAndName, filter.toLowerCase())
}

const queryFilter = (text: string, filter: string): boolean => {
  let filterIndex = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === filter[filterIndex]) {
      filterIndex++
    }
    if (filterIndex === filter.length) {
      return true
    }
  }
  return false
}

export const toggleCollectionElements = (
  elements: (CollectionFolder | RequestType)[],
  expand: boolean
) => {
  elements.forEach((element) => {
    if (element.type === 'folder') {
      const folder = element as CollectionFolder
      folder.expanded = expand
      toggleCollectionElements(folder.elements, expand)
    }
  })
  return elements
}
