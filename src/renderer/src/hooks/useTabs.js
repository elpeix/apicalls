import { useState } from 'react'

export default function useTabs(initialTabs) {

  const [tabs, setTabs] = useState([...initialTabs])

  const newTab = (itemRequest) => {
    const tabId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    itemRequest = itemRequest || {
      type: 'draft',
      id: tabId,
      active: false,
      request: {}
    }
    console.log('newTab', itemRequest)
    addTab(itemRequest)
  }

  const addTab = (tab) => {
    const newTabs = [...tabs, tab]
    _setActiveTab(newTabs, tabs.length)
    setTabs(newTabs)
  }

  const removeTab = (tabId) => {
    const index = _getTabIndex(tabId)
    if (index === -1) return

    const newTabs = [...tabs]
    if (newTabs[index].active) {
      if (index === 0) {
        _setActiveTab(newTabs, 1)
      } else {
        _setActiveTab(newTabs, index - 1)
      }
    }
    setTabs(newTabs.filter(tab => tab.id !== tabId))
  }

  const updateTab = (tabId, tab) => {
    setTabs(tabs.map(t => t.id === tabId ? tab : t))
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

  const _getTabIndex = (tabId) => tabs.findIndex(t => t.id === tabId)

  const getSelectedTabIndex = () => {
    let index = tabs.findIndex(t => t.active)
    if (index === -1) {
      index = 2
    }
    return index
  }

  return {
    newTab,
    addTab,
    removeTab,
    updateTab,
    getTab,
    getTabs,
    setActiveTab,
    getSelectedTabIndex
  }

}