import React, { useContext, useEffect, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { AppContext } from '../../context/AppContext'
import RequestPanel from '../request/RequestPanel'
import NewTab from '../tabs/newTab/NewTab'
import TabTitle from '../tabs/tabTitle/TabTitle'
import { ACTIONS } from '../../../../lib/ipcChannels'

export default function ContentTabs() {
  const { tabs } = useContext(AppContext)

  const [hasTabs, setHasTabs] = useState(false)
  const [tabList, setTabList] = useState<RequestTab[]>([])
  const [selectedTabIndex, setSelectedTabIndex] = useState(-1)

  useEffect(() => {
    if (!tabs) return
    setHasTabs(tabs.tabs.length > 0)
    setTabList(tabs.tabs)
    setSelectedTabIndex(tabs.getSelectedTabIndex())

    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.closeTab, () => {
      const tab = tabs.tabs[tabs.getSelectedTabIndex()]
      if (tab) {
        tabs.removeTab(tab.id)
      }
    })

    ipcRenderer?.on(ACTIONS.nextTab, () => {
      const nextTabIndex = (tabs.getSelectedTabIndex() + 1) % tabs.tabs.length
      tabs.setActiveTab(nextTabIndex)
    })

    ipcRenderer?.on(ACTIONS.prevTab, () => {
      const prevTabIndex = (tabs.getSelectedTabIndex() - 1 + tabs.tabs.length) % tabs.tabs.length
      tabs.setActiveTab(prevTabIndex)
    })

    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.closeTab)
      ipcRenderer?.removeAllListeners(ACTIONS.nextTab)
      ipcRenderer?.removeAllListeners(ACTIONS.prevTab)
    }
  }, [tabs])

  const onSelect = (index: number, _: number, __: Event) => {
    tabs?.setActiveTab(index)
    return true
  }
  const onWheel = (e: React.WheelEvent) => {
    const el = e.currentTarget
    const scrollLeft = el.scrollLeft
    el.scrollTo({
      left: scrollLeft + e.deltaY * 0.4,
      behavior: 'instant'
    })
  }

  return (
    <>
      {hasTabs && (
        <div className="panel-tabs">
          <Tabs onSelect={onSelect} selectedIndex={selectedTabIndex}>
            <div className="panel-tabs-header">
              <div className="panel-tabs-header-list" onWheel={onWheel}>
                <TabList>
                  {tabList.map((tab) => (
                    <Tab key={tab.id} className="request-tab">
                      <TabTitle tab={tab} />
                    </Tab>
                  ))}
                </TabList>
              </div>
              <NewTab />
            </div>
            <div className="panel-tabs-content">
              {tabList.map((tab) => (
                <TabPanel key={tab.id} forceRender={true}>
                  <RequestPanel tab={tab} />
                </TabPanel>
              ))}
            </div>
          </Tabs>
        </div>
      )}
      {!hasTabs && (
        <div className="panel-empty-tabs">
          <NewTab showLabel={true} />
        </div>
      )}
    </>
  )
}
