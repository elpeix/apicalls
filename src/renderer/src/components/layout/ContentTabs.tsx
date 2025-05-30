import React, { useContext, useEffect, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { AppContext } from '../../context/AppContext'
import RequestPanel from '../request/RequestPanel'
import NewTab from '../tabs/newTab/NewTab'
import TabTitle from '../tabs/tabTitle/TabTitle'
import { ACTIONS } from '../../../../lib/ipcChannels'
import SearchTabs from '../tabs/SearchTabs/SearchTabs'
import HorizontalScroll from '../base/HorizontalScroll/HorizontalScroll'
import WindowIcons from '../base/WindowIcons/WindowIcons'

export default function ContentTabs() {
  const { tabs, application, appSettings } = useContext(AppContext)

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
        application.tabActions.closeTab(tab)
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

    ipcRenderer?.on(ACTIONS.restoreTab, () => {
      tabs.restoreTab()
    })

    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.closeTab)
      ipcRenderer?.removeAllListeners(ACTIONS.nextTab)
      ipcRenderer?.removeAllListeners(ACTIONS.prevTab)
      ipcRenderer?.removeAllListeners(ACTIONS.restoreTab)
    }
  }, [tabs])

  const onSelect = (index: number, _: number, __: Event) => {
    setSelectedTabIndex(index)
  }

  const handleMouseDown = (index: number) => {
    tabs?.setActiveTab(index)
    setSelectedTabIndex(index)
  }

  return (
    <>
      {hasTabs && (
        <div className="panel-tabs">
          <Tabs
            onSelect={onSelect}
            selectedIndex={selectedTabIndex}
            forceRenderTabPanel={true}
            disableUpDownKeys
            disableLeftRightKeys
          >
            <div className="panel-tabs-header">
              <HorizontalScroll className="panel-tabs-header-list">
                <TabList>
                  {tabList.map((tab, index) => (
                    <Tab
                      key={tab.id}
                      className="request-tab"
                      onMouseDown={() => handleMouseDown(index)}
                    >
                      <TabTitle tab={tab} />
                    </Tab>
                  ))}
                </TabList>
              </HorizontalScroll>
              <NewTab />
              <div className="panel-tabs-header-spacer" />
              <SearchTabs />
              {appSettings?.isCustomWindowMode() && <WindowIcons />}
            </div>
            <div className="panel-tabs-content">
              {tabList.map((tab) => (
                <TabPanel key={tab.id}>
                  <RequestPanel tab={tab} />
                </TabPanel>
              ))}
            </div>
          </Tabs>
        </div>
      )}
      {!hasTabs && (
        <>
          {appSettings?.isCustomWindowMode() && (
            <div className="window-bar">
              <WindowIcons />
            </div>
          )}
          <div className="panel-empty-tabs">
            <NewTab showLabel={true} />
          </div>
        </>
      )}
    </>
  )
}
