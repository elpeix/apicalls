import React, { useContext, useEffect } from 'react'
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

  const tabList = tabs?.tabs || []
  const hasTabs = tabList.length > 0
  const selectedTabIndex = tabs?.getSelectedTabIndex() ?? -1

  const tabsRef = React.useRef(tabs)
  const applicationRef = React.useRef(application)

  useEffect(() => {
    tabsRef.current = tabs
    applicationRef.current = application
  })

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer

    const handleCloseTab = () => {
      const currentTabs = tabsRef.current
      if (!currentTabs) return

      const tab = currentTabs.tabs[currentTabs.getSelectedTabIndex()]
      if (tab) {
        applicationRef.current?.tabActions.closeTab(tab)
      }
    }

    const handleNextTab = () => {
      const currentTabs = tabsRef.current
      if (!currentTabs) return
      const nextTabIndex = (currentTabs.getSelectedTabIndex() + 1) % currentTabs.tabs.length
      currentTabs.setActiveTab(nextTabIndex)
    }

    const handlePrevTab = () => {
      const currentTabs = tabsRef.current
      if (!currentTabs) return
      const prevTabIndex =
        (currentTabs.getSelectedTabIndex() - 1 + currentTabs.tabs.length) % currentTabs.tabs.length
      currentTabs.setActiveTab(prevTabIndex)
    }

    const handleRestoreTab = () => {
      tabsRef.current?.restoreTab()
    }

    ipcRenderer?.on(ACTIONS.closeTab, handleCloseTab)
    ipcRenderer?.on(ACTIONS.nextTab, handleNextTab)
    ipcRenderer?.on(ACTIONS.prevTab, handlePrevTab)
    ipcRenderer?.on(ACTIONS.restoreTab, handleRestoreTab)

    return () => {
      ipcRenderer?.removeListener(ACTIONS.closeTab, handleCloseTab)
      ipcRenderer?.removeListener(ACTIONS.nextTab, handleNextTab)
      ipcRenderer?.removeListener(ACTIONS.prevTab, handlePrevTab)
      ipcRenderer?.removeListener(ACTIONS.restoreTab, handleRestoreTab)
    }
  }, [])

  const onSelect = (index: number, _: number, __: Event) => {
    tabs?.setActiveTab(index)
  }

  const handleMouseDown = (index: number) => {
    tabs?.setActiveTab(index)
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
              {tabList.map((tab, index) => (
                // Force render tab panel (fix editor not saving view state)
                <TabPanel key={`${tab.id}-${index}`}>
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
            <div className="panel-empty-tabs-text">
              <div>Create a new tab to start a request:</div>
            </div>
            <NewTab showLabel={true} />
          </div>
        </>
      )}
    </>
  )
}
