import React, { useContext, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import RequestTab from './RequestTab'
import styles from './Request.module.css'
import RequestAuth from './RequestAuth'
import Params from '../base/Params/Params'
import HorizontalScroll from '../base/HorizontalScroll/HorizontalScroll'
import { defaultHttpHeaders } from '../../lib/factory'
import RequestBody from './RequestBody'

const getTabIndexes = (showPathParams: boolean, showBody: boolean) => {
  let [pathParams, queryParams, headers, auth, body] = [0, 1, 2, 3, 4]
  if (!showPathParams) {
    pathParams = -1
    queryParams--
    headers--
    auth--
    body--
  }
  if (!showBody) {
    body = -1
  }
  return { pathParams, queryParams, headers, auth, body }
}

export default function RequestTabs() {
  const { request } = useContext(RequestContext)
  const [tabIndex, setTabIndex] = useState(0)

  if (!request) return null

  const showBody = request.method.body
  const activeQueryParams = request.queryParams.getActiveLength()
  const activeHeaders = request.headers.getActiveLength()

  const tabIndexes = getTabIndexes(request.pathParams.items.length > 0, showBody)

  const handleTabSelect = (index: number) => {
    setTabIndex(index)
  }

  return (
    <div className={styles.tabs}>
      <Tabs className="tabs" onSelect={handleTabSelect} selectedIndex={tabIndex}>
        <HorizontalScroll className={`${styles.requestTabs} panel-tabs-header-list`}>
          <TabList>
            {request.pathParams.items.length > 0 && (
              <Tab onMouseDown={() => handleTabSelect(tabIndexes.pathParams)}>
                <RequestTab name="Path params" />
              </Tab>
            )}
            <Tab onMouseDown={() => handleTabSelect(tabIndexes.queryParams)}>
              <RequestTab name="Query params" count={activeQueryParams} />
            </Tab>
            <Tab onMouseDown={() => handleTabSelect(tabIndexes.headers)}>
              <RequestTab name="Headers" count={activeHeaders} />
            </Tab>
            <Tab onMouseDown={() => handleTabSelect(tabIndexes.auth)}>Authorization</Tab>
            {showBody && <Tab onMouseDown={() => handleTabSelect(tabIndexes.body)}>Body</Tab>}
          </TabList>
        </HorizontalScroll>
        <div className="tab-panel-wrapper">
          {request.pathParams.items.length > 0 && (
            <TabPanel forceRender={true}>
              <Params
                items={request.pathParams.items}
                onSave={request.pathParams.set}
                editableName={false}
                showDelete={false}
              />
            </TabPanel>
          )}
          <TabPanel forceRender={true}>
            <Params
              items={request.queryParams.items}
              onSave={request.queryParams.set}
              onAdd={request.queryParams.add}
              draggable={true}
            />
          </TabPanel>
          <TabPanel forceRender={true}>
            <Params
              items={request.headers.items}
              onSave={request.headers.set}
              onAdd={request.headers.add}
              helperValues={defaultHttpHeaders}
              bulkMode={true}
              draggable={true}
              addCaption="Add header"
              removeCaption="Remove header"
            />
          </TabPanel>
          <TabPanel forceRender={true}>
            <RequestAuth />
          </TabPanel>
          {showBody && (
            <TabPanel>
              <RequestBody />
            </TabPanel>
          )}
        </div>
      </Tabs>
    </div>
  )
}
