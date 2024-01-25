import React, { useContext } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { AppContext } from '../../context/AppContext'
import TabTitle from '../tabs/tabTitle/TabTitle'
import NewTab from '../tabs/newTab/NewTab'
import RequestPanel from '../request/RequestPanel'
import Icon from '../base/Icon/Icon'

export default function ContentTabs() {
  const { tabs } = useContext(AppContext)
  const onSelect = (index: number, _: number, __: Event) => {
    if (!tabs) return false
    tabs.setActiveTab(index)
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

  if (!tabs) return null

  return (
    <>
      { tabs.hasTabs() && (
        <div className="panel-tabs">
          <Tabs onSelect={onSelect} selectedIndex={tabs.getSelectedTabIndex()}>
            <div className="panel-tabs-header">
              <div className="panel-tabs-header-list" onWheel={onWheel}>
                <TabList>
                  {tabs.getTabs().map((tab) => (
                    <Tab key={tab.id} className="request-tab">
                      <TabTitle tab={tab} />
                    </Tab>
                  ))}
                </TabList>
              </div>
              <NewTab />
            </div>
            <div className="panel-tabs-content">
              {tabs.getTabs().map((tab) => (
                <TabPanel key={tab.id} forceRender={true}>
                  <RequestPanel tab={tab} />
                </TabPanel>
              ))}
            </div>
          </Tabs>
        </div>
      )}
      { !tabs.hasTabs() && (
        <div className="panel-empty-tabs">
          <div className="new-tab" onClick={() => tabs.newTab()}>
            <Icon icon="more" /> 
            <div className="new-tab-label">New Tab</div>
          </div>
        </div>
      )}
    </>
  )
}
