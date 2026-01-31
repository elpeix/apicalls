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
  const tabsRef = useRef(tabs)
  const closedTabsRef = useRef(closedTabs)
  
  // Sync refs with state
  useEffect(() => {
    collectionsRef.current = collections
  }, [collections])

  useEffect(() => {
    tabsRef.current = tabs
  }, [tabs])

  useEffect(() => {
    closedTabsRef.current = closedTabs
  }, [closedTabs])

  const getTab = useCallback((tabId: Identifier) => tabsRef.current.find((t) => t.id === tabId), [])
  const getTabs = useCallback(() => tabsRef.current, [])
  const hasTabs = useCallback(() => tabsRef.current.length > 0, [])

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
      updateTabsImmediate(tabsRef.current.map((t) => (t.id === tabId ? tab : t)))
    },
    [updateTabsImmediate]
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
      const currentTabs = tabsRef.current
      if (index < 0 || index >= currentTabs.length) {
        return
      }
      if (currentTabs[index].active) {
        return
      }
      updateTabsImmediate(_setActiveTab(currentTabs, index))
    },
    [ _setActiveTab, updateTabsImmediate]
  )

  const addTab = useCallback(
    (tab: RequestTab, index = -1) => {
      const newTabs = [...tabsRef.current]
      if (index === -1) {
        newTabs.push(tab)
        index = newTabs.length - 1 // Fix: was tabs.length which was stale
      } else {
        newTabs.splice(index, 0, tab)
      }
      _setActiveTab(newTabs, index)
      updateTabsImmediate(newTabs)
    },
    [_setActiveTab, updateTabsImmediate]
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
      const tab = tabsRef.current.find((t) => t.id === request.id)
      if (tab && !shiftKey) {
        setActiveTab(tabsRef.current.indexOf(tab))
      } else {
        if (shiftKey) {
          request.id = crypto.randomUUID()
        }
        newTab(request, collectionId, path)
      }
    },
    [setActiveTab, newTab]
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
      const tab = tabsRef.current.find((t) => t.id === tabId)
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
      const tabIndex = tabsRef.current.findIndex((t) => t.id === tabId)

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
    [addTab]
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
      const currentTabs = tabsRef.current
      const index = currentTabs.findIndex((t) => t.id === tabId)
      if (index === -1) return
      if (!force && !currentTabs[index].saved) {
        return
      }
      addCloseTab(currentTabs[index], index)
      if (currentTabs[index].active) {
        if (index === 0) {
          _setActiveTab(currentTabs, 1)
        } else {
          _setActiveTab(currentTabs, index - 1)
        }
      }
      updateTabsImmediate(currentTabs.filter((tab) => tab.id !== tabId))
    },
    [addCloseTab, _setActiveTab, updateTabsImmediate]
  )

  const closeOtherTabs = useCallback(
    (tabId: Identifier, force?: boolean) => {
      const currentTabs = tabsRef.current
      const tabsToClose = currentTabs.filter((t) => t.id !== tabId)
      if (!force) {
        if (tabsToClose.some((tab) => !tab.saved)) {
          return
        }
      }
      const index = currentTabs.findIndex((t) => t.id === tabId)
      const newTabs = [currentTabs[index]]
      _setActiveTab(newTabs, 0)
      addClosedTabs(tabsToClose)
      updateTabsImmediate(newTabs)
    },
    [addClosedTabs, _setActiveTab, updateTabsImmediate]
  )

  const closeAllTabs = useCallback(
    (force?: boolean) => {
      const currentTabs = tabsRef.current
      if (!force) {
        if (currentTabs.some((tab) => !tab.saved)) {
          return
        }
      }
      addClosedTabs(currentTabs)
      updateTabsImmediate([])
    },
    [addClosedTabs, updateTabsImmediate]
  )

  const restoreTab = useCallback(() => {
    if (closedTabsRef.current.length > 0) {
      const [tab, ...rest] = closedTabsRef.current
      setClosedTabs(rest)
      const index = tab.index
      const newTabs = [...tabsRef.current]
      newTabs.splice(index, 0, tab)
      _setActiveTab(newTabs, index)
      updateTabsImmediate(newTabs)
    }
  }, [_setActiveTab, updateTabsImmediate])

  const updateTabRequest = useCallback(
    (tabId: Identifier, saved: boolean, request: RequestBase) => {
      const newTabs = tabsRef.current.map((tab: RequestTab) =>
        tab.id === tabId ? { ...tab, request, saved } : tab
      )
      updateTabs(newTabs)
    },
    [updateTabs]
  )

  const renameTab = useCallback(
    (tabId: Identifier, name: string) => {
      const tab = tabsRef.current.find((t) => t.id === tabId)
      if (!tab) return
      updateTab(tabId, { ...tab, name })
    },
    [updateTab]
  )

  const moveTab = useCallback(
    (tabId: Identifier, toBeforeTabId: Identifier) => {
      const newTabs = [...tabsRef.current]
      const fromIndex = newTabs.findIndex((t) => t.id == tabId)
      const toIndex = newTabs.findIndex((t) => t.id == toBeforeTabId)
      const [removed] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, removed)
      updateTabsImmediate(newTabs)
    },
    [updateTabsImmediate]
  )

  const updatePaths = useCallback(
    (collectionId: Identifier, from: PathItem[], to: PathItem[]) => {
      const updatedTabs = updateTabPaths({
        collectionId,
        from,
        to,
        tabs: tabsRef.current
      })
      if (updatedTabs.updated) {
        updateTabsImmediate(updatedTabs.tabs)
      }
    },
    [updateTabsImmediate]
  )

  const saveTab = useCallback(
    (tabId: Identifier) => {
      const tab = tabsRef.current.find((t) => t.id === tabId)
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
    [updateTab]
  )

  const getActiveRequest = useCallback(() => activeRequest, [activeRequest])
  const getSelectedTabIndex = useCallback(() => {
    let index = tabsRef.current.findIndex((t) => t.active)
    if (index === -1) {
      index = 2
    }
    return index
  }, []) // tabs is no longer a dependency

  const actions = useMemo(() => ({
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
      updatePaths,
      getActiveRequest,
      closeOtherTabs,
      closeAllTabs,
      saveTab
  }), [
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
      updatePaths,
      getActiveRequest,
      closeOtherTabs,
      closeAllTabs,
      saveTab
  ])

  return useMemo(
    () => ({
      ...actions,
       tabs
    }),
    [actions, tabs]
  )
}

