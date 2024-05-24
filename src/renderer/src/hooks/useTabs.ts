import { useState } from 'react'
import { createRequest } from '../lib/factory'
import { TABS } from '../../../lib/ipcChannels'

export default function useTabs(initialTabs: RequestTab[]): TabsHookType {
  const ipcRenderer = window.electron.ipcRenderer
  const [tabs, setTabs] = useState([...initialTabs])

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
    if (tabs[index].active) {
      if (index === 0) {
        _setActiveTab(tabs, 1)
      } else {
        _setActiveTab(tabs, index - 1)
      }
    }
    updateTabs(tabs.filter((tab) => tab.id !== tabId))
  }

  const updateTab = (tabId: Identifier, tab: RequestTab) => {
    updateTabs(tabs.map((t) => (t.id === tabId ? tab : t)))
  }
  const updateTabRequest = (tabId: Identifier, request: RequestBase) => {
    updateTabs(tabs.map((tab: RequestTab) => (tab.id === tabId ? { ...tab, request } : tab)))
  }
  const hasTabs = () => tabs.length > 0
  const getTab = (tabId: Identifier) => tabs.find((t) => t.id === tabId)
  const getTabs = () => tabs
  const setActiveTab = (index: number) => updateTabs(_setActiveTab(tabs, index))

  const _setActiveTab = (_tabs: RequestTab[], index: number) => {
    return _tabs.map((tab: RequestTab, i: number) => {
      tab.active = i === index
      return tab
    })
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
    ipcRenderer.send(TABS.update, newTabs)
  }

  const renameTab = (tabId: Identifier, name: string) => {
    const tab = getTab(tabId)
    if (!tab) return
    updateTab(tabId, { ...tab, name })
  }

  const setSaved = (tabId: Identifier, saved: boolean) => {
    const tab = getTab(tabId)
    if (!tab) return
    updateTab(tabId, { ...tab, saved })
  }

  return {
    openTab,
    newTab,
    addTab,
    removeTab,
    updateTab,
    updateTabRequest,
    hasTabs,
    getTab,
    getTabs,
    setActiveTab,
    getSelectedTabIndex,
    setTabs,
    renameTab,
    tabs,
    setSaved
  }
}
