export const moveElements = (args: {
  elements: (CollectionFolder | RequestType)[]
  from: PathItem[]
  to: PathItem[]
}): {
  moved: boolean
  elements?: (CollectionFolder | RequestType)[]
} => {
  const {
    elements,
    from,
    to
  }: {
    elements: (CollectionFolder | RequestType)[]
    from: PathItem[]
    to: PathItem[]
  } = JSON.parse(JSON.stringify(args))
  let moved = false

  if (
    elements.length < 1 ||
    from.length === 0 ||
    from[from.length - 1].id === to[to.length - 1]?.id ||
    fromIsParentOfTo(from, to)
  ) {
    return { moved }
  }

  findElement(elements, from, (elementsFrom, elementFrom) => {
    const indexFrom = elementsFrom.indexOf(elementFrom)
    if (to.length === 0) {
      moved = true
      elementsFrom.splice(indexFrom, 1)
      elements.push(elementFrom)
      return
    }
    findElement(elements, from, (elementsFrom, elementFrom) => {
      const indexFrom = elementsFrom.indexOf(elementFrom)
      if (to.length === 0) {
        moved = true
        elementsFrom.splice(indexFrom, 1)
        elements.push(elementFrom)
        return
      }
      findElement(
        elements,
        to,
        (elementsTo, elementTo) => {
          moved = true
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
  return { moved, elements }
}

const fromIsParentOfTo = (from: PathItem[], to: PathItem[]): boolean => {
  if (to.length > 1 && to[to.length - 1].type !== 'collection') {
    return false
  }
  const lastFrom = from[from.length - 1]
  for (let i = to.length - 1; i >= 0; i--) {
    if (to[i].id === lastFrom.id) {
      return true
    }
  }
  return false
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
