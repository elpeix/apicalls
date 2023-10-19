import React, { useContext } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { AppContext } from '../../context/AppContext'
import TabTitle from '../tabs/tabTitle/TabTitle'
import NewTab from '../tabs/newTab/NewTab'
import RequestPanel from './RequestPanel'

export default function ContentTabs() {

  const { tabs } = useContext(AppContext)

  const onSelect = (index) => tabs.setActiveTab(index)

  return (
    <div className='panel-tabs'>
      <Tabs onSelect={onSelect} selectedIndex={tabs.getSelectedTabIndex()}>
        <TabList>
          {tabs.getTabs().map((tab, index) => (
            <Tab key={index} className='request-tab'>
              <TabTitle tab={tab} /> 
            </Tab>
          ))}
          <NewTab />
        </TabList>
        <div className='panel-tabs-content'>
          {tabs.getTabs().map((tab, index) => (
            <TabPanel key={index} forceRender={true}>
              <RequestPanel definedRequest={tab.request} />
            </TabPanel>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
