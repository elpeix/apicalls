export const moveElements = ({
  elements,
  from,
  to
}: {
  elements: (CollectionFolder | RequestType)[]
  from: PathItem[]
  to: PathItem[]
}): (CollectionFolder | RequestType)[] => {
  if (elements.length <= 1 || from.length === 0) {
    return elements
  }
  if (from[from.length - 1].id === to[to.length - 1]?.id) {
    return elements
  }
  findElement(elements, from, (elementsFrom, elementFrom) => {
    const indexFrom = elementsFrom.indexOf(elementFrom)
    if (to.length === 0) {
      elementsFrom.splice(indexFrom, 1)
      elements.push(elementFrom)
      return
    }
    findElement(elements, from, (elementsFrom, elementFrom) => {
      const indexFrom = elementsFrom.indexOf(elementFrom)
      if (to.length === 0) {
        elementsFrom.splice(indexFrom, 1)
        elements.push(elementFrom)
        return
      }
      findElement(
        elements,
        to,
        (elementsTo, elementTo) => {
          elementsFrom.splice(indexFrom, 1)
          if (to[to.length - 1].type === 'collection' && elementTo.type === 'folder') {
            elementTo.elements.push(elementFrom)
          } else {
            const indexTo = elementsTo.indexOf(elementTo)
            elementsTo.splice(indexTo, 0, elementFrom)
          }
        },
        () => {
          elementsFrom.splice(indexFrom, 0, elementFrom)
        }
      )
    })
  })

  return elements
}

const findElement = (
  elements: (CollectionFolder | RequestType)[],
  path: PathItem[],
  onFind: (
    elements: (CollectionFolder | RequestType)[],
    element: CollectionFolder | RequestType
  ) => void,
  onNotFound?: () => void
) => {
  const pathIds = path.map((item) => item.id)
  let element: CollectionFolder | RequestType | undefined
  while (pathIds.length) {
    const id = pathIds.shift()
    element = elements.find((element) => element.id === id)
    if (!element) {
      onNotFound?.()
      return
    }
    if (element.type === 'folder' && pathIds.length) {
      elements = element.elements
    }
  }
  if (element) {
    onFind(elements, element)
    return
  }
  onNotFound?.()
}
