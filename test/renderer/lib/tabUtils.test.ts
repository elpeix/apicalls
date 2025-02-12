import { describe, expect, it } from 'vitest'
import { updateTabPaths } from '../../../src/renderer/src/lib/tabUtils'
import { createMethod } from '../../../src/renderer/src/lib/factory'

describe('Update tab paths test', () => {
  it('should do nothing whe tabs are empty', () => {
    const result = updateTabPaths({
      collectionId: 1,
      from: [],
      to: [],
      tabs: []
    })
    expect(result.updated).toBeFalsy()
    expect(result.tabs).toEqual([])
  })

  it('should do nothing when from or to are empty', () => {
    const tabs = [getTab(1), getTab(2)]
    const toIsEmpty = {
      collectionId: 1,
      to: [],
      from: [{ id: 1, type: 'collection' } as PathItem],
      tabs
    }
    const resultToIsEmpty = updateTabPaths(toIsEmpty)
    expect(resultToIsEmpty.updated).toBeFalsy()
    expect(resultToIsEmpty.tabs).toEqual(tabs)

    const fromIsEmpty = {
      collectionId: 1,
      to: [{ id: 1, type: 'collection' } as PathItem],
      from: [],
      tabs
    }
    const resultFromIsEmpty = updateTabPaths(fromIsEmpty)
    expect(resultFromIsEmpty.updated).toBeFalsy()
    expect(resultFromIsEmpty.tabs).toEqual(tabs)
  })

  it('should do nothing when tabs does not belong to any collection', () => {
    const collectionId: Identifier = 'c1'
    const tabs: RequestTab[] = [getTab(1), getTab(2)]
    const from: PathItem[] = [
      { id: 1, type: 'folder' },
      { id: 2, type: 'collection' }
    ]
    const to: PathItem[] = [{ id: 3, type: 'folder' }]
    const result = updateTabPaths({ collectionId, from, to, tabs })
    expect(result.updated).toBeFalsy()
    expect(result.tabs).toEqual(tabs)
  })

  it('should do nothing when moved items are from other collection', () => {
    const collectionId: Identifier = 'c1'
    const otherCollectionId: Identifier = 'c2'
    const tabs: RequestTab[] = [getTab(1, otherCollectionId), getTab(2, otherCollectionId)]
    const from: PathItem[] = [
      { id: 3, type: 'folder' },
      { id: 1, type: 'collection' }
    ]
    const to: PathItem[] = [{ id: 3, type: 'folder' }]
    const result = updateTabPaths({ collectionId, from, to, tabs })
    expect(result.updated).toBeFalsy()
    expect(result.tabs).toEqual(tabs)
  })

  it('should do nothing when there are no tabs moved', () => {
    const collectionId: Identifier = 'c1'
    const tabs: RequestTab[] = [getTab(1, collectionId), getTab(2, collectionId)]
    const from: PathItem[] = [
      { id: 4, type: 'folder' },
      { id: 5, type: 'collection' }
    ]
    const to: PathItem[] = [{ id: 6, type: 'folder' }]
    const result = updateTabPaths({ collectionId, from, to, tabs })
    expect(result.updated).toBeFalsy()
    expect(result.tabs).toEqual(tabs)
  })

  it('should update path in tabs after move request', () => {
    const collectionId: Identifier = 'c1'
    const tabId: Identifier = 1
    const from: PathItem[] = [
      { id: 4, type: 'folder' },
      { id: tabId, type: 'collection' }
    ]
    const to: PathItem[] = [{ id: 5, type: 'folder' }]
    const tabs: RequestTab[] = [getTab(tabId, collectionId, from)]
    const result = updateTabPaths({ collectionId, from, to, tabs })
    expect(result.updated).toBeTruthy()
    const tab = result.tabs.at(0)
    expect(tab?.path).toEqual([...to, { id: tabId, type: 'request' }])
  })

  it('should update path in tabs after move folder', () => {
    const collectionId: Identifier = 'c1'
    const tabId: Identifier = 1
    const folderId: Identifier = 2
    const from: PathItem[] = [
      { id: 3, type: 'folder' },
      { id: folderId, type: 'folder' }
    ]
    const to: PathItem[] = [{ id: 4, type: 'folder' }]
    const tabs: RequestTab[] = [getTab(tabId, collectionId, from)]

    const result = updateTabPaths({ collectionId, from, to, tabs })
    expect(result.updated).toBeTruthy()
    const tab = result.tabs.at(0)
    expect(tab?.path).toEqual([
      ...to,
      { id: folderId, type: 'folder' },
      { id: tabId, type: 'request' }
    ])
  })
})

const getTab = (
  tabId: Identifier,
  collectionId: Identifier = 0,
  path: PathItem[] | null = null
): RequestTab => {
  const tab: RequestTab = {
    id: tabId,
    name: `Name ${tabId}`,
    path: path !== null ? [...path, { id: tabId, type: 'request' }] : [],
    type: 'collection',
    active: false,
    request: {
      method: createMethod('GET'),
      url: '/the/url'
    }
  }
  if (collectionId !== 0) {
    tab.collectionId = collectionId
  }
  return tab
}
