import { useState } from 'react'

export default function useTabs(initialTabs) {

  const [tabs, setTabs] = useState([...initialTabs])

  const openTab = itemRequest => {
    const tab = getTab(itemRequest.id)
    if (tab) {
      setActiveTab(tabs.indexOf(tab))
    } else {
      newTab(itemRequest)
    }
  }

  const newTab = itemRequest => {
    const tabId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    itemRequest = itemRequest || {
      type: 'draft',
      id: tabId,
      active: false,
      request: {}
    }
    addTab(itemRequest)
  }

  const addTab = tab => {
    const newTabs = [...tabs, tab]
    _setActiveTab(newTabs, tabs.length)
    setTabs(newTabs)
  }

  const removeTab = tabId => {
    console.log('removeTab', tabId)
    const index = tabs.findIndex(t => t.id === tabId)
    if (index === -1) return
    if (tabs[index].active) {
      if (index === 0) {
        _setActiveTab(tabs, 1)
      } else {
        _setActiveTab(tabs, index - 1)
      }
    }
    setTabs(tabs.filter(tab => tab.id !== tabId))
  }

  const updateTab = (tabId, tab) => {
    setTabs(tabs.map(t => t.id === tabId ? tab : t))
  }
  const updateTabRequest = (tabId, request) => {
    setTabs(tabs.map(t => t.id === tabId ? { ...t, request } : t))
  }

  const getTab = tabId => tabs.find(t => t.id === tabId)
  const getTabs = () => tabs
  const setActiveTab = index => setTabs(_setActiveTab(tabs, index))

  const _setActiveTab = (_tabs, index) => {
    return _tabs.map((tab, i) => {
      tab.active = i === index
      return tab
    })
  }

  const getSelectedTabIndex = () => {
    let index = tabs.findIndex(t => t.active)
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