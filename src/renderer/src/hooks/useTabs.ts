import { useState } from 'react'
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

  const initTabs = (tabList: RequestTab[]) => {
    setTabs(tabList)
    const activeTabIndex = tabList.findIndex((t) => t.active)
    if (activeTabIndex > -1) {
      _setActiveTab(tabList, activeTabIndex)
    } else {
      ipcRenderer?.send(ACTIONS.setTitle, '')
    }
  }

  const openTab = ({ request, collectionId, path = [], shiftKey = false }: OpenTabArguments) => {
    const tab = getTab(request.id)
    if (tab && !shiftKey) {
      setActiveTab(tabs.indexOf(tab))
    } else {
      if (shiftKey) {
        request.id = request.id + new Date().getTime().toString()
      }
      newTab(request, collectionId, path)
    }
  }

  const newTab = (itemRequest?: RequestType, collectionId?: Identifier, path?: PathItem[]) => {
    itemRequest = itemRequest || createRequest({ name: 'Draft' })
    const isDraft = itemRequest.name === 'Draft'
    const tab: RequestTab = { ...itemRequest, active: true, collectionId, path, saved: !isDraft }
    addTab(tab)
  }

  const addTab = (tab: RequestTab, index = -1) => {
    const newTabs = [...tabs]
    if (index === -1) {
      newTabs.push(tab)
      index = tabs.length
    } else {
      newTabs.splice(index, 0, tab)
    }
    _setActiveTab(newTabs, index)
    updateTabs(newTabs)
  }

  const duplicateTab = (tabId: Identifier) => {
    const tab = getTab(tabId)
    if (!tab) return
    const id = (tab.id + new Date().getTime().toString()) as Identifier
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
  }

  const removeTab = (tabId: Identifier) => {
    const index = tabs.findIndex((t) => t.id === tabId)
    if (index === -1) return
    addCloseTab(tabs[index], index)
    if (tabs[index].active) {
      if (index === 0) {
        _setActiveTab(tabs, 1)
      } else {
        _setActiveTab(tabs, index - 1)
      }
    }
    updateTabs(tabs.filter((tab) => tab.id !== tabId))
  }

  const closeOtherTabs = (tabId: Identifier) => {
    const index = tabs.findIndex((t) => t.id === tabId)
    const newTabs = [tabs[index]]
    _setActiveTab(newTabs, 0)
    addClosedTabs(tabs.filter((t) => t.id !== tabId))
    updateTabs(newTabs)
  }

  const closeAllTabs = () => {
    addClosedTabs(tabs)
    updateTabs([])
  }

  const addCloseTab = (tab: RequestTab, index: number) => {
    setClosedTabs((prev) => {
      if (prev.length >= MAX_CLOSED_TABS) {
        prev.pop()
      }
      const closedTab: ClosedTab = { ...tab, index }
      return [closedTab, ...prev]
    })
  }

  const addClosedTabs = (tabs: RequestTab[]) => {
    const closedTabs = tabs.map((t, i) => ({ ...t, index: i }) as ClosedTab).reverse()
    setClosedTabs((prev) => {
      const newClosedTabs = [...closedTabs, ...prev]
      const result = newClosedTabs.slice(0, MAX_CLOSED_TABS)
      return result
    })
  }

  const restoreTab = () => {
    if (closedTabs.length > 0) {
      const [tab, ...rest] = closedTabs
      setClosedTabs(rest)
      const index = tab.index
      const newTabs = [...tabs]
      newTabs.splice(index, 0, tab)
      _setActiveTab(newTabs, index)
      updateTabs(newTabs)
    }
  }

  const updateTab = (tabId: Identifier, tab: RequestTab) => {
    updateTabs(tabs.map((t) => (t.id === tabId ? tab : t)))
  }

  const updateTabRequest = (tabId: Identifier, saved: boolean, request: RequestBase) => {
    const newTabs = tabs.map((tab: RequestTab) =>
      tab.id === tabId ? { ...tab, request, saved } : tab
    )
    updateTabs(newTabs)
  }
  const hasTabs = () => tabs.length > 0
  const getTab = (tabId: Identifier) => tabs.find((t) => t.id === tabId)
  const getTabs = () => tabs
  const setActiveTab = (index: number) => updateTabs(_setActiveTab(tabs, index))

  const _setActiveTab = (_tabs: RequestTab[], index: number) => {
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
  }

  const highlightCollectionRequest = (tab: RequestTab) => {
    if (!tab || !tab.collectionId || !tab.path) {
      return
    }
    const collection = collections.get(tab.collectionId)
    setActiveRequest({
      collectionId: tab.collectionId,
      path: tab.path,
      id: tab.id
    })
    if (collection) {
      toggleCollectionElements(collection.elements, true, tab.path)
      collections.update(collection)
    }
  }

  const getSelectedTabIndex = () => {
    let index = tabs.findIndex((t) => t.active)
    if (index === -1) {
      index = 2
    }
    return index
  }

  const updateTabs = (newTabs: RequestTab[]) => {
    setTabs(newTabs)
    ipcRenderer?.send(TABS.update, newTabs)
  }

  const renameTab = (tabId: Identifier, name: string) => {
    const tab = getTab(tabId)
    if (!tab) return
    updateTab(tabId, { ...tab, name })
  }

  const moveTab = (tabId: Identifier, toBeforeTabId: Identifier) => {
    const newTabs = [...tabs]
    const fromIndex = newTabs.findIndex((t) => t.id == tabId)
    const toIndex = newTabs.findIndex((t) => t.id == toBeforeTabId)
    const [removed] = newTabs.splice(fromIndex, 1)
    newTabs.splice(toIndex, 0, removed)
    updateTabs(newTabs)
  }

  const updatePaths = (collectionId: Identifier, from: PathItem[], to: PathItem[]) => {
    const updatedTabs = updateTabPaths({
      collectionId,
      from,
      to,
      tabs
    })
    if (updatedTabs.updated) {
      updateTabs(updatedTabs.tabs)
    }
  }

  const getActiveRequest = () => activeRequest

  return {
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
    closeAllTabs
  }
}
