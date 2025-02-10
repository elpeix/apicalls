import { useState } from 'react'
import { createRequest } from '../lib/factory'
import { TABS } from '../../../lib/ipcChannels'
import { toggleCollectionElements } from '../lib/collectionFilter'

export default function useTabs(
  initialTabs: RequestTab[],
  collections: CollectionsHookType
): TabsHookType {
  const ipcRenderer = window.electron?.ipcRenderer
  const [tabs, setTabs] = useState([...initialTabs])
  const [closedTabs, setClosedTabs] = useState<ClosedTab[]>([])
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null)

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

  const addTab = (tab: RequestTab) => {
    const newTabs = [...tabs, tab]
    _setActiveTab(newTabs, tabs.length)
    updateTabs(newTabs)
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

  const addCloseTab = (tab: RequestTab, index: number) => {
    setClosedTabs((prev) => {
      if (prev.length >= 10) {
        prev.pop()
      }
      const closedTab: ClosedTab = { ...tab, index }
      return [closedTab, ...prev]
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
      const collection = collections.get(activeTab.collectionId)
      const path = activeTab.path
      setActiveRequest({
        collectionId: activeTab.collectionId,
        path,
        id: activeTab.id
      })
      if (collection) {
        toggleCollectionElements(collection.elements, true, path)
        collections.update(collection)
      }
    }
    return newTabs
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

  const getActiveRequest = () => activeRequest

  return {
    openTab,
    newTab,
    addTab,
    removeTab,
    updateTab,
    updateTabRequest,
    restoreTab,
    hasTabs,
    getTab,
    getTabs,
    setActiveTab,
    getSelectedTabIndex,
    setTabs,
    renameTab,
    moveTab,
    tabs,
    getActiveRequest
  }
}
