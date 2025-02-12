export const updateTabPaths = ({
  collectionId,
  from,
  to,
  tabs
}: {
  collectionId: Identifier
  from: PathItem[]
  to: PathItem[]
  tabs: RequestTab[]
}): { updated: boolean; tabs: RequestTab[] } => {
  let updated = false
  const requestId = getRequestId(from)
  console.log(requestId)
  if (!tabs.some((tab) => tab.collectionId === collectionId)) {
    return { updated, tabs }
  }
  const newTabs = tabs.map((tab: RequestTab) => {
    if (!tab.collectionId || tab.type !== 'collection') {
      return tab
    }
    const path = tab.path || []
    if (requestId) {
      if (tab.id !== requestId) {
        return tab
      }
      updated = true
      const newPath = [...to, { id: requestId, type: 'request' }]
      return { ...tab, path: newPath } as RequestTab
    }
    // Folder is moved
    // TODO
    console.log('folder is moved')
    console.log('path', path)
    console.log('from', from)
    console.log('to', to)

    return tab
  })
  return { updated, tabs: newTabs }
}

const getRequestId = (from: PathItem[]): Identifier | null => {
  if (from.length) {
    const pathItem = from.at(-1)
    if (pathItem && pathItem.type !== 'folder') {
      return pathItem.id
    }
  }
  return null
}
