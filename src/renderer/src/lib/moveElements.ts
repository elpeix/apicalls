export const moveElements = (
  args: MoveAction & {
    elements: (CollectionFolder | RequestType)[]
  }
): {
  moved: boolean
  elements?: (CollectionFolder | RequestType)[]
} => {
  const {
    elements,
    from,
    to,
    after
  }: MoveAction & {
    elements: (CollectionFolder | RequestType)[]
  } = JSON.parse(JSON.stringify(args)) // clone

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
    if (to.length === 0 && elementFrom.id === after) {
      return
    }
    const indexFrom = elementsFrom.indexOf(elementFrom)
    if (to.length === 0) {
      moved = true
      elementsFrom.splice(indexFrom, 1)
      elements.splice(getAfterIndex(elements, after), 0, elementFrom)
      return
    }
    findElement(
      elements,
      to,
      (elementsTo, elementTo) => {
        if (elementFrom.id === after) {
          return
        }
        moved = true
        elementsFrom.splice(indexFrom, 1)
        if (elementTo.type === 'folder') {
          const indexTo = getAfterIndex(elementTo.elements, after)
          elementTo.elements.splice(indexTo, 0, elementFrom)
        } else {
          console.warn('[to] must be a folder')
          const indexTo = getAfterIndex(elementsTo, after)
          elementsTo.splice(indexTo, 0, elementFrom)
        }
      },
      () => {
        console.warn('To not found')
        elementsFrom.splice(indexFrom, 0, elementFrom)
      }
    )
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

const getAfterIndex = (
  elements: (CollectionFolder | RequestType)[],
  after?: Identifier
): number => {
  if (after) {
    return elements.findIndex((e) => e.id === after) + 1
  }
  return 0
}
