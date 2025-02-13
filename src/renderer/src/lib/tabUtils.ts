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
  const lastPath = getLastPath(from)
  if (!lastPath || !tabs.some((tab) => tab.collectionId === collectionId)) {
    return { updated, tabs }
  }
  const newTabs = tabs.map((tab: RequestTab) => {
    if (!tab.collectionId || tab.type !== 'collection') {
      return tab
    }
    if (lastPath.type === 'folder') {
      const path = tab.path || []
      if (!path.length) {
        return tab
      }
      if (path.some((p) => p.id === lastPath.id && p.type === lastPath.type)) {
        updated = true
        const requestPath = getLastPath(path)
        const newPath = [...to, lastPath, requestPath]
        return { ...tab, path: newPath } as RequestTab
      }
      return tab
    }

    const requestId = lastPath.id
    if (tab.id !== requestId) {
      return tab
    }
    updated = true
    const newPath = [...to, { id: requestId, type: 'request' }]
    return { ...tab, path: newPath } as RequestTab
  })
  return { updated, tabs: newTabs }
}

const getLastPath = (path: PathItem[]): PathItem | undefined => {
  if (path.length) {
    return path.at(-1)
  }
  return undefined
}
