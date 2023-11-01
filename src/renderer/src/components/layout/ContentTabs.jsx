import React, { useContext } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { AppContext } from '../../context/AppContext'
import TabTitle from '../tabs/tabTitle/TabTitle'
import NewTab from '../tabs/newTab/NewTab'
import RequestPanel from './RequestPanel'

export default function ContentTabs() {

  const { tabs } = useContext(AppContext)
  const onSelect = index => tabs.setActiveTab(index)
  const onWheel = e => {
    const el = e.currentTarget
    const scrollLeft = el.scrollLeft
    el.scrollTo({
      left: scrollLeft + e.deltaY * 0.4,
      behavior: 'instant'
    })
  }

  return (
    <div className='panel-tabs'>
      <Tabs onSelect={onSelect} selectedIndex={tabs.getSelectedTabIndex()}>
        <div className='panel-tabs-header'>
          <div className='panel-tabs-header-list' onWheel={onWheel}>
            <TabList>
              {tabs.getTabs().map(tab => (
                <Tab key={tab.id} className='request-tab'>
                  <TabTitle tab={tab} /> 
                </Tab>
              ))}
            </TabList>
          </div>
          <NewTab />
        </div>
        <div className='panel-tabs-content'>
          {tabs.getTabs().map(tab => (
            <TabPanel key={tab.id} forceRender={true}>
              <RequestPanel tab={tab} definedRequest={tab.request} />
            </TabPanel>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
