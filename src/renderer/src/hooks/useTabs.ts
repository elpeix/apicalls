import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRequest } from '../lib/factory'
import { ACTIONS, TABS } from '../../../lib/ipcChannels'
import { toggleCollectionElements } from '../lib/collectionFilter'
import { updateTabPaths } from '../lib/tabUtils'

const MAX_CLOSED_TABS = 10

export default function useTabs(
  initialTabs: RequestTab[],
  collections: CollectionsHookType
): TabsHookType {
  const ipcRenderer = window.electron?.ipcRenderer
  const [tabs, setTabs] = useState([...initialTabs])
  const [closedTabs, setClosedTabs] = useState<ClosedTab[]>([])
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null)
  const collectionsRef = useRef(collections)

  useEffect(() => {
    collectionsRef.current = collections
  }, [collections])

  const getTab = useCallback((tabId: Identifier) => tabs.find((t) => t.id === tabId), [tabs])
  const getTabs = useCallback(() => tabs, [tabs])
  const hasTabs = useCallback(() => tabs.length > 0, [tabs])

  const updateTabsTimeout = useRef<NodeJS.Timeout | null>(null)

  const updateTabsImmediate = useCallback(
    (newTabs: RequestTab[]) => {
      if (updateTabsTimeout.current) {
        clearTimeout(updateTabsTimeout.current)
      }
      updateTabsTimeout.current = null
      setTabs(newTabs)
      ipcRenderer?.send(TABS.update, newTabs)
    },
    [ipcRenderer]
  )

  const updateTabs = useCallback(
    (newTabs: RequestTab[]) => {
      if (updateTabsTimeout.current) {
        clearTimeout(updateTabsTimeout.current)
      }
      updateTabsTimeout.current = setTimeout(() => {
        updateTabsImmediate(newTabs)
      }, 200)
    },
    [updateTabsImmediate]
  )

  const updateTab = useCallback(
    (tabId: Identifier, tab: RequestTab) => {
      updateTabsImmediate(tabs.map((t) => (t.id === tabId ? tab : t)))
    },
    [tabs, updateTabsImmediate]
  )

  const highlightCollectionRequest = useCallback((tab: RequestTab) => {
    if (!tab || !tab.collectionId || !tab.path) {
      return
    }
    const collection = collectionsRef.current?.get(tab.collectionId)
    setActiveRequest({
      collectionId: tab.collectionId,
      path: tab.path,
      id: tab.id
    })
    if (collection) {
      toggleCollectionElements(collection.elements, true, tab.path)
      collectionsRef.current?.update(collection)
    }
  }, [])

  const _setActiveTab = useCallback(
    (_tabs: RequestTab[], index: number) => {
      const newTabs = _tabs.map((tab: RequestTab, i: number) => {
        tab.active = i === index
        return tab
      })
      const activeTab = newTabs.find((t) => t.active)
      if (activeTab && activeTab.collectionId && activeTab.path) {
        highlightCollectionRequest(activeTab)
      } else {
        setActiveRequest(null)
      }
      let title = ''
      if (activeTab) {
        const method = activeTab.request.method.label || 'GET'
        const name = activeTab.name
        title = `${method} - ${name}`
      }
      ipcRenderer?.send(ACTIONS.setTitle, title)
      return newTabs
    },
    [ipcRenderer, highlightCollectionRequest]
  )

  const setActiveTab = useCallback(
    (index: number) => {
      if (index < 0 || index >= tabs.length) {
        return
      }
      if (tabs[index].active) {
        return
      }
      updateTabsImmediate(_setActiveTab(tabs, index))
    },
    [tabs, _setActiveTab, updateTabsImmediate]
  )

  const addTab = useCallback(
    (tab: RequestTab, index = -1) => {
      const newTabs = [...tabs]
      if (index === -1) {
        newTabs.push(tab)
        index = tabs.length
      } else {
        newTabs.splice(index, 0, tab)
      }
      _setActiveTab(newTabs, index)
      updateTabsImmediate(newTabs)
    },
    [tabs, _setActiveTab, updateTabsImmediate]
  )

  const newTab = useCallback(
    (itemRequest?: RequestType, collectionId?: Identifier, path?: PathItem[]) => {
      itemRequest = itemRequest || createRequest({ name: 'Draft' })
      const isDraft = itemRequest.type === 'draft'
      const tab: RequestTab = {
        ...itemRequest,
        active: true,
        collectionId,
        path,
        saved: !isDraft
      }
      addTab(tab)
    },
    [addTab]
  )

  const openTab = useCallback(
    ({ request, collectionId, path = [], shiftKey = false }: OpenTabArguments) => {
      const tab = getTab(request.id)
      if (tab && !shiftKey) {
        setActiveTab(tabs.indexOf(tab))
      } else {
        if (shiftKey) {
          request.id = crypto.randomUUID()
        }
        newTab(request, collectionId, path)
      }
    },
    [getTab, tabs, setActiveTab, newTab]
  )

  const initTabs = useCallback(
    (tabList: RequestTab[]) => {
      setTabs(tabList)
      const activeTabIndex = tabList.findIndex((t) => t.active)
      if (activeTabIndex > -1) {
        _setActiveTab(tabList, activeTabIndex)
      } else {
        ipcRenderer?.send(ACTIONS.setTitle, '')
      }
    },
    [ipcRenderer, _setActiveTab]
  )

  const duplicateTab = useCallback(
    (tabId: Identifier) => {
      const tab = getTab(tabId)
      if (!tab) return
      const id = crypto.randomUUID()
      const pathItem = {
        id,
        type: 'request'
      } as PathItem
      let path: PathItem[] = []
      if (tab.path && tab.path.length > 0) {
        path = tab.path.slice(0, tab.path.length - 1)
      }
      const tabIndex = tabs.findIndex((t) => t.id === tabId)

      path.push(pathItem)
      const newTab = {
        ...tab,
        saved: false,
        path,
        id,
        name: tab.name + ' copy'
      }
      addTab(newTab, tabIndex + 1)
    },
    [getTab, tabs, addTab]
  )

  const addCloseTab = useCallback((tab: RequestTab, index: number) => {
    setClosedTabs((prev) => {
      if (prev.length >= MAX_CLOSED_TABS) {
        prev.pop()
      }
      const closedTab: ClosedTab = { ...tab, index }
      return [closedTab, ...prev]
    })
  }, [])

  const addClosedTabs = useCallback((tabs: RequestTab[]) => {
    const closedTabs = tabs.map((t, i) => ({ ...t, index: i }) as ClosedTab).reverse()
    setClosedTabs((prev) => {
      const newClosedTabs = [...closedTabs, ...prev]
      const result = newClosedTabs.slice(0, MAX_CLOSED_TABS)
      return result
    })
  }, [])

  const removeTab = useCallback(
    (tabId: Identifier, force?: boolean) => {
      const index = tabs.findIndex((t) => t.id === tabId)
      if (index === -1) return
      if (!force && !tabs[index].saved) {
        return
      }
      addCloseTab(tabs[index], index)
      if (tabs[index].active) {
        if (index === 0) {
          _setActiveTab(tabs, 1)
        } else {
          _setActiveTab(tabs, index - 1)
        }
      }
      updateTabsImmediate(tabs.filter((tab) => tab.id !== tabId))
    },
    [tabs, addCloseTab, _setActiveTab, updateTabsImmediate]
  )

  const closeOtherTabs = useCallback(
    (tabId: Identifier, force?: boolean) => {
      const tabsToClose = tabs.filter((t) => t.id !== tabId)
      if (!force) {
        if (tabsToClose.some((tab) => !tab.saved)) {
          return
        }
      }
      const index = tabs.findIndex((t) => t.id === tabId)
      const newTabs = [tabs[index]]
      _setActiveTab(newTabs, 0)
      addClosedTabs(tabsToClose)
      updateTabsImmediate(newTabs)
    },
    [tabs, addClosedTabs, _setActiveTab, updateTabsImmediate]
  )

  const closeAllTabs = useCallback(
    (force?: boolean) => {
      if (!force) {
        if (tabs.some((tab) => !tab.saved)) {
          return
        }
      }
      addClosedTabs(tabs)
      updateTabsImmediate([])
    },
    [tabs, addClosedTabs, updateTabsImmediate]
  )

  const restoreTab = useCallback(() => {
    if (closedTabs.length > 0) {
      const [tab, ...rest] = closedTabs
      setClosedTabs(rest)
      const index = tab.index
      const newTabs = [...tabs]
      newTabs.splice(index, 0, tab)
      _setActiveTab(newTabs, index)
      updateTabsImmediate(newTabs)
    }
  }, [closedTabs, tabs, _setActiveTab, updateTabsImmediate])

  const updateTabRequest = useCallback(
    (tabId: Identifier, saved: boolean, request: RequestBase) => {
      const newTabs = tabs.map((tab: RequestTab) =>
        tab.id === tabId ? { ...tab, request, saved } : tab
      )
      updateTabs(newTabs)
    },
    [tabs, updateTabs]
  )

  const renameTab = useCallback(
    (tabId: Identifier, name: string) => {
      const tab = getTab(tabId)
      if (!tab) return
      updateTab(tabId, { ...tab, name })
    },
    [getTab, updateTab]
  )

  const moveTab = useCallback(
    (tabId: Identifier, toBeforeTabId: Identifier) => {
      const newTabs = [...tabs]
      const fromIndex = newTabs.findIndex((t) => t.id == tabId)
      const toIndex = newTabs.findIndex((t) => t.id == toBeforeTabId)
      const [removed] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, removed)
      updateTabsImmediate(newTabs)
    },
    [tabs, updateTabsImmediate]
  )

  const updatePaths = useCallback(
    (collectionId: Identifier, from: PathItem[], to: PathItem[]) => {
      const updatedTabs = updateTabPaths({
        collectionId,
        from,
        to,
        tabs
      })
      if (updatedTabs.updated) {
        updateTabsImmediate(updatedTabs.tabs)
      }
    },
    [tabs, updateTabsImmediate]
  )

  const saveTab = useCallback(
    (tabId: Identifier) => {
      const tab = getTab(tabId)
      if (!tab) {
        console.error(`Tab [${tabId}] not found`)
        return
      }
      if (!tab.path && !Array.isArray(tab.path)) {
        console.error(`Tab [${tabId}] does not have path`)
      }
      if (!tab.collectionId) {
        console.warn(`Tab [${tabId}] does not belong to any collection`)
        return
      }
      const path = tab.path as PathItem[]
      const collectionId = tab.collectionId as Identifier
      tab.saved = true
      collectionsRef.current?.saveRequest({ path, collectionId, request: tab })
      updateTab(tabId, tab)
    },
    [getTab, updateTab]
  )

  const getActiveRequest = useCallback(() => activeRequest, [activeRequest])
  const getSelectedTabIndex = useCallback(() => {
    let index = tabs.findIndex((t) => t.active)
    if (index === -1) {
      index = 2
    }
    return index
  }, [tabs])

  return useMemo(
    () => ({
      openTab,
      newTab,
      addTab,
      duplicateTab,
      removeTab,
      updateTab,
      updateTabRequest,
      restoreTab,
      hasTabs,
      getTab,
      getTabs,
      setActiveTab,
      getSelectedTabIndex,
      highlightCollectionRequest,
      initTabs,
      renameTab,
      moveTab,
      tabs,
      updatePaths,
      getActiveRequest,
      closeOtherTabs,
      closeAllTabs,
      saveTab
    }),
    [
      openTab,
      newTab,
      addTab,
      duplicateTab,
      removeTab,
      updateTab,
      updateTabRequest,
      restoreTab,
      hasTabs,
      getTab,
      getTabs,
      setActiveTab,
      getSelectedTabIndex,
      highlightCollectionRequest,
      initTabs,
      renameTab,
      moveTab,
      tabs,
      updatePaths,
      getActiveRequest,
      closeOtherTabs,
      closeAllTabs,
      saveTab
    ]
  )
}
