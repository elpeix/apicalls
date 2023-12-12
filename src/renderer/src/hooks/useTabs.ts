import { useState } from 'react'

export default function useTabs(initialTabs: Tab[]): TabsHook {
  const [tabs, setTabs] = useState([...initialTabs])

  const openTab = (itemRequest: RequestType) => {
    const tab = getTab(itemRequest.id)
    if (tab) {
      setActiveTab(tabs.indexOf(tab))
    } else {
      newTab(itemRequest)
    }
  }

  const newTab = (itemRequest?: RequestType) => {
    const tabId: Identifier = String(
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    )
    console.log('newTab', itemRequest)

    if (!itemRequest) {
      itemRequest = {
        type: 'draft',
        id: tabId,
        request: {
          url: '',
          method: {
            label: 'GET',
            value: 'GET',
            body: false
          },
          headers: [],
          params: []
        }
      }
    }

    console.log('newTab', itemRequest)
    const tab: Tab = { ...itemRequest, active: true }
    addTab(tab)
  }

  const addTab = (tab: Tab) => {
    const newTabs = [...tabs, tab]
    _setActiveTab(newTabs, tabs.length)
    setTabs(newTabs)
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
    setTabs(tabs.filter((tab) => tab.id !== tabId))
  }

  const updateTab = (tabId: Identifier, tab: Tab) => {
    setTabs(tabs.map((t) => (t.id === tabId ? tab : t)))
  }
  const updateTabRequest = (tabId: Identifier, request: RequestBase) => {
    setTabs(tabs.map((tab: Tab) => (tab.id === tabId ? { ...tab, request } : tab)))
  }

  const getTab = (tabId: Identifier) => tabs.find((t) => t.id === tabId)
  const getTabs = () => tabs
  const setActiveTab = (index: number) => setTabs(_setActiveTab(tabs, index))

  const _setActiveTab = (_tabs: any, index: number) => {
    return _tabs.map((tab: any, i: number) => {
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

  return {
    openTab,
    newTab,
    addTab,
    removeTab,
    updateTab,
    updateTabRequest,
    getTab,
    getTabs,
    setActiveTab,
    getSelectedTabIndex
  }
}
