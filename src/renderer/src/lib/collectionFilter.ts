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
    return element.name.toLowerCase().includes(filter.toLowerCase())
  })
}
